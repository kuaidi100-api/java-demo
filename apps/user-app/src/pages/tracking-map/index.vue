<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppTabBar from '../../components/AppTabBar.vue';
import { useUserTabs } from '../../composables/useUserTabs';
import { mapProvider, type MapTrackingPoint } from '../../services/map';
import { backOrHome } from '../../utils/navigation';
import { t } from '../../i18n';

const query = ref('');
const loading = ref(false);
const searched = ref(false);
const points = ref<MapTrackingPoint[]>([]);
const message = ref('输入运单号后可查询物流状态。地图服务将在配置供应商后显示真实位置。');
const bottomTabs = useUserTabs();

onLoad((params) => {
  if (params?.no) query.value = String(params.no);
});

async function search(): Promise<void> {
  const no = query.value.trim();
  if (!no) {
    uni.showToast({ title: '请输入运单号', icon: 'none' });
    return;
  }
  searched.value = true;
  points.value = [];
  if (!mapProvider.configured) {
    message.value = `已记录运单号 ${no}。当前未配置地图供应商，不展示虚构位置或路线。`;
    return;
  }
  loading.value = true;
  try {
    points.value = await mapProvider.trackingPoints(no);
    message.value = points.value.length ? '已获取真实轨迹点。' : '暂未获取到可展示的轨迹点。';
  } catch (cause) {
    message.value = cause instanceof Error ? cause.message : '轨迹查询失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

function selectTab(key: string): void {
  if (key === 'tracking') return;
  if (key === 'home') uni.reLaunch({ url: '/pages/home/index' });
  else if (key === 'flash') uni.navigateTo({ url: '/pages/flash/index' });
  else if (key === 'orders') uni.navigateTo({ url: '/pages/orders/index' });
  else if (key === 'profile') uni.navigateTo({ url: '/pages/profile/index' });
}

function open3d(): void {
  uni.navigateTo({ url: '/pages/delivery-3d/index' });
}
</script>

<template>
  <view class="page tracking-page km-page-flow">
    <view class="topbar">
      <button class="back" aria-label="返回" @tap="backOrHome">‹</button>
      <view>
        <text class="page-title">{{ t('tab.tracking') }}</text>
        <text class="page-subtitle">物流状态与真实地图轨迹</text>
      </view>
    </view>

    <view class="search-card card">
      <text class="field-label">运单号</text>
      <view class="search-row">
        <input
          v-model.trim="query"
          class="field-input"
          placeholder="请输入完整运单号"
          placeholder-class="field-ph"
          @confirm="search"
        />
        <button class="search-button" :loading="loading" @tap="search">查询</button>
      </view>
    </view>

    <view class="map-card card">
      <view class="map-head">
        <view>
          <text class="map-title">地图轨迹</text>
          <text class="provider">供应商：{{ mapProvider.name }}</text>
        </view>
        <text class="status" :class="{ ready: mapProvider.configured }">
          {{ mapProvider.configured ? '已连接' : '待配置' }}
        </text>
      </view>
      <view class="map-placeholder">
        <text class="map-symbol">⌖</text>
        <text class="map-copy">{{ message }}</text>
        <text class="map-note">预留接口：地址解析、逆地址解析、路线规划、轨迹点、服务范围判断</text>
        <view class="d3d-btn" @tap="open3d">{{ t('d3d.open') }}</view>
      </view>
    </view>

    <view v-if="searched" class="result-card card">
      <text class="result-title">查询结果</text>
      <view class="result-row"><text>运单号</text><strong>{{ query.trim() }}</strong></view>
      <view class="result-row"><text>轨迹点</text><strong>{{ points.length }}</strong></view>
      <text class="privacy-note">为保护收寄件隐私，接入真实物流接口时应校验手机号后四位。</text>
    </view>

    <AppTabBar active="tracking" :items="bottomTabs" @select="selectTab" />
  </view>
</template>

<style scoped>
.tracking-page {
  background: var(--km-bg);
  padding: 0 28rpx;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 70rpx 0 20rpx;
}
.back {
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--km-border, var(--km-divider));
  border-radius: 13px;
  background: var(--km-surface, #fff);
  color: var(--km-text, var(--km-text));
  font-size: 30px;
  line-height: 36px;
}
.back::after { border: 0; }
.page-title,
.page-subtitle { display: block; }
.page-title { font-size: 32rpx; font-weight: 700; color: var(--km-text, var(--km-text)); }
.page-subtitle { margin-top: 3px; color: var(--km-text-muted, #777); font-size: 22rpx; }
.search-card,
.map-card,
.result-card {
  padding: 18px;
  margin-bottom: 16px;
  background: var(--km-surface, #fff);
  border-radius: 16px;
  border: 1rpx solid var(--km-border, var(--km-border));
}
.search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 82px;
  gap: 10px;
}
.field-label {
  display: block;
  margin-bottom: 10px;
  font-size: 24rpx;
  color: var(--km-text-muted, var(--km-text-secondary));
}
.field-input {
  min-width: 0;
  height: 48px;
  padding: 0 14px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1rpx solid var(--km-border);
  background: var(--km-surface-sunken);
  color: var(--km-text);
  font-size: 28rpx;
}
.field-ph { color: var(--km-text-muted); }
.search-button {
  height: 48px;
  margin: 0;
  border: 0;
  border-radius: 12px;
  background: var(--km-primary, #2563eb);
  color: var(--km-text-on-primary);
  font-size: 15px;
  font-weight: 700;
}
.search-button::after { border: 0; }
.map-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.map-title,
.provider { display: block; }
.map-title,
.result-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--km-text);
}
.provider {
  margin-top: 4px;
  color: var(--km-text-secondary);
  font-size: 12px;
}
.status {
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--km-primary-soft);
  color: var(--km-primary);
  font-size: 12px;
  font-weight: 700;
}
.status.ready {
  background: var(--km-success-soft);
  color: var(--km-success);
}
.map-placeholder {
  display: flex;
  min-height: 230px;
  margin-top: 16px;
  padding: 30px 22px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed color-mix(in srgb, var(--km-primary) 35%, transparent);
  border-radius: 16px;
  background: linear-gradient(
    145deg,
    var(--km-primary-soft) 0%,
    var(--km-surface-sunken) 55%,
    var(--km-bg-soft) 100%
  );
  text-align: center;
}
.map-symbol { font-size: 42px; color: var(--km-primary); }
.map-copy {
  max-width: 320px;
  margin-top: 12px;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.6;
  color: var(--km-text);
}
.map-note {
  max-width: 330px;
  margin-top: 10px;
  color: var(--km-text-secondary);
  font-size: 12px;
  line-height: 1.55;
}
.d3d-btn {
  margin-top: 16px;
  display: inline-flex;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--km-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.result-row strong { color: var(--km-text); font-weight: 700; }
.result-title { display: block; margin-bottom: 10px; }
.result-row {
  display: flex;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid var(--km-divider, var(--km-divider));
  font-size: 14px;
}
.result-row text { color: var(--km-text-muted, var(--km-text-secondary)); }
.privacy-note {
  display: block;
  margin-top: 14px;
  color: var(--km-text-muted, var(--km-text-secondary));
  font-size: 12px;
  line-height: 1.6;
}
</style>
