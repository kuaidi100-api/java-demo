<script setup lang="ts">
defineProps<{ title:string; subtitle:string; backLabel?:string }>();
defineEmits<{ back:[] }>();
</script>
<template><header class="admin-page-header"><div><button v-if="backLabel" class="back-link" @click="$emit('back')">← {{backLabel}}</button><h1>{{title}}</h1><p>{{subtitle}}</p></div><div class="header-actions"><slot name="actions"/></div></header></template>
<style scoped>.admin-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:22px}.admin-page-header h1{margin:0;font-size:26px;line-height:1.25}.admin-page-header p{margin:7px 0 0;color:var(--km-text-muted);font-size:13px}.back-link{margin:0 0 10px;padding:0;color:var(--km-primary-strong);border:0;background:transparent;font-size:11px;font-weight:800}.header-actions{display:flex;align-items:center;gap:10px}</style>
