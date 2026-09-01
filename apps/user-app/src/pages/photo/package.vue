<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { findPhotoPackage } from '../../data/photo';
import { requireUserSession } from '../../stores/auth';
import { backOrHome } from '../../utils/navigation';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { track } from '../../utils/analytics';
import { t } from '../../i18n';

const packageId = ref('');
const pkg = computed(() => findPhotoPackage(packageId.value));
const submitting = ref(false);
const form = ref({
  shootDate: '',
  scene: 'outdoor',
  contactName: '',
  phone: '',
  note: '',
});

onLoad((query) => {
  packageId.value = typeof query?.id === 'string' ? query.id : 'basic';
});

function goBack(): void { backOrHome(); }

async function submit(): Promise<void> {
  const p = pkg.value;
  if (!p) {
    uni.showToast({ title: t('photo.missingPkg'), icon: 'none' });
    return;
  }
  if (!form.value.contactName.trim() || !form.value.phone.trim()) {
    uni.showToast({ title: t('hotel.needContact'), icon: 'none' });
    return;
  }
  if (!form.value.shootDate) {
    uni.showToast({ title: t('photo.needDate'), icon: 'none' });
    return;
  }
  if (!requireUserSession()) return;
  submitting.value = true;
  track('photo_book_submit', { packageId: p.id, scene: form.value.scene });
  try {
    const sceneLabel = form.value.scene === 'studio' ? t('photo.sceneStudio') : t('photo.sceneOutdoor');
    const detail = `${p.name} · ${form.value.shootDate} · ${sceneLabel}`;
    const order = await userApi.createLifestyle({
      serviceType: 'PHOTO',
      contactName: form.value.contactName.trim(),
      phone: form.value.phone.trim(),
      detail,
      payload: {
        packageId: p.id,
        packageName: p.name,
        shootDate: form.value.shootDate,
        scene: form.value.scene,
        note: form.value.note.trim() || undefined,
      },
    });
    uni.showToast({ title: t('photo.submitted'), icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <view v-if="pkg" class="page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ pkg.name }}</text>
      <text class="ph" />
    </view>
    <view class="hero">
      <text class="hero-title">{{ pkg.name }}</text>
      <text class="hero-summary">{{ pkg.summary }}</text>
      <view class="facts">
        <view><text class="n">{{ pkg.outfits }}</text><text class="l">{{ t('photo.outfits') }}</text></view>
        <view><text class="n">{{ pkg.retouched }}</text><text class="l">{{ t('photo.retouched') }}</text></view>
        <view><text class="n">{{ pkg.hours }}h</text><text class="l">{{ t('photo.hours') }}</text></view>
      </view>
    </view>
    <view class="form-card">
      <text class="form-title">{{ t('photo.bookTitle') }}</text>
      <view class="row">
        <text class="label">{{ t('photo.shootDate') }}</text>
        <input v-model="form.shootDate" class="input" type="date" />
      </view>
      <view class="row">
        <text class="label">{{ t('photo.scene') }}</text>
        <view class="scene-row">
          <text
            class="scene"
            :class="{ active: form.scene === 'outdoor' }"
            @tap="form.scene = 'outdoor'"
          >{{ t('photo.sceneOutdoor') }}</text>
          <text
            class="scene"
            :class="{ active: form.scene === 'studio' }"
            @tap="form.scene = 'studio'"
          >{{ t('photo.sceneStudio') }}</text>
        </view>
      </view>
      <view class="row">
        <text class="label">{{ t('hotel.contactName') }}</text>
        <input v-model.trim="form.contactName" class="input" :placeholder="t('hotel.contactNamePh')" />
      </view>
      <view class="row">
        <text class="label">{{ t('hotel.phone') }}</text>
        <input v-model.trim="form.phone" class="input" type="number" :placeholder="t('hotel.phonePh')" />
      </view>
      <view class="row">
        <text class="label">{{ t('hotel.note') }}</text>
        <textarea v-model="form.note" class="textarea" :placeholder="t('photo.notePh')" />
      </view>
      <view class="submit" :class="{ disabled: submitting }" @tap="submit">
        {{ submitting ? t('photo.submitting') : t('photo.submit') }}
      </view>
    </view>
  </view>
  <view v-else class="page missing">
    <text>{{ t('photo.missingPkg') }}</text>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 48rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 16rpx; background: var(--km-surface, #fff); }
.back { width: 60rpx; font-size: 44rpx; }
.topbar-title { font-size: 30rpx; font-weight: 700; }
.ph { width: 60rpx; }
.hero {
  margin: 16rpx 28rpx; padding: 32rpx 28rpx; border-radius: 24rpx; color: #fff;
  background: linear-gradient(145deg, #2a1f3d, #6b4f8a);
}
.hero-title { display: block; font-size: 40rpx; font-weight: 800; }
.hero-summary { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.55; opacity: 0.92; }
.facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; margin-top: 28rpx; }
.facts > view { text-align: center; padding: 16rpx 8rpx; border-radius: 14rpx; background: rgba(255,255,255,0.12); }
.n { display: block; font-size: 32rpx; font-weight: 800; }
.l { display: block; margin-top: 6rpx; font-size: 20rpx; opacity: 0.85; }
.form-card {
  margin: 0 28rpx; padding: 24rpx; border-radius: 20rpx;
  background: var(--km-surface, #fff); border: 1rpx solid var(--km-border, var(--km-border));
}
.form-title { display: block; font-size: 30rpx; font-weight: 800; margin-bottom: 16rpx; }
.row { margin-bottom: 18rpx; }
.label { display: block; font-size: 24rpx; font-weight: 650; margin-bottom: 10rpx; }
.input, .textarea {
  width: 100%; box-sizing: border-box; background: var(--km-surface-sunken); border-radius: 12rpx;
  padding: 0 18rpx; font-size: 26rpx;
}
.input { height: 76rpx; }
.textarea { height: 140rpx; padding: 16rpx 18rpx; }
.scene-row { display: flex; gap: 12rpx; }
.scene {
  flex: 1; text-align: center; padding: 18rpx 0; border-radius: 12rpx;
  background: var(--km-surface-sunken); font-size: 24rpx; color: var(--km-text-secondary);
}
.scene.active { background: #2a1f3d; color: #fff; font-weight: 700; }
.submit {
  margin-top: 8rpx; height: 88rpx; line-height: 88rpx; text-align: center; border-radius: 16rpx;
  background: var(--km-primary, #2563eb); color: #fff; font-size: 28rpx; font-weight: 700;
}
.submit.disabled { opacity: 0.6; }
.missing { padding: 120rpx 40rpx; text-align: center; color: var(--km-text-secondary); }
</style>
