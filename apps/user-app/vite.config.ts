import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const uiComponentsSrc = path.resolve(rootDir, '../../packages/ui-components/src');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', 'VITE_');
  const apiBase = env.VITE_API_BASE_URL || 'https://kapokstar.com/api/v1';
  return {
    envDir: '../../',
    plugins: [uni()],
    resolve: {
      // Force a single source instance — node_modules junction + @fs packages
      // previously created two Vite module graphs, so new i18n keys looked "missing".
      alias: [
        {
          find: /^@express-platform\/ui-components\/mobile\/(.*)$/,
          replacement: `${uiComponentsSrc}/mobile/$1`,
        },
        {
          find: '@express-platform/ui-components/theme',
          replacement: path.resolve(uiComponentsSrc, 'theme.ts'),
        },
        {
          find: /^@express-platform\/ui-components\/(.*)$/,
          replacement: `${uiComponentsSrc}/$1`,
        },
        {
          find: '@express-platform/ui-components',
          replacement: path.resolve(rootDir, '../../packages/ui-components'),
        },
      ],
      dedupe: ['vue'],
    },
    optimizeDeps: {
      exclude: ['@express-platform/ui-components'],
      include: ['maplibre-gl'],
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBase),
    },
    server: {
      host: '127.0.0.1',
      port: Number(env.VITE_USER_APP_PORT ?? 5173),
      strictPort: true,
    },
  };
});
