import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FreightChannel,
  FreightWarehouseStatus,
  OrderServiceType,
  OrderStatus,
  PaymentStatus,
  PrincipalType,
  ShipmentStatus,
} from '@prisma/client';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { billedWeightKg, freightChannelFromCode, quoteFreight } from './pricing.js';
import type { FreightChannelCode } from './pricing.js';

@Injectable()
export class FreightService {
  constructor(private readonly prisma: PrismaService) {}

  async forecast(principal: AuthPrincipal, dto: {
    channel: FreightChannelCode;
    domesticTrackingNo: string;
    remark?: string;
  }) {
    this.ensureUser(principal);
    const trackingNo = dto.domesticTrackingNo.trim();
    if (!trackingNo) throw new BadRequestException('请填写国内快递单号');
    const existing = await this.prisma.orderFreightDetail.findFirst({
      where: { domesticTrackingNo: trackingNo, isUnclaimed: false },
    });
    if (existing) throw new ConflictException('该国内单号已预报，请勿重复提交');

    const channel = freightChannelFromCode(dto.channel);
    const order = await this.prisma.expressOrder.create({
      data: {
        orderNo: this.orderNo('KF'),
        userId: principal.id,
        serviceType: OrderServiceType.EXPRESS,
        status: OrderStatus.PENDING_CONFIRMATION,
        paymentStatus: PaymentStatus.UNPAID,
        estimatedFee: 0,
        currency: 'CNY',
        remark: dto.remark,
        isMock: true,
        statusLogs: {
          create: {
            toStatus: OrderStatus.PENDING_CONFIRMATION,
            operatorType: principal.type,
            operatorId: principal.id,
            reason: '用户提交跨境集运预报',
          },
        },
        freightDetail: {
          create: {
            channel,
            domesticTrackingNo: trackingNo,
            warehouseStatus: FreightWarehouseStatus.AWAITING_INBOUND,
          },
        },
      },
      include: { freightDetail: true, statusLogs: true },
    });
    await this.ensureShipment(order.id, order.orderNo, '用户已预报，待西双版纳仓签收');
    return order;
  }

  async claim(principal: AuthPrincipal, domesticTrackingNo: string) {
    this.ensureUser(principal);
    const detail = await this.prisma.orderFreightDetail.findFirst({
      where: { domesticTrackingNo: domesticTrackingNo.trim(), isUnclaimed: true },
      include: { order: true },
    });
    if (!detail) throw new NotFoundException('未找到可认领的无主包裹');
    const updated = await this.prisma.expressOrder.update({
      where: { id: detail.orderId },
      data: {
        userId: principal.id,
        freightDetail: {
          update: { isUnclaimed: false, claimedByUserId: principal.id },
        },
        statusLogs: {
          create: {
            fromStatus: detail.order.status,
            toStatus: detail.order.status,
            operatorType: principal.type,
            operatorId: principal.id,
            reason: '用户认领无主包裹',
          },
        },
      },
      include: { freightDetail: true },
    });
    return updated;
  }

  async receive(principal: AuthPrincipal, dto: {
    domesticTrackingNo: string;
    actualWeight: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    unclaimed?: boolean;
  }) {
    this.ensureStaff(principal);
    const trackingNo = dto.domesticTrackingNo.trim();
    let detail = await this.prisma.orderFreightDetail.findFirst({
      where: { domesticTrackingNo: trackingNo },
      include: { order: true },
    });
    if (!detail && dto.unclaimed) {
      const order = await this.prisma.expressOrder.create({
        data: {
          orderNo: this.orderNo('KF'),
          userId: await this.systemUserId(),
          serviceType: OrderServiceType.EXPRESS,
          status: OrderStatus.PENDING_CONFIRMATION,
          paymentStatus: PaymentStatus.UNPAID,
          estimatedFee: 0,
          currency: 'CNY',
          remark: '无主件入库',
          isMock: true,
          freightDetail: {
            create: {
              channel: FreightChannel.ECONOMY,
              domesticTrackingNo: trackingNo,
              isUnclaimed: true,
              warehouseStatus: FreightWarehouseStatus.AWAITING_INBOUND,
            },
          },
        },
        include: { freightDetail: true },
      });
      detail = { ...order.freightDetail!, order };
    }
    if (!detail) throw new NotFoundException('未匹配到预报订单，可勾选无主件入库');

    const volume = dto.lengthCm && dto.widthCm && dto.heightCm
      ? { lengthCm: dto.lengthCm, widthCm: dto.widthCm, heightCm: dto.heightCm }
      : undefined;
    const billed = billedWeightKg(dto.actualWeight, volume);
    const channelCode = detail.channel === FreightChannel.NEXT_DAY ? 1 : 2;
    const rule = await this.prisma.freightRule.findUnique({ where: { channel: detail.channel } });
    const amount = quoteFreight(channelCode, billed, rule
      ? {
          baseWeight: Number(rule.baseWeight),
          basePrice: Number(rule.basePrice),
          stepWeight: Number(rule.stepWeight),
          stepPrice: Number(rule.stepPrice),
        }
      : undefined);

    const order = await this.prisma.$transaction(async (tx) => {
      await tx.orderFreightDetail.update({
        where: { id: detail!.id },
        data: {
          actualWeight: dto.actualWeight,
          volumeWeight: volume ? (volume.lengthCm * volume.widthCm * volume.heightCm) / 6000 : null,
          billedWeight: billed,
          lengthCm: dto.lengthCm,
          widthCm: dto.widthCm,
          heightCm: dto.heightCm,
          warehouseStatus: FreightWarehouseStatus.RECEIVED,
        },
      });
      await tx.expressOrder.update({
        where: { id: detail!.orderId },
        data: {
          status: OrderStatus.PENDING_DISPATCH,
          paymentStatus: PaymentStatus.UNPAID,
          estimatedFee: amount,
          actualFee: amount,
          statusLogs: {
            create: {
              fromStatus: detail!.order.status,
              toStatus: OrderStatus.PENDING_DISPATCH,
              operatorType: principal.type,
              operatorId: principal.id,
              reason: `版纳仓签收，计费重量 ${billed.toFixed(2)}KG，运费 ${amount} 元`,
            },
          },
        },
      });
      return tx.expressOrder.findUniqueOrThrow({
        where: { id: detail!.orderId },
        include: { freightDetail: true },
      });
    });
    await this.appendTrace(order.id, '西双版纳仓已签收并完成计费，请用户支付运费', true);
    return order;
  }

