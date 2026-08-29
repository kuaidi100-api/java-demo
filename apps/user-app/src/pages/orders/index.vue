<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { OrderSummary } from '@express-platform/shared-types';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, formatTime, money, statusLabel } from '../../utils/presentation';

const orders = ref<OrderSummary[]>([]);
const loading = ref(true);
const error = ref('');

onShow(() => {
  if (requireUserSession()) void load();
});

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    orders.value = await userApi.orders();
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    loading.value = false;
  }
}

function open(id: string): void {
  uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(id)}` });
}

function goBack(): void {
  uni.navigateBack();
}

function createOrder(): void {
  uni.navigateTo({ url: '/pages/order-create/index' });
}
</script>

<template>
  <view class="page orders-page">
    <view class="topbar"><text class="back" @tap="goBack">←</text><text class="topbar-title">我的订单</text><text class="mock-pill">模拟环境</text></view>
    <view class="summary-strip card"><view><text class="summary-number">{{ orders.length }}</text><text class="summary-label">全部订单</text></view><view class="summary-copy">真实读取本地 API 与 MySQL</view></view>
    <view v-if="loading" class="state-panel card"><text class="state-title">正在加载订单</text><text>正在同步最新状态…</text></view>
    <view v-else-if="error" class="state-panel error-panel"><text class="state-title">加载失败</text><text>{{ error }}</text><button class="secondary-button retry" @tap="load">重新加载</button></view>
    <view v-else-if="orders.length === 0" class="state-panel card"><text class="state-title">暂无订单</text><text>从首页创建第一笔模拟寄件。</text><button class="primary-button create" @tap="createOrder">去寄件</button></view>
    <view v-else class="order-list">
      <view v-for="order in orders" :key="order.id" class="order-row card" @tap="open(order.id)">
        <view class="row-head"><text class="order-no">{{ order.orderNo }}</text><text class="status-badge">{{ statusLabel[order.status] }}</text></view>
        <view class="route-line"><view class="route-dot" /><view class="route-bar" /><view class="route-dot end" /></view>
        <view class="row-meta"><text>{{ order.shipment?.shipmentNo ?? '待生成运单' }}</text><text>{{ formatTime(order.createdAt) }}</text></view>
        <view class="row-foot"><text>{{ order.serviceType === 'INTRACITY' ? '同城跑腿' : '上门寄件' }}</text><text class="money">{{ money(order.estimatedFee, order.currency) }}</text></view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.back { width: 52rpx; font-size: 36rpx; font-weight: 800; }.summary-strip { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; background: #292520; color: #fff; }.summary-number,.summary-label { display: block; }.summary-number { font-size: 42rpx; font-weight: 900; }.summary-label { margin-top: 3rpx; color: #d8d0c8; font-size: 20rpx; }.summary-copy { color: #e9aa88; font-size: 22rpx; }.order-list { margin-top: 22rpx; }.order-row { margin-bottom: 18rpx; padding: 28rpx; }.row-head,.row-meta,.row-foot { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }.order-no { font-size: 25rpx; font-weight: 900; }.route-line { display: flex; align-items: center; margin: 30rpx 8rpx 20rpx; }.route-dot { width: 18rpx; height: 18rpx; border: 5rpx solid #f07338; border-radius: 50%; }.route-dot.end { border-color: #34302c; }.route-bar { flex: 1; height: 2px; background: linear-gradient(90deg,#f07338,#d9d0c8); }.row-meta { color: #8a8178; font-size: 20rpx; }.row-foot { margin-top: 22rpx; padding-top: 20rpx; border-top: 1px dashed #e7ded6; color: #6f675f; font-size: 23rpx; }.money { color: #2d2925; font-weight: 900; }.retry,.create { width: 260rpx; margin-top: 24rpx; }
</style>
