<template>
  <view class="dial" @tap.stop="open = !open">
    <text class="dial-code">{{ modelValue }}</text>
    <text class="dial-caret">▾</text>
  </view>
  <view v-if="open" class="dial-mask" @tap="open = false">
    <view class="dial-sheet" @tap.stop>
      <text class="dial-title">{{ t('dial.title') }}</text>
      <view
        v-for="item in options"
        :key="item.code"
        class="dial-item"
        :class="{ on: item.code === modelValue }"
        @tap="pick(item.code)"
      >
        <text class="dial-flag">{{ item.flag }}</text>
        <text class="dial-name">{{ t(item.nameKey) }}</text>
        <text class="dial-num">{{ item.code }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { t, type MessageKey } from '../i18n';

const props = defineProps<{ modelValue: string }>();
void props;
const emit = defineEmits<{ 'update:modelValue': [string] }>();

const open = ref(false);

const options: { code: string; flag: string; nameKey: MessageKey }[] = [
  { code: '+856', flag: '🇱🇦', nameKey: 'dial.la' },
  { code: '+86', flag: '🇨🇳', nameKey: 'dial.cn' },
  { code: '+66', flag: '🇹🇭', nameKey: 'dial.th' },
  { code: '+84', flag: '🇻🇳', nameKey: 'dial.vn' },
  { code: '+95', flag: '🇲🇲', nameKey: 'dial.mm' },
  { code: '+60', flag: '🇲🇾', nameKey: 'dial.my' },
  { code: '+855', flag: '🇰🇭', nameKey: 'dial.kh' },
];

function pick(code: string): void {
  emit('update:modelValue', code);
  open.value = false;
}
</script>

<style scoped>
.dial {
  display: flex; align-items: center; gap: 6rpx; padding-right: 12rpx;
  border-right: 1rpx solid var(--km-border); margin-right: 4rpx; flex-shrink: 0;
}
.dial-code { font-size: 26rpx; font-weight: 600; color: var(--km-text); }
.dial-caret { font-size: 18rpx; color: var(--km-text-muted); }
.dial-mask {
  position: fixed; inset: 0; z-index: 1000;
  background: color-mix(in srgb, var(--km-text) 40%, transparent);
  display: flex; align-items: flex-end;
}
.dial-sheet {
  width: 100%; max-height: 70vh; overflow-y: auto;
  background: var(--km-surface); border-radius: 24rpx 24rpx 0 0;
  padding: 28rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
}
.dial-title { display: block; font-size: 30rpx; font-weight: 700; margin-bottom: 16rpx; color: var(--km-text); }
.dial-item {
  display: flex; align-items: center; gap: 16rpx; padding: 22rpx 8rpx;
  border-bottom: 1rpx solid var(--km-divider);
}
.dial-item.on { background: color-mix(in srgb, var(--km-primary) 8%, transparent); }
.dial-flag { font-size: 32rpx; }
.dial-name { flex: 1; font-size: 26rpx; color: var(--km-text); }
.dial-num { font-size: 26rpx; color: var(--km-text-secondary); font-weight: 600; }
</style>
