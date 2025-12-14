# Perbaikan Konfigurasi Nuxt.js

## Masalah yang Ditemukan
Ada kesalahan sintaks di file `nuxt.config.ts` pada baris 53-54. Kurung kurawal tidak tertutup dengan benar.

## Perbaikan yang Diperlukan

### File: nuxt.config.ts
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
}) // <- Perbaikan: kurung kurawal ditutup di sini
```

## Perubahan yang Dilakukan
1. **Baris 53**: Menghapus kurung kurawal yang berlebih
2. **Baris 54**: Menutup konfigurasi dengan kurung kurawal dan tanda kurung tepat

## Penjelasan Konfigurasi WebSocket URL

Konfigurasi `websocketUrl` di bagian `runtimeConfig.public` digunakan untuk:
- **Client-side**: Mengakses URL WebSocket dari browser
- **Environment variable**: Bisa dioverride dengan `WEBSOCKET_URL` di `.env`
- **Default value**: `ws://localhost:3000` untuk development

## Contoh File .env
```env
WEBSOCKET_URL=ws://localhost:3000
ENCRYPTION_KEY=your-secret-encryption-key-here
```

## Cara Menggunakan di Kode

### Client-side (Vue component)
```vue
<script setup>
const config = useRuntimeConfig()
const wsUrl = config.public.websocketUrl // 'ws://localhost:3000'
</script>
```

### Server-side (WebSocket handler)
```typescript
const config = useRuntimeConfig()
const encryptionKey = config.encryptionKey // 'your-secret-encryption-key-here'
```

## Validasi Konfigurasi

Setelah perbaikan, pastikan konfigurasi valid dengan:

1. **Development mode**:
   ```bash
   npm run dev
   ```

2. **Build test**:
   ```bash
   npm run build
   ```

3. **Preview mode**:
   ```bash
   npm run preview
   ```

## Error yang Mungkin Terjadi

Jika masih ada error, periksa:

1. **Dependencies**: Pastikan `ws` dan `@types/ws` terinstall
2. **TypeScript**: Pastikan tidak ada error type checking
3. **Environment**: Pastikan `.env` file ada (opsional)

## Tips Debugging

1. **Console log**: Tambahkan `console.log` untuk memastikan config terload
2. **Browser dev tools**: Cek error di console browser
3. **Network tab**: Pastikan WebSocket connection berhasil
4. **Server logs**: Cek terminal untuk error server-side

## Alternatif Konfigurasi

Jika masih ada masalah, bisa gunakan alternatif:

```typescript
// Alternative approach
export default defineNuxtConfig({
  // ... other config
  runtimeConfig: {
    encryptionKey: 'default-secret-key-12345',
    public: {
      websocketUrl: 'ws://localhost:3000'
    }
  }
})
```

Tanpa menggunakan `process.env` untuk sederhana.