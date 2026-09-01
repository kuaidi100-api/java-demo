<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { PrincipalType } from '@express-platform/shared-types';
import LanguageSwitcher from '@express-platform/ui-components/mobile/LanguageSwitcher.vue';
import { t } from '../../i18n';
import { useCourierAuth } from '../../stores/auth';
import { errorMessage } from '../../utils';

const auth = useCourierAuth();
const form = reactive({ identifier: '', password: '' });
const error = ref('');
const expired = ref(false);
onLoad((q) => {
  expired.value = q?.reason === 'expired';
  if (auth.authenticated) uni.reLaunch({ url: '/pages/workbench/index' });
});
async function submit(): Promise<void> {
  error.value = '';
  if (!/^\+[1-9]\d{7,14}$/.test(form.identifier)) {
    error.value = t('courier.needPhone');
    return;
  }
  if (form.password.length < 8) {
    error.value = t('login.pwdShort');
    return;
  }
  try {
    await auth.login({ subjectType: PrincipalType.COURIER, ...form });
    uni.showToast({ title: t('login.ok'), icon: 'success' });
    setTimeout(() => uni.reLaunch({ url: '/pages/workbench/index' }), 450);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  }
}
</script>
<template>
  <view class="login-page">
    <view class="login-card card">
      <view class="lang-row"><LanguageSwitcher /></view>
      <text class="card-title">{{ t('courier.loginTitle') }}</text>
      <view v-if="expired" class="notice">{{ t('courier.expired') }}</view>
      <view class="field">
        <text>{{ t('courier.phone') }}</text>
        <input v-model.trim="form.identifier" :placeholder="t('courier.phonePh')" autocomplete="username" />
      </view>
      <view class="field">
        <text>{{ t('login.password') }}</text>
        <input v-model="form.password" type="password" :placeholder="t('login.pwdPh')" autocomplete="current-password" @confirm="submit" />
      </view>
      <view v-if="error" class="form-error">{{ error }}</view>
      <button class="primary-button" :loading="auth.submitting" :disabled="auth.submitting" @tap="submit">
        {{ auth.submitting ? t('courier.submitting') : t('courier.submit') }}
      </button>
      <text class="hint">{{ t('courier.hint') }}</text>
    </view>
  </view>
</template>
<style scoped>
.login-page{position:relative;min-height:100vh;padding:46rpx 34rpx;background:linear-gradient(180deg,#d7e9f8 0%,#eaf2f8 48%,#f4f5f7 100%);display:flex;align-items:center;justify-content:center}
.lang-row{display:flex;justify-content:flex-end;margin-bottom:16rpx}
.card-title,.hint{display:block}.login-card{width:100%;padding:40rpx;border:1rpx solid rgba(17,24,39,.06)}.card-title{margin-bottom:30rpx;font-size:32rpx;font-weight:600;letter-spacing:-0.03em}.field{margin-bottom:23rpx}.field text{display:block;margin-bottom:10rpx;color:#6b7280;font-size:22rpx;font-weight:500}.field input{height:84rpx;padding:0 22rpx;border-radius:16rpx;background:#f8f9fb;font-size:26rpx}.notice,.form-error{margin-bottom:20rpx;padding:17rpx;border-radius:12rpx;font-size:22rpx}.notice{color:#1d4ed8;background:#eff6ff}.form-error{color:#b91c1c;background:#fef2f2}.hint{margin-top:20rpx;text-align:center;color:#9ca3af;font-size:20rpx}
</style>
