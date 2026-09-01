<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  AIRPORTS,
  DEFAULT_AIRPORT,
  HOT_ROUTES,
  airportByCode,
  destinationsFor,
  flightPrice,
  searchFlights,
  type FlightOption,
  type HotRoute,
} from '../../data/tickets';
import { requireUserSession } from '../../stores/auth';
import { backOrHome } from '../../utils/navigation';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { track } from '../../utils/analytics';
import { locale, t } from '../../i18n';

type TripType = 'oneway' | 'round';
type Cabin = 'economy' | 'business';

const modeTab = ref<'flight' | 'bus' | 'train'>('flight');
const tripType = ref<TripType>('oneway');
const fromCode = ref(DEFAULT_AIRPORT.code);
const toCode = ref('VTE');
const departDate = ref('');
const returnDate = ref('');
const cabin = ref<Cabin>('economy');
const adults = ref(1);
const contactName = ref('');
const phone = ref('');
const note = ref('');
const submitting = ref(false);
const searched = ref(false);
const results = ref<FlightOption[]>([]);
const sheetOpen = ref(false);
const successOpen = ref(false);
const selectedFlight = ref<FlightOption | null>(null);
const lastOrderId = ref('');

const fromAirport = computed(() => airportByCode(fromCode.value) ?? DEFAULT_AIRPORT);
const toOptions = computed(() => destinationsFor(fromCode.value));
const toAirport = computed(
  () => toOptions.value.find((a) => a.code === toCode.value) ?? toOptions.value[0] ?? AIRPORTS[1],
);
const fromOptions = computed(() => AIRPORTS);

watch(fromCode, () => {
  const allowed = destinationsFor(fromCode.value);
  if (!allowed.some((a) => a.code === toCode.value)) {
    toCode.value = allowed[0]?.code ?? 'VTE';
  }
});

function goBack(): void {
  backOrHome();
}

function setTrip(next: TripType): void {
  tripType.value = next;
  track('ticket_trip_toggle', { tripType: next });
}

function swapAirports(): void {
  const nextFrom = toCode.value;
  const nextTo = fromCode.value;
  const allowedTo = destinationsFor(nextFrom);
  if (!allowedTo.some((a) => a.code === nextTo)) {
    uni.showToast({ title: t('ticket.swapBlocked'), icon: 'none' });
    return;
  }
  fromCode.value = nextFrom;
  toCode.value = nextTo;
  track('ticket_swap_airports');
}

function applyRoute(route: HotRoute): void {
  fromCode.value = route.fromCode;
  toCode.value = route.toCode;
  track('ticket_hot_route_click', { hotRouteId: route.id });
  uni.showToast({ title: t('ticket.filled'), icon: 'none' });
}

function onFromChange(e: { detail: { value: string } }): void {
  const idx = Number(e.detail.value);
  if (!Number.isNaN(idx) && fromOptions.value[idx]) fromCode.value = fromOptions.value[idx].code;
}

function onToChange(e: { detail: { value: string } }): void {
  const idx = Number(e.detail.value);
  if (!Number.isNaN(idx) && toOptions.value[idx]) toCode.value = toOptions.value[idx].code;
}

function bumpAdults(delta: number): void {
  adults.value = Math.min(9, Math.max(1, adults.value + delta));
}

function soonToast(): void {
  uni.showToast({ title: t('ticket.soon'), icon: 'none' });
}

function onDepartChange(e: { detail: { value: string } }): void {
  departDate.value = e.detail.value;
}

function onReturnChange(e: { detail: { value: string } }): void {
  returnDate.value = e.detail.value;
}

