<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PrincipalType } from '@express-platform/shared-types';
import { locale, localeOptions, setLocale, t, type Locale } from '@express-platform/ui-components/i18n';
import { adminAuth } from '../stores/auth';
import { errorMessage } from '../utils';

const router = useRouter(); const route = useRoute();
const form = reactive({ identifier: '', password: '' }); const error = ref('');
function onLang(event: Event): void {
  setLocale((event.target as HTMLSelectElement).value as Locale);
}
async function submit(): Promise<void> {
  error.value = '';
  if (!form.identifier.trim() || form.password.length < 8) { error.value = t('admin.needCreds'); return; }
  try {
    await adminAuth.login({ subjectType: PrincipalType.ADMINISTRATOR, identifier: form.identifier.trim(), password: form.password });
    await router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : '/overview');
  } catch (cause: unknown) { error.value = errorMessage(cause); }
}
</script>

<template>
  <main class="login-shell">
    <section class="visual-side">
      <div class="brand"><span class="brand-mark">木</span><div><strong>{{ t('admin.brand') }}</strong><small>EXPRESS OPERATIONS</small></div></div>
      <div class="visual-copy"><span>SMART DISPATCH</span><h1>{{ t('admin.visualTitle') }}</h1><p>{{ t('admin.visualBody') }}</p></div>
      <div class="route-art"><i class="dot one"></i><i class="dot two"></i><i class="dot three"></i><div class="route-line"></div></div>
    </section>
    <section class="form-side">
      <div class="login-card panel">
        <div class="login-head"><div><span class="eyebrow">ADMIN CONSOLE</span><h2>{{ t('admin.login') }}</h2></div>
          <select class="lang-select" :value="locale" @change="onLang">
            <option v-for="item in localeOptions" :key="item.code" :value="item.code">{{ item.native }}</option>
          </select>
        </div>
        <label>{{ t('admin.account') }}<input v-model="form.identifier" autocomplete="username" :placeholder="t('admin.accountPh')" /></label>
        <label>{{ t('login.password') }}<input v-model="form.password" type="password" autocomplete="current-password" :placeholder="t('login.pwdPh')" @keyup.enter="submit" /></label>
        <div v-if="error" class="form-error">{{ error }}</div>
        <button class="primary submit" :disabled="adminAuth.state.submitting" @click="submit">{{ adminAuth.state.submitting ? t('admin.submitting') : t('admin.submit') }}</button>
        <p class="security-note">{{ t('admin.security') }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-shell { display: grid; grid-template-columns: 1.08fr .92fr; min-height: 100vh; background: #f4f5f7; }
.visual-side { position: relative; overflow: hidden; padding: 52px 64px; color: #111827; background: linear-gradient(180deg, #d7e9f8 0%, #eaf2f8 55%, #f4f5f7 100%); }
.brand { display: flex; align-items: center; gap: 16px; }
.brand-mark { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; background: #111827; color: #fff; font-size: 18px; font-weight: 600; }
.brand strong, .brand small { display: block; }
.brand strong { font-size: 18px; font-weight: 600; }
.brand small { margin-top: 4px; color: #6b7280; font-size: 10px; letter-spacing: 0.14em; }
.visual-copy { position: relative; z-index: 2; margin-top: 22vh; max-width: 560px; }
.visual-copy > span { color: #6b7280; font-size: 12px; letter-spacing: 0.18em; font-weight: 500; }
.visual-copy h1 { margin: 22px 0; font-size: 48px; font-weight: 600; line-height: 1.18; letter-spacing: -1.5px; white-space: pre-line; }
.visual-copy p { max-width: 460px; color: #6b7280; font-size: 16px; line-height: 1.8; }
.route-art { display: none; }
.form-side { display: grid; place-items: center; padding: 50px; }
.login-card { width: min(440px, 100%); padding: 42px; }
.login-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 34px; }
.eyebrow { color: #6b7280; font-size: 10px; letter-spacing: 0.16em; font-weight: 500; }
.login-head h2 { margin: 8px 0 0; font-size: 28px; font-weight: 600; letter-spacing: -0.03em; }
.login-card label { display: block; margin-top: 20px; color: #6b7280; font-size: 13px; font-weight: 500; }
.login-card input { display: block; width: 100%; height: 48px; margin-top: 9px; padding: 0 15px; border: 1px solid rgba(17,24,39,.08); border-radius: 10px; outline: 0; background: #f8f9fb; }
.login-card input:focus { border-color: #2563eb; background: #fff; }
.form-error { margin-top: 18px; padding: 12px 14px; border-radius: 10px; color: #b91c1c; background: #fef2f2; font-size: 13px; }
.submit { width: 100%; height: 48px; margin-top: 24px; }
.security-note { margin: 18px 0 0; color: #9ca3af; text-align: center; font-size: 11px; line-height: 1.6; }
.lang-select { height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid rgba(17,24,39,.08); background: #fff; font-size: 12px; }
</style>
