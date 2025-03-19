import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import { terser } from 'rollup-plugin-terser'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    terser()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8020',
        changeOrigin: true,
        rewrite: (path) => path.replace(/\/api/, ''),
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    // Fine-tune bundling strategy
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Extract package name from module path to create separate chunks
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        },
        // Attempt to merge chunks smaller than 10KB (in bytes)
        experimentalMinChunkSize: 10 * 1024,
      }
    },
  }
})
