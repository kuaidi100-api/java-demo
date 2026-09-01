<script setup lang="ts">
defineProps<{ name: string }>();
</script>

<template>
  <svg class="km-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <template v-if="name === 'home'">
      <path d="M4 10.5 12 4l8 6.5" /><path d="M6 10.2V20h12V10.2" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="6.5" /><path d="M16.2 16.2 20 20" />
    </template>
    <template v-else-if="name === 'zap'"><path d="M13 3 5.5 13h6L11 21 18.5 11h-6L13 3z" /></template>
    <template v-else-if="name === 'package'">
      <path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3z" /><path d="M12 12 20 7.5M12 12v9M12 12 4 7.5" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="3.2" /><path d="M5.5 19.5c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5" />
    </template>
    <template v-else-if="name === 'ticket'">
      <path d="M4 8.5A2.5 2.5 0 0 0 6.5 6h11A2.5 2.5 0 0 0 20 8.5v1a2 2 0 0 1 0 4v2A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-2a2 2 0 0 1 0-4v-1z" />
      <path d="M12 7.2v9.6" stroke-dasharray="1.6 1.8" />
      <path d="M7.2 10.2h2.2M7.2 13.5h2.8" />
    </template>
    <template v-else-if="name === 'hotel'">
      <path d="M4 20V8.5l8-4.5 8 4.5V20" />
      <path d="M9.2 20v-5.2h5.6V20" />
      <path d="M8 11h1.8M14.2 11H16M8 14h1.8M14.2 14H16" />
    </template>
    <template v-else-if="name === 'moving'">
      <path d="M3 16V7h11v9" /><path d="M14 10h4.5L21 13.5V16h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" />
    </template>
    <template v-else-if="name === 'camera'">
      <path d="M4 8.5h3l1.5-2h7l1.5 2H20v10H4V8.5z" /><circle cx="12" cy="13" r="3" />
    </template>
    <template v-else-if="name === 'car'">
      <path d="M4 15.5V13l2-5h12l2 5v2.5" /><path d="M6 15.5h12" /><circle cx="7.5" cy="17.2" r="1.4" /><circle cx="16.5" cy="17.2" r="1.4" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.2" />
    </template>
    <template v-else-if="name === 'coupon'"><path d="M4 9h16v9H4V9z" /><path d="M8 9V6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V9" /></template>
    <template v-else-if="name === 'chat'"><path d="M5 18.5 6.2 15A7 7 0 1 1 12 19H7.5L5 18.5z" /></template>
    <template v-else-if="name === 'phone'"><path d="M7 4.5h3.2l1 3.4-2 1.2a11 11 0 006.2 6.2l1.2-2 3.4 1V18c0 .9-.8 1.8-1.8 1.8C9.2 19.8 4.2 14.8 4.2 7.3 4.2 6.2 5.1 4.5 7 4.5z" /></template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.5l1.6 1.6M17.6 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.5l1.6-1.6M17.6 8.1l1.6-1.6" />
    </template>
    <template v-else-if="name === 'wallet'"><path d="M4 8h16v11H4V8z" /><path d="M4 8V6.5A1.5 1.5 0 0 1 5.5 5H16" /><path d="M16 12.5h3.5V15H16z" /></template>
    <template v-else-if="name === 'truck'"><path d="M3 16V8h11v8" /><path d="M14 11h4l3 3v2h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17.2" cy="17.5" r="1.6" /></template>
    <!-- 同城跑腿：电动车 + 尾箱 -->
    <template v-else-if="name === 'courier'">
      <circle cx="6.5" cy="17.5" r="2" /><circle cx="16.5" cy="17.5" r="2" />
      <path d="M8.4 17.2h6.2" /><path d="M4.8 17.2 7 11h4.2l1.4 3.2H16" />
      <path d="M11.2 11V8.2h3.4L16 11" /><path d="M7.2 11 8.6 8.4H6.2" />
    </template>
    <!-- 代买代寄：购物袋 + 包裹角标 -->
    <template v-else-if="name === 'shopShip'">
      <path d="M7 9h10l-.9 10H7.9L7 9z" /><path d="M9.2 9V7.6a2.8 2.8 0 0 1 5.6 0V9" />
      <path d="M15.2 4.2h4.6v4.6h-4.6z" /><path d="M15.2 4.2 17.5 2.6 19.8 4.2" /><path d="M17.5 4.2v4.6" />
    </template>
    <template v-else-if="name === 'check'"><circle cx="12" cy="12" r="8" /><path d="M8.5 12.2 11 14.7l4.8-5.2" /></template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3.2 19.2 6v5.4c0 4.6-3 7.9-7.2 9.2C7.8 19.3 4.8 16 4.8 11.4V6L12 3.2z" />
      <path d="M9 12.1 11 14.2l4.2-4.4" />
    </template>
    <template v-else-if="name === 'box'"><path d="M4 8h16v11H4z" /><path d="M4 8 12 4l8 4" /><path d="M12 4v15" /></template>
    <template v-else-if="name === 'send'"><path d="M4 12h13" /><path d="M13 6l6 6-6 6" /></template>
    <template v-else-if="name === 'bag'"><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /></template>
    <template v-else-if="name === 'work'"><path d="M4 9h16v10H4z" /><path d="M9 9V7h6v2" /></template>
    <template v-else-if="name === 'list'"><path d="M8 7h12M8 12h12M8 17h12" /><path d="M4 7h.01M4 12h.01M4 17h.01" /></template>
    <template v-else-if="name === 'clock'"><circle cx="12" cy="12" r="8" /><path d="M12 8v4.5l3 2" /></template>
    <template v-else-if="name === 'scan'"><path d="M5 8V6h3M16 6h3v2M19 16v2h-3M8 18H5v-2M4 12h16" /></template>
    <template v-else-if="name === 'chevron'"><path d="M9 6l6 6-6 6" /></template>
    <template v-else-if="name === 'overview'"><path d="M4 12h4v8H4zM10 4h4v16h-4zM16 8h4v12h-4z" /></template>
    <template v-else-if="name === 'warehouse'"><path d="M3 20V10l9-6 9 6v10" /><path d="M9 20v-6h6v6" /></template>
    <template v-else-if="name === 'finance'"><path d="M4 19V9l8-5 8 5v10" /><path d="M8 19v-5h8v5" /><path d="M12 8v3" /></template>
    <template v-else-if="name === 'globe'">
      <circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.6 3.6 5.4 3.6 8.5s-1.2 5.9-3.6 8.5M12 3.5C9.6 6.1 8.4 8.9 8.4 12s1.2 5.9 3.6 8.5" />
    </template>
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="3.6" /><path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.5l1.6 1.6M17.6 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.5l1.6-1.6M17.6 8.1l1.6-1.6" />
    </template>
    <template v-else-if="name === 'moon'"><path d="M19 13.2A7.2 7.2 0 0 1 10.8 5 7.5 7.5 0 1 0 19 13.2z" /></template>
    <!-- Express waybill 1D barcode：实心不等宽竖条，一眼是条码不是扫码框 -->
    <template v-else-if="name === 'barcode'">
      <rect x="3" y="4.5" width="1.8" height="15" fill="currentColor" stroke="none" />
      <rect x="6.2" y="4.5" width="1" height="15" fill="currentColor" stroke="none" />
      <rect x="8.4" y="4.5" width="1" height="15" fill="currentColor" stroke="none" />
      <rect x="10.6" y="4.5" width="2.2" height="15" fill="currentColor" stroke="none" />
      <rect x="14" y="4.5" width="1" height="15" fill="currentColor" stroke="none" />
      <rect x="16.2" y="4.5" width="1" height="15" fill="currentColor" stroke="none" />
      <rect x="18.4" y="4.5" width="2" height="15" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>

<style scoped>
.km-ic { width: 1em; height: 1em; display: block; flex-shrink: 0; }
</style>
