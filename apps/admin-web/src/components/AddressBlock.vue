<script setup lang="ts">
defineProps<{
  type: '寄' | '收' | '上' | '下';
  name?: string;
  phone?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  mapLabel?: string;
}>();

function mapsUrl(lat?: number | null, lng?: number | null): string {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
</script>

<template>
  <div class="address-block">
    <span :class="{ sender: type === '寄' || type === '上' }">{{ type }}</span>
    <div class="body">
      <strong>{{ name || '未填写' }} · {{ phone || '—' }}</strong>
      <p>{{ address || '地址信息未填写' }}</p>
      <p v-if="latitude != null && longitude != null" class="coords">
        地图坐标 {{ Number(latitude).toFixed(5) }}, {{ Number(longitude).toFixed(5) }}
        <a
          v-if="mapsUrl(latitude, longitude)"
          class="map-link"
          :href="mapsUrl(latitude, longitude)"
          target="_blank"
          rel="noopener"
        >打开地图</a>
      </p>
      <p v-else-if="mapLabel" class="coords muted">地图选点：{{ mapLabel }}（暂无坐标）</p>
      <p v-else class="coords muted">未附带地图坐标</p>
    </div>
  </div>
</template>

<style scoped>
.address-block { display: flex; gap: 12px; align-items: flex-start; }
.address-block > span {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  color: #fff;
  background: #35302b;
  font-size: 11px;
  font-weight: 900;
}
.address-block > span.sender { background: var(--km-primary); }
.address-block strong { font-size: 12px; }
.address-block p { margin: 5px 0 0; color: var(--km-text-muted); font-size: 11px; line-height: 1.55; }
.coords { color: #0369a1 !important; font-weight: 600; }
.coords.muted { color: #94a3b8 !important; font-weight: 500; }
.map-link {
  margin-left: 8px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 700;
}
.map-link:hover { text-decoration: underline; }
</style>
