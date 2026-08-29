<script setup lang="ts">
import { adminAuth } from '../stores/auth';
const futureItems = ['用户管理', '配送员管理', '价格规则', '服务区域', '异常订单', '客服售后', '角色权限', '操作日志'];
</script>
<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="side-brand"><span>木</span><div><strong>木棉速达</strong><small>运营中心</small></div></div>
      <nav><RouterLink to="/overview"><i>览</i>数据概览</RouterLink><RouterLink to="/orders"><i>单</i>订单调度</RouterLink></nav>
      <div class="nav-section">后续功能</div><div v-for="item in futureItems" :key="item" class="future-item"><i>·</i>{{ item }}<small>下一批</small></div>
      <div class="side-footer"><div class="avatar">{{ adminAuth.state.subject?.displayName?.slice(0,1) ?? '管' }}</div><div><strong>{{ adminAuth.state.subject?.displayName ?? '管理员' }}</strong><small>{{ adminAuth.state.subject?.roles.join(' · ') }}</small></div><button @click="adminAuth.logout">退出</button></div>
    </aside>
    <section class="workspace"><header><div><strong>万象运营中心</strong><small>本地服务区域 · 数据实时读取 API</small></div><span class="mock-pill">● 模拟环境</span></header><main><RouterView /></main></section>
  </div>
</template>
<style scoped>
.admin-shell { display: grid; grid-template-columns: 246px 1fr; min-height: 100vh; }.sidebar { position: fixed; inset: 0 auto 0 0; display: flex; flex-direction: column; width: 246px; padding: 26px 18px 18px; color: #e9e2db; background: #27231f; }.side-brand { display: flex; align-items: center; gap: 13px; padding: 0 10px 24px; }.side-brand>span { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 14px 14px 14px 5px; background: #ed672f; font-weight: 900; }.side-brand strong,.side-brand small,.side-footer strong,.side-footer small { display: block; }.side-brand small { margin-top: 3px; color: #978d84; font-size: 10px; }.sidebar nav { display: grid; gap: 6px; }.sidebar nav a { display: flex; align-items: center; gap: 12px; padding: 12px 13px; color: #bdb4ab; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 700; }.sidebar nav a.router-link-active { color: #fff; background: #3a342e; box-shadow: inset 3px 0 #ed672f; }.sidebar i { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 8px; background: rgba(255,255,255,.06); font-style: normal; font-size: 11px; }.nav-section { margin: 26px 12px 10px; color: #746b63; font-size: 10px; letter-spacing: 2px; }.future-item { display: flex; align-items: center; gap: 10px; padding: 8px 13px; color: #776e66; font-size: 12px; }.future-item small { margin-left: auto; font-size: 9px; }.side-footer { display: grid; grid-template-columns: 38px 1fr auto; align-items: center; gap: 10px; margin-top: auto; padding: 16px 10px 4px; border-top: 1px solid #3b3530; }.avatar { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; color: #fff; background: #c65327; font-weight: 900; }.side-footer strong { font-size: 12px; }.side-footer small { margin-top: 3px; color: #80776f; font-size: 9px; }.side-footer button { padding: 4px; color: #9d938a; border: 0; background: transparent; font-size: 10px; }.workspace { grid-column: 2; }.workspace>header { display: flex; align-items: center; justify-content: space-between; height: 76px; padding: 0 34px; border-bottom: 1px solid #e5ddd5; background: rgba(255,253,250,.9); }.workspace>header strong,.workspace>header small { display: block; }.workspace>header strong { font-size: 14px; }.workspace>header small { margin-top: 5px; color: #8c8279; font-size: 11px; }.workspace main { padding: 32px 36px 60px; }
</style>
