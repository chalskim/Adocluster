import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // --- [핵심] 프록시 설정을 추가합니다 ---
    proxy: {
      // '/proxy'로 시작하는 모든 요청을 다른 서버로 전달합니다.
      '/proxy': {
        // 실제 목표 서버 주소 (여기서는 네이버 뉴스 이미지 서버)
        target: 'https://imgnews.pstatic.net',
        // CORS 문제를 해결하기 위해 origin 헤더를 변경합니다.
        changeOrigin: true,
        // '/proxy' 경로를 실제 요청 시에는 제거합니다.
        rewrite: (path) => path.replace(/^\/proxy/, ''),
      },
    }
  }
})
