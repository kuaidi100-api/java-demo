<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { AddressBookItem } from '@express-platform/shared-types';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { backOrHome } from '../../utils/navigation';
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';
import { locale, t, type MessageKey } from '../../i18n';
import { openSupportSheet } from '../../utils/supportBus';

const type = ref('');
const addresses = ref<AddressBookItem[]>([]);
const loadingAddresses = ref(false);
const addressError = ref('');
const servicePhone = import.meta.env.VITE_SERVICE_PHONE?.trim() ?? '';
const serviceEmail = import.meta.env.VITE_SERVICE_EMAIL?.trim() ?? '';

const title = computed(() => {
  const map: Record<string, MessageKey> = {
    address: 'info.address',
    coupon: 'info.coupon',
    service: 'info.service',
    setting: 'info.setting',
  };
  return t(map[type.value] ?? 'info.detail');
});

onLoad((params) => {
  type.value = (params?.type as string) || '';
  if (type.value === 'address' && requireUserSession()) void loadAddresses();
});

function goBack(): void { backOrHome(); }
function addAddress(): void {
  uni.showToast({ title: t('info.addAddressSoon'), icon: 'none' });
}
async function loadAddresses(): Promise<void> {
  loadingAddresses.value = true;
  addressError.value = '';
  try { addresses.value = await userApi.addresses(); }
  catch (cause: unknown) { addressError.value = errorMessage(cause); }
  finally { loadingAddresses.value = false; }
}
function addressText(address: AddressBookItem): string {
  return [address.country, address.province, address.city, address.district, address.detail].filter(Boolean).join('');
}
function callService(): void {
  if (!servicePhone) { uni.showToast({ title: t('info.servicePhoneMissing'), icon: 'none' }); return; }
  uni.makePhoneCall({ phoneNumber: servicePhone, fail: () => {} });
}
function openOnlineCs(): void {
  openSupportSheet({});
}
function clearCache(): void { uni.showToast({ title: t('info.cacheCleared'), icon: 'success' }); }
function about(): void { uni.showToast({ title: t('info.aboutToast'), icon: 'none' }); }
function openChangePassword(): void {
  uni.navigateTo({ url: '/pages/change-password/index' });
}
</script>

<template>
  <view class="page info-page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ title }}</text>
      <text class="topbar-placeholder" />
    </view>

    <block v-if="type === 'address'">
      <view v-if="loadingAddresses" class="state-card">{{ t('info.loadingAddress') }}</view>
      <view v-else-if="addressError" class="state-card error-state">
        <text>{{ addressError }}</text>
        <button class="retry-btn" @tap="loadAddresses">{{ t('orders.retry') }}</button>
      </view>
      <view v-else-if="addresses.length === 0" class="state-card">{{ t('info.noAddress') }}</view>
      <view v-for="addr in addresses" :key="addr.id" class="addr-card">
        <view class="addr-top">
          <text class="addr-name">{{ addr.contactName }}</text>
          <text class="addr-phone">{{ addr.phone }}</text>
          <text v-if="addr.isDefaultSender || addr.isDefaultReceiver" class="addr-default">{{ t('info.defaultTag') }}</text>
        </view>
        <text class="addr-detail">{{ addressText(addr) }}</text>
      </view>
      <view class="add-btn" @tap="addAddress">{{ t('info.addAddress') }}</view>
    </block>

    <block v-else-if="type === 'coupon'">
      <view class="state-card">
        <text class="state-title">{{ t('info.couponSoon') }}</text>
        <text>{{ t('info.couponSoonHint') }}</text>
      </view>
    </block>

    <block v-else-if="type === 'service'">
      <view class="service-card">
        <view class="service-item" @tap="callService">
          <view class="service-ic"><KmIcon name="phone" /></view>
          <view class="service-info">
            <text class="service-title">{{ t('info.hotline') }}</text>
            <text class="service-desc">{{ servicePhone || t('info.notConfigured') }}</text>
          </view>
          <text class="service-arrow">›</text>
        </view>
        <view class="service-item" @tap="openOnlineCs">
          <view class="service-ic"><KmIcon name="chat" /></view>
          <view class="service-info">
            <text class="service-title">{{ t('info.onlineCs') }}</text>
            <text class="service-desc">{{ t('info.onlineCsHint') }}</text>
          </view>
          <text class="service-arrow">›</text>
        </view>
        <view class="service-item">
          <view class="service-ic"><KmIcon name="chat" /></view>
          <view class="service-info">
            <text class="service-title">{{ t('info.emailFeedback') }}</text>
            <text class="service-desc">{{ serviceEmail || t('info.notConfigured') }}</text>
          </view>
          <text class="service-arrow">›</text>
        </view>
      </view>
    </block>

    <block v-else-if="type === 'setting'">
      <view class="setting-card">
        <view class="setting-item" @tap="openChangePassword">
          <text class="setting-text">{{ t('auth.changePassword') }}</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @tap="clearCache">
          <text class="setting-text">{{ t('info.clearCache') }}</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item" @tap="about">
          <text class="setting-text">{{ t('info.about') }}</text>
          <text class="setting-arrow">›</text>
        </view>
        <view class="setting-item">
          <text class="setting-text">{{ t('info.version') }}</text>
          <text class="setting-value">v1.0.0</text>
        </view>
      </view>
    </block>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 40rpx; overflow-x: hidden; color: var(--km-text); }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 20rpx; background: var(--km-surface); }
