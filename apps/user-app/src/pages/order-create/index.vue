<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {
  ItemType,
  OrderAction,
  OrderServiceType,
  type AddressBookItem,
  type AddressInput,
  type CreateOrderInput,
  type EstimateResult,
} from '@express-platform/shared-types';
import { requireUserSession, useAuthStore } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, money } from '../../utils/presentation';
import AddressFields from '../../components/AddressFields.vue';
import { backOrHome } from '../../utils/navigation';

const serviceType = ref<OrderServiceType>(OrderServiceType.EXPRESS);
const auth = useAuthStore();
const addresses = ref<AddressBookItem[]>([]);
const loadingAddresses = ref(true);
const addressError = ref('');
const senderMode = ref<'saved' | 'new'>('saved');
const recipientMode = ref<'saved' | 'new'>('new');
const senderAddressId = ref('');
const recipientAddressId = ref('');
const estimating = ref(false);
const submitting = ref(false);
const estimate = ref<EstimateResult | null>(null);
const formError = ref('');
const showSenderForm = ref(false);
const showRecipientForm = ref(false);

function blankAddress(): AddressInput {
  return { contactName: '', phone: '', countryCode: 'LA', country: '老挝', city: '万象市', district: '', detail: '' };
}

const sender = ref<AddressInput>(blankAddress());
const recipient = reactive<AddressInput>(blankAddress());
const item = reactive({ type: ItemType.DOCUMENT, name: '文件', quantity: 1, weightKg: 0.5, notes: '' });
const pickupLocal = ref('');
const remark = ref('');
const cod = ref(false);
const insured = ref(false);
const serviceName = computed(() => serviceType.value === OrderServiceType.INTRACITY
  ? '同城跑腿'
  : serviceType.value === OrderServiceType.PICKUP ? '上门取件' : '快速寄件');

onLoad((query) => {
  const requested = query?.service;
  if (requested && Object.values(OrderServiceType).includes(requested as OrderServiceType)) {
    serviceType.value = requested as OrderServiceType;
  }
  if (auth.isAuthenticated) void loadAddresses();
  else {
    senderMode.value = 'new';
    recipientMode.value = 'new';
    loadingAddresses.value = false;
  }
});

async function loadAddresses(): Promise<void> {
  loadingAddresses.value = true;
  addressError.value = '';
  try {
    addresses.value = await userApi.addresses();
    const defaultSender = addresses.value.find((address) => address.isDefaultSender) ?? addresses.value[0];
    if (defaultSender) senderAddressId.value = defaultSender.id;
    else senderMode.value = 'new';
  } catch (cause: unknown) {
    addressError.value = errorMessage(cause);
    senderMode.value = 'new';
  } finally {
    loadingAddresses.value = false;
  }
}

function selectAddress(kind: 'sender' | 'recipient', id: string): void {
  if (kind === 'sender') senderAddressId.value = id;
  else recipientAddressId.value = id;
  estimate.value = null;
}

function validateAddress(address: AddressInput, label: string): string | null {
  if (!address.contactName || !address.city || !address.detail) return `请完整填写${label}联系人和地址`;
  if (!/^\+[1-9]\d{7,14}$/.test(address.phone)) return `${label}手机号须为国际格式`;
  return null;
}

function buildOrder(): CreateOrderInput | null {
  formError.value = '';
  if (senderMode.value === 'saved' && !senderAddressId.value) formError.value = '请选择寄件地址';
  else if (senderMode.value === 'new') formError.value = validateAddress(sender.value, '寄件') ?? '';
  if (!formError.value && recipientMode.value === 'saved' && !recipientAddressId.value) formError.value = '请选择收件地址';
  else if (!formError.value && recipientMode.value === 'new') formError.value = validateAddress(recipient, '收件') ?? '';
  if (!formError.value && (!item.name || item.weightKg < 0.01 || item.weightKg > 1000)) formError.value = '请填写有效的物品名称和重量';
  if (!formError.value && !pickupLocal.value) formError.value = '请选择上门时间';
  if (formError.value) return null;
  return {
    serviceType: serviceType.value,
    ...(senderMode.value === 'saved' ? { senderAddressId: senderAddressId.value } : { sender: { ...sender.value } }),
    ...(recipientMode.value === 'saved' ? { recipientAddressId: recipientAddressId.value } : { recipient: { ...recipient } }),
    item: { ...item },
    scheduledPickupAt: new Date(pickupLocal.value).toISOString(),
    remark: remark.value || undefined,
  };
}

