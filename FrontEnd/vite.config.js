import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths instead of absolute
  server: {
    port: 5175,
    open: true,
    strictPort: false,
    host: true // Allow connections from network
  },
  preview: {
    port: 5174,
    open: true,
    strictPort: false, 
    host: true // Allow connections from network
  }
})