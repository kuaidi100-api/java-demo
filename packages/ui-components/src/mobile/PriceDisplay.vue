<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ value: number|string; currency?: string; strong?: boolean }>();
const formatted = computed(() => props.currency === 'LAK' || !props.currency
  ? `₭ ${new Intl.NumberFormat('zh-CN').format(Number(props.value))}`
  : `${new Intl.NumberFormat('zh-CN').format(Number(props.value))} ${props.currency}`);
</script>
<template><text class="km-price" :class="{ strong }">{{ formatted }}</text></template>
<style scoped>.km-price{font-variant-numeric:tabular-nums;white-space:nowrap}.strong{color:#2196f3;font-weight:800}</style>