  async confirmPay(principal: AuthPrincipal, orderId: string) {
    const order = await this.prisma.expressOrder.findUnique({
      where: { id: orderId },
      include: { freightDetail: true },
    });
    if (!order?.freightDetail) throw new NotFoundException('集运订单不存在');
    if (principal.type === PrincipalType.USER && principal.id !== order.userId) {
      throw new ForbiddenException('无权支付该订单');
    }
    if (order.status !== OrderStatus.PENDING_DISPATCH) {
      throw new ConflictException('当前状态不可确认支付');
    }
    const updated = await this.prisma.expressOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.IN_TRANSIT,
        statusLogs: {
          create: {
            fromStatus: order.status,
            toStatus: OrderStatus.IN_TRANSIT,
            operatorType: principal.type,
            operatorId: principal.id,
            reason: '用户确认支付运费',
          },
        },
      },
      include: { freightDetail: true },
    });
    await this.appendTrace(orderId, '运费已支付，准备中转出境', true);
    return updated;
  }

  async depart(principal: AuthPrincipal, orderId: string, thirdPartyCode?: string) {
    this.ensureStaff(principal);
    const order = await this.prisma.expressOrder.findUnique({
      where: { id: orderId },
      include: { freightDetail: true },
    });
    if (!order?.freightDetail) throw new NotFoundException('集运订单不存在');
    if (order.paymentStatus !== PaymentStatus.PAID) throw new ConflictException('未支付订单不可发车');
    await this.prisma.orderFreightDetail.update({
      where: { orderId },
      data: {
        warehouseStatus: FreightWarehouseStatus.DEPARTED,
        thirdPartyCode: thirdPartyCode ?? order.freightDetail.thirdPartyCode,
      },
    });
    await this.appendTrace(orderId, '包裹已中转出境运输', true);
    return this.prisma.expressOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { freightDetail: true },
    });
  }

  async markException(principal: AuthPrincipal, orderId: string, reason: string) {
    this.ensureStaff(principal);
    await this.prisma.$transaction([
      this.prisma.expressOrder.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.EXCEPTION,
          statusLogs: {
            create: {
              toStatus: OrderStatus.EXCEPTION,
              operatorType: principal.type,
              operatorId: principal.id,
              reason,
            },
          },
        },
      }),
      this.prisma.orderFreightDetail.update({
        where: { orderId },
        data: { warehouseStatus: FreightWarehouseStatus.EXCEPTION },
      }),
    ]);
    await this.appendTrace(orderId, `异常：${reason}`, true);
    return this.prisma.expressOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { freightDetail: true },
    });
  }

  async unclaimed() {
    return this.prisma.orderFreightDetail.findMany({
      where: { isUnclaimed: true },
      include: { order: { select: { id: true, orderNo: true, status: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  private async ensureShipment(orderId: string, orderNo: string, description: string) {
    const existing = await this.prisma.shipment.findUnique({ where: { orderId } });
    if (existing) {
      await this.prisma.trackingEvent.create({
        data: {
          shipmentId: existing.id,
          status: 'PENDING_CONFIRMATION',
          description,
          occurredAt: new Date(),
          isManual: true,
        },
      });
      return;
    }
    await this.prisma.shipment.create({
      data: {
        orderId,
        shipmentNo: `MOCK-${orderNo}`,
        providerCode: 'KAPOK_WAREHOUSE',
        status: ShipmentStatus.CREATED,
        isMock: true,
        trackingEvents: {
          create: { status: 'PENDING_CONFIRMATION', description, occurredAt: new Date(), isManual: true },
        },
      },
    });
  }

  private async appendTrace(orderId: string, description: string, isManual: boolean) {
    const shipment = await this.prisma.shipment.findUnique({ where: { orderId } });
    if (!shipment) {
      const order = await this.prisma.expressOrder.findUnique({ where: { id: orderId } });
      if (!order) return;
      await this.ensureShipment(orderId, order.orderNo, description);
      return;
    }
    await this.prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: 'UPDATE',
        description,
        occurredAt: new Date(),
        isManual,
      },
    });
  }

  private async systemUserId(): Promise<string> {
    const user = await this.prisma.user.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' } });
    if (!user) throw new ConflictException('系统尚未初始化用户，无法登记无主件');
    return user.id;
  }

  private orderNo(prefix: string): string {
    return `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomInt(100000, 999999)}`;
  }

  private ensureUser(principal: AuthPrincipal): void {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅用户可预报集运');
  }

  private ensureStaff(principal: AuthPrincipal): void {
    if (principal.type !== PrincipalType.ADMINISTRATOR) throw new ForbiddenException('仅库管/管理员可操作入库');
  }
}
