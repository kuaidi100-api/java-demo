<script setup lang="ts">
import KmIcon from '@express-platform/ui-components/mobile/KmIcon.vue';
import { computed } from 'vue';
import { locale, localeOptions, setLocale, t, type Locale } from '@express-platform/ui-components/i18n';
import { adminAuth } from '../stores/auth';

const navigation = computed(() => [
  { label: t('admin.nav.overview'), icon: 'overview', to: '/overview' },
  { label: t('admin.nav.orders'), icon: 'package', to: '/orders' },
  { label: t('admin.nav.warehouse'), icon: 'warehouse', to: '/warehouse' },
  { label: t('admin.nav.finance'), icon: 'finance', to: '/finance' },
  { label: t('admin.nav.tickets'), icon: 'chat', to: '/tickets' },
  { label: t('admin.nav.couriers'), icon: 'truck' },
  { label: t('admin.nav.users'), icon: 'user' },
  { label: t('admin.nav.pricing'), icon: 'coupon' },
  { label: t('admin.nav.zones'), icon: 'pin' },
  { label: t('admin.nav.after'), icon: 'settings' },
  { label: t('admin.nav.logs'), icon: 'list' },
]);

function onLang(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as Locale;
  setLocale(value);
}
</script>
<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="side-brand">
        <span>木</span>
        <div><strong>{{ t('admin.brand') }}</strong><small>{{ t('admin.ops') }}</small></div>
      </div>
      <nav>
        <template v-for="item in navigation" :key="item.label">
          <RouterLink v-if="item.to" :to="item.to"><KmIcon :name="item.icon" class="nav-ic" /><span>{{ item.label }}</span></RouterLink>
          <div v-else class="planned-item"><KmIcon :name="item.icon" class="nav-ic" /><span>{{ item.label }}</span><small>{{ t('admin.planned') }}</small></div>
        </template>
      </nav>
      <div class="side-footer">
        <div class="avatar">{{ adminAuth.state.subject?.displayName?.slice(0, 1) ?? '管' }}</div>
        <div>
          <strong>{{ adminAuth.state.subject?.displayName ?? t('admin.login') }}</strong>
          <small>{{ adminAuth.state.subject?.roles.join(' · ') }}</small>
        </div>
        <button @click="adminAuth.logout">{{ t('admin.logout') }}</button>
      </div>
    </aside>
    <section class="workspace">
      <header>
        <div><strong>{{ t('admin.ops') }}</strong><small>{{ t('admin.headerSub') }}</small></div>
        <div class="header-tools">
          <select class="lang-select" :value="locale" @change="onLang">
            <option v-for="item in localeOptions" :key="item.code" :value="item.code">{{ item.native }}</option>
          </select>
          <span class="mock-pill">{{ t('admin.mock') }}</span>
        </div>
      </header>
      <main><RouterView /></main>
    </section>
  </div>
</template>
<style scoped>
.admin-shell { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; background: #f4f5f7; }
.sidebar { position: fixed; inset: 0 auto 0 0; display: flex; flex-direction: column; width: 232px; padding: 24px 14px 16px; color: #111827; background: #fff; border-right: 1px solid rgba(17, 24, 39, 0.06); }
.side-brand { display: flex; align-items: center; gap: 12px; padding: 0 10px 22px; }
.side-brand > span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: #111827; color: #fff; font-weight: 600; }
.side-brand strong, .side-brand small, .side-footer strong, .side-footer small { display: block; }
.side-brand small { margin-top: 3px; color: #9ca3af; font-size: 11px; letter-spacing: 0.08em; }
.sidebar nav { display: grid; gap: 2px; }
.sidebar nav a, .planned-item { display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 8px 12px; color: #6b7280; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 500; }
.sidebar nav a.router-link-active { color: #111827; background: #f3f7fb; }
.nav-ic { font-size: 16px; }
.planned-item { color: #9ca3af; }
.planned-item small { margin-left: auto; padding: 2px 6px; border-radius: 6px; background: #f3f4f6; font-size: 10px; font-weight: 400; }
.side-footer { display: grid; grid-template-columns: 36px 1fr auto; align-items: center; gap: 9px; margin-top: auto; padding: 16px 8px 4px; border-top: 1px solid rgba(17, 24, 39, 0.06); }
.avatar { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; color: #fff; background: #111827; font-weight: 600; }
.side-footer strong { font-size: 12px; }
.side-footer small { margin-top: 3px; color: #9ca3af; font-size: 10px; }
.side-footer button { padding: 4px; color: #9ca3af; border: 0; background: transparent; font-size: 12px; }
.workspace { grid-column: 2; min-width: 0; }
.workspace > header { display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 32px; border-bottom: 1px solid rgba(17, 24, 39, 0.06); background: #fff; }
.workspace > header strong, .workspace > header small { display: block; }
.workspace > header strong { font-size: 14px; font-weight: 600; }
.workspace > header small { margin-top: 4px; color: #9ca3af; font-size: 12px; }
.header-tools { display: flex; align-items: center; gap: 12px; }
.lang-select { height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid rgba(17,24,39,.08); background: #fff; font-size: 12px; }
.workspace main { width: 100%; max-width: 1540px; margin: 0 auto; padding: 28px 32px 52px; }
@media (max-width: 1200px) {
  .admin-shell { grid-template-columns: 210px 1fr; }
  .sidebar { width: 210px; }
  .workspace main { padding: 24px; }
}
</style>
