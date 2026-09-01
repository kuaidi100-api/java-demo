import { reactive } from 'vue';
import type { AuthSubject, LoginInput, RegisterInput } from '@express-platform/shared-types';
import { PrincipalType } from '@express-platform/shared-types';
import { tokenStore, userApi } from '../services/api';
import { t } from '../i18n';

const SUBJECT_KEY = 'express.user.subject';
let authOriginDepth: number | null = null;

function readSubject(): AuthSubject | null {
  const value = uni.getStorageSync(SUBJECT_KEY) as unknown;
  if (!value || typeof value !== 'object' || !('type' in value)) return null;
  return (value as { type: unknown }).type === PrincipalType.USER ? value as AuthSubject : null;
}

const state = reactive({
  subject: readSubject() as AuthSubject | null,
  submitting: false,
});

export function useAuthStore() {
  return {
    get subject(): AuthSubject | null { return state.subject; },
    get submitting(): boolean { return state.submitting; },
    get isAuthenticated(): boolean {
      return state.subject?.type === PrincipalType.USER && tokenStore.get() !== null;
    },
    async login(input: LoginInput): Promise<void> {
      state.submitting = true;
      try {
        const session = await userApi.login(input);
        if (session.subject.type !== PrincipalType.USER) throw new Error(t('login.notUser'));
        tokenStore.set({ accessToken: session.accessToken, refreshToken: session.refreshToken });
        state.subject = session.subject;
        uni.setStorageSync(SUBJECT_KEY, session.subject);
      } finally {
        state.submitting = false;
      }
    },
    async loginByCode(input: { phone?: string; email?: string; code: string }): Promise<void> {
      state.submitting = true;
      try {
        const session = await userApi.loginByCode(input);
        if (session.subject.type !== PrincipalType.USER) throw new Error(t('login.notUser'));
        tokenStore.set({ accessToken: session.accessToken, refreshToken: session.refreshToken });
        state.subject = session.subject;
        uni.setStorageSync(SUBJECT_KEY, session.subject);
      } finally {
        state.submitting = false;
      }
    },
    async changePassword(input: { oldPassword: string; newPassword: string }): Promise<void> {
      state.submitting = true;
      try {
        await userApi.changePassword(input);
        tokenStore.clear();
        uni.removeStorageSync(SUBJECT_KEY);
        state.subject = null;
      } finally {
        state.submitting = false;
      }
    },
    async register(input: RegisterInput): Promise<void> {
      state.submitting = true;
      try {
        const session = await userApi.register(input);
        if (session.subject.type !== PrincipalType.USER) throw new Error('注册返回账号类型异常');
        tokenStore.set({ accessToken: session.accessToken, refreshToken: session.refreshToken });
        state.subject = session.subject;
        uni.setStorageSync(SUBJECT_KEY, session.subject);
      } finally {
        state.submitting = false;
      }
    },
    logout(): void {
      tokenStore.clear();
      uni.removeStorageSync(SUBJECT_KEY);
      state.subject = null;
      uni.reLaunch({ url: '/pages/home/index' });
    },
  };
}

export function requireUserSession(): boolean {
  const subject = readSubject();
  if (!subject || !tokenStore.get()) {
    if (authOriginDepth === null) authOriginDepth = getCurrentPages().length;
    uni.navigateTo({ url: '/pages/login/index' });
    return false;
  }
  return true;
}

export function finishUserAuthentication(): void {
  if (authOriginDepth !== null) {
    const delta = Math.max(1, getCurrentPages().length - authOriginDepth);
    authOriginDepth = null;
    uni.navigateBack({ delta });
    return;
  }
  uni.reLaunch({ url: '/pages/home/index' });
}
