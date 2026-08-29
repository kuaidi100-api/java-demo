import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', 'VITE_');
  return {
    envDir: '../../',
    plugins: [vue()],
    server: { host: '127.0.0.1', port: Number(env.VITE_ADMIN_WEB_PORT ?? 5175), strictPort: true },
  };
});
