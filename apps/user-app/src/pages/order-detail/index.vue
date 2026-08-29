<script setup lang="ts">
import { computed, ref } from 'vue';
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app';
import { OrderAction, OrderStatus, type OrderDetail } from '@express-platform/shared-types';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, formatTime, money, statusLabel } from '../../utils/presentation';

const orderId = ref('');
const order = ref<OrderDetail | null>(null);
const loading = ref(true);
const refreshing = ref(false);
const acting = ref(false);
const error = ref('');
let poller: ReturnType<typeof setInterval> | null = null;

const sender = computed(() => order.value?.addresses.find((address) => address.type === 'SENDER'));
const recipient = computed(() => order.value?.addresses.find((address) => address.type === 'RECIPIENT'));
const canComplete = computed(() => order.value?.status === OrderStatus.DELIVERED);

onLoad((query) => {
  orderId.value = typeof query?.id === 'string' ? query.id : '';
});
onShow(() => {
  if (!requireUserSession()) return;
  void load(false);
  startPolling();
});
onHide(stopPolling);
onUnload(stopPolling);

function startPolling(): void {
  stopPolling();
  poller = setInterval(() => void load(true), 10_000);
}
function stopPolling(): void {
  if (poller) clearInterval(poller);
  poller = null;
}

async function load(silent: boolean): Promise<void> {
  if (!orderId.value) {
    error.value = '缺少订单 ID';
    loading.value = false;
    return;
  }
  if (silent) refreshing.value = true;
  else loading.value = true;
  if (!silent) error.value = '';
  try {
    order.value = await userApi.order(orderId.value);
  } catch (cause: unknown) {
    if (!silent) error.value = errorMessage(cause);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function completeOrder(): Promise<void> {
  if (!order.value || acting.value) return;
  acting.value = true;
  try {
    order.value = await userApi.act(order.value.id, { action: OrderAction.COMPLETE, reason: '用户确认签收完成' });
    uni.showToast({ title: '已确认完成', icon: 'success' });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2400 });
  } finally {
    acting.value = false;
  }
}

function goBack(): void {
  uni.navigateBack();
}
</script>

<template>
  <view class="page detail-page">
    <view class="topbar"><text class="back" @tap="goBack">←</text><text class="topbar-title">订单详情</text><text class="mock-pill">模拟环境</text></view>
    <view v-if="loading" class="state-panel card"><text class="state-title">正在同步订单</text><text>从业务后端读取状态与轨迹…</text></view>
    <view v-else-if="error" class="state-panel error-panel"><text class="state-title">订单加载失败</text><text>{{ error }}</text><button class="secondary-button retry" @tap="load(false)">重新加载</button></view>
    <template v-else-if="order">
      <view class="status-hero">
        <view><text class="status-kicker">CURRENT STATUS</text><text class="status-title">{{ statusLabel[order.status] }}</text><text class="status-copy">状态每 10 秒自动同步，也可手动刷新</text></view>
        <view :class="['sync-icon',{spinning:refreshing}]" @tap="load(true)">↻</view>
      </view>
      <view class="order-reference card"><view><text class="ref-label">订单号</text><text class="ref-value">{{ order.orderNo }}</text></view><view><text class="ref-label">运单号</text><text class="ref-value">{{ order.shipment?.shipmentNo ?? '调度后生成' }}</text></view></view>

      <view class="section-title"><text>寄收信息</text></view>
      <view class="route-card card">
        <view class="route-address"><view class="route-pin sender-pin">寄</view><view><text class="address-main">{{ sender?.contactName }} · {{ sender?.phone }}</text><text class="address-sub">{{ sender?.city }} {{ sender?.district }} {{ sender?.detail }}</text></view></view>
        <view class="route-stem" />
        <view class="route-address"><view class="route-pin recipient-pin">收</view><view><text class="address-main">{{ recipient?.contactName }} · {{ recipient?.phone }}</text><text class="address-sub">{{ recipient?.city }} {{ recipient?.district }} {{ recipient?.detail }}</text></view></view>
      </view>

      <view class="section-title"><text>物流轨迹</text><text class="live-label">● 自动同步</text></view>
      <view class="timeline card">
        <view v-if="!order.shipment?.trackingEvents.length" class="state-panel"><text class="state-title">等待生成物流轨迹</text><text>管理员完成调度后，Mock Provider 会创建运单。</text></view>
        <view v-for="(event,index) in [...(order.shipment?.trackingEvents ?? [])].reverse()" v-else :key="event.id" :class="['timeline-item',{latest:index===0}]">
          <view class="timeline-axis"><view class="timeline-dot" /><view class="timeline-line" /></view>
          <view><text class="event-status">{{ statusLabel[event.status] }}</text><text class="event-description">{{ event.description }}</text><text class="event-time">{{ formatTime(event.occurredAt) }}</text></view>
        </view>
      </view>

      <view class="section-title"><text>订单信息</text></view>
      <view class="info-card card">
        <view class="info-row"><text>服务类型</text><text>{{ order.serviceType }}</text></view>
        <view class="info-row"><text>物品</text><text>{{ order.items[0]?.name }} · {{ order.items[0]?.weightKg }} kg</text></view>
        <view class="info-row"><text>预约上门</text><text>{{ formatTime(order.scheduledPickupAt) }}</text></view>
        <view class="info-row total"><text>预估费用</text><text>{{ money(order.estimatedFee, order.currency) }}</text></view>
      </view>

      <view class="section-title"><text>完整状态日志</text><text class="log-count">{{ order.statusLogs.length }} 条</text></view>
      <view class="log-card card"><view v-for="log in [...order.statusLogs].reverse()" :key="log.id" class="log-row"><text>{{ statusLabel[log.toStatus] }}</text><text>{{ log.reason ?? '状态更新' }}</text><text>{{ formatTime(log.createdAt) }}</text></view></view>
      <button v-if="canComplete" class="primary-button complete" :loading="acting" :disabled="acting" @tap="completeOrder">{{ acting ? '正在确认…' : '确认签收完成' }}</button>
    </template>
  </view>
