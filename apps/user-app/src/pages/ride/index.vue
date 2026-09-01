<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { BOKEO_AIRPORT, RIDE_BOUNDS, RIDE_LANDMARKS, SEED_CARS, type RideCar } from '../../data/ride';
import { SEZ_CENTER, clampToSez, nearestSezName } from '../../data/geo-sez';
import { requireUserSession } from '../../stores/auth';
import { backOrHome } from '../../utils/navigation';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { track } from '../../utils/analytics';
import { locale, t } from '../../i18n';
import SupportContactBtn from '../../components/support/SupportContactBtn.vue';
import { SezAerialMap } from '../delivery-3d/SezAerialMap';
import type { MapMarkerInput } from '../delivery-3d/geo';
import { locateErrorMessage, locateMe } from '../../utils/locateMe';

type Point = { label: string; lat: number; lng: number };
type PickTarget = 'from' | 'to';

const street = RIDE_LANDMARKS.find((l) => l.id === 'huanglou') ?? RIDE_LANDMARKS[0];
const from = ref<Point>({
  label: street?.name || '金三角经济特区',
  lat: street?.lat ?? SEZ_CENTER.lat,
  lng: street?.lng ?? SEZ_CENTER.lng,
});
const to = ref<Point | null>(null);
const fromText = ref(from.value.label);
const toText = ref('');
const pickTarget = ref<PickTarget>('to');
const cars = ref<RideCar[]>(SEED_CARS.map((c) => ({ ...c })));
const airportOpen = ref(false);
const flightNo = ref('');
const landingAt = ref('');
const contactName = ref('');
const phone = ref('');
const contactOpen = ref(false);
const pendingMode = ref<'instant' | 'airport_pickup'>('instant');
const submitting = ref(false);
const mapHostRef = ref<HTMLElement | null>(null);
const locating = ref(false);
const fieldErr = ref({ from: '', to: '', landing: '', contact: '', phone: '' });

function haversineKm(a: Point, b: Point): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

const etaMinutes = computed(() => {
  if (!to.value) return null;
  const km = haversineKm(from.value, to.value);
  return Math.max(5, Math.round((km / 22) * 60) + 3);
});
const etaRange = computed(() => {
  if (etaMinutes.value == null) return null;
  const mid = etaMinutes.value;
  return { min: Math.max(3, mid - 3), max: mid + 4 };
});

let map: SezAerialMap | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let reduceMotion = false;

function resolveHost(): HTMLElement | null {
  const raw = mapHostRef.value as { $el?: HTMLElement } | HTMLElement | null;
  if (raw && '$el' in raw && raw.$el instanceof HTMLElement) return raw.$el;
  if (raw instanceof HTMLElement) return raw;
  return document.querySelector('.map-tiles') as HTMLElement | null;
}

function syncMarkers(): void {
  if (!map) return;
  const list: MapMarkerInput[] = [
    {
      id: 'ride-from',
      lng: from.value.lng,
      lat: from.value.lat,
      kind: 'from',
      label: from.value.label,
    },
    ...cars.value.map((car) => ({
      id: `ride-car-${car.id}`,
      lng: car.lng,
      lat: car.lat,
      kind: 'car' as const,
      heading: car.heading,
      label: car.id,
    })),
  ];
  if (to.value) {
    list.push({
      id: 'ride-to',
      lng: to.value.lng,
      lat: to.value.lat,
      kind: 'to',
      label: to.value.label,
    });
  }
  map.setMarkers(list);
}

function applyPoint(target: PickTarget, point: Point): void {
  if (target === 'from') {
    from.value = point;
    fromText.value = point.label;
  } else {
    to.value = point;
    toText.value = point.label;
  }
  const midLat = (from.value.lat + (to.value?.lat ?? from.value.lat)) / 2;
  const midLng = (from.value.lng + (to.value?.lng ?? from.value.lng)) / 2;
  map?.setCenter(midLng, midLat, 450);
  syncMarkers();
}

