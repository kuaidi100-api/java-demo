<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { OrderStatus, PaymentStatus, type OrderSummary } from '@express-platform/shared-types';
import AppTabBar from '../../components/AppTabBar.vue';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, formatTime, money, serviceTypeLabel, statusLabel } from '../../utils/presentation';
import { useUserTabs } from '../../composables/useUserTabs';
import { t, locale } from '../../i18n';

type FilterKey = 'all' | 'pay' | 'pickup' | 'shipping' | 'done';

const orders = ref<OrderSummary[]>([]);
const loading = ref(true);
const error = ref('');
const filter = ref<FilterKey>('all');

const tabs: { key: FilterKey; labelKey: 'orders.filterAll' | 'orders.filterPay' | 'orders.filterPickup' | 'orders.filterShipping' | 'orders.filterDone' }[] = [
  { key: 'all', labelKey: 'orders.filterAll' },
  { key: 'pay', labelKey: 'orders.filterPay' },
  { key: 'pickup', labelKey: 'orders.filterPickup' },
  { key: 'shipping', labelKey: 'orders.filterShipping' },
  { key: 'done', labelKey: 'orders.filterDone' },
];

const filtered = computed(() => {
  const list = orders.value;
  switch (filter.value) {
    case 'pay':
      return list.filter((o) => o.paymentStatus === PaymentStatus.UNPAID || o.paymentStatus === PaymentStatus.PENDING_CONFIRM);
    case 'pickup':
      return list.filter((o) =>
        [OrderStatus.PENDING_DISPATCH, OrderStatus.PENDING_ACCEPTANCE, OrderStatus.ACCEPTED, OrderStatus.PICKING_UP].includes(o.status),
      );
    case 'shipping':
      return list.filter((o) =>
        [OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT].includes(o.status),
      );
    case 'done':
      return list.filter((o) =>
        [OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(o.status),
      );
    default:
      return list;
  }
});

onLoad((query) => {
  const status = typeof query?.status === 'string' ? query.status : '';
  if (status === 'pay' || status === 'pickup' || status === 'shipping' || status === 'done') {
    filter.value = status;
  }
});

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

const bottomTabs = useUserTabs();

function selectTab(key: string): void {
  if (key === 'home') uni.reLaunch({ url: '/pages/home/index' });
  else if (key === 'tracking') uni.navigateTo({ url: '/pages/tracking/index' });
  else if (key === 'flash') uni.navigateTo({ url: '/pages/flash/index' });
  else if (key === 'profile') uni.navigateTo({ url: '/pages/profile/index' });
}
</script>

<template>
  <view class="page orders-page km-screen" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">←</text>
      <text class="topbar-title">{{ t('orders.title') }}</text>
      <text class="topbar-placeholder" />
    </view>
    <view class="summary-strip card">
      <view>
        <text class="summary-number">{{ filtered.length }}</text>
        <text class="summary-label">{{ t('orders.all') }}</text>
      </view>
    </view>
    <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
      <view class="filter-row">
        <text
          v-for="tab in tabs"
          :key="tab.key"
          class="filter-chip"
          :class="{ on: filter === tab.key }"
          @tap="filter = tab.key"
        >{{ t(tab.labelKey) }}</text>
      </view>
    </scroll-view>
    <view v-if="loading" class="state-panel card">
      <text class="state-title">{{ t('orders.loading') }}</text>
      <text>{{ t('orders.loadingHint') }}</text>
    </view>
    <view v-else-if="error" class="state-panel error-panel">
      <text class="state-title">{{ t('orders.loadFail') }}</text>
      <text>{{ error }}</text>
      <button class="secondary-button retry" @tap="load">{{ t('orders.retry') }}</button>
    </view>
    <view v-else-if="filtered.length === 0" class="state-panel card">
      <text class="state-title">{{ t('orders.empty') }}</text>
      <text>{{ t('orders.emptyHint') }}</text>
      <button class="primary-button create" @tap="createOrder">{{ t('orders.goShip') }}</button>
    </view>
    <view v-else class="order-list">
      <view v-for="order in filtered" :key="order.id" class="order-row card" @tap="open(order.id)">
        <view class="row-head">
          <text class="order-no">{{ order.orderNo }}</text>
          <text class="status-badge">{{ statusLabel(order.status) }}</text>
        </view>
        <view class="route-line"><view class="route-dot" /><view class="route-bar" /><view class="route-dot end" /></view>
        <view class="row-meta">
          <text>{{ order.shipment?.shipmentNo ?? t('orders.pendingShip') }}</text>
          <text>{{ formatTime(order.createdAt) }}</text>
        </view>
        <view class="row-foot">
          <text>{{ serviceTypeLabel(order.serviceType) }}</text>
          <text class="money">{{ money(order.estimatedFee, order.currency) }}</text>
        </view>
      </view>
    </view>
    <AppTabBar active="orders" :items="bottomTabs" @select="selectTab" />
  </view>
</template>

<style scoped>
.orders-page { background: var(--km-bg); }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 20rpx; background: var(--km-surface); flex-shrink: 0; }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.topbar-placeholder { width: 60rpx; }
.orders-page .summary-strip,
.orders-page .state-panel { flex-shrink: 0; }
.orders-page .order-list { flex: 1 1 0%; min-height: 0; overflow-y: auto; padding: 0 0 calc(var(--km-tabbar-space) + 16px); -webkit-overflow-scrolling: touch; }
.back { width: 52rpx; font-size: 36rpx; font-weight: 800; }
.summary-strip { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; margin: 0 28rpx; background: var(--km-surface); color: var(--km-text); }
.summary-number,.summary-label { display: block; }
.summary-number { font-size: 40rpx; font-weight: 600; letter-spacing: -0.04em; }
.summary-label { margin-top: 3rpx; color: var(--km-text-secondary); font-size: 20rpx; }
.filter-scroll { margin: 12rpx 0 4rpx; white-space: nowrap; }
.filter-row { display: inline-flex; gap: 12rpx; padding: 0 28rpx 8rpx; }
.filter-chip {
  display: inline-block; padding: 12rpx 22rpx; border-radius: 999rpx; font-size: 22rpx;
  color: var(--km-text-secondary); background: var(--km-surface); border: 1rpx solid var(--km-border);
}
.filter-chip.on {
  color: var(--km-primary); border-color: var(--km-primary);
  background: color-mix(in srgb, var(--km-primary) 12%, var(--km-surface));
  font-weight: 600;
}
.order-list { margin-top: 12rpx; padding: 0 28rpx; }
.order-row { margin-bottom: 18rpx; padding: 28rpx; }
.row-head,.row-meta,.row-foot { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.order-no { font-size: 25rpx; font-weight: 600; }
.route-line { display: flex; align-items: center; margin: 30rpx 8rpx 20rpx; }
.route-dot { width: 18rpx; height: 18rpx; border: 5rpx solid var(--km-primary); border-radius: 50%; }
.route-dot.end { border-color: color-mix(in srgb, var(--km-primary) 45%, var(--km-surface)); }
.route-bar { flex: 1; height: 2px; background: linear-gradient(90deg, var(--km-primary), color-mix(in srgb, var(--km-primary) 30%, var(--km-surface))); }
.row-meta { color: var(--km-text-muted); font-size: 20rpx; }
.row-foot { margin-top: 22rpx; padding-top: 20rpx; border-top: 1rpx dashed var(--km-divider); color: var(--km-text-secondary); font-size: 23rpx; }
.money { color: var(--km-primary); font-weight: 600; }
.retry,.create { width: 260rpx; margin-top: 24rpx; }
</style>
