<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { onHide, onLoad, onShow } from '@dcloudio/uni-app';
import { backOrHome } from '../../utils/navigation';
import { SezAerialMap } from '../delivery-3d/SezAerialMap';
import {
  fetchOrderTrack,
  pointAlong,
  sliceTraveled,
  type OrderTrack,
} from './orderTrack';
import { locateErrorMessage, locateMe } from '../../utils/locateMe';

const query = ref('');
const loading = ref(false);
const locating = ref(false);
const mapReady = ref(false);
const track = ref<OrderTrack | null>(null);
const mapHostRef = ref<HTMLElement | null>(null);

let map: SezAerialMap | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let tick = 0;
let paused = false;
let live = false;

const progressPct = computed(() => Math.round((track.value?.progress ?? 0) * 100));
const phaseHint = computed(() => {
  const p = track.value?.phase;
  if (p === 'yunnan' || p === 'crossing') return '跨境干线：云南 → 金三角经济特区';
  if (p === 'hub') return '已到星光夜市二期木棉快递，准备派送';
  if (p === 'delivering') return '末派中：木棉快递 → 用户家';
  if (p === 'delivered') return '派送完成';
  return '输入运单号查询云南至特区全程物流';
});

function resolveHost(): HTMLElement | null {
  const raw = mapHostRef.value as { $el?: HTMLElement } | HTMLElement | null;
  if (raw && '$el' in raw && raw.$el instanceof HTMLElement) return raw.$el;
  if (raw instanceof HTMLElement) return raw;
  return document.querySelector('.track-map-host') as HTMLElement | null;
}

function paint(next: OrderTrack, fit: boolean): void {
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
}

async function bootMap(): Promise<void> {
  await nextTick();
  const host = resolveHost();
  if (!host) return;
  map?.dispose();
  map = new SezAerialMap({
    host,
    zoom: 7.2,
    pitch: 42,
    bearing: -12,
    showControls: false,
    minZoom: 5.5,
    maxZoom: 18.5,
  });
  await map.loadLocalLayers();
  mapReady.value = true;
  if (query.value.trim()) await doQuery(false);
}

function startPoll(): void {
  stopPoll();
  pollTimer = setInterval(() => {
    if (paused || !live || !query.value.trim()) return;
    tick += 1;
    void fetchOrderTrack(query.value, tick).then((next) => {
      track.value = next;
      paint(next, false);
    });
  }, 2800);
}

