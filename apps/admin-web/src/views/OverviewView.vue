<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { AdminOverview, OrderSummary } from '@express-platform/shared-types';
import { adminApi } from '../services/api';
import { errorMessage, formatTime, money, statusLabel } from '../utils';

const overview = ref<AdminOverview | null>(null); const orders = ref<OrderSummary[]>([]); const loading = ref(true); const error = ref('');
onMounted(() => void load());
async function load(): Promise<void> {
  loading.value = true; error.value = '';
  try { [overview.value, orders.value] = await Promise.all([adminApi.overview(), adminApi.orders()]); }
  catch (cause: unknown) { error.value = errorMessage(cause); }
  finally { loading.value = false; }
}
</script>
<template>
  <div><div class="page-head"><div><h1 class="page-title">数据概览</h1><p class="page-subtitle">掌握订单流转、待处理工作与配送资源</p></div><button class="secondary" :disabled="loading" @click="load">{{ loading ? '同步中…' : '刷新数据' }}</button></div>
    <div v-if="loading" class="panel state"><strong>正在读取运营数据</strong>连接本地 NestJS API 与 MySQL…</div>
    <div v-else-if="error" class="panel state error"><strong>数据加载失败</strong>{{ error }}<br /><button class="secondary" @click="load">重新加载</button></div>
    <template v-else-if="overview">
      <div class="metric-grid">
        <article class="metric hero"><span>总订单</span><strong>{{ overview.totalOrders }}</strong><small>平台累计模拟订单</small></article>
        <article class="metric"><span>待调度</span><strong>{{ overview.pendingDispatch }}</strong><small>需要运营处理</small></article>
        <article class="metric"><span>配送中</span><strong>{{ overview.inProgress }}</strong><small>已接单至已送达</small></article>
        <article class="metric"><span>可用配送员</span><strong>{{ overview.activeCouriers }}</strong><small>本地虚拟账号</small></article>
      </div>
      <section class="recent panel"><div class="section-head"><div><h2>最新订单</h2><p>状态来自统一订单状态机</p></div><RouterLink to="/orders">进入调度台 →</RouterLink></div>
        <div v-if="orders.length===0" class="state"><strong>暂无订单</strong>等待用户端创建模拟寄件。</div>
        <table v-else class="recent-table"><tbody><tr v-for="order in orders.slice(0,5)" :key="order.id" @click="$router.push(`/orders/${order.id}`)"><td><strong>{{ order.orderNo }}</strong><small>{{ formatTime(order.createdAt) }}</small></td><td>{{ order.serviceType }}</td><td><span class="status">{{ statusLabel[order.status] }}</span></td><td>{{ money(order.estimatedFee,order.currency) }}</td><td>→</td></tr></tbody></table>
      </section>
    </template>
  </div>
</template>
<style scoped>
.metric-grid { display: grid; grid-template-columns: 1.35fr repeat(3,1fr); gap: 18px; }.metric { position: relative; overflow: hidden; min-height: 150px; padding: 25px; border: 1px solid #f0f0f0; border-radius: 16px; background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.05); }.metric span,.metric strong,.metric small { display: block; }.metric span { color: #666; font-size: 12px; font-weight: 700; }.metric strong { margin-top: 18px; font-size: 38px; }.metric small { margin-top: 8px; color: #999; font-size: 11px; }.metric.hero { color: #1a1a1a; border: 0; background: linear-gradient(145deg,#e8f4fd,#c5e3f7); box-shadow: 0 8px 24px rgba(33,150,243,.14); }.metric.hero::after { content:""; position:absolute; width:150px; height:150px; right:-55px; top:-50px; border:24px solid rgba(255,255,255,.35); border-radius:50%; }.metric.hero span,.metric.hero small { color: #555; }.recent { margin-top: 24px; padding: 26px; }.section-head { display:flex; align-items:center; justify-content:space-between; }.section-head h2 { margin:0; font-size:18px; }.section-head p { margin:7px 0 0; color:#888; font-size:12px; }.section-head a { color:#2196f3; text-decoration:none; font-size:12px; font-weight:800; }.recent-table { width:100%; margin-top:18px; border-collapse:collapse; }.recent-table tr { cursor:pointer; }.recent-table td { padding:16px 12px; border-top:1px solid #f0f0f0; font-size:13px; }.recent-table td:first-child { width:32%; }.recent-table strong,.recent-table small { display:block; }.recent-table small { margin-top:5px; color:#999; font-size:10px; }.recent-table td:last-child { color:#2196f3; text-align:right; font-size:18px; }
</style>
