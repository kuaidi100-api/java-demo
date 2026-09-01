<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { adminApi } from '../services/api';
import { errorMessage } from '../utils';

const tracking = ref('');
const weight = ref('1');
const unclaimed = ref(false);
const message = ref('');
const loading = ref(false);
const pool = ref<Array<{ domesticTrackingNo: string; isUnclaimed: boolean; order: { orderNo: string } }>>([]);

onMounted(() => { void load(); });
async function load(): Promise<void> {
  try { pool.value = await adminApi.unclaimed() as typeof pool.value; } catch { pool.value = []; }
}
async function receive(): Promise<void> {
  if (!tracking.value.trim()) { message.value = '请输入国内单号'; return; }
  loading.value = true; message.value = '';
  try {
    await adminApi.receive({
      domesticTrackingNo: tracking.value.trim(),
      actualWeight: Number(weight.value),
      unclaimed: unclaimed.value,
    });
    message.value = '入库计费成功，已通知用户支付';
    tracking.value = '';
    await load();
  } catch (cause: unknown) {
    message.value = errorMessage(cause);
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <div>
    <h1 class="page-title">集运入库</h1>
    <p class="page-subtitle">扫码或录入国内单号，填写实重；体积重按 长×宽×高/6000，系统取较大值自动计费。</p>
    <div class="panel" style="padding:24px;max-width:560px">
      <label>国内快递单号<input v-model="tracking" placeholder="预报单号或无主件单号"></label>
      <label>实测重量 KG<input v-model="weight" type="number" step="0.01"></label>
      <label class="check"><input v-model="unclaimed" type="checkbox"> 无主件（未预报）入库</label>
      <button class="primary" :disabled="loading" @click="receive">{{ loading ? '提交中…' : '签收并计费' }}</button>
      <p v-if="message">{{ message }}</p>
    </div>
    <h2>无主件认领池</h2>
    <div class="panel" style="padding:16px">
      <p v-if="pool.length===0">当前没有无主件</p>
      <p v-for="item in pool" :key="item.domesticTrackingNo">{{ item.order.orderNo }} · {{ item.domesticTrackingNo }}</p>
    </div>
  </div>
</template>
<style scoped>
label{display:block;margin:12px 0;font-size:13px;font-weight:700}
input{display:block;width:100%;height:40px;margin-top:6px;padding:0 10px}
.check{display:flex;align-items:center;gap:8px}
.check input{width:auto;height:auto}
.primary{margin-top:12px;padding:10px 18px;border:0;border-radius:10px;color:#fff;background:#e7642e;font-weight:800}
</style>
