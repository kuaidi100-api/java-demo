<script setup lang="ts">
const props = defineProps<{ brand: string }>();

const srcMap: Record<string, string> = {
  taobao: '/static/platforms/taobao.png',
  tmall: '/static/platforms/tmall.png',
  jd: '/static/platforms/jd.png',
  pdd: '/static/platforms/pdd.png',
  alibaba: '/static/platforms/1688.png',
  vip: '/static/platforms/vip.png',
  suning: '/static/platforms/suning.png',
  dewu: '/static/platforms/dewu.png',
  xhs: '/static/platforms/xhs.png',
  douyin: '/static/platforms/douyin.png',
  weidian: '/static/platforms/weidian.png',
  yanxuan: '/static/platforms/yanxuan.png',
  amazon: '/static/platforms/amazon.png',
  overseas: '/static/platforms/overseas.png',
};

const src = srcMap[props.brand] || srcMap.overseas;
</script>

<template>
  <view class="brand">
    <image class="img" :src="src" mode="aspectFill" />
  </view>
</template>

<style scoped>
.brand {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: var(--km-surface-sunken, #f3f4f6);
  box-shadow: 0 6rpx 16rpx rgba(15, 23, 42, 0.08);
}
.img { width: 100%; height: 100%; display: block; }
</style>
