<template>
  <view class="register-page" :key="locale">
    <view class="bg-gradient"></view>

    <view class="register-container">
      <view class="form-card">
        <view class="lang-row"><LanguageSwitcher /></view>
        <view v-if="error" class="error-tip">{{ error }}</view>

        <view class="field">
          <text class="field-label">{{ t('register.name') }}</text>
          <view class="input-wrap" :class="{ focused: nameFocused }">
            <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke-linecap="round" />
            </svg>
            <input v-model="form.name" class="field-input" :placeholder="t('register.namePh')" placeholder-class="input-placeholder" @focus="nameFocused = true" @blur="nameFocused = false" />
          </view>
          <text v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</text>
        </view>

        <view class="field">
          <text class="field-label">{{ t('login.idLabel') }}</text>
          <view class="input-wrap" :class="{ focused: idFocused, invalid: !!fieldErrors.identifier }">
            <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 6h16v12H4z" stroke-linejoin="round" />
              <path d="M4 7l8 6 8-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <input v-model="form.identifier" class="field-input" :placeholder="t('register.idPh')" placeholder-class="input-placeholder" @focus="idFocused = true" @blur="idFocused = false" />
          </view>
          <text class="field-hint">{{ t('register.idHint') }}</text>
          <text v-if="fieldErrors.identifier" class="field-error">{{ fieldErrors.identifier }}</text>
        </view>

        <view class="field">
          <text class="field-label">{{ t('register.setPwd') }}</text>
          <view class="input-wrap" :class="{ focused: pwdFocused, invalid: !!fieldErrors.password }">
            <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" stroke-linecap="round" />
            </svg>
            <input v-model="form.password" class="field-input" :password="!showPwd" :placeholder="t('register.pwdPh')" placeholder-class="input-placeholder" @focus="pwdFocused = true" @blur="pwdFocused = false" />
            <text class="input-action" @tap="showPwd = !showPwd">{{ showPwd ? t('login.hide') : t('login.show') }}</text>
          </view>
          <text v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</text>
        </view>

        <view class="field">
          <text class="field-label">{{ t('register.confirmPwd') }}</text>
          <view class="input-wrap" :class="{ focused: pwd2Focused, invalid: !!fieldErrors.confirm }">
            <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" stroke-linecap="round" />
            </svg>
            <input v-model="form.confirmPassword" class="field-input" :password="!showPwd2" :placeholder="t('register.confirmPh')" placeholder-class="input-placeholder" @focus="pwd2Focused = true" @blur="pwd2Focused = false" />
            <text class="input-action" @tap="showPwd2 = !showPwd2">{{ showPwd2 ? t('login.hide') : t('login.show') }}</text>
          </view>
          <text v-if="fieldErrors.confirm" class="field-error">{{ fieldErrors.confirm }}</text>
        </view>

        <button class="primary-button" :loading="submitting" :disabled="submitting" @tap="submit">
          {{ submitting ? t('register.submitting') : t('register.submit') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import { t, locale } from '../../i18n';
import { userApi } from '../../services/api';
import { setPendingRegistration } from '../../stores/registration';
import { errorMessage } from '../../utils/presentation';

const submitting = ref(false);
const error = ref('');
const showPwd = ref(false);
const showPwd2 = ref(false);
const nameFocused = ref(false);
const idFocused = ref(false);
const pwdFocused = ref(false);
const pwd2Focused = ref(false);

const form = reactive({ name: '', identifier: '', password: '', confirmPassword: '' });
const fieldErrors = reactive({ name: '', identifier: '', password: '', confirm: '' });

function isValidIdentifier(value: string): boolean {
  if (value.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return /^\+[1-9]\d{7,14}$/.test(value);
}

function validateFields(): boolean {
  fieldErrors.name = form.name.trim() ? '' : t('register.needName');
  fieldErrors.identifier = isValidIdentifier(form.identifier.trim()) ? '' : t('login.badId');
  fieldErrors.password = form.password.length >= 8 ? '' : t('login.pwdShort');
  fieldErrors.confirm = form.password === form.confirmPassword ? '' : t('register.pwdMismatch');
  return !fieldErrors.name && !fieldErrors.identifier && !fieldErrors.password && !fieldErrors.confirm;
}

async function submit(): Promise<void> {
  error.value = '';
  if (!validateFields()) return;
  submitting.value = true;
  try {
    const identifier = form.identifier.trim();
    const target = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    const result = await userApi.sendCode({ ...target, purpose: 'register' });
    setPendingRegistration({
      displayName: form.name.trim(),
      ...target,
      password: form.password,
      mockCode: result.mockCode,
    });
    uni.navigateTo({ url: '/pages/verify/index' });
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.register-page { min-height: 100vh; position: relative; overflow: hidden; background: var(--km-bg); display: flex; align-items: center; justify-content: center; padding: 40rpx 32rpx; }
.bg-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, #d7e9f8 0%, #eaf2f8 48%, var(--km-bg) 100%); }
.register-container { position: relative; z-index: 1; width: 100%; max-width: 640rpx; }
.lang-row { display: flex; justify-content: flex-end; margin-bottom: 8rpx; }
.form-card { background: var(--km-surface); border-radius: 24rpx; padding: 48rpx 40rpx; border: 1rpx solid rgba(17,24,39,0.06); box-shadow: 0 12rpx 32rpx rgba(15,23,42,0.04); }
.error-tip {
  margin-bottom: 20rpx; padding: 16rpx 20rpx; border-radius: 14rpx;
  background: color-mix(in srgb, var(--km-danger) 12%, var(--km-surface));
  color: var(--km-danger); font-size: 22rpx; font-weight: 500;
}
.field { margin-top: 28rpx; }
.form-card > .field:first-child { margin-top: 0; }
.field-label { display: block; margin-bottom: 14rpx; font-size: 24rpx; font-weight: 500; color: var(--km-text-muted); }
.field-hint { display: block; margin-top: 10rpx; font-size: 20rpx; color: var(--km-text-muted); }
.field-error { display: block; margin-top: 8rpx; font-size: 20rpx; color: var(--km-danger); }
.input-wrap { display: flex; align-items: center; height: 92rpx; padding: 0 28rpx; border: 1rpx solid var(--km-border); border-radius: 16rpx; background: var(--km-surface-sunken); }
.input-wrap.focused { border-color: var(--km-primary); background: var(--km-surface); box-shadow: 0 0 0 6rpx color-mix(in srgb, var(--km-primary) 12%, transparent); }
.input-wrap.invalid { border-color: var(--km-danger); }
.input-icon-svg { width: 36rpx; height: 36rpx; margin-right: 18rpx; color: var(--km-text-muted); flex-shrink: 0; }
.input-wrap.focused .input-icon-svg { color: var(--km-primary); }
.field-input { flex: 1; height: 92rpx; background: transparent; font-size: 28rpx; color: var(--km-text); font-weight: 400; }
.input-placeholder { color: var(--km-text-muted); }
.input-action { font-size: 22rpx; padding: 8rpx 12rpx; color: var(--km-primary); font-weight: 500; flex-shrink: 0; }
.primary-button { width: 100%; height: 92rpx; line-height: 92rpx; margin-top: 36rpx; border: 0; border-radius: 16rpx; color: var(--km-text-inverse); background: var(--km-primary); font-size: 28rpx; font-weight: 600; letter-spacing: 0.08em; box-shadow: none; }
.primary-button[disabled] { opacity: 0.6; }
</style>
