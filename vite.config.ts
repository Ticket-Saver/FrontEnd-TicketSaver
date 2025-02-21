import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import Unfonts from 'unplugin-fonts/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      google: {
        families: [
          {
            name: 'Audiowide',
            styles: 'wght@400'
          },
          {
            name: 'Rajdhani',
            styles: 'wght@400;700'
          },
          {
            name: 'Roboto',
            styles: 'ital,wght@0,400;1,200',
            defer: true
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 4000, // 4MB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@auth0/auth0-react',
            '@tanstack/react-query'
          ]
        }
      }
    }
  },
  server: {
    host: true,
    port: Number(process.env.PORT) || 3000
  }
})
