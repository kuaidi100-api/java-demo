import { OrderStatus } from '@express-platform/shared-types';

export const statusLabel: Record<OrderStatus, string> = {
  DRAFT: '草稿', PENDING_CONFIRMATION: '待确认', PENDING_DISPATCH: '待调度', PENDING_ACCEPTANCE: '待接单', ACCEPTED: '已接单', PICKING_UP: '取件中', PICKED_UP: '已取件', IN_TRANSIT: '配送中', DELIVERED: '已送达', COMPLETED: '已完成', CANCELLED: '已取消', EXCEPTION: '异常',
};
export function errorMessage(error: unknown): string { return error instanceof Error ? error.message : '请求失败，请稍后重试'; }
export function formatTime(value: string | null): string { return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'; }
export function money(value: number | string, currency = 'LAK'): string { return `${new Intl.NumberFormat('zh-CN').format(Number(value))} ${currency}`; }
