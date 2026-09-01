<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('ticket.listTitle') }}</text>
      <text class="topbar-placeholder" />
    </view>

    <view v-if="loading" class="state">{{ t('orders.loading') }}</view>
    <view v-else-if="error" class="state error">{{ error }}</view>
    <view v-else-if="items.length === 0" class="state">{{ t('ticket.empty') }}</view>
    <view v-else class="list">
      <view v-for="item in items" :key="item.id" class="card" @tap="open(item.id)">
        <view class="row">
          <text class="no">{{ item.ticketNo }}</text>
          <text class="status">{{ statusText(item.status) }}</text>
        </view>
        <text class="subject">{{ item.subject }}</text>
        <text class="meta">{{ item.createdAt.slice(0, 19).replace('T', ' ') }}</text>
        <view class="progress">
          <view class="dot" :class="{ on: true }" />
          <view class="bar" :class="{ on: item.status !== 'OPEN' }" />
          <view class="dot" :class="{ on: item.status === 'RESOLVED' || item.status === 'CLOSED' }" />
        </view>
        <text class="hint">{{ t('ticket.progress') }} · {{ statusText(item.status) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { backOrHome } from '../../utils/navigation';
import { t, locale } from '../../i18n';

type Ticket = Awaited<ReturnType<typeof userApi.tickets>>[number];

const items = ref<Ticket[]>([]);
const loading = ref(true);
const error = ref('');

onShow(() => {
  if (requireUserSession()) void load();
});

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    items.value = await userApi.tickets();
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    loading.value = false;
  }
}

function statusText(status: string): string {
  if (status === 'RESOLVED') return t('ticket.resolved');
  if (status === 'CLOSED') return t('ticket.closed');
  return t('ticket.open');
}

function open(id: string): void {
  uni.navigateTo({ url: `/pages/tickets/index?id=${encodeURIComponent(id)}` });
}

function goBack(): void {
  backOrHome();
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
.state { margin: 40rpx 28rpx; color: var(--km-text-secondary); }
.state.error { color: var(--km-danger); }
.list { padding: 20rpx 28rpx 40rpx; }
.card {
  margin-bottom: 16rpx; padding: 24rpx; border-radius: 20rpx;
  background: var(--km-surface); border: 1rpx solid var(--km-border);
}
.row { display: flex; justify-content: space-between; gap: 12rpx; }
.no { font-size: 24rpx; font-weight: 700; }
.status { font-size: 22rpx; color: var(--km-primary); }
.subject { display: block; margin-top: 10rpx; font-size: 28rpx; }
.meta { display: block; margin-top: 8rpx; font-size: 20rpx; color: var(--km-text-muted); }
.progress { display: flex; align-items: center; margin-top: 20rpx; gap: 0; }
.dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: var(--km-border); }
.dot.on { background: var(--km-primary); }
.bar { flex: 1; height: 4rpx; background: var(--km-border); }
.bar.on { background: var(--km-primary); }
.hint { display: block; margin-top: 10rpx; font-size: 20rpx; color: var(--km-text-muted); }
</style>
