<script setup lang="ts">
withDefaults(defineProps<{ title: string; subtitle: string; compact?: boolean; mark?: string }>(), { mark: '木' });
defineEmits<{ message: [] }>();
</script>

<template>
  <view class="km-app-header" :class="{ compact }">
    <view class="km-brand-mark">{{ mark }}</view>
    <view class="km-header-copy">
      <text class="km-header-title">{{ title }}</text>
      <text class="km-header-subtitle">{{ subtitle }}</text>
    </view>
    <button class="km-message-button" aria-label="消息" @tap="$emit('message')">消息</button>
  </view>
</template>

<style scoped>
.km-app-header { display: grid; grid-template-columns: 72rpx 1fr auto; align-items: center; gap: 16rpx; padding: 12rpx 4rpx 24rpx; }
.km-brand-mark {
  display: grid; place-items: center; width: 72rpx; height: 72rpx; border-radius: 18rpx;
  color: #fff; background: #111827; font-size: 26rpx; font-weight: 600;
}
.km-header-title, .km-header-subtitle { display: block; }
.km-header-title { font-size: 28rpx; font-weight: 600; color: #111827; letter-spacing: -0.02em; }
.km-header-subtitle { margin-top: 6rpx; color: #6b7280; font-size: 20rpx; }
.km-message-button {
  height: 56rpx; padding: 0 18rpx; border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12rpx; color: #374151; background: #fff; font-size: 20rpx;
}
.km-message-button::after { border: 0; }
.compact { padding-bottom: 16rpx; }
</style>
