import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
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
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      includeAssets: [],
      manifest: {
        name: 'TechDetech WebApp',
        theme_color: '#8F00FF',
        icons: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
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
          ],
          images: [
            './src/assets/maps/IndiaYuridia/sanjose_ca.png',
            './src/assets/carouselImg/artistAlebrije.png',
            './src/assets/events/IndiaYuridia.png'
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
