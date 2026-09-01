<template>
  <view class="login-page" :key="locale">
    <view class="bg-gradient"></view>
    <view class="login-container">
      <view class="form-card">
        <view class="lang-row"><LanguageSwitcher /></view>
        <text class="form-title">{{ t('login.title') }}</text>
        <text class="form-subtitle">{{ t('login.subtitle') }}</text>

        <view class="mode-tabs">
          <text class="mode-tab" :class="{ on: mode === 'password' }" @tap="mode = 'password'">{{ t('login.tabPassword') }}</text>
          <text class="mode-tab" :class="{ on: mode === 'code' }" @tap="mode = 'code'">{{ t('login.tabCode') }}</text>
        </view>

        <view v-if="expired" class="expired-tip">{{ t('login.expired') }}</view>
        <view v-if="error" class="error-tip">{{ error }}</view>

        <view class="field">
          <text class="field-label">{{ t('login.idLabel') }}</text>
          <view class="input-wrap" :class="{ focused: identifierFocused, invalid: !!fieldErrors.identifier }">
            <DialCodePicker v-if="!isEmailInput" v-model="dialCode" />
            <input
              v-model="form.identifier"
              class="field-input"
              :placeholder="isEmailInput ? t('login.idPh') : t('login.phoneLocalPh')"
              placeholder-class="input-placeholder"
              autocomplete="username"
              @confirm="submit"
              @focus="identifierFocused = true"
              @blur="identifierFocused = false; validateId()"
            />
          </view>
          <text v-if="fieldErrors.identifier" class="field-error">{{ fieldErrors.identifier }}</text>
        </view>

        <view v-if="mode === 'password'" class="field">
          <text class="field-label">{{ t('login.password') }}</text>
          <view class="input-wrap" :class="{ focused: passwordFocused, invalid: !!fieldErrors.password }">
            <input
              v-model="form.password"
              class="field-input"
              :password="!showPassword"
              :placeholder="t('login.pwdPh')"
              placeholder-class="input-placeholder"
              autocomplete="current-password"
              @confirm="submit"
              @focus="passwordFocused = true"
              @blur="passwordFocused = false; validatePassword()"
            />
            <text class="input-action" @tap="showPassword = !showPassword">
              {{ showPassword ? t('login.hide') : t('login.show') }}
            </text>
          </view>
          <text v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</text>
        </view>

        <view v-else class="field">
          <text class="field-label">{{ t('login.tabCode') }}</text>
          <view class="code-row">
            <view class="input-wrap code-input" :class="{ invalid: !!fieldErrors.code }">
              <input
                v-model="form.code"
                class="field-input"
                type="number"
                maxlength="6"
                :placeholder="t('login.codePh')"
                placeholder-class="input-placeholder"
                @blur="validateCode()"
              />
            </view>
            <button class="code-btn" :disabled="countdown > 0 || sendingCode" @tap="sendCode">
              {{ countdown > 0 ? t('login.resendIn', { n: countdown }) : sendingCode ? t('login.sendingCode') : t('login.sendCode') }}
            </button>
          </view>
          <text v-if="fieldErrors.code" class="field-error">{{ fieldErrors.code }}</text>
          <text v-if="mockCode" class="mock-tip">{{ t('login.mockCode', { code: mockCode }) }}</text>
        </view>

        <view class="meta-row">
          <view class="check-row" @tap="remember = !remember">
            <view class="checkbox" :class="{ checked: remember }">
              <svg v-if="remember" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M3 8l3.5 3.5L13 5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </view>
            <text class="check-text">{{ t('login.remember') }}</text>
          </view>
          <text class="link-text" @tap="goReset">{{ t('login.goReset') }}</text>
        </view>

        <button class="primary-button" :loading="auth.submitting" :disabled="auth.submitting" @tap="submit">
          {{ auth.submitting ? t('login.submitting') : t('login.submit') }}
        </button>

        <view class="bottom-links">
          <text class="register-link" @tap="goRegister">{{ t('login.goRegister') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { PrincipalType } from '@express-platform/shared-types';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import DialCodePicker from '../../components/DialCodePicker.vue';
import { t, locale } from '../../i18n';
import { userApi } from '../../services/api';
import { finishUserAuthentication, useAuthStore } from '../../stores/auth';
import { errorMessage } from '../../utils/presentation';

const auth = useAuthStore();
const expired = ref(false);
const mode = ref<'password' | 'code'>('password');
const dialCode = ref('+856');
const form = reactive({ identifier: '', password: '', code: '' });
const fieldErrors = reactive({ identifier: '', password: '', code: '' });
const showPassword = ref(false);
const remember = ref(true);
const error = ref('');
const identifierFocused = ref(false);
const passwordFocused = ref(false);
const sendingCode = ref(false);
const mockCode = ref('');
const countdown = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const isEmailInput = computed(() => form.identifier.includes('@'));

onLoad((query) => {
  expired.value = query?.reason === 'expired';
  if (auth.isAuthenticated) uni.reLaunch({ url: '/pages/home/index' });
});

function resolvedIdentifier(): string {
  const raw = form.identifier.trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  if (raw.startsWith('+')) return raw;
  return `${dialCode.value}${raw.replace(/^0+/, '')}`;
}

function isValidIdentifier(value: string): boolean {
  if (value.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return /^\+[1-9]\d{7,14}$/.test(value);
}

function validateId(): boolean {
  const id = resolvedIdentifier();
  if (!id) {
    fieldErrors.identifier = t('login.fieldId');
    return false;
  }
  if (!isValidIdentifier(id)) {
    fieldErrors.identifier = t('login.badId');
    return false;
  }
  fieldErrors.identifier = '';
  return true;
}

function validatePassword(): boolean {
  if (form.password.length < 8) {
    fieldErrors.password = t('login.fieldPassword');
    return false;
  }
  fieldErrors.password = '';
  return true;
}

function validateCode(): boolean {
  if (!/^\d{4,8}$/.test(form.code.trim())) {
    fieldErrors.code = t('login.fieldCode');
    return false;
  }
  fieldErrors.code = '';
  return true;
}

function targetPayload() {
  const id = resolvedIdentifier();
  return id.includes('@') ? { email: id } : { phone: id };
}

async function sendCode(): Promise<void> {
  error.value = '';
  if (!validateId()) return;
  sendingCode.value = true;
  try {
    const result = await userApi.sendCode({ ...targetPayload(), purpose: 'login' });
    mockCode.value = result.mockCode || '';
    uni.showToast({ title: t('login.codeSent'), icon: 'none' });
    countdown.value = 60;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0 && timer) clearInterval(timer);
    }, 1000);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    sendingCode.value = false;
  }
}

