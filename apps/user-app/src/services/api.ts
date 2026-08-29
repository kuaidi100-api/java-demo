import { ApiClient, type TokenPair, type TokenStore } from '@express-platform/api-client';
import type {
  AddressBookItem,
  AuthSession,
  CreateOrderInput,
  EstimateInput,
  EstimateResult,
  LoginInput,
  OrderActionInput,
  OrderDetail,
  OrderSummary,
} from '@express-platform/shared-types';

const TOKEN_KEY = 'express.user.tokens';

const tokenStore: TokenStore = {
  get(): TokenPair | null {
    const value = uni.getStorageSync(TOKEN_KEY) as unknown;
    if (!value || typeof value !== 'object' || !('accessToken' in value) || !('refreshToken' in value)) return null;
    const tokens = value as { accessToken: unknown; refreshToken: unknown };
    return typeof tokens.accessToken === 'string' && typeof tokens.refreshToken === 'string'
      ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
      : null;
  },
  set(tokens): void {
    uni.setStorageSync(TOKEN_KEY, tokens);
  },
  clear(): void {
    uni.removeStorageSync(TOKEN_KEY);
  },
};

export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api/v1',
  tokenStore,
  timeoutMs: 12_000,
  onUnauthorized: () => {
    uni.removeStorageSync('express.user.subject');
    uni.reLaunch({ url: '/pages/login/index?reason=expired' });
  },
});

export const userApi = {
  login(input: LoginInput): Promise<AuthSession> {
    return api.post('/auth/login', input, { auth: false, retryUnauthorized: false });
  },
  addresses(): Promise<AddressBookItem[]> {
    return api.get('/addresses');
  },
  estimate(input: EstimateInput): Promise<EstimateResult> {
    return api.post('/orders/estimate', input);
  },
  createOrder(input: CreateOrderInput): Promise<{ id: string }> {
    return api.post('/orders', input);
  },
  orders(): Promise<OrderSummary[]> {
    return api.get('/orders');
  },
  order(id: string): Promise<OrderDetail> {
    return api.get(`/orders/${encodeURIComponent(id)}`);
  },
  act(id: string, input: OrderActionInput): Promise<OrderDetail> {
    return api.post(`/orders/${encodeURIComponent(id)}/actions`, input);
  },
};

export { tokenStore };
