<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  SUPPORT_BUSINESSES,
  SUPPORT_QR_ITEMS,
  openSupportChat,
  type SupportBusiness,
  type SupportChannel,
  type SupportQrItem,
} from '../../data/support';
import { t, locale, type MessageKey } from '../../i18n';
import { isDark as themeIsDark } from '@express-platform/ui-components/theme';
import { userApi } from '../../services/api';
import { onSupportSheetOpen, offSupportSheetOpen, type SupportOpenPayload } from '../../utils/supportBus';

const open = ref(false);
const lockedBiz = ref(false);
const selectedBiz = ref<SupportBusiness | null>(null);
const qrItems = ref<SupportQrItem[]>([...SUPPORT_QR_ITEMS]);
const isDark = computed(() => themeIsDark.value);
const showBizPicker = computed(() => !lockedBiz.value);

function handleOpen(payload: SupportOpenPayload = {}): void {
  lockedBiz.value = Boolean(payload.locked && payload.business);
  selectedBiz.value = payload.business ?? null;
  open.value = true;
}

function close(): void {
  open.value = false;
}

function onFabTap(): void {
  handleOpen({});
}

function pickBiz(type: SupportBusiness): void {
  if (lockedBiz.value) return;
  selectedBiz.value = type;
}

function startChannel(channel: SupportChannel): void {
  if (!selectedBiz.value) {
    uni.showToast({ title: t('support.needBiz'), icon: 'none' });
    return;
  }
  const biz = selectedBiz.value;
  close();
  openSupportChat(biz, channel);
}

async function loadConfig(): Promise<void> {
  try {
    const cfg = await userApi.supportConfig();
    if (cfg?.qrItems?.length) {
      qrItems.value = cfg.qrItems.map((item) => ({
        id: item.id,
        labelKey: `support.qr.${item.id}`,
        imageUrl: item.imageUrl,
      }));
    }
  } catch {
    /* keep placeholders */
  }
}

onMounted(() => {
  onSupportSheetOpen(handleOpen);
  void loadConfig();
});

onUnmounted(() => {
  offSupportSheetOpen(handleOpen);
});
</script>

