<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppTabBar from '../../components/AppTabBar.vue';
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';
import type { AddressBookItem } from '@express-platform/shared-types';
import { requireUserSession, useAuthStore } from '../../stores/auth';
import { userApi } from '../../services/api';
import { backOrHome } from '../../utils/navigation';
import { t, locale } from '../../i18n';
import { errorMessage } from '../../utils/presentation';
import { useUserTabs } from '../../composables/useUserTabs';
import SupportContactBtn from '../../components/support/SupportContactBtn.vue';
import { openSupportSheet } from '../../utils/supportBus';

const auth = useAuthStore();
const senderId = ref('');
const recipientId = ref('');
const senderText = ref('');
const recipientText = ref('');
const senderLat = ref<number | null>(null);
const senderLng = ref<number | null>(null);
const recipientLat = ref<number | null>(null);
const recipientLng = ref<number | null>(null);
const addresses = ref<AddressBookItem[]>([]);
const itemName = ref('文件');
const areaType = ref<1 | 2>(1);
const weightTier = ref<1 | 2>(1);
const paymentMethod = ref<'CASH' | 'WECHAT' | 'ALIPAY'>('CASH');
const settlementLoc = ref<'PICKUP' | 'DROPOFF'>('PICKUP');
const remark = ref('');
const submitting = ref(false);
const bookOpen = ref(false);
const bookKind = ref<'sender' | 'recipient'>('sender');
const price = computed(() => (areaType.value === 1 ? (weightTier.value === 1 ? 30 : 40) : (weightTier.value === 1 ? 50 : 70)));
const feeLines = computed(() => {
  const base = 30;
  const area = areaType.value === 1 ? 0 : 20;
  const weight = weightTier.value === 1 ? 0 : 10;
  return { base, area, weight, total: price.value };
});
const feeOpen = ref(false);
const bookTitle = computed(() => (bookKind.value === 'sender' ? t('flash.pickBook') : t('flash.dropBook')));

onMounted(() => {
  if (!requireUserSession()) return;
  void loadAddresses();
});

onShow(() => {
  const picked = uni.getStorageSync('km.flash.mapPick') as
    | { role?: string; id?: string; detail?: string; label?: string; lat?: number; lng?: number }
    | '';
  if (!picked || typeof picked !== 'object') return;
  const detail =
    picked.detail
    || (picked.label ? `金三角经济特区 · ${picked.label}` : '')
    || (picked.id ? addresses.value.find((item) => item.id === picked.id)?.detail : '')
    || '';
  if (!picked.id && !detail) return;
  const lat = typeof picked.lat === 'number' ? picked.lat : null;
  const lng = typeof picked.lng === 'number' ? picked.lng : null;
  if (picked.role === 'recipient') {
    if (picked.id) recipientId.value = picked.id;
    if (detail) recipientText.value = detail;
    recipientLat.value = lat;
    recipientLng.value = lng;
  } else {
    if (picked.id) senderId.value = picked.id;
    if (detail) senderText.value = detail;
    senderLat.value = lat;
    senderLng.value = lng;
  }
  uni.removeStorageSync('km.flash.mapPick');
  if (picked.id) void loadAddresses();
});

async function loadAddresses(): Promise<void> {
  try {
    const list = await userApi.addresses();
    addresses.value = list;
    if (!senderId.value && !senderText.value.trim()) {
      const def = list.find((item) => item.isDefaultSender) ?? list[0];
      if (def) applyBookAddress('sender', def);
    }
  } catch {
    /* 地址簿失败时仍可手输 / 地图选点 */
  }
}

function applyBookAddress(kind: 'sender' | 'recipient', item: AddressBookItem): void {
  if (kind === 'sender') {
    senderId.value = item.id;
    senderText.value = item.detail;
    senderLat.value = item.latitude ?? null;
    senderLng.value = item.longitude ?? null;
  } else {
    recipientId.value = item.id;
    recipientText.value = item.detail;
    recipientLat.value = item.latitude ?? null;
    recipientLng.value = item.longitude ?? null;
  }
}

function onSenderInput(event: { detail?: { value?: string } }): void {
  senderText.value = String(event.detail?.value ?? senderText.value);
  senderId.value = '';
  senderLat.value = null;
  senderLng.value = null;
}

