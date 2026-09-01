<script setup lang="ts">
import KmIcon from './KmIcon.vue';
defineProps<{ icon: string; title: string; description: string; tone?: 'amber'|'green'|'purple'|'blue' }>();
defineEmits<{ select: [] }>();
</script>
<template>
  <button class="km-service-card" @tap="$emit('select')">
    <view class="km-service-icon"><KmIcon :name="icon" /></view>
    <text class="km-service-title">{{ title }}</text>
    <text class="km-service-desc">{{ description }}</text>
    <KmIcon name="chevron" class="km-service-arrow" />
  </button>
</template>
<style scoped>
.km-service-card {
  position: relative;
  min-height: 180rpx;
  padding: 26rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.06);
  border-radius: 24rpx;
  text-align: left;
  background: #fff;
  box-shadow: none;
}
.km-service-card::after { border: 0; }
.km-service-icon {
  display: grid;
  place-items: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  color: #2563eb;
  background: #f3f7fb;
  font-size: 28rpx;
}
.km-service-title, .km-service-desc { display: block; }
.km-service-title { margin-top: 18rpx; color: #111827; font-size: 26rpx; font-weight: 600; }
.km-service-desc { margin-top: 6rpx; color: #9ca3af; font-size: 20rpx; line-height: 1.45; }
.km-service-arrow { position: absolute; right: 22rpx; top: 28rpx; color: #d1d5db; font-size: 26rpx; }
</style>
