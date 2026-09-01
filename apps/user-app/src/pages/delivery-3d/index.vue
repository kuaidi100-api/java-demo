<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { onHide, onLoad, onShow } from '@dcloudio/uni-app';
import { backOrHome } from '../../utils/navigation';
import { SEZ_CENTER, SEZ_LANDMARKS_IN_ZONE, SEZ_MAP_ID } from '../../data/geo-sez';
import { locale, t } from '../../i18n';
import { SezAerialMap } from './SezAerialMap';
import { fetchOrderPositions, fetchRiderPositions, toMarkers } from './riderGps';
import {
  fetchDeliveryTrack,
  pointAlong,
  previewInboundRoute,
  sliceTraveled,
  type DeliveryTrack,
} from './deliveryRoute';
import { locateErrorMessage, locateMe } from '../../utils/locateMe';

const hostRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref('');
const gpsLive = ref(false);
const riderCount = ref(0);
const orderCount = ref(0);
const mapId = SEZ_MAP_ID;
const buildingCount = ref(0);
const waybillNo = ref('');
const querying = ref(false);
const track = ref<DeliveryTrack | null>(null);
const routeLive = ref(false);
const locating = ref(false);

let map: SezAerialMap | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let tick = 0;
let paused = false;
let fittedOnce = false;

const progressPct = computed(() => Math.round((track.value?.progress ?? 0) * 100));

function resolveHost(): HTMLElement | null {
  const raw = hostRef.value as { $el?: HTMLElement } | HTMLElement | null;
  if (!raw) return document.querySelector('.map3d-host') as HTMLElement | null;
  if (raw instanceof HTMLElement) return raw;
  if (raw.$el instanceof HTMLElement) return raw.$el;
  return document.querySelector('.map3d-host') as HTMLElement | null;
}

function paintRoute(next: DeliveryTrack, fit = false): void {
  if (!map) return;
  const traveled = sliceTraveled(next.coordinates, next.progress);
  const vehicle = pointAlong(next.coordinates, next.progress);
  map.setDeliveryRoute({
    coordinates: next.coordinates,
    traveled,
    vehicle: {
      lng: vehicle.lng,
      lat: vehicle.lat,
      heading: vehicle.bearing,
      label: next.status,
    },
    fit,
  });
  if (fit || !fittedOnce) {
    fittedOnce = true;
  }
}

async function refreshMarkers(): Promise<void> {
  if (!map || paused) return;
  tick += 1;
  const [riders, orders] = await Promise.all([fetchRiderPositions(tick), fetchOrderPositions()]);
  const live = toMarkers(riders, orders);
  const manual = map.listMarkers().filter((m) => m.id.includes('-manual-'));
  const merged = [...live, ...manual];
  riderCount.value = merged.filter((m) => m.kind === 'rider').length;
  orderCount.value = merged.filter((m) => m.kind === 'order').length;
  gpsLive.value = Boolean(import.meta.env.VITE_RIDER_GPS_URL);
  map.setMarkers(merged);

  if (routeLive.value && waybillNo.value.trim()) {
    const next = await fetchDeliveryTrack(waybillNo.value, tick);
    track.value = next;
    paintRoute(next, false);
  }
}

function startPoll(): void {
  stopPoll();
  void refreshMarkers();
  pollTimer = setInterval(() => {
    void refreshMarkers();
  }, 2500);
}

function stopPoll(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function boot(): Promise<void> {
  loading.value = true;
  error.value = '';
  await nextTick();
  const host = resolveHost();
  if (!host) {
    error.value = t('d3d.noHost');
    loading.value = false;
    return;
  }
  try {
    map?.dispose();
    map = new SezAerialMap({ host, zoom: 13.8, pitch: 48, bearing: -18 });
    const stats = await map.loadLocalLayers();
    buildingCount.value = stats.buildings;

    // Always show inbound SEZ trunk corridor
    const preview = previewInboundRoute();
    track.value = preview;
    paintRoute({ ...preview, progress: 0.42 }, true);

    if (waybillNo.value.trim()) {
      await runQuery(false);
    } else {
      map.focusLngLat(SEZ_CENTER.lng, SEZ_CENTER.lat);
    }
    startPoll();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('d3d.loadFail');
  } finally {
    loading.value = false;
  }
}

async function runQuery(toast = true): Promise<void> {
  const no = waybillNo.value.trim();
  if (!no) {
    uni.showToast({ title: t('d3d.needWaybill'), icon: 'none' });
    return;
  }
  querying.value = true;
  try {
    const next = await fetchDeliveryTrack(no, tick);
    track.value = next;
    routeLive.value = true;
    paintRoute(next, true);
    if (toast) uni.showToast({ title: t('d3d.trackOk'), icon: 'success' });
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : t('d3d.trackFail'),
      icon: 'none',
    });
  } finally {
    querying.value = false;
  }
}

