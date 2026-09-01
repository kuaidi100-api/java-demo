import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryTaskStatus,
  LedgerType,
  OfflinePaymentMethod,
  OrderServiceType,
  OrderStatus,
  PaymentStatus,
  PrincipalType,
  SettlementLocation,
} from '@prisma/client';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { errandOverweight, quoteErrand } from './pricing.js';

@Injectable()
export class ErrandService {
  constructor(private readonly prisma: PrismaService) {}

  estimate(areaType: number, weightTier: number, weightKg?: number) {
    if (weightKg !== undefined && errandOverweight(weightKg)) {
      throw new BadRequestException('超重请联系人工客服或使用货运服务');
    }
    const amount = quoteErrand(areaType, weightTier);
    return { amount, currency: 'CNY', locked: true, notice: '一口价已锁定，骑手不可改价' };
  }

  async create(principal: AuthPrincipal, dto: {
    senderAddressId: string;
    recipientAddressId: string;
    deliveryAreaType: number;
    weightTier: number;
    itemDescription: string;
    paymentMethod: OfflinePaymentMethod;
    settlementLoc: SettlementLocation;
    remark?: string;
  }) {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅用户可下闪送单');
    const amount = quoteErrand(dto.deliveryAreaType, dto.weightTier);
    const [sender, recipient] = await Promise.all([
      this.prisma.userAddress.findFirst({ where: { id: dto.senderAddressId, userId: principal.id, deletedAt: null } }),
      this.prisma.userAddress.findFirst({ where: { id: dto.recipientAddressId, userId: principal.id, deletedAt: null } }),
    ]);
    if (!sender || !recipient) throw new NotFoundException('请从地址簿选择取件和收件地址');

    const timeoutAt = new Date(Date.now() + 60 * 60 * 1000);
    return this.prisma.expressOrder.create({
      data: {
        orderNo: `ER-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomInt(100000, 999999)}`,
        userId: principal.id,
        serviceType: OrderServiceType.SAME_CITY,
        status: OrderStatus.PENDING_ACCEPTANCE,
        paymentStatus: PaymentStatus.UNPAID,
        estimatedFee: amount,
        actualFee: amount,
        currency: 'CNY',
        remark: dto.remark,
        isMock: true,
        addresses: {
          create: [
            this.snapshot('SENDER', sender),
            this.snapshot('RECIPIENT', recipient),
          ],
        },
        items: {
          create: {
            type: 'OTHER',
            name: dto.itemDescription,
            quantity: 1,
            weightKg: dto.weightTier === 1 ? 10 : 20,
          },
        },
        errandDetail: {
          create: {
            deliveryAreaType: dto.deliveryAreaType,
            weightTier: dto.weightTier,
            itemDescription: dto.itemDescription,
            paymentMethod: dto.paymentMethod,
            settlementLoc: dto.settlementLoc,
            timeoutAt,
          },
        },
        task: { create: { status: DeliveryTaskStatus.PENDING } },
        statusLogs: {
          create: {
            toStatus: OrderStatus.PENDING_ACCEPTANCE,
            operatorType: principal.type,
            operatorId: principal.id,
            reason: '闪送一口价下单，等待骑手接单',
          },
        },
      },
      include: { errandDetail: true, addresses: true, task: true },
    });
  }

