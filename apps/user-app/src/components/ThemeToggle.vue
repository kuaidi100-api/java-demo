<script setup lang="ts">
import { computed } from 'vue';
import { isDark, toggleTheme } from '@express-platform/ui-components/theme';
import { t } from '../i18n';
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';

withDefaults(defineProps<{
  mode?: 'icon' | 'row';
}>(), {
  mode: 'icon',
});

const iconName = computed(() => (isDark.value ? 'sun' : 'moon'));
const label = computed(() => (isDark.value ? t('theme.light') : t('theme.dark')));

let lastToggleAt = 0;
function onToggle(event?: Event): void {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  const now = Date.now();
  if (now - lastToggleAt < 280) return;
  lastToggleAt = now;
  toggleTheme();
}
</script>

<template>
  <view class="theme-wrap">
    <button
      v-if="mode === 'row'"
      type="button"
      class="theme-row"
      @click="onToggle"
    >
      <text class="theme-row-label">{{ t('profile.theme') }}</text>
      <text class="theme-row-value">{{ label }}</text>
      <view class="theme-row-ic"><KmIcon :name="iconName" /></view>
    </button>
    <button
      v-else
      type="button"
      class="theme-btn"
      :aria-label="label"
      :title="label"
      @click="onToggle"
    >
      <KmIcon :name="iconName" />
    </button>
  </view>
</template>

<style scoped>
.theme-btn {
  width: 64rpx;
  height: 64rpx;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  border: 1rpx solid var(--km-border);
  background: color-mix(in srgb, var(--km-surface) 88%, transparent);
  color: var(--km-text-secondary);
  font-size: 32rpx;
  line-height: 1;
  cursor: pointer;
  transition: background-color var(--km-duration) var(--km-ease), color var(--km-duration) var(--km-ease), border-color var(--km-duration) var(--km-ease);
}
.theme-btn::after { border: 0; }
.theme-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: 100%;
  margin: 0;
  padding: 22rpx 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.theme-row::after { border: 0; }
.theme-row-label { flex: 1; font-size: 26rpx; color: var(--km-text); }
.theme-row-value { font-size: 24rpx; color: var(--km-text-muted); }
.theme-row-ic { font-size: 28rpx; color: var(--km-text-secondary); display: flex; }
</style>
