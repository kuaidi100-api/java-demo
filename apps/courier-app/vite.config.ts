import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', 'VITE_');
  const apiBase = env.VITE_API_BASE_URL || 'https://kapokstar.com/api/v1';
  return {
    base: '/courier/',
    envDir: '../../',
    plugins: [uni()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBase),
    },
    server: {
      host: '127.0.0.1',
      port: Number(env.VITE_COURIER_APP_PORT ?? 5174),
      strictPort: true,
    },
  };
});
