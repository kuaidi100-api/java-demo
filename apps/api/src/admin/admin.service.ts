import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, LedgerType, OrderStatus, PrincipalType, TicketStatus } from '@prisma/client';
import { randomInt } from 'node:crypto';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SecurityService } from '../security/security.service.js';
import { ErrandService } from '../business/errand.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
    private readonly errands: ErrandService,
  ) {}

  async overview() {
    const [
      totalOrders,
      pendingDispatch,
      pendingAcceptance,
      inProgress,
      completed,
      exception,
      activeCouriers,
    ] = await this.prisma.$transaction([
      this.prisma.expressOrder.count(),
      this.prisma.expressOrder.count({ where: { status: OrderStatus.PENDING_DISPATCH } }),
      this.prisma.expressOrder.count({ where: { status: OrderStatus.PENDING_ACCEPTANCE } }),
      this.prisma.expressOrder.count({
        where: {
          status: {
            in: [
              OrderStatus.ACCEPTED,
              OrderStatus.PICKING_UP,
              OrderStatus.PICKED_UP,
              OrderStatus.IN_TRANSIT,
              OrderStatus.DELIVERED,
            ],
          },
        },
      }),
      this.prisma.expressOrder.count({ where: { status: OrderStatus.COMPLETED } }),
      this.prisma.expressOrder.count({ where: { status: OrderStatus.EXCEPTION } }),
      this.prisma.courier.count({ where: { accountStatus: AccountStatus.ACTIVE, deletedAt: null } }),
    ]);
    return {
      totalOrders,
      pendingDispatch,
      pendingAcceptance,
      inProgress,
      completed,
      exception,
      activeCouriers,
      mockEnvironment: true as const,
    };
  }

  async couriers() {
    const couriers = await this.prisma.courier.findMany({
      where: { accountStatus: AccountStatus.ACTIVE, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            orders: {
              where: { status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] } },
            },
          },
        },
      },
    });
    return couriers.map((courier) => ({
      id: courier.id,
      displayName: courier.displayName,
      phone: this.security.maskPhone(courier.phoneLast4),
      accountStatus: courier.accountStatus,
      workStatus: courier.workStatus,
      depositBalance: Number(courier.depositBalance),
      depositThreshold: Number(courier.depositThreshold),
      riderCode: courier.riderCode,
      activeOrderCount: courier._count.orders,
    }));
  }

  async finance(batchDate?: string) {
    return this.prisma.financeLedger.findMany({
      where: batchDate ? { batchDate } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        order: { select: { orderNo: true, paymentStatus: true } },
        courier: { select: { displayName: true, riderCode: true } },
      },
    });
  }

  runFinance(slot: 'Morning' | 'Evening') {
    return this.errands.generateFinanceBatch(slot);
  }

  tickets() {
    return this.prisma.customerServiceTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        order: { select: { orderNo: true, status: true } },
      },
    });
  }

  async createTicket(
    principal: AuthPrincipal,
    dto: { orderId: string; issueType: 'DAMAGE' | 'ATTITUDE' | 'OVERCHARGE' | 'OTHER'; subject: string; description: string },
  ) {
    const order = await this.prisma.expressOrder.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    return this.prisma.customerServiceTicket.create({
      data: {
        ticketNo: `CS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomInt(1000, 9999)}`,
        userId: order.userId,
        orderId: dto.orderId,
        assignedAdminId: principal.type === PrincipalType.ADMINISTRATOR ? principal.id : undefined,
        issueType: dto.issueType,
        subject: dto.subject,
        description: dto.description,
      },
    });
  }

  async resolveTicket(
    principal: AuthPrincipal,
    ticketId: string,
    dto: { status: TicketStatus; penaltyAmount?: number; adminNote?: string },
  ) {
    const ticket = await this.prisma.customerServiceTicket.findUnique({
      where: { id: ticketId },
      include: { order: true },
    });
    if (!ticket) throw new NotFoundException('工单不存在');
    if (dto.penaltyAmount && dto.penaltyAmount > 0 && ticket.order?.courierId) {
      await this.prisma.courier.update({
        where: { id: ticket.order.courierId },
        data: { depositBalance: { decrement: dto.penaltyAmount } },
      });
      await this.prisma.financeLedger.create({
        data: {
          orderId: ticket.orderId,
          courierId: ticket.order.courierId,
          amount: dto.penaltyAmount,
          type: LedgerType.DEPOSIT_DEDUCT,
          batchDate: `PENALTY-${new Date().toISOString().slice(0, 10)}`,
          note: dto.adminNote ?? '客服判定责任扣押金',
        },
      });
    }
    return this.prisma.customerServiceTicket.update({
      where: { id: ticketId },
      data: {
        status: dto.status,
        penaltyAmount: dto.penaltyAmount ?? 0,
        adminNote: dto.adminNote,
        assignedAdminId: principal.id,
        resolvedAt: dto.status === TicketStatus.RESOLVED || dto.status === TicketStatus.CLOSED ? new Date() : null,
      },
    });
  }

  async addManualTrace(orderId: string, description: string) {
    const order = await this.prisma.expressOrder.findUnique({
      where: { id: orderId },
      include: { shipment: true },
    });
    if (!order) throw new NotFoundException('订单不存在');
    let shipmentId = order.shipment?.id;
    if (!shipmentId) {
      const shipment = await this.prisma.shipment.create({
        data: {
          orderId,
          shipmentNo: `MANUAL-${order.orderNo}`,
          providerCode: 'MANUAL',
          status: 'CREATED',
          isMock: true,
        },
      });
      shipmentId = shipment.id;
    }
    return this.prisma.trackingEvent.create({
      data: {
        shipmentId,
        status: 'MANUAL',
        description,
        occurredAt: new Date(),
        isManual: true,
      },
    });
  }

  async adjustDeposit(courierId: string, amount: number, note?: string) {
    const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
    if (!courier) throw new NotFoundException('骑手不存在');
    const updated = await this.prisma.courier.update({
      where: { id: courierId },
      data: { depositBalance: { increment: amount } },
    });
    await this.prisma.financeLedger.create({
      data: {
        courierId,
        amount,
        type: amount >= 0 ? LedgerType.RIDER_PAYOUT : LedgerType.DEPOSIT_DEDUCT,
        batchDate: `DEPOSIT-${new Date().toISOString().slice(0, 10)}`,
        note: note ?? (amount >= 0 ? '押金充值' : '押金扣减'),
      },
    });
    return { id: updated.id, depositBalance: Number(updated.depositBalance) };
  }
}
