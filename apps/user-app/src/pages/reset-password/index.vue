<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('reset.title') }}</text>
      <text class="topbar-placeholder" />
    </view>

    <view class="card">
      <text class="sub">{{ t('reset.subtitle') }}</text>
      <view v-if="error" class="error-tip">{{ error }}</view>

      <view class="field">
        <text class="label">{{ t('login.idLabel') }}</text>
        <view class="input-wrap" :class="{ invalid: !!errs.id }">
          <DialCodePicker v-if="!isEmail" v-model="dialCode" />
          <input v-model="form.identifier" class="input" :placeholder="isEmail ? t('login.idPh') : t('login.phoneLocalPh')" @blur="touchId" />
        </view>
        <text v-if="errs.id" class="field-error">{{ errs.id }}</text>
      </view>

      <view class="field">
        <text class="label">{{ t('login.tabCode') }}</text>
        <view class="code-row">
          <input v-model="form.code" class="input flex" type="number" maxlength="6" :placeholder="t('login.codePh')" @blur="touchCode" />
          <button class="code-btn" :disabled="countdown > 0 || sending" @tap="sendCode">
            {{ countdown > 0 ? t('login.resendIn', { n: countdown }) : sending ? t('login.sendingCode') : t('login.sendCode') }}
          </button>
        </view>
        <text v-if="errs.code" class="field-error">{{ errs.code }}</text>
        <text v-if="mockCode" class="mock">{{ t('login.mockCode', { code: mockCode }) }}</text>
      </view>

      <view class="field">
        <text class="label">{{ t('auth.newPassword') }}</text>
        <input v-model="form.password" class="input" :password="true" :placeholder="t('auth.newPh')" @blur="touchPwd" />
        <text v-if="errs.password" class="field-error">{{ errs.password }}</text>
      </view>

      <button class="primary" :loading="submitting" :disabled="submitting" @tap="submit">{{ t('reset.submit') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import DialCodePicker from '../../components/DialCodePicker.vue';
import { t, locale } from '../../i18n';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { backOrHome } from '../../utils/navigation';

const dialCode = ref('+856');
const form = reactive({ identifier: '', code: '', password: '' });
const errs = reactive({ id: '', code: '', password: '' });
const error = ref('');
const sending = ref(false);
const submitting = ref(false);
const mockCode = ref('');
const countdown = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const isEmail = computed(() => form.identifier.includes('@'));

function goBack(): void { backOrHome(); }

function resolvedId(): string {
  const raw = form.identifier.trim();
  if (!raw) return '';
  if (raw.includes('@') || raw.startsWith('+')) return raw;
  return `${dialCode.value}${raw.replace(/^0+/, '')}`;
}

function touchId(): void {
  const id = resolvedId();
  errs.id = !id
    ? t('login.fieldId')
    : (id.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id) : /^\+[1-9]\d{7,14}$/.test(id))
      ? ''
      : t('login.badId');
}

function touchCode(): void {
  errs.code = /^\d{4,8}$/.test(form.code.trim()) ? '' : t('login.fieldCode');
}

function touchPwd(): void {
  errs.password = form.password.length >= 8 ? '' : t('login.pwdShort');
}

function target() {
  const id = resolvedId();
  return id.includes('@') ? { email: id } : { phone: id };
}

async function sendCode(): Promise<void> {
  error.value = '';
  touchId();
  if (errs.id) return;
  sending.value = true;
  try {
    const result = await userApi.sendCode({ ...target(), purpose: 'reset' });
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
    sending.value = false;
  }
}

async function submit(): Promise<void> {
  error.value = '';
  touchId(); touchCode(); touchPwd();
  if (errs.id || errs.code || errs.password) return;
  if (!countdown.value && !mockCode.value) {
    // allow submit if user already has code even without local mock tip
  }
  submitting.value = true;
  try {
    await userApi.resetPassword({ ...target(), code: form.code.trim(), newPassword: form.password });
    uni.showToast({ title: t('reset.ok'), icon: 'success' });
    setTimeout(() => uni.reLaunch({ url: '/pages/login/index' }), 600);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); color: var(--km-text); }
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 70rpx 28rpx 20rpx; background: var(--km-surface); border-bottom: 1rpx solid var(--km-border);
}
.back { width: 60rpx; font-size: 44rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; }
.topbar-placeholder { width: 60rpx; }
.card { margin: 24rpx; padding: 28rpx; border-radius: 24rpx; background: var(--km-surface); border: 1rpx solid var(--km-border); }
.sub { display: block; margin-bottom: 20rpx; font-size: 22rpx; color: var(--km-text-secondary); }
.field { margin-bottom: 22rpx; }
.label { display: block; margin-bottom: 10rpx; font-size: 22rpx; color: var(--km-text-secondary); }
.input-wrap {
  display: flex; align-items: center; min-height: 88rpx; padding: 0 16rpx;
  border-radius: 16rpx; border: 1rpx solid var(--km-border); background: var(--km-bg);
}
.input-wrap.invalid { border-color: var(--km-danger); }
.input {
  flex: 1; height: 88rpx; padding: 0 12rpx; border: 0; background: transparent;
  color: var(--km-text); font-size: 28rpx;
}
.input.flex { flex: 1; border: 1rpx solid var(--km-border); border-radius: 16rpx; padding: 0 20rpx; background: var(--km-bg); }
.code-row { display: flex; gap: 12rpx; }
.code-btn {
  margin: 0; min-width: 180rpx; padding: 0 16rpx; border: 0; border-radius: 16rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-size: 22rpx;
}
.field-error { display: block; margin-top: 8rpx; font-size: 20rpx; color: var(--km-danger); }
.mock { display: block; margin-top: 8rpx; font-size: 20rpx; color: var(--km-text-muted); }
.error-tip {
  margin-bottom: 16rpx; padding: 14rpx 16rpx; border-radius: 12rpx; font-size: 22rpx;
  background: color-mix(in srgb, var(--km-danger) 12%, var(--km-surface)); color: var(--km-danger);
}
.primary {
  margin-top: 8rpx; height: 92rpx; line-height: 92rpx; border: 0; border-radius: 18rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-size: 30rpx; font-weight: 600;
}
</style>
