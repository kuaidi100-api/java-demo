<script setup lang="ts">
import PriceDisplay from './PriceDisplay.vue';
import StatusBadge from './StatusBadge.vue';
defineProps<{ orderNo: string; status: string; service: string; time: string; fee: number|string; currency: string }>();
defineEmits<{ select: [] }>();
</script>
<template><button class="km-order-card" @tap="$emit('select')"><view class="km-order-main"><view><text class="km-order-no">{{ orderNo }}</text><text class="km-order-meta">{{ service }} · {{ time }}</text></view><StatusBadge :label="status" /></view><view class="km-order-foot"><PriceDisplay :value="fee" :currency="currency" strong/><text class="km-detail-link">查看详情 →</text></view></button></template>
<style scoped>
.km-order-card{display:block;width:100%;margin:0 0 16rpx;padding:24rpx;border:none;border-radius:20rpx;text-align:left;background:#fff;box-shadow:0 4rpx 14rpx rgba(0,0,0,.05)}.km-order-card::after{border:0}.km-order-main,.km-order-foot{display:flex;align-items:flex-start;justify-content:space-between;gap:18rpx}.km-order-no,.km-order-meta{display:block}.km-order-no{color:#111827;font-size:26rpx;font-weight:600}.km-order-meta{margin-top:8rpx;color:#999;font-size:20rpx}.km-order-foot{align-items:center;margin-top:20rpx;padding-top:18rpx;border-top:1rpx solid #f5f5f5;font-size:22rpx}.km-detail-link{color:#2196f3;font-size:20rpx;font-weight:700}
</style>
