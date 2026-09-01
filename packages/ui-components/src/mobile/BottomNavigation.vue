<script setup lang="ts">
import KmIcon from './KmIcon.vue';

export interface NavigationItem { key: string; label: string; icon: string; center?: boolean }
defineProps<{ active: string; items: NavigationItem[] }>();
defineEmits<{ select: [key: string] }>();
</script>

<template>
  <view class="km-bottom-nav-wrap">
    <view class="km-bottom-nav">
      <button v-for="item in items" :key="item.key" :class="{ active: active === item.key }" @tap="$emit('select', item.key)">
        <KmIcon :name="item.icon" class="km-nav-svg" />
        <text class="km-nav-label">{{ item.label }}</text>
      </button>
    </view>
  </view>
</template>

<style scoped>
.km-bottom-nav-wrap {
  position: fixed;
  z-index: 30;
  right: 0;
  bottom: 0;
  left: 0;
  padding-bottom: env(safe-area-inset-bottom);
  pointer-events: none;
}
.km-bottom-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  width: min(100%, var(--km-mobile-max));
  min-height: var(--km-bottom-nav-height);
  margin: 0 auto;
  padding: 8rpx 10rpx 10rpx;
  border-top: 1rpx solid rgba(17, 24, 39, 0.06);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  pointer-events: auto;
}
.km-bottom-nav button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 6rpx;
  border: 0;
  color: #9ca3af;
  background: transparent;
  font-size: 18rpx;
  font-weight: 500;
}
.km-bottom-nav button::after { border: 0; }
.km-bottom-nav button.active { color: #111827; }
.km-nav-svg { font-size: 40rpx; }
.km-nav-label { letter-spacing: 0.02em; }
.active .km-nav-svg { color: #2563eb; }
</style>
