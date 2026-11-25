import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/vrr': { // VRR 전용 프록시
        target: 'https://openservice.vrr.de',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vrr/, '/openservice'),
      }
      // 추후 지역 추가 예정
    },
  },
});