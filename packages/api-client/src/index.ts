import type { ApiEnvelope, ApiErrorEnvelope, AuthSession } from '@express-platform/shared-types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenStore {
  get(): TokenPair | null;
  set(tokens: TokenPair): void;
  clear(): void;
}

export type ApiErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'validation'
  | 'rate_limit'
  | 'server'
  | 'timeout'
  | 'network'
  | 'http';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status: number | null,
    readonly code: number | string | null,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  tokenStore: TokenStore;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  onUnauthorized?: () => void;
}

export interface RequestOptions {
  auth?: boolean;
  retryUnauthorized?: boolean;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(private readonly options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    // Browser fetch performs a receiver brand check in Chromium. Keeping the
    // unbound native function as an instance method makes `this.fetchImpl()`
    // invoke it with ApiClient as the receiver and throws before any request is
    // sent. Bind only the native implementation; injected test fetches retain
    // their original call semantics.
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'GET' }, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }, options);
  }

  async request<T>(path: string, init: RequestInit = {}, requestOptions: RequestOptions = {}): Promise<T> {
    const auth = requestOptions.auth ?? true;
    const retryUnauthorized = requestOptions.retryUnauthorized ?? true;
    const response = await this.send<T>(path, init, auth);
    if (!(response instanceof ApiClientError)) return response;
    if (response.status === 401 && auth && retryUnauthorized && await this.refreshTokens()) {
      const retry = await this.send<T>(path, init, true);
      if (!(retry instanceof ApiClientError)) return retry;
      throw retry;
    }
    if (response.status === 401 && auth) this.handleUnauthorized();
    throw response;
  }

  private async send<T>(path: string, init: RequestInit, auth: boolean): Promise<T | ApiClientError> {
    const controller = new AbortController();
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, this.options.timeoutMs ?? 12_000);
    const externalAbort = () => controller.abort();
    init.signal?.addEventListener('abort', externalAbort, { once: true });
    try {
      const tokens = auth ? this.options.tokenStore.get() : null;
      const headers = new Headers(init.headers);
      if (init.body !== undefined && !headers.has('content-type')) headers.set('content-type', 'application/json');
      if (tokens?.accessToken) headers.set('authorization', `Bearer ${tokens.accessToken}`);
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });
      const payload = await this.readPayload(response);
      if (!response.ok) return this.httpError(response.status, payload);
      if (this.isEnvelope<T>(payload)) return payload.data;
      return payload as T;
    } catch (error: unknown) {
      if (error instanceof ApiClientError) return error;
      if (didTimeout) return new ApiClientError('请求超时，请稍后重试', 'timeout', null, 'TIMEOUT');
      if (error instanceof DOMException && error.name === 'AbortError') {
        return new ApiClientError('请求已取消', 'network', null, 'ABORTED');
      }
      return new ApiClientError('网络连接失败，请检查 API 服务和网络', 'network', null, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeout);
      init.signal?.removeEventListener('abort', externalAbort);
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;
    const refreshToken = this.options.tokenStore.get()?.refreshToken;
    if (!refreshToken) return false;
    this.refreshInFlight = (async () => {
      const result = await this.send<AuthSession>('/auth/refresh', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }, false);
      if (result instanceof ApiClientError) {
        this.handleUnauthorized();
        return false;
      }
      this.options.tokenStore.set({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      return true;
    })().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private handleUnauthorized(): void {
    this.options.tokenStore.clear();
    this.options.onUnauthorized?.();
  }

  private async readPayload(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  private httpError(status: number, payload: unknown): ApiClientError {
    const body = this.isErrorEnvelope(payload) ? payload : null;
    const rawMessage = body?.error.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join('；') : rawMessage ?? `请求失败（${status}）`;
    const kind: ApiErrorKind = status === 401
      ? 'unauthorized'
      : status === 403
        ? 'forbidden'
        : status === 422 || status === 400
          ? 'validation'
          : status === 429
            ? 'rate_limit'
            : status >= 500
              ? 'server'
              : 'http';
    return new ApiClientError(message, kind, status, body?.error.code ?? status, body?.requestId);
  }

  private isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
    return typeof value === 'object' && value !== null && 'success' in value && value.success === true && 'data' in value;
  }

  private isErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
    return typeof value === 'object' && value !== null && 'success' in value && value.success === false && 'error' in value;
  }
}
