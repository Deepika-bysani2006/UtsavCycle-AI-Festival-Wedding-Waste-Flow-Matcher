import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['utsavcycle-logo.png', 'pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png', 'favicon.png'],
      manifest: {
        name: 'UtsavCycle AI',
        short_name: 'UtsavCycle',
        description: 'Turn Event Waste into Community Resources',
        theme_color: '#1a6b2f',
        background_color: '#f8faf5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/utsavcycle-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        categories: ['productivity', 'utilities', 'lifestyle'],
        screenshots: [],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache' },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'react-vendor';
        },
      },
    },
  },
})
