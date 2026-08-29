import { reactive } from 'vue';
import { PrincipalType, type AuthSubject, type LoginInput } from '@express-platform/shared-types';
import { adminApi, tokenStore } from '../services/api';

const SUBJECT_KEY = 'express.admin.subject';
function readSubject(): AuthSubject | null {
  const raw = localStorage.getItem(SUBJECT_KEY);
  if (!raw) return null;
  try {
    const subject = JSON.parse(raw) as AuthSubject;
    return subject.type === PrincipalType.ADMINISTRATOR ? subject : null;
  } catch { return null; }
}
const state = reactive({ subject: readSubject() as AuthSubject | null, submitting: false });

export const adminAuth = {
  state,
  get authenticated(): boolean { return state.subject?.type === PrincipalType.ADMINISTRATOR && tokenStore.get() !== null; },
  async login(input: LoginInput): Promise<void> {
    state.submitting = true;
    try {
      const session = await adminApi.login(input);
      if (session.subject.type !== PrincipalType.ADMINISTRATOR) throw new Error('该账号不是管理员账号');
      tokenStore.set({ accessToken: session.accessToken, refreshToken: session.refreshToken });
      state.subject = session.subject;
      localStorage.setItem(SUBJECT_KEY, JSON.stringify(session.subject));
    } finally { state.submitting = false; }
  },
  logout(): void {
    tokenStore.clear(); localStorage.removeItem(SUBJECT_KEY); state.subject = null; location.hash = '#/login';
  },
};
