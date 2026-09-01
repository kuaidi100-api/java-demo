<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../i18n';
import KmIcon from './KmIcon.vue';

const props = withDefaults(defineProps<{
  /** 0–100 */
  percent?: number;
  /** Named stage index 0–3 overrides percent mapping when set */
  stage?: number | null;
  shipmentNo?: string;
}>(), {
  percent: 0,
  stage: null,
  shipmentNo: '',
});

const stages = computed(() => [
  { key: 'warehouse', icon: 'warehouse', label: t('track.warehouse') },
  { key: 'transit', icon: 'truck', label: t('track.inTransit') },
  { key: 'delivery', icon: 'send', label: t('track.outForDelivery') },
  { key: 'done', icon: 'check', label: t('track.delivered') },
]);

const activeIndex = computed(() => {
  if (props.stage != null && props.stage >= 0) return Math.min(3, Math.floor(props.stage));
  const p = Math.max(0, Math.min(100, props.percent));
  if (p >= 100) return 3;
  if (p >= 70) return 2;
  if (p >= 35) return 1;
  return 0;
});

const fillWidth = computed(() => {
  if (props.stage != null && props.stage >= 0) {
    return `${(Math.min(3, props.stage) / 3) * 100}%`;
  }
  return `${Math.max(0, Math.min(100, props.percent))}%`;
});
</script>

<template>
  <view class="tp km-route-texture">
    <view class="tp-head">
      <text class="tp-label">{{ t('track.progress') }}</text>
      <view v-if="shipmentNo" class="tp-barcode">
        <KmIcon name="barcode" class="tp-barcode-ic" />
        <text class="tp-no">{{ shipmentNo }}</text>
      </view>
    </view>
    <view class="tp-rail">
      <view class="tp-track" />
      <view class="tp-fill" :style="{ width: fillWidth }" />
    </view>
    <view class="tp-stages">
      <view
        v-for="(s, i) in stages"
        :key="s.key"
        class="tp-stage"
        :class="{ done: i < activeIndex, active: i === activeIndex }"
      >
        <view class="tp-icon"><KmIcon :name="s.icon" /></view>
        <text class="tp-stage-label">{{ s.label }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.tp {
  padding: var(--km-space-4);
  border-radius: var(--km-radius-card);
  background: var(--km-surface);
  border: 1px solid var(--km-border);
  box-shadow: var(--km-shadow-card);
}
.tp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--km-space-3);
  margin-bottom: var(--km-space-4);
  position: relative;
  z-index: 1;
}
.tp-label {
  font-size: var(--km-font-caption);
  font-weight: var(--km-weight-semibold);
  letter-spacing: var(--km-tracking-wide);
  text-transform: uppercase;
  color: var(--km-text-muted);
}
.tp-barcode {
  display: flex;
  align-items: center;
  gap: var(--km-space-1);
  max-width: 60%;
  color: var(--km-text-secondary);
}
.tp-barcode-ic { font-size: 18px; }
.tp-no {
  font-size: var(--km-font-caption);
  font-weight: var(--km-weight-medium);
  color: var(--km-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tp-rail {
  position: relative;
  height: 6px;
  margin: 0 8px 20px;
  z-index: 1;
}
.tp-track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--km-divider);
}
.tp-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--km-primary), var(--km-accent));
  box-shadow: 0 0 12px var(--km-primary-glow);
  transition: width var(--km-duration) var(--km-ease);
}
.tp-stages {
  display: flex;
  justify-content: space-between;
  gap: var(--km-space-2);
  position: relative;
  z-index: 1;
}
.tp-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--km-space-2);
  min-width: 0;
  color: var(--km-text-muted);
}
.tp-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: var(--km-surface-sunken);
  border: 1px solid var(--km-border);
  transition: background-color var(--km-duration) var(--km-ease), color var(--km-duration) var(--km-ease), border-color var(--km-duration) var(--km-ease);
}
.tp-stage.active .tp-icon,
.tp-stage.done .tp-icon {
  background: var(--km-primary-soft);
  border-color: color-mix(in srgb, var(--km-primary) 28%, transparent);
  color: var(--km-primary);
}
.tp-stage.active .tp-icon {
  box-shadow: 0 0 0 3px var(--km-primary-glow);
}
.tp-stage-label {
  font-size: 11px;
  line-height: 1.3;
  text-align: center;
  color: inherit;
}
.tp-stage.active .tp-stage-label,
.tp-stage.done .tp-stage-label {
  color: var(--km-text);
  font-weight: var(--km-weight-medium);
}
</style>
