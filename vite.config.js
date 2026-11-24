import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/transit': {
        target: 'https://infranode.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/transit/, '/api/v1'),
      },
    },
  },
});