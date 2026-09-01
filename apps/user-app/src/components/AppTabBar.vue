<script setup lang="ts">
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';

export interface NavigationItem { key: string; label: string; icon: string }
defineProps<{ active: string; items: NavigationItem[] }>();
defineEmits<{ select: [key: string] }>();
</script>

<template>
  <view class="tabbar-wrap">
    <view class="tabbar">
      <view
        v-for="item in items"
        :key="item.key"
        class="tab"
        :class="{ on: active === item.key }"
        @tap="$emit('select', item.key)"
      >
        <KmIcon :name="item.icon" class="tab-ic" />
        <text class="tab-label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.tabbar-wrap {
  position: fixed;
  z-index: 30;
  bottom: 0;
  left: var(--window-left, 0px);
  right: var(--window-right, 0px);
  padding-bottom: env(safe-area-inset-bottom);
  background: color-mix(in srgb, var(--km-surface) 94%, transparent);
  border-top: 1rpx solid var(--km-divider);
  backdrop-filter: blur(12px);
  transition: background-color var(--km-duration) var(--km-ease), border-color var(--km-duration) var(--km-ease);
}
.tabbar {
  display: flex;
  width: 100%;
  min-height: 64px;
  padding: 8rpx 8rpx 10rpx;
}
.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  color: var(--km-text-muted);
}
.tab.on { color: var(--km-primary); }
.tab-ic { font-size: 40rpx; }
.tab-label { font-size: 18rpx; font-weight: 500; color: inherit; }
.tab.on .tab-label { color: var(--km-text); }
</style>
