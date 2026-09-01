<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { syncDocumentTheme } from '@express-platform/ui-components/theme';
import { initAppLocale, initAppTheme } from './i18n';
import { mountSupportHost } from './components/support/mount';

onLaunch(() => {
  initAppLocale();
  initAppTheme();
  if (import.meta.env.VITE_PROVIDER_MODE !== 'mock') console.warn('客户端未处于默认 Mock Provider 模式');
  // H5 global phoenix CS fab + sheet
  mountSupportHost();
});

// uni-app recreates page shells on navigate — restamp theme after paint
onShow(() => {
  requestAnimationFrame(() => syncDocumentTheme());
});
</script>

<style>
@import '@express-platform/ui-components/tokens.css';
@import '@express-platform/ui-components/shell.css';
</style>