function todayIso(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function priceOf(flight: FlightOption): number {
  return flightPrice(flight, cabin.value);
}

function runSearch(): void {
  if (modeTab.value !== 'flight') {
    uni.showToast({ title: t('ticket.soon'), icon: 'none' });
    return;
  }
  if (fromCode.value === toCode.value) {
    uni.showToast({ title: t('ticket.sameAirport'), icon: 'none' });
    return;
  }
  if (!departDate.value) {
    uni.showToast({ title: t('ticket.needDepart'), icon: 'none' });
    return;
  }
  if (departDate.value < todayIso()) {
    uni.showToast({ title: t('ticket.pastDate'), icon: 'none' });
    return;
  }
  if (tripType.value === 'round') {
    if (!returnDate.value) {
      uni.showToast({ title: t('ticket.needReturn'), icon: 'none' });
      return;
    }
    if (returnDate.value < departDate.value) {
      uni.showToast({ title: t('ticket.returnBefore'), icon: 'none' });
      return;
    }
  }

  results.value = searchFlights(fromCode.value, toCode.value);
  searched.value = true;
  track('ticket_search', {
    fromCode: fromCode.value,
    toCode: toCode.value,
    count: results.value.length,
  });
  if (!results.value.length) {
    uni.showToast({ title: t('ticket.noFlights'), icon: 'none' });
  }
}

function openBook(flight: FlightOption): void {
  selectedFlight.value = flight;
  sheetOpen.value = true;
  successOpen.value = false;
  track('ticket_book_open', { flightId: flight.id });
}

function closeSheet(): void {
  if (submitting.value) return;
  sheetOpen.value = false;
}

async function submitBook(): Promise<void> {
  const flight = selectedFlight.value;
  if (!flight) return;
  if (!contactName.value.trim() || !phone.value.trim()) {
    uni.showToast({ title: t('ticket.needContact'), icon: 'none' });
    return;
  }
  if (!requireUserSession()) return;

  const tripLabel = tripType.value === 'round' ? t('ticket.round') : t('ticket.oneway');
  const cabinLabel = cabin.value === 'business' ? t('ticket.business') : t('ticket.economy');
  const unit = priceOf(flight);
  const detail = [
    tripLabel,
    `${flight.flightNo} ${fromAirport.value.city}→${toAirport.value.city}`,
    `${flight.departTime}-${flight.arriveTime}`,
    departDate.value,
    tripType.value === 'round' ? `回程${returnDate.value}` : '',
    cabinLabel,
    `${adults.value}${t('ticket.adultUnit')}`,
    `参考¥${unit}`,
  ]
    .filter(Boolean)
    .join(' · ');

  submitting.value = true;
  track('ticket_book_submit', { flightId: flight.id });
  try {
    const order = await userApi.createLifestyle({
      serviceType: 'TICKET',
      contactName: contactName.value.trim(),
      phone: phone.value.trim(),
      detail,
      payload: {
        mode: 'flight',
        tripType: tripType.value,
        flightId: flight.id,
        flightNo: flight.flightNo,
        airline: flight.airline,
        fromCode: flight.fromCode,
        fromName: fromAirport.value.name,
        toCode: flight.toCode,
        toName: toAirport.value.name,
        departDate: departDate.value,
        returnDate: tripType.value === 'round' ? returnDate.value : null,
        departTime: flight.departTime,
        arriveTime: flight.arriveTime,
        cabin: cabin.value,
        adults: adults.value,
        priceHint: unit,
        stopType: flight.stopType,
        note: note.value.trim() || flight.note || undefined,
      },
    });
    lastOrderId.value = order.id;
    sheetOpen.value = false;
    successOpen.value = true;
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

function goRide(): void {
  successOpen.value = false;
  track('ticket_success_ride', { orderId: lastOrderId.value });
  uni.navigateTo({ url: '/pages/ride/index' });
}

function goOrder(): void {
  successOpen.value = false;
  if (!lastOrderId.value) return;
  uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(lastOrderId.value)}` });
}

function closeSuccess(): void {
  successOpen.value = false;
}
</script>

<template>
  <view class="page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('ticket.title') }}</text>
      <text class="ph" />
    </view>

    <view class="mode-row">
      <text class="mode active">{{ t('ticket.flight') }}</text>
      <text class="mode disabled" @tap="soonToast">{{ t('ticket.bus') }}</text>
      <text class="mode disabled" @tap="soonToast">{{ t('ticket.train') }}</text>
    </view>

    <view class="panel">
      <view class="trip-toggle">
        <view class="trip" :class="{ on: tripType === 'oneway' }" @tap="setTrip('oneway')">
          <text class="trip-txt">{{ t('ticket.oneway') }}</text>
        </view>
        <view class="trip" :class="{ on: tripType === 'round' }" @tap="setTrip('round')">
          <text class="trip-txt">{{ t('ticket.round') }}</text>
        </view>
      </view>

      <view class="tip">
        <text class="tip-mark">i</text>
        <text class="tip-txt">{{ t('ticket.borRule') }}</text>
      </view>

      <view class="route">
        <view class="route-main">
          <picker :range="fromOptions" range-key="name" @change="onFromChange">
            <view class="leg">
              <text class="leg-label">{{ t('ticket.from') }}</text>
              <view class="leg-body">
                <text class="leg-city">{{ fromAirport.city }}</text>
                <text class="leg-code">{{ fromAirport.code }}</text>
              </view>
              <text class="leg-airport">{{ fromAirport.name }}</text>
            </view>
          </picker>
          <view class="route-divider" />
          <picker :range="toOptions" range-key="name" @change="onToChange">
            <view class="leg">
              <text class="leg-label">{{ t('ticket.to') }}</text>
              <view class="leg-body">
                <text class="leg-city">{{ toAirport.city }}</text>
                <text class="leg-code">{{ toAirport.code }}</text>
              </view>
              <text class="leg-airport">{{ toAirport.name }}</text>
            </view>
          </picker>
        </view>
        <view class="swap" @tap="swapAirports">
          <text class="swap-ico">⇄</text>
        </view>
      </view>

      <view class="meta">
        <view class="dates" :class="{ round: tripType === 'round' }">
          <view class="meta-date">
            <text class="meta-label">{{ t('ticket.depart') }}</text>
            <picker mode="date" :value="departDate" :start="todayIso()" @change="onDepartChange">
              <view class="meta-value" :class="{ placeholder: !departDate }">
                {{ departDate || t('ticket.pickDate') }}
              </view>
            </picker>
          </view>
          <view v-if="tripType === 'round'" class="meta-date">
            <text class="meta-label">{{ t('ticket.return') }}</text>
            <picker mode="date" :value="returnDate" :start="departDate || todayIso()" @change="onReturnChange">
              <view class="meta-value" :class="{ placeholder: !returnDate }">
                {{ returnDate || t('ticket.pickDate') }}
              </view>
            </picker>
          </view>
        </view>

        <view class="meta-side">
          <view class="cabin-seg">
            <text class="seg" :class="{ on: cabin === 'economy' }" @tap="cabin = 'economy'">{{ t('ticket.economy') }}</text>
            <text class="seg" :class="{ on: cabin === 'business' }" @tap="cabin = 'business'">{{ t('ticket.business') }}</text>
          </view>
          <view class="pax">
            <text class="meta-label">{{ t('ticket.adults') }}</text>
            <view class="stepper">
              <text class="step" @tap="bumpAdults(-1)">−</text>
              <text class="step-n">{{ adults }}</text>
              <text class="step" @tap="bumpAdults(1)">+</text>
            </view>
          </view>
        </view>
      </view>

      <view class="search-btn" @tap="runSearch">
        <text class="search-txt">{{ t('ticket.search') }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">{{ t('ticket.hotTitle') }}</text>
      <scroll-view scroll-x class="hot-scroll" :show-scrollbar="false">
        <view class="hot-row">
          <view v-for="route in HOT_ROUTES" :key="route.id" class="hot-card" @tap="applyRoute(route)">
            <text v-if="route.tag" class="hot-tag">{{ route.tag }}</text>
            <text class="hot-route">{{ route.fromName }} ⇄ {{ route.toName }}</text>
            <text class="hot-price">{{ t('ticket.fromPrice', { n: route.priceHint }) }}</text>
            <text class="hot-cta">{{ t('ticket.applyRoute') }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="searched" class="section results">
      <text class="section-title">
        {{ t('ticket.resultsTitle') }}
        <text class="count">{{ results.length }}</text>
      </text>
      <text class="price-note">{{ t('ticket.priceNote') }}</text>

      <view v-if="!results.length" class="empty">{{ t('ticket.noFlights') }}</view>

      <view v-for="flight in results" :key="flight.id" class="flight-card">
        <view class="flight-top">
          <view>
            <text class="flight-no">{{ flight.flightNo }}</text>
            <text class="airline">{{ flight.airline }} · {{ flight.frequency }}</text>
          </view>
          <view class="price-box">
            <text class="price">¥{{ priceOf(flight) }}</text>
            <text class="price-unit">{{ cabin === 'business' ? t('ticket.business') : t('ticket.economy') }}</text>
          </view>
        </view>
        <view class="timeline">
          <view class="time-col">
            <text class="time">{{ flight.departTime }}</text>
            <text class="city">{{ fromAirport.city }}</text>
          </view>
          <view class="mid">
            <text class="dur">{{ flight.duration }}</text>
            <view class="line" />
            <text class="stop">{{ flight.stopType === 'connect' ? t('ticket.connect') : t('ticket.nonstop') }}</text>
          </view>
          <view class="time-col right">
            <text class="time">{{ flight.arriveTime }}</text>
            <text class="city">{{ toAirport.city }}</text>
          </view>
        </view>
        <text v-if="flight.note" class="flight-note">{{ flight.note }}</text>
        <view class="book-btn" @tap="openBook(flight)">{{ t('ticket.bookNow') }}</view>
      </view>
    </view>

    <text class="hint">{{ t('ticket.opsHint') }}</text>

    <!-- 预定弹层 -->
    <view v-if="sheetOpen" class="mask" @tap="closeSheet">
      <view class="sheet" @tap.stop>
        <view class="sheet-handle" />
        <text class="sheet-title">{{ t('ticket.bookTitle') }}</text>
        <text v-if="selectedFlight" class="sheet-flight">
          {{ selectedFlight.flightNo }} · {{ fromAirport.city }}→{{ toAirport.city }} · ¥{{ priceOf(selectedFlight) }}
        </text>
        <view class="field">
          <text class="field-label">{{ t('ticket.contactName') }}</text>
          <input v-model.trim="contactName" class="input" :placeholder="t('ticket.contactNamePh')" placeholder-class="ph-input" />
        </view>
        <view class="field">
          <text class="field-label">{{ t('ticket.phone') }}</text>
          <input v-model.trim="phone" class="input" type="number" :placeholder="t('ticket.phonePh')" placeholder-class="ph-input" />
        </view>
        <view class="field">
          <text class="field-label">{{ t('ticket.note') }}</text>
          <textarea v-model="note" class="textarea" :placeholder="t('ticket.notePh')" placeholder-class="ph-input" />
        </view>
        <view class="meta-row">
          <text>{{ departDate }} · {{ adults }}{{ t('ticket.adultUnit') }} · {{ cabin === 'business' ? t('ticket.business') : t('ticket.economy') }}</text>
        </view>
        <view class="submit" :class="{ disabled: submitting }" @tap="submitBook">
          {{ submitting ? t('ticket.submitting') : t('ticket.submitBook') }}
        </view>
      </view>
    </view>

    <!-- 成功 → 约车 -->
    <view v-if="successOpen" class="mask success-mask" @tap="closeSuccess">
      <view class="success-card" @tap.stop>
        <text class="success-ok">✓</text>
        <text class="success-title">{{ t('ticket.submitted') }}</text>
        <text class="success-desc">{{ t('ticket.successHint') }}</text>
        <view class="success-ride" @tap="goRide">{{ t('ticket.bookRide') }}</view>
        <view class="success-order" @tap="goOrder">{{ t('ticket.viewOrder') }}</view>
        <text class="success-close" @tap="closeSuccess">{{ t('ticket.close') }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 64rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 16rpx; background: var(--km-surface, #fff); }
.back { width: 60rpx; font-size: 44rpx; color: var(--km-text); }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.ph { width: 60rpx; }
.mode-row { display: flex; gap: 12rpx; padding: 20rpx 28rpx 0; }
.mode { padding: 12rpx 22rpx; border-radius: 999rpx; background: var(--km-surface); font-size: 24rpx; color: var(--km-text-secondary); }
.mode.active { background: var(--km-primary); color: #fff; font-weight: 600; }
.mode.disabled { opacity: 0.45; }
.panel {
  margin: 16rpx 28rpx 20rpx;
  padding: 28rpx 28rpx 32rpx;
  background: var(--km-surface);
  border-radius: 28rpx;
  border: 1rpx solid color-mix(in srgb, var(--km-border) 70%, transparent);
  box-shadow: 0 10rpx 36rpx rgba(15, 23, 42, 0.05);
}
.trip-toggle {
  display: flex;
  gap: 0;
  margin: 0 0 22rpx;
  border-bottom: 1rpx solid var(--km-border);
}
.trip {
  position: relative;
  flex: 1;
  padding: 8rpx 0 18rpx;
  text-align: center;
}
.trip-txt {
  font-size: 28rpx;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--km-text-muted);
}
.trip.on .trip-txt {
  color: var(--km-text);
  font-weight: 700;
}
.trip.on::after {
  content: '';
  position: absolute;
  left: 28%;
  right: 28%;
  bottom: -1rpx;
  height: 4rpx;
  border-radius: 4rpx;
  background: var(--km-primary);
}
.tip {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, color-mix(in srgb, var(--km-primary) 8%, #fff), color-mix(in srgb, var(--km-primary) 4%, var(--km-surface-sunken)));
  border: 1rpx solid color-mix(in srgb, var(--km-primary) 14%, transparent);
}
.tip-mark {
  flex-shrink: 0;
  width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--km-primary) 16%, #fff);
  color: var(--km-primary);
  font-size: 20rpx;
  font-weight: 700;
  font-style: italic;
}
.tip-txt {
  flex: 1;
  font-size: 22rpx;
  line-height: 1.55;
  color: color-mix(in srgb, var(--km-primary) 55%, var(--km-text-secondary));
  letter-spacing: 0.01em;
}
.route {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 12rpx;
  margin-bottom: 8rpx;
}
.route-main {
  flex: 1;
  min-width: 0;
  padding: 8rpx 12rpx 8rpx 4rpx;
}
.route-main picker {
  display: block;
  width: 100%;
}
.leg { padding: 10rpx 0; }
.leg-label {
  display: block;
  font-size: 20rpx;
  letter-spacing: 0.12em;
  color: var(--km-text-muted);
  text-transform: uppercase;
}
.leg-body {
  display: flex;
  align-items: baseline;
  gap: 14rpx;
  margin-top: 8rpx;
}
.leg-city {
  font-size: 40rpx;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--km-text);
  line-height: 1.1;
}
.leg-code {
  font-size: 22rpx;
  font-weight: 650;
  letter-spacing: 0.08em;
  color: var(--km-primary);
}
.leg-airport {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--km-text-secondary);
  line-height: 1.35;
}
.route-divider {
  height: 1rpx;
  margin: 4rpx 0;
  background: linear-gradient(90deg, transparent, var(--km-border-strong), transparent);
}
.swap {
  align-self: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1rpx solid color-mix(in srgb, var(--km-primary) 22%, var(--km-border));
  box-shadow: 0 6rpx 18rpx rgba(37, 99, 235, 0.12);
  flex-shrink: 0;
}
.swap-ico {
  font-size: 28rpx;
  color: var(--km-primary);
  transform: rotate(90deg);
  line-height: 1;
}
.meta {
  margin-top: 20rpx;
  padding-top: 22rpx;
  border-top: 1rpx solid var(--km-border);
}
.dates { margin-bottom: 20rpx; }
.dates.round {
  display: flex;
  gap: 14rpx;
}
.dates.round .meta-date { flex: 1; min-width: 0; }
.meta-date { margin-bottom: 0; }
.meta-label {
  display: block;
  font-size: 20rpx;
  letter-spacing: 0.08em;
  color: var(--km-text-muted);
  margin-bottom: 10rpx;
}
.meta-value {
  display: block;
  padding: 20rpx 22rpx;
  border-radius: 16rpx;
  background: var(--km-surface-sunken);
  font-size: 30rpx;
  font-weight: 650;
  color: var(--km-text);
  letter-spacing: 0.02em;
}
.meta-value.placeholder {
  font-weight: 500;
  color: var(--km-text-muted);
}
.meta-side {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}
.cabin-seg {
  display: flex;
  flex: 1;
  padding: 6rpx;
  border-radius: 14rpx;
  background: var(--km-surface-sunken);
}
.seg {
  flex: 1;
  text-align: center;
  padding: 14rpx 8rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: var(--km-text-secondary);
  font-weight: 500;
}
.seg.on {
  background: #fff;
  color: var(--km-primary);
  font-weight: 700;
  box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.06);
}
.pax { flex-shrink: 0; text-align: right; min-width: 160rpx; }
.stepper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14rpx;
}
.step {
  width: 52rpx;
  height: 52rpx;
  line-height: 52rpx;
  text-align: center;
  border-radius: 12rpx;
  background: color-mix(in srgb, var(--km-primary) 10%, #fff);
  border: 1rpx solid color-mix(in srgb, var(--km-primary) 18%, transparent);
  color: var(--km-primary);
  font-size: 30rpx;
  font-weight: 500;
}
.step-n {
  min-width: 36rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 800;
  color: var(--km-text);
}
.search-btn {
  margin-top: 28rpx;
  height: 92rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, color-mix(in srgb, var(--km-primary) 92%, #fff), var(--km-primary));
  box-shadow: 0 12rpx 28rpx color-mix(in srgb, var(--km-primary) 28%, transparent);
}
.search-txt {
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.field { margin-top: 8rpx; }
.field-label { display: block; font-size: 22rpx; color: var(--km-text-secondary); margin-bottom: 8rpx; }
.section { margin: 8rpx 0 8rpx; }
.section-title { display: block; padding: 0 28rpx 12rpx; font-size: 28rpx; font-weight: 700; color: var(--km-text); }
.count { margin-left: 8rpx; font-size: 24rpx; color: var(--km-primary); font-weight: 600; }
.price-note { display: block; padding: 0 28rpx 12rpx; font-size: 20rpx; color: var(--km-text-muted); }
.hot-scroll { white-space: nowrap; }
.hot-row { display: inline-flex; gap: 16rpx; padding: 0 28rpx 8rpx; }
.hot-card {
  width: 240rpx; padding: 22rpx; border-radius: 18rpx; background: var(--km-surface);
  box-shadow: var(--km-shadow-card); position: relative; white-space: normal;
}
.hot-tag { position: absolute; top: 12rpx; right: 12rpx; font-size: 18rpx; color: var(--km-primary); background: var(--km-primary-soft); padding: 4rpx 10rpx; border-radius: 8rpx; }
.hot-route { display: block; font-size: 26rpx; font-weight: 700; color: var(--km-text); padding-right: 60rpx; }
.hot-price { display: block; margin-top: 10rpx; font-size: 24rpx; color: var(--km-primary); font-weight: 600; }
.hot-cta { display: block; margin-top: 12rpx; font-size: 22rpx; color: var(--km-text-secondary); }

.results { padding-bottom: 12rpx; }
.empty { margin: 0 28rpx; padding: 40rpx; text-align: center; color: var(--km-text-muted); background: var(--km-surface); border-radius: 16rpx; }
.flight-card {
  margin: 0 28rpx 16rpx; padding: 22rpx; border-radius: 18rpx;
  background: var(--km-surface); border: 1rpx solid var(--km-border);
}
.flight-top { display: flex; justify-content: space-between; gap: 16rpx; }
.flight-no { display: block; font-size: 30rpx; font-weight: 800; color: var(--km-text); }
.airline { display: block; margin-top: 6rpx; font-size: 22rpx; color: var(--km-text-muted); }
.price-box { text-align: right; }
.price { display: block; font-size: 34rpx; font-weight: 800; color: var(--km-primary); }
.price-unit { display: block; font-size: 18rpx; color: var(--km-text-muted); }
.timeline { display: flex; align-items: center; gap: 12rpx; margin-top: 18rpx; }
.time-col { flex: 1; min-width: 0; }
.time-col.right { text-align: right; }
.time { display: block; font-size: 34rpx; font-weight: 700; color: var(--km-text); }
.city { display: block; margin-top: 4rpx; font-size: 22rpx; color: var(--km-text-secondary); }
.mid { width: 180rpx; text-align: center; flex-shrink: 0; }
.dur { display: block; font-size: 20rpx; color: var(--km-text-muted); }
.line { height: 2rpx; margin: 8rpx 0; background: linear-gradient(90deg, transparent, var(--km-primary), transparent); }
.stop { display: block; font-size: 20rpx; color: var(--km-primary); }
.flight-note { display: block; margin-top: 12rpx; font-size: 20rpx; color: #b45309; line-height: 1.4; }
.book-btn {
  margin-top: 16rpx; height: 72rpx; line-height: 72rpx; text-align: center; border-radius: 14rpx;
  background: var(--km-primary); color: #fff; font-size: 26rpx; font-weight: 700;
}

.hint { display: block; margin: 16rpx 28rpx 0; font-size: 22rpx; color: var(--km-text-muted); line-height: 1.5; }

.mask {
  position: fixed; inset: 0; z-index: 80;
  background: var(--km-overlay, rgba(17, 24, 39, 0.42));
  display: flex; align-items: flex-end; justify-content: center;
  padding-left: var(--window-left, 0px); padding-right: var(--window-right, 0px);
}
.sheet {
  width: 100%; max-width: 480px; max-height: 86vh; overflow-y: auto;
  background: var(--km-surface); border-radius: 28rpx 28rpx 0 0;
  padding: 16rpx 28rpx calc(28rpx + env(safe-area-inset-bottom)); box-sizing: border-box;
}
.sheet-handle { width: 64rpx; height: 8rpx; border-radius: 8rpx; margin: 4rpx auto 18rpx; background: var(--km-border-strong); }
.sheet-title { display: block; font-size: 32rpx; font-weight: 800; color: var(--km-text); }
.sheet-flight { display: block; margin: 10rpx 0 18rpx; font-size: 24rpx; color: var(--km-primary); font-weight: 650; }
.input, .textarea {
  width: 100%; box-sizing: border-box; background: var(--km-surface-sunken); border-radius: 12rpx;
  padding: 0 18rpx; font-size: 26rpx; color: var(--km-text);
}
.input { height: 76rpx; }
.textarea { height: 120rpx; padding: 16rpx 18rpx; }
.ph-input { color: #aaa; }
.meta-row { margin: 8rpx 0 16rpx; font-size: 22rpx; color: var(--km-text-muted); }
.submit {
  height: 88rpx; line-height: 88rpx; text-align: center; border-radius: 16rpx;
  background: var(--km-primary); color: #fff; font-size: 28rpx; font-weight: 700;
}
.submit.disabled { opacity: 0.6; }

.success-mask { align-items: center; padding: 40rpx; }
.success-card {
  width: 100%; max-width: 420px; border-radius: 28rpx; padding: 40rpx 32rpx 28rpx;
  background: var(--km-surface); text-align: center; box-shadow: var(--km-shadow-floating);
}
.success-ok {
  display: inline-block; width: 72rpx; height: 72rpx; line-height: 72rpx; border-radius: 50%;
  background: #ecfdf5; color: #059669; font-size: 36rpx; font-weight: 800; margin-bottom: 16rpx;
}
.success-title { display: block; font-size: 34rpx; font-weight: 800; color: var(--km-text); }
.success-desc { display: block; margin: 12rpx 0 28rpx; font-size: 24rpx; color: var(--km-text-muted); line-height: 1.5; }
.success-ride { height: 84rpx; line-height: 84rpx; border-radius: 16rpx; background: var(--km-primary); color: #fff; font-size: 28rpx; font-weight: 700; }
.success-order { margin-top: 14rpx; height: 76rpx; line-height: 76rpx; border-radius: 16rpx; border: 1rpx solid var(--km-border); color: var(--km-text); font-size: 26rpx; font-weight: 600; }
.success-close { display: block; margin-top: 18rpx; font-size: 24rpx; color: var(--km-text-muted); }
</style>
