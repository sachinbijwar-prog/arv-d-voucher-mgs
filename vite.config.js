import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// For GitHub Pages:
// - If repo name is "sdvms" → base: '/sdvms/'
// - If repo is "yourusername.github.io" → base: '/'
// Change REPO_NAME below to match your GitHub repository name
const REPO_NAME = 'arv-d-voucher-mgs' // ← your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/arv-d-voucher-mgs/' : '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
