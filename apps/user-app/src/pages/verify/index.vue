<template>
  <view class="verify-page">
    <view class="bg-gradient"></view>

    <view class="verify-container">
      <view class="form-card">
        <view v-if="error" class="error-tip">{{ error }}</view>

        <view class="code-row">
          <view
            v-for="i in 6"
            :key="i"
            class="code-box"
            :class="{ filled: codes[i-1], focused: activeIndex === i-1 }"
            @tap="focusInput(i-1)"
          >
            <text v-if="codes[i-1]" class="code-digit">{{ codes[i-1] }}</text>
          </view>
        </view>

        <!-- 隐藏的实际输入框 -->
        <input
          ref="codeInput"
          class="hidden-input"
          type="number"
          maxlength="6"
          v-model="codeValue"
          @input="onCodeInput"
          @focus="activeIndex = Math.min(codeValue.length, 5)"
        />

        <view v-if="mockCode" class="mock-tip">{{ t('verify.mock', { code: mockCode }) }}</view>

        <button class="primary-button" :loading="submitting" :disabled="submitting || codeValue.length < 6" @tap="submit">
          {{ submitting ? t('verify.submitting') : t('verify.submit') }}
        </button>

        <view class="resend-row">
          <text v-if="countdown > 0" class="resend-text">{{ t('verify.resendIn', { n: countdown }) }}</text>
          <text v-else class="resend-link" @tap="resend">{{ t('verify.resend') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { t } from '../../i18n';
import { userApi } from '../../services/api';
import { finishUserAuthentication, useAuthStore } from '../../stores/auth';
import { getPendingRegistration, setPendingRegistration, type PendingRegistration } from '../../stores/registration';
import { errorMessage } from '../../utils/presentation';

const auth = useAuthStore();
let pending: PendingRegistration | null = null;
const mockCode = ref('');
const codeValue = ref('');
const activeIndex = ref(0);
const submitting = ref(false);
const error = ref('');
const countdown = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;

const codes = computed(() => codeValue.value.padEnd(6, ' ').split(''));

onLoad(() => {
  pending = getPendingRegistration();
  mockCode.value = pending?.mockCode ?? '';
  if (!pending) {
    error.value = t('verify.expired');
  }
});

onMounted(() => {
  startCountdown();
});

function startCountdown(): void {
  countdown.value = 60;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0 && timer) clearInterval(timer);
  }, 1000);
}

function focusInput(index: number): void {
  activeIndex.value = index;
}

function onCodeInput(): void {
  codeValue.value = codeValue.value.replace(/\D/g, '').slice(0, 6);
  activeIndex.value = Math.min(codeValue.value.length, 5);
}

async function submit(): Promise<void> {
  if (codeValue.value.length !== 6) {
    error.value = t('verify.needCode');
    return;
  }
  error.value = '';
  submitting.value = true;
  try {
    if (!pending) throw new Error(t('verify.expired'));
    const result = await userApi.verifyCode({
      ...(pending.phone ? { phone: pending.phone } : { email: pending.email }),
      code: codeValue.value,
    });
    const { mockCode: _mockCode, ...registration } = pending;
    await auth.register({ ...registration, verificationToken: result.verificationToken });
    setPendingRegistration(null);
    uni.showToast({ title: t('verify.ok'), icon: 'success' });
    setTimeout(() => finishUserAuthentication(), 500);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    submitting.value = false;
  }
}

async function resend(): Promise<void> {
  try {
    if (!pending) throw new Error(t('verify.expired'));
    const result = await userApi.sendCode(pending.phone ? { phone: pending.phone } : { email: pending.email });
    mockCode.value = result.mockCode ?? '';
    uni.showToast({ title: t('verify.sent'), icon: 'success' });
    startCountdown();
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  }
}
</script>

<style scoped>
.verify-page { min-height: 100vh; position: relative; overflow: hidden; background: var(--km-bg); display: flex; align-items: center; justify-content: center; padding: 40rpx 32rpx; }
.bg-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, #d7e9f8 0%, #eaf2f8 48%, var(--km-bg) 100%); }
.verify-container { position: relative; z-index: 1; width: 100%; max-width: 640rpx; }
.form-card { background: var(--km-surface); border-radius: 24rpx; padding: 48rpx 40rpx; border: 1rpx solid rgba(17,24,39,0.06); box-shadow: 0 12rpx 32rpx rgba(15,23,42,0.04); }
.error-tip { margin-bottom: 24rpx; padding: 16rpx 20rpx; border-radius: 14rpx; background: #fef2f2; color: #b91c1c; font-size: 22rpx; font-weight: 500; }
.code-row { display: flex; justify-content: space-between; gap: 12rpx; margin-bottom: 24rpx; }
.code-box { width: 84rpx; height: 100rpx; border: 1rpx solid rgba(17,24,39,0.08); border-radius: 16rpx; background: var(--km-surface-sunken); display: flex; align-items: center; justify-content: center; }
.code-box.focused { border-color: var(--km-primary); background: var(--km-surface); }
.code-box.filled { border-color: var(--km-primary); background: #eff6ff; }
.code-digit { font-size: 36rpx; font-weight: 600; color: var(--km-text); }
.hidden-input { position: absolute; opacity: 0; width: 1rpx; height: 1rpx; }
.mock-tip { text-align: center; font-size: 20rpx; color: #1d4ed8; background: #eff6ff; padding: 12rpx 20rpx; border-radius: 12rpx; margin-bottom: 28rpx; }
.primary-button { width: 100%; height: 92rpx; line-height: 92rpx; border: 0; border-radius: 16rpx; color: #fff; background: var(--km-primary); font-size: 28rpx; font-weight: 600; letter-spacing: 0.08em; box-shadow: none; }
.primary-button[disabled] { opacity: 0.5; }
.resend-row { text-align: center; margin-top: 32rpx; }
.resend-text { font-size: 24rpx; color: var(--km-text-muted); }
.resend-link { font-size: 24rpx; color: var(--km-primary); font-weight: 500; }
</style>
