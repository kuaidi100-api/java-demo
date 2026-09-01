<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { OrderAction, OrderStatus, type CourierOption, type OrderActionInput, type OrderDetail } from '@express-platform/shared-types';
import AddressBlock from '../components/AddressBlock.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminStatusBadge from '../components/AdminStatusBadge.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { adminApi } from '../services/api';
import { adminAuth } from '../stores/auth';
import { errorMessage, formatTime, money, statusLabel } from '../utils';

type Operation = 'dispatch' | 'exception' | 'cancel';
const route = useRoute();
const router = useRouter();
const order = ref<OrderDetail | null>(null);
const couriers = ref<CourierOption[]>([]);
const loading = ref(true);
const error = ref('');
const operation = ref<Operation | null>(null);
const operationError = ref('');
const operating = ref(false);
const courierId = ref('');
const successMessage = ref('');
const quoteAmount = ref('');
const adminNote = ref('');
const quoting = ref(false);

const sender = computed(() => order.value?.addresses.find((address) => address.type === 'SENDER'));
const recipient = computed(() => order.value?.addresses.find((address) => address.type === 'RECIPIENT'));
const canDispatch = computed(() => adminAuth.state.subject?.permissions.includes('orders.dispatch') ?? false);
const cancellable = computed(() =>
  order.value
    ? [
        OrderStatus.DRAFT,
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.PENDING_DISPATCH,
        OrderStatus.PENDING_ACCEPTANCE,
        OrderStatus.ACCEPTED,
        OrderStatus.EXCEPTION,
      ].includes(order.value.status)
    : false,
);
const exceptionable = computed(() =>
  order.value
    ? [
        OrderStatus.PENDING_DISPATCH,
        OrderStatus.PENDING_ACCEPTANCE,
        OrderStatus.ACCEPTED,
        OrderStatus.PICKING_UP,
        OrderStatus.PICKED_UP,
        OrderStatus.IN_TRANSIT,
        OrderStatus.DELIVERED,
      ].includes(order.value.status)
    : false,
);
const operationTitle = computed(() =>
  operation.value === 'dispatch' ? '指派配送员' : operation.value === 'exception' ? '标记异常订单' : '取消订单',
);
const operationDescription = computed(() =>
  operation.value === 'dispatch'
    ? '确认后将生成模拟运单，并把订单流转为待接单。'
    : operation.value === 'exception'
      ? '异常状态会写入订单状态日志，请确认已完成线下核实。'
      : '取消后不能恢复，请确认已与用户沟通。',
);
const operationConfirmLabel = computed(() =>
  operation.value === 'dispatch' ? '确认指派' : operation.value === 'exception' ? '确认标记异常' : '确认取消订单',
);

const serviceLabel = computed(() => {
  const type = order.value?.serviceType;
  const map: Record<string, string> = {
    INTRACITY: '同城跑腿',
    SAME_CITY: '同城跑腿',
    PICKUP: '上门取件',
    EXPRESS: '标准寄件',
    PURCHASE: '代买代寄',
    HOTEL: '酒店预定',
    TICKET: '票务预定',
    MOVING: '上门搬家',
    PHOTO: '旅拍写真',
    RIDE: '一键叫车',
  };
  return type ? map[type] ?? type : '—';
});

const isPurchase = computed(() => order.value?.serviceType === 'PURCHASE');
const isRideLike = computed(() =>
  order.value?.serviceType === 'RIDE' || order.value?.serviceType === 'MOVING',
);
const rideMap = computed(() => {
  const payload = (order.value?.serviceRequest?.payload || order.value?.extra || {}) as Record<string, unknown>;
  const map = (payload.map || {}) as { from?: { label?: string; lat?: number; lng?: number }; to?: { label?: string; lat?: number; lng?: number } };
  const from = (map.from || payload.from) as { label?: string; lat?: number; lng?: number } | undefined;
  const to = (map.to || payload.to) as { label?: string; lat?: number; lng?: number } | undefined;
  return { from, to };
});
const canQuotePurchase = computed(
  () =>
    isPurchase.value
    && canDispatch.value
    && order.value?.status === OrderStatus.PENDING_CONFIRMATION
    && !order.value.purchaseDetail?.quotedAt,
);
const canAssignCourier = computed(
  () =>
    !!order.value
    && canDispatch.value
    && !isPurchase.value
    && order.value.status === OrderStatus.PENDING_DISPATCH,
);

