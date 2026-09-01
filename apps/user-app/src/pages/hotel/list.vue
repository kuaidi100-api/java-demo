<script setup lang="ts">
import { ref } from 'vue';
import { backOrHome } from '../../utils/navigation';
import { FEATURED_HOTELS, MORE_HOTELS } from '../../data/hotels';
import { track } from '../../utils/analytics';
import { t } from '../../i18n';
import SupportContactBtn from '../../components/support/SupportContactBtn.vue';

const showMore = ref(false);

function goBack(): void { backOrHome(); }

function openHotel(id: string): void {
  track('hotel_card_click', { hotelId: id });
  uni.navigateTo({ url: `/pages/hotel/detail?id=${encodeURIComponent(id)}` });
}

function toggleMore(): void {
  showMore.value = !showMore.value;
  track('hotel_more_toggle', { open: showMore.value });
}
</script>

<template>
  <view class="page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('hotel.listTitle') }}</text>
      <SupportContactBtn business="HOTEL" />
    </view>

    <view class="hero">
      <text class="hero-kicker">{{ t('hotel.brandKicker') }}</text>
      <text class="hero-title">{{ t('hotel.brandTitle') }}</text>
      <text class="hero-desc">{{ t('hotel.brandDesc') }}</text>
    </view>

    <view
      v-for="hotel in FEATURED_HOTELS"
      :key="hotel.id"
      class="hotel-card"
      @tap="openHotel(hotel.id)"
    >
      <view class="cover" :style="hotel.coverImage ? undefined : { background: hotel.coverGradient }">
        <image
          v-if="hotel.coverImage"
          class="cover-img"
          :src="hotel.coverImage"
          mode="aspectFill"
          lazy-load
        />
        <view class="cover-shade" />
        <view class="tags">
          <text v-for="tag in hotel.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
        <text class="cover-name">{{ hotel.name }}</text>
      </view>
      <view class="body">
        <text class="loc">{{ hotel.location }}</text>
        <text class="summary">{{ hotel.summary }}</text>
        <text class="cta">{{ t('hotel.viewDetail') }} →</text>
      </view>
    </view>

    <view class="more-wrap">
      <view class="more-btn" @tap="toggleMore">
        <text>{{ showMore ? t('hotel.collapseMore') : t('hotel.moreHotels') }}</text>
        <text class="more-chev">{{ showMore ? '▴' : '▾' }}</text>
      </view>
    </view>

    <view v-if="showMore">
      <view
        v-for="hotel in MORE_HOTELS"
        :key="hotel.id"
        class="hotel-card more"
        @tap="openHotel(hotel.id)"
      >
        <view class="cover" :style="hotel.coverImage ? undefined : { background: hotel.coverGradient }">
          <image
            v-if="hotel.coverImage"
            class="cover-img"
            :src="hotel.coverImage"
            mode="aspectFill"
            lazy-load
          />
          <view class="cover-shade" />
          <view class="tags">
            <text v-for="tag in hotel.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
          <text class="cover-name">{{ hotel.name }}</text>
        </view>
        <view class="body">
          <text class="loc">{{ hotel.location }}</text>
          <text class="summary">{{ hotel.summary }}</text>
          <text class="cta">{{ t('hotel.viewDetail') }} →</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 48rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 16rpx; background: var(--km-surface, #fff); gap: 12rpx; }
.back { width: 60rpx; font-size: 44rpx; }
.topbar-title { flex: 1; font-size: 32rpx; font-weight: 700; text-align: center; }
.hero { padding: 28rpx 32rpx 8rpx; }
.hero-kicker { display: block; font-size: 18rpx; letter-spacing: 2rpx; color: var(--km-primary, #2563eb); font-weight: 700; }
.hero-title { display: block; margin-top: 8rpx; font-size: 40rpx; font-weight: 800; color: var(--km-text); }
.hero-desc { display: block; margin-top: 10rpx; font-size: 24rpx; color: var(--km-text-muted); line-height: 1.5; }
.hotel-card {
  margin: 20rpx 28rpx; border-radius: 24rpx; overflow: hidden;
  background: var(--km-surface, #fff); border: 1rpx solid var(--km-border);
  box-shadow: var(--km-shadow-card);
}
.hotel-card.more { opacity: 0.98; }
.cover {
  position: relative;
  min-height: 260rpx;
  padding: 28rpx;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  background: #1f2937;
}
.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.cover-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.55) 100%);
  pointer-events: none;
}
.tags { position: relative; z-index: 2; display: flex; flex-wrap: wrap; gap: 10rpx; margin-bottom: 16rpx; }
.tag { padding: 6rpx 14rpx; border-radius: 999rpx; background: rgba(255,255,255,0.22); font-size: 20rpx; }
.cover-name { position: relative; z-index: 2; font-size: 40rpx; font-weight: 800; letter-spacing: 0.02em; text-shadow: 0 2rpx 10rpx rgba(0,0,0,0.35); }
.body { padding: 22rpx 24rpx 26rpx; }
.loc { display: block; font-size: 22rpx; color: var(--km-text-muted); }
.summary { display: block; margin-top: 10rpx; font-size: 24rpx; color: var(--km-text-secondary); line-height: 1.55; }
.cta { display: block; margin-top: 16rpx; font-size: 24rpx; font-weight: 700; color: var(--km-primary, #2563eb); }
.more-wrap { padding: 8rpx 28rpx 12rpx; }
.more-btn {
  display: flex; align-items: center; justify-content: center; gap: 10rpx;
  height: 84rpx; border-radius: 20rpx;
  background: var(--km-surface); border: 1rpx dashed color-mix(in srgb, #2563eb 35%, var(--km-border));
  color: var(--km-primary, #2563eb); font-size: 28rpx; font-weight: 700;
}
.more-chev { font-size: 24rpx; opacity: 0.8; }
</style>
