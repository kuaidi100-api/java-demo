<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app';
import { OrderAction, OrderStatus, type OrderDetail } from '@express-platform/shared-types';
import LogisticsTimeline from '@express-platform/ui-components/mobile/LogisticsTimeline.vue';
import TrackProgress from '@express-platform/ui-components/mobile/TrackProgress.vue';
import { requireUserSession } from '../../stores/auth';
import { userApi } from '../../services/api';
import { errorMessage, formatTime, money, serviceTypeLabel, statusLabel } from '../../utils/presentation';
import { track } from '../../utils/analytics';
import { locale, t } from '../../i18n';
import { openSupportChat } from '../../data/support';

type ComplaintType = 'DAMAGE' | 'ATTITUDE' | 'OVERCHARGE' | 'OTHER';

const orderId = ref('');
const order = ref<OrderDetail | null>(null);
const loading = ref(true);
const refreshing = ref(false);
const acting = ref(false);
const error = ref('');
const complaintOpen = ref(false);
const complaintSubmitting = ref(false);
const complaint = reactive({
  issueType: 'OTHER' as ComplaintType,
  subject: '',
  description: '',
});
const complaintErr = reactive({ subject: '', description: '' });
const proofUrls = ref<string[]>([]);
const uploadingProof = ref(false);
let poller: ReturnType<typeof setInterval> | null = null;

const complaintTypes: ComplaintType[] = ['DAMAGE', 'ATTITUDE', 'OVERCHARGE', 'OTHER'];

const sender = computed(() => order.value?.addresses.find((address) => address.type === 'SENDER'));
const recipient = computed(() => order.value?.addresses.find((address) => address.type === 'RECIPIENT'));
const canComplete = computed(() => order.value?.status === OrderStatus.DELIVERED);
const isPurchase = computed(() => order.value?.serviceType === 'PURCHASE');
const isLifestyle = computed(() =>
  ['HOTEL', 'TICKET', 'MOVING', 'PHOTO', 'RIDE'].includes(order.value?.serviceType ?? ''),
);
const purchaseDetail = computed(() => order.value?.purchaseDetail ?? null);
const canConfirmPurchase = computed(
  () =>
    isPurchase.value
    && order.value?.status === OrderStatus.PENDING_DISPATCH
    && purchaseDetail.value?.quoteAmount != null
    && !purchaseDetail.value?.confirmedAt,
);
const purchaseWaitingQuote = computed(
  () => isPurchase.value && order.value?.status === OrderStatus.PENDING_CONFIRMATION,
);

const progressStage = computed(() => {
  const status = order.value?.status;
  if (!status) return 0;
  if (status === OrderStatus.COMPLETED || status === OrderStatus.DELIVERED) return 3;
  if (status === OrderStatus.IN_TRANSIT) return 2;
  if (status === OrderStatus.PICKED_UP || status === OrderStatus.PICKING_UP) return 1;
  return 0;
});

const timelineItems = computed(() => {
  const events = [...(order.value?.shipment?.trackingEvents ?? [])].reverse();
  return events.map((event, index) => ({
    id: event.id,
    title: statusLabel(event.status),
    description: event.description,
    time: formatTime(event.occurredAt),
    active: index === 0,
  }));
});

onLoad((query) => {
  orderId.value = typeof query?.id === 'string' ? query.id : '';
});
onShow(() => {
  if (!requireUserSession()) return;
  void load(false);
  startPolling();
});
onHide(stopPolling);
onUnload(stopPolling);

function startPolling(): void {
  stopPolling();
  poller = setInterval(() => void load(true), 10_000);
}
function stopPolling(): void {
  if (poller) clearInterval(poller);
  poller = null;
}

async function load(silent: boolean): Promise<void> {
  if (!orderId.value) {
    error.value = t('detail.missingId');
    loading.value = false;
    return;
  }
  if (silent) refreshing.value = true;
  else loading.value = true;
  if (!silent) error.value = '';
  try {
    order.value = await userApi.order(orderId.value);
  } catch (cause: unknown) {
    if (!silent) error.value = errorMessage(cause);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function payFreight(): Promise<void> {
  if (!order.value || acting.value) return;
  acting.value = true;
  try {
    await userApi.payFreight(order.value.id);
    await load(false);
    uni.showToast({ title: t('detail.payOk'), icon: 'success' });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2400 });
  } finally {
    acting.value = false;
  }
}

