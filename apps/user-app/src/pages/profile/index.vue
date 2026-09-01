<script setup lang="ts">
import AppTabBar from '../../components/AppTabBar.vue';
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';
import LanguageSwitcher from '../../components/LanguageSwitcher.vue';
import ThemeToggle from '../../components/ThemeToggle.vue';
import { t, locale } from '../../i18n';
import { useAuthStore, requireUserSession } from '../../stores/auth';
import { useUserTabs } from '../../composables/useUserTabs';
import { openSupportSheet } from '../../utils/supportBus';

const auth = useAuthStore();
if (!requireUserSession()) void 0;

function goBack(): void { uni.navigateBack(); }
function openOrders(status?: 'pay' | 'pickup' | 'shipping' | 'done'): void {
  const q = status ? `?status=${status}` : '';
  uni.navigateTo({ url: `/pages/orders/index${q}` });
}
function openChangePassword(): void {
  uni.navigateTo({ url: '/pages/change-password/index' });
}
function menuTap(key: 'address' | 'coupon' | 'cs' | 'settings'): void {
  if (key === 'cs') {
    openSupportSheet({});
    return;
  }
  const type = { address: 'address', coupon: 'coupon', settings: 'setting' }[key];
  uni.navigateTo({ url: `/pages/info/index?type=${type}` });
}

const bottomTabs = useUserTabs();

function selectTab(key: string): void {
  if (key === 'home') uni.reLaunch({ url: '/pages/home/index' });
  else if (key === 'tracking') uni.navigateTo({ url: '/pages/tracking/index' });
  else if (key === 'flash') uni.navigateTo({ url: '/pages/flash/index' });
  else if (key === 'orders') uni.navigateTo({ url: '/pages/orders/index' });
}
</script>

