<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { OrderSummary } from '@express-platform/shared-types';
import { locale, t } from '../../i18n';
import type { MessageKey } from '../../i18n';
import BrandMark from '../../components/BrandMark.vue';
import AppTabBar from '../../components/AppTabBar.vue';
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import ThemeToggle from '../../components/ThemeToggle.vue';
import TrackProgress from '@express-platform/ui-components/mobile/TrackProgress.vue';
import { useAuthStore } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, statusLabel } from '../../utils/presentation';
import { useUserTabs } from '../../composables/useUserTabs';
import { scanWaybillCode } from '../../utils/scanWaybill';

/** 首页「在途」：仅进行中订单（不含草稿 / 已送达 / 已完成 / 已取消） */
const ACTIVE_ORDER_STATUSES = new Set([
  'PENDING_CONFIRMATION',
  'PENDING_DISPATCH',
  'PENDING_ACCEPTANCE',
  'ACCEPTED',
  'PICKING_UP',
  'PICKED_UP',
  'IN_TRANSIT',
  'EXCEPTION',
]);

const auth = useAuthStore();
const orders = ref<OrderSummary[]>([]);
const loading = ref(true);
const loadError = ref('');
const trackingQuery = ref('');
const scanning = ref(false);
const bottomTabs = useUserTabs();

const activeOrders = computed(() =>
  orders.value.filter((order) => ACTIVE_ORDER_STATUSES.has(String(order.status))),
);

function transitPercent(status: string): number {
  if (status === 'IN_TRANSIT') return 70;
  if (status === 'PICKED_UP' || status === 'PICKING_UP') return 45;
  if (status === 'ACCEPTED' || status === 'PENDING_ACCEPTANCE') return 28;
  return 16;
}

const subServices = [
  { type: 'ticket', icon: 'ticket', tone: 'ticket' },
  { type: 'hotel', icon: 'hotel', tone: 'hotel' },
  { type: 'moving', icon: 'moving', tone: 'moving' },
  { type: 'photo', icon: 'camera', tone: 'photo' },
  { type: 'ride', icon: 'car', tone: 'ride' },
];

onShow(() => {
  if (auth.isAuthenticated) void loadOrders();
  else { orders.value = []; loading.value = false; loadError.value = ''; }
});
async function loadOrders(): Promise<void> {
  loading.value = true; loadError.value = '';
  try { orders.value = await userApi.orders(); } catch (cause: unknown) { loadError.value = errorMessage(cause); }
  finally { loading.value = false; }
}
function openCreate(service = 'EXPRESS'): void {
  if (service === 'EXPRESS') {
    uni.navigateTo({ url: '/pages/freight/index' });
    return;
  }
  if (service === 'PURCHASE') {
    uni.navigateTo({ url: '/pages/purchase/index' });
    return;
  }
  if (service === 'INTRACITY' || service === 'RIDE') {
    uni.navigateTo({ url: service === 'RIDE' ? '/pages/ride/index' : '/pages/flash/index' });
    return;
  }
  uni.navigateTo({ url: `/pages/order-create/index?service=${service}` });
}
function openOrder(id: string): void { uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(id)}` }); }
function openOrders(): void { uni.navigateTo({ url: '/pages/orders/index' }); }
function openPricing(): void { uni.navigateTo({ url: '/pages/freight/index' }); }
function selectTab(key: string): void {
  if (key === 'tracking') uni.navigateTo({ url: '/pages/tracking/index' });
  else if (key === 'flash') uni.navigateTo({ url: '/pages/flash/index' });
  else if (key === 'orders') uni.navigateTo({ url: '/pages/orders/index' });
  else if (key === 'profile') uni.navigateTo({ url: '/pages/profile/index' });
}
function queryTracking(): void {
  const no = trackingQuery.value.trim();
  uni.navigateTo({
    url: no
      ? `/pages/tracking/index?no=${encodeURIComponent(no)}`
      : '/pages/tracking/index',
  });
}

async function scanWaybill(): Promise<void> {
  if (scanning.value) return;
  scanning.value = true;
  try {
    const result = await scanWaybillCode();
    if (!result.ok) {
      if (result.reason === 'cancel') return;
      uni.showToast({
        title: result.message || t('home.scanFail'),
        icon: 'none',
        duration: 2600,
      });
      return;
    }
    trackingQuery.value = result.code;
    uni.showToast({ title: t('home.scanOk'), icon: 'success', duration: 900 });
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/tracking/index?no=${encodeURIComponent(result.code)}`,
      });
    }, 320);
  } finally {
    scanning.value = false;
  }
}

