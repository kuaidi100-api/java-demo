<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { PrincipalType } from '@express-platform/shared-types';
import { useAuthStore } from '../../stores/auth';
import { errorMessage } from '../../utils/presentation';

const auth = useAuthStore();
const expired = ref(false);
const form = reactive({ identifier: '', password: '' });
const error = ref('');

onLoad((query) => {
  expired.value = query?.reason === 'expired';
  if (auth.isAuthenticated) uni.reLaunch({ url: '/pages/home/index' });
});

async function submit(): Promise<void> {
  error.value = '';
  if (!/^\+[1-9]\d{7,14}$/.test(form.identifier)) {
    error.value = '请输入国际格式手机号，例如 +85620…';
    return;
  }
  if (form.password.length < 8) {
    error.value = '密码至少 8 位';
    return;
  }
  try {
    await auth.login({ subjectType: PrincipalType.USER, ...form });
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.reLaunch({ url: '/pages/home/index' }), 450);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  }
}
</script>

<template>
  <view class="login-page">
    <view class="login-orb orb-one" />
    <view class="login-orb orb-two" />
    <view class="brand-row">
      <view class="brand-mark">木</view>
      <view>
        <text class="brand-name">木棉速达</text>
        <text class="brand-subtitle">让每一次托付都有回应</text>
      </view>
    </view>

    <view class="login-copy">
      <text class="eyebrow">EXPRESS LIFE SERVICE</text>
      <text class="headline">寄件这件小事，\n交给我们。</text>
      <text class="caption">面向老挝本地生活的快递综合服务体验</text>
    </view>

    <view class="login-card card">
      <view class="card-heading">
        <text class="card-title">手机号登录</text>
        <text class="mock-pill">● 模拟环境</text>
      </view>
      <view v-if="expired" class="session-note">登录状态已过期，请重新登录。</view>
      <view class="field">
        <text class="field-label">手机号</text>
        <input v-model.trim="form.identifier" class="field-input" type="text" placeholder="国际格式手机号" autocomplete="username" />
      </view>
      <view class="field">
        <text class="field-label">密码</text>
        <input v-model="form.password" class="field-input" type="password" placeholder="请输入密码" autocomplete="current-password" @confirm="submit" />
      </view>
      <view v-if="error" class="form-error">{{ error }}</view>
      <button class="primary-button" :loading="auth.submitting" :disabled="auth.submitting" @tap="submit">
        {{ auth.submitting ? '正在安全登录…' : '进入木棉速达' }}
      </button>
      <text class="demo-hint">本地演示账号见 README；密码不会被预填或记录。</text>
    </view>
  </view>
</template>

<style scoped>
.login-page { position: relative; min-height: 100vh; overflow: hidden; padding: 46rpx 34rpx 64rpx; background: linear-gradient(165deg, #fffaf4 0%, #f7eee3 62%, #f4e4d5 100%); }
.login-orb { position: absolute; border-radius: 50%; filter: blur(2rpx); opacity: .8; }
.orb-one { width: 360rpx; height: 360rpx; right: -170rpx; top: 130rpx; background: #ffd4b8; }
.orb-two { width: 230rpx; height: 230rpx; left: -110rpx; top: 480rpx; background: #ffe9bf; }
.brand-row { position: relative; z-index: 1; display: flex; align-items: center; gap: 20rpx; }
.brand-mark { display: grid; place-items: center; width: 78rpx; height: 78rpx; border-radius: 24rpx 24rpx 24rpx 8rpx; color: #fff; background: #ef672d; font-size: 34rpx; font-weight: 900; box-shadow: 0 16rpx 28rpx rgba(215, 82, 29, .22); }
.brand-name, .brand-subtitle, .eyebrow, .headline, .caption, .card-title, .demo-hint { display: block; }
.brand-name { font-size: 31rpx; font-weight: 900; letter-spacing: 2rpx; }
.brand-subtitle { margin-top: 4rpx; color: #8d7968; font-size: 20rpx; }
.login-copy { position: relative; z-index: 1; margin: 92rpx 8rpx 54rpx; }
.eyebrow { color: #d65e29; font-size: 19rpx; letter-spacing: 4rpx; font-weight: 800; }
.headline { margin-top: 20rpx; font-size: 62rpx; line-height: 1.22; font-weight: 900; white-space: pre-line; }
.caption { margin-top: 22rpx; color: #796d62; font-size: 25rpx; }
.login-card { position: relative; z-index: 1; padding: 34rpx; }
.card-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30rpx; }
.card-title { font-size: 34rpx; font-weight: 900; }
.session-note, .form-error { margin-bottom: 20rpx; padding: 18rpx 20rpx; border-radius: 16rpx; font-size: 23rpx; }
.session-note { color: #8a5b24; background: #fff6dd; }
.form-error { color: #a83b2e; background: #fff0ed; }
.demo-hint { margin-top: 22rpx; text-align: center; color: #8e857c; font-size: 21rpx; line-height: 1.6; }
</style>
