<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { requireUserSession } from '../../stores/auth';
import { backOrHome } from '../../utils/navigation';
import { userApi } from '../../services/api';
import { errorMessage } from '../../utils/presentation';
import { track } from '../../utils/analytics';
import { openExternalUrl } from '../../utils/openExternal';
import { t, type MessageKey } from '../../i18n';
import PurchasePlatformIcon from '../../components/PurchasePlatformIcon.vue';

type Platform = {
  id: string;
  labelKey: MessageKey;
  hintKey: MessageKey;
  brand: string;
  url: string;
  scheme?: string;
};

const platforms: Platform[] = [
  { id: 'taobao', labelKey: 'purchase.platform.taobao', hintKey: 'purchase.hint.taobao', brand: 'taobao', url: 'https://m.taobao.com/', scheme: 'taobao://' },
  { id: 'tmall', labelKey: 'purchase.platform.tmall', hintKey: 'purchase.hint.taobao', brand: 'tmall', url: 'https://www.tmall.com/', scheme: 'tmall://page.tm/home' },
  { id: 'jd', labelKey: 'purchase.platform.jd', hintKey: 'purchase.hint.taobao', brand: 'jd', url: 'https://m.jd.com/', scheme: 'openapp.jdmobile://virtual' },
  { id: 'pdd', labelKey: 'purchase.platform.pdd', hintKey: 'purchase.hint.taobao', brand: 'pdd', url: 'https://mobile.yangkeduo.com/', scheme: 'pinduoduo://com.xunmeng.pinduoduo/index.html' },
  { id: '1688', labelKey: 'purchase.platform.1688', hintKey: 'purchase.hint.taobao', brand: 'alibaba', url: 'https://m.1688.com/' },
  { id: 'vip', labelKey: 'purchase.platform.vip', hintKey: 'purchase.hint.taobao', brand: 'vip', url: 'https://m.vip.com/' },
  { id: 'suning', labelKey: 'purchase.platform.suning', hintKey: 'purchase.hint.taobao', brand: 'suning', url: 'https://m.suning.com/' },
  { id: 'dewu', labelKey: 'purchase.platform.dewu', hintKey: 'purchase.hint.taobao', brand: 'dewu', url: 'https://m.dewu.com/' },
  { id: 'xhs', labelKey: 'purchase.platform.xhs', hintKey: 'purchase.hint.taobao', brand: 'xhs', url: 'https://www.xiaohongshu.com/', scheme: 'xhsdiscover://home' },
  { id: 'douyin', labelKey: 'purchase.platform.douyin', hintKey: 'purchase.hint.taobao', brand: 'douyin', url: 'https://haohuo.jinritemai.com/', scheme: 'snssdk1128://' },
  { id: 'weidian', labelKey: 'purchase.platform.weidian', hintKey: 'purchase.hint.taobao', brand: 'weidian', url: 'https://www.weidian.com/' },
  { id: 'yanxuan', labelKey: 'purchase.platform.yanxuan', hintKey: 'purchase.hint.taobao', brand: 'yanxuan', url: 'https://m.you.163.com/' },
  { id: 'amazoncn', labelKey: 'purchase.platform.amazoncn', hintKey: 'purchase.hint.taobao', brand: 'amazon', url: 'https://www.amazon.cn/' },
  { id: 'overseas', labelKey: 'purchase.platform.overseas', hintKey: 'purchase.hint.taobao', brand: 'overseas', url: 'https://www.amazon.com/' },
];

const productUrl = ref('');
const remark = ref('');
const platformHint = ref('');
const urlFocusToken = ref(0);
const submitting = ref(false);
const itemLines = ref<string[]>(['']);
const stockoutOpen = ref(false);

function goBack(): void { backOrHome(); }

function addItemLine(): void {
  if (itemLines.value.length >= 8) return;
  itemLines.value = [...itemLines.value, ''];
}

function pickPlatform(id: string): void {
  const platform = platforms.find((item) => item.id === id);
  if (!platform) return;
  platformHint.value = t(platform.hintKey);
  track('purchase_platform_click', { platform: id });
  remark.value = `${t(platform.labelKey)}`;
  urlFocusToken.value += 1;
  openExternalUrl(platform.url, platform.scheme);
  void nextTick(() => {
    uni.showToast({ title: t(platform.hintKey), icon: 'none', duration: 2400 });
  });
}