function stopPoll(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function doQuery(toast = true): Promise<void> {
  const no = query.value.trim();
  if (!no) {
    uni.showToast({ title: '请输入运单号', icon: 'none' });
    return;
  }
  loading.value = true;
  try {
    if (!map) await bootMap();
    tick = 0;
    const next = await fetchOrderTrack(no, tick);
    track.value = next;
    live = true;
    paint(next, true);
    startPoll();
    if (toast) uni.showToast({ title: '查询成功', icon: 'success' });
  } catch (e: unknown) {
    uni.showToast({
      title: e instanceof Error ? e.message : '查询失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
}

async function locateSelf(): Promise<void> {
  if (locating.value || !map) return;
  locating.value = true;
  try {
    const pos = await locateMe();
    map.showSelfLocation(pos.mapLng, pos.mapLat, { zoom: 16.5 });
    uni.showToast({
      title: pos.outsideSez ? '已定位（已落到可服务区）' : '已定位到当前位置',
      icon: 'none',
    });
  } catch (cause: unknown) {
    uni.showToast({ title: locateErrorMessage(cause), icon: 'none' });
  } finally {
    locating.value = false;
  }
}

function goBack(): void {
  backOrHome();
}

onLoad((params) => {
  if (params?.no) {
    query.value = String(params.no);
  }
});

onMounted(() => {
  void bootMap();
});

onUnmounted(() => {
  stopPoll();
  map?.dispose();
  map = null;
});

onShow(() => {
  paused = false;
  if (live) startPoll();
});

onHide(() => {
  paused = true;
  stopPoll();
});
</script>

<template>
  <view class="page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <view class="titles">
        <text class="title">订单物流查询</text>
        <text class="sub">云南 → 星光夜市二期木棉快递 → 派送到家</text>
      </view>
    </view>

    <view class="search">
      <input
        v-model.trim="query"
        class="search-input"
        placeholder="输入运单号查询全程轨迹"
        placeholder-class="ph"
        confirm-type="search"
        @confirm="doQuery()"
      />
      <view class="search-btn" :class="{ busy: loading }" @tap="doQuery()">
        {{ loading ? '查询中' : '查询' }}
      </view>
    </view>

    <view class="map-wrap">
      <view ref="mapHostRef" class="track-map-host" />
      <view class="locate-btn" :class="{ busy: locating }" @tap.stop="locateSelf">
        {{ locating ? '…' : '定位' }}
      </view>
      <text class="map-cap">{{ phaseHint }}</text>
    </view>

    <view v-if="track" class="panel">
      <view class="status-row">
        <text class="status">{{ track.status }}</text>
        <text class="pct">{{ progressPct }}%</text>
      </view>
      <view class="bar"><view class="fill" :style="{ width: progressPct + '%' }" /></view>
      <text class="line">{{ track.currentStop }} → {{ track.nextStop }}</text>
      <text class="line dim">
        {{ track.waybillNo }} · 约{{ track.etaMinutes }}分钟 · {{ track.destName }}
      </text>
      <text class="hub">网点：{{ track.hubName }}</text>

      <view class="timeline">
        <view v-for="(ev, i) in track.events" :key="i" class="ev" :class="{ on: ev.done }">
          <view class="ev-dot" />
          <view class="ev-body">
            <text class="ev-time">{{ ev.time }}</text>
            <text class="ev-text">{{ ev.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text>输入单号后可查看：</text>
      <text>1. 云南发往金三角途中位置</text>
      <text>2. 到达星光夜市二期木棉快递</text>
      <text>3. 派送到用户家的末派轨迹</text>
    </view>
  </view>
</template>

<style scoped>
.page {
  height: 100vh;
  max-height: 100vh;
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
  padding: 70rpx 24rpx 12rpx;
  background: var(--km-surface);
}
.back { width: 56rpx; font-size: 48rpx; color: var(--km-text); }
.titles { flex: 1; min-width: 0; }
.title { display: block; font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.sub { display: block; margin-top: 4rpx; font-size: 22rpx; color: var(--km-text-muted); }
.search {
  flex-shrink: 0;
  display: flex;
  gap: 12rpx;
  padding: 12rpx 24rpx 16rpx;
  background: var(--km-surface);
}
.search-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 14rpx;
  background: var(--km-surface-sunken);
  font-size: 28rpx;
  color: var(--km-text);
}
.ph { color: #aaa; }
.search-btn {
  flex-shrink: 0;
  padding: 0 28rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 14rpx;
  background: #2196f3;
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}
.search-btn.busy { opacity: 0.6; }
.map-wrap {
  position: relative;
  flex: 1;
  min-height: 280rpx;
  background: #0f172a;
}
.track-map-host { position: absolute; inset: 0; }
.locate-btn {
  position: absolute;
  right: 18rpx;
  top: 18rpx;
  z-index: 8;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,.92);
  color: #1d4ed8;
  font-size: 22rpx;
  font-weight: 700;
  box-shadow: 0 6rpx 18rpx rgba(15,23,42,.16);
}
.locate-btn.busy { opacity: 0.55; }
.map-cap {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  z-index: 8;
  max-width: 75%;
  padding: 8rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(15,23,42,.78);
  color: #e2e8f0;
  font-size: 20rpx;
  pointer-events: none;
}
.panel {
  flex-shrink: 0;
  max-height: 42vh;
  overflow: auto;
  padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
  background: var(--km-surface);
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -8rpx 28rpx rgba(15,23,42,.08);
}
.status-row { display: flex; justify-content: space-between; align-items: center; }
.status { font-size: 28rpx; font-weight: 800; color: #0284c7; }
.pct { font-size: 26rpx; font-weight: 800; color: var(--km-text); }
.bar {
  margin: 14rpx 0;
  height: 10rpx;
  border-radius: 999rpx;
  background: #e2e8f0;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #0284c7, #22d3ee);
}
.line { display: block; font-size: 24rpx; color: var(--km-text); }
.line.dim { margin-top: 6rpx; color: var(--km-text-muted); font-size: 22rpx; }
.hub {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #0369a1;
  font-weight: 600;
}
.timeline { margin-top: 20rpx; }
.ev {
  display: flex;
  gap: 16rpx;
  padding: 12rpx 0;
  opacity: 0.4;
}
.ev.on { opacity: 1; }
.ev-dot {
  width: 14rpx;
  height: 14rpx;
  margin-top: 8rpx;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}
.ev.on .ev-dot { background: #0284c7; box-shadow: 0 0 0 4rpx rgba(2,132,199,.2); }
.ev-time { display: block; font-size: 20rpx; color: var(--km-text-muted); }
.ev-text { display: block; margin-top: 4rpx; font-size: 24rpx; color: var(--km-text); line-height: 1.45; }
.empty {
  flex-shrink: 0;
  padding: 28rpx 32rpx calc(28rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  background: var(--km-surface);
  color: var(--km-text-muted);
  font-size: 24rpx;
}
</style>