async function estimateFee(): Promise<void> {
  formError.value = '';
  if (item.weightKg < 0.01 || item.weightKg > 1000) {
    formError.value = '重量需在 0.01–1000 kg 之间';
    return;
  }
  estimating.value = true;
  try {
    estimate.value = await userApi.estimate({ serviceType: serviceType.value, weightKg: item.weightKg });
    uni.showToast({ title: '估价完成', icon: 'success' });
  } catch (cause: unknown) {
    formError.value = errorMessage(cause);
  } finally {
    estimating.value = false;
  }
}

async function submit(): Promise<void> {
  if (submitting.value) return;
  const payload = buildOrder();
  if (!payload) return;
  if (!estimate.value) {
    formError.value = '请先获取预估费用';
    return;
  }
  if (!requireUserSession()) return;
  submitting.value = true;
  let createdId = '';
  try {
    const created = await userApi.createOrder(payload);
    createdId = created.id;
    await userApi.act(created.id, { action: OrderAction.SUBMIT, reason: '用户端提交模拟订单' });
    await userApi.act(created.id, { action: OrderAction.CONFIRM, reason: '用户确认模拟订单' });
    uni.showToast({ title: '订单创建成功', icon: 'success' });
    setTimeout(() => uni.redirectTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(created.id)}` }), 550);
  } catch (cause: unknown) {
    formError.value = createdId
      ? `订单草稿已保存，但确认流程未完成：${errorMessage(cause)}`
      : errorMessage(cause);
    if (createdId) {
      setTimeout(() => uni.redirectTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(createdId)}` }), 1800);
    }
  } finally {
    submitting.value = false;
  }
}

function goBack(): void { backOrHome(); }
function getSenderText(): string {
  if (senderMode.value === 'saved') {
    const addr = addresses.value.find(a => a.id === senderAddressId.value);
    return addr ? `${addr.contactName} ${addr.phone} ${addr.city}${addr.detail}` : '请选择寄件地址';
  }
  return sender.value.contactName ? `${sender.value.contactName} ${sender.value.phone}` : '请输入寄件人详细地址';
}
function getRecipientText(): string {
  if (recipientMode.value === 'saved') {
    const addr = addresses.value.find(a => a.id === recipientAddressId.value);
    return addr ? `${addr.contactName} ${addr.phone} ${addr.city}${addr.detail}` : '请选择收件地址';
  }
  return recipient.contactName ? `${recipient.contactName} ${recipient.phone}` : '请输入收件人详细地址';
}
</script>

