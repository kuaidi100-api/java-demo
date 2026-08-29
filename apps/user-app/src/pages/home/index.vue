<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { OrderSummary } from '@express-platform/shared-types';
import { useAuthStore, requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, formatTime, money, statusLabel } from '../../utils/presentation';

const auth = useAuthStore();
const orders = ref<OrderSummary[]>([]);
const loading = ref(true);
const loadError = ref('');
const trackingQuery = ref('');

onShow(() => {
  if (requireUserSession()) void loadOrders();
});

async function loadOrders(): Promise<void> {
  loading.value = true;
  loadError.value = '';
  try {
    orders.value = await userApi.orders();
  } catch (cause: unknown) {
    loadError.value = errorMessage(cause);
  } finally {
    loading.value = false;
  }
}

function openCreate(service = 'EXPRESS'): void {
  uni.navigateTo({ url: `/pages/order-create/index?service=${service}` });
}

function openOrder(id: string): void {
  uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(id)}` });
}

function openOrders(): void {
  uni.navigateTo({ url: '/pages/orders/index' });
}

function queryTracking(): void {
  const keyword = trackingQuery.value.trim().toUpperCase();
  if (!keyword) {
    uni.showToast({ title: '请输入订单号或运单号', icon: 'none' });
    return;
  }
  const found = orders.value.find((order) =>
    order.orderNo.toUpperCase() === keyword || order.shipment?.shipmentNo.toUpperCase() === keyword,
  );
  if (!found) {
    uni.showToast({ title: '当前账号下未找到该订单', icon: 'none' });
    return;
  }
  openOrder(found.id);
}
</script>

<template>
  <view class="page home-page">
    <view class="topbar home-topbar">
      <view>
        <text class="hello">你好，{{ auth.subject?.displayName ?? '木棉用户' }}</text>
        <text class="service-area">定位 · 万象测试服务区</text>
      </view>
      <view class="mock-pill">● 模拟环境</view>
    </view>

    <view class="hero-card" @tap="openCreate('EXPRESS')">
      <view class="hero-copy">
        <text class="hero-kicker">DOOR TO DOOR</text>
        <text class="hero-title">现在寄件</text>
        <text class="hero-text">地址、物品、上门时间，一次完成</text>
        <view class="hero-action">开始填写 <text>→</text></view>
      </view>
      <view class="parcel-visual">
        <view class="parcel-top" />
        <view class="parcel-body"><text>KM</text></view>
        <view class="route-dot dot-a" />
        <view class="route-dot dot-b" />
      </view>
    </view>

    <view class="tracking-card card">
      <text class="tracking-title">查快递</text>
      <view class="tracking-row">
        <input v-model.trim="trackingQuery" class="tracking-input" placeholder="输入订单号 / 运单号" @confirm="queryTracking" />
        <button class="tracking-button" @tap="queryTracking">查询</button>
      </view>
    </view>

    <view class="service-grid">
      <view class="service-card pickup" @tap="openCreate('PICKUP')">
        <view class="service-icon">取</view>
        <text class="service-name">上门取件</text>
        <text class="service-desc">预约时间，安心等候</text>
      </view>
      <view class="service-card city" @tap="openCreate('INTRACITY')">
        <view class="service-icon">跑</view>
        <text class="service-name">同城跑腿</text>
        <text class="service-desc">同城急送，轨迹可查</text>
      </view>
    </view>

    <view class="section-title">
      <text>最近订单</text>
      <text class="section-link" @tap="openOrders">查看全部</text>
    </view>
    <view v-if="loading" class="card order-skeleton">
      <view class="skeleton-line wide" /><view class="skeleton-line" /><view class="skeleton-line short" />
    </view>
    <view v-else-if="loadError" class="state-panel error-panel">
      <text class="state-title">订单加载失败</text>
      <text>{{ loadError }}</text>
      <button class="secondary-button retry" @tap="loadOrders">重新加载</button>
    </view>
    <view v-else-if="orders.length === 0" class="state-panel card">
      <text class="state-title">还没有寄件记录</text>
      <text>完成第一笔模拟寄件，状态会实时出现在这里。</text>
      <button class="secondary-button retry" @tap="openCreate('EXPRESS')">创建第一单</button>
    </view>
    <view v-else class="recent-list">
      <view v-for="order in orders.slice(0, 3)" :key="order.id" class="order-card card" @tap="openOrder(order.id)">
        <view class="order-head">
          <view>
            <text class="order-no">{{ order.orderNo }}</text>
            <text class="order-time">{{ formatTime(order.createdAt) }}</text>
          </view>
          <text class="status-badge">{{ statusLabel[order.status] }}</text>
        </view>
        <view class="order-foot">
          <text>{{ order.serviceType === 'INTRACITY' ? '同城跑腿' : order.serviceType === 'PICKUP' ? '上门取件' : '标准寄件' }}</text>
          <text class="order-money">{{ money(order.estimatedFee, order.currency) }}</text>
        </view>
      </view>
    </view>

    <view class="service-note card">
      <view class="note-mark">i</view>
      <view>
        <text class="note-title">当前为开发演示</text>
        <text class="note-text">订单、运单与轨迹均由 MockLogisticsProvider 生成，不会触发真实寄件或收费。</text>
      </view>
    </view>
    <button class="logout-link" @tap="auth.logout">退出当前账号</button>
  </view>
</template>

<style scoped>
.home-page { padding-top: 38rpx; }
.home-topbar { align-items: flex-start; }
.hello, .service-area, .hero-kicker, .hero-title, .hero-text, .tracking-title, .service-name, .service-desc, .order-no, .order-time, .note-title, .note-text { display: block; }
.hello { font-size: 37rpx; font-weight: 900; }
.service-area { margin-top: 10rpx; color: #766e66; font-size: 23rpx; }
.hero-card { position: relative; min-height: 300rpx; overflow: hidden; padding: 42rpx; border-radius: 34rpx; color: #fff; background: linear-gradient(135deg, #f67b3c 0%, #ec5d28 58%, #d94c1e 100%); box-shadow: 0 22rpx 44rpx rgba(218, 76, 28, .25); }
.hero-copy { position: relative; z-index: 2; width: 64%; }
.hero-kicker { font-size: 18rpx; letter-spacing: 3rpx; opacity: .78; font-weight: 800; }
.hero-title { margin-top: 16rpx; font-size: 51rpx; font-weight: 900; }
.hero-text { margin-top: 12rpx; font-size: 23rpx; opacity: .86; line-height: 1.55; }
.hero-action { display: inline-flex; gap: 18rpx; align-items: center; margin-top: 30rpx; padding: 14rpx 22rpx; border-radius: 999rpx; color: #d95720; background: #fff; font-size: 23rpx; font-weight: 800; }
.parcel-visual { position: absolute; right: 24rpx; bottom: 20rpx; width: 210rpx; height: 220rpx; transform: rotate(-4deg); }
.parcel-body { position: absolute; right: 18rpx; bottom: 10rpx; display: grid; place-items: center; width: 146rpx; height: 132rpx; background: #f4d0a5; border-radius: 10rpx 10rpx 26rpx 26rpx; box-shadow: inset -20rpx -10rpx 0 rgba(152, 84, 38, .12); }
.parcel-body text { color: #ac4c25; font-weight: 900; letter-spacing: 4rpx; }
.parcel-top { position: absolute; z-index: 1; right: 8rpx; bottom: 130rpx; width: 168rpx; height: 56rpx; background: #ffe1bd; transform: skewX(-18deg); border-radius: 10rpx; }
.route-dot { position: absolute; width: 18rpx; height: 18rpx; border: 5rpx solid rgba(255,255,255,.65); border-radius: 50%; }
.dot-a { left: 6rpx; top: 24rpx; }.dot-b { right: 4rpx; top: 0; }
.tracking-card { margin-top: 24rpx; padding: 28rpx; }
.tracking-title { margin-bottom: 18rpx; font-size: 28rpx; font-weight: 900; }
.tracking-row { display: flex; gap: 14rpx; }
.tracking-input { flex: 1; height: 76rpx; padding: 0 22rpx; border-radius: 18rpx; background: #f3efe9; font-size: 25rpx; }
.tracking-button { width: 130rpx; height: 76rpx; line-height: 76rpx; border-radius: 18rpx; color: #fff; background: #27231f; font-size: 25rpx; font-weight: 800; }
.service-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; margin-top: 22rpx; }
.service-card { min-height: 210rpx; padding: 28rpx; border-radius: 28rpx; }
.pickup { background: linear-gradient(145deg, #fff5dc, #ffe9b7); }.city { background: linear-gradient(145deg, #e9f5ef, #cfe8db); }
.service-icon { display: grid; place-items: center; width: 62rpx; height: 62rpx; border-radius: 20rpx; color: #fff; background: #dc8a28; font-weight: 900; }
.city .service-icon { background: #39836b; }
.service-name { margin-top: 24rpx; font-size: 29rpx; font-weight: 900; }
.service-desc { margin-top: 8rpx; color: #75695e; font-size: 21rpx; }
.section-link { color: #de6028; font-size: 23rpx; font-weight: 700; }
.order-card { margin-bottom: 18rpx; padding: 28rpx; }
.order-head, .order-foot { display: flex; justify-content: space-between; gap: 18rpx; }
.order-no { font-size: 25rpx; font-weight: 900; }.order-time { margin-top: 8rpx; color: #8a8179; font-size: 20rpx; }
.order-foot { margin-top: 30rpx; padding-top: 22rpx; border-top: 1px dashed #e5ddd5; color: #6e665f; font-size: 23rpx; }
.order-money { color: #302b27; font-weight: 900; }
.order-skeleton { padding: 30rpx; }.skeleton-line { width: 65%; height: 24rpx; margin-bottom: 18rpx; border-radius: 999rpx; background: linear-gradient(90deg,#eee7df,#faf7f2,#eee7df); }.skeleton-line.wide { width: 90%; }.skeleton-line.short { width: 42%; margin: 0; }
.retry { width: 240rpx; margin-top: 24rpx; }
.service-note { display: flex; gap: 20rpx; margin-top: 34rpx; padding: 28rpx; }
.note-mark { flex: none; display: grid; place-items: center; width: 46rpx; height: 46rpx; border-radius: 50%; color: #fff; background: #ee6b31; font-weight: 900; }
.note-title { font-size: 24rpx; font-weight: 900; }.note-text { margin-top: 8rpx; color: #756d65; font-size: 21rpx; line-height: 1.6; }
.logout-link { margin-top: 26rpx; color: #8a8178; background: transparent; font-size: 23rpx; }
</style>
