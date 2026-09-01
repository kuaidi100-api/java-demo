<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { OrderAction, OrderStatus, type OrderDetail } from '@express-platform/shared-types';
import { courierApi } from '../../services/api';
import { requireCourier } from '../../stores/auth';
import { errorMessage, formatTime, statusLabel } from '../../utils';

const id = ref('');
const order = ref<OrderDetail | null>(null);
const loading = ref(true);
const error = ref('');
const acting = ref(false);

onLoad((q) => {
  id.value = typeof q?.id === 'string' ? q.id : '';
});
onShow(() => {
  if (requireCourier()) void load();
});

const sender = computed(() => order.value?.addresses.find((a) => a.type === 'SENDER'));
const recipient = computed(() => order.value?.addresses.find((a) => a.type === 'RECIPIENT'));
const next = computed<{ action: OrderAction; label: string; hint: string } | null>(() => {
  switch (order.value?.status) {
    case OrderStatus.PENDING_ACCEPTANCE:
      return { action: OrderAction.ACCEPT, label: '确认接单', hint: '接单后任务将绑定到当前配送员' };
    case OrderStatus.ACCEPTED:
      return { action: OrderAction.START_PICKUP, label: '出发取件', hint: '状态将更新为取件中' };
    case OrderStatus.PICKING_UP:
      return { action: OrderAction.CONFIRM_PICKUP, label: '确认已取件', hint: '请核对物品后操作' };
    case OrderStatus.PICKED_UP:
      return { action: OrderAction.START_TRANSIT, label: '开始配送', hint: '将生成配送中轨迹' };
    case OrderStatus.IN_TRANSIT:
      return { action: OrderAction.CONFIRM_DELIVERY, label: '确认送达', hint: '签收凭证功能将在下一批接入' };
    default:
      return null;
  }
});

function coord(address?: { latitude?: number | null; longitude?: number | null } | null): string {
  if (!address || address.latitude == null || address.longitude == null) return '无地图坐标';
  const lat = Number(address.latitude);
  const lng = Number(address.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '无地图坐标';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function openMap(address?: { latitude?: number | null; longitude?: number | null; detail?: string } | null): void {
  if (!address || address.latitude == null || address.longitude == null) {
    uni.showToast({ title: '该地址暂无地图坐标', icon: 'none' });
    return;
  }
  const lat = Number(address.latitude);
  const lng = Number(address.longitude);
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
    return;
  }
  uni.setClipboardData({ data: `${address.detail || ''} ${lat},${lng}` });
  uni.showToast({ title: '坐标已复制，可粘贴到地图 App', icon: 'none' });
}

async function load(): Promise<void> {
  if (!id.value) {
    error.value = '缺少订单 ID';
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    order.value = await courierApi.order(id.value);
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    loading.value = false;
  }
}

async function act(): Promise<void> {
  if (!order.value || !next.value || acting.value) return;
  acting.value = true;
  try {
    order.value = await courierApi.act(order.value.id, {
      action: next.value.action,
      reason: `配送员端：${next.value.label}`,
    });
    uni.showToast({ title: '状态更新成功', icon: 'success' });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2500 });
  } finally {
    acting.value = false;
  }
}

async function reject(): Promise<void> {
  if (!order.value || acting.value) return;
  acting.value = true;
  try {
    order.value = await courierApi.reject(order.value.id, '物品不符/严重超重');
    uni.showToast({ title: '已退单并记账退款', icon: 'success' });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2500 });
  } finally {
    acting.value = false;
  }
}

async function collect(): Promise<void> {
  if (!order.value || acting.value) return;
  acting.value = true;
  try {
    order.value = await courierApi.collect(order.value.id);
    uni.showToast({ title: '已确认收款', icon: 'success' });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2500 });
  } finally {
    acting.value = false;
  }
}

function back(): void {
  uni.navigateBack();
}
</script>