function requestSubmit(): void {
  if (!productUrl.value.trim()) {
    uni.showToast({ title: t('purchase.needUrl'), icon: 'none' });
    return;
  }
  stockoutOpen.value = true;
}

async function submit(): Promise<void> {
  stockoutOpen.value = false;
  if (!requireUserSession()) return;
  submitting.value = true;
  track('purchase_submit', { hasRemark: Boolean(remark.value.trim()) });
  try {
    const lines = itemLines.value.map((s) => s.trim()).filter(Boolean);
    const note = [platformHint.value, remark.value, lines.length ? lines.join(' / ') : '']
      .filter(Boolean)
      .join(' | ') || undefined;
    const order = await userApi.createPurchase({
      productUrl: productUrl.value.trim(),
      remark: note,
    });
    uni.showToast({ title: t('purchase.submitted'), icon: 'success' });
    uni.navigateTo({ url: `/pages/order-detail/index?id=${encodeURIComponent(order.id)}` });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <view class="page purchase-page">
    <view class="topbar">
      <text class="back" @tap="goBack">‹</text>
      <text class="topbar-title">{{ t('purchase.title') }}</text>
      <text class="topbar-placeholder" />
    </view>

    <view class="platform-panel">
      <text class="platform-hint">{{ t('purchase.hint.taobao') }}</text>
      <scroll-view scroll-x class="platform-scroll" :show-scrollbar="false">
        <view class="platform-row">
          <view
            v-for="p in platforms"
            :key="p.id"
            class="platform-item"
            role="button"
            @tap="pickPlatform(p.id)"
          >
            <PurchasePlatformIcon :brand="p.brand" />
            <text class="platform-label">{{ t(p.labelKey) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="quote-card">
      <text class="quote-kicker">{{ t('purchase.quoteKicker') }}</text>
      <text class="quote-title">{{ t('purchase.quoteTitle') }}</text>
      <input
        :key="urlFocusToken"
        v-model.trim="productUrl"
        class="quote-input"
        :placeholder="platformHint || t('purchase.urlPh')"
        placeholder-class="ph"
      />
      <text class="items-title">{{ t('purchase.items') }}</text>
      <input
        v-for="(line, idx) in itemLines"
        :key="idx"
        v-model="itemLines[idx]"
        class="quote-input"
        :placeholder="t('purchase.itemPh')"
        placeholder-class="ph"
      />
      <text class="add-line" @tap="addItemLine">{{ t('purchase.addItem') }}</text>
      <textarea
        v-model="remark"
        class="quote-textarea"
        :placeholder="t('purchase.remarkPh')"
        placeholder-class="ph"
      />
      <view class="submit-btn" :class="{ disabled: submitting }" @tap="requestSubmit">
        {{ submitting ? t('purchase.submitting') : t('purchase.submit') }}
      </view>
    </view>

    <view class="tip-card">
      <text class="tip-title">{{ t('purchase.flowTitle') }}</text>
      <text class="tip-text">{{ t('purchase.flow1') }}</text>
      <text class="tip-text">{{ t('purchase.flow2') }}</text>
      <text class="tip-text">{{ t('purchase.flow3') }}</text>
    </view>

    <view class="hot-card">
      <text class="hot-title">{{ t('purchase.hotTitle') }}</text>
      <text class="hot-desc">{{ t('purchase.hotDesc') }}</text>
    </view>

    <view v-if="stockoutOpen" class="mask" @tap="stockoutOpen = false">
      <view class="dialog" @tap.stop>
        <text class="dialog-title">{{ t('purchase.stockoutTitle') }}</text>
        <text class="dialog-body">{{ t('purchase.stockoutBody') }}</text>
        <view class="dialog-actions">
          <text class="dlg-btn ghost" @tap="stockoutOpen = false">{{ t('purchase.stockoutCancel') }}</text>
          <text class="dlg-btn" @tap="submit">{{ t('purchase.stockoutContinue') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--km-bg); padding-bottom: 48rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 28rpx 20rpx; background: var(--km-surface, #fff); }
.back { font-size: 44rpx; color: var(--km-text, var(--km-text)); width: 60rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text, var(--km-text)); }
.topbar-placeholder { width: 60rpx; }

.platform-panel {
  margin: 8rpx 0 4rpx;
  padding: 16rpx 0 8rpx;
  background: linear-gradient(180deg, color-mix(in srgb, #bae6fd 28%, var(--km-surface)) 0%, var(--km-bg) 100%);
}
.platform-hint {
  display: block;
  padding: 0 28rpx 8rpx;
  font-size: 22rpx;
  color: var(--km-text-muted);
}
.platform-scroll { white-space: nowrap; }
.platform-row { display: inline-flex; gap: 18rpx; padding: 12rpx 28rpx 20rpx; }
.platform-item { display: flex; flex-direction: column; align-items: center; gap: 10rpx; width: 112rpx; flex-shrink: 0; }
.platform-label { font-size: 22rpx; color: var(--km-text-secondary); text-align: center; }

.quote-card {
  margin: 8rpx 28rpx 24rpx; padding: 28rpx;
  border-radius: 24rpx; background: var(--km-surface, #fff);
  border: 1rpx solid var(--km-border, var(--km-border));
}
.quote-kicker { display: block; font-size: 18rpx; letter-spacing: 2rpx; color: var(--km-primary, #2563eb); font-weight: 700; }
.quote-title { display: block; margin: 10rpx 0 22rpx; font-size: 34rpx; font-weight: 800; color: var(--km-text, var(--km-text)); }
.quote-input, .quote-textarea {
  width: 100%; box-sizing: border-box; background: var(--km-surface-sunken); border-radius: 14rpx;
  padding: 0 20rpx; font-size: 26rpx; color: var(--km-text, var(--km-text)); margin-bottom: 16rpx;
}
.quote-input { height: 84rpx; }
.quote-textarea { height: 140rpx; padding: 16rpx 20rpx; }
.ph { color: #aaa; }
.submit-btn {
  margin-top: 8rpx; height: 88rpx; line-height: 88rpx; text-align: center;
  background: var(--km-primary, #2563eb); color: #fff; font-size: 28rpx; font-weight: 700; border-radius: 16rpx;
}
.submit-btn.disabled { opacity: 0.6; }
.tip-card, .hot-card {
  margin: 0 28rpx 20rpx; border-radius: 20rpx; padding: 22rpx 24rpx;
}
.tip-card { background: #e8f1fb; }
.hot-card { background: var(--km-surface, #fff); border: 1rpx dashed var(--km-border, var(--km-border)); }
.tip-title, .hot-title { display: block; font-size: 24rpx; font-weight: 800; color: #1565c0; margin-bottom: 10rpx; }
.hot-title { color: var(--km-text, var(--km-text)); }
.tip-text, .hot-desc { display: block; font-size: 22rpx; color: var(--km-text-secondary); line-height: 1.75; }
.items-title { display: block; margin: 4rpx 0 12rpx; font-size: 22rpx; color: var(--km-text-secondary); }
.add-line { display: block; margin: 0 0 16rpx; font-size: 24rpx; color: var(--km-primary); }
.mask {
  position: fixed; inset: 0; z-index: 40;
  background: color-mix(in srgb, var(--km-text) 45%, transparent);
  display: flex; align-items: center; justify-content: center; padding: 40rpx;
}
.dialog {
  width: 100%; max-width: 620rpx; background: var(--km-surface); border-radius: 20rpx;
  padding: 32rpx 28rpx; border: 1rpx solid var(--km-border);
}
.dialog-title { display: block; font-size: 30rpx; font-weight: 700; color: var(--km-text); }
.dialog-body { display: block; margin-top: 14rpx; font-size: 24rpx; color: var(--km-text-secondary); line-height: 1.6; }
.dialog-actions { display: flex; gap: 16rpx; margin-top: 28rpx; }
.dlg-btn {
  flex: 1; text-align: center; padding: 20rpx; border-radius: 14rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-weight: 600;
}
.dlg-btn.ghost { background: var(--km-bg); color: var(--km-text); border: 1rpx solid var(--km-border); }
</style>