async function completeOrder(): Promise<void> {
  if (!order.value || acting.value) return;
  acting.value = true;
  try {
    order.value = await userApi.act(order.value.id, { action: OrderAction.COMPLETE, reason: 'user_complete' });
    uni.showToast({ title: t('detail.completeOk'), icon: 'success' });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2400 });
  } finally {
    acting.value = false;
  }
}

async function confirmPurchase(accept: boolean): Promise<void> {
  if (!order.value || acting.value) return;
  acting.value = true;
  track('purchase_confirm_click', { accept, orderId: order.value.id });
  try {
    await userApi.confirmPurchase(order.value.id, accept);
    await load(false);
    uni.showToast({
      title: accept ? t('purchase.confirmOk') : t('purchase.rejectOk'),
      icon: 'success',
    });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2400 });
  } finally {
    acting.value = false;
  }
}

function openComplaint(): void {
  complaint.subject = '';
  complaint.description = '';
  complaint.issueType = 'OTHER';
  complaintErr.subject = '';
  complaintErr.description = '';
  proofUrls.value = [];
  complaintOpen.value = true;
}

async function pickProof(): Promise<void> {
  if (proofUrls.value.length >= 6 || uploadingProof.value) return;
  uni.chooseImage({
    count: Math.min(3, 6 - proofUrls.value.length),
    sizeType: ['compressed'],
    success: async (res) => {
      uploadingProof.value = true;
      try {
        for (const path of res.tempFilePaths) {
          const uploaded = await userApi.uploadProof(path);
          const url = uploaded.url || uploaded.publicUrl;
          if (url) proofUrls.value = [...proofUrls.value, url];
        }
      } catch (cause: unknown) {
        uni.showToast({ title: errorMessage(cause), icon: 'none' });
      } finally {
        uploadingProof.value = false;
      }
    },
  });
}

async function submitComplaint(): Promise<void> {
  if (!order.value || complaintSubmitting.value) return;
  complaintErr.subject = complaint.subject.trim() ? '' : t('complaint.needSubject');
  complaintErr.description = complaint.description.trim() ? '' : t('complaint.needDesc');
  if (complaintErr.subject || complaintErr.description) return;
  complaintSubmitting.value = true;
  try {
    const ticket = await userApi.createComplaint(order.value.id, {
      issueType: complaint.issueType,
      subject: complaint.subject.trim(),
      description: complaint.description.trim(),
      proofUrls: proofUrls.value,
    });
    complaintOpen.value = false;
    uni.showToast({ title: t('complaint.ok'), icon: 'success' });
    uni.showModal({
      title: t('complaint.ok'),
      content: t('complaint.ticketNo', { no: ticket.ticketNo }),
      showCancel: true,
      confirmText: t('ticket.progress'),
      success: (r) => {
        if (r.confirm) uni.navigateTo({ url: '/pages/tickets/index' });
      },
    });
  } catch (cause: unknown) {
    uni.showToast({ title: errorMessage(cause), icon: 'none', duration: 2400 });
  } finally {
    complaintSubmitting.value = false;
  }
}

function openSupportWithOrder(): void {
  if (!order.value) return;
  openSupportChat('EXPRESS', 'ai', {
    orderId: order.value.id,
    orderNo: order.value.orderNo,
    orderStatus: order.value.status,
  });
}

function goBack(): void {
  uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/home/index' }) });
}
</script>

