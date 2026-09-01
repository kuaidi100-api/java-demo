import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', 'VITE_');
  const apiBase = env.VITE_API_BASE_URL || 'https://kapokstar.com/api/v1';
  return {
    base: '/admin/',
    envDir: '../../',
    plugins: [vue()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBase),
    },
    server: { host: '127.0.0.1', port: Number(env.VITE_ADMIN_WEB_PORT ?? 5175), strictPort: true },
  };
});