async function submit(): Promise<void> {
  error.value = '';
  if (!validateId()) return;
  try {
    if (mode.value === 'password') {
      if (!validatePassword()) return;
      await auth.login({
        subjectType: PrincipalType.USER,
        identifier: resolvedIdentifier(),
        password: form.password,
      });
    } else {
      if (!validateCode()) return;
      await auth.loginByCode({ ...targetPayload(), code: form.code.trim() });
    }
    uni.showToast({ title: t('login.ok'), icon: 'success' });
    setTimeout(() => finishUserAuthentication(), 450);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  }
}

function goReset(): void {
  uni.navigateTo({ url: '/pages/reset-password/index' });
}

function goRegister(): void {
  uni.navigateTo({ url: '/pages/register/index' });
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: var(--km-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 32rpx;
}
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--km-sky) 88%, var(--km-bg)) 0%, var(--km-bg) 100%);
}
.login-container { position: relative; z-index: 1; width: 100%; max-width: 640rpx; }
.form-card {
  background: var(--km-surface);
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  border: 1rpx solid var(--km-border);
  box-shadow: var(--km-shadow-card);
}
.lang-row { display: flex; justify-content: flex-end; margin-bottom: 20rpx; }
.form-title { display: block; font-size: 36rpx; font-weight: 600; color: var(--km-text); }
.form-subtitle { display: block; margin-top: 8rpx; font-size: 24rpx; color: var(--km-text-muted); }
.mode-tabs { display: flex; gap: 8rpx; margin-top: 28rpx; padding: 6rpx; border-radius: 16rpx; background: var(--km-bg); }
.mode-tab {
  flex: 1; text-align: center; padding: 16rpx 8rpx; border-radius: 12rpx;
  font-size: 24rpx; color: var(--km-text-muted);
}
.mode-tab.on { background: var(--km-surface); color: var(--km-text); font-weight: 600; }
.expired-tip, .error-tip {
  margin-top: 20rpx; padding: 16rpx 20rpx; border-radius: 14rpx; font-size: 22rpx; font-weight: 600;
}
.expired-tip { background: color-mix(in srgb, var(--km-primary) 12%, var(--km-surface)); color: var(--km-primary); }
.error-tip { background: color-mix(in srgb, var(--km-danger, #c74635) 12%, var(--km-surface)); color: var(--km-danger, #c74635); }
.field { margin-top: 24rpx; }
.field-label { display: block; margin-bottom: 10rpx; font-size: 22rpx; color: var(--km-text-secondary); }
.input-wrap {
  display: flex; align-items: center; gap: 12rpx;
  min-height: 88rpx; padding: 0 24rpx; border-radius: 16rpx;
  border: 1rpx solid var(--km-border); background: var(--km-bg);
}
.input-wrap.focused { border-color: var(--km-primary); }
.input-wrap.invalid { border-color: var(--km-danger, #c74635); }
.field-input { flex: 1; height: 88rpx; font-size: 28rpx; color: var(--km-text); background: transparent; }
.input-action { font-size: 22rpx; color: var(--km-primary); }
.field-error { display: block; margin-top: 8rpx; font-size: 20rpx; color: var(--km-danger, #c74635); }
.code-row { display: flex; gap: 12rpx; align-items: stretch; }
.code-input { flex: 1; }
.code-btn {
  margin: 0; padding: 0 20rpx; min-width: 180rpx; border-radius: 16rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-size: 22rpx; border: 0;
}
.code-btn[disabled] { opacity: 0.5; }
.mock-tip { display: block; margin-top: 10rpx; font-size: 20rpx; color: var(--km-text-muted); }
.meta-row { display: flex; align-items: center; justify-content: space-between; margin-top: 24rpx; }
.check-row { display: flex; align-items: center; gap: 10rpx; }
.checkbox {
  width: 32rpx; height: 32rpx; border-radius: 8rpx; border: 1rpx solid var(--km-border);
  display: flex; align-items: center; justify-content: center; color: var(--km-text-inverse);
}
.checkbox.checked { background: var(--km-primary); border-color: var(--km-primary); }
.check-text, .link-text { font-size: 22rpx; color: var(--km-text-muted); }
.link-text { color: var(--km-primary); }
.primary-button {
  margin-top: 36rpx; height: 92rpx; line-height: 92rpx; border-radius: 18rpx; border: 0;
  background: var(--km-primary); color: var(--km-text-inverse); font-size: 30rpx; font-weight: 600;
}
.register-link {
  display: block; margin-top: 28rpx; text-align: center; font-size: 24rpx; color: var(--km-primary);
}
.bottom-links { margin-top: 8rpx; }
</style>