function signIn(): void { uni.showToast({ title: t('home.checkinSoon'), icon: 'none' }); }
function subServiceTap(type: string): void {
  if (type === 'hotel') {
    uni.navigateTo({ url: '/pages/hotel/list' });
    return;
  }
  if (type === 'photo') {
    uni.navigateTo({ url: '/pages/photo/index' });
    return;
  }
  if (type === 'ticket') {
    uni.navigateTo({ url: '/pages/ticket/index' });
    return;
  }
  if (type === 'moving') {
    uni.navigateTo({ url: '/pages/moving/index' });
    return;
  }
  if (type === 'ride') {
    uni.navigateTo({ url: '/pages/ride/index' });
    return;
  }
  uni.navigateTo({ url: `/pages/service/index?type=${type}` });
}
function svcLabel(type: string): string {
  return t(`home.svc.${type}` as MessageKey);
}
function serviceName(order: OrderSummary): string {
  if (order.serviceType === 'INTRACITY' || order.serviceType === 'SAME_CITY') return t('service.INTRACITY');
  if (order.serviceType === 'PURCHASE') return t('service.PURCHASE');
  if (order.serviceType === 'EXPRESS') return t('service.EXPRESS');
  if (order.serviceType === 'HOTEL') return t('service.HOTEL');
  if (order.serviceType === 'PHOTO') return t('service.PHOTO');
  if (order.serviceType === 'TICKET') return t('service.TICKET');
  if (order.serviceType === 'MOVING') return t('service.MOVING');
  if (order.serviceType === 'RIDE') return t('service.RIDE');
  return t('service.PICKUP');
}
</script>

