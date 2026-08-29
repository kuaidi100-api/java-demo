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
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, money } from '../../utils/presentation';
import AddressFields from '../../components/AddressFields.vue';

const serviceType = ref<OrderServiceType>(OrderServiceType.EXPRESS);
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

function blankAddress(): AddressInput {
  return { contactName: '', phone: '', countryCode: 'LA', country: '老挝', city: '万象市', district: '', detail: '' };
}

const sender = ref<AddressInput>(blankAddress());
const recipient = reactive<AddressInput>(blankAddress());
const item = reactive({ type: ItemType.DOCUMENT, name: '文件', quantity: 1, weightKg: 0.5, notes: '' });
const pickupLocal = ref('');
const remark = ref('');
const serviceName = computed(() => serviceType.value === OrderServiceType.INTRACITY
  ? '同城跑腿'
  : serviceType.value === OrderServiceType.PICKUP ? '上门取件' : '一键寄件');

onLoad((query) => {
  if (!requireUserSession()) return;
  const requested = query?.service;
  if (requested && Object.values(OrderServiceType).includes(requested as OrderServiceType)) {
    serviceType.value = requested as OrderServiceType;
  }
  void loadAddresses();
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

function goBack(): void {
  uni.navigateBack();
}
</script>

<template>
  <view class="page create-page">
    <view class="topbar">
      <text class="back" @tap="goBack">←</text>
      <text class="topbar-title">{{ serviceName }}</text>
      <text class="mock-pill">模拟环境</text>
    </view>

    <view class="progress card">
      <view class="progress-step active"><text>1</text><label>地址</label></view>
      <view class="progress-line active" />
      <view class="progress-step active"><text>2</text><label>物品</label></view>
      <view class="progress-line active" />
      <view class="progress-step active"><text>3</text><label>确认</label></view>
    </view>

    <view class="section-title"><text>寄件地址</text><text class="required">必填</text></view>
    <view class="mode-tabs">
      <view :class="['mode-tab', { active: senderMode === 'saved' }]" @tap="senderMode = 'saved'">地址簿</view>
      <view :class="['mode-tab', { active: senderMode === 'new' }]" @tap="senderMode = 'new'">新地址</view>
    </view>
    <view v-if="senderMode === 'saved'" class="address-picker card">
      <view v-if="loadingAddresses" class="state-panel">正在加载地址簿…</view>
      <view v-else-if="addressError" class="state-panel error-panel"><text>{{ addressError }}</text><button class="secondary-button small" @tap="loadAddresses">重试</button></view>
      <view v-else-if="addresses.length === 0" class="state-panel"><text class="state-title">地址簿为空</text><text>切换到“新地址”继续寄件。</text></view>
      <view v-for="address in addresses" v-else :key="address.id" :class="['address-option', { selected: senderAddressId === address.id }]" @tap="selectAddress('sender', address.id)">
        <view class="radio-dot" />
        <view><text class="address-name">{{ address.contactName }} · {{ address.phone }}</text><text class="address-detail">{{ address.city }} {{ address.district }} {{ address.detail }}</text></view>
      </view>
    </view>
    <view v-else class="address-form card"><address-fields v-model="sender" /></view>

    <view class="section-title"><text>收件地址</text><text class="required">必填</text></view>
    <view class="mode-tabs">
      <view :class="['mode-tab', { active: recipientMode === 'new' }]" @tap="recipientMode = 'new'">新地址</view>
      <view :class="['mode-tab', { active: recipientMode === 'saved' }]" @tap="recipientMode = 'saved'">地址簿</view>
    </view>
    <view v-if="recipientMode === 'saved'" class="address-picker card">
      <view v-if="addresses.length === 0" class="state-panel"><text>地址簿暂无可选地址</text></view>
      <view v-for="address in addresses" v-else :key="address.id" :class="['address-option', { selected: recipientAddressId === address.id }]" @tap="selectAddress('recipient', address.id)">
        <view class="radio-dot" />
        <view><text class="address-name">{{ address.contactName }} · {{ address.phone }}</text><text class="address-detail">{{ address.city }} {{ address.district }} {{ address.detail }}</text></view>
      </view>
    </view>
    <view v-else class="address-form card">
      <view class="field"><text class="field-label">联系人</text><input v-model.trim="recipient.contactName" class="field-input" placeholder="收件人姓名" /></view>
      <view class="field"><text class="field-label">国际格式手机号</text><input v-model.trim="recipient.phone" class="field-input" placeholder="+85620…" /></view>
      <view class="field split"><view><text class="field-label">国家</text><input v-model.trim="recipient.country" class="field-input" /></view><view><text class="field-label">城市</text><input v-model.trim="recipient.city" class="field-input" /></view></view>
      <view class="field"><text class="field-label">地区</text><input v-model.trim="recipient.district" class="field-input" placeholder="区 / 县" /></view>
      <view class="field"><text class="field-label">详细地址</text><textarea v-model.trim="recipient.detail" class="field-input textarea" placeholder="街道、门牌、地标" /></view>
    </view>

    <view class="section-title"><text>物品与上门时间</text></view>
    <view class="item-card card">
      <view class="item-types">
        <view v-for="option in [{v: ItemType.DOCUMENT,n:'文件'},{v:ItemType.CLOTHING,n:'衣物'},{v:ItemType.DAILY_NECESSITIES,n:'日用品'},{v:ItemType.OTHER,n:'其他'}]" :key="option.v" :class="['item-chip',{active:item.type===option.v}]" @tap="item.type=option.v; item.name=option.n; estimate=null">{{ option.n }}</view>
      </view>
      <view class="field"><text class="field-label">物品名称</text><input v-model.trim="item.name" class="field-input" placeholder="如：文件、衣物" /></view>
      <view class="field"><text class="field-label">重量（kg）</text><input v-model.number="item.weightKg" class="field-input" type="digit" placeholder="0.5" @input="estimate = null" /></view>
      <view class="field"><text class="field-label">上门时间</text><input v-model="pickupLocal" class="field-input" type="datetime-local" /></view>
      <view class="field"><text class="field-label">备注</text><textarea v-model.trim="remark" class="field-input textarea" placeholder="选填，例如提前电话联系" /></view>
    </view>

    <view class="estimate-card card">
      <view><text class="estimate-label">预估费用</text><text class="estimate-value">{{ estimate ? money(estimate.amount, estimate.currency) : '待估价' }}</text><text class="estimate-note">{{ estimate?.notice ?? '按当前 Mock 价格规则计算，不会实际收费' }}</text></view>
      <button class="secondary-button estimate-button" :loading="estimating" :disabled="estimating" @tap="estimateFee">{{ estimating ? '计算中' : '获取估价' }}</button>
    </view>
    <view v-if="formError" class="form-error">{{ formError }}</view>
    <button class="primary-button submit" :loading="submitting" :disabled="submitting" @tap="submit">{{ submitting ? '正在创建并确认…' : '确认模拟订单' }}</button>
    <text class="safety-note">提交将真实调用本地 NestJS API，并写入 MySQL；不会调用真实快递或支付。</text>
  </view>
</template>

<style scoped>
.create-page { padding-bottom: 90rpx; }.back { width: 52rpx; font-size: 36rpx; font-weight: 800; }.progress { display: flex; align-items: center; justify-content: center; padding: 24rpx 30rpx; }
.progress-step { display: flex; align-items: center; gap: 9rpx; color: #756e67; font-size: 21rpx; }.progress-step text { display: grid; place-items: center; width: 38rpx; height: 38rpx; border-radius: 50%; color: #fff; background: #ee6a31; font-weight: 900; }.progress-line { width: 58rpx; height: 2px; margin: 0 10rpx; background: #f0b18e; }
.required { color: #dc5d28; font-size: 21rpx; }.mode-tabs { display: flex; gap: 10rpx; margin-bottom: 16rpx; }.mode-tab { padding: 12rpx 22rpx; border-radius: 999rpx; color: #776e66; background: #ebe4dc; font-size: 22rpx; }.mode-tab.active { color: #fff; background: #2d2925; font-weight: 800; }
.address-picker, .address-form, .item-card { padding: 26rpx; }.address-option { display: flex; gap: 18rpx; padding: 22rpx 8rpx; border-bottom: 1px solid #eee6de; }.address-option:last-child { border-bottom: 0; }.radio-dot { flex: none; width: 28rpx; height: 28rpx; margin-top: 4rpx; border: 6rpx solid #ddd3ca; border-radius: 50%; }.address-option.selected .radio-dot { border-color: #ef6a31; background: #fff; }.address-name,.address-detail,.estimate-label,.estimate-value,.estimate-note,.safety-note { display: block; }.address-name { font-size: 25rpx; font-weight: 800; }.address-detail { margin-top: 8rpx; color: #7a7168; font-size: 22rpx; line-height: 1.5; }
.small { width: 180rpx; margin-top: 18rpx; }.split { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }.item-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12rpx; margin-bottom: 28rpx; }.item-chip { padding: 20rpx 8rpx; text-align: center; border-radius: 16rpx; color: #756c64; background: #f1ede8; font-size: 22rpx; }.item-chip.active { color: #d95822; background: #fff0e7; outline: 1px solid #f2a17b; font-weight: 800; }
.estimate-card { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-top: 24rpx; padding: 28rpx; }.estimate-label { color: #786f67; font-size: 22rpx; }.estimate-value { margin-top: 8rpx; font-size: 36rpx; font-weight: 900; }.estimate-note { max-width: 390rpx; margin-top: 8rpx; color: #978c82; font-size: 19rpx; line-height: 1.4; }.estimate-button { flex: none; width: 180rpx; }
.form-error { margin: 24rpx 0 0; padding: 20rpx; border-radius: 18rpx; color: #a63d30; background: #fff0ed; font-size: 23rpx; }.submit { margin-top: 26rpx; }.safety-note { margin-top: 18rpx; padding: 0 20rpx; text-align: center; color: #8f857b; font-size: 20rpx; line-height: 1.5; }
</style>
