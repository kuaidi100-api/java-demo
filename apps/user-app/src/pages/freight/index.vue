<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { backOrHome } from '../../utils/navigation';
import { errorMessage } from '../../utils/presentation';
import SupportContactBtn from '../../components/support/SupportContactBtn.vue';

type Warehouse = {
  channel: 'NEXT_DAY' | 'ECONOMY';
  channelCode: number;
  name: string;
  eta: string;
  pricing: string;
  receiverPrefix: string;
  phone: string;
  address: string;
};

const warehouses = ref<Warehouse[]>([]);
const channel = ref<1 | 2>(1);
const trackingNo = ref('');
const remark = ref('');
const nickname = ref('客户');
const submitting = ref(false);
const cs = { phone: '+8562076917777', wechat: 'yang629yang88' };

onMounted(async () => {
  try {
    const catalog = await userApi.catalog() as {
      warehouses?: Warehouse[];
      customerService?: { phone: string; wechat: string };
    };
    warehouses.value = catalog.warehouses ?? [];
    if (catalog.customerService) Object.assign(cs, catalog.customerService);
  } catch {
    warehouses.value = [
      { channel: 'NEXT_DAY', channelCode: 1, name: '隔日达（特快）', eta: '当日 9:00 前入库当天达', pricing: '首重 20元/1KG，续重 15元/1KG', receiverPrefix: '木棉', phone: '13759252329', address: '云南省西双版纳傣族自治州勐腊县曼庄路平特卫仓库' },
      { channel: 'ECONOMY', channelCode: 2, name: '普快（经济）', eta: '3-4天送达', pricing: '首重 15元/1KG，续重 10元/1KG', receiverPrefix: '木棉', phone: '15334301527', address: '云南省西双版纳傣族自治州勐腊县曼庄路AM国际木棉快递' },
    ];
  }
});

const current = () => warehouses.value.find((item) => item.channelCode === channel.value) ?? warehouses.value[0];

function copyWarehouse(): void {
  const item = current();
  if (!item) return;
  const text = `收件人：${item.receiverPrefix}+${nickname.value}\n电话：${item.phone}\n地址：${item.address}`;
  uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制仓地址', icon: 'success' }) });
}

async function submit(): Promise<void> {
  if (!trackingNo.value.trim()) { uni.showToast({ title: '请填写国内快递单号', icon: 'none' }); return; }
  if (!requireUserSession()) return;
  submitting.value = true;
  try {
    const order = await userApi.forecastFreight({
      channel: channel.value,
      domesticTrackingNo: trackingNo.value.trim(),
      remark: remark.value || undefined,
    });
    uni.showToast({ title: '预报成功，待仓内称重', icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2800 });
  } finally {
    submitting.value = false;
  }
}

async function claim(): Promise<void> {
  if (!trackingNo.value.trim()) { uni.showToast({ title: '请输入要认领的单号', icon: 'none' }); return; }
  if (!requireUserSession()) return;
  try {
    const order = await userApi.claimParcel(trackingNo.value.trim());
    uni.showToast({ title: '认领成功', icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  }
}

function goBack(): void { backOrHome(); }
</script>

<template>
  <view class="page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">跨境集运预报</text>
      <text class="topbar-placeholder" />
    </view>
    <view class="hero">
      <text class="hero-title">先预报，仓内称重后再付</text>
      <text class="hero-desc">复制对应渠道收件信息到淘宝/京东下单，发货后回来填写国内单号。</text>
    </view>
    <view class="chips">
      <text class="chip" :class="{ on: channel === 1 }" @tap="channel = 1">隔日达</text>
      <text class="chip" :class="{ on: channel === 2 }" @tap="channel = 2">普快</text>
    </view>
    <view v-if="current()" class="card">
      <text class="name">{{ current()?.name }}</text>
      <text class="meta">{{ current()?.eta }}</text>
      <text class="meta">{{ current()?.pricing }}</text>
      <text class="meta">收件人：{{ current()?.receiverPrefix }}+{{ nickname }}</text>
      <text class="meta">电话：{{ current()?.phone }}</text>
      <text class="meta">地址：{{ current()?.address }}</text>
      <view class="copy" @tap="copyWarehouse">一键复制仓地址</view>
    </view>
    <view class="card">
      <text class="label">国内快递单号</text>
      <input v-model.trim="trackingNo" class="input" placeholder="电商发货后的国内单号" />
      <text class="label">备注</text>
      <input v-model.trim="remark" class="input" placeholder="选填" />
    </view>
    <view class="submit" :class="{ disabled: submitting }" @tap="submit">{{ submitting ? '提交中…' : '提交预报（不扣费）' }}</view>
    <view class="ghost" @tap="claim">忘记预报？用单号认领无主件</view>
    <view class="cs-wrap">
      <SupportContactBtn business="EXPRESS" />
      <text class="cs-phone">{{ cs.phone }} · 微信 {{ cs.wechat }}</text>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 40rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 20rpx; background: var(--km-surface); }
.back { font-size: 44rpx; width: 60rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; }
.topbar-placeholder { width: 60rpx; }
.hero { margin: 24rpx 28rpx; padding: 32rpx; border-radius: 24rpx; background: var(--km-surface); color: var(--km-text); border: 1rpx solid rgba(17,24,39,.06); }
.hero-title { display: block; font-size: 34rpx; font-weight: 600; letter-spacing: -0.03em; }
.hero-desc { display: block; margin-top: 10rpx; font-size: 24rpx; color: var(--km-text-secondary); }
.chips { display: flex; gap: 16rpx; margin: 0 28rpx 16rpx; }
.chip { padding: 12rpx 28rpx; border-radius: 999rpx; background: var(--km-surface); color: var(--km-text-secondary); }
.chip.on { background: #e3f2fd; color: #2196f3; font-weight: 700; }
.card { margin: 0 28rpx 20rpx; padding: 24rpx; background: var(--km-surface); border-radius: 20rpx; box-shadow: 0 4rpx 14rpx rgba(0,0,0,.05); }
.name { display: block; font-size: 28rpx; font-weight: 600; }
.meta, .label { display: block; margin-top: 10rpx; color: var(--km-text-secondary); font-size: 24rpx; line-height: 1.6; }
.copy, .submit { margin-top: 20rpx; height: 80rpx; line-height: 80rpx; text-align: center; border-radius: 16rpx; background: var(--km-primary); color: #fff; font-weight: 600; }
.submit { margin: 0 28rpx; }
.submit.disabled { opacity: 0.6; }
.input { width: 100%; height: 72rpx; margin-top: 8rpx; padding: 0 16rpx; background: var(--km-surface-sunken); border-radius: 12rpx; }
.ghost, .cs { margin: 20rpx 28rpx; text-align: center; color: var(--km-text-muted); font-size: 24rpx; }
.cs-wrap { margin: 24rpx 28rpx; display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.cs-phone { font-size: 22rpx; color: var(--km-text-muted); }
</style>
