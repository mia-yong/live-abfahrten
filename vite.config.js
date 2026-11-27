import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/vrr': { // VRR 전용 프록시
        target: 'https://openservice.vrr.de',
        changeOrigin: true,
        secure: false, // SSL 인증서 검증 엄격 모드 해제
        rewrite: (path) => path.replace(/^\/api\/vrr/, '/openservice'),
        agent: new https.Agent({
          keepAlive: true,
          keepAliveMsecs: 10000,
          maxSockets: 10,
        }),
        rewrite: (path) => path.replace(/^\/api\/vrr/, '/openservice'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // 브라우저에서 보낸 불필요한 헤더 제거 후 최소한의 깔끔한 헤더만 전송
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      }
      // 추후 지역 추가 예정
    },
  },
});