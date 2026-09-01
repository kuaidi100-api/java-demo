<script setup lang="ts">
import { computed, ref } from 'vue';
import { isDark } from '@express-platform/ui-components/theme';
import { locale, localeOptions, setLocale, t, localeAbbr, type Locale } from '../i18n';
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';

const currentNative = computed(() => {
  void locale.value;
  return localeOptions.find((item) => item.code === locale.value)?.native ?? t('profile.language');
});

const abbr = computed(() => {
  void locale.value;
  return localeAbbr(locale.value);
});

withDefaults(defineProps<{
  compact?: boolean;
  mode?: 'button' | 'row' | 'nav';
}>(), {
  mode: 'nav',
});

const open = ref(false);

function openPicker(): void {
  open.value = true;
}

function closePicker(): void {
  open.value = false;
}

function pick(code: Locale): void {
  setLocale(code);
  open.value = false;
}
</script>

<template>
  <view class="lang-wrap">
    <view
      v-if="mode === 'row'"
      class="lang-row"
      @click="openPicker"
    >
      <text class="lang-row-label">{{ t('profile.language') }}</text>
      <text class="lang-row-value">{{ currentNative }}</text>
      <text class="lang-row-chev">›</text>
    </view>
    <view
      v-else
      class="lang-nav"
      :class="{ compact, pill: mode === 'button' }"
      @click="openPicker"
    >
      <KmIcon name="globe" class="lang-ic" />
      <text class="lang-abbr">{{ abbr }}</text>
    </view>

    <!-- Themed sheet: native showActionSheet ignores app dark/light tokens -->
    <view
      v-if="open"
      class="lang-mask"
      :class="{ dark: isDark }"
      @click.stop="closePicker"
    >
      <view class="lang-sheet" @click.stop>
        <text class="lang-sheet-title">{{ t('profile.language') }}</text>
        <view
          v-for="item in localeOptions"
          :key="item.code"
          class="lang-option"
          :class="{ on: item.code === locale }"
          @click="pick(item.code)"
        >
          <text class="lang-option-native">{{ item.native }}</text>
          <text class="lang-option-code">{{ localeAbbr(item.code) }}</text>
        </view>
        <view class="lang-cancel" @click="closePicker">取消 / Cancel</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.lang-nav {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  height: 64rpx;
  padding: 0 18rpx 0 14rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--km-border);
  background: color-mix(in srgb, var(--km-surface) 88%, transparent);
  color: var(--km-text-secondary);
  transition: background-color var(--km-duration) var(--km-ease), border-color var(--km-duration) var(--km-ease), color var(--km-duration) var(--km-ease);
}
.lang-nav.compact { height: 56rpx; padding: 0 14rpx 0 12rpx; }
.lang-ic { font-size: 28rpx; }
.lang-abbr {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--km-text);
}
.lang-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: 100%;
  padding: 22rpx 0;
}
.lang-row-label { flex: 1; font-size: 26rpx; color: var(--km-text); }
.lang-row-value { font-size: 24rpx; color: var(--km-text-muted); }
.lang-row-chev { font-size: 28rpx; color: var(--km-text-muted); opacity: 0.5; }

.lang-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: var(--window-left, 0px);
  right: var(--window-right, 0px);
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--km-overlay);
  padding: 0;
}
.lang-sheet {
  width: 100%;
  padding: 20rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: var(--km-surface);
  color: var(--km-text);
  box-shadow: var(--km-shadow-floating);
}
.lang-sheet-title {
  display: block;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--km-text-muted);
  padding: 8rpx 0 20rpx;
}
.lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 28rpx 20rpx;
  margin-bottom: 8rpx;
  border-radius: 16rpx;
  background: var(--km-surface-sunken);
  border: 1rpx solid transparent;
}
.lang-option.on {
  background: var(--km-primary-soft);
  border-color: color-mix(in srgb, var(--km-primary) 30%, transparent);
}
.lang-option-native {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--km-text);
}
.lang-option.on .lang-option-native { color: var(--km-primary); }
.lang-option-code {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--km-text-muted);
  letter-spacing: 0.04em;
}
.lang-cancel {
  margin-top: 12rpx;
  text-align: center;
  padding: 26rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--km-text-secondary);
  background: var(--km-bg);
}
</style>
