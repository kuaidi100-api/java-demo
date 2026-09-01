<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { requireUserSession } from '../../stores/auth';
import { backOrHome } from '../../utils/navigation';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import SupportContactBtn from '../../components/support/SupportContactBtn.vue';
import type { SupportBusiness } from '../../data/support';

const title = ref('服务预约');
const desc = ref('');
const submitting = ref(false);
const form = ref({ name: '', phone: '', detail: '' });

const serviceMap: Record<string, { title: string; desc: string }> = {
  ticket: { title: '票务预定', desc: '机票、火车票、汽车票、景点门票一站式预定' },
  hotel: { title: '酒店预定', desc: '精选本地及周边优质酒店，优惠价格预订' },
  moving: { title: '上门搬家', desc: '专业搬家团队，家具拆装、打包搬运一条龙' },
  photo: { title: '旅拍写真', desc: '专业摄影师跟拍，记录美好旅行瞬间' },
  ride: { title: '一键叫车', desc: '即时用车，安全便捷，直达目的地' },
};

const serviceTypeMap: Record<string, string> = {
  ticket: 'TICKET', hotel: 'HOTEL', moving: 'MOVING', photo: 'PHOTO', ride: 'RIDE',
};
const currentType = ref('ticket');

const supportBiz = computed<SupportBusiness | null>(() => {
  if (currentType.value === 'ride') return 'RIDE';
  if (currentType.value === 'hotel') return 'HOTEL';
  return null;
});

onLoad((params) => {
  const type = (params?.type as string) || 'ticket';
  if (type === 'ticket') {
    uni.redirectTo({ url: '/pages/ticket/index' });
    return;
  }
  if (type === 'moving') {
    uni.redirectTo({ url: '/pages/moving/index' });
    return;
  }
  if (type === 'ride') {
    uni.redirectTo({ url: '/pages/ride/index' });
    return;
  }
  if (type === 'hotel') {
    uni.redirectTo({ url: '/pages/hotel/list' });
    return;
  }
  if (type === 'photo') {
    uni.redirectTo({ url: '/pages/photo/index' });
    return;
  }
  currentType.value = type;
  const cfg = serviceMap[type] || serviceMap.ticket;
  title.value = cfg.title;
  desc.value = cfg.desc;
});

function goBack(): void { backOrHome(); }
async function submit(): Promise<void> {
  if (!form.value.name.trim()) { uni.showToast({ title: '请输入姓名', icon: 'none' }); return; }
  if (!form.value.phone.trim()) { uni.showToast({ title: '请输入手机号', icon: 'none' }); return; }
  if (!requireUserSession()) return;
  submitting.value = true;
  try {
    const order = await userApi.createLifestyle({
      serviceType: serviceTypeMap[currentType.value] || 'TICKET',
      contactName: form.value.name.trim(),
      phone: form.value.phone.trim(),
      detail: form.value.detail.trim() || title.value,
    });
    uni.showToast({ title: '预约已提交', icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <view class="page service-page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ title }}</text>
      <text class="topbar-placeholder" />
    </view>
    <view class="hero">
      <text class="hero-title">{{ title }}</text>
      <text class="hero-desc">{{ desc }}</text>
    </view>
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input v-model.trim="form.name" class="form-input" placeholder="请输入您的姓名" placeholder-class="ph" />
      </view>
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input v-model.trim="form.phone" class="form-input" type="number" placeholder="请输入手机号" placeholder-class="ph" />
      </view>
      <view class="form-item">
        <text class="form-label">需求说明</text>
        <textarea v-model="form.detail" class="form-textarea" placeholder="请描述您的具体需求" placeholder-class="ph" />
      </view>
    </view>
    <view class="submit-btn" :class="{ disabled: submitting }" @tap="submit">
      {{ submitting ? '提交中…' : '立即预约' }}
    </view>
    <view v-if="supportBiz" class="cs-wrap">
      <SupportContactBtn :business="supportBiz" />
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 40rpx; overflow-x: hidden; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 20rpx; background: var(--km-surface); }
.back { font-size: 44rpx; color: var(--km-text); width: 60rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.topbar-placeholder { width: 60rpx; }
.hero { margin: 24rpx 28rpx; padding: 32rpx 28rpx; background: linear-gradient(145deg, #e8f4fd, #c5e3f7); border-radius: 20rpx; box-shadow: 0 6rpx 22rpx rgba(33,150,243,.14); }
.hero-title { display: block; font-size: 34rpx; font-weight: 600; color: var(--km-text); }
.hero-desc { display: block; font-size: 24rpx; color: var(--km-text-secondary); margin-top: 10rpx; }
.form-card { margin: 0 28rpx 28rpx; background: var(--km-surface); border-radius: 20rpx; padding: 8rpx 28rpx; box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.05); }
.form-item { padding: 24rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.form-item:last-child { border-bottom: none; }
.form-label { display: block; font-size: 26rpx; color: var(--km-text); font-weight: 600; margin-bottom: 14rpx; }
.form-input { width: 100%; height: 72rpx; font-size: 26rpx; color: var(--km-text); background: var(--km-surface-sunken); border-radius: 12rpx; padding: 0 20rpx; box-sizing: border-box; }
.form-textarea { width: 100%; height: 160rpx; font-size: 26rpx; color: var(--km-text); background: var(--km-surface-sunken); border-radius: 12rpx; padding: 16rpx 20rpx; box-sizing: border-box; }
.ph { color: #aaa; }
.submit-btn { margin: 0 28rpx; height: 88rpx; line-height: 88rpx; text-align: center; background: var(--km-primary); color: #fff; font-size: 28rpx; font-weight: 600; border-radius: 16rpx; }
.submit-btn.disabled { opacity: 0.6; }
.cs-wrap { margin: 24rpx 28rpx 48rpx; display: flex; justify-content: center; }
</style>
