import { OrderStatus } from '@express-platform/shared-types';
import { t, type MessageKey } from '../i18n';

export function statusLabel(status: OrderStatus): string {
  return t(`status.${status}` as MessageKey);
}

export function serviceTypeLabel(serviceType: string): string {
  return t(`service.${serviceType}` as MessageKey);
}

export function money(value: number | string, currency = 'CNY'): string {
  if (currency === 'LAK') return `₭ ${new Intl.NumberFormat('zh-CN').format(Number(value))}`;
  if (currency === 'CNY') return `¥ ${new Intl.NumberFormat('zh-CN').format(Number(value))}`;
  return `${new Intl.NumberFormat('zh-CN').format(Number(value))} ${currency}`;
}

export function formatTime(value: string | null): string {
  if (!value) return t('common.pendingTime');
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : t('common.requestFail');
}