onMounted(() => void load());

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    order.value = await adminApi.order(String(route.params.id));
    if (canDispatch.value) {
      couriers.value = await adminApi.couriers();
      courierId.value = order.value.courierId ?? couriers.value[0]?.id ?? '';
    }
  } catch (cause: unknown) {
    error.value = errorMessage(cause);
  } finally {
    loading.value = false;
  }
}

function openOperation(value: Operation): void {
  operation.value = value;
  operationError.value = '';
  successMessage.value = '';
  if (value === 'dispatch' && !courierId.value) courierId.value = couriers.value[0]?.id ?? '';
}

async function executeOperation(): Promise<void> {
  if (!order.value || !operation.value || operating.value) return;
  if (operation.value === 'dispatch' && !courierId.value) {
    operationError.value = '请选择可用配送员';
    return;
  }
  operating.value = true;
  operationError.value = '';
  try {
    const input: OrderActionInput =
      operation.value === 'dispatch'
        ? { action: OrderAction.DISPATCH, courierId: courierId.value, reason: '管理员从订单详情指派配送员' }
        : operation.value === 'exception'
          ? { action: OrderAction.REPORT_EXCEPTION, reason: '管理员在订单详情标记异常' }
          : { action: OrderAction.CANCEL, reason: '管理员在订单详情取消订单' };
    order.value = await adminApi.act(order.value.id, input);
    successMessage.value =
      operation.value === 'dispatch' ? '配送员指派成功' : operation.value === 'exception' ? '订单已标记为异常' : '订单已取消';
    operation.value = null;
  } catch (cause: unknown) {
    operationError.value = errorMessage(cause);
  } finally {
    operating.value = false;
  }
}

async function submitPurchaseQuote(): Promise<void> {
  if (!order.value || quoting.value) return;
  const amount = Number(quoteAmount.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    operationError.value = '请输入有效的商品报价金额';
    return;
  }
  quoting.value = true;
  operationError.value = '';
  try {
    await adminApi.quotePurchase(order.value.id, amount, adminNote.value.trim() || undefined);
    successMessage.value = '代买报价已提交，等待用户确认';
    quoteAmount.value = '';
    adminNote.value = '';
    await load();
  } catch (cause: unknown) {
    operationError.value = errorMessage(cause);
  } finally {
    quoting.value = false;
  }
}