function clearQuery(): void {
  waybillNo.value = '';
  routeLive.value = false;
  const preview = previewInboundRoute();
  track.value = preview;
  paintRoute({ ...preview, progress: 0.42 }, true);
}

function goBack(): void {
  backOrHome();
}

function resetView(): void {
  if (track.value?.coordinates?.length) {
    map?.fitCoordinates(track.value.coordinates);
    return;
  }
  map?.focusLngLat(SEZ_CENTER.lng, SEZ_CENTER.lat);
}

function focusLandmark(id: string): void {
  const spot = SEZ_LANDMARKS_IN_ZONE.find((s) => s.id === id);
  if (!spot || !map) return;
  map.focusLngLat(spot.lng, spot.lat);
}

function zoomIn(): void {
  map?.softZoomIn();
}

async function locateSelf(): Promise<void> {
  if (locating.value || !map) return;
  locating.value = true;
  try {
    const pos = await locateMe();
    map.showSelfLocation(pos.mapLng, pos.mapLat, { zoom: 17 });
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

onLoad((query) => {
  const no = String(query?.no || '').trim();
  if (no) waybillNo.value = no;
});

onMounted(() => {
  void boot();
});

onUnmounted(() => {
  stopPoll();
  map?.dispose();
  map = null;
});

onShow(() => {
  paused = false;
  if (map) startPoll();
});

onHide(() => {
  paused = true;
  stopPoll();
});
</script>

<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <view class="titles">
        <text class="title">{{ t('d3d.title') }}</text>
        <text class="sub">{{ t('d3d.subLive') }} · {{ buildingCount }}栋</text>
      </view>
      <text class="reset" @tap="resetView">{{ t('d3d.reset') }}</text>
    </view>

    <view class="search">
      <input
        v-model.trim="waybillNo"
        class="search-input"
        :placeholder="t('d3d.waybillPh')"
        confirm-type="search"
        @confirm="runQuery()"
      />
      <view class="search-btn" :class="{ busy: querying }" @tap="runQuery()">
        {{ querying ? t('d3d.querying') : t('d3d.query') }}
      </view>
      <view v-if="routeLive" class="search-clear" @tap="clearQuery">{{ t('d3d.clear') }}</view>
    </view>

    <view class="map3d-wrap">
      <view class="map3d-host" ref="hostRef">
        <view v-if="loading" class="state">{{ t('d3d.loading') }}</view>
        <view v-else-if="error" class="state err">{{ error }}</view>
      </view>
      <view class="locate-btn" :class="{ busy: locating }" @tap.stop="locateSelf">
        {{ locating ? '…' : t('map.locate') }}
      </view>
    </view>

    <view v-if="track" class="route-card">
      <view class="route-head">
        <text class="route-status">{{ track.status }}</text>
        <text class="route-pct">{{ progressPct }}%</text>
      </view>
      <view class="route-bar">
        <view class="route-fill" :style="{ width: progressPct + '%' }" />
      </view>
      <view class="route-meta">
        <text class="meta-line">{{ track.currentStop }} → {{ track.nextStop }}</text>
        <text class="meta-line dim">
          {{ track.waybillNo ? track.waybillNo + ' · ' : '' }}{{ t('d3d.eta', { n: track.etaMinutes }) }}
          · {{ track.destName }}
        </text>
      </view>
    </view>

    <view class="hud">
      <view class="stat">
        <text class="stat-n">{{ riderCount }}</text>
        <text class="stat-l">{{ t('d3d.riders') }}</text>
      </view>
      <view class="stat">
        <text class="stat-n">{{ orderCount }}</text>
        <text class="stat-l">{{ t('d3d.orders') }}</text>
      </view>
      <view class="pill" :class="{ on: gpsLive || routeLive }">
        {{ routeLive ? t('d3d.routeLive') : gpsLive ? t('d3d.gpsLive') : t('d3d.gpsDemo') }}
      </view>
      <view class="pill soft" @tap="zoomIn">{{ t('d3d.zoomIn') }}</view>
    </view>

    <scroll-view scroll-x class="chips" :show-scrollbar="false">
      <view class="chip-row">
        <view
          v-for="spot in SEZ_LANDMARKS_IN_ZONE"
          :key="spot.id"
          class="chip"
          @tap="focusLandmark(spot.id)"
        >
          <text class="chip-text">{{ spot.name }}</text>
        </view>
      </view>
    </scroll-view>

    <text class="hint">{{ t('d3d.hintRoute') }} · Map {{ mapId }}</text>
  </view>
</template>

<style>
.sez-pin {
  width: 18px;
  height: 18px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 2px solid #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
}
.sez-pin-rider { background: #2563eb; }
.sez-pin-order { background: #f59e0b; }
.sez-self-loc {
  position: relative;
  width: 18px;
  height: 18px;
  pointer-events: none;
}
.sez-self-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.45);
  z-index: 2;
}
.sez-self-pulse {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 28px;
  height: 28px;
  margin: -14px 0 0 -14px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.28);
  animation: sez-self-pulse 1.6s ease-out infinite;
}
@keyframes sez-self-pulse {
  0% { transform: scale(0.55); opacity: 0.9; }
  100% { transform: scale(1.55); opacity: 0; }
}
</style>

<style scoped>
.page {
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0b1220;
  overflow: hidden;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 64rpx 24rpx 10rpx;
  background: rgba(11, 18, 32, 0.94);
  z-index: 5;
  flex-shrink: 0;
}
.back { width: 56rpx; font-size: 48rpx; color: #f8fafc; }
.titles { flex: 1; min-width: 0; }
.title { display: block; font-size: 30rpx; font-weight: 700; color: #f8fafc; }
.sub { display: block; margin-top: 4rpx; font-size: 20rpx; color: #94a3b8; }
.reset {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,.08);
  color: #e2e8f0;
  font-size: 22rpx;
}
.search {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 20rpx 12rpx;
  background: rgba(11, 18, 32, 0.96);
  z-index: 5;
}
.search-input {
  flex: 1;
  min-width: 0;
  height: 64rpx;
  padding: 0 20rpx;
  border-radius: 14rpx;
  background: rgba(255,255,255,.08);
  color: #f8fafc;
  font-size: 24rpx;
}
.search-btn {
  flex-shrink: 0;
  padding: 14rpx 22rpx;
  border-radius: 14rpx;
  background: #2563eb;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}
.search-btn.busy { opacity: 0.6; }
.search-clear {
  flex-shrink: 0;
  padding: 14rpx 16rpx;
  border-radius: 14rpx;
  background: rgba(255,255,255,.08);
  color: #cbd5e1;
  font-size: 22rpx;
}
.map3d-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}
.map3d-host {
  position: absolute;
  inset: 0;
  background: #0b1220;
}
.locate-btn {
  position: absolute;
  right: 18rpx;
  bottom: 24rpx;
  z-index: 8;
  min-width: 88rpx;
  padding: 14rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,.92);
  color: #1d4ed8;
  font-size: 22rpx;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(15,23,42,.18);
}
.locate-btn.busy { opacity: 0.55; }
.map3d-host :deep(.maplibregl-map),
.map3d-host :deep(.maplibregl-canvas-container),
.map3d-host :deep(.maplibregl-canvas) {
  width: 100% !important;
  height: 100% !important;
}
.state {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2e8f0;
  font-size: 26rpx;
  background: rgba(11, 18, 32, 0.72);
}
.state.err { color: #fca5a5; padding: 40rpx; text-align: center; }
.route-card {
  flex-shrink: 0;
  margin: 0 20rpx 10rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: rgba(15, 23, 42, 0.92);
  border: 1rpx solid rgba(34, 211, 238, 0.25);
  z-index: 6;
}
.route-head { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
.route-status { font-size: 26rpx; font-weight: 700; color: #67e8f9; }
.route-pct { font-size: 24rpx; font-weight: 800; color: #e2e8f0; }
.route-bar {
  margin-top: 12rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(148, 163, 184, 0.25);
  overflow: hidden;
}
.route-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #0ea5e9, #22d3ee);
}
.route-meta { margin-top: 10rpx; }
.meta-line { display: block; font-size: 22rpx; color: #e2e8f0; }
.meta-line.dim { margin-top: 4rpx; color: #94a3b8; font-size: 20rpx; }
.hud {
  position: absolute;
  left: 20rpx;
  top: 250rpx;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  pointer-events: none;
}
.stat {
  min-width: 120rpx;
  padding: 12rpx 16rpx;
  border-radius: 14rpx;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(10px);
}
.stat-n { display: block; font-size: 30rpx; font-weight: 800; color: #fff; }
.stat-l { display: block; font-size: 18rpx; color: #cbd5e1; }
.pill {
  align-self: flex-start;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(100, 116, 139, 0.85);
  color: #f8fafc;
  font-size: 18rpx;
}
.pill.on { background: rgba(5, 150, 105, 0.9); }
.pill.soft {
  pointer-events: auto;
  background: rgba(37, 99, 235, 0.9);
}
.chips {
  flex-shrink: 0;
  height: 72rpx;
  background: rgba(11, 18, 32, 0.96);
  white-space: nowrap;
}
.chip-row {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10rpx;
  height: 72rpx;
  padding: 0 20rpx;
}
.chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,.08);
}
.chip-text {
  font-size: 22rpx;
  color: #e2e8f0;
  white-space: nowrap !important;
  writing-mode: horizontal-tb !important;
}
.hint {
  flex-shrink: 0;
  display: block;
  padding: 0 24rpx calc(12rpx + env(safe-area-inset-bottom));
  background: rgba(11, 18, 32, 0.98);
  color: #64748b;
  font-size: 20rpx;
  line-height: 1.4;
}
</style>
