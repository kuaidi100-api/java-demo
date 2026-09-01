<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('auth.changePassword') }}</text>
      <text class="topbar-placeholder" />
    </view>

    <view class="card">
      <view v-if="error" class="error-tip">{{ error }}</view>

      <view class="field">
        <text class="label">{{ t('auth.oldPassword') }}</text>
        <input v-model="form.oldPassword" class="input" :password="true" :placeholder="t('auth.oldPh')" @blur="touchOld" />
        <text v-if="errs.old" class="field-error">{{ errs.old }}</text>
      </view>
      <view class="field">
        <text class="label">{{ t('auth.newPassword') }}</text>
        <input v-model="form.newPassword" class="input" :password="true" :placeholder="t('auth.newPh')" @blur="touchNew" />
        <text v-if="errs.next" class="field-error">{{ errs.next }}</text>
      </view>
      <view class="field">
        <text class="label">{{ t('auth.confirmPassword') }}</text>
        <input v-model="form.confirm" class="input" :password="true" :placeholder="t('auth.confirmPh')" @blur="touchConfirm" />
        <text v-if="errs.confirm" class="field-error">{{ errs.confirm }}</text>
      </view>

      <button class="primary" :loading="auth.submitting" :disabled="auth.submitting" @tap="submit">
        {{ t('auth.changePwdSubmit') }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { t, locale } from '../../i18n';
import { requireUserSession, useAuthStore } from '../../stores/auth';
import { errorMessage } from '../../utils/presentation';
import { backOrHome } from '../../utils/navigation';

requireUserSession();
const auth = useAuthStore();
const form = reactive({ oldPassword: '', newPassword: '', confirm: '' });
const errs = reactive({ old: '', next: '', confirm: '' });
const error = ref('');

function goBack(): void { backOrHome(); }
function touchOld(): void {
  errs.old = form.oldPassword.length < 8 ? t('auth.needOld') : '';
}
function touchNew(): void {
  errs.next = form.newPassword.length < 8 ? t('login.pwdShort') : '';
}
function touchConfirm(): void {
  errs.confirm = form.confirm !== form.newPassword ? t('auth.pwdMismatch') : '';
}

async function submit(): Promise<void> {
  error.value = '';
  touchOld(); touchNew(); touchConfirm();
  if (errs.old || errs.next || errs.confirm) return;
  try {
    await auth.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
    uni.showToast({ title: t('auth.changePwdOk'), icon: 'success' });
    setTimeout(() => uni.reLaunch({ url: '/pages/login/index' }), 600);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); color: var(--km-text); }
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 70rpx 28rpx 20rpx; background: var(--km-surface); border-bottom: 1rpx solid var(--km-border);
}
.back { width: 60rpx; font-size: 44rpx; color: var(--km-text); }
.topbar-title { font-size: 32rpx; font-weight: 700; }
.topbar-placeholder { width: 60rpx; }
.card {
  margin: 24rpx; padding: 28rpx; border-radius: 24rpx;
  background: var(--km-surface); border: 1rpx solid var(--km-border);
}
.field { margin-bottom: 24rpx; }
.label { display: block; margin-bottom: 10rpx; font-size: 22rpx; color: var(--km-text-secondary); }
.input {
  height: 88rpx; padding: 0 24rpx; border-radius: 16rpx;
  border: 1rpx solid var(--km-border); background: var(--km-bg); color: var(--km-text); font-size: 28rpx;
}
.field-error { display: block; margin-top: 8rpx; font-size: 20rpx; color: var(--km-danger, #c74635); }
.error-tip {
  margin-bottom: 16rpx; padding: 14rpx 16rpx; border-radius: 12rpx; font-size: 22rpx;
  background: color-mix(in srgb, var(--km-danger, #c74635) 12%, var(--km-surface));
  color: var(--km-danger, #c74635);
}
.primary {
  margin-top: 8rpx; height: 92rpx; line-height: 92rpx; border: 0; border-radius: 18rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-size: 30rpx; font-weight: 600;
}
</style>
