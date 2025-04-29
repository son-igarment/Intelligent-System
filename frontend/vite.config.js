import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'chart.js': resolve(__dirname, 'node_modules/chart.js')
    }
  },
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    }
  }
})
