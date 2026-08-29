import { ConflictException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrderAction } from './dto/order-action.dto.js';

const ACTION_TARGET: Record<OrderAction, OrderStatus> = {
  [OrderAction.SUBMIT]: OrderStatus.PENDING_CONFIRMATION,
  [OrderAction.CONFIRM]: OrderStatus.PENDING_DISPATCH,
  [OrderAction.DISPATCH]: OrderStatus.PENDING_ACCEPTANCE,
  [OrderAction.ACCEPT]: OrderStatus.ACCEPTED,
  [OrderAction.START_PICKUP]: OrderStatus.PICKING_UP,
  [OrderAction.CONFIRM_PICKUP]: OrderStatus.PICKED_UP,
  [OrderAction.START_TRANSIT]: OrderStatus.IN_TRANSIT,
  [OrderAction.CONFIRM_DELIVERY]: OrderStatus.DELIVERED,
  [OrderAction.COMPLETE]: OrderStatus.COMPLETED,
  [OrderAction.CANCEL]: OrderStatus.CANCELLED,
  [OrderAction.REPORT_EXCEPTION]: OrderStatus.EXCEPTION,
};

const ALLOWED: Record<OrderStatus, ReadonlySet<OrderStatus>> = {
  DRAFT: new Set([OrderStatus.PENDING_CONFIRMATION, OrderStatus.CANCELLED]),
  PENDING_CONFIRMATION: new Set([OrderStatus.PENDING_DISPATCH, OrderStatus.CANCELLED]),
  PENDING_DISPATCH: new Set([OrderStatus.PENDING_ACCEPTANCE, OrderStatus.CANCELLED, OrderStatus.EXCEPTION]),
  PENDING_ACCEPTANCE: new Set([OrderStatus.ACCEPTED, OrderStatus.CANCELLED, OrderStatus.EXCEPTION]),
  ACCEPTED: new Set([OrderStatus.PICKING_UP, OrderStatus.CANCELLED, OrderStatus.EXCEPTION]),
  PICKING_UP: new Set([OrderStatus.PICKED_UP, OrderStatus.EXCEPTION]),
  PICKED_UP: new Set([OrderStatus.IN_TRANSIT, OrderStatus.EXCEPTION]),
  IN_TRANSIT: new Set([OrderStatus.DELIVERED, OrderStatus.EXCEPTION]),
  DELIVERED: new Set([OrderStatus.COMPLETED, OrderStatus.EXCEPTION]),
  COMPLETED: new Set(),
  CANCELLED: new Set(),
  EXCEPTION: new Set([OrderStatus.PENDING_DISPATCH, OrderStatus.CANCELLED]),
};

export function targetStatus(current: OrderStatus, action: OrderAction): OrderStatus {
  const target = ACTION_TARGET[action];
  if (!ALLOWED[current].has(target)) {
    throw new ConflictException(`订单状态不允许从 ${current} 通过 ${action} 变更为 ${target}`);
  }
  return target;
}
