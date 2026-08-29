export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  PENDING_DISPATCH = 'PENDING_DISPATCH',
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  ACCEPTED = 'ACCEPTED',
  PICKING_UP = 'PICKING_UP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXCEPTION = 'EXCEPTION',
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface MockEnvironmentState {
  enabled: boolean;
  label: '模拟环境' | '真实环境';
}
