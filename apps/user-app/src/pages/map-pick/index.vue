<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';
import { t } from '../../i18n';
import { useAuthStore } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import {
  SEZ_BOUNDS,
  SEZ_CENTER,
  SEZ_LANDMARKS_IN_ZONE,
  clampToSez,
  nearestSezName,
} from '../../data/geo-sez';
import { SezAerialMap } from '../delivery-3d/SezAerialMap';
import { locateErrorMessage, locateMe } from '../../utils/locateMe';

const CENTER = SEZ_CENTER;
const landmarks = SEZ_LANDMARKS_IN_ZONE;

type MapPickRole =
  | 'sender'
  | 'recipient'
  | 'moving_from'
  | 'moving_to'
  | 'ride_from'
  | 'ride_to';

const role = ref<MapPickRole>('sender');
const picking = ref(false);
const lat = ref(CENTER.lat);
const lng = ref(CENTER.lng);
const zoom = ref(16.2);
const pitched = ref(true);
const label = ref(landmarks.find((l) => l.id === 'huanglou')?.name ?? landmarks[0].name);
const auth = useAuthStore();
const mapHostRef = ref<HTMLElement | null>(null);
const locating = ref(false);

const lifestyleRoles: MapPickRole[] = ['moving_from', 'moving_to', 'ride_from', 'ride_to'];
const isLifestylePick = computed(() => lifestyleRoles.includes(role.value));

let map: SezAerialMap | null = null;
/** After chip pick, ignore one moveend so label isn't overwritten mid-flight */
let lockLabelUntil = 0;

onLoad((query) => {
  const next = String(query?.role || 'sender') as MapPickRole;
  const allowed: MapPickRole[] = ['sender', 'recipient', ...lifestyleRoles];
  role.value = allowed.includes(next) ? next : 'sender';
});

function resolveHost(): HTMLElement | null {
  const raw = mapHostRef.value as { $el?: HTMLElement } | HTMLElement | null;
  if (raw && '$el' in raw && raw.$el instanceof HTMLElement) return raw.$el;
  if (raw instanceof HTMLElement) return raw;
  return document.querySelector('.map-world') as HTMLElement | null;
}

function syncFromCenter(ll: { lng: number; lat: number }, z: number): void {
  const c = clampToSez(ll.lat, ll.lng, false);
  lat.value = c.lat;
  lng.value = c.lng;
  zoom.value = z;
  if (Date.now() < lockLabelUntil) return;
  label.value = nearestSezName(c.lat, c.lng);
}

async function bootMap(): Promise<void> {
  await nextTick();
  const host = resolveHost();
  if (!host) return;
  map?.dispose();
  map = new SezAerialMap({
    host,
    zoom: 16.2,
    pitch: 52,
    bearing: -24,
    showControls: false,
    minZoom: 13.5,
    maxZoom: 18.8,
    maxBounds: [
      [SEZ_BOUNDS.minLng - 0.012, SEZ_BOUNDS.minLat - 0.006],
      [SEZ_BOUNDS.maxLng + 0.008, SEZ_BOUNDS.maxLat + 0.006],
    ],
  });
  await map.loadLocalLayers();
  map.onViewChange((ll, z) => syncFromCenter(ll, z));
  const start = landmarks.find((l) => l.id === 'huanglou') ?? landmarks[0];
  lat.value = start.lat;
  lng.value = start.lng;
  label.value = start.name;
  lockLabelUntil = Date.now() + 900;
  map.focusLngLat(start.lng, start.lat);
  zoom.value = map.getZoom();
  map.resize();
}

function onResize(): void {
  map?.resize();
}

onMounted(() => {
  window.addEventListener('resize', onResize);
  void bootMap();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  map?.dispose();
  map = null;
});

function pickLandmark(item: (typeof landmarks)[number]): void {
  lat.value = item.lat;
  lng.value = item.lng;
  label.value = item.name;
  lockLabelUntil = Date.now() + 1000;
  map?.focusLngLat(item.lng, item.lat);
  zoom.value = map?.getZoom() ?? zoom.value;
}

function zoomBy(delta: number): void {
  if (delta > 0) map?.softZoomIn();
  else map?.softZoomOut();
}

function tilt3d(): void {
  pitched.value = !pitched.value;
  map?.setPitch(pitched.value ? 52 : 0);
}

