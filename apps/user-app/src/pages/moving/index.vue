<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { APPOINT_SLOTS, MOVING_VEHICLES, ZONE_POINTS } from '../../data/moving';
import { SEZ_BOUNDS } from '../../data/geo-sez';
import { requireUserSession } from '../../stores/auth';
import { backOrHome } from '../../utils/navigation';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { track } from '../../utils/analytics';
import { locale, t } from '../../i18n';

type Point = { label: string; lat: number; lng: number };

const step = ref(1);
const from = ref<Point | null>(null);
const to = ref<Point | null>(null);
const fromFloor = ref('1');
const toFloor = ref('1');
const fromElevator = ref(true);
const toElevator = ref(true);
const vehicleId = ref<'small' | 'large' | ''>('');
const appointDate = ref('');
const appointSlot = ref<'morning' | 'afternoon' | 'evening'>('afternoon');
const contactName = ref('');
const phone = ref('');
const note = ref('');
const submitting = ref(false);
const pickRole = ref<'moving_from' | 'moving_to'>('moving_from');

const vehicle = computed(() => MOVING_VEHICLES.find((v) => v.id === vehicleId.value));

onShow(() => {
  const raw = uni.getStorageSync('km.lifestyle.mapPick') as
    | { role?: string; lat?: number; lng?: number; label?: string }
    | '';
  if (!raw || typeof raw !== 'object' || raw.lat == null || raw.lng == null) return;
  const point: Point = {
    label: raw.label || t('moving.mapPoint'),
    lat: Number(raw.lat),
    lng: Number(raw.lng),
  };
  if (raw.role === 'moving_to') to.value = point;
  else if (raw.role === 'moving_from') from.value = point;
  uni.removeStorageSync('km.lifestyle.mapPick');
  track('moving_map_pick', { role: raw.role || 'moving_from' });
});

function goBack(): void {
  if (step.value > 1) {
    step.value -= 1;
    return;
  }
  backOrHome();
}

function setStep(next: number): void {
  step.value = next;
  track('moving_step_view', { step: next });
}

function pickZone(target: 'from' | 'to', zoneId: string): void {
  const zone = ZONE_POINTS.find((z) => z.id === zoneId);
  if (!zone) return;
  const point = { label: zone.name, lat: zone.lat, lng: zone.lng };
  if (target === 'from') from.value = point;
  else to.value = point;
}

function openMap(role: 'moving_from' | 'moving_to'): void {
  pickRole.value = role;
  uni.navigateTo({ url: `/pages/map-pick/index?role=${role}` });
}

function selectVehicle(id: 'small' | 'large'): void {
  vehicleId.value = id;
  track('moving_vehicle_select', { vehicleId: id });
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

function onDateChange(e: { detail: { value: string } }): void {
  appointDate.value = e.detail.value;
}

function nextFromStep1(): void {
  if (!from.value || !to.value) {
    uni.showToast({ title: t('moving.needAddress'), icon: 'none' });
    return;
  }
  if (from.value.label === to.value.label && from.value.lat === to.value.lat) {
    uni.showToast({ title: t('moving.sameAddress'), icon: 'none' });
    return;
  }
  setStep(2);
}

function nextFromStep2(): void {
  if (!vehicleId.value) {
    uni.showToast({ title: t('moving.needVehicle'), icon: 'none' });
    return;
  }
  setStep(3);
}

function routeStyle(): Record<string, string> {
  if (!from.value || !to.value) return {};
  const spanLng = SEZ_BOUNDS.maxLng - SEZ_BOUNDS.minLng;
  const spanLat = SEZ_BOUNDS.maxLat - SEZ_BOUNDS.minLat;
  const x1 = ((from.value.lng - SEZ_BOUNDS.minLng) / spanLng) * 100;
  const y1 = (1 - (from.value.lat - SEZ_BOUNDS.minLat) / spanLat) * 100;
  const x2 = ((to.value.lng - SEZ_BOUNDS.minLng) / spanLng) * 100;
  const y2 = (1 - (to.value.lat - SEZ_BOUNDS.minLat) / spanLat) * 100;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    left: `${x1}%`,
    top: `${y1}%`,
    width: `${len}%`,
    transform: `rotate(${angle}deg)`,
  };
}