<template>
  <view class="page create-page">
    <!-- 顶部橙色渐变区 -->
    <view class="header">
      <view class="header-bg" />
      <view class="nav-row">
        <text class="back" @tap="goBack">‹</text>
        <text class="nav-title">{{ serviceName }}</text>
        <text class="nav-placeholder" />
      </view>
      <view class="header-title">快速寄件</view>
      <view class="header-sub">木棉速达 · 同城24h上门</view>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 寄件人信息 -->
      <view class="addr-card" @tap="showSenderForm = !showSenderForm">
        <view class="addr-tag sender">寄</view>
        <view class="addr-info">
          <text class="addr-text">{{ getSenderText() }}</text>
        </view>
        <text class="addr-arrow">›</text>
      </view>
      <view v-if="showSenderForm" class="addr-form-card">
        <view class="mode-tabs">
          <view :class="['mode-tab', { active: senderMode === 'saved' }]" @tap.stop="senderMode = 'saved'">地址簿</view>
          <view :class="['mode-tab', { active: senderMode === 'new' }]" @tap.stop="senderMode = 'new'">新地址</view>
        </view>
        <view v-if="senderMode === 'saved'" class="addr-list">
          <view v-if="loadingAddresses" class="state-text">正在加载地址簿…</view>
          <view v-else-if="addresses.length === 0" class="state-text">地址簿为空，请用新地址</view>
          <view v-for="address in addresses" :key="address.id" :class="['addr-option', { selected: senderAddressId === address.id }]" @tap.stop="selectAddress('sender', address.id)">
            <view class="radio" />
            <view>
              <text class="addr-name">{{ address.contactName }} · {{ address.phone }}</text>
              <text class="addr-detail">{{ address.city }} {{ address.district }} {{ address.detail }}</text>
            </view>
          </view>
        </view>
        <view v-else class="addr-form"><address-fields v-model="sender" /></view>
      </view>

      <!-- 收件人信息 -->
      <view class="addr-card" @tap="showRecipientForm = !showRecipientForm">
        <view class="addr-tag recipient">收</view>
        <view class="addr-info">
          <text class="addr-text">{{ getRecipientText() }}</text>
        </view>
        <text class="addr-arrow">›</text>
      </view>
      <view v-if="showRecipientForm" class="addr-form-card">
        <view class="mode-tabs">
          <view :class="['mode-tab', { active: recipientMode === 'new' }]" @tap.stop="recipientMode = 'new'">新地址</view>
          <view :class="['mode-tab', { active: recipientMode === 'saved' }]" @tap.stop="recipientMode = 'saved'">地址簿</view>
        </view>
        <view v-if="recipientMode === 'saved'" class="addr-list">
          <view v-if="addresses.length === 0" class="state-text">地址簿为空</view>
          <view v-for="address in addresses" :key="address.id" :class="['addr-option', { selected: recipientAddressId === address.id }]" @tap.stop="selectAddress('recipient', address.id)">
            <view class="radio" />
            <view>
              <text class="addr-name">{{ address.contactName }} · {{ address.phone }}</text>
              <text class="addr-detail">{{ address.city }} {{ address.district }} {{ address.detail }}</text>
            </view>
          </view>
        </view>
        <view v-else class="addr-form">
          <view class="field"><text class="field-label">联系人</text><input v-model.trim="recipient.contactName" class="field-input" placeholder="收件人姓名" /></view>
          <view class="field"><text class="field-label">手机号</text><input v-model.trim="recipient.phone" class="field-input" placeholder="+85620…" /></view>
          <view class="field split"><view><text class="field-label">国家</text><input v-model.trim="recipient.country" class="field-input" /></view><view><text class="field-label">城市</text><input v-model.trim="recipient.city" class="field-input" /></view></view>
          <view class="field"><text class="field-label">地区</text><input v-model.trim="recipient.district" class="field-input" placeholder="区/县" /></view>
          <view class="field"><text class="field-label">详细地址</text><textarea v-model.trim="recipient.detail" class="field-input textarea" placeholder="街道、门牌" /></view>
        </view>
      </view>

      <!-- 物品信息 -->
      <view class="section-card">
        <view class="card-title">物品信息</view>
        <view class="item-types">
          <view v-for="option in [{v: ItemType.DOCUMENT,n:'文件'},{v:ItemType.CLOTHING,n:'衣物'},{v:ItemType.DAILY_NECESSITIES,n:'日用品'},{v:ItemType.OTHER,n:'其他'}]" :key="option.v" :class="['item-chip',{active:item.type===option.v}]" @tap="item.type=option.v; item.name=option.n; estimate=null">{{ option.n }}</view>
        </view>
        <view class="field-row">
          <text class="row-label">物品名称</text>
          <input v-model.trim="item.name" class="row-input" placeholder="请输入物品名称" />
        </view>
        <view class="field-row">
          <text class="row-label">物品重量</text>
          <input v-model.number="item.weightKg" class="row-input" type="digit" placeholder="5" @input="estimate = null" />
          <text class="row-unit">公斤以下</text>
        </view>
        <view class="field-row">
          <text class="row-label">取件时间</text>
          <input v-model="pickupLocal" class="row-input" type="datetime-local" placeholder="立即取件" />
        </view>
        <view class="field-row">
          <text class="row-label">是否到付</text>
          <switch :checked="cod" @change="cod = ($event as any).detail.value" color="#2196f3" />
        </view>
        <view class="field-row">
          <text class="row-label">保价费用</text>
          <switch :checked="insured" @change="insured = ($event as any).detail.value" color="#2196f3" />
        </view>
        <view class="field-row">
          <text class="row-label">备注信息</text>
          <input v-model.trim="remark" class="row-input" placeholder="请输入备注(选填)" />
        </view>
      </view>

      <!-- 估价 -->
      <view class="estimate-card">
        <view class="est-left">
          <text class="est-label">预估费用</text>
          <text class="est-value">{{ estimate ? money(estimate.amount, estimate.currency) : '待估价' }}</text>
        </view>
        <view class="est-btn" :class="{ loading: estimating }" @tap="estimateFee">{{ estimating ? '计算中' : '获取估价' }}</view>
      </view>

      <view v-if="formError" class="form-error">{{ formError }}</view>
      <view class="bottom-space" />
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="submit-left">
        <text class="submit-price">{{ estimate ? money(estimate.amount, estimate.currency) : '¥0.00' }}</text>
        <text class="submit-desc">{{ item.weightKg }}kg · 预估费用</text>
      </view>
      <view class="submit-btn" :class="{ disabled: submitting }" @tap="submit">{{ submitting ? '提交中…' : '提交订单' }}</view>
    </view>
  </view>
