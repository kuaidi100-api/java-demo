import { randomInt } from 'node:crypto';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderServiceType, OrderStatus, PaymentStatus, PrincipalType, Prisma, DeliveryTaskStatus } from '@prisma/client';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PURCHASE_SERVICE_FEE_RATE } from './pricing.js';

const LIFESTYLE = new Set<OrderServiceType>([
  OrderServiceType.HOTEL,
  OrderServiceType.TICKET,
  OrderServiceType.MOVING,
  OrderServiceType.PHOTO,
  OrderServiceType.RIDE,
]);

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(principal: AuthPrincipal, dto: { productUrl: string; remark?: string }) {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅用户可提交代买');
    const url = dto.productUrl.trim();
    if (!/^https?:\/\//i.test(url)) throw new BadRequestException('请填写有效的商品链接');
    return this.prisma.expressOrder.create({
      data: {
        orderNo: `BY-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomInt(100000, 999999)}`,
        userId: principal.id,
        serviceType: OrderServiceType.PURCHASE,
        status: OrderStatus.PENDING_CONFIRMATION,
        paymentStatus: PaymentStatus.UNPAID,
        estimatedFee: 0,
        currency: 'CNY',
        remark: dto.remark,
        isMock: true,
        purchaseDetail: { create: { productUrl: url } },
        statusLogs: {
          create: {
            toStatus: OrderStatus.PENDING_CONFIRMATION,
            operatorType: principal.type,
            operatorId: principal.id,
            reason: '用户提交代买链接，等待客服报价',
          },
        },
      },
      include: { purchaseDetail: true },
    });
  }

  async quote(principal: AuthPrincipal, orderId: string, quoteAmount: number, adminNote?: string) {
    if (principal.type !== PrincipalType.ADMINISTRATOR) throw new ForbiddenException('仅后台可报价');
    const order = await this.prisma.expressOrder.findUnique({
      where: { id: orderId },
      include: { purchaseDetail: true },
    });
    if (!order?.purchaseDetail) throw new NotFoundException('代买订单不存在');
    const serviceFee = Math.round(quoteAmount * PURCHASE_SERVICE_FEE_RATE * 100) / 100;
    const total = Math.round((quoteAmount + serviceFee) * 100) / 100;
    await this.prisma.$transaction([
      this.prisma.orderPurchaseDetail.update({
        where: { orderId },
        data: { quoteAmount, serviceFee, adminNote, quotedAt: new Date() },
      }),
      this.prisma.expressOrder.update({
        where: { id: orderId },
        data: {
          estimatedFee: total,
          actualFee: total,
          status: OrderStatus.PENDING_DISPATCH,
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.PENDING_DISPATCH,
              operatorType: principal.type,
              operatorId: principal.id,
              reason: `客服报价商品 ${quoteAmount} 元，服务费 ${serviceFee} 元`,
            },
          },
        },
      }),
    ]);
    return this.prisma.expressOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { purchaseDetail: true },
    });
  }

  async confirmQuote(principal: AuthPrincipal, orderId: string, accept: boolean) {
    const order = await this.prisma.expressOrder.findUnique({
      where: { id: orderId },
      include: { purchaseDetail: true },
    });
    if (!order?.purchaseDetail) throw new NotFoundException('代买订单不存在');
    if (principal.type !== PrincipalType.USER || principal.id !== order.userId) {
      throw new ForbiddenException('无权确认该报价');
    }
    if (accept) {
      await this.prisma.expressOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.ACCEPTED,
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.ACCEPTED,
              operatorType: principal.type,
              operatorId: principal.id,
              reason: '用户确认代买报价并记账支付',
            },
          },
        },
      });
      await this.prisma.orderPurchaseDetail.update({
        where: { orderId },
        data: { confirmedAt: new Date() },
      });
    } else {
      await this.prisma.expressOrder.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          statusLogs: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.CANCELLED,
              operatorType: principal.type,
              operatorId: principal.id,
              reason: '用户拒绝代买报价',
            },
          },
        },
      });
    }
    return this.prisma.expressOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: { purchaseDetail: true },
    });
  }
}

