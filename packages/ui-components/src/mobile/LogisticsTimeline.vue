<script setup lang="ts">
export type TimelineItem = {
  id?: string;
  title: string;
  description?: string;
  time?: string;
  active?: boolean;
};

withDefaults(defineProps<{
  items: TimelineItem[];
  emptyTitle?: string;
  emptyHint?: string;
}>(), {
  emptyTitle: '等待物流轨迹',
  emptyHint: '',
});
</script>

<template>
  <view class="lt">
    <view v-if="!items.length" class="lt-empty">
      <text class="lt-empty-title">{{ emptyTitle }}</text>
      <text v-if="emptyHint" class="lt-empty-hint">{{ emptyHint }}</text>
    </view>
    <view
      v-for="(item, index) in items"
      v-else
      :key="item.id ?? `${item.title}-${index}`"
      class="lt-item"
      :class="{ active: item.active ?? index === 0 }"
    >
      <view class="lt-axis">
        <view class="lt-dot" />
        <view v-if="index < items.length - 1" class="lt-line" />
      </view>
      <view class="lt-body">
        <text class="lt-title">{{ item.title }}</text>
        <text v-if="item.description" class="lt-desc">{{ item.description }}</text>
        <text v-if="item.time" class="lt-time">{{ item.time }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.lt { display: flex; flex-direction: column; gap: 0; }
.lt-empty { padding: var(--km-space-6) var(--km-space-2); text-align: center; }
.lt-empty-title { display: block; font-size: var(--km-font-body); font-weight: var(--km-weight-semibold); color: var(--km-text); }
.lt-empty-hint { display: block; margin-top: var(--km-space-2); font-size: var(--km-font-caption); color: var(--km-text-muted); line-height: var(--km-line-caption); }
.lt-item { display: flex; gap: var(--km-space-3); min-height: 72px; }
.lt-axis { display: flex; flex-direction: column; align-items: center; width: 16px; flex-shrink: 0; }
.lt-dot {
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  border: 2px solid var(--km-border-strong);
  background: var(--km-surface);
  box-sizing: border-box;
}
.lt-item.active .lt-dot {
  border-color: var(--km-primary);
  background: var(--km-primary);
  box-shadow: 0 0 0 4px var(--km-primary-glow);
}
.lt-line {
  flex: 1;
  width: 2px;
  margin: 6px 0 2px;
  background: var(--km-divider);
  border-radius: 1px;
}
.lt-body { flex: 1; min-width: 0; padding-bottom: var(--km-space-4); }
.lt-title {
  display: block;
  font-size: var(--km-font-body);
  font-weight: var(--km-weight-semibold);
  line-height: var(--km-line-subtitle);
  color: var(--km-text);
  letter-spacing: var(--km-tracking-tight);
}
.lt-desc {
  display: block;
  margin-top: var(--km-space-1);
  font-size: var(--km-font-caption);
  line-height: var(--km-line-caption);
  color: var(--km-text-secondary);
  word-break: break-word;
}
.lt-time {
  display: block;
  margin-top: var(--km-space-2);
  font-size: var(--km-font-overline);
  color: var(--km-text-muted);
  letter-spacing: 0.02em;
}
</style>
