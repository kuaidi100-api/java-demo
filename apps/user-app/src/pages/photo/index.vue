<script setup lang="ts">
import { computed, ref } from 'vue';
import { PHOTO_CATEGORIES, PHOTO_PACKAGES, PHOTO_REELS, PHOTO_SAMPLES, type PhotoCategory } from '../../data/photo';
import { backOrHome } from '../../utils/navigation';
import { track } from '../../utils/analytics';
import { t } from '../../i18n';

const category = ref<PhotoCategory | 'all'>('all');

const samples = computed(() =>
  category.value === 'all'
    ? PHOTO_SAMPLES
    : PHOTO_SAMPLES.filter((item) => item.category === category.value),
);

function goBack(): void { backOrHome(); }

function setCategory(id: PhotoCategory | 'all'): void {
  category.value = id;
  track('photo_category_click', { category: id });
}

function openPackage(id: string): void {
  track('photo_package_click', { packageId: id });
  uni.navigateTo({ url: `/pages/photo/package?id=${encodeURIComponent(id)}` });
}
</script>

<template>
  <view class="page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('photo.title') }}</text>
      <text class="ph" />
    </view>

    <view class="hero">
      <text class="hero-kicker">{{ t('photo.kicker') }}</text>
      <text class="hero-title">{{ t('photo.heroTitle') }}</text>
      <text class="hero-desc">{{ t('photo.heroDesc') }}</text>
    </view>

    <scroll-view scroll-x class="cat-scroll" :show-scrollbar="false">
      <view class="cat-row">
        <text
          class="cat"
          :class="{ active: category === 'all' }"
          @tap="setCategory('all')"
        >{{ t('photo.all') }}</text>
        <text
          v-for="c in PHOTO_CATEGORIES"
          :key="c.id"
          class="cat"
          :class="{ active: category === c.id }"
          @tap="setCategory(c.id)"
        >{{ c.label }}</text>
      </view>
    </scroll-view>

    <view class="masonry">
      <view
        v-for="(item, index) in samples"
        :key="item.id"
        class="shot"
        :class="{ tall: index % 3 === 0 }"
        :style="{ background: item.tone }"
      >
        <text class="shot-title">{{ item.title }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">{{ t('photo.reelsTitle') }}</text>
      <scroll-view scroll-x class="reel-scroll" :show-scrollbar="false">
        <view class="reel-row">
          <view
            v-for="reel in PHOTO_REELS"
            :key="reel.id"
            class="reel"
            :style="{ background: reel.tone }"
          >
            <text class="play">▶</text>
            <text class="reel-title">{{ reel.title }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section">
      <text class="section-title">{{ t('photo.packagesTitle') }}</text>
      <view class="compare">
        <view class="compare-head">
          <text>{{ t('photo.pkgCol') }}</text>
          <text>{{ t('photo.outfits') }}</text>
          <text>{{ t('photo.retouched') }}</text>
          <text>{{ t('photo.hours') }}</text>
        </view>
        <view
          v-for="pkg in PHOTO_PACKAGES"
          :key="pkg.id"
          class="compare-row"
          @tap="openPackage(pkg.id)"
        >
          <text class="name">{{ pkg.name }}</text>
          <text>{{ pkg.outfits }}</text>
          <text>{{ pkg.retouched }}</text>
          <text>{{ pkg.hours }}h</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 48rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 16rpx; background: var(--km-surface, #fff); }
.back { width: 60rpx; font-size: 44rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; }
.ph { width: 60rpx; }
.hero {
  margin: 16rpx 28rpx 8rpx; padding: 36rpx 28rpx; border-radius: 24rpx; color: #fff;
  background: linear-gradient(145deg, #1a1f2e 0%, #3d4f6f 55%, #8aa4c8 100%);
}
.hero-kicker { display: block; font-size: 18rpx; letter-spacing: 2rpx; opacity: 0.85; }
.hero-title { display: block; margin-top: 10rpx; font-size: 42rpx; font-weight: 800; }
.hero-desc { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.5; opacity: 0.9; }
.cat-scroll { white-space: nowrap; }
.cat-row { display: inline-flex; gap: 12rpx; padding: 16rpx 28rpx; }
.cat {
  padding: 12rpx 24rpx; border-radius: 999rpx; background: var(--km-surface, #fff);
  font-size: 24rpx; color: var(--km-text-secondary); border: 1rpx solid var(--km-border, var(--km-border));
}
.cat.active { background: #1a1f2e; color: #fff; border-color: #1a1f2e; }
.masonry { display: grid; grid-template-columns: 1fr 1fr; gap: 14rpx; padding: 8rpx 28rpx 12rpx; }
.shot {
  min-height: 220rpx; border-radius: 18rpx; padding: 20rpx; color: #fff;
  display: flex; align-items: flex-end;
}
.shot.tall { min-height: 300rpx; grid-row: span 1; }
.shot-title { font-size: 24rpx; font-weight: 700; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.35); }
.section { margin: 18rpx 28rpx 0; }
.section-title { display: block; font-size: 30rpx; font-weight: 800; margin-bottom: 14rpx; }
.reel-scroll { white-space: nowrap; }
.reel-row { display: inline-flex; gap: 14rpx; }
.reel {
  width: 280rpx; height: 160rpx; border-radius: 16rpx; padding: 18rpx; color: #fff;
  display: flex; flex-direction: column; justify-content: space-between;
}
.play { font-size: 28rpx; }
.reel-title { font-size: 22rpx; font-weight: 650; }
.compare {
  background: var(--km-surface, #fff); border-radius: 18rpx; border: 1rpx solid var(--km-border, var(--km-border)); overflow: hidden;
}
.compare-head, .compare-row {
  display: grid; grid-template-columns: 1.4fr 0.7fr 0.7fr 0.7fr; gap: 8rpx;
  padding: 18rpx 16rpx; font-size: 22rpx; text-align: center;
}
.compare-head { background: var(--km-surface-sunken); color: var(--km-text-muted); font-weight: 700; }
.compare-row { border-top: 1rpx solid var(--km-divider); color: var(--km-text, var(--km-text)); }
.compare-row .name { text-align: left; font-weight: 800; color: var(--km-primary, #2563eb); }
</style>