function pointPct(lat: number, lng: number): { left: string; top: string } {
  const spanLng = SEZ_BOUNDS.maxLng - SEZ_BOUNDS.minLng;
  const spanLat = SEZ_BOUNDS.maxLat - SEZ_BOUNDS.minLat;
  return {
    left: `${((lng - SEZ_BOUNDS.minLng) / spanLng) * 100}%`,
    top: `${(1 - (lat - SEZ_BOUNDS.minLat) / spanLat) * 100}%`,
  };
}

async function submit(): Promise<void> {
  if (!from.value || !to.value || !vehicle.value) return;
  if (!appointDate.value) {
    uni.showToast({ title: t('moving.needDate'), icon: 'none' });
    return;
  }
  if (!contactName.value.trim() || !phone.value.trim()) {
    uni.showToast({ title: t('moving.needContact'), icon: 'none' });
    return;
  }
  if (!requireUserSession()) return;

  const slotLabel = APPOINT_SLOTS.find((s) => s.id === appointSlot.value)?.label ?? '';
  const detail = [
    vehicle.value.name,
    `${from.value.label}→${to.value.label}`,
    appointDate.value,
    slotLabel,
    `起${fromFloor.value}楼${fromElevator.value ? '有电梯' : '无电梯'}`,
    `终${toFloor.value}楼${toElevator.value ? '有电梯' : '无电梯'}`,
  ].join(' · ');

  submitting.value = true;
  track('moving_submit', { vehicleId: vehicleId.value });
  try {
    const order = await userApi.createLifestyle({
      serviceType: 'MOVING',
      contactName: contactName.value.trim(),
      phone: phone.value.trim(),
      detail,
      payload: {
        from: {
          ...from.value,
          floor: Number(fromFloor.value) || 1,
          elevator: fromElevator.value,
        },
        to: {
          ...to.value,
          floor: Number(toFloor.value) || 1,
          elevator: toElevator.value,
        },
        vehicleId: vehicleId.value,
        appointDate: appointDate.value,
        appointSlot: appointSlot.value,
        note: note.value.trim() || undefined,
      },
    });
    uni.showToast({ title: t('moving.submitted'), icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('moving.title') }}</text>
      <text class="ph" />
    </view>

    <view class="progress">
      <text class="prog" :class="{ on: step >= 1 }">1 {{ t('moving.stepAddress') }}</text>
      <text class="prog" :class="{ on: step >= 2 }">2 {{ t('moving.stepVehicle') }}</text>
      <text class="prog" :class="{ on: step >= 3 }">3 {{ t('moving.stepContact') }}</text>
    </view>

    <!-- Step 1 -->
    <view v-if="step === 1" class="body">
      <view v-if="from && to" class="mini-map">
        <view class="dot from" :style="pointPct(from.lat, from.lng)" />
        <view class="dot to" :style="pointPct(to.lat, to.lng)" />
        <view class="line" :style="routeStyle()" />
        <text class="map-cap">{{ t('moving.routePreview') }}</text>
      </view>

      <view class="card">
        <text class="card-title">{{ t('moving.from') }}</text>
        <scroll-view scroll-x class="zone-scroll" :show-scrollbar="false">
          <view class="zone-row">
            <text
              v-for="z in ZONE_POINTS"
              :key="'f-' + z.id"
              class="zone"
              :class="{ on: from?.label === z.name }"
              @tap="pickZone('from', z.id)"
            >{{ z.name }}</text>
          </view>
        </scroll-view>
        <view class="map-btn" @tap="openMap('moving_from')">{{ from ? from.label + ' · ' + t('moving.adjustMap') : t('moving.pickMap') }}</view>
        <view class="floor-row">
          <view class="floor">
            <text class="lbl">{{ t('moving.floor') }}</text>
            <input v-model="fromFloor" class="floor-input" type="number" />
          </view>
          <text class="elev" :class="{ on: fromElevator }" @tap="fromElevator = !fromElevator">
            {{ fromElevator ? t('moving.hasElevator') : t('moving.noElevator') }}
          </text>
        </view>
      </view>

      <view class="card">
        <text class="card-title">{{ t('moving.to') }}</text>
        <scroll-view scroll-x class="zone-scroll" :show-scrollbar="false">
          <view class="zone-row">
            <text
              v-for="z in ZONE_POINTS"
              :key="'t-' + z.id"
              class="zone"
              :class="{ on: to?.label === z.name }"
              @tap="pickZone('to', z.id)"
            >{{ z.name }}</text>
          </view>
        </scroll-view>
        <view class="map-btn" @tap="openMap('moving_to')">{{ to ? to.label + ' · ' + t('moving.adjustMap') : t('moving.pickMap') }}</view>
        <view class="floor-row">
          <view class="floor">
            <text class="lbl">{{ t('moving.floor') }}</text>
            <input v-model="toFloor" class="floor-input" type="number" />
          </view>
          <text class="elev" :class="{ on: toElevator }" @tap="toElevator = !toElevator">
            {{ toElevator ? t('moving.hasElevator') : t('moving.noElevator') }}
          </text>
        </view>
      </view>

      <view class="cta" @tap="nextFromStep1">{{ t('moving.next') }}</view>
    </view>

    <!-- Step 2 -->
    <view v-else-if="step === 2" class="body">
      <view
        v-for="v in MOVING_VEHICLES"
        :key="v.id"
        class="vehicle"
        :class="{ on: vehicleId === v.id }"
        @tap="selectVehicle(v.id)"
      >
        <view class="v-cover" :style="{ background: v.tone }">
          <text class="v-name">{{ v.name }}</text>
        </view>
        <view class="v-body">
          <text class="v-cap">{{ v.capacity }}</text>
          <text class="v-hint">{{ v.hint }}</text>
        </view>
      </view>
      <view class="cta" @tap="nextFromStep2">{{ t('moving.next') }}</view>
    </view>

    <!-- Step 3 -->
    <view v-else class="body">
      <view class="card">
        <view class="field">
          <text class="lbl">{{ t('moving.date') }}</text>
          <picker mode="date" :value="appointDate" :start="todayIso()" @change="onDateChange">
            <text class="picker">{{ appointDate || t('moving.pickDate') }}</text>
          </picker>
        </view>
        <view class="slots">
          <text
            v-for="s in APPOINT_SLOTS"
            :key="s.id"
            class="slot"
            :class="{ on: appointSlot === s.id }"
            @tap="appointSlot = s.id"
          >{{ s.label }}</text>
        </view>
        <view class="field">
          <text class="lbl">{{ t('moving.contactName') }}</text>
          <input v-model.trim="contactName" class="input" :placeholder="t('moving.contactNamePh')" />
        </view>
        <view class="field">
          <text class="lbl">{{ t('moving.phone') }}</text>
          <input v-model.trim="phone" class="input" type="number" :placeholder="t('moving.phonePh')" />
        </view>
        <view class="field">
          <text class="lbl">{{ t('moving.note') }}</text>
          <textarea v-model="note" class="textarea" :placeholder="t('moving.notePh')" />
        </view>
      </view>
      <view class="cta" :class="{ disabled: submitting }" @tap="submit">
        {{ submitting ? t('moving.submitting') : t('moving.submit') }}
      </view>
      <text class="hint">{{ t('moving.opsHint') }}</text>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 48rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 16rpx; background: var(--km-surface); }
.back { width: 60rpx; font-size: 44rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.ph { width: 60rpx; }
.progress { display: flex; gap: 8rpx; padding: 16rpx 28rpx; }
.prog { flex: 1; text-align: center; font-size: 20rpx; color: var(--km-text-muted); padding: 10rpx 4rpx; background: var(--km-surface); border-radius: 10rpx; }
.prog.on { color: var(--km-primary); font-weight: 700; background: var(--km-primary-soft); }
.body { padding: 8rpx 28rpx 32rpx; }
.mini-map {
  position: relative; height: 180rpx; margin-bottom: 16rpx; border-radius: 16rpx;
  background: linear-gradient(160deg, var(--km-primary-soft), #e2e8f0); overflow: hidden;
}
.dot { position: absolute; width: 18rpx; height: 18rpx; border-radius: 50%; margin-left: -9rpx; margin-top: -9rpx; z-index: 2; }
.dot.from { background: var(--km-primary); }
.dot.to { background: #dc2626; }
.line { position: absolute; height: 4rpx; background: var(--km-primary); transform-origin: 0 50%; opacity: 0.7; z-index: 1; }
.map-cap { position: absolute; left: 16rpx; bottom: 12rpx; font-size: 20rpx; color: var(--km-text-secondary); }
.card { background: var(--km-surface); border-radius: 18rpx; padding: 22rpx; margin-bottom: 16rpx; }
.card-title { display: block; font-size: 28rpx; font-weight: 700; margin-bottom: 12rpx; }
.zone-scroll { white-space: nowrap; margin-bottom: 12rpx; }
.zone-row { display: inline-flex; gap: 10rpx; }
.zone { padding: 10rpx 18rpx; border-radius: 999rpx; background: var(--km-surface-sunken); font-size: 22rpx; color: var(--km-text-secondary); white-space: nowrap; }
.zone.on { background: var(--km-primary); color: #fff; }
.map-btn { padding: 18rpx; background: var(--km-surface-sunken); border-radius: 12rpx; font-size: 24rpx; color: var(--km-primary); text-align: center; }
.floor-row { display: flex; align-items: center; justify-content: space-between; margin-top: 14rpx; gap: 12rpx; }
.floor { display: flex; align-items: center; gap: 10rpx; }
.lbl { font-size: 24rpx; color: var(--km-text-secondary); }
.floor-input { width: 100rpx; height: 64rpx; background: var(--km-surface-sunken); border-radius: 10rpx; text-align: center; font-size: 26rpx; }
.elev { padding: 10rpx 16rpx; border-radius: 999rpx; background: var(--km-surface-sunken); font-size: 22rpx; color: var(--km-text-secondary); }
.elev.on { background: #dcfce7; color: #15803d; }
.vehicle { display: flex; background: var(--km-surface); border-radius: 18rpx; overflow: hidden; margin-bottom: 16rpx; border: 2rpx solid transparent; }
.vehicle.on { border-color: var(--km-primary); }
.v-cover { width: 160rpx; padding: 24rpx 16rpx; color: #fff; display: flex; align-items: center; justify-content: center; }
.v-name { font-size: 32rpx; font-weight: 800; }
.v-body { flex: 1; padding: 22rpx; }
.v-cap { display: block; font-size: 26rpx; font-weight: 700; color: var(--km-text); }
.v-hint { display: block; margin-top: 8rpx; font-size: 22rpx; color: var(--km-text-secondary); }
.field { margin-bottom: 16rpx; }
.picker, .input { display: block; width: 100%; box-sizing: border-box; padding: 16rpx 18rpx; background: var(--km-surface-sunken); border-radius: 12rpx; font-size: 26rpx; color: var(--km-text); }
.input { height: 72rpx; }
.textarea { width: 100%; height: 140rpx; box-sizing: border-box; padding: 16rpx 18rpx; background: var(--km-surface-sunken); border-radius: 12rpx; font-size: 26rpx; }
.slots { display: flex; gap: 10rpx; margin-bottom: 16rpx; }
.slot { flex: 1; text-align: center; padding: 14rpx 0; border-radius: 12rpx; background: var(--km-surface-sunken); font-size: 24rpx; color: var(--km-text-secondary); }
.slot.on { background: var(--km-primary); color: #fff; }
.cta { margin-top: 8rpx; height: 88rpx; line-height: 88rpx; text-align: center; background: var(--km-primary); color: #fff; font-size: 28rpx; font-weight: 700; border-radius: 16rpx; }
.cta.disabled { opacity: 0.6; }
.hint { display: block; margin-top: 14rpx; font-size: 22rpx; color: var(--km-text-muted); }
</style>
