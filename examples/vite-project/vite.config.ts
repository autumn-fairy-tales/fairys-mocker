import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fairysMockerVitePlugin } from '@fairys/mocker-cli'

// https://vite.dev/config/
export default defineConfig({
  plugins: [fairysMockerVitePlugin(), vue(),],
})
