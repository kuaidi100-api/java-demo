<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { adminApi } from '../services/api';
import { errorMessage } from '../utils';

const rows = ref<Array<{ batchDate: string; type: string; amount: number | string; platformCut: number | string; riderCut: number | string; note?: string }>>([]);
const error = ref('');
onMounted(() => { void load(); });
async function load(): Promise<void> {
  try { rows.value = await adminApi.finance() as typeof rows.value; } catch (cause: unknown) { error.value = errorMessage(cause); }
}
async function run(slot: 'Morning' | 'Evening'): Promise<void> {
  try { await adminApi.runFinance(slot); await load(); } catch (cause: unknown) { error.value = errorMessage(cause); }
}
</script>
<template>
  <div>
    <h1 class="page-title">财务对账</h1>
    <p class="page-subtitle">早 6 点 / 晚 18 点按 5:5 生成骑手应交平台现金与平台应付线上分成。此处为线下记账，不走支付网关。</p>
    <div class="head-actions">
      <button class="secondary" @click="run('Morning')">生成早班批次</button>
      <button class="secondary" @click="run('Evening')">生成晚班批次</button>
    </div>
    <p v-if="error">{{ error }}</p>
    <table class="data-table">
      <thead><tr><th>批次</th><th>类型</th><th>金额</th><th>平台</th><th>骑手</th><th>备注</th></tr></thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td>{{ row.batchDate }}</td>
          <td>{{ row.type }}</td>
          <td>{{ row.amount }}</td>
          <td>{{ row.platformCut }}</td>
          <td>{{ row.riderCut }}</td>
          <td>{{ row.note }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
.head-actions{display:flex;gap:10px;margin:16px 0}
.secondary{padding:8px 14px;border-radius:8px}
</style>
