import { describe, expect, it, vi } from 'vitest';
import { ApiClient, type TokenPair, type TokenStore } from '../src/index.js';

function memoryStore(initial: TokenPair | null): TokenStore {
  let current = initial;
  return {
    get: () => current,
    set: (tokens) => { current = tokens; },
    clear: () => { current = null; },
  };
}

describe('ApiClient', () => {
  it('binds the native global fetch receiver before sending a browser request', async () => {
    const receiverCheckingFetch = function (this: typeof globalThis): Promise<Response> {
      expect(this).toBe(globalThis);
      return Promise.resolve(Response.json({
        success: true,
        data: { status: 'ok' },
        requestId: 'native-fetch',
        timestamp: new Date().toISOString(),
      }));
    } as typeof fetch;
    vi.stubGlobal('fetch', receiverCheckingFetch);
    try {
      const client = new ApiClient({ baseUrl: 'http://api.test', tokenStore: memoryStore(null) });
      await expect(client.get('/health', { auth: false })).resolves.toEqual({ status: 'ok' });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('rotates tokens once and retries a request after 401', async () => {
    const store = memoryStore({ accessToken: 'expired', refreshToken: 'refresh-old' });
    let calls = 0;
    const fetchImpl: typeof fetch = async (input) => {
      calls += 1;
      const url = String(input);
      if (url.endsWith('/auth/refresh')) {
        return Response.json({
          success: true,
          data: {
            accessToken: 'access-new',
            refreshToken: 'refresh-new',
            tokenType: 'Bearer',
            expiresIn: 900,
            subject: { id: 'subject', type: 'USER', roles: [], permissions: [] },
            environment: { enabled: true, label: '模拟环境' },
          },
          requestId: 'refresh',
          timestamp: new Date().toISOString(),
        });
      }
      if (calls === 1) {
        return Response.json({ success: false, error: { code: 401, message: 'expired' }, path: '/orders', requestId: 'one', timestamp: new Date().toISOString() }, { status: 401 });
      }
      return Response.json({ success: true, data: [{ id: 'order-1' }], requestId: 'two', timestamp: new Date().toISOString() });
    };
    const client = new ApiClient({ baseUrl: 'http://api.test', tokenStore: store, fetchImpl });
    await expect(client.get<Array<{ id: string }>>('/orders')).resolves.toEqual([{ id: 'order-1' }]);
    expect(store.get()).toEqual({ accessToken: 'access-new', refreshToken: 'refresh-new' });
    expect(calls).toBe(3);
  });

  it('maps 403 to a typed forbidden error', async () => {
    const fetchImpl: typeof fetch = async () => Response.json({ success: false, error: { code: 403, message: '无权限' }, path: '/admin', requestId: 'forbidden', timestamp: new Date().toISOString() }, { status: 403 });
    const client = new ApiClient({ baseUrl: 'http://api.test', tokenStore: memoryStore(null), fetchImpl });
    await expect(client.get('/admin', { auth: false })).rejects.toMatchObject({ kind: 'forbidden', status: 403, message: '无权限' });
  });
});
