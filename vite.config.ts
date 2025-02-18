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
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
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
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})
