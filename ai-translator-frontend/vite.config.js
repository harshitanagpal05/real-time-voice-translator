import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_PROXY_TARGET || env.VITE_API_URL || 'http://127.0.0.1:5000';

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (id.includes('@react-three/fiber')) {
              return 'r3f-vendor';
            }

            if (id.includes('@react-three/drei')) {
              return 'drei-vendor';
            }

            if (id.includes('three-stdlib')) {
              return 'three-stdlib-vendor';
            }

            if (id.includes('/three/') || id.includes('node_modules/three')) {
              return 'three-core-vendor';
            }

            if (id.includes('chart.js')) {
              return 'chart-vendor';
            }

            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }

            if (id.includes('@react-oauth/google')) {
              return 'oauth-vendor';
            }

            if (id.includes('axios')) {
              return 'axios-vendor';
            }

            return 'vendor';
          },
        },
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/health': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