function onRecipientInput(event: { detail?: { value?: string } }): void {
  recipientText.value = String(event.detail?.value ?? recipientText.value);
  recipientId.value = '';
  recipientLat.value = null;
  recipientLng.value = null;
}

function openBook(kind: 'sender' | 'recipient'): void {
  if (!addresses.value.length) {
    uni.showToast({ title: t('flash.noBook'), icon: 'none' });
    return;
  }
  bookKind.value = kind;
  bookOpen.value = true;
}

function closeBook(): void {
  bookOpen.value = false;
}

function pickBook(item: AddressBookItem): void {
  applyBookAddress(bookKind.value, item);
  bookOpen.value = false;
}

function openMap(role: 'sender' | 'recipient'): void {
  uni.navigateTo({ url: `/pages/map-pick/index?role=${role}` });
}

function goBack(): void { backOrHome(); }

function requirePhone(): string | null {
  const value = auth.subject?.identifier?.trim() ?? '';
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null;
}

async function resolveAddressId(kind: 'sender' | 'recipient'): Promise<string | null> {
  const id = kind === 'sender' ? senderId.value : recipientId.value;
  const text = (kind === 'sender' ? senderText.value : recipientText.value).trim();
  const lat = kind === 'sender' ? senderLat.value : recipientLat.value;
  const lng = kind === 'sender' ? senderLng.value : recipientLng.value;
  if (!text) return null;
  if (id) {
    const matched = addresses.value.find((item) => item.id === id);
    if (matched && matched.detail.trim() === text) {
      // Keep book id; refresh coords if map provided newer ones
      if (lat != null && lng != null && (matched.latitude == null || matched.longitude == null)) {
        try {
          await userApi.createAddress({
            label: matched.label || (kind === 'sender' ? '闪送取件' : '闪送收件'),
            contactName: matched.contactName,
            phone: matched.phone,
            country: matched.country,
            countryCode: matched.countryCode,
            province: matched.province || '博胶省',
            city: matched.city,
            district: matched.district || '',
            detail: matched.detail,
            latitude: lat,
            longitude: lng,
          });
        } catch {
          /* keep original id */
        }
      }
      return id;
    }
  }
  const existing = addresses.value.find((item) => item.detail.trim() === text);
  if (existing && lat == null) {
    if (kind === 'sender') {
      senderId.value = existing.id;
      senderLat.value = existing.latitude ?? null;
      senderLng.value = existing.longitude ?? null;
    } else {
      recipientId.value = existing.id;
      recipientLat.value = existing.latitude ?? null;
      recipientLng.value = existing.longitude ?? null;
    }
    return existing.id;
  }
  const phone = requirePhone();
  if (!phone) {
    uni.showToast({ title: t('flash.needPhone'), icon: 'none' });
    return null;
  }
  const created = await userApi.createAddress({
    label: kind === 'sender' ? '闪送取件' : '闪送收件',
    contactName: auth.subject?.displayName?.trim() || '木棉用户',
    phone,
    country: '老挝',
    countryCode: 'LA',
    province: '博胶省',
    city: '金三角经济特区',
    district: '',
    detail: text,
    ...(lat != null && lng != null ? { latitude: lat, longitude: lng } : {}),
  });
  addresses.value = [created, ...addresses.value];
  if (kind === 'sender') {
    senderId.value = created.id;
    senderLat.value = created.latitude ?? lat;
    senderLng.value = created.longitude ?? lng;
  } else {
    recipientId.value = created.id;
    recipientLat.value = created.latitude ?? lat;
    recipientLng.value = created.longitude ?? lng;
  }
  return created.id;
}

async function submit(): Promise<void> {
  if (!senderText.value.trim() || !recipientText.value.trim()) {
    uni.showToast({ title: t('flash.needAddr'), icon: 'none' });
    return;
  }
  if (senderText.value.trim() === recipientText.value.trim()) {
    uni.showToast({ title: t('flash.sameAddr'), icon: 'none' });
    return;
  }
  if (!itemName.value.trim()) {
    uni.showToast({ title: t('flash.needItem'), icon: 'none' });
    return;
  }
  if (!requireUserSession()) return;
  submitting.value = true;
  try {
    const fromId = await resolveAddressId('sender');
    const toId = await resolveAddressId('recipient');
    if (!fromId || !toId) return;
    if (fromId === toId) {
      uni.showToast({ title: t('flash.sameAddr'), icon: 'none' });
      return;
    }
    const order = await userApi.createErrand({
      senderAddressId: fromId,
      recipientAddressId: toId,
      deliveryAreaType: areaType.value,
      weightTier: weightTier.value,
      itemDescription: itemName.value.trim(),
      paymentMethod: paymentMethod.value,
      settlementLoc: settlementLoc.value,
      remark: remark.value || undefined,
    });
    uni.showToast({ title: t('flash.ok'), icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2500 });
  } finally {
    submitting.value = false;
  }
}

const bottomTabs = useUserTabs();

function selectTab(key: string): void {
  if (key === 'home') uni.reLaunch({ url: '/pages/home/index' });
  else if (key === 'tracking') uni.navigateTo({ url: '/pages/tracking/index' });
  else if (key === 'orders') uni.navigateTo({ url: '/pages/orders/index' });
  else if (key === 'profile') uni.navigateTo({ url: '/pages/profile/index' });
}

function callCs(): void {
  openSupportSheet({ business: 'ERRAND', locked: true });
}
</script>

<template>
  <view class="page flash-page km-page-flow" :key="locale">
    <view class="header">
      <view class="nav-row">
        <text class="back" @tap="goBack">‹</text>
        <text class="nav-title">{{ t('flash.title') }}</text>
        <text class="nav-placeholder" />
      </view>
      <view class="header-title">{{ t('flash.headline') }}</view>
      <view class="header-sub">{{ t('flash.sub') }}</view>
    </view>

    <view class="addr-section">
      <view class="addr-row">
        <view class="addr-tag pick">{{ t('flash.pick') }}</view>
        <input
          class="addr-input"
          :value="senderText"
          :placeholder="t('flash.pickPh')"
          placeholder-class="item-ph"
          @input="onSenderInput"
        />
        <view class="addr-actions">
          <view class="addr-btn" :aria-label="t('flash.pickBook')" @tap.stop="openBook('sender')">
            <KmIcon name="list" />
          </view>
          <view class="addr-btn" :aria-label="t('flash.mapPick')" @tap.stop="openMap('sender')">
            <KmIcon name="pin" />
          </view>
        </view>
      </view>
      <view class="addr-row">
        <view class="addr-tag drop">{{ t('flash.drop') }}</view>
        <input
          class="addr-input"
          :value="recipientText"
          :placeholder="t('flash.dropPh')"
          placeholder-class="item-ph"
          @input="onRecipientInput"
        />
        <view class="addr-actions">
          <view class="addr-btn" :aria-label="t('flash.dropBook')" @tap.stop="openBook('recipient')">
            <KmIcon name="list" />
          </view>
          <view class="addr-btn" :aria-label="t('flash.mapPick')" @tap.stop="openMap('recipient')">
            <KmIcon name="pin" />
          </view>
        </view>
      </view>
    </view>

    <view class="item-section">
      <view class="chip-row">
        <text class="item-label">{{ t('flash.area') }}</text>
        <view class="chips">
          <text class="chip" :class="{ on: areaType === 1 }" @tap="areaType = 1">{{ t('flash.inside') }}</text>
          <text class="chip" :class="{ on: areaType === 2 }" @tap="areaType = 2">{{ t('flash.dongpeng') }}</text>
        </view>
      </view>
      <view class="chip-row">
        <text class="item-label">{{ t('flash.weight') }}</text>
        <view class="chips">
          <text class="chip" :class="{ on: weightTier === 1 }" @tap="weightTier = 1">≤10KG</text>
          <text class="chip" :class="{ on: weightTier === 2 }" @tap="weightTier = 2">10-20KG</text>
        </view>
      </view>
      <view class="overweight" @tap="callCs">{{ t('flash.overweight') }}</view>
      <view class="item-row">
        <text class="item-label">{{ t('flash.item') }}</text>
        <input v-model.trim="itemName" class="item-input" :placeholder="t('flash.itemPh')" placeholder-class="item-ph" />
      </view>
      <view class="chip-row">
        <text class="item-label">{{ t('flash.pay') }}</text>
        <view class="chips">
          <text class="chip" :class="{ on: paymentMethod === 'CASH' }" @tap="paymentMethod = 'CASH'">{{ t('flash.cash') }}</text>
          <text class="chip" :class="{ on: paymentMethod === 'WECHAT' }" @tap="paymentMethod = 'WECHAT'">{{ t('flash.wechat') }}</text>
          <text class="chip" :class="{ on: paymentMethod === 'ALIPAY' }" @tap="paymentMethod = 'ALIPAY'">{{ t('flash.alipay') }}</text>
        </view>
      </view>
      <view class="chip-row">
        <text class="item-label">{{ t('flash.settle') }}</text>
        <view class="chips">
          <text class="chip" :class="{ on: settlementLoc === 'PICKUP' }" @tap="settlementLoc = 'PICKUP'">{{ t('flash.atPickup') }}</text>
          <text class="chip" :class="{ on: settlementLoc === 'DROPOFF' }" @tap="settlementLoc = 'DROPOFF'">{{ t('flash.atDrop') }}</text>
        </view>
      </view>
      <view class="item-row">
        <text class="item-label">{{ t('flash.remark') }}</text>
        <input v-model.trim="remark" class="item-input" :placeholder="t('flash.optional')" placeholder-class="item-ph" />
      </view>
    </view>

    <view class="cs-bar">
      <SupportContactBtn business="ERRAND" />
    </view>
    <view class="bottom-space" />
    <view class="submit-bar">
      <view class="price-info" @tap="feeOpen = !feeOpen">
        <text class="price-label">{{ t('flash.locked') }} · {{ t('flash.feeDetail') }}</text>
        <text class="price-value">¥ {{ price }}</text>
      </view>
      <view class="submit-btn" :class="{ disabled: submitting }" @tap="submit">
        {{ submitting ? t('flash.submitting') : t('flash.submit') }}
      </view>
    </view>
    <view v-if="feeOpen" class="fee-sheet">
      <text class="fee-line"><text>{{ t('flash.feeBase') }}</text><text>¥ {{ feeLines.base }}</text></text>
      <text class="fee-line"><text>{{ t('flash.feeArea') }}</text><text>¥ {{ feeLines.area }}</text></text>
      <text class="fee-line"><text>{{ t('flash.feeWeight') }}</text><text>¥ {{ feeLines.weight }}</text></text>
      <text class="fee-line total"><text>{{ t('flash.feeTotal') }}</text><text>¥ {{ feeLines.total }}</text></text>
      <text class="fee-hint">{{ t('flash.feeHint') }}</text>
    </view>
    <AppTabBar active="flash" :items="bottomTabs" @select="selectTab" />

    <view v-if="bookOpen" class="book-mask" @tap="closeBook">
      <view class="book-sheet" @tap.stop>
        <text class="book-title">{{ bookTitle }}</text>
        <scroll-view scroll-y class="book-list">
          <view
            v-for="item in addresses"
            :key="item.id"
            class="book-item"
            :class="{ on: item.id === (bookKind === 'sender' ? senderId : recipientId) }"
            @tap="pickBook(item)"
          >
            <text class="book-item-label">{{ item.label || item.contactName }}</text>
            <text class="book-item-detail">{{ item.detail }}</text>
          </view>
        </scroll-view>
        <view class="book-cancel" @tap="closeBook">{{ t('flash.cancel') }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.flash-page { background: var(--km-bg); color: var(--km-text); /* submit bar + tab bar clearance via km-page-flow + submit-bar fixed */ padding-bottom: 120rpx; }
.header { background: var(--km-sky); padding: 0 28rpx 32rpx; }
.nav-row { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 0 16rpx; }
.back { font-size: 48rpx; color: var(--km-text); width: 60rpx; }
.nav-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.nav-placeholder { width: 60rpx; }
.header-title { font-size: 44rpx; font-weight: 800; color: var(--km-text); margin-top: 8rpx; }
.header-sub { font-size: 24rpx; color: var(--km-text-secondary); margin-top: 6rpx; }
.addr-section, .item-section { margin: 20rpx 28rpx; background: var(--km-surface); border-radius: 20rpx; padding: 8rpx 24rpx; box-shadow: var(--km-shadow-card); border: 1rpx solid var(--km-border); }
.addr-row, .item-row, .chip-row { display: flex; align-items: center; gap: 12rpx; padding: 20rpx 0; border-bottom: 1rpx solid var(--km-divider); }
.addr-row:last-child, .item-row:last-child, .chip-row:last-child { border-bottom: none; }
.addr-tag { width: 44rpx; height: 44rpx; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22rpx; font-weight: 600; flex-shrink: 0; }
.addr-tag.pick { background: var(--km-success); }
.addr-tag.drop { background: var(--km-primary); }
.addr-input, .item-input { flex: 1; min-width: 0; font-size: 26rpx; color: var(--km-text); }
.item-ph { color: var(--km-text-muted); }
.addr-actions { display: flex; align-items: center; gap: 8rpx; flex-shrink: 0; }
.addr-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 14rpx;
  background: var(--km-primary-soft);
  color: var(--km-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}
.item-label { width: 88rpx; font-size: 26rpx; color: var(--km-text-secondary); flex-shrink: 0; }
.chips { display: flex; flex-wrap: wrap; gap: 12rpx; }
.chip {
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: var(--km-surface-sunken);
  color: var(--km-text-secondary);
  font-size: 24rpx;
  border: 1rpx solid transparent;
}
.chip.on {
  background: var(--km-primary-soft);
  color: var(--km-primary);
  font-weight: 700;
  border-color: color-mix(in srgb, var(--km-primary) 28%, transparent);
}
.overweight { padding: 8rpx 0 16rpx; color: var(--km-danger); font-size: 22rpx; }
.cs-bar { margin: 0 28rpx 20rpx; text-align: center; color: var(--km-text-muted); font-size: 22rpx; }
.bottom-space { height: 20rpx; }
.submit-bar {
  position: fixed;
  bottom: 110rpx;
  left: var(--window-left, 0px);
  right: var(--window-right, 0px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--km-surface);
  border-top: 1rpx solid var(--km-divider);
  padding: 16rpx 28rpx;
  z-index: 99;
}
.price-label { display: block; font-size: 22rpx; color: var(--km-text-muted); }
.price-value { display: block; font-size: 40rpx; font-weight: 800; color: var(--km-primary); margin-top: 4rpx; }
.fee-sheet {
  position: fixed; left: 0; right: 0; bottom: calc(120rpx + env(safe-area-inset-bottom));
  z-index: 30; margin: 0 24rpx; padding: 20rpx 24rpx; border-radius: 16rpx;
  background: var(--km-surface); border: 1rpx solid var(--km-border); box-shadow: var(--km-shadow-card);
}
.fee-line { display: flex; justify-content: space-between; font-size: 24rpx; color: var(--km-text-secondary); padding: 8rpx 0; }
.fee-line.total { color: var(--km-text); font-weight: 700; border-top: 1rpx dashed var(--km-divider); margin-top: 6rpx; padding-top: 12rpx; }
.fee-hint { display: block; margin-top: 10rpx; font-size: 20rpx; color: var(--km-text-muted); }
.submit-btn { padding: 22rpx 48rpx; background: var(--km-primary); color: var(--km-text-on-primary); font-size: 28rpx; font-weight: 600; border-radius: 16rpx; }
.submit-btn.disabled { opacity: 0.6; }

.book-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: var(--window-left, 0px);
  right: var(--window-right, 0px);
  z-index: 200;
  background: var(--km-overlay);
  display: flex;
  align-items: flex-end;
}
.book-sheet {
  width: 100%;
  max-height: 70vh;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: var(--km-surface);
  color: var(--km-text);
}
.book-title {
  display: block;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--km-text-muted);
  padding: 8rpx 0 16rpx;
}
.book-list { max-height: 48vh; }
.book-item {
  padding: 22rpx 18rpx;
  margin-bottom: 10rpx;
  border-radius: 16rpx;
  background: var(--km-surface-sunken);
  border: 1rpx solid transparent;
}
.book-item.on {
  background: var(--km-primary-soft);
  border-color: color-mix(in srgb, var(--km-primary) 28%, transparent);
}
.book-item-label { display: block; font-size: 26rpx; font-weight: 700; color: var(--km-text); }
.book-item-detail { display: block; margin-top: 6rpx; font-size: 22rpx; color: var(--km-text-secondary); line-height: 1.4; }
.book-cancel {
  margin-top: 8rpx;
  text-align: center;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--km-text-secondary);
  background: var(--km-bg);
}
</style>
