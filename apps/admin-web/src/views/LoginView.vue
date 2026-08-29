<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PrincipalType } from '@express-platform/shared-types';
import { adminAuth } from '../stores/auth';
import { errorMessage } from '../utils';

const router = useRouter(); const route = useRoute();
const form = reactive({ identifier: '', password: '' }); const error = ref('');
async function submit(): Promise<void> {
  error.value = '';
  if (!form.identifier.trim() || form.password.length < 8) { error.value = '请输入管理员账号和至少 8 位密码'; return; }
  try {
    await adminAuth.login({ subjectType: PrincipalType.ADMINISTRATOR, identifier: form.identifier.trim(), password: form.password });
    await router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : '/overview');
  } catch (cause: unknown) { error.value = errorMessage(cause); }
}
</script>

<template>
  <main class="login-shell">
    <section class="visual-side">
      <div class="brand"><span class="brand-mark">木</span><div><strong>木棉速达</strong><small>EXPRESS OPERATIONS</small></div></div>
      <div class="visual-copy"><span>SMART DISPATCH</span><h1>看见每一单，<br />调度每一步。</h1><p>订单、配送员与模拟物流轨迹，都在一个清晰的运营视图中。</p></div>
      <div class="route-art"><i class="dot one"></i><i class="dot two"></i><i class="dot three"></i><div class="route-line"></div></div>
    </section>
    <section class="form-side">
      <div class="login-card panel">
        <div class="login-head"><div><span class="eyebrow">ADMIN CONSOLE</span><h2>管理员登录</h2></div><span class="mock-pill">● 模拟环境</span></div>
        <label>管理员账号<input v-model="form.identifier" autocomplete="username" placeholder="请输入管理员用户名" /></label>
        <label>密码<input v-model="form.password" type="password" autocomplete="current-password" placeholder="请输入密码" @keyup.enter="submit" /></label>
        <div v-if="error" class="form-error">{{ error }}</div>
        <button class="primary submit" :disabled="adminAuth.state.submitting" @click="submit">{{ adminAuth.state.submitting ? '正在验证权限…' : '进入运营中心' }}</button>
        <p class="security-note">本地演示账号见 README。密码不预填，Token 不写入日志。</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-shell { display: grid; grid-template-columns: 1.08fr .92fr; min-height: 100vh; background: #f6f1eb; }.visual-side { position: relative; overflow: hidden; padding: 52px 64px; color: #fff; background: linear-gradient(145deg,#25221f,#39312b 63%,#4b392d); }.brand { display: flex; align-items: center; gap: 16px; }.brand-mark { display: grid; place-items: center; width: 50px; height: 50px; border-radius: 16px 16px 16px 5px; background: #ed672f; font-size: 22px; font-weight: 900; }.brand strong,.brand small { display: block; }.brand strong { font-size: 19px; }.brand small { margin-top: 4px; color: #bcb2a9; font-size: 9px; letter-spacing: 2px; }.visual-copy { position: relative; z-index: 2; margin-top: 20vh; max-width: 560px; }.visual-copy>span { color: #ef8a5d; font-size: 12px; letter-spacing: 4px; font-weight: 800; }.visual-copy h1 { margin: 22px 0; font-size: 56px; line-height: 1.16; letter-spacing: -2px; }.visual-copy p { max-width: 460px; color: #cfc5bc; font-size: 16px; line-height: 1.8; }.route-art { position: absolute; right: -50px; bottom: -40px; width: 500px; height: 360px; opacity: .55; }.route-line { position: absolute; left: 20px; top: 160px; width: 420px; height: 130px; border: 3px dashed #ed7542; border-color: #ed7542 transparent transparent #ed7542; border-radius: 50%; transform: rotate(-12deg); }.dot { position: absolute; z-index: 2; width: 18px; height: 18px; border: 5px solid #f6b18f; border-radius: 50%; }.one { left: 20px; top: 160px; }.two { left: 220px; top: 110px; }.three { right: 45px; top: 185px; }.form-side { display: grid; place-items: center; padding: 50px; }.login-card { width: min(440px,100%); padding: 42px; }.login-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 34px; }.eyebrow { color: #df632e; font-size: 10px; letter-spacing: 2px; font-weight: 900; }.login-head h2 { margin: 8px 0 0; font-size: 30px; }.login-card label { display: block; margin-top: 20px; color: #6e655d; font-size: 13px; font-weight: 700; }.login-card input { display: block; width: 100%; height: 48px; margin-top: 9px; padding: 0 15px; border: 1px solid #e9dfd6; border-radius: 13px; outline: 0; background: #f8f5f1; }.login-card input:focus { border-color: #ec7441; background: #fff; }.form-error { margin-top: 18px; padding: 12px 14px; border-radius: 10px; color: #a33c31; background: #fff0ed; font-size: 13px; }.submit { width: 100%; height: 50px; margin-top: 24px; }.security-note { margin: 18px 0 0; color: #999087; text-align: center; font-size: 11px; line-height: 1.6; }
</style>
