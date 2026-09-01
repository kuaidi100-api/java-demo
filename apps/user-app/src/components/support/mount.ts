import { createApp } from 'vue';
import SupportHost from './SupportHost.vue';

let mounted = false;

export function mountSupportHost(): void {
  if (typeof document === 'undefined' || mounted) return;
  const existing = document.getElementById('km-support-host');
  if (existing) {
    mounted = true;
    return;
  }
  const el = document.createElement('div');
  el.id = 'km-support-host';
  document.body.appendChild(el);
  createApp(SupportHost).mount(el);
  mounted = true;
}