@Injectable()
export class LifestyleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(principal: AuthPrincipal, dto: {
    serviceType: OrderServiceType;
    contactName: string;
    phone: string;
    detail: string;
    payload?: Record<string, unknown>;
  }) {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅用户可提交预约');
    if (!LIFESTYLE.has(dto.serviceType)) throw new BadRequestException('不支持的预约类型');
    const digits = dto.phone.replace(/\D/g, '');
    const mapPayload = this.normalizeMapPayload(dto.payload);
    const needsDispatch =
      dto.serviceType === OrderServiceType.RIDE || dto.serviceType === OrderServiceType.MOVING;
    const status = needsDispatch ? OrderStatus.PENDING_DISPATCH : OrderStatus.PENDING_CONFIRMATION;
    const addresses = this.mapAddresses(dto.contactName, dto.phone, digits, mapPayload);

    return this.prisma.expressOrder.create({
      data: {
        orderNo: `LF-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomInt(100000, 999999)}`,
        userId: principal.id,
        serviceType: dto.serviceType,
        status,
        paymentStatus: PaymentStatus.UNPAID,
        estimatedFee: dto.serviceType === OrderServiceType.RIDE ? 35 : 0,
        currency: 'CNY',
        remark: dto.detail,
        extra: {
          ...(mapPayload ?? {}),
          map: {
            provider: 'LOCAL_SEZ',
            from: mapPayload?.from ?? null,
            to: mapPayload?.to ?? null,
          },
        } as Prisma.InputJsonValue,
        isMock: true,
        ...(addresses.length
          ? { addresses: { create: addresses } }
          : {}),
        ...(needsDispatch ? { task: { create: { status: DeliveryTaskStatus.PENDING } } } : {}),
        serviceRequest: {
          create: {
            contactName: dto.contactName,
            phoneLast4: digits.slice(-4).padStart(4, '0'),
            phoneHash: digits.padEnd(64, '0').slice(0, 64),
            phoneEncrypted: dto.phone,
            detail: dto.detail,
            payload: {
              ...(mapPayload ?? {}),
              map: {
                provider: 'LOCAL_SEZ',
                from: mapPayload?.from ?? null,
                to: mapPayload?.to ?? null,
              },
            } as Prisma.InputJsonValue,
          },
        },
        statusLogs: {
          create: {
            toStatus: status,
            operatorType: principal.type,
            operatorId: principal.id,
            reason: needsDispatch
              ? '用户地图下单，已带坐标，等待后台指派司机/骑手'
              : '用户提交预约需求，等待后台确认',
          },
        },
      },
      include: { serviceRequest: true, addresses: true, task: true },
    });
  }

  private normalizeMapPayload(payload?: Record<string, unknown>) {
    if (!payload || typeof payload !== 'object') return payload;
    const from = this.asMapPoint(payload.from);
    const to = this.asMapPoint(payload.to);
    return {
      ...payload,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
  }

  private asMapPoint(value: unknown): { label: string; lat: number; lng: number } | null {
    if (!value || typeof value !== 'object') return null;
    const point = value as Record<string, unknown>;
    const lat = Number(point.lat ?? point.latitude);
    const lng = Number(point.lng ?? point.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      label: String(point.label || point.name || '地图选点'),
      lat,
      lng,
    };
  }

  private mapAddresses(
    contactName: string,
    phone: string,
    digits: string,
    payload?: Record<string, unknown>,
  ) {
    const from = this.asMapPoint(payload?.from);
    const to = this.asMapPoint(payload?.to);
    const phoneHash = digits.padEnd(64, '0').slice(0, 64);
    const phoneLast4 = digits.slice(-4).padStart(4, '0');
    const rows = [];
    if (from) {
      rows.push({
        type: 'SENDER' as const,
        contactName,
        phoneHash,
        phoneEncrypted: phone,
        phoneLast4,
        countryCode: 'LA',
        country: '老挝',
        province: '博胶省',
        city: '金三角经济特区',
        district: '',
        detail: from.label,
        formattedAddress: from.label,
        mapProvider: 'LOCAL_SEZ',
        latitude: from.lat,
        longitude: from.lng,
        placeId: `sez:${from.lng.toFixed(5)},${from.lat.toFixed(5)}`,
      });
    }
    if (to) {
      rows.push({
        type: 'RECIPIENT' as const,
        contactName,
        phoneHash,
        phoneEncrypted: phone,
        phoneLast4,
        countryCode: 'LA',
        country: '老挝',
        province: '博胶省',
        city: '金三角经济特区',
        district: '',
        detail: to.label,
        formattedAddress: to.label,
        mapProvider: 'LOCAL_SEZ',
        latitude: to.lat,
        longitude: to.lng,
        placeId: `sez:${to.lng.toFixed(5)},${to.lat.toFixed(5)}`,
      });
    }
    return rows;
  }
}