  async rejectAtPickup(principal: AuthPrincipal, orderId: string, reason: string, photoKey?: string) {
    if (principal.type !== PrincipalType.COURIER) throw new ForbiddenException('仅骑手可现场退单');
    const order = await this.prisma.expressOrder.findUnique({
      where: { id: orderId },
      include: { errandDetail: true },
    });
    if (!order?.errandDetail) throw new NotFoundException('闪送订单不存在');
    if (order.courierId !== principal.id) throw new ForbiddenException('只能退自己的订单');
    if (order.status !== OrderStatus.ACCEPTED && order.status !== OrderStatus.PICKING_UP) {
      throw new ConflictException('当前状态不可异常退单');
    }
    await this.prisma.$transaction([
      this.prisma.expressOrder.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.REFUNDED,
          cancelledAt: new Date(),
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.CANCELLED,
              operatorType: principal.type,
              operatorId: principal.id,
              reason: `骑手异常退单：${reason}`,
            },
          },
        },
      }),
      this.prisma.orderErrandDetail.update({
        where: { orderId },
        data: { cancelReason: reason, pickupImgKey: photoKey ?? order.errandDetail.pickupImgKey },
      }),
      this.prisma.deliveryTask.updateMany({
        where: { orderId },
        data: { status: DeliveryTaskStatus.CANCELLED },
      }),
    ]);
    return this.prisma.expressOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { errandDetail: true },
    });
  }

  async confirmCollected(principal: AuthPrincipal, orderId: string, paymentImgKey?: string) {
    if (principal.type !== PrincipalType.COURIER) throw new ForbiddenException('仅骑手可确认收款');
    const order = await this.prisma.expressOrder.findUnique({
      where: { id: orderId },
      include: { errandDetail: true },
    });
    if (!order?.errandDetail) throw new NotFoundException('闪送订单不存在');
    if (order.courierId !== principal.id) throw new ForbiddenException('只能确认自己的订单');
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.IN_TRANSIT) {
      throw new ConflictException('请先完成送达再确认收款');
    }
    const method = order.errandDetail.paymentMethod;
    if (method !== OfflinePaymentMethod.CASH && !paymentImgKey && !order.errandDetail.paymentImgKey) {
      throw new BadRequestException('微信/支付宝须上传支付截图');
    }
    await this.prisma.$transaction([
      this.prisma.expressOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.COMPLETED,
              operatorType: principal.type,
              operatorId: principal.id,
              reason: method === OfflinePaymentMethod.CASH ? '现金已收款' : '线上截图已确认收款',
            },
          },
        },
      }),
      this.prisma.orderErrandDetail.update({
        where: { orderId },
        data: { paymentImgKey: paymentImgKey ?? order.errandDetail.paymentImgKey },
      }),
    ]);
    return this.prisma.expressOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { errandDetail: true },
    });
  }

  async saveProof(principal: AuthPrincipal, orderId: string, kind: 'pickup' | 'payment', storageKey: string) {
    if (principal.type !== PrincipalType.COURIER) throw new ForbiddenException('仅骑手可上传凭证');
    const order = await this.prisma.expressOrder.findUnique({ where: { id: orderId } });
    if (!order || order.courierId !== principal.id) throw new ForbiddenException('无权上传该订单凭证');
    await this.prisma.orderErrandDetail.update({
      where: { orderId },
      data: kind === 'pickup' ? { pickupImgKey: storageKey } : { paymentImgKey: storageKey },
    });
    return { saved: true, storageKey };
  }

  async timeoutCancel(): Promise<number> {
    const expired = await this.prisma.expressOrder.findMany({
      where: {
        serviceType: OrderServiceType.SAME_CITY,
        status: OrderStatus.PENDING_ACCEPTANCE,
        errandDetail: { timeoutAt: { lte: new Date() } },
      },
      select: { id: true, status: true },
    });
    for (const order of expired) {
      await this.prisma.$transaction([
        this.prisma.expressOrder.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            paymentStatus: PaymentStatus.REFUNDED,
            cancelledAt: new Date(),
            statusLogs: {
              create: {
                fromStatus: order.status,
                toStatus: OrderStatus.CANCELLED,
                operatorType: PrincipalType.SYSTEM,
                reason: '超时 60 分钟无人接单，系统自动取消并原路记账退款',
              },
            },
          },
        }),
        this.prisma.orderErrandDetail.update({
          where: { orderId: order.id },
          data: { cancelReason: '超时未接单自动取消' },
        }),
      ]);
    }
    return expired.length;
  }

  async generateFinanceBatch(slot: 'Morning' | 'Evening') {
    const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const batchDate = `${day}-${slot}`;
    const paid = await this.prisma.expressOrder.findMany({
      where: {
        serviceType: OrderServiceType.SAME_CITY,
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.COMPLETED,
        ledgers: { none: { batchDate } },
      },
      include: { errandDetail: true },
    });
    const created = [];
    for (const order of paid) {
      const amount = Number(order.actualFee ?? order.estimatedFee);
      const half = Math.round(amount * 50) / 100;
      const online = order.errandDetail?.paymentMethod !== OfflinePaymentMethod.CASH;
      const ledger = await this.prisma.financeLedger.create({
        data: {
          orderId: order.id,
          courierId: order.courierId,
          amount,
          type: online ? LedgerType.ONLINE_REVENUE : LedgerType.CASH_REVENUE,
          batchDate,
          platformCut: half,
          riderCut: half,
          note: online ? '线上收款 5:5 分账' : '现金收款 5:5 分账（骑手应交平台）',
        },
      });
      created.push(ledger);
    }
    return { batchDate, count: created.length, items: created };
  }

  private snapshot(type: 'SENDER' | 'RECIPIENT', address: {
    contactName: string;
    phoneHash: string;
    phoneEncrypted: string;
    phoneLast4: string;
    countryCode: string;
    country: string;
    province: string | null;
    city: string;
    district: string | null;
    detail: string;
    latitude: unknown;
    longitude: unknown;
  }) {
    return {
      type,
      contactName: address.contactName,
      phoneHash: address.phoneHash,
      phoneEncrypted: address.phoneEncrypted,
      phoneLast4: address.phoneLast4,
      countryCode: address.countryCode,
      country: address.country,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      latitude: address.latitude as never,
      longitude: address.longitude as never,
    };
  }
}