</template>

<style scoped>
.back { width: 52rpx; font-size: 36rpx; font-weight: 800; }.status-hero { display: flex; align-items: center; justify-content: space-between; margin: 10rpx 0 22rpx; padding: 38rpx 34rpx; border-radius: 30rpx; color: #fff; background: linear-gradient(135deg,#2e2a26,#484038); }.status-kicker,.status-title,.status-copy,.ref-label,.ref-value,.address-main,.address-sub,.event-status,.event-description,.event-time { display: block; }.status-kicker { color: #e8a37e; font-size: 18rpx; letter-spacing: 3rpx; }.status-title { margin-top: 12rpx; font-size: 45rpx; font-weight: 900; }.status-copy { margin-top: 10rpx; color: #d8d0c8; font-size: 20rpx; }.sync-icon { display: grid; place-items: center; width: 72rpx; height: 72rpx; border-radius: 50%; background: rgba(255,255,255,.11); font-size: 38rpx; }.spinning { opacity: .55; }.order-reference { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; padding: 26rpx; }.order-reference>view+view { padding-left: 22rpx; border-left: 1px solid #e9e1d9; }.ref-label { color: #8b8178; font-size: 20rpx; }.ref-value { margin-top: 8rpx; font-size: 21rpx; font-weight: 800; word-break: break-all; }.route-card { padding: 28rpx; }.route-address { display: flex; gap: 20rpx; }.route-pin { flex: none; display: grid; place-items: center; width: 52rpx; height: 52rpx; border-radius: 17rpx; color: #fff; font-size: 21rpx; font-weight: 900; }.sender-pin { background: #ed6a32; }.recipient-pin { background: #38332e; }.route-stem { width: 2px; height: 34rpx; margin: 4rpx 0 4rpx 25rpx; background: #d9cfc6; }.address-main { font-size: 25rpx; font-weight: 900; }.address-sub { margin-top: 8rpx; color: #766e66; font-size: 21rpx; line-height: 1.5; }.live-label { color: #3c856d; font-size: 20rpx; }.timeline { padding: 28rpx; }.timeline-item { display: flex; gap: 20rpx; min-height: 120rpx; }.timeline-axis { display: flex; flex-direction: column; align-items: center; }.timeline-dot { width: 18rpx; height: 18rpx; margin-top: 5rpx; border: 5rpx solid #cfc6bd; border-radius: 50%; }.timeline-item.latest .timeline-dot { border-color: #ef6a31; box-shadow: 0 0 0 8rpx #fff0e7; }.timeline-line { flex: 1; width: 2px; margin: 7rpx 0; background: #e2dad2; }.event-status { font-size: 25rpx; font-weight: 900; }.event-description { margin-top: 7rpx; color: #746c64; font-size: 21rpx; }.event-time { margin-top: 8rpx; color: #a0978e; font-size: 19rpx; }.info-card { padding: 12rpx 28rpx; }.info-row { display: flex; justify-content: space-between; gap: 24rpx; padding: 22rpx 0; border-bottom: 1px solid #eee6de; color: #766e66; font-size: 22rpx; }.info-row text:last-child { color: #302c28; text-align: right; font-weight: 700; }.info-row.total { border: 0; }.info-row.total text:last-child { color: #d95c27; font-size: 27rpx; font-weight: 900; }.log-count { color: #8e857d; font-size: 20rpx; }.log-card { padding: 12rpx 26rpx; }.log-row { display: grid; grid-template-columns: 120rpx 1fr; gap: 8rpx 14rpx; padding: 20rpx 0; border-bottom: 1px solid #eee6de; font-size: 21rpx; }.log-row text:first-child { font-weight: 800; }.log-row text:nth-child(2) { color: #726961; }.log-row text:last-child { grid-column: 2; color: #a0978e; font-size: 18rpx; }.complete { margin-top: 28rpx; }.retry { width: 240rpx; margin-top: 22rpx; }
</style>
