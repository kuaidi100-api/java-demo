<script setup lang="ts">
withDefaults(defineProps<{ label: string; tone?: 'primary'|'success'|'warning'|'danger'|'neutral' }>(), { tone: 'primary' });
</script>
<template><text class="km-status" :class="`tone-${tone}`">{{ label }}</text></template>
<style scoped>
.km-status{display:inline-flex;align-items:center;padding:6rpx 12rpx;border-radius:8rpx;font-size:20rpx;font-weight:500;white-space:nowrap}.tone-primary{color:#1d4ed8;background:#eff6ff}.tone-success{color:#047857;background:#ecfdf5}.tone-warning{color:#b45309;background:#fffbeb}.tone-danger{color:#b91c1c;background:#fef2f2}.tone-neutral{color:#4b5563;background:#f3f4f6}
</style>
