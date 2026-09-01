import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { bindLocaleStorage } from '@express-platform/ui-components/i18n';
import './styles.css';

bindLocaleStorage(
  (code) => localStorage.setItem('km.locale', code),
  localStorage.getItem('km.locale') ?? '',
);

createApp(App).use(router).mount('#app');