<template>
  <view class="page">
    <view class="topbar">
      <text class="back" @tap="back">←</text>
      <text class="topbar-title">配送任务</text>
      <text class="mock-pill">模拟环境</text>
    </view>
    <view v-if="loading" class="state-panel card">
      <text class="state-title">正在加载任务</text>
      <text>校验配送员身份与订单状态…</text>
    </view>
    <view v-else-if="error" class="state-panel error-panel">
      <text class="state-title">任务加载失败</text>
      <text>{{ error }}</text>
      <button class="secondary-button retry" @tap="load">重试</button>
    </view>
    <template v-else-if="order">
      <view class="status-hero">
        <text class="status-label">CURRENT TASK</text>
        <text class="status-title">{{ statusLabel[order.status] }}</text>
        <text class="order-no">{{ order.orderNo }}</text>
      </view>
      <view class="section-title">取送路线（含地图）</view>
      <view class="route-card card">
        <view class="address">
          <i class="from">取</i>
          <view>
            <text class="name">{{ sender?.contactName }} · {{ sender?.phone }}</text>
            <text class="detail">{{ sender?.city }} {{ sender?.district }} {{ sender?.detail }}</text>
            <text class="coords">地图 {{ coord(sender) }}</text>
            <text class="map-btn" @tap="openMap(sender)">打开取件地图</text>
          </view>
        </view>
        <view class="stem" />
        <view class="address">
          <i>送</i>
          <view>
            <text class="name">{{ recipient?.contactName }} · {{ recipient?.phone }}</text>
            <text class="detail">{{ recipient?.city }} {{ recipient?.district }} {{ recipient?.detail }}</text>
            <text class="coords">地图 {{ coord(recipient) }}</text>
            <text class="map-btn" @tap="openMap(recipient)">打开送达地图</text>
          </view>
        </view>
      </view>
      <view class="section-title">任务信息</view>
      <view class="info-card card">
        <view><text>预约上门</text><strong>{{ formatTime(order.scheduledPickupAt) }}</strong></view>
        <view><text>物品</text><strong>{{ order.items[0]?.name }} · {{ order.items[0]?.weightKg }} kg</strong></view>
        <view><text>运单</text><strong>{{ order.shipment?.shipmentNo ?? '待生成' }}</strong></view>
      </view>
      <view v-if="next" class="action-dock card">
        <view>
          <text class="action-hint">下一步</text>
          <text class="action-copy">{{ next.hint }}</text>
        </view>
        <button class="primary-button" :loading="acting" :disabled="acting" @tap="act">
          {{ acting ? '正在更新…' : next.label }}
        </button>
      </view>
      <view v-if="order.status === 'PICKING_UP' || order.status === 'ACCEPTED'" class="action-dock card">
        <text class="action-copy">现场超重可异常退单</text>
        <button class="secondary-button" :disabled="acting" @tap="reject">异常退单</button>
      </view>
      <view v-if="order.status === 'DELIVERED' || order.status === 'IN_TRANSIT'" class="action-dock card">
        <text class="action-copy">现金直接确认；微信/支付宝请先上传截图</text>
        <button class="primary-button" :disabled="acting" @tap="collect">确认已收款</button>
      </view>
      <view
        v-if="!next && order.status !== 'DELIVERED' && order.status !== 'IN_TRANSIT'"
        class="state-panel card done"
      >
        <text class="state-title">当前没有可执行动作</text>
        <text>订单已送达、完成、取消或异常，请等待用户/管理员处理。</text>
      </view>
    </template>
  </view>
</template>

<style scoped>
.back { width: 52rpx; font-size: 36rpx; font-weight: 800; }
.status-hero {
  padding: 36rpx; border-radius: 24rpx; color: #1a1a1a;
  background: linear-gradient(145deg, #e8f4fd, #c5e3f7);
}
.status-label, .status-title, .order-no, .name, .detail, .coords, .map-btn, .action-hint, .action-copy { display: block; }
.status-label { font-size: 17rpx; letter-spacing: 3rpx; color: #2196f3; }
.status-title { margin-top: 13rpx; font-size: 43rpx; font-weight: 800; }
.order-no { margin-top: 11rpx; font-size: 21rpx; color: #666; }
.section-title { margin: 30rpx 4rpx 16rpx; font-size: 28rpx; font-weight: 800; }
.route-card { padding: 28rpx; }
.address { display: flex; gap: 18rpx; }
.address i {
  flex: none; display: grid; place-items: center; width: 50rpx; height: 50rpx;
  border-radius: 16rpx; color: #fff; background: #90caf9; font-style: normal; font-size: 19rpx; font-weight: 800;
}
.address i.from { background: #4caf50; }
.name { font-size: 24rpx; font-weight: 800; }
.detail { margin-top: 7rpx; color: #666; font-size: 20rpx; line-height: 1.5; }
.coords { margin-top: 8rpx; color: #0369a1; font-size: 20rpx; font-weight: 600; }
.map-btn { margin-top: 8rpx; color: #2563eb; font-size: 22rpx; font-weight: 700; }
.stem { width: 2px; height: 30rpx; margin: 4rpx 0 4rpx 24rpx; background: #bbdefb; }
.info-card { padding: 8rpx 26rpx; }
.info-card view {
  display: flex; justify-content: space-between; gap: 20rpx; padding: 22rpx 0;
  border-bottom: 1px solid #f5f5f5; font-size: 21rpx;
}
.info-card view:last-child { border: 0; }
.info-card text { color: #666; }
.info-card strong { text-align: right; }
.action-dock {
  display: flex; align-items: center; justify-content: space-between; gap: 24rpx;
  margin-top: 24rpx; padding: 24rpx;
}
.action-dock button { width: 270rpx; margin: 0; }
.action-hint { color: #888; font-size: 19rpx; }
.action-copy { margin-top: 6rpx; font-size: 21rpx; font-weight: 800; }
.done { margin-top: 24rpx; }
.retry { width: 220rpx; margin-top: 20rpx; }
</style>