<template>
  <!-- H5 body-mount: native HTML so createApp works outside uni page tree -->
  <div class="cs-root" :class="{ open }" :data-locale="locale">
    <button
      type="button"
      class="cs-fab"
      :class="{ dark: isDark }"
      :aria-label="t('support.fabAria')"
      @click.stop="onFabTap"
    >
      <svg class="cs-fab-ic" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
        <circle class="fab-disk" cx="24" cy="24" r="22" />
        <!-- headset band -->
        <path
          class="fab-stroke"
          d="M14 24v-2.5a10 10 0 0 1 20 0V24"
          fill="none"
          stroke-width="2.4"
          stroke-linecap="round"
        />
        <!-- ear cups -->
        <rect class="fab-fill" x="11.5" y="22.5" width="6.5" height="9.5" rx="3.2" />
        <rect class="fab-fill" x="30" y="22.5" width="6.5" height="9.5" rx="3.2" />
        <!-- mic arm + tip -->
        <path
          class="fab-stroke"
          d="M34.5 31.5v2.2a5.2 5.2 0 0 1-5.2 5.2H24"
          fill="none"
          stroke-width="2.2"
          stroke-linecap="round"
        />
        <circle class="fab-fill" cx="24" cy="38.7" r="2.1" />
      </svg>
    </button>

    <div v-if="open" class="cs-mask" @click="close">
      <div class="cs-sheet" @click.stop>
        <div class="cs-sheet-body">
          <div class="cs-title">{{ t('support.sheetTitle') }}</div>
          <div class="cs-hint">{{ t('support.sheetHint') }}</div>

          <div class="cs-qr-row">
            <div v-for="item in qrItems" :key="item.id" class="cs-qr-item">
              <img class="cs-qr-img" :src="item.imageUrl" alt="" />
              <div class="cs-qr-label">{{ t(item.labelKey as MessageKey) }}</div>
            </div>
          </div>

          <div v-if="showBizPicker" class="cs-biz">
            <div class="cs-biz-title">{{ t('support.bizTitle') }}</div>
            <div class="cs-biz-scroll">
              <div class="cs-biz-grid">
                <button
                  v-for="biz in SUPPORT_BUSINESSES"
                  :key="biz.type"
                  type="button"
                  class="cs-biz-card"
                  :class="{ on: selectedBiz === biz.type }"
                  @click="pickBiz(biz.type)"
                >
                  <div class="cs-biz-name">{{ t(biz.titleKey as MessageKey) }}</div>
                  <div class="cs-biz-desc">{{ t(biz.descKey as MessageKey) }}</div>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="cs-locked">
            <div class="cs-locked-label">{{ t('support.bizTitle') }}</div>
            <div class="cs-locked-val">{{
              t((SUPPORT_BUSINESSES.find((b) => b.type === selectedBiz)?.titleKey || 'support.bizTitle') as MessageKey)
            }}</div>
          </div>
        </div>

        <div class="cs-actions">
          <button type="button" class="cs-btn ai" @click="startChannel('ai')">{{ t('support.ai') }}</button>
          <button type="button" class="cs-btn human" @click="startChannel('human')">{{ t('support.human') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cs-root {
  position: fixed;
  top: 0;
  bottom: 0;
  left: var(--window-left, 0px);
  right: var(--window-right, 0px);
  z-index: 28;
  pointer-events: none;
}
.cs-root.open {
  z-index: 80;
}
.cs-fab {
  pointer-events: auto;
  position: fixed;
  right: calc(var(--window-right, 0px) + 16px);
  bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 16px);
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: transparent;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.28);
}
.cs-root.open .cs-fab { visibility: hidden; }
.cs-fab .cs-fab-ic { display: block; width: 48px; height: 48px; }
.fab-disk { fill: #ffffff; }
.fab-stroke { stroke: #2563eb; }
.fab-fill { fill: #2563eb; }
.cs-fab.dark .fab-disk { fill: #1e293b; }
.cs-fab.dark .fab-stroke { stroke: #93c5fd; }
.cs-fab.dark .fab-fill { fill: #93c5fd; }

.cs-mask {
  pointer-events: auto;
  position: fixed;
  top: 0;
  bottom: 0;
  left: var(--window-left, 0px);
  right: var(--window-right, 0px);
  z-index: 1;
  background: var(--km-overlay);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.cs-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: min(88vh, 920px);
  overflow: hidden;
  padding: 22px 16px 0;
  border-radius: 20px 20px 0 0;
  background: var(--km-surface, #fff);
  color: var(--km-text, var(--km-text));
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
}
.cs-sheet-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-bottom: 8px;
}
.cs-title { font-size: 18px; font-weight: 800; }
.cs-hint { margin-top: 4px; font-size: 12px; color: var(--km-text-muted, var(--km-text-secondary)); }
.cs-qr-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  justify-content: space-between;
}
.cs-qr-item { flex: 1; text-align: center; }
.cs-qr-img {
  width: 100%;
  aspect-ratio: 1;
  max-height: 88px;
  border-radius: 10px;
  background: var(--km-bg);
  border: 1px solid var(--km-divider, var(--km-border));
  object-fit: contain;
  display: block;
}
.cs-qr-label { margin-top: 4px; font-size: 11px; color: var(--km-text-muted, var(--km-text-secondary)); }

.cs-biz { margin-top: 14px; }
.cs-biz-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.cs-biz-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  margin: 0 -4px;
  padding: 0 4px 4px;
}
.cs-biz-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  width: max-content;
  min-width: 100%;
}
.cs-biz-card {
  flex: 0 0 auto;
  width: 118px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--km-divider, #e8e8e8);
  background: var(--km-bg, var(--km-surface-sunken));
  text-align: left;
  cursor: pointer;
  color: inherit;
  font: inherit;
}
.cs-biz-card.on {
  border-color: var(--km-primary, #2563eb);
  background: color-mix(in srgb, var(--km-primary, #2563eb) 10%, var(--km-surface, #fff));
}
.cs-biz-name { font-size: 13px; font-weight: 700; line-height: 1.25; }
.cs-biz-desc {
  margin-top: 2px;
  font-size: 10px;
  color: var(--km-text-muted, var(--km-text-secondary));
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cs-locked {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--km-bg, var(--km-surface-sunken));
}
.cs-locked-label { font-size: 12px; color: var(--km-text-muted, var(--km-text-secondary)); }
.cs-locked-val { margin-top: 4px; font-size: 14px; font-weight: 700; }

.cs-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  margin-top: 12px;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--km-divider, var(--km-divider));
  background: var(--km-surface, #fff);
}
.cs-btn {
  flex: 1;
  text-align: center;
  padding: 12px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
}
.cs-btn.ai { background: var(--km-primary, #2563eb); color: #fff; }
.cs-btn.human {
  background: color-mix(in srgb, var(--km-primary, #2563eb) 12%, var(--km-surface, #fff));
  color: var(--km-primary, #2563eb);
  border: 1px solid color-mix(in srgb, var(--km-primary, #2563eb) 35%, transparent);
}
</style>