<template>
  <view class="home-page km-screen" :key="locale">
    <view class="sky-section">
      <view class="status-bar" />
      <view class="nav-bar">
        <view class="nav-left">
          <BrandMark size="lg" />
          <text class="nav-slogan">{{ t('brand.slogan') }}</text>
        </view>
        <view class="nav-actions">
          <LanguageSwitcher mode="nav" compact />
          <ThemeToggle mode="icon" />
          <view class="sign-pill" @tap="signIn">{{ t('home.signIn') }}</view>
        </view>
      </view>
      <view class="search-box">
        <view
          class="search-scan"
          :class="{ busy: scanning }"
          role="button"
          :aria-label="t('home.scanAria')"
          @tap.stop="scanWaybill"
        >
          <KmIcon name="barcode" class="search-ic" />
        </view>
        <input
          v-model.trim="trackingQuery"
          class="search-input"
          :placeholder="t('home.searchPh')"
          placeholder-class="search-ph"
          @confirm="queryTracking"
        />
        <text class="search-go" @tap="queryTracking">{{ t('home.search') }}</text>
      </view>
    </view>

    <view class="content-scroll km-screen-scroll">
      <view class="hero-section">
        <view class="hero-large" @tap="openCreate('EXPRESS')">
          <view class="hero-mark" aria-hidden="true"><KmIcon name="package" /></view>
          <view class="hero-kicker-row">
            <KmIcon name="globe" class="hero-kicker-ic" />
            <text class="hero-kicker">{{ t('home.freight') }}</text>
          </view>
          <text class="hero-title">{{ t('home.bookPickup') }}</text>
          <text class="hero-sub">{{ t('home.pickup24h') }}</text>
          <text class="hero-cta">{{ t('home.goShip') }}</text>
        </view>
        <view class="hero-right">
          <view class="hero-small hero-run" @tap="openCreate('INTRACITY')">
            <view class="small-icon run"><KmIcon name="courier" /></view>
            <view class="small-info">
              <text class="small-title">{{ t('home.cityRun') }}</text>
              <text class="small-desc">{{ t('home.cityRunDesc') }}</text>
            </view>
            <KmIcon name="chevron" class="small-arrow" />
          </view>
          <view class="hero-small hero-buy" @tap="openCreate('PURCHASE')">
            <view class="small-icon buy"><KmIcon name="shopShip" /></view>
            <view class="small-info">
              <text class="small-title">{{ t('home.purchase') }}</text>
              <text class="small-desc">{{ t('home.purchaseDesc') }}</text>
            </view>
            <KmIcon name="chevron" class="small-arrow" />
          </view>
        </view>
      </view>

      <view class="life-panel">
        <scroll-view scroll-x class="sub-scroll" :show-scrollbar="false">
          <view class="sub-section">
            <view v-for="s in subServices" :key="s.type" class="sub-item" @tap="subServiceTap(s.type)">
              <view class="sub-ic" :class="`tone-${s.tone}`">
                <KmIcon :name="s.icon" />
              </view>
              <text class="sub-label">{{ svcLabel(s.type) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="trust-strip" role="button" @tap="openPricing">
        <view class="trust-icon" aria-hidden="true"><KmIcon name="shield" /></view>
        <view class="trust-copy">
          <text class="trust-title">{{ t('home.trust') }}</text>
          <text class="trust-sub">{{ t('home.trustSub') }}</text>
        </view>
        <view class="trust-cta">
          <text>{{ t('home.pricing') }}</text>
          <KmIcon name="chevron" class="trust-arrow" />
        </view>
      </view>

      <view class="transit-head">
        <view class="transit-head-copy">
          <text class="transit-title">{{ t('home.inTransit') }}</text>
          <text class="transit-rule">{{ t('home.inTransitRule') }}</text>
        </view>
        <view class="transit-all" @tap="openOrders">
          <text>{{ t('home.all') }}</text>
          <KmIcon name="chevron" class="transit-chev" />
        </view>
      </view>

      <view v-if="activeOrders.length" class="track-preview">
        <TrackProgress
          :percent="transitPercent(String(activeOrders[0]?.status || ''))"
          :shipment-no="activeOrders[0]?.orderNo"
        />
      </view>

      <view class="list-card">
        <view v-if="loading" class="pkg-sk"><view class="sk-line" /><view class="sk-line" /></view>
        <view v-else-if="loadError" class="pkg-empty"><text>{{ loadError }}</text></view>
        <view v-else-if="!auth.isAuthenticated" class="pkg-empty">
          <text>{{ t('home.loginForTransit') }}</text>
          <text class="pkg-empty-sub">{{ t('home.noOrdersSub') }}</text>
        </view>
        <view v-else-if="activeOrders.length === 0" class="pkg-empty">
          <text>{{ t('home.noOrders') }}</text>
          <text class="pkg-empty-sub">{{ t('home.noOrdersSub') }}</text>
        </view>
        <view v-else class="pkg-list">
          <view
            v-for="order in activeOrders.slice(0, 3)"
            :key="order.id"
            class="pkg-item"
            @tap="openOrder(order.id)"
          >
            <view class="status-dot" />
            <view class="pkg-info">
              <text class="pkg-status">{{ statusLabel(order.status) }}</text>
              <text class="pkg-detail">{{ serviceName(order) }} · {{ order.orderNo }}</text>
            </view>
            <KmIcon name="chevron" class="pkg-more" />
          </view>
        </view>
      </view>
      <view class="bottom-pad km-tab-pad" />
    </view>
    <AppTabBar active="home" :items="bottomTabs" @select="selectTab" />
  </view>
</template>

<style scoped>
.home-page { background: var(--km-bg); color: var(--km-text); }
.sky-section {
  flex-shrink: 0;
  padding: 0 32rpx 24rpx;
  background: var(--km-sky);
}
.status-bar { height: 56rpx; }
.nav-bar { display: flex; align-items: flex-start; justify-content: space-between; padding: 12rpx 0 28rpx; gap: 16rpx; }
.nav-left { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 0; }
.nav-slogan { margin-top: 12rpx; font-size: 24rpx; color: var(--km-text-muted); }
.nav-actions { display: flex; align-items: center; gap: 12rpx; flex-shrink: 0; margin-top: 4rpx; }
.sign-pill {
  padding: 10rpx 22rpx;
  border: 1.5rpx solid var(--km-primary);
  border-radius: 999rpx;
  color: var(--km-primary);
  font-size: 24rpx;
  font-weight: 500;
  background: color-mix(in srgb, var(--km-surface) 70%, transparent);
}
.search-box {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 10rpx 0 24rpx;
  background: var(--km-surface);
  border: 1rpx solid var(--km-border);
  border-radius: 20rpx;
  box-shadow: var(--km-shadow-card);
}
.search-scan {
  width: 52rpx;
  height: 88rpx;
  margin-right: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--km-primary);
  flex-shrink: 0;
}
.search-scan.busy { opacity: 0.55; }
.search-ic { font-size: 40rpx; color: inherit; }
.search-input { flex: 1; height: 88rpx; font-size: 26rpx; color: var(--km-text); }
.search-ph { color: var(--km-text-muted); }
.search-go {
  padding: 0 28rpx;
  height: 68rpx;
  line-height: 68rpx;
  font-size: 26rpx;
  color: var(--km-text-on-primary);
  background: var(--km-primary);
  border-radius: 14rpx;
  font-weight: 500;
}

.content-scroll { padding: 4rpx 32rpx 0; width: 100%; box-sizing: border-box; }
.hero-section { display: flex; gap: 16rpx; margin-bottom: 36rpx; min-height: 280rpx; }
.hero-large {
  flex: 1.12;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 32rpx 28rpx 28rpx;
  background:
    radial-gradient(120% 90% at 100% 0%, rgba(255, 255, 255, 0.65) 0%, transparent 55%),
    linear-gradient(155deg, #dbeafe 0%, #e0f2fe 52%, #ecfeff 100%);
  border-radius: 28rpx;
  box-shadow: var(--km-shadow-card);
  border: 1rpx solid color-mix(in srgb, #38bdf8 28%, var(--km-border));
  position: relative;
  overflow: hidden;
}
.hero-large::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background-image: repeating-linear-gradient(115deg, transparent 0, transparent 12px, rgba(37, 99, 235, 0.06) 12px, rgba(37, 99, 235, 0.06) 13px);
}
.hero-mark {
  position: absolute;
  right: -12rpx;
  bottom: -8rpx;
  font-size: 168rpx;
  color: color-mix(in srgb, #2563eb 14%, transparent);
  z-index: 0;
  pointer-events: none;
  transform: rotate(-8deg);
}
.hero-kicker-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  position: relative;
  z-index: 1;
}
.hero-kicker-ic { font-size: 22rpx; color: #2563eb; }
.hero-kicker { display: block; font-size: 20rpx; color: #1d4ed8; letter-spacing: 0.08em; }
.hero-title { display: block; margin-top: 12rpx; font-size: 40rpx; font-weight: 600; color: #0f172a; letter-spacing: -0.04em; position: relative; z-index: 1; }
.hero-sub { display: block; margin-top: 10rpx; font-size: 22rpx; color: #475569; line-height: 1.45; position: relative; z-index: 1; }
.hero-cta {
  align-self: flex-start;
  margin-top: auto;
  padding: 12rpx 28rpx;
  background: #2563eb;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 999rpx;
  position: relative;
  z-index: 1;
}
.hero-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16rpx; }
.hero-small {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 18rpx;
  border: 1rpx solid transparent;
  border-radius: 24rpx;
  box-shadow: var(--km-shadow-card);
}
.hero-run {
  background: linear-gradient(135deg, color-mix(in srgb, #0d9488 12%, var(--km-surface)) 0%, var(--km-surface) 70%);
  border-color: color-mix(in srgb, #0d9488 22%, var(--km-border));
}
.hero-buy {
  background: linear-gradient(135deg, color-mix(in srgb, #d97706 12%, var(--km-surface)) 0%, var(--km-surface) 70%);
  border-color: color-mix(in srgb, #d97706 22%, var(--km-border));
}
.small-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  flex-shrink: 0;
}
.small-icon.run { background: color-mix(in srgb, #0d9488 16%, transparent); color: #0f766e; }
.small-icon.buy { background: color-mix(in srgb, #d97706 16%, transparent); color: #b45309; }
.small-info { flex: 1; min-width: 0; }
.small-title { display: block; font-size: 28rpx; font-weight: 600; color: var(--km-text); }
.small-desc { display: block; margin-top: 4rpx; font-size: 20rpx; color: var(--km-text-muted); }
.small-arrow { font-size: 24rpx; color: var(--km-text-muted); flex-shrink: 0; opacity: 0.5; }

:global([data-theme='dark']) .hero-large,
:global(.km-dark) .home-page .hero-large {
  background:
    radial-gradient(120% 90% at 100% 0%, rgba(96, 165, 250, 0.16) 0%, transparent 55%),
    linear-gradient(155deg, rgba(37, 99, 235, 0.28) 0%, rgba(14, 165, 233, 0.18) 100%);
  border-color: rgba(96, 165, 250, 0.22);
}
:global([data-theme='dark']) .hero-kicker-ic,
:global(.km-dark) .home-page .hero-kicker-ic,
:global([data-theme='dark']) .hero-kicker,
:global(.km-dark) .home-page .hero-kicker { color: #93c5fd; }
:global([data-theme='dark']) .hero-title,
:global(.km-dark) .home-page .hero-title { color: var(--km-text); }
:global([data-theme='dark']) .hero-sub,
:global(.km-dark) .home-page .hero-sub { color: var(--km-text-muted); }
:global([data-theme='dark']) .small-icon.run,
:global(.km-dark) .home-page .small-icon.run { color: #2dd4bf; }
:global([data-theme='dark']) .small-icon.buy,
:global(.km-dark) .home-page .small-icon.buy { color: #fbbf24; }
:global([data-theme='dark']) .hero-cta,
:global(.km-dark) .home-page .hero-cta {
  background: #60a5fa;
  color: #0b1220;
}

.life-panel {
  margin-bottom: 28rpx;
  padding: 22rpx 8rpx 18rpx;
  border-radius: 24rpx;
  background:
    linear-gradient(180deg, color-mix(in srgb, #bae6fd 35%, var(--km-surface)) 0%, var(--km-surface) 72%);
  border: 1rpx solid color-mix(in srgb, #38bdf8 18%, var(--km-border));
  box-shadow: var(--km-shadow-card);
}
.sub-scroll { width: 100%; white-space: nowrap; }
.sub-section { display: inline-flex; gap: 8rpx; padding: 0 12rpx; min-width: 100%; box-sizing: border-box; justify-content: space-between; }
.sub-item { display: flex; flex-direction: column; align-items: center; gap: 10rpx; width: 128rpx; flex-shrink: 0; }
.sub-ic {
  width: 92rpx;
  height: 92rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  border: 1rpx solid transparent;
}
.sub-ic.tone-ticket {
  background: color-mix(in srgb, #2563eb 14%, var(--km-surface));
  color: #1d4ed8;
  border-color: color-mix(in srgb, #2563eb 18%, transparent);
}
.sub-ic.tone-hotel {
  background: color-mix(in srgb, #0d9488 14%, var(--km-surface));
  color: #0f766e;
  border-color: color-mix(in srgb, #0d9488 18%, transparent);
}
.sub-ic.tone-moving {
  background: color-mix(in srgb, #ea580c 14%, var(--km-surface));
  color: #c2410c;
  border-color: color-mix(in srgb, #ea580c 18%, transparent);
}
.sub-ic.tone-photo {
  background: color-mix(in srgb, #db2777 12%, var(--km-surface));
  color: #be185d;
  border-color: color-mix(in srgb, #db2777 16%, transparent);
}
.sub-ic.tone-ride {
  background: color-mix(in srgb, #059669 14%, var(--km-surface));
  color: #047857;
  border-color: color-mix(in srgb, #059669 18%, transparent);
}
.sub-label {
  font-size: 22rpx;
  font-weight: 500;
  color: var(--km-text-secondary);
  text-align: center;
  line-height: 1.25;
}

:global([data-theme='dark']) .life-panel,
:global(.km-dark) .home-page .life-panel {
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, var(--km-surface) 75%);
  border-color: rgba(56, 189, 248, 0.16);
}
:global([data-theme='dark']) .sub-ic.tone-ticket,
:global(.km-dark) .home-page .sub-ic.tone-ticket { color: #93c5fd; }
:global([data-theme='dark']) .sub-ic.tone-hotel,
:global(.km-dark) .home-page .sub-ic.tone-hotel { color: #5eead4; }
:global([data-theme='dark']) .sub-ic.tone-moving,
:global(.km-dark) .home-page .sub-ic.tone-moving { color: #fdba74; }
:global([data-theme='dark']) .sub-ic.tone-photo,
:global(.km-dark) .home-page .sub-ic.tone-photo { color: #f9a8d4; }
:global([data-theme='dark']) .sub-ic.tone-ride,
:global(.km-dark) .home-page .sub-ic.tone-ride { color: #6ee7b7; }

.trust-strip {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 26rpx 22rpx;
  margin-bottom: 32rpx;
  border-radius: 24rpx;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(90% 120% at 100% 0%, rgba(255, 255, 255, 0.7) 0%, transparent 55%),
    linear-gradient(118deg, #dbeafe 0%, #e0f2fe 48%, #f0f9ff 100%);
  box-shadow: var(--km-shadow-card);
  border: 1rpx solid color-mix(in srgb, #38bdf8 30%, var(--km-border));
}
.trust-strip::after {
  content: '';
  position: absolute;
  right: -40rpx;
  bottom: -48rpx;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.08);
  pointer-events: none;
}
.trust-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  color: #1d4ed8;
  background: color-mix(in srgb, #2563eb 12%, #fff);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  border: 1rpx solid color-mix(in srgb, #2563eb 16%, transparent);
}
.trust-copy {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
.trust-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.25;
}
.trust-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #475569;
  line-height: 1.35;
}
.trust-cta {
  display: flex;
  align-items: center;
  gap: 2rpx;
  padding: 12rpx 18rpx 12rpx 22rpx;
  border-radius: 999rpx;
  background: #2563eb;
  color: #fff;
  font-size: 22rpx;
  font-weight: 600;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.trust-arrow { font-size: 22rpx; color: #fff; }

:global([data-theme='dark']) .trust-strip,
:global(.km-dark) .home-page .trust-strip {
  background:
    radial-gradient(90% 120% at 100% 0%, rgba(96, 165, 250, 0.14) 0%, transparent 55%),
    linear-gradient(118deg, rgba(37, 99, 235, 0.26) 0%, rgba(14, 165, 233, 0.16) 100%);
  border-color: rgba(96, 165, 250, 0.22);
  box-shadow: none;
}
:global([data-theme='dark']) .trust-title,
:global(.km-dark) .home-page .trust-title { color: var(--km-text); }
:global([data-theme='dark']) .trust-sub,
:global(.km-dark) .home-page .trust-sub { color: var(--km-text-muted); }
:global([data-theme='dark']) .trust-icon,
:global(.km-dark) .home-page .trust-icon {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.14);
  border-color: rgba(96, 165, 250, 0.2);
}
:global([data-theme='dark']) .trust-cta,
:global(.km-dark) .home-page .trust-cta {
  background: #60a5fa;
  color: #0b1220;
}
:global([data-theme='dark']) .trust-arrow,
:global(.km-dark) .home-page .trust-arrow { color: #0b1220; }

.transit-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
  padding: 0 4rpx;
}
.transit-head-copy { flex: 1; min-width: 0; }
.transit-title { display: block; font-size: 32rpx; font-weight: 600; color: var(--km-text); letter-spacing: -0.03em; }
.transit-rule {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.4;
  color: var(--km-text-muted);
}
.transit-all {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: var(--km-text-muted);
  flex-shrink: 0;
}
.transit-chev { font-size: 22rpx; color: var(--km-text-muted); }

.track-preview { margin-bottom: 20rpx; }

.list-card {
  background: var(--km-surface);
  border: 1rpx solid var(--km-border);
  border-radius: 24rpx;
  padding: 8rpx 8rpx 8rpx 20rpx;
  margin-bottom: 28rpx;
  box-shadow: var(--km-shadow-card);
}
.sk-line { height: 24rpx; border-radius: 8rpx; background: var(--km-surface-sunken); margin: 16rpx 12rpx; }
.pkg-empty { padding: 36rpx 20rpx 32rpx; }
.pkg-empty text { display: block; font-size: 26rpx; color: var(--km-text-muted); }
.pkg-empty-sub { margin-top: 8rpx !important; font-size: 22rpx !important; color: var(--km-text-muted) !important; }
.pkg-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 16rpx 24rpx 0;
}
.pkg-item + .pkg-item { border-top: 1rpx solid var(--km-divider); }
.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: var(--km-primary);
  flex-shrink: 0;
  box-shadow: 0 0 0 6rpx var(--km-primary-glow);
}
.pkg-info { flex: 1; min-width: 0; }
.pkg-status { display: block; font-size: 28rpx; font-weight: 600; color: var(--km-text); }
.pkg-detail { display: block; margin-top: 6rpx; font-size: 22rpx; color: var(--km-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pkg-more { font-size: 26rpx; color: var(--km-text-muted); opacity: 0.45; }
</style>
