import { Injectable } from '@nestjs/common';
import { AccountStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { SecurityService } from '../security/security.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
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
      activeOrderCount: courier._count.orders,
    }));
  }
}
