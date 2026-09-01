import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryTaskStatus,
  OrderAddressType,
  OrderStatus,
  PrincipalType,
  ShipmentStatus,
} from '@prisma/client';
import { randomInt } from 'node:crypto';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SecurityService } from '../security/security.service.js';
import {
  LOGISTICS_PROVIDER,
  type LogisticsProvider,
} from '../providers/provider.interfaces.js';
import type { CreateOrderDto, OrderAddressInputDto } from './dto/create-order.dto.js';
import type { EstimateOrderDto } from './dto/estimate-order.dto.js';
import { OrderAction, type OrderActionDto } from './dto/order-action.dto.js';
import { targetStatus } from './order-state-machine.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
    @Inject(LOGISTICS_PROVIDER) private readonly logistics: LogisticsProvider,
  ) {}

  async estimate(dto: EstimateOrderDto) {
    const now = new Date();
    const rule = await this.prisma.pricingRule.findFirst({
      where: {
        serviceType: dto.serviceType,
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    const baseFee = Number(rule?.baseFee ?? 20_000);
    const perKgFee = Number(rule?.perKgFee ?? 1_000);
    const perKmFee = Number(rule?.perKmFee ?? 3_000);
    const minimumFee = Number(rule?.minimumFee ?? 20_000);
    const amount = Math.max(
      minimumFee,
      baseFee + dto.weightKg * perKgFee + (dto.distanceKm ?? 0) * perKmFee,
    );
    return {
      amount: Math.round(amount),
      currency: rule?.currency ?? 'LAK',
      ruleId: rule?.id ?? null,
      isMock: true,
      notice: '模拟估价，仅用于开发演示',
    };
  }

  async create(principal: AuthPrincipal, dto: CreateOrderDto) {
    this.ensureUser(principal);
    const sender = await this.resolveAddress(principal.id, dto.sender, dto.senderAddressId, '寄件');
    const recipient = await this.resolveAddress(principal.id, dto.recipient, dto.recipientAddressId, '收件');
    const estimate = await this.estimate({
      serviceType: dto.serviceType,
      weightKg: dto.item.weightKg,
    });
    const order = await this.prisma.expressOrder.create({
      data: {
        orderNo: this.orderNo(),
        userId: principal.id,
        serviceType: dto.serviceType,
        estimatedFee: estimate.amount,
        currency: estimate.currency,
        scheduledPickupAt: dto.scheduledPickupAt ? new Date(dto.scheduledPickupAt) : undefined,
        remark: dto.remark,
        isMock: true,
        addresses: {
          create: [
            this.addressData(OrderAddressType.SENDER, sender),
            this.addressData(OrderAddressType.RECIPIENT, recipient),
          ],
        },
        items: { create: dto.item },
        statusLogs: {
          create: {
            toStatus: OrderStatus.DRAFT,
            operatorType: principal.type,
            operatorId: principal.id,
            reason: '用户创建草稿订单',
          },
        },
      },
    });
    return { ...order, environment: { enabled: true, label: '模拟环境' } };
  }

  async list(principal: AuthPrincipal) {
    const where = principal.type === PrincipalType.USER
      ? { userId: principal.id }
      : principal.type === PrincipalType.COURIER
        ? {
          OR: [
            { courierId: principal.id },
            { status: OrderStatus.PENDING_ACCEPTANCE, courierId: null },
          ],
        }
        : {};
    return this.prisma.expressOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        orderNo: true,
        serviceType: true,
        status: true,
        estimatedFee: true,
        actualFee: true,
        paymentStatus: true,
        currency: true,
        isMock: true,
        scheduledPickupAt: true,
        createdAt: true,
        shipment: { select: { shipmentNo: true, providerCode: true, status: true, isMock: true } },
      },
    });
  }

  async detail(principal: AuthPrincipal, id: string) {
    const order = await this.prisma.expressOrder.findUnique({
      where: { id },
      include: {
        addresses: true,
        items: true,
        statusLogs: { orderBy: { createdAt: 'asc' } },
        shipment: { include: { trackingEvents: { orderBy: { occurredAt: 'asc' } } } },
        task: true,
        freightDetail: true,
        errandDetail: true,
        purchaseDetail: true,
        serviceRequest: true,
      },
    });
    if (!order) throw new NotFoundException('订单不存在');
    this.ensureOrderAccess(principal, order.userId, order.courierId);
    const addresses = order.addresses.map(({ phoneHash: _hash, phoneEncrypted: _encrypted, ...address }) => ({
      ...address,
      phone: this.security.maskPhone(address.phoneLast4),
      latitude: address.latitude === null || address.latitude === undefined
        ? undefined
        : Number(address.latitude),
      longitude: address.longitude === null || address.longitude === undefined
        ? undefined
        : Number(address.longitude),
    }));
    return { ...order, addresses, environment: { enabled: order.isMock, label: order.isMock ? '模拟环境' : '真实环境' } };
  }

  async act(principal: AuthPrincipal, id: string, dto: OrderActionDto) {
    const order = await this.prisma.expressOrder.findUnique({
      where: { id },
      include: { addresses: true, items: true, task: true, shipment: true },
    });
    if (!order) throw new NotFoundException('订单不存在');
    this.authorizeAction(principal, dto.action, order.userId, order.courierId);
    if (dto.courierId && dto.action !== OrderAction.DISPATCH) {
      throw new ConflictException('仅调度动作可以指定配送员');
    }
    if (dto.action === OrderAction.DISPATCH && dto.courierId) {
      const courier = await this.prisma.courier.findFirst({
        where: { id: dto.courierId, accountStatus: 'ACTIVE', deletedAt: null },
        select: { id: true },
      });
      if (!courier) throw new NotFoundException('指定配送员不存在或不可用');
    }
    const nextStatus = targetStatus(order.status, dto.action);

    let shipmentResult: Awaited<ReturnType<LogisticsProvider['createShipment']>> | undefined;
    if (dto.action === OrderAction.DISPATCH && !order.shipment) {
      const sender = order.addresses.find((address) => address.type === OrderAddressType.SENDER);
      const recipient = order.addresses.find((address) => address.type === OrderAddressType.RECIPIENT);
      shipmentResult = await this.logistics.createShipment({
        orderNo: order.orderNo,
        senderCity: sender?.city ?? '',
        recipientCity: recipient?.city ?? '',
        weightKg: order.items.reduce((sum, item) => sum + Number(item.weightKg), 0),
      });
    }

    await this.prisma.$transaction(async (transaction) => {
      const update = await transaction.expressOrder.updateMany({
        where: { id: order.id, status: order.status, version: order.version },
        data: {
          status: nextStatus,
          version: { increment: 1 },
          ...(dto.action === OrderAction.DISPATCH && dto.courierId
            ? { courierId: dto.courierId }
            : {}),
          ...(dto.action === OrderAction.ACCEPT ? { courierId: principal.id } : {}),
          ...(nextStatus === OrderStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
          ...(nextStatus === OrderStatus.COMPLETED ? { completedAt: new Date() } : {}),
        },
      });
      if (update.count !== 1) throw new ConflictException('订单已被其他请求更新，请刷新后重试');

      await transaction.orderStatusLog.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: nextStatus,
          operatorType: principal.type,
          operatorId: principal.id,
          reason: dto.reason ?? dto.action,
        },
      });

      if (dto.action === OrderAction.DISPATCH) {
        await transaction.deliveryTask.upsert({
          where: { orderId: order.id },
          update: {
            status: DeliveryTaskStatus.PENDING,
            ...(dto.courierId ? { courierId: dto.courierId } : {}),
          },
          create: {
            orderId: order.id,
            status: DeliveryTaskStatus.PENDING,
            ...(dto.courierId ? { courierId: dto.courierId } : {}),
          },
        });
        if (shipmentResult) {
          await transaction.shipment.create({
            data: {
              orderId: order.id,
              shipmentNo: shipmentResult.shipmentNo,
              providerCode: shipmentResult.providerCode,
              providerRef: shipmentResult.providerRef,
              status: ShipmentStatus.CREATED,
              isMock: shipmentResult.isMock,
              trackingEvents: {
                create: {
                  status: nextStatus,
                  description: shipmentResult.message,
                  occurredAt: new Date(),
                },
              },
            },
          });
        }
      }

      const taskStatus = this.taskStatus(dto.action);
      if (taskStatus && dto.action !== OrderAction.DISPATCH) {
        const taskUpdate = await transaction.deliveryTask.updateMany({
          where: { orderId: order.id },
          data: {
            status: taskStatus,
            ...(dto.action === OrderAction.ACCEPT
              ? { courierId: principal.id, acceptedAt: new Date() }
              : {}),
            ...(dto.action === OrderAction.CONFIRM_PICKUP ? { pickupAt: new Date() } : {}),
            ...(dto.action === OrderAction.CONFIRM_DELIVERY ? { deliveredAt: new Date() } : {}),
          },
        });
        if (dto.action === OrderAction.ACCEPT && taskUpdate.count !== 1) {
          throw new ConflictException('配送任务不存在，请先调度订单');
        }
      }

      const shipment = await transaction.shipment.findUnique({ where: { orderId: order.id } });
      if (shipment && dto.action !== OrderAction.DISPATCH) {
        await transaction.trackingEvent.create({
          data: {
            shipmentId: shipment.id,
            status: nextStatus,
            description: `模拟轨迹：订单状态更新为 ${nextStatus}`,
            occurredAt: new Date(),
          },
        });
        await transaction.shipment.update({
          where: { id: shipment.id },
          data: { status: this.shipmentStatus(nextStatus) },
        });
      }
    });

    return this.detail(principal, id);
  }

  private addressData(type: OrderAddressType, input: OrderAddressInputDto) {
    const phone = this.security.normalizePhone(input.phone);
    return {
      type,
      contactName: input.contactName,
      phoneHash: this.security.hashPhone(phone),
      phoneEncrypted: this.security.encryptField(phone),
      phoneLast4: phone.slice(-4),
      countryCode: input.countryCode ?? 'LA',
      country: input.country,
      province: input.province,
      city: input.city,
      district: input.district,
      detail: input.detail,
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }

  private async resolveAddress(
    userId: string,
    inline: OrderAddressInputDto | undefined,
    addressId: string | undefined,
    label: string,
  ): Promise<OrderAddressInputDto> {
    if ((inline && addressId) || (!inline && !addressId)) {
      throw new BadRequestException(`${label}地址必须在地址簿 ID 与新地址之间二选一`);
    }
    if (inline) return inline;
    const saved = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });
    if (!saved) throw new NotFoundException(`${label}地址不存在`);
    return {
      contactName: saved.contactName,
      phone: this.security.decryptField(saved.phoneEncrypted),
      countryCode: saved.countryCode,
      country: saved.country,
      province: saved.province ?? undefined,
      city: saved.city,
      district: saved.district ?? undefined,
      detail: saved.detail,
      latitude: saved.latitude === null ? undefined : Number(saved.latitude),
      longitude: saved.longitude === null ? undefined : Number(saved.longitude),
    };
  }

  private orderNo(): string {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    return `DEMO-${date}-${randomInt(100000, 999999)}`;
  }

  private ensureUser(principal: AuthPrincipal): void {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅普通用户可以创建订单');
  }

  private ensureOrderAccess(principal: AuthPrincipal, userId: string, courierId: string | null): void {
    if (principal.type === PrincipalType.USER && principal.id !== userId) throw new ForbiddenException('无权访问该订单');
    if (principal.type === PrincipalType.COURIER && courierId && principal.id !== courierId) throw new ForbiddenException('无权访问该订单');
  }

  private authorizeAction(
    principal: AuthPrincipal,
    action: OrderAction,
    userId: string,
    courierId: string | null,
  ): void {
    const userActions = new Set([OrderAction.SUBMIT, OrderAction.CONFIRM, OrderAction.COMPLETE, OrderAction.CANCEL]);
    const courierActions = new Set([
      OrderAction.ACCEPT,
      OrderAction.START_PICKUP,
      OrderAction.CONFIRM_PICKUP,
      OrderAction.START_TRANSIT,
      OrderAction.CONFIRM_DELIVERY,
      OrderAction.REPORT_EXCEPTION,
    ]);
    const adminActions = new Set([OrderAction.DISPATCH, OrderAction.CANCEL, OrderAction.REPORT_EXCEPTION]);

    if (principal.type === PrincipalType.USER && principal.id === userId && userActions.has(action)) return;
    if (
      principal.type === PrincipalType.COURIER &&
      courierActions.has(action) &&
      (action === OrderAction.ACCEPT ? courierId === null || courierId === principal.id : courierId === principal.id)
    ) return;
    if (
      principal.type === PrincipalType.ADMINISTRATOR &&
      adminActions.has(action) &&
      (action !== OrderAction.DISPATCH || principal.permissions.includes('orders.dispatch'))
    ) return;
    throw new ForbiddenException('当前身份无权执行该订单动作');
  }

  private taskStatus(action: OrderAction): DeliveryTaskStatus | undefined {
    const taskStatuses: Partial<Record<OrderAction, DeliveryTaskStatus>> = {
      [OrderAction.ACCEPT]: DeliveryTaskStatus.ACCEPTED,
      [OrderAction.START_PICKUP]: DeliveryTaskStatus.PICKING_UP,
      [OrderAction.CONFIRM_PICKUP]: DeliveryTaskStatus.PICKED_UP,
      [OrderAction.START_TRANSIT]: DeliveryTaskStatus.IN_TRANSIT,
      [OrderAction.CONFIRM_DELIVERY]: DeliveryTaskStatus.DELIVERED,
      [OrderAction.CANCEL]: DeliveryTaskStatus.CANCELLED,
      [OrderAction.REPORT_EXCEPTION]: DeliveryTaskStatus.EXCEPTION,
    };
    return taskStatuses[action];
  }

  private shipmentStatus(status: OrderStatus): ShipmentStatus {
    if (status === OrderStatus.DELIVERED || status === OrderStatus.COMPLETED) return ShipmentStatus.DELIVERED;
    if (status === OrderStatus.CANCELLED) return ShipmentStatus.CANCELLED;
    if (status === OrderStatus.EXCEPTION) return ShipmentStatus.EXCEPTION;
    if (status === OrderStatus.PICKED_UP || status === OrderStatus.IN_TRANSIT) {
      return ShipmentStatus.IN_TRANSIT;
    }
    return ShipmentStatus.CREATED;
  }

  async createComplaint(
    principal: AuthPrincipal,
    orderId: string,
    dto: {
      issueType: 'DAMAGE' | 'ATTITUDE' | 'OVERCHARGE' | 'OTHER';
      subject: string;
      description: string;
      proofUrls?: string[];
    },
  ) {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅用户可投诉');
    const order = await this.prisma.expressOrder.findFirst({
      where: { id: orderId, userId: principal.id },
    });
    if (!order) throw new NotFoundException('订单不存在');
    const proofs = (dto.proofUrls ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 6);
    const description = proofs.length
      ? `${dto.description.trim()}\n\n__PROOFS__${JSON.stringify(proofs)}`
      : dto.description.trim();
    const ticket = await this.prisma.customerServiceTicket.create({
      data: {
        ticketNo: `CS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomInt(1000, 9999)}`,
        userId: principal.id,
        orderId,
        issueType: dto.issueType,
        subject: dto.subject.trim(),
        description,
      },
    });
    return this.mapTicket(ticket);
  }

  async listTickets(principal: AuthPrincipal) {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅用户可查看工单');
    const rows = await this.prisma.customerServiceTicket.findMany({
      where: { userId: principal.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map((row) => this.mapTicket(row));
  }

  async ticketDetail(principal: AuthPrincipal, ticketId: string) {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅用户可查看工单');
    const row = await this.prisma.customerServiceTicket.findFirst({
      where: { id: ticketId, userId: principal.id },
    });
    if (!row) throw new NotFoundException('工单不存在');
    return this.mapTicket(row);
  }

  private mapTicket(row: {
    id: string;
    ticketNo: string;
    orderId: string | null;
    issueType: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    adminNote: string | null;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
  }) {
    const { text, proofUrls } = this.splitProofs(row.description);
    return {
      id: row.id,
      ticketNo: row.ticketNo,
      orderId: row.orderId,
      issueType: row.issueType,
      subject: row.subject,
      description: text,
      proofUrls,
      status: row.status,
      priority: row.priority,
      adminNote: row.adminNote,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
    };
  }

  private splitProofs(description: string): { text: string; proofUrls: string[] } {
    const marker = '\n\n__PROOFS__';
    const idx = description.indexOf(marker);
    if (idx < 0) return { text: description, proofUrls: [] };
    const text = description.slice(0, idx);
    try {
      const parsed = JSON.parse(description.slice(idx + marker.length)) as unknown;
      const proofUrls = Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === 'string') : [];
      return { text, proofUrls };
    } catch {
      return { text, proofUrls: [] };
    }
  }
}
