<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { initAppLocale } from './i18n';
onLaunch(() => {
  initAppLocale();
});
</script>
<style>
@import '@express-platform/ui-components/tokens.css';
@import '@express-platform/ui-components/shell.css';
.page { padding: 24rpx 28rpx calc(40rpx + env(safe-area-inset-bottom)); }
.topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28rpx; }
.topbar-title { font-size: 32rpx; font-weight: 600; color: #111827; }
.mock-pill { display: inline-flex; padding: 7rpx 13rpx; border-radius: 8rpx; color: #1d4ed8; background: #eff6ff; font-size: 18rpx; font-weight: 500; }
</style>