.back { font-size: 44rpx; color: var(--km-text); width: 60rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.topbar-placeholder { width: 60rpx; }

.addr-card {
  margin: 20rpx 28rpx; background: var(--km-surface); border-radius: 20rpx; padding: 24rpx 28rpx;
  border: 1rpx solid var(--km-border); box-shadow: var(--km-shadow-card);
}
.addr-top { display: flex; align-items: center; gap: 16rpx; margin-bottom: 12rpx; }
.addr-name { font-size: 28rpx; font-weight: 700; color: var(--km-text); }
.addr-phone { font-size: 24rpx; color: var(--km-text-secondary); }
.addr-default {
  font-size: 20rpx; color: var(--km-text-inverse); background: var(--km-primary);
  padding: 4rpx 12rpx; border-radius: 6rpx;
}
.addr-detail { font-size: 24rpx; color: var(--km-text-secondary); line-height: 1.6; }
.add-btn {
  margin: 24rpx 28rpx; height: 80rpx; line-height: 80rpx; text-align: center;
  border: 2rpx dashed var(--km-primary); color: var(--km-primary); font-size: 26rpx; border-radius: 12rpx;
}
.state-card {
  margin: 20rpx 28rpx; padding: 40rpx 28rpx; border-radius: 16rpx; background: var(--km-surface);
  color: var(--km-text-secondary); line-height: 1.7; border: 1rpx solid var(--km-border);
}
.state-title { display: block; margin-bottom: 10rpx; color: var(--km-text); font-size: 28rpx; font-weight: 700; }
.error-state { color: var(--km-danger); }
.retry-btn { margin: 20rpx 0 0; font-size: 24rpx; }

.service-card, .setting-card {
  margin: 20rpx 28rpx; background: var(--km-surface); border-radius: 16rpx; overflow: hidden;
  border: 1rpx solid var(--km-border);
}
.service-item {
  display: flex; align-items: center; gap: 20rpx; padding: 28rpx;
  border-bottom: 1rpx solid var(--km-divider);
}
.service-item:last-child { border-bottom: none; }
.service-ic { width: 44rpx; color: var(--km-text-secondary); font-size: 34rpx; display: flex; }
.service-info { flex: 1; }
.service-title { display: block; font-size: 28rpx; font-weight: 700; color: var(--km-text); }
.service-desc { display: block; font-size: 22rpx; color: var(--km-text-muted); margin-top: 4rpx; }
.service-arrow { font-size: 36rpx; color: var(--km-text-muted); }

.setting-item {
  display: flex; align-items: center; justify-content: space-between; padding: 28rpx;
  border-bottom: 1rpx solid var(--km-divider);
}
.setting-item:last-child { border-bottom: none; }
.setting-text { font-size: 28rpx; color: var(--km-text); }
.setting-value { font-size: 24rpx; color: var(--km-text-muted); }
.setting-arrow { font-size: 36rpx; color: var(--km-text-muted); }
</style>