function maskPhone(phone?: string): string {
  return phone ? phone.replace(/^(\+?\d{4})\d+(\d{3})$/u, '$1****$2') : '—';
}
function addressText(address: typeof sender.value): string {
  return address ? `${address.country} ${address.city} ${address.district} ${address.detail}` : '地址未填写';
}
function coordNum(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function statusTone(status: OrderStatus): 'primary' | 'success' | 'warning' | 'danger' | 'neutral' {
  if ([OrderStatus.COMPLETED, OrderStatus.DELIVERED].includes(status)) return 'success';
  if (status === OrderStatus.EXCEPTION || status === OrderStatus.CANCELLED) return 'danger';
  if ([OrderStatus.PENDING_DISPATCH, OrderStatus.PENDING_ACCEPTANCE].includes(status)) return 'warning';
  return 'primary';
}
function operatorLabel(value: string): string {
  return value === 'USER' ? '用户' : value === 'COURIER' ? '配送员' : value === 'ADMINISTRATOR' ? '管理员' : '系统';
}
function taskStatusLabel(value: string | null | undefined): string {
  const labels: Record<string, string> = {
    PENDING: '待接单',
    ACCEPTED: '已接单',
    PICKING_UP: '取件中',
    PICKED_UP: '已取件',
    IN_TRANSIT: '配送中',
    DELIVERED: '已送达',
    CANCELLED: '已取消',
    EXCEPTION: '异常',
  };
  return value ? labels[value] ?? '任务已创建' : '未生成';
}
function displayDescription(value: string): string {
  return Object.entries(statusLabel).reduce((text, [code, label]) => text.replaceAll(code, label), value);
}
</script>

<template>
  <div>
    <AdminPageHeader
      title="订单详情"
      subtitle="业务信息、状态日志与模拟物流轨迹"
      back-label="返回订单调度"
      @back="router.push('/orders')"
    >
      <template #actions>
        <span class="mock-pill">模拟环境</span>
        <button class="secondary" @click="load">刷新状态</button>
      </template>
    </AdminPageHeader>
    <div v-if="successMessage" class="success-toast">✓ {{ successMessage }}</div>
    <div v-if="loading" class="panel state"><strong>正在加载订单</strong>同步状态日志与配送信息…</div>
    <div v-else-if="error" class="panel state error">
      <strong>加载失败</strong>{{ error }}<br /><button class="secondary" @click="load">重新加载</button>
    </div>
    <template v-else-if="order">
      <section class="detail-hero">
        <div class="hero-status">
          <small>当前状态</small>
          <div>
            <h2>{{ statusLabel[order.status] }}</h2>
            <AdminStatusBadge :label="statusLabel[order.status]" :tone="statusTone(order.status)" />
          </div>
          <p>{{ order.orderNo }} · {{ order.shipment?.shipmentNo ?? (isPurchase ? '代买单' : '待生成运单') }}</p>
        </div>
        <div class="hero-facts">
          <div>
            <small>服务类型</small>
            <strong>{{ serviceLabel }}</strong>
          </div>
          <div>
            <small>预约上门</small>
            <strong>{{ formatTime(order.scheduledPickupAt) }}</strong>
          </div>
          <div>
            <small>预估费用</small>
            <strong class="price">{{ money(order.estimatedFee, order.currency) }}</strong>
          </div>
        </div>
      </section>

      <section v-if="canQuotePurchase" class="operation-panel panel quote-panel">
        <div>
          <h3>代买报价</h3>
          <p>录入商品金额后系统自动加收 5% 服务费，并通知用户确认。</p>
          <p v-if="order.purchaseDetail?.productUrl" class="product-url">{{ order.purchaseDetail.productUrl }}</p>
        </div>
        <div class="quote-form">
          <label>
            商品金额（元）
            <input v-model="quoteAmount" type="number" min="0.01" step="0.01" placeholder="例如 199.00" />
          </label>
          <label>
            备注（可选）
            <input v-model="adminNote" type="text" maxlength="500" placeholder="规格、缺货说明等" />
          </label>
          <button class="primary" :disabled="quoting" @click="submitPurchaseQuote">
            {{ quoting ? '提交中…' : '提交报价' }}
          </button>
          <p v-if="operationError" class="quote-error">{{ operationError }}</p>
        </div>
      </section>

      <section v-else-if="isPurchase && order.purchaseDetail" class="operation-panel panel">
        <div>
          <h3>代买信息</h3>
          <p class="product-url">{{ order.purchaseDetail.productUrl }}</p>
          <p v-if="order.purchaseDetail.quoteAmount != null">
            商品 {{ money(order.purchaseDetail.quoteAmount, order.currency) }} · 服务费
            {{ money(order.purchaseDetail.serviceFee ?? 0, order.currency) }}
            <span v-if="order.purchaseDetail.adminNote"> · {{ order.purchaseDetail.adminNote }}</span>
          </p>
        </div>
      </section>

      <section class="operation-panel panel">
        <div>
          <h3>订单操作</h3>
          <p>所有操作均经过后端 RBAC 与状态机校验，并写入操作日志。</p>
        </div>
        <div class="operation-actions">
          <button
            v-if="canAssignCourier"
            class="primary"
            @click="openOperation('dispatch')"
          >
            {{ isRideLike ? '指派司机/骑手' : '指派配送员' }}
          </button>
          <button v-if="exceptionable" class="secondary warning" @click="openOperation('exception')">标记异常</button>
          <button v-if="cancellable" class="secondary danger" @click="openOperation('cancel')">取消订单</button>
          <button class="secondary" @click="router.push('/orders')">返回列表</button>
          <span v-if="order.status === OrderStatus.PENDING_DISPATCH && !canDispatch" class="permission-note"
            >当前账号无调度权限</span
          >
        </div>
      </section>

      <div class="detail-grid">
        <section class="panel address-panel">
          <div class="section-heading">
            <h3>{{ isPurchase ? '备注与联系' : '寄收路线' }}</h3>
            <span>{{ isPurchase ? '用户提交信息' : '地址已脱敏展示' }}</span>
          </div>
          <template v-if="isPurchase">
            <dl class="purchase-meta">
              <dt>订单备注</dt>
              <dd>{{ order.remark || '无' }}</dd>
              <dt>报价时间</dt>
              <dd>{{ order.purchaseDetail?.quotedAt ? formatTime(order.purchaseDetail.quotedAt) : '尚未报价' }}</dd>
              <dt>确认时间</dt>
              <dd>{{ order.purchaseDetail?.confirmedAt ? formatTime(order.purchaseDetail.confirmedAt) : '尚未确认' }}</dd>
            </dl>
          </template>
          <template v-else>
            <AddressBlock
              :type="isRideLike ? '上' : '寄'"
              :name="sender?.contactName || order.serviceRequest?.contactName"
              :phone="maskPhone(sender?.phone || undefined)"
              :address="addressText(sender) !== '地址未填写' ? addressText(sender) : (rideMap.from?.label || order.remark || '地址未填写')"
              :latitude="coordNum(sender?.latitude) ?? rideMap.from?.lat ?? null"
              :longitude="coordNum(sender?.longitude) ?? rideMap.from?.lng ?? null"
              :map-label="rideMap.from?.label"
            />
            <div class="route-stem" />
            <AddressBlock
              :type="isRideLike ? '下' : '收'"
              :name="recipient?.contactName || order.serviceRequest?.contactName"
              :phone="maskPhone(recipient?.phone || undefined)"
              :address="addressText(recipient) !== '地址未填写' ? addressText(recipient) : (rideMap.to?.label || '地址未填写')"
              :latitude="coordNum(recipient?.latitude) ?? rideMap.to?.lat ?? null"
              :longitude="coordNum(recipient?.longitude) ?? rideMap.to?.lng ?? null"
              :map-label="rideMap.to?.label"
            />
            <p class="map-note">用户地图选点坐标已写入订单；指派后骑手/司机端可查看并导航。</p>
          </template>
        </section>
        <section class="panel basic-panel">
          <div class="section-heading"><h3>业务信息</h3></div>
          <dl>
            <dt>物品信息</dt>
            <dd>{{ order.items[0]?.name || (isPurchase ? '代买商品' : '—') }} · {{ order.items[0]?.weightKg ?? 0 }} kg</dd>
            <dt>配送任务</dt>
            <dd>{{ taskStatusLabel(order.task?.status) }}</dd>
            <dt>配送员</dt>
            <dd>{{ order.courierId ? '已指派' : '暂未指派' }}</dd>
            <dt>订单备注</dt>
            <dd>{{ order.remark || '无' }}</dd>
          </dl>
        </section>
      </div>
      <div class="log-grid">
        <section class="panel log-panel">
          <div class="section-heading">
            <h3>状态日志</h3>
            <span>{{ order.statusLogs.length }} 条</span>
          </div>
          <div v-for="log in [...order.statusLogs].reverse()" :key="log.id" class="log-item">
            <i /><div>
              <strong>{{ statusLabel[log.toStatus] }}</strong>
              <p>{{ displayDescription(log.reason ?? '状态更新') }}</p>
              <small>{{ operatorLabel(log.operatorType) }} · {{ formatTime(log.createdAt) }}</small>
            </div>
          </div>
        </section>
        <section class="panel log-panel">
          <div class="section-heading">
            <h3>物流轨迹</h3>
            <span>{{ order.shipment?.trackingEvents.length ?? 0 }} 条</span>
          </div>
          <div v-if="!order.shipment?.trackingEvents.length" class="mini-empty">
            {{ isPurchase ? '代买订单无需物流轨迹。' : '调度后生成模拟物流轨迹。' }}
          </div>
          <div
            v-for="event in [...(order.shipment?.trackingEvents ?? [])].reverse()"
            v-else
            :key="event.id"
            class="log-item tracking"
          >
            <i /><div>
              <strong>{{ statusLabel[event.status] }}</strong>
              <p>{{ displayDescription(event.description) }}</p>
              <small>{{ formatTime(event.occurredAt) }}</small>
            </div>
          </div>
        </section>
      </div>
    </template>
    <ConfirmDialog
      v-if="operation"
      :title="operationTitle"
      :description="operationDescription"
      :confirm-label="operationConfirmLabel"
      :busy="operating"
      :danger="operation !== 'dispatch'"
      :error="operationError"
      @cancel="operation = null"
      @confirm="executeOperation"
    >
      <label v-if="operation === 'dispatch'" class="courier-select"
        >选择配送员
        <select v-model="courierId">
          <option value="" disabled>请选择</option>
          <option v-for="courier in couriers" :key="courier.id" :value="courier.id">
            {{ courier.displayName }} · 在途 {{ courier.activeOrderCount }}
          </option>
        </select>
      </label>
    </ConfirmDialog>
  </div>
</template>

<style scoped>
.success-toast {
  position: fixed; z-index: 40; right: 28px; top: 88px; padding: 11px 16px; border-radius: 12px; color: #2e7d32;
  background: #e8f5e9; box-shadow: var(--km-shadow-floating); font-size: 12px; font-weight: 800;
}
.detail-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 28px; padding: 20px 26px;
  border-radius: 18px; color: #1a1a1a; background: linear-gradient(145deg, #e8f4fd, #c5e3f7);
}
.hero-status small, .hero-facts small { display: block; color: #666; font-size: 9px; }
.hero-status > div { display: flex; align-items: center; gap: 12px; }
.hero-status h2 { margin: 6px 0 4px; font-size: 25px; }
.hero-status p { margin: 0; color: #666; font-size: 11px; }
.hero-facts { display: grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: 24px; }
.hero-facts > div { padding-left: 22px; border-left: 1px solid #bbdefb; }
.hero-facts strong { display: block; margin-top: 7px; font-size: 12px; }
.hero-facts .price { color: #2196f3; font-size: 17px; }
.operation-panel {
  display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-top: 16px; padding: 18px 22px;
}
.operation-panel h3 { margin: 0; font-size: 14px; }
.operation-panel p { margin: 5px 0 0; color: var(--km-text-muted); font-size: 10px; }
.quote-panel { align-items: flex-start; }
.quote-form { display: grid; gap: 10px; min-width: 280px; }
.quote-form label { display: grid; gap: 6px; font-size: 11px; font-weight: 700; color: var(--km-text-muted); }
.quote-form input {
  height: 38px; padding: 0 10px; border: 1px solid var(--km-border); border-radius: 10px; background: #fff; font-size: 12px;
}
.quote-error { margin: 0; color: var(--km-danger); font-size: 11px; }
.product-url { word-break: break-all; color: #1565c0 !important; font-weight: 600; }
.purchase-meta { display: grid; grid-template-columns: 82px 1fr; gap: 12px 10px; margin: 0; font-size: 11px; }
.purchase-meta dt { color: var(--km-text-muted); }
.purchase-meta dd { margin: 0; text-align: right; font-weight: 700; }
.operation-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.operation-actions button { min-height: 36px; padding: 0 14px; font-size: 11px; }
.secondary.warning { color: #98600d; background: #fffaf0; }
.secondary.danger { color: var(--km-danger); border-color: #efcdc7; background: #fff8f6; }
.permission-note { color: var(--km-danger); font-size: 10px; }
.map-note {
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  line-height: 1.5;
}
.detail-grid, .log-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 16px; margin-top: 16px; }
.log-grid { grid-template-columns: 1fr 1fr; }
.address-panel, .basic-panel, .log-panel { padding: 21px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.section-heading h3 { margin: 0; font-size: 14px; }
.section-heading span { color: var(--km-text-muted); font-size: 9px; }
.route-stem { width: 2px; height: 24px; margin: 4px 0 4px 16px; background: #ddd3ca; }
.basic-panel dl { display: grid; grid-template-columns: 82px 1fr; gap: 14px 10px; margin: 0; font-size: 11px; }
.basic-panel dt { color: var(--km-text-muted); }
.basic-panel dd { margin: 0; text-align: right; font-weight: 700; }
.log-item { display: grid; grid-template-columns: 12px 1fr; gap: 11px; min-height: 78px; }
.log-item i {
  width: 10px; height: 10px; margin-top: 3px; border: 3px solid var(--km-primary); border-radius: 50%;
  box-shadow: 0 0 0 4px #e3f2fd;
}
.log-item strong { font-size: 11px; }
.log-item p { margin: 4px 0; color: var(--km-text-muted); font-size: 10px; }
.log-item small { color: #a0978f; font-size: 8px; }
.tracking i { border-color: var(--km-success); box-shadow: 0 0 0 4px #eaf5f0; }
.mini-empty { padding: 28px; color: var(--km-text-muted); text-align: center; font-size: 10px; }
.courier-select { display: block; margin-top: 18px; color: var(--km-text-muted); text-align: left; font-size: 11px; font-weight: 800; }
.courier-select select {
  display: block; width: 100%; height: 42px; margin-top: 8px; padding: 0 10px; border: 1px solid var(--km-border);
  border-radius: 10px; background: #fff;
}
@media (max-width: 1220px) {
  .hero-facts { gap: 12px; }
  .detail-grid { grid-template-columns: 1fr; }
  .log-grid { grid-template-columns: 1fr 1fr; }
}
</style>
