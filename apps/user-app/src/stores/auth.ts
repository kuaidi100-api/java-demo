import { reactive } from 'vue';
import type { AuthSubject, LoginInput } from '@express-platform/shared-types';
import { PrincipalType } from '@express-platform/shared-types';
import { tokenStore, userApi } from '../services/api';

const SUBJECT_KEY = 'express.user.subject';

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
        if (session.subject.type !== PrincipalType.USER) throw new Error('该账号不是用户账号');
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
      uni.reLaunch({ url: '/pages/login/index' });
    },
  };
}

export function requireUserSession(): boolean {
  const subject = readSubject();
  if (!subject || !tokenStore.get()) {
    uni.reLaunch({ url: '/pages/login/index' });
    return false;
  }
  return true;
}
