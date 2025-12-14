// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SSR Configuration
  ssr: true,

  // Server configuration for WebSocket
  nitro: {
    experimental: {
      websocket: true
    }
  },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // App configuration
  app: {
    head: {
      title: 'Terminal Chat',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real-time terminal-style chat application' },
        { name: 'theme-color', content: '#000000' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      style: [
        { innerHTML: 'body { background-color: #000; color: #00ff00; font-family: monospace; margin: 0; padding: 0; }' }
      ]
    }
  },

  // Build configuration
  build: {
    transpile: ['crypto-js']
  },

  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    encryptionKey: (process?.env?.ENCRYPTION_KEY as string) || 'default-secret-key-12345',

    // Public keys (exposed to client-side)
    public: {
      websocketUrl: (process?.env?.WEBSOCKET_URL as string) || 'ws://localhost:3000'
    }
  }
})
