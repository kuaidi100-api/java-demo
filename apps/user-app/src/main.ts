import { createSSRApp } from 'vue';
import App from './App.vue';
import { initAppLocale, initAppTheme } from './i18n';

initAppLocale();
initAppTheme();

export function createApp() {
  const app = createSSRApp(App);
  return { app };
}
