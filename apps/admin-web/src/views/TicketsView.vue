<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { adminApi } from '../services/api';
import { errorMessage } from '../utils';

const rows = ref<Array<{ ticketNo: string; subject: string; status: string; issueType: string; penaltyAmount: number | string }>>([]);
const error = ref('');
onMounted(() => { void load(); });
async function load(): Promise<void> {
  try { rows.value = await adminApi.tickets() as typeof rows.value; } catch (cause: unknown) { error.value = errorMessage(cause); }
}
</script>
<template>
  <div>
    <h1 class="page-title">客服工单</h1>
    <p class="page-subtitle">处理货损、态度、乱收费投诉；判定骑手责任后可扣押金。</p>
    <p v-if="error">{{ error }}</p>
    <table class="data-table">
      <thead><tr><th>工单号</th><th>类型</th><th>主题</th><th>状态</th><th>罚金</th></tr></thead>
      <tbody>
        <tr v-for="row in rows" :key="row.ticketNo">
          <td>{{ row.ticketNo }}</td>
          <td>{{ row.issueType }}</td>
          <td>{{ row.subject }}</td>
          <td>{{ row.status }}</td>
          <td>{{ row.penaltyAmount }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