function onFromInput(e: { detail?: { value?: string } } | Event): void {
  const value = 'detail' in (e as { detail?: { value?: string } })
    ? String((e as { detail?: { value?: string } }).detail?.value ?? '')
    : String((e.target as HTMLInputElement | null)?.value ?? '');
  fromText.value = value;
  from.value = { ...from.value, label: value.trim() || t('ride.mapPoint') };
}

function onToInput(e: { detail?: { value?: string } } | Event): void {
  const value = 'detail' in (e as { detail?: { value?: string } })
    ? String((e as { detail?: { value?: string } }).detail?.value ?? '')
    : String((e.target as HTMLInputElement | null)?.value ?? '');
  toText.value = value;
  if (!value.trim()) {
    to.value = null;
    syncMarkers();
    return;
  }
  if (to.value) to.value = { ...to.value, label: value.trim() };
  else {
    to.value = {
      label: value.trim(),
      lat: SEZ_CENTER.lat + 0.0012,
      lng: SEZ_CENTER.lng + 0.0015,
    };
  }
  syncMarkers();
}

function focusPick(target: PickTarget): void {
  pickTarget.value = target;
}

function zoomBy(delta: number): void {
  if (delta > 0) map?.softZoomIn();
  else map?.softZoomOut();
}

async function locateSelf(): Promise<void> {
  if (locating.value || !map) return;
  locating.value = true;
  try {
    const pos = await locateMe();
    map.showSelfLocation(pos.mapLng, pos.mapLat, { zoom: 17 });
    const name = nearestSezName(pos.mapLat, pos.mapLng) || t('ride.mapPoint');
    applyPoint(pickTarget.value, {
      label: name,
      lat: pos.mapLat,
      lng: pos.mapLng,
    });
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

async function bootMap(): Promise<void> {
  await nextTick();
  const host = resolveHost();
  if (!host) return;
  map?.dispose();
  map = new SezAerialMap({
    host,
    zoom: 15.9,
    pitch: 48,
    bearing: -22,
    showControls: false,
    minZoom: 13,
    maxZoom: 18.8,
  });
  await map.loadLocalLayers();
  map.onPick((ll) => {
    const clamped = clampToSez(ll.lat, ll.lng);
    const name = nearestSezName(clamped.lat, clamped.lng) || t('ride.mapPoint');
    applyPoint(pickTarget.value, { label: name, lat: clamped.lat, lng: clamped.lng });
    uni.showToast({ title: t('ride.mapPicked'), icon: 'none' });
  });
  map.focusLngLat(from.value.lng, from.value.lat);
  syncMarkers();
  map.resize();
}

onMounted(() => {
  track('ride_map_view');
  void bootMap();
  window.addEventListener('resize', onResize);
  try {
    reduceMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  } catch {
    reduceMotion = false;
  }
  if (reduceMotion) return;
  timer = setInterval(() => {
    cars.value = cars.value.map((car, index) => {
      const drift = 0.00028 * (index % 2 === 0 ? 1 : -1);
      let lat = car.lat + Math.sin((car.heading * Math.PI) / 180) * drift;
      let lng = car.lng + Math.cos((car.heading * Math.PI) / 180) * drift;
      let heading = car.heading;
      if (lat < RIDE_BOUNDS.minLat || lat > RIDE_BOUNDS.maxLat || lng < RIDE_BOUNDS.minLng || lng > RIDE_BOUNDS.maxLng) {
        heading = (heading + 140 + index * 17) % 360;
        lat = Math.min(RIDE_BOUNDS.maxLat, Math.max(RIDE_BOUNDS.minLat, lat));
        lng = Math.min(RIDE_BOUNDS.maxLng, Math.max(RIDE_BOUNDS.minLng, lng));
      }
      return { ...car, lat, lng, heading };
    });
    syncMarkers();
  }, 1200);
});

function onResize(): void {
  map?.resize();
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener('resize', onResize);
  map?.dispose();
  map = null;
});

onShow(() => {
  const raw = uni.getStorageSync('km.lifestyle.mapPick') as
    | { role?: string; lat?: number; lng?: number; label?: string }
    | '';
  if (!raw || typeof raw !== 'object' || raw.lat == null || raw.lng == null) {
    map?.resize();
    return;
  }
  const point: Point = {
    label: raw.label || t('ride.mapPoint'),
    lat: Number(raw.lat),
    lng: Number(raw.lng),
  };
  if (raw.role === 'ride_to') {
    pickTarget.value = 'to';
    applyPoint('to', point);
  } else if (raw.role === 'ride_from') {
    pickTarget.value = 'from';
    applyPoint('from', point);
  }
  uni.removeStorageSync('km.lifestyle.mapPick');
  map?.resize();
});

function goBack(): void {
  backOrHome();
}

function pickLandmark(id: string): void {
  const spot = RIDE_LANDMARKS.find((l) => l.id === id);
  if (!spot) return;
  pickTarget.value = 'to';
  applyPoint('to', { label: spot.name, lat: spot.lat, lng: spot.lng });
  map?.focusLngLat(spot.lng, spot.lat);
}

function openMap(role: 'ride_from' | 'ride_to'): void {
  pickTarget.value = role === 'ride_from' ? 'from' : 'to';
  uni.navigateTo({ url: `/pages/map-pick/index?role=${role}` });
}

function onLandingChange(e: { detail: { value: string } }): void {
  landingAt.value = e.detail.value;
}

function openAirport(): void {
  airportOpen.value = !airportOpen.value;
  track('ride_airport_entry_click');
  if (airportOpen.value) {
    applyPoint('from', {
      label: BOKEO_AIRPORT.name,
      lat: BOKEO_AIRPORT.lat,
      lng: BOKEO_AIRPORT.lng,
    });
    map?.focusLngLat(BOKEO_AIRPORT.lng, BOKEO_AIRPORT.lat);
  } else {
    applyPoint('from', { label: street.name, lat: street.lat, lng: street.lng });
    map?.focusLngLat(street.lng, street.lat);
  }
}

function requestInstant(): void {
  fieldErr.value = {
    from: from.value.label.trim() ? '' : t('ride.fieldFrom'),
    to: to.value?.label.trim() ? '' : t('ride.fieldTo'),
    landing: '',
    contact: '',
    phone: '',
  };
  if (fieldErr.value.from || fieldErr.value.to) return;
  pendingMode.value = 'instant';
  contactOpen.value = true;
}

function requestAirport(): void {
  fieldErr.value = {
    from: '',
    to: to.value ? '' : t('ride.fieldTo'),
    landing: landingAt.value ? '' : t('ride.needLanding'),
    contact: '',
    phone: '',
  };
  if (fieldErr.value.to || fieldErr.value.landing) return;
  pendingMode.value = 'airport_pickup';
  contactOpen.value = true;
}

async function submit(): Promise<void> {
  fieldErr.value = {
    ...fieldErr.value,
    contact: contactName.value.trim() ? '' : t('ride.fieldContact'),
    phone: phone.value.trim() ? '' : t('ride.fieldPhone'),
  };
  if (fieldErr.value.contact || fieldErr.value.phone) return;
  if (!to.value) return;
  if (!requireUserSession()) return;

  const mode = pendingMode.value;
  const detail =
    mode === 'airport_pickup'
      ? `airport ${flightNo.value || '-'} ${landingAt.value} → ${to.value.label}`
      : `instant ${from.value.label}→${to.value.label}`;

  submitting.value = true;
  track(mode === 'airport_pickup' ? 'ride_airport_submit' : 'ride_instant_submit', {
    hasFlightNo: Boolean(flightNo.value.trim()),
  });
  try {
    const order = await userApi.createLifestyle({
      serviceType: 'RIDE',
      contactName: contactName.value.trim(),
      phone: phone.value.trim(),
      detail,
      payload:
        mode === 'airport_pickup'
          ? {
              mode,
              flightNo: flightNo.value.trim() || undefined,
              landingAt: landingAt.value,
              from: from.value,
              to: to.value,
              map: { provider: 'LOCAL_SEZ', from: from.value, to: to.value },
            }
          : {
              mode,
              from: from.value,
              to: to.value,
              map: { provider: 'LOCAL_SEZ', from: from.value, to: to.value },
            },
    });
    contactOpen.value = false;
    uni.showToast({ title: t('ride.submitted'), icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

const chipSpots = computed(() => RIDE_LANDMARKS);
</script>

<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('ride.title') }}</text>
      <SupportContactBtn business="RIDE" />
    </view>

    <view class="map">
      <view ref="mapHostRef" class="map-tiles" />
      <view class="map-tools">
        <text class="zoom" @tap.stop="zoomBy(0.4)">＋</text>
        <text class="zoom" @tap.stop="zoomBy(-0.4)">－</text>
        <text class="zoom locate" :class="{ busy: locating }" @tap.stop="locateSelf">
          {{ locating ? '…' : t('map.locate') }}
        </text>
      </view>
      <text class="map-label">{{ t('ride.mapHintTap') }}</text>
    </view>

    <view class="sheet">
      <view class="sheet-head">
        <text class="sheet-title">{{ t('ride.panelTitle') }}</text>
        <text class="airport-entry" @tap="openAirport">{{ t('ride.airportPickup') }}</text>
      </view>
      <text class="pick-hint">{{ pickTarget === 'from' ? t('ride.pickingFrom') : t('ride.pickingTo') }}</text>
      <text class="demo-hint">{{ t('ride.demoHint') }}</text>
      <view v-if="etaRange" class="eta-row">
        <text class="eta-label">{{ t('ride.eta') }}</text>
        <text class="eta-value">{{ t('ride.etaRange', { min: etaRange.min, max: etaRange.max }) }}</text>
      </view>

      <view class="addr" :class="{ on: pickTarget === 'from', err: !!fieldErr.from }" @tap="focusPick('from')">
        <text class="dot blue" />
        <view class="addr-body">
          <text class="addr-label">{{ t('ride.from') }}</text>
          <input
            class="addr-input"
            :value="fromText"
            :placeholder="t('ride.fromPh')"
            placeholder-class="ph"
            @input="onFromInput"
            @focus="focusPick('from')"
          />
        </view>
        <text class="map-btn" @tap.stop="openMap('ride_from')">{{ t('ride.mapSelect') }}</text>
      </view>
      <text v-if="fieldErr.from" class="field-error">{{ fieldErr.from }}</text>

      <view class="addr" :class="{ on: pickTarget === 'to', err: !!fieldErr.to }" @tap="focusPick('to')">
        <text class="dot red" />
        <view class="addr-body">
          <text class="addr-label">{{ t('ride.to') }}</text>
          <input
            class="addr-input"
            :value="toText"
            :placeholder="t('ride.toPh')"
            placeholder-class="ph"
            @input="onToInput"
            @focus="focusPick('to')"
          />
        </view>
        <text class="map-btn" @tap.stop="openMap('ride_to')">{{ t('ride.mapSelect') }}</text>
      </view>
      <text v-if="fieldErr.to" class="field-error">{{ fieldErr.to }}</text>

      <scroll-view scroll-x class="chips" :show-scrollbar="false">
        <view class="chip-row">
          <text
            v-for="spot in chipSpots"
            :key="spot.id"
            class="chip"
            :class="{ on: to?.label === spot.name }"
            @tap="pickLandmark(spot.id)"
          >{{ spot.name }}</text>
        </view>
      </scroll-view>

      <view v-if="airportOpen" class="airport-box">
        <view class="field">
          <text class="lbl">{{ t('ride.flightNo') }}</text>
          <input v-model.trim="flightNo" class="input" :placeholder="t('ride.flightNoPh')" />
        </view>
        <view class="field">
          <text class="lbl">{{ t('ride.landingAt') }}</text>
          <picker mode="date" :value="landingAt" @change="onLandingChange">
            <text class="input like">{{ landingAt || t('ride.pickLanding') }}</text>
          </picker>
          <text v-if="fieldErr.landing" class="field-error">{{ fieldErr.landing }}</text>
        </view>
        <view class="airport-cta" @tap="requestAirport">{{ t('ride.submitAirport') }}</view>
      </view>
    </view>

    <view class="bottom">
      <view class="go" @tap="requestInstant">{{ t('ride.instant') }}</view>
    </view>

    <view v-if="contactOpen" class="mask" @tap="contactOpen = false">
      <view class="dialog" @tap.stop>
        <text class="dialog-title">{{ t('ride.contactTitle') }}</text>
        <input v-model.trim="contactName" class="input" :placeholder="t('ride.contactNamePh')" />
        <text v-if="fieldErr.contact" class="field-error">{{ fieldErr.contact }}</text>
        <input v-model.trim="phone" class="input" type="number" :placeholder="t('ride.phonePh')" />
        <text v-if="fieldErr.phone" class="field-error">{{ fieldErr.phone }}</text>
        <view class="dialog-go" :class="{ disabled: submitting }" @tap="submit">
          {{ submitting ? t('ride.submitting') : t('ride.confirm') }}
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: calc(120rpx + env(safe-area-inset-bottom)); }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 12rpx; background: var(--km-surface); gap: 12rpx; }
.back { width: 60rpx; font-size: 44rpx; }
.topbar-title { flex: 1; text-align: center; font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.map {
  position: relative; height: 520rpx; margin: 0; overflow: hidden;
  background: #0f172a; touch-action: none; user-select: none;
}
.map-tiles { position: absolute; inset: 0; }
.map-tools {
  position: absolute; right: 16rpx; top: 16rpx; z-index: 7;
  display: flex; flex-direction: column; gap: 10rpx;
}
.zoom {
  width: 60rpx; height: 60rpx; line-height: 60rpx; text-align: center;
  border-radius: 16rpx; background: rgba(255,255,255,.82); color: #1c1c1e;
  font-size: 30rpx; font-weight: 500;
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1rpx solid rgba(255,255,255,.7);
  box-shadow: 0 6rpx 18rpx rgba(15,23,42,.1);
}
.zoom.locate {
  width: auto;
  min-width: 60rpx;
  padding: 0 14rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #1d4ed8;
  line-height: 60rpx;
}
.zoom.locate.busy { opacity: 0.55; }
.map-label {
  position: absolute; left: 16rpx; bottom: 16rpx; z-index: 6; max-width: 68%;
  font-size: 20rpx; color: #3a3a3c; background: rgba(255,255,255,.86); padding: 8rpx 12rpx; border-radius: 12rpx;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4rpx 14rpx rgba(15,23,42,.1);
  pointer-events: none;
}
.sheet {
  margin-top: -24rpx; position: relative; z-index: 8;
  background: var(--km-surface); border-radius: 28rpx 28rpx 0 0;
  padding: 28rpx 28rpx 20rpx; box-shadow: 0 -8rpx 28rpx rgba(15,23,42,.06);
}
.sheet-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16rpx; }
.sheet-title { font-size: 40rpx; font-weight: 800; color: var(--km-text); }
.airport-entry { font-size: 24rpx; color: var(--km-primary); font-weight: 600; white-space: nowrap; }
.pick-hint { display: block; margin: 10rpx 0 18rpx; font-size: 22rpx; color: var(--km-muted); }
.addr {
  display: flex; align-items: center; gap: 14rpx;
  padding: 16rpx 18rpx; margin-bottom: 12rpx;
  border-radius: 18rpx; background: var(--km-bg);
  border: 2rpx solid transparent;
}
.addr.on { border-color: color-mix(in srgb, var(--km-primary) 40%, transparent); background: color-mix(in srgb, var(--km-primary) 6%, var(--km-bg)); }
.addr.err { border-color: var(--km-danger, #c74635); }
.demo-hint { display: block; margin: -6rpx 0 12rpx; font-size: 20rpx; color: var(--km-text-muted); }
.eta-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14rpx; }
.eta-label { font-size: 22rpx; color: var(--km-text-secondary); }
.eta-value { font-size: 28rpx; font-weight: 700; color: var(--km-primary); }
.field-error { display: block; margin: -4rpx 0 12rpx 4rpx; font-size: 20rpx; color: var(--km-danger, #c74635); }
.dot { width: 14rpx; height: 14rpx; border-radius: 50%; flex-shrink: 0; }
.dot.blue { background: var(--km-primary); }
.dot.red { background: var(--km-danger, #c74635); }
.addr-body { flex: 1; min-width: 0; }
.addr-label { display: block; font-size: 20rpx; color: var(--km-muted); margin-bottom: 4rpx; }
.addr-input { width: 100%; font-size: 28rpx; color: var(--km-text); }
.ph { color: var(--km-muted); }
.map-btn {
  flex-shrink: 0; padding: 10rpx 16rpx; border-radius: 999rpx;
  font-size: 22rpx; color: var(--km-primary); background: rgba(37,99,235,.08); font-weight: 600;
}
.chips { width: 100%; white-space: nowrap; margin: 8rpx 0 4rpx; }
.chip-row { display: inline-flex; gap: 12rpx; padding: 4rpx 2rpx 8rpx; }
.chip {
  display: inline-block; padding: 12rpx 20rpx; border-radius: 999rpx;
  font-size: 22rpx; color: var(--km-text-secondary); background: var(--km-bg); white-space: nowrap;
}
.chip.on { background: color-mix(in srgb, var(--km-primary) 14%, var(--km-surface)); color: var(--km-primary); font-weight: 600; }
.airport-box { margin-top: 16rpx; padding: 16rpx; border-radius: 18rpx; background: var(--km-bg); }
.field { margin-bottom: 14rpx; }
.lbl { display: block; font-size: 22rpx; color: var(--km-muted); margin-bottom: 8rpx; }
.input {
  width: 100%; box-sizing: border-box; padding: 16rpx 18rpx; border-radius: 14rpx;
  background: var(--km-surface); font-size: 26rpx; color: var(--km-text);
  border: 1rpx solid rgba(15,23,42,.08);
}
.input.like { display: block; }
.airport-cta {
  margin-top: 8rpx; text-align: center; padding: 20rpx;
  border-radius: 16rpx; background: var(--km-primary); color: var(--km-text-inverse); font-weight: 700; font-size: 28rpx;
}
.bottom {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent, var(--km-bg) 28%);
}
.go {
  text-align: center; padding: 26rpx; border-radius: 20rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-size: 30rpx; font-weight: 800;
  box-shadow: var(--km-shadow-card);
}
.mask {
  position: fixed; inset: 0; z-index: 40; background: rgba(15,23,42,.45);
  display: flex; align-items: flex-end; justify-content: center;
}
.dialog {
  width: 100%; background: var(--km-surface); border-radius: 28rpx 28rpx 0 0;
  padding: 32rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
}
.dialog-title { display: block; font-size: 32rpx; font-weight: 800; margin-bottom: 20rpx; }
.dialog .input { margin-bottom: 14rpx; }
.dialog-go {
  margin-top: 10rpx; text-align: center; padding: 24rpx; border-radius: 18rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-weight: 800;
}
.dialog-go.disabled { opacity: .55; }
</style>
