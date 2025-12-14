# Konfigurasi Nuxt.js untuk Aplikasi Terminal Chat

## File: nuxt.config.ts

```typescript
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
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-secret-key-12345',
    
    // Public keys (exposed to client-side)
    public: {
      websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3000'
    }
  }
})
```

## Penjelasan Konfigurasi

### SSR (Server-Side Rendering)
- Diaktifkan untuk performa optimal dan SEO yang baik
- Memungkinkan hidrasi instan saat halaman dimuat

### WebSocket Support
- Menggunakan fitur experimental websocket dari Nitro
- Memungkinkan komunikasi real-time antara server dan client

### Global CSS
- File `~/assets/css/main.css` akan dimuat secara global
- Berisi styling dasar untuk tema terminal

### App Head Configuration
- Title: "Terminal Chat"
- Meta tags untuk SEO dan viewport
- Style inline untuk body (background hitam, teks hijau, font monospace)

### Build Configuration
- Transpile crypto-js untuk kompatibilitas

### Runtime Config
- `encryptionKey`: Kunci untuk enkripsi pesan (server-side only)
- `websocketUrl`: URL WebSocket untuk koneksi client

## Environment Variables

Tambahkan file `.env` untuk konfigurasi environment:

```env
ENCRYPTION_KEY=your-secret-encryption-key-here
WEBSOCKET_URL=ws://localhost:3000
```

## Dependencies yang Diperlukan

Pastikan untuk menginstal dependencies berikut:

```bash
npm install ws crypto-js @types/ws
```

## Struktur Direktori yang Direkomendasikan

```
project/
├── app/
│   ├── app.vue              # Komponen utama
│   ├── assets/
│   │   └── css/
│   │       └── main.css     # Styling global
│   └── error.vue            # Halaman 404 kernel panic
├── public/
│   └── favicon.ico
├── nuxt.config.ts
├── package.json
└── tsconfig.json