import { OrderStatus } from '@express-platform/shared-types';

export const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: '草稿',
  [OrderStatus.PENDING_CONFIRMATION]: '待确认',
  [OrderStatus.PENDING_DISPATCH]: '待调度',
  [OrderStatus.PENDING_ACCEPTANCE]: '待接单',
  [OrderStatus.ACCEPTED]: '已接单',
  [OrderStatus.PICKING_UP]: '取件中',
  [OrderStatus.PICKED_UP]: '已取件',
  [OrderStatus.IN_TRANSIT]: '配送中',
  [OrderStatus.DELIVERED]: '已送达',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.EXCEPTION]: '异常',
};

export function money(value: number | string, currency = 'LAK'): string {
  return `${new Intl.NumberFormat('zh-CN').format(Number(value))} ${currency}`;
}

export function formatTime(value: string | null): string {
  if (!value) return '待确定';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请求失败，请稍后重试';
}
