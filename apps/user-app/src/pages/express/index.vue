<script setup lang="ts">
const expresses = [
  { name: '顺丰速运', phone: '95338', color: '#000' },
  { name: '中通快递', phone: '95311', color: '#1e88e5' },
  { name: '圆通速递', phone: '95554', color: '#43a047' },
  { name: '韵达快递', phone: '95546', color: '#1e88e5' },
  { name: '申通快递', phone: '95543', color: '#f4511e' },
  { name: '京东物流', phone: '950616', color: '#e53935' },
  { name: '极兔速递', phone: '956025', color: '#e53935' },
  { name: '德邦快递', phone: '95353', color: '#1565c0' },
];

function goBack(): void { uni.navigateBack(); }
function callExpress(phone: string): void {
  uni.makePhoneCall({ phoneNumber: phone, fail: () => uni.showToast({ title: '拨号失败', icon: 'none' }) });
}
</script>

<template>
  <view class="page express-page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">常用快递</text>
      <text class="topbar-placeholder" />
    </view>
    <view class="list">
      <view v-for="exp in expresses" :key="exp.name" class="exp-item">
        <view class="exp-logo" :style="{ background: exp.color }">
          <text class="exp-logo-text">{{ exp.name.slice(0, 1) }}</text>
        </view>
        <view class="exp-info">
          <text class="exp-name">{{ exp.name }}</text>
          <text class="exp-phone">客服电话：{{ exp.phone }}</text>
        </view>
        <view class="call-btn" @tap="callExpress(exp.phone)">拨打</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 40rpx; overflow-x: hidden; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 20rpx; background: var(--km-surface); }
.back { font-size: 44rpx; color: var(--km-text); width: 60rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.topbar-placeholder { width: 60rpx; }
.list { margin: 24rpx 28rpx; background: var(--km-surface); border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.exp-item { display: flex; align-items: center; gap: 20rpx; padding: 24rpx 28rpx; border-bottom: 1rpx solid #f5f5f5; }
.exp-item:last-child { border-bottom: none; }
.exp-logo { width: 72rpx; height: 72rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.exp-logo-text { color: #fff; font-size: 28rpx; font-weight: 800; }
.exp-info { flex: 1; min-width: 0; }
.exp-name { display: block; font-size: 28rpx; font-weight: 700; color: var(--km-text); }
.exp-phone { display: block; font-size: 22rpx; color: var(--km-text-muted); margin-top: 6rpx; }
.call-btn { padding: 12rpx 28rpx; background: #2196f3; color: #fff; font-size: 24rpx; font-weight: 700; border-radius: 999rpx; flex-shrink: 0; }
</style>
