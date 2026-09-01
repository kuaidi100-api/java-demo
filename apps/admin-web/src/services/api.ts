import { ApiClient, type TokenPair, type TokenStore } from '@express-platform/api-client';
import type {
  AdminOverview,
  AuthSession,
  CourierOption,
  LoginInput,
  OrderActionInput,
  OrderDetail,
  OrderSummary,
} from '@express-platform/shared-types';

const TOKEN_KEY = 'express.admin.tokens';
const tokenStore: TokenStore = {
  get(): TokenPair | null {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw) as unknown;
      if (typeof value === 'object' && value !== null && 'accessToken' in value && 'refreshToken' in value) {
        const pair = value as { accessToken: unknown; refreshToken: unknown };
        if (typeof pair.accessToken === 'string' && typeof pair.refreshToken === 'string') return { accessToken: pair.accessToken, refreshToken: pair.refreshToken };
      }
    } catch { return null; }
    return null;
  },
  set(tokens): void { localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens)); },
  clear(): void { localStorage.removeItem(TOKEN_KEY); },
};

export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  tokenStore,
  timeoutMs: 12_000,
  onUnauthorized: () => {
    localStorage.removeItem('express.admin.subject');
    if (location.hash !== '#/login') location.hash = '#/login?reason=expired';
  },
});

export const adminApi = {
  login(input: LoginInput): Promise<AuthSession> { return api.post('/auth/login', input, { auth: false, retryUnauthorized: false }); },
  overview(): Promise<AdminOverview> { return api.get('/admin/overview'); },
  couriers(): Promise<CourierOption[]> { return api.get('/admin/couriers'); },
  orders(): Promise<OrderSummary[]> { return api.get('/orders'); },
  order(id: string): Promise<OrderDetail> { return api.get(`/orders/${encodeURIComponent(id)}`); },
  act(id: string, input: OrderActionInput): Promise<OrderDetail> { return api.post(`/orders/${encodeURIComponent(id)}/actions`, input); },
  receive(input: Record<string, unknown>): Promise<unknown> { return api.post('/freight/warehouse/receive', input); },
  unclaimed(): Promise<unknown[]> { return api.get('/freight/unclaimed'); },
  finance(batchDate?: string): Promise<unknown[]> { return api.get(batchDate ? `/admin/finance?batchDate=${encodeURIComponent(batchDate)}` : '/admin/finance'); },
  runFinance(slot: 'Morning' | 'Evening'): Promise<unknown> { return api.post(`/admin/finance/run?slot=${slot}`); },
  tickets(): Promise<unknown[]> { return api.get('/admin/tickets'); },
  addTrace(id: string, description: string): Promise<unknown> { return api.post(`/admin/orders/${encodeURIComponent(id)}/traces`, { description }); },
  quotePurchase(id: string, quoteAmount: number, adminNote?: string): Promise<unknown> { return api.post(`/purchases/${encodeURIComponent(id)}/quote`, { quoteAmount, adminNote }); },
};

export { tokenStore };