async function locateSelf(): Promise<void> {
  if (locating.value || !map) return;
  locating.value = true;
  try {
    const pos = await locateMe();
    lockLabelUntil = Date.now() + 1200;
    lat.value = pos.mapLat;
    lng.value = pos.mapLng;
    label.value = nearestSezName(pos.mapLat, pos.mapLng);
    map.showSelfLocation(pos.mapLng, pos.mapLat, { zoom: 17.2 });
    zoom.value = map.getZoom();
    uni.showToast({
      title: pos.outsideSez ? t('map.locateOutside') : t('map.locateOk'),
      icon: 'none',
    });
  } catch (cause: unknown) {
    uni.showToast({ title: locateErrorMessage(cause), icon: 'none' });
  } finally {
    locating.value = false;
  }
}

function title(): string {
  if (role.value === 'moving_from' || role.value === 'ride_from') return t('map.pickFrom');
  if (role.value === 'moving_to' || role.value === 'ride_to') return t('map.pickTo');
  return role.value === 'sender' ? t('map.pickTitle') : t('map.dropTitle');
}

function goBackSafe(): void {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  if (role.value.startsWith('ride')) {
    uni.redirectTo({ url: '/pages/ride/index' });
    return;
  }
  if (role.value.startsWith('moving')) {
    uni.redirectTo({ url: '/pages/moving/index' });
    return;
  }
  uni.redirectTo({ url: '/pages/flash/index' });
}

function detailText(): string {
  return `金三角经济特区 · ${label.value}（${lat.value.toFixed(5)}, ${lng.value.toFixed(5)}）`;
}

async function confirm(): Promise<void> {
  if (picking.value) return;
  if (map) {
    const ll = map.getFocusLngLat();
    const c = clampToSez(ll.lat, ll.lng, false);
    lat.value = c.lat;
    lng.value = c.lng;
    zoom.value = map.getZoom();
    if (Date.now() >= lockLabelUntil) {
      label.value = nearestSezName(c.lat, c.lng);
    }
  }

  if (isLifestylePick.value) {
    uni.setStorageSync('km.lifestyle.mapPick', {
      role: role.value,
      lat: lat.value,
      lng: lng.value,
      label: label.value,
    });
    goBackSafe();
    return;
  }

  picking.value = true;
  const detail = detailText();
  const phone = requirePhone();
  try {
    if (phone) {
      const created = await userApi.createAddress({
        label: role.value === 'sender' ? '地图取件' : '地图收件',
        contactName: auth.subject?.displayName?.trim() || '木棉用户',
        phone,
        country: '老挝',
        countryCode: 'LA',
        province: '博胶省',
        city: '金三角经济特区',
        district: '通佩县',
        detail,
        latitude: lat.value,
        longitude: lng.value,
      });
      uni.setStorageSync('km.flash.mapPick', {
        role: role.value,
        id: created.id,
        detail: created.detail || detail,
        lat: lat.value,
        lng: lng.value,
        label: label.value,
      });
    } else {
      // 未绑定手机号时仍可带回选点，避免卡在选点页
      uni.setStorageSync('km.flash.mapPick', {
        role: role.value,
        detail,
        lat: lat.value,
        lng: lng.value,
        label: label.value,
      });
    }
    goBackSafe();
  } catch (cause: unknown) {
    uni.setStorageSync('km.flash.mapPick', {
      role: role.value,
      detail,
      lat: lat.value,
      lng: lng.value,
      label: label.value,
    });
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 1800 });
    setTimeout(() => goBackSafe(), 400);
  } finally {
    picking.value = false;
  }
}

function requirePhone(): string | null {
  const value = auth.subject?.identifier?.trim() ?? '';
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null;
}

function goBack(): void {
  goBackSafe();
}
</script>

