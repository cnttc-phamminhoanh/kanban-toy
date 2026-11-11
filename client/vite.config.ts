import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_BASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: '@client', replacement: path.resolve(import.meta.dirname, '.') },
        { find: '@shared', replacement: path.resolve(import.meta.dirname, 'shared') },
        { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
      ],
    },
    server: {
      port: 8082,
      proxy: proxyTarget
        ? {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
          },
        }
        : undefined,
    },
  };
});
