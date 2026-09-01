<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { findHotel, type HotelRoomType } from '../../data/hotels';
import { requireUserSession } from '../../stores/auth';
import { backOrHome } from '../../utils/navigation';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { track } from '../../utils/analytics';
import { t } from '../../i18n';
import SupportContactBtn from '../../components/support/SupportContactBtn.vue';
import RoomPhotoGallery from '../../components/RoomPhotoGallery.vue';

const hotelId = ref('');
const hotel = computed(() => findHotel(hotelId.value));
const sheetOpen = ref(false);
const successOpen = ref(false);
const bookingRoom = ref<HotelRoomType | null>(null);
const submitting = ref(false);
const lastOrderId = ref('');
const form = ref({
  contactName: '',
  checkIn: '',
  checkOut: '',
  guestCount: '2',
  note: '',
  phone: '',
});
let dwellStarted = Date.now();

onLoad((query) => {
  hotelId.value = typeof query?.id === 'string' ? query.id : '';
  dwellStarted = Date.now();
});

onUnload(() => {
  track('hotel_detail_dwell', {
    hotelId: hotelId.value,
    ms: Date.now() - dwellStarted,
  });
});

function goBack(): void { backOrHome(); }

function openBook(room: HotelRoomType): void {
  bookingRoom.value = room;
  sheetOpen.value = true;
  successOpen.value = false;
  track('hotel_book_open', { hotelId: hotelId.value, roomTypeId: room.id });
}

function closeSheet(): void {
  if (submitting.value) return;
  sheetOpen.value = false;
}

