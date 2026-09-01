<script setup lang="ts">
defineProps<{
  images: string[];
  /** 可选：用于区分多卡同时轮播的 swiper 标记 */
  marker?: string;
}>();
</script>

<template>
  <view class="gallery">
    <swiper
      class="swiper"
      circular
      autoplay
      :interval="3600"
      :duration="420"
      indicator-dots
      indicator-color="rgba(255,255,255,0.35)"
      indicator-active-color="#ffffff"
      :data-marker="marker"
    >
      <swiper-item v-for="(src, idx) in images" :key="`${marker || 'g'}-${idx}`">
        <image class="shot" :src="src" mode="aspectFill" lazy-load />
      </swiper-item>
    </swiper>
  </view>
</template>

<style scoped>
.gallery {
  width: 100%;
  border-radius: 16rpx;
  overflow: hidden;
  background: var(--km-surface-sunken, #eef1f5);
}
.swiper { width: 100%; height: 320rpx; }
.shot { width: 100%; height: 320rpx; display: block; }
</style>
