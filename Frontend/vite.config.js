import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mediapipe/face_mesh', '@mediapipe/camera_utils'],
  },
  server: {
    host: true
  }
})