<template>
  <view class="profile-page km-page-flow" :key="locale">
    <view class="top-bar">
      <view class="nav-row">
        <view class="back-btn" @tap="goBack"><KmIcon name="chevron" class="back-ic" /></view>
        <text class="nav-title">{{ t('profile.title') }}</text>
        <view class="nav-placeholder" />
      </view>
      <view class="user-row">
        <view class="avatar">{{ auth.subject?.displayName?.slice(0, 1) ?? t('tab.profile') }}</view>
        <view class="user-info">
          <text class="user-name">{{ auth.subject?.displayName ?? t('profile.guest') }}</text>
          <text class="user-id">{{ auth.subject?.identifier ?? t('profile.signedIn') }}</text>
        </view>
      </view>
    </view>

    <view class="content">
      <view class="card">
        <view class="card-head">
          <text class="card-title">{{ t('profile.myOrders') }}</text>
          <text class="card-more" @tap="openOrders">{{ t('home.all') }}</text>
        </view>
        <view class="order-row">
          <view class="order-item" @tap="openOrders('pay')">
            <view class="order-icon"><KmIcon name="wallet" /></view>
            <text class="order-label">{{ t('profile.pay') }}</text>
          </view>
          <view class="order-item" @tap="openOrders('pickup')">
            <view class="order-icon"><KmIcon name="box" /></view>
            <text class="order-label">{{ t('profile.pickup') }}</text>
          </view>
          <view class="order-item" @tap="openOrders('shipping')">
            <view class="order-icon"><KmIcon name="truck" /></view>
            <text class="order-label">{{ t('profile.shipping') }}</text>
          </view>
          <view class="order-item" @tap="openOrders('done')">
            <view class="order-icon"><KmIcon name="check" /></view>
            <text class="order-label">{{ t('profile.done') }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-head"><text class="card-title">{{ t('profile.settings') }}</text></view>
        <view class="menu-list">
          <view class="menu-item lang-item">
            <view class="menu-ic"><KmIcon name="globe" /></view>
            <LanguageSwitcher mode="row" />
          </view>
          <view class="menu-item lang-item">
            <view class="menu-ic"><KmIcon name="moon" /></view>
            <ThemeToggle mode="row" />
          </view>
          <view class="menu-item" @tap="openChangePassword">
            <view class="menu-ic"><KmIcon name="shield" /></view>
            <text class="menu-text">{{ t('profile.changePassword') }}</text>
            <KmIcon name="chevron" class="menu-arrow" />
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-head"><text class="card-title">{{ t('profile.tools') }}</text></view>
        <view class="menu-list">
          <view class="menu-item" @tap="menuTap('address')">
            <view class="menu-ic"><KmIcon name="pin" /></view>
            <text class="menu-text">{{ t('profile.address') }}</text>
            <KmIcon name="chevron" class="menu-arrow" />
          </view>
          <view class="menu-item" @tap="menuTap('coupon')">
            <view class="menu-ic"><KmIcon name="coupon" /></view>
            <text class="menu-text">{{ t('profile.coupon') }}</text>
            <KmIcon name="chevron" class="menu-arrow" />
          </view>
          <view class="menu-item" @tap="menuTap('cs')">
            <view class="menu-ic"><KmIcon name="chat" /></view>
            <text class="menu-text">{{ t('profile.cs') }}</text>
            <KmIcon name="chevron" class="menu-arrow" />
          </view>
          <view class="menu-item" @tap="() => uni.navigateTo({ url: '/pages/tickets/index' })">
            <view class="menu-ic"><KmIcon name="list" /></view>
            <text class="menu-text">{{ t('ticket.listTitle') }}</text>
            <KmIcon name="chevron" class="menu-arrow" />
          </view>
        </view>
      </view>

      <button class="logout-btn" @tap="auth.logout">{{ t('profile.logout') }}</button>
      <view class="bottom-space" />
    </view>
    <AppTabBar active="profile" :items="bottomTabs" @select="selectTab" />
  </view>
</template>

<style scoped>
.profile-page { background: var(--km-bg); color: var(--km-text); }
.bottom-space { height: 20rpx; }
.top-bar { background: var(--km-sky); padding: 36rpx 32rpx 56rpx; }
.nav-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36rpx; }
.back-btn { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; transform: rotate(180deg); }
.back-ic { font-size: 32rpx; color: var(--km-text); }
.nav-title { font-size: 28rpx; font-weight: 600; color: var(--km-text); }
.nav-placeholder { width: 56rpx; }
.user-row { display: flex; align-items: center; gap: 20rpx; }
.avatar {
  width: 88rpx; height: 88rpx; border-radius: 22rpx;
  background: var(--km-text); color: var(--km-text-inverse);
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; font-weight: 600;
}
.user-name { font-size: 32rpx; font-weight: 600; color: var(--km-text); letter-spacing: -0.03em; }
.user-id { display: block; font-size: 22rpx; color: var(--km-text-muted); margin-top: 6rpx; }
.content { margin-top: -24rpx; padding: 0 32rpx 40rpx; }
.card {
  background: var(--km-surface);
  border: 1rpx solid var(--km-border);
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--km-shadow-card);
}
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.card-title { font-size: 26rpx; font-weight: 600; color: var(--km-text); }
.card-more { font-size: 22rpx; color: var(--km-primary); }
.order-row { display: flex; justify-content: space-between; }
.order-item { display: flex; flex-direction: column; align-items: center; gap: 10rpx; width: 25%; }
.order-icon {
  width: 68rpx; height: 68rpx; border-radius: 18rpx;
  background: var(--km-surface-sunken); color: var(--km-text-secondary);
  display: flex; align-items: center; justify-content: center; font-size: 32rpx;
}
.order-label { font-size: 20rpx; color: var(--km-text-muted); }
.menu-item { display: flex; align-items: center; gap: 16rpx; padding: 22rpx 0; border-bottom: 1rpx solid var(--km-divider); }
.menu-item:last-child { border-bottom: none; }
.menu-ic { width: 40rpx; color: var(--km-text-secondary); font-size: 32rpx; display: flex; }
.menu-text { flex: 1; font-size: 26rpx; color: var(--km-text); }
.menu-arrow { font-size: 26rpx; color: var(--km-text-muted); opacity: 0.45; }
.menu-item.lang-item { padding: 0; }
.menu-item.lang-item .lang-wrap,
.menu-item.lang-item .theme-wrap { flex: 1; min-width: 0; }
.logout-btn {
  width: 100%; height: 88rpx; line-height: 88rpx; margin-top: 12rpx;
  border: 1rpx solid var(--km-border); border-radius: 16rpx;
  color: var(--km-danger); background: var(--km-surface); font-size: 26rpx; font-weight: 500;
}
</style>