<template>
  <view class="page detail-page" :key="locale">
    <view class="topbar">
      <text class="back" @tap="goBack">←</text>
      <text class="topbar-title">{{ t('detail.title') }}</text>
      <text class="topbar-placeholder" />
    </view>
    <view v-if="loading" class="state-panel card">
      <text class="state-title">{{ t('detail.loading') }}</text>
      <text>{{ t('detail.loadingHint') }}</text>
    </view>
    <view v-else-if="error" class="state-panel error-panel">
      <text class="state-title">{{ t('detail.loadFail') }}</text>
      <text>{{ error }}</text>
      <button class="secondary-button retry" @tap="load(false)">{{ t('detail.retry') }}</button>
    </view>
    <template v-else-if="order">
      <view class="status-hero km-route-texture">
        <view class="status-copy-wrap">
          <text class="status-kicker">STATUS</text>
          <text class="status-title">{{ statusLabel(order.status) }}</text>
          <text class="status-copy">{{ t('detail.syncHint') }}</text>
          <text v-if="order.paymentStatus" class="pay-badge">{{
            order.paymentStatus === 'PAID' ? t('detail.paymentPaid')
              : order.paymentStatus === 'UNPAID' ? t('detail.paymentUnpaid')
                : t('detail.paymentOffline')
          }}</text>
        </view>
        <view :class="['sync-icon',{spinning:refreshing}]" @tap="load(true)">↻</view>
      </view>

      <view v-if="!isPurchase && !isLifestyle" class="progress-wrap">
        <TrackProgress :stage="progressStage" :shipment-no="order.shipment?.shipmentNo || order.orderNo" />
      </view>

      <view class="order-reference card">
        <view>
          <text class="ref-label">{{ t('detail.orderNo') }}</text>
          <text class="ref-value">{{ order.orderNo }}</text>
        </view>
        <view>
          <text class="ref-label">{{ t('detail.shipmentNo') }}</text>
          <text class="ref-value">{{ order.shipment?.shipmentNo ?? (isPurchase || isLifestyle ? t('detail.noShipmentNeeded') : t('detail.afterDispatch')) }}</text>
        </view>
      </view>

      <template v-if="isPurchase">
        <view class="section-title"><text>{{ t('purchase.quoteSection') }}</text></view>
        <view class="info-card card">
          <view class="info-row"><text>{{ t('purchase.productUrl') }}</text><text class="url-text">{{ purchaseDetail?.productUrl || '—' }}</text></view>
          <view v-if="purchaseWaitingQuote" class="info-row"><text>{{ t('purchase.waitQuote') }}</text><text>{{ t('purchase.waitQuoteHint') }}</text></view>
          <template v-else-if="purchaseDetail?.quoteAmount != null">
            <view class="info-row"><text>{{ t('purchase.goodsAmount') }}</text><text>{{ money(purchaseDetail.quoteAmount, order.currency) }}</text></view>
            <view class="info-row"><text>{{ t('purchase.serviceFee') }}</text><text>{{ money(purchaseDetail.serviceFee ?? 0, order.currency) }}</text></view>
            <view class="info-row total"><text>{{ t('purchase.total') }}</text><text>{{ money(order.estimatedFee, order.currency) }}</text></view>
            <view v-if="purchaseDetail.adminNote" class="info-row"><text>{{ t('purchase.adminNote') }}</text><text>{{ purchaseDetail.adminNote }}</text></view>
          </template>
          <view v-if="order.remark" class="info-row"><text>{{ t('purchase.remark') }}</text><text>{{ order.remark }}</text></view>
        </view>
        <view v-if="canConfirmPurchase" class="purchase-actions">
          <button class="secondary-button reject" :loading="acting" :disabled="acting" @tap="confirmPurchase(false)">{{ t('purchase.reject') }}</button>
          <button class="primary-button accept" :loading="acting" :disabled="acting" @tap="confirmPurchase(true)">{{ t('purchase.confirm') }}</button>
        </view>
      </template>

      <template v-else-if="isLifestyle">
        <view class="section-title"><text>{{ t('lifestyle.request') }}</text></view>
        <view class="info-card card">
          <view class="info-row"><text>{{ t('lifestyle.contact') }}</text><text>{{ order.serviceRequest?.contactName || '—' }}</text></view>
          <view class="info-row"><text>{{ t('lifestyle.detail') }}</text><text>{{ order.serviceRequest?.detail || order.remark || '—' }}</text></view>
          <view class="info-row total"><text>{{ t('lifestyle.statusHint') }}</text><text>{{ t('lifestyle.pendingOps') }}</text></view>
        </view>
      </template>

      <template v-else>
        <view class="section-title"><text>{{ t('detail.route') }}</text></view>
        <view class="route-card card">
          <view class="route-address">
            <view class="route-pin sender-pin">{{ t('detail.senderPin') }}</view>
            <view>
              <text class="address-main">{{ sender?.contactName }} · {{ sender?.phone }}</text>
              <text class="address-sub">{{ sender?.city }} {{ sender?.district }} {{ sender?.detail }}</text>
            </view>
          </view>
          <view class="route-stem" />
          <view class="route-address">
            <view class="route-pin recipient-pin">{{ t('detail.recipientPin') }}</view>
            <view>
              <text class="address-main">{{ recipient?.contactName }} · {{ recipient?.phone }}</text>
              <text class="address-sub">{{ recipient?.city }} {{ recipient?.district }} {{ recipient?.detail }}</text>
            </view>
          </view>
        </view>

        <view class="section-title">
          <text>{{ t('detail.timeline') }}</text>
          <text class="live-label">● {{ t('detail.liveSync') }}</text>
        </view>
        <view class="timeline card">
          <LogisticsTimeline
            :items="timelineItems"
            :empty-title="t('detail.timelineEmpty')"
            :empty-hint="t('detail.timelineEmptyHint')"
          />
        </view>

        <view class="section-title"><text>{{ t('detail.info') }}</text></view>
        <view class="info-card card">
          <view class="info-row"><text>{{ t('detail.serviceType') }}</text><text>{{ serviceTypeLabel(order.serviceType) }}</text></view>
          <view class="info-row"><text>{{ t('detail.item') }}</text><text>{{ order.items[0]?.name }} · {{ order.items[0]?.weightKg }} kg</text></view>
          <view class="info-row"><text>{{ t('detail.scheduledPickup') }}</text><text>{{ formatTime(order.scheduledPickupAt) }}</text></view>
          <view class="info-row total"><text>{{ t('detail.estimatedFee') }}</text><text>{{ money(order.estimatedFee, order.currency) }}</text></view>
        </view>
      </template>

      <view class="section-title">
        <text>{{ t('detail.statusLog') }}</text>
        <text class="log-count">{{ t('detail.logCount', { n: order.statusLogs.length }) }}</text>
      </view>
      <view class="log-card card">
        <view v-for="log in [...order.statusLogs].reverse()" :key="log.id" class="log-row">
          <text>{{ statusLabel(log.toStatus) }}</text>
          <text>{{ log.reason ?? t('detail.statusUpdate') }}</text>
          <text>{{ formatTime(log.createdAt) }}</text>
        </view>
      </view>

      <button class="secondary-button complain" @tap="openComplaint">{{ t('complaint.entry') }}</button>
      <button class="secondary-button complain" @tap="openSupportWithOrder">{{ t('support.orderCard') }}</button>
      <button class="secondary-button complain" @tap="() => uni.navigateTo({ url: '/pages/tickets/index' })">{{ t('ticket.listTitle') }}</button>
      <button
        v-if="order.serviceType==='EXPRESS' && order.status==='PENDING_DISPATCH'"
        class="primary-button complete"
        :loading="acting"
        :disabled="acting"
        @tap="payFreight"
      >{{ acting ? t('detail.paying') : t('detail.payFreight') }}</button>
      <button
        v-if="canComplete"
        class="primary-button complete"
        :loading="acting"
        :disabled="acting"
        @tap="completeOrder"
      >{{ acting ? t('detail.completing') : t('detail.complete') }}</button>
    </template>

    <view v-if="complaintOpen" class="mask" @tap="complaintOpen = false">
      <view class="dialog" @tap.stop>
        <text class="dialog-title">{{ t('complaint.title') }}</text>
        <text class="lbl">{{ t('complaint.type') }}</text>
        <view class="type-row">
          <text
            v-for="ty in complaintTypes"
            :key="ty"
            class="type-chip"
            :class="{ on: complaint.issueType === ty }"
            @tap="complaint.issueType = ty"
          >{{ t(('complaint.type.' + ty) as 'complaint.type.DAMAGE') }}</text>
        </view>
        <text class="lbl">{{ t('complaint.subject') }}</text>
        <input v-model="complaint.subject" class="input" :placeholder="t('complaint.subjectPh')" />
        <text v-if="complaintErr.subject" class="field-error">{{ complaintErr.subject }}</text>
        <text class="lbl">{{ t('complaint.desc') }}</text>
        <textarea v-model="complaint.description" class="textarea" :placeholder="t('complaint.descPh')" />
        <text v-if="complaintErr.description" class="field-error">{{ complaintErr.description }}</text>
        <text class="lbl">{{ t('complaint.proof') }}</text>
        <text class="proof-hint">{{ t('complaint.proofHint') }}</text>
        <view class="proof-row">
          <image v-for="(url, idx) in proofUrls" :key="url" class="proof-img" :src="url" mode="aspectFill" @tap="proofUrls.splice(idx, 1)" />
          <view v-if="proofUrls.length < 6" class="proof-add" @tap="pickProof">{{ uploadingProof ? '…' : t('complaint.proofAdd') }}</view>
        </view>
        <view class="dialog-go" :class="{ disabled: complaintSubmitting }" @tap="submitComplaint">
          {{ complaintSubmitting ? t('complaint.submitting') : t('complaint.submit') }}
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.detail-page { min-height: 100vh; background: var(--km-bg); padding: 0 28rpx 40rpx; color: var(--km-text); }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 70rpx 0 20rpx; }
.topbar-title { font-size: 32rpx; font-weight: 700; color: var(--km-text); }
.topbar-placeholder { width: 52rpx; }
.back { width: 52rpx; font-size: 36rpx; font-weight: 800; color: var(--km-text); }
.status-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10rpx 0 22rpx;
  padding: 38rpx 34rpx;
  border-radius: 24rpx;
  color: var(--km-text);
  background: var(--km-hero);
  border: 1rpx solid var(--km-border);
}
.status-copy-wrap { position: relative; z-index: 1; min-width: 0; }
.status-kicker,.status-title,.status-copy,.ref-label,.ref-value,.address-main,.address-sub { display: block; }
.status-kicker { color: var(--km-primary); font-size: 18rpx; letter-spacing: 2rpx; font-weight: 600; }
.status-title { margin-top: 12rpx; font-size: 44rpx; font-weight: 700; letter-spacing: -0.03em; }
.status-copy { margin-top: 10rpx; color: var(--km-text-muted); font-size: 20rpx; line-height: 1.45; }
.pay-badge {
  display: inline-block; margin-top: 12rpx; padding: 6rpx 14rpx; border-radius: 999rpx;
  font-size: 20rpx; color: var(--km-primary);
  background: color-mix(in srgb, var(--km-primary) 12%, var(--km-surface));
}
.sync-icon {
  position: relative; z-index: 1; display: grid; place-items: center;
  width: 72rpx; height: 72rpx; border-radius: 50%;
  background: var(--km-surface); color: var(--km-primary); font-size: 38rpx;
  border: 1rpx solid var(--km-border); flex-shrink: 0;
}
.spinning { opacity: .55; }
.progress-wrap { margin-bottom: 20rpx; }
.order-reference { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; padding: 26rpx; }
.order-reference>view+view { padding-left: 22rpx; border-left: 1px solid var(--km-divider); }
.ref-label { color: var(--km-text-muted); font-size: 20rpx; }
.ref-value { margin-top: 8rpx; font-size: 21rpx; font-weight: 700; word-break: break-all; color: var(--km-text); }
.route-card { padding: 28rpx; }
.route-address { display: flex; gap: 20rpx; }
.route-pin {
  flex: none; display: grid; place-items: center; width: 52rpx; height: 52rpx;
  border-radius: 16rpx; color: var(--km-text-inverse); font-size: 21rpx; font-weight: 800;
}
.sender-pin { background: var(--km-success); }
.recipient-pin { background: var(--km-primary); }
.route-stem { width: 2px; height: 34rpx; margin: 4rpx 0 4rpx 25rpx; background: var(--km-primary-glow); }
.address-main { font-size: 25rpx; font-weight: 700; color: var(--km-text); }
.address-sub { margin-top: 8rpx; color: var(--km-text-secondary); font-size: 21rpx; line-height: 1.5; }
.live-label { color: var(--km-success); font-size: 20rpx; }
.timeline { padding: 28rpx; }
.info-card { padding: 12rpx 28rpx; }
.info-row { display: flex; justify-content: space-between; gap: 24rpx; padding: 22rpx 0; border-bottom: 1px solid var(--km-divider); color: var(--km-text-muted); font-size: 22rpx; }
.info-row text:last-child { color: var(--km-text); text-align: right; font-weight: 700; }
.info-row.total { border: 0; }
.info-row.total text:last-child { color: var(--km-primary); font-size: 27rpx; font-weight: 800; }
.log-count { color: var(--km-text-muted); font-size: 20rpx; }
.log-card { padding: 12rpx 26rpx; }
.log-row { display: grid; grid-template-columns: 120rpx 1fr; gap: 8rpx 14rpx; padding: 20rpx 0; border-bottom: 1px solid var(--km-divider); font-size: 21rpx; color: var(--km-text); }
.log-row text:first-child { font-weight: 800; }
.log-row text:nth-child(2) { color: var(--km-text-secondary); }
.log-row text:last-child { grid-column: 2; color: var(--km-text-muted); font-size: 18rpx; }
.complete, .complain { margin-top: 20rpx; }
.complain { background: var(--km-surface); color: var(--km-text); border: 1rpx solid var(--km-border); }
.retry { width: 240rpx; margin-top: 22rpx; }
.url-text { max-width: 420rpx; word-break: break-all; font-size: 20rpx !important; font-weight: 600 !important; }
.purchase-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.purchase-actions .reject, .purchase-actions .accept { flex: 1; }
.purchase-actions .reject { background: var(--km-surface); color: var(--km-danger); border: 1rpx solid var(--km-border); }
.purchase-actions .accept { border: 0; color: var(--km-text-inverse); background: var(--km-primary); }
.mask {
  position: fixed; inset: 0; z-index: 40; background: color-mix(in srgb, var(--km-text) 45%, transparent);
  display: flex; align-items: flex-end; justify-content: center;
}
.dialog {
  width: 100%; background: var(--km-surface); border-radius: 28rpx 28rpx 0 0;
  padding: 32rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
}
.dialog-title { display: block; font-size: 32rpx; font-weight: 800; margin-bottom: 18rpx; color: var(--km-text); }
.lbl { display: block; font-size: 22rpx; color: var(--km-text-secondary); margin: 12rpx 0 8rpx; }
.type-row { display: flex; flex-wrap: wrap; gap: 10rpx; margin-bottom: 8rpx; }
.type-chip {
  padding: 10rpx 18rpx; border-radius: 999rpx; font-size: 22rpx;
  color: var(--km-text-secondary); background: var(--km-bg); border: 1rpx solid var(--km-border);
}
.type-chip.on { color: var(--km-primary); border-color: var(--km-primary); background: color-mix(in srgb, var(--km-primary) 12%, var(--km-surface)); }
.input, .textarea {
  width: 100%; box-sizing: border-box; padding: 16rpx 18rpx; border-radius: 14rpx;
  background: var(--km-bg); font-size: 26rpx; color: var(--km-text); border: 1rpx solid var(--km-border);
}
.textarea { min-height: 160rpx; }
.field-error { display: block; margin-top: 8rpx; font-size: 20rpx; color: var(--km-danger); }
.dialog-go {
  margin-top: 20rpx; text-align: center; padding: 24rpx; border-radius: 18rpx;
  background: var(--km-primary); color: var(--km-text-inverse); font-weight: 800;
}
.dialog-go.disabled { opacity: .55; }
.proof-hint { display: block; font-size: 20rpx; color: var(--km-text-muted); margin-bottom: 10rpx; }
.proof-row { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 12rpx; }
.proof-img { width: 140rpx; height: 140rpx; border-radius: 12rpx; background: var(--km-bg); }
.proof-add {
  width: 140rpx; height: 140rpx; border-radius: 12rpx; border: 1rpx dashed var(--km-border);
  display: flex; align-items: center; justify-content: center; font-size: 20rpx; color: var(--km-primary); text-align: center; padding: 8rpx;
}
</style>
