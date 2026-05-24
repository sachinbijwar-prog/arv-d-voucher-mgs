import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages:
// - If repo name is "sdvms" → base: '/sdvms/'
// - If repo is "yourusername.github.io" → base: '/'
// Change REPO_NAME below to match your GitHub repository name

const REPO_NAME = 'sdvms' // ← change this if your repo has a different name

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
