import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 또는 '0.0.0.0'로 설정 (모든 IP에서 접근 허용)
    port: 5173, // 기본 포트
    strictPort: false, // 포트가 사용 중이면 자동으로 다른 포트 사용
  },
})
