import { ConflictException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrderAction } from './dto/order-action.dto.js';
import { targetStatus } from './order-state-machine.js';

describe('order state machine', () => {
  it('allows the defined happy-path transitions', () => {
    expect(targetStatus(OrderStatus.DRAFT, OrderAction.SUBMIT)).toBe(
      OrderStatus.PENDING_CONFIRMATION,
    );
    expect(targetStatus(OrderStatus.PENDING_ACCEPTANCE, OrderAction.ACCEPT)).toBe(
      OrderStatus.ACCEPTED,
    );
    expect(targetStatus(OrderStatus.DELIVERED, OrderAction.COMPLETE)).toBe(
      OrderStatus.COMPLETED,
    );
  });

  it('rejects skipping required states', () => {
    expect(() => targetStatus(OrderStatus.DRAFT, OrderAction.ACCEPT)).toThrow(
      ConflictException,
    );
  });

  it('rejects changes to a terminal state', () => {
    expect(() => targetStatus(OrderStatus.COMPLETED, OrderAction.CANCEL)).toThrow(
      ConflictException,
    );
  });
});