async function submit(): Promise<void> {
  const h = hotel.value;
  const room = bookingRoom.value;
  if (!h || !room) {
    uni.showToast({ title: t('hotel.missing'), icon: 'none' });
    return;
  }
  if (!form.value.contactName.trim()) {
    uni.showToast({ title: t('hotel.needName'), icon: 'none' });
    return;
  }
  if (!form.value.checkIn || !form.value.checkOut) {
    uni.showToast({ title: t('hotel.needDates'), icon: 'none' });
    return;
  }
  if (!form.value.guestCount.trim()) {
    uni.showToast({ title: t('hotel.needGuests'), icon: 'none' });
    return;
  }
  if (!requireUserSession()) return;
  submitting.value = true;
  track('hotel_book_submit', { hotelId: h.id, roomTypeId: room.id });
  try {
    const guests = Number(form.value.guestCount) || 1;
    const phone = form.value.phone.trim() || '待补充';
    const detail = `${h.name} · ${room.name} · ${form.value.checkIn} → ${form.value.checkOut} · ${guests}人`;
    const order = await userApi.createLifestyle({
      serviceType: 'HOTEL',
      contactName: form.value.contactName.trim(),
      phone,
      detail,
      payload: {
        hotelId: h.id,
        hotelName: h.name,
        roomTypeId: room.id,
        roomTypeName: room.name,
        priceHint: room.priceHint,
        checkIn: form.value.checkIn,
        checkOut: form.value.checkOut,
        guestCount: guests,
        note: form.value.note.trim() || undefined,
      },
    });
    lastOrderId.value = order.id;
    sheetOpen.value = false;
    successOpen.value = true;
    track('hotel_book_success', { hotelId: h.id, orderId: order.id });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

function goRide(): void {
  successOpen.value = false;
  track('hotel_success_ride', { hotelId: hotelId.value, orderId: lastOrderId.value });
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
  <view v-if="hotel" class="page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ hotel.name }}</text>
      <SupportContactBtn business="HOTEL" />
    </view>

    <view class="cover" :style="hotel.coverImage ? undefined : { background: hotel.coverGradient }">
      <image
        v-if="hotel.coverImage"
        class="cover-img"
        :src="hotel.coverImage"
        mode="aspectFill"
      />
      <view class="cover-shade" />
      <view class="tags">
        <text v-for="tag in hotel.tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
      <text class="cover-name">{{ hotel.name }}</text>
      <text class="cover-loc">{{ hotel.location }}</text>
    </view>

    <view class="summary-card">
      <text class="summary">{{ hotel.summary }}</text>
    </view>

    <view class="section">
      <text class="section-title">{{ t('hotel.roomTypes') }}</text>
      <text class="section-hint">{{ t('hotel.roomTypesHint') }}</text>

      <view v-for="room in hotel.roomTypes" :key="room.id" class="room-card">
        <RoomPhotoGallery :images="room.images" :marker="room.id" />
        <view class="room-top">
          <view class="room-main">
            <text class="room-name">{{ room.name }}</text>
            <text class="room-meta">{{ room.area }} · {{ room.beds }} · {{ room.capacity }}人</text>
          </view>
          <view class="room-price">
            <text class="price-num">¥{{ room.priceHint }}</text>
            <text class="price-unit">{{ t('hotel.fromPrice') }}</text>
          </view>
        </view>
        <text class="room-summary">{{ room.summary }}</text>
        <view class="room-tags">
          <text v-for="tag in room.tags" :key="tag" class="rtag">{{ tag }}</text>
        </view>
        <view class="room-feats">
          <text v-for="feat in room.features" :key="feat" class="feat">{{ feat }}</text>
        </view>
        <view class="book-btn" @tap.stop="openBook(room)">{{ t('hotel.bookNow') }}</view>
      </view>
    </view>

    <!-- 预定弹层 -->
    <view v-if="sheetOpen" class="mask" @tap="closeSheet">
      <view class="sheet" @tap.stop>
        <view class="sheet-handle" />
        <text class="sheet-title">{{ t('hotel.bookTitle') }}</text>
        <text v-if="bookingRoom" class="sheet-room">
          {{ bookingRoom.name }} · ¥{{ bookingRoom.priceHint }}{{ t('hotel.fromPrice') }}
        </text>

        <view class="row">
          <text class="label">{{ t('hotel.contactName') }}</text>
          <input v-model.trim="form.contactName" class="input" :placeholder="t('hotel.contactNamePh')" />
        </view>
        <view class="row dual">
          <view class="half">
            <text class="label">{{ t('hotel.checkIn') }}</text>
            <input v-model="form.checkIn" class="input" type="date" />
          </view>
          <view class="half">
            <text class="label">{{ t('hotel.checkOut') }}</text>
            <input v-model="form.checkOut" class="input" type="date" />
          </view>
        </view>
        <view class="row">
          <text class="label">{{ t('hotel.guests') }}</text>
          <input v-model="form.guestCount" class="input" type="number" :placeholder="t('hotel.guestsPh')" />
        </view>
        <view class="row">
          <text class="label">{{ t('hotel.phone') }}</text>
          <input v-model.trim="form.phone" class="input" type="number" :placeholder="t('hotel.phonePh')" />
        </view>
        <view class="row">
          <text class="label">{{ t('hotel.note') }}</text>
          <textarea v-model="form.note" class="textarea" :placeholder="t('hotel.notePh')" />
        </view>

        <view class="submit" :class="{ disabled: submitting }" @tap="submit">
          {{ submitting ? t('hotel.submitting') : t('hotel.submit') }}
        </view>
      </view>
    </view>

    <!-- 提交成功：一键约车 -->
    <view v-if="successOpen" class="mask success-mask" @tap="closeSuccess">
      <view class="success-card" @tap.stop>
        <text class="success-emoji">✓</text>
        <text class="success-title">{{ t('hotel.submitted') }}</text>
        <text class="success-desc">{{ t('hotel.successHint') }}</text>
        <view class="success-ride" @tap="goRide">{{ t('hotel.bookRide') }}</view>
        <view class="success-order" @tap="goOrder">{{ t('hotel.viewOrder') }}</view>
        <text class="success-close" @tap="closeSuccess">{{ t('hotel.close') }}</text>
      </view>
    </view>
  </view>

  <view v-else class="page missing">
    <text>{{ t('hotel.missing') }}</text>
    <text class="link" @tap="goBack">{{ t('hotel.backList') }}</text>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 48rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 16rpx; background: var(--km-surface, #fff); }
.back { width: 60rpx; font-size: 44rpx; }
.topbar-title { font-size: 30rpx; font-weight: 700; }
.cover {
  position: relative;
  min-height: 360rpx;
  padding: 36rpx 28rpx;
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #1f2937;
}
.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.cover-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.12) 0%, rgba(15, 23, 42, 0.62) 100%);
  pointer-events: none;
}
.tags { position: relative; z-index: 2; display: flex; flex-wrap: wrap; gap: 10rpx; }
.tag { padding: 6rpx 14rpx; border-radius: 999rpx; background: rgba(255,255,255,0.22); font-size: 20rpx; }
.cover-name { position: relative; z-index: 2; display: block; margin-top: 24rpx; font-size: 48rpx; font-weight: 800; text-shadow: 0 2rpx 12rpx rgba(0,0,0,0.4); }
.cover-loc { position: relative; z-index: 2; display: block; margin-top: 8rpx; opacity: 0.95; font-size: 22rpx; }
.summary-card {
  margin: 20rpx 28rpx; padding: 24rpx; border-radius: 20rpx;
  background: var(--km-surface, #fff); border: 1rpx solid var(--km-border);
}
.summary { font-size: 26rpx; line-height: 1.6; color: var(--km-text-secondary); }
.section { margin: 8rpx 28rpx 0; }
.section-title { display: block; font-size: 30rpx; font-weight: 800; color: var(--km-text); }
.section-hint { display: block; margin: 8rpx 0 16rpx; font-size: 22rpx; color: var(--km-text-muted); }
.room-card {
  margin-bottom: 16rpx; padding: 18rpx; border-radius: 18rpx;
  background: var(--km-surface, #fff); border: 1rpx solid var(--km-border);
}
.room-top { display: flex; justify-content: space-between; gap: 16rpx; margin-top: 16rpx; }
.room-name { display: block; font-size: 30rpx; font-weight: 800; color: var(--km-text); }
.room-meta { display: block; margin-top: 8rpx; font-size: 22rpx; color: var(--km-text-muted); }
.room-price { text-align: right; flex-shrink: 0; }
.price-num { display: block; font-size: 32rpx; font-weight: 800; color: var(--km-primary, #2563eb); }
.price-unit { display: block; font-size: 18rpx; color: var(--km-text-muted); }
.room-summary { display: block; margin-top: 12rpx; font-size: 24rpx; color: var(--km-text-secondary); line-height: 1.5; }
.room-tags, .room-feats { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 12rpx; }
.rtag {
  padding: 6rpx 12rpx; border-radius: 999rpx;
  background: color-mix(in srgb, #2563eb 12%, transparent); color: #1d4ed8; font-size: 20rpx; font-weight: 600;
}
.feat {
  padding: 6rpx 12rpx; border-radius: 999rpx; background: var(--km-surface-sunken);
  font-size: 20rpx; color: var(--km-text-secondary);
}
.book-btn {
  margin-top: 18rpx; height: 76rpx; line-height: 76rpx; text-align: center; border-radius: 14rpx;
  background: var(--km-primary, #2563eb); color: #fff; font-size: 28rpx; font-weight: 700;
}

.mask {
  position: fixed; inset: 0; z-index: 80;
  background: var(--km-overlay, rgba(17, 24, 39, 0.42));
  display: flex; align-items: flex-end; justify-content: center;
  padding-left: var(--window-left, 0px); padding-right: var(--window-right, 0px);
}
.sheet {
  width: 100%; max-width: 480px; max-height: 86vh; overflow-y: auto;
  background: var(--km-surface, #fff); border-radius: 28rpx 28rpx 0 0;
  padding: 16rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.sheet-handle {
  width: 64rpx; height: 8rpx; border-radius: 8rpx; margin: 4rpx auto 18rpx;
  background: var(--km-border-strong, #d1d5db);
}
.sheet-title { display: block; font-size: 32rpx; font-weight: 800; color: var(--km-text); }
.sheet-room {
  display: block; margin: 10rpx 0 20rpx; font-size: 24rpx; font-weight: 650;
  color: var(--km-primary, #2563eb);
}
.row { margin-bottom: 18rpx; }
.row.dual { display: flex; gap: 16rpx; }
.half { flex: 1; min-width: 0; }
.label { display: block; font-size: 24rpx; font-weight: 650; margin-bottom: 10rpx; color: var(--km-text); }
.input, .textarea {
  width: 100%; box-sizing: border-box; background: var(--km-surface-sunken); border-radius: 12rpx;
  padding: 0 18rpx; font-size: 26rpx; color: var(--km-text);
}
.input { height: 76rpx; }
.textarea { height: 140rpx; padding: 16rpx 18rpx; }
.submit {
  margin-top: 8rpx; height: 88rpx; line-height: 88rpx; text-align: center; border-radius: 16rpx;
  background: var(--km-primary, #2563eb); color: #fff; font-size: 28rpx; font-weight: 700;
}
.submit.disabled { opacity: 0.6; }

.success-mask { align-items: center; padding: 40rpx; }
.success-card {
  width: 100%; max-width: 420px; border-radius: 28rpx; padding: 40rpx 32rpx 28rpx;
  background: var(--km-surface, #fff); text-align: center;
  box-shadow: var(--km-shadow-floating);
}
.success-emoji {
  display: inline-flex; width: 72rpx; height: 72rpx; border-radius: 50%;
  align-items: center; justify-content: center; margin-bottom: 16rpx;
  background: #ecfdf5; color: #059669; font-size: 36rpx; font-weight: 800; line-height: 72rpx;
}
.success-title { display: block; font-size: 34rpx; font-weight: 800; color: var(--km-text); }
.success-desc { display: block; margin: 12rpx 0 28rpx; font-size: 24rpx; color: var(--km-text-muted); line-height: 1.5; }
.success-ride {
  height: 84rpx; line-height: 84rpx; border-radius: 16rpx;
  background: var(--km-primary, #2563eb); color: #fff; font-size: 28rpx; font-weight: 700;
}
.success-order {
  margin-top: 14rpx; height: 76rpx; line-height: 76rpx; border-radius: 16rpx;
  border: 1rpx solid var(--km-border); color: var(--km-text); font-size: 26rpx; font-weight: 600;
}
.success-close { display: block; margin-top: 18rpx; font-size: 24rpx; color: var(--km-text-muted); }

.missing { padding: 120rpx 40rpx; text-align: center; color: var(--km-text-secondary); }
.link { display: block; margin-top: 24rpx; color: var(--km-primary, #2563eb); }
</style>