<template>
  <view class="pick-page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <view class="titles">
        <text class="title">{{ title() }}</text>
        <text class="sub">{{ t('map.sub') }}</text>
      </view>
    </view>

    <view class="map-stage">
      <view ref="mapHostRef" class="map-world" />
      <view class="center-pin">
        <KmIcon name="pin" class="pin-ic" />
      </view>
      <view class="zoom-stack">
        <view class="zoom-btn" @tap.stop="zoomBy(0.7)">+</view>
        <view class="zoom-btn" @tap.stop="zoomBy(-0.7)">−</view>
        <view class="zoom-btn tilt" :class="{ on: pitched }" @tap.stop="tilt3d">3D</view>
        <view class="zoom-btn locate" :class="{ busy: locating }" @tap.stop="locateSelf">
          {{ locating ? '…' : t('map.locate') }}
        </view>
      </view>
      <text class="hint">{{ t('map.hint', { zoom: zoom.toFixed(1) }) }}</text>
    </view>

    <scroll-view scroll-x class="chips" :show-scrollbar="false" enable-flex>
      <view class="chip-row">
        <view
          v-for="item in landmarks"
          :key="item.id"
          class="chip"
          :class="{ on: label === item.name }"
          @tap.stop="pickLandmark(item)"
        >
          <text class="chip-text">{{ item.name }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="confirm-bar">
      <view class="meta">
        <text class="meta-kicker">{{ t('map.selected') }}</text>
        <text class="meta-title">{{ label }}</text>
        <text class="meta-geo">{{ lat.toFixed(5) }}, {{ lng.toFixed(5) }}</text>
      </view>
      <view class="ok" :class="{ disabled: picking }" @tap.stop="confirm">
        {{ picking ? t('map.saving') : t('map.confirm') }}
      </view>
    </view>
  </view>
</template>

<style scoped>
.pick-page {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--km-bg);
  overflow: hidden;
}
.topbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 64rpx 24rpx 16rpx;
  background: var(--km-surface);
  border-bottom: 1rpx solid rgba(17,24,39,.06);
}
.back { width: 56rpx; font-size: 48rpx; color: var(--km-text); }
.titles { flex: 1; }
.title { display: block; font-size: 30rpx; font-weight: 600; color: var(--km-text); }
.sub { display: block; margin-top: 4rpx; font-size: 22rpx; color: var(--km-text-muted); }
.map-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #0f172a;
  touch-action: none;
}
.map-world { position: absolute; inset: 0; }
.center-pin {
  position: absolute;
  left: 50%;
  top: 46%;
  z-index: 4;
  color: #ef4444;
  transform: translate(-50%, -100%);
  pointer-events: none;
  filter: drop-shadow(0 10rpx 16rpx rgba(15,23,42,.28));
}
.pin-ic { font-size: 58rpx; }
.zoom-stack {
  position: absolute;
  right: 18rpx;
  top: 18rpx;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.zoom-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 16rpx;
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: #1c1c1e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 500;
  border: 1rpx solid rgba(255,255,255,.7);
  box-shadow: 0 8rpx 24rpx rgba(15,23,42,.1);
}
.zoom-btn.tilt { font-size: 22rpx; font-weight: 700; color: #64748b; }
.zoom-btn.tilt.on { color: #007aff; }
.zoom-btn.locate {
  width: auto;
  min-width: 68rpx;
  padding: 0 14rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #1d4ed8;
}
.zoom-btn.locate.busy { opacity: 0.55; }
.hint {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  z-index: 5;
  font-size: 20rpx;
  color: #3a3a3c;
  background: rgba(255,255,255,.86);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 8rpx 14rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 14rpx rgba(15,23,42,.08);
  pointer-events: none;
}
.chips {
  flex-shrink: 0;
  width: 100%;
  height: 72rpx;
  background: var(--km-surface);
  border-top: 1rpx solid rgba(17,24,39,.05);
}
.chip-row {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10rpx;
  height: 72rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}
.chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: none;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: var(--km-surface-sunken);
  line-height: 1;
}
.chip.on { background: #eff6ff; }
.chip-text {
  display: inline-block;
  font-size: 22rpx;
  line-height: 1.2;
  color: var(--km-text-secondary);
  white-space: nowrap !important;
  word-break: keep-all;
  writing-mode: horizontal-tb !important;
}
.chip.on .chip-text { color: var(--km-primary); font-weight: 600; }
.confirm-bar {
  flex-shrink: 0;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: var(--km-surface);
  border-top: 1rpx solid rgba(17,24,39,.06);
}
.meta { flex: 1; min-width: 0; }
.meta-kicker { display: block; font-size: 20rpx; color: var(--km-text-muted); }
.meta-title {
  display: block;
  margin-top: 4rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--km-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta-geo { display: block; margin-top: 4rpx; font-size: 20rpx; color: var(--km-text-muted); }
.ok {
  flex-shrink: 0;
  padding: 20rpx 32rpx;
  background: var(--km-primary);
  color: #fff;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
}
.ok.disabled { opacity: .55; }
</style>
