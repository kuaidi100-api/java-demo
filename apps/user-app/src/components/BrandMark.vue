<script setup lang="ts">
import { computed } from 'vue';
import { locale, t } from '../i18n';

withDefaults(defineProps<{
  /** home header | compact nav */
  size?: 'lg' | 'md';
}>(), {
  size: 'lg',
});

const isCjk = computed(() => locale.value === 'zh-CN' || locale.value === 'zh-Hant');

const mark = computed(() => t('brand.logo'));

const cjkChars = computed(() => {
  const text = mark.value;
  return [...text].map((ch, index) => ({
    ch,
    flower: isCjk.value && index === 1,
  }));
});
</script>

<template>
  <view class="brand" :class="[size, { cjk: isCjk }]">
    <view class="brand-main">
      <view v-if="isCjk" class="cjk-row">
        <view v-for="(item, i) in cjkChars" :key="i" class="cjk-cell">
          <view v-if="item.flower" class="flower" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="flower-svg">
              <g fill="currentColor">
                <ellipse cx="12" cy="5.2" rx="2.4" ry="4.2" />
                <ellipse cx="12" cy="5.2" rx="2.4" ry="4.2" transform="rotate(72 12 12)" />
                <ellipse cx="12" cy="5.2" rx="2.4" ry="4.2" transform="rotate(144 12 12)" />
                <ellipse cx="12" cy="5.2" rx="2.4" ry="4.2" transform="rotate(216 12 12)" />
                <ellipse cx="12" cy="5.2" rx="2.4" ry="4.2" transform="rotate(288 12 12)" />
                <circle cx="12" cy="12" r="2.1" fill="#fff" opacity="0.95" />
              </g>
            </svg>
          </view>
          <text class="cjk-ch">{{ item.ch }}</text>
        </view>
      </view>
      <text v-else class="latin-mark">{{ mark }}</text>
      <view class="speed" aria-hidden="true">
        <view class="speed-line l1" />
        <view class="speed-line l2" />
        <view class="speed-line l3" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: flex-end;
  gap: 10rpx;
  min-width: 0;
}
.brand-main {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}
.cjk-row {
  display: flex;
  align-items: flex-end;
  gap: 2rpx;
  transform: skewX(-6deg);
}
.cjk-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cjk-ch {
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #f97316;
}
.brand.lg .cjk-ch { font-size: 48rpx; }
.flower {
  position: absolute;
  top: -22rpx;
  left: 50%;
  transform: translateX(-50%) skewX(6deg);
  width: 22rpx;
  height: 22rpx;
  color: #f97316;
  z-index: 1;
}
.flower-svg { width: 100%; height: 100%; display: block; }
.latin-mark {
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #f97316;
  font-style: italic;
  max-width: 340rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brand.lg .latin-mark { font-size: 40rpx; }
.speed {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-top: 8rpx;
  width: 78%;
  max-width: 220rpx;
}
.speed-line {
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #f97316 0%, #fb923c 55%, transparent 100%);
  transform-origin: left center;
}
.speed-line.l1 { width: 100%; opacity: 1; }
.speed-line.l2 { width: 82%; opacity: 0.85; }
.speed-line.l3 { width: 64%; opacity: 0.7; }
.brand.md .cjk-ch { font-size: 36rpx; }
.brand.md .latin-mark { font-size: 30rpx; }
.brand.md .flower { top: -18rpx; width: 18rpx; height: 18rpx; }
</style>
