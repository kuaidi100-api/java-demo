import { ApiClient, type TokenPair, type TokenStore } from '@express-platform/api-client';
import type {
  AddressBookItem,
  AddressInput,
  AuthSession,
  CreateOrderInput,
  EstimateInput,
  EstimateResult,
  LoginInput,
  OrderActionInput,
  OrderDetail,
  OrderSummary,
  RegisterInput,
  SendCodeInput,
  SendCodeResult,
  VerifyCodeInput,
  VerifyCodeResult,
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
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
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
  loginByCode(input: { phone?: string; email?: string; code: string }): Promise<AuthSession> {
    return api.post('/auth/login-code', input, { auth: false, retryUnauthorized: false });
  },
  changePassword(input: { oldPassword: string; newPassword: string }): Promise<{ changed: boolean; message: string }> {
    return api.post('/auth/change-password', input);
  },
  resetPassword(input: {
    phone?: string;
    email?: string;
    code: string;
    newPassword: string;
  }): Promise<{ reset: boolean; message: string }> {
    return api.post('/auth/reset-password', input, { auth: false, retryUnauthorized: false });
  },
  createComplaint(
    orderId: string,
    input: {
      issueType: 'DAMAGE' | 'ATTITUDE' | 'OVERCHARGE' | 'OTHER';
      subject: string;
      description: string;
      proofUrls?: string[];
    },
  ): Promise<{ id: string; ticketNo: string; status: string }> {
    return api.post(`/orders/${encodeURIComponent(orderId)}/complaints`, input);
  },
  tickets(): Promise<Array<{
    id: string;
    ticketNo: string;
    orderId: string | null;
    issueType: string;
    subject: string;
    description: string;
    proofUrls: string[];
    status: string;
    createdAt: string;
    resolvedAt: string | null;
  }>> {
    return api.get('/orders/tickets');
  },
  ticket(id: string): Promise<{
    id: string;
    ticketNo: string;
    orderId: string | null;
    issueType: string;
    subject: string;
    description: string;
    proofUrls: string[];
    status: string;
    adminNote: string | null;
    createdAt: string;
    resolvedAt: string | null;
  }> {
    return api.get(`/orders/tickets/${encodeURIComponent(id)}`);
  },
  uploadProof(filePath: string): Promise<{ url?: string; publicUrl?: string; storageKey?: string }> {
    return new Promise((resolve, reject) => {
      const token = tokenStore.get()?.accessToken;
      uni.uploadFile({
        url: `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/storage/upload`,
        filePath,
        name: 'file',
        formData: { folder: 'complaints' },
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success: (res) => {
          try {
            const body = JSON.parse(String(res.data || '{}')) as { url?: string; publicUrl?: string; storageKey?: string };
            resolve(body);
          } catch (cause) {
            reject(cause);
          }
        },
        fail: reject,
      });
    });
  },
  register(input: RegisterInput): Promise<AuthSession> {
    return api.post('/auth/register', input, { auth: false, retryUnauthorized: false });
  },
  sendCode(input: SendCodeInput): Promise<SendCodeResult> {
    return api.post('/auth/send-code', input, { auth: false, retryUnauthorized: false });
  },
  verifyCode(input: VerifyCodeInput): Promise<VerifyCodeResult> {
    return api.post('/auth/verify-code', input, { auth: false, retryUnauthorized: false });
  },
  addresses(): Promise<AddressBookItem[]> {
    return api.get('/addresses');
  },
  createAddress(input: AddressInput & { label?: string }): Promise<AddressBookItem> {
    return api.post('/addresses', input);
  },
  estimate(input: EstimateInput): Promise<EstimateResult> {
    return api.post('/orders/estimate', input);
  },
  createOrder(input: CreateOrderInput): Promise<{ id: string }> {
    return api.post('/orders', input);
  },
  catalog(): Promise<Record<string, unknown>> {
    return api.get('/catalog', { auth: false });
  },
  createErrand(input: Record<string, unknown>): Promise<{ id: string; estimatedFee: number | string; currency: string }> {
    return api.post('/errands', input);
  },
  estimateErrand(input: { deliveryAreaType: number; weightTier: number }): Promise<{ amount: number; currency: string; notice: string }> {
    return api.post('/errands/estimate', input);
  },
  forecastFreight(input: { channel: number; domesticTrackingNo: string; remark?: string }): Promise<{ id: string; orderNo: string }> {
    return api.post('/freight/forecast', input);
  },
  claimParcel(domesticTrackingNo: string): Promise<{ id: string }> {
    return api.post('/freight/claim', { domesticTrackingNo });
  },
  payFreight(id: string): Promise<unknown> {
    return api.post(`/freight/${encodeURIComponent(id)}/pay`);
  },
  createPurchase(input: { productUrl: string; remark?: string }): Promise<{ id: string }> {
    return api.post('/purchases', input);
  },
  confirmPurchase(id: string, accept: boolean): Promise<unknown> {
    return api.post(`/purchases/${encodeURIComponent(id)}/confirm`, { accept });
  },
  createLifestyle(input: {
    serviceType: string;
    contactName: string;
    phone: string;
    detail: string;
    payload?: Record<string, unknown>;
  }): Promise<{ id: string }> {
    return api.post('/lifestyle', input);
  },
  supportConfig(): Promise<{
    qrItems: Array<{ id: 'wechat' | 'telegram' | 'whatsapp'; label: string; imageUrl: string }>;
    humanOnline: boolean;
    businesses: string[];
  }> {
    return api.get('/support/config', { auth: false });
  },
  createSupportSession(input: {
    businessType: 'EXPRESS' | 'ERRAND' | 'RIDE' | 'HOTEL';
    channel: 'ai' | 'human';
    orderId?: string;
    orderNo?: string;
    orderStatus?: string;
  }): Promise<{
    sessionId: string;
    businessType: string;
    channel: 'ai' | 'human';
    agentStatus: 'online' | 'offline';
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
      orderCard?: { orderId: string; orderNo: string; status?: string };
    }>;
  }> {
    return api.post('/support/sessions', input);
  },
  sendSupportMessage(
    sessionId: string,
    content: string,
  ): Promise<{
    sessionId: string;
    messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
  }> {
    return api.post(`/support/sessions/${encodeURIComponent(sessionId)}/messages`, { content });
  },
  transferSupport(sessionId: string): Promise<{
    sessionId: string;
    channel: 'ai' | 'human';
    agentStatus: 'online' | 'offline';
    messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
  }> {
    return api.post(`/support/sessions/${encodeURIComponent(sessionId)}/transfer`);
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