</template>

<style scoped>
.create-page { height: 100%; max-height: 100%; display: flex; flex-direction: column; background: var(--km-bg); overflow: hidden; }

/* 顶部 */
.header { position: relative; background: linear-gradient(180deg, #b3e0fc 0%, #cfe8f9 55%, var(--km-bg) 100%); padding: 0 28rpx 36rpx; overflow: hidden; }
.header-bg { position: absolute; top: -60rpx; right: -40rpx; width: 300rpx; height: 300rpx; background: rgba(255,255,255,0.35); border-radius: 50%; }
.nav-row { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 0 20rpx; position: relative; z-index: 1; }
.back { font-size: 48rpx; color: var(--km-text); width: 60rpx; font-weight: 300; }
.nav-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.nav-placeholder { width: 60rpx; }
.header-title { font-size: 44rpx; font-weight: 800; color: var(--km-text); margin-top: 10rpx; position: relative; z-index: 1; }
.header-sub { font-size: 24rpx; color: var(--km-text-secondary); margin-top: 8rpx; position: relative; z-index: 1; }

/* 内容 */
.content { flex: 1; padding: 24rpx 28rpx 0; }

/* 地址卡片 */
.addr-card { display: flex; align-items: center; gap: 20rpx; background: var(--km-surface); border-radius: 20rpx; padding: 28rpx 24rpx; margin-bottom: 16rpx; box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.05); }
.addr-tag { width: 56rpx; height: 56rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28rpx; font-weight: 800; flex-shrink: 0; }
.addr-tag.sender { background: #4caf50; }
.addr-tag.recipient { background: #2196f3; }
.addr-info { flex: 1; min-width: 0; }
.addr-text { font-size: 26rpx; color: var(--km-text); line-height: 1.5; }
.addr-arrow { font-size: 36rpx; color: #ccc; flex-shrink: 0; }

/* 地址展开表单 */
.addr-form-card { background: var(--km-surface); border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.05); }
.mode-tabs { display: flex; gap: 12rpx; margin-bottom: 20rpx; }
.mode-tab { padding: 12rpx 28rpx; border-radius: 999rpx; font-size: 24rpx; color: var(--km-text-secondary); background: #f5f5f5; }
.mode-tab.active { color: #fff; background: #2196f3; font-weight: 700; }
.addr-list { max-height: 400rpx; overflow-y: auto; }
.addr-option { display: flex; gap: 16rpx; padding: 20rpx 8rpx; border-bottom: 1rpx solid #f5f5f5; align-items: flex-start; }
.addr-option:last-child { border-bottom: none; }
.radio { width: 32rpx; height: 32rpx; border-radius: 50%; border: 4rpx solid var(--km-border); margin-top: 6rpx; flex-shrink: 0; }
.addr-option.selected .radio { border-color: #2196f3; background: #2196f3; }
.addr-name { display: block; font-size: 26rpx; font-weight: 700; color: var(--km-text); }
.addr-detail { display: block; font-size: 22rpx; color: var(--km-text-muted); margin-top: 6rpx; line-height: 1.5; }
.state-text { text-align: center; padding: 30rpx 0; color: var(--km-text-muted); font-size: 24rpx; }
.addr-form { }
.field { margin-bottom: 20rpx; }
.field-label { display: block; font-size: 24rpx; color: var(--km-text-secondary); margin-bottom: 10rpx; }
.field-input { width: 100%; height: 72rpx; background: var(--km-surface-sunken); border-radius: 12rpx; padding: 0 20rpx; font-size: 26rpx; color: var(--km-text); box-sizing: border-box; }
.field-input.textarea { height: 140rpx; padding: 16rpx 20rpx; }
.split { display: flex; gap: 16rpx; }
.split > view { flex: 1; }

/* 物品信息 */
.section-card { background: var(--km-surface); border-radius: 20rpx; padding: 28rpx 24rpx; margin-bottom: 16rpx; box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.05); }
.card-title { font-size: 30rpx; font-weight: 800; color: var(--km-text); margin-bottom: 24rpx; }
.item-types { display: flex; gap: 12rpx; margin-bottom: 24rpx; }
.item-chip { flex: 1; padding: 18rpx 0; text-align: center; border-radius: 12rpx; font-size: 24rpx; color: var(--km-text-secondary); background: var(--km-surface-sunken); }
.item-chip.active { color: #2196f3; background: #e3f2fd; font-weight: 700; }
.field-row { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.field-row:last-child { border-bottom: none; }
.row-label { width: 160rpx; font-size: 26rpx; color: var(--km-text-secondary); flex-shrink: 0; }
.row-input { flex: 1; font-size: 26rpx; color: var(--km-text); text-align: right; }
.row-unit { font-size: 22rpx; color: var(--km-text-muted); margin-left: 12rpx; flex-shrink: 0; }

/* 估价 */
.estimate-card { display: flex; align-items: center; justify-content: space-between; background: var(--km-surface); border-radius: 20rpx; padding: 28rpx 24rpx; margin-bottom: 16rpx; box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.05); }
.est-left { }
.est-label { display: block; font-size: 22rpx; color: var(--km-text-muted); }
.est-value { display: block; font-size: 40rpx; font-weight: 800; color: #2196f3; margin-top: 6rpx; }
.est-btn { padding: 18rpx 36rpx; background: linear-gradient(135deg, #42a5f5, #1e88e5); color: #fff; font-size: 26rpx; font-weight: 700; border-radius: 999rpx; }
.est-btn.loading { opacity: 0.6; }

.form-error { margin: 16rpx 0; padding: 20rpx 24rpx; border-radius: 12rpx; color: #c62828; background: #ffebee; font-size: 24rpx; }
.bottom-space { height: 140rpx; }

/* 底部提交栏 */
.submit-bar { display: flex; align-items: center; justify-content: space-between; background: var(--km-surface); border-top: 1rpx solid var(--km-divider); padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom)); }
.submit-left { }
.submit-price { display: block; font-size: 36rpx; font-weight: 800; color: #2196f3; }
.submit-desc { display: block; font-size: 20rpx; color: var(--km-text-muted); margin-top: 4rpx; }
.submit-btn { padding: 22rpx 60rpx; background: linear-gradient(135deg, #42a5f5, #1e88e5); color: #fff; font-size: 30rpx; font-weight: 800; border-radius: 999rpx; }
.submit-btn.disabled { opacity: 0.6; }
</style>
