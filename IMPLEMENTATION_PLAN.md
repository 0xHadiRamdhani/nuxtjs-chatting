# Aplikasi Web Obrolan Waktu Nyata - Estetika Terminal Hacker Hijau

## Deskripsi Proyek
Aplikasi web obrolan waktu nyata dengan tema terminal hacker klasik: hijau neon di atas latar belakang hitam dengan berbagai efek visual dan fitur keamanan.

## Fitur Utama

### 1. Estetika Visual
- **Font Monospace**: Menggunakan font seperti 'Courier New', 'Monaco', atau 'Consolas'
- **Warna Hijau Neon**: Kode warna #00ff00 untuk teks utama
- **Latar Belakang Hitam**: #000000 untuk kesan terminal asli
- **Efek Hujan Matriks**: Animasi karakter jatuh seperti film The Matrix
- **Overlay CRT**: Garis pemindaian horizontal untuk efek monitor lama
- **Efek Kedip**: Teks berkedip untuk notifikasi atau status

### 2. Komponen Utama
- **Header ASCII Art**: Logo aplikasi dalam format ASCII
- **Area Obrolan**: Tampilan pesan dengan timestamp dan username
- **Input Pesan**: Baris perintah bergaya terminal
- **Status Bar**: Informasi koneksi, jumlah pengguna online

### 3. Sistem Obrolan
- **WebSocket**: Koneksi waktu nyata untuk pengiriman pesan
- **Enkripsi Pesan**: Menggunakan crypto-js untuk mengamankan komunikasi
- **Pesan Real-time**: Update instan tanpa refresh halaman
- **History Pesan**: Menyimpan pesan dalam memori untuk scrollback

### 4. Fitur Khusus
- **Easter Egg**: Perintah tersembunyi seperti `/matrix`, `/hack`, `/clear`
- **Mode Gelap**: Hanya tersedia tema gelap, tidak ada tema terang
- **Halaman 404**: Kernel panic style dengan stack trace
- **Zero Tracking**: Tidak ada analitik atau pelacakan pengguna
- **SSR Instan**: Server-side rendering untuk performa optimal

## Struktur File

### app.vue (Single File Component)
```vue
<template>
  <!-- Struktur HTML dengan tema terminal -->
</template>

<script setup>
  // Logika WebSocket, enkripsi, dan state management
</script>

<style>
  /* CSS untuk efek visual dan animasi */
</style>
```

## Implementasi Detail

### 1. Konfigurasi Nuxt.js
- SSR diaktifkan untuk performa optimal
- Devtools untuk debugging
- Konfigurasi WebSocket server

### 2. WebSocket Server
- Endpoint: ws://localhost:3000
- Format pesan: JSON dengan username, pesan, timestamp
- Broadcast ke semua klien yang terhubung

### 3. Enkripsi Pesan
- Algoritma: AES
- Kunci: Dihasilkan dari passphrase yang sama untuk semua klien
- Base64 encoding untuk transmisi

### 4. Efek Visual
- Canvas untuk hujan matriks
- CSS animations untuk efek kedip
- Pseudo-elements untuk overlay CRT

### 5. Easter Egg Commands
- `/matrix`: Toggle efek hujan matriks
- `/hack`: Animasi "hacking" sederhana
- `/clear`: Bersihkan area obrolan
- `/help`: Tampilkan daftar perintah

## Langkah Implementasi

1. Setup proyek Nuxt.js dengan dependensi
2. Buat struktur HTML dasar dengan tema terminal
3. Implementasi efek visual (hujan matriks, CRT overlay)
4. Setup WebSocket server dan client
5. Tambahkan enkripsi pesan
6. Implementasi sistem obrolan
7. Buat easter egg commands
8. Desain halaman 404 kernel panic
9. Optimasi performa dan SSR
10. Testing dan debugging

## Teknologi yang Digunakan
- Nuxt.js 3
- Vue.js 3
- WebSocket
- crypto-js
- HTML5 Canvas
- CSS3 Animations

## Catatan Keamanan
- Pesan terenkripsi selama transmisi
- Tidak ada penyimpanan data permanen
- Zero tracking policy
- Validasi input pengguna

## Performa
- SSR untuk loading cepat
- Lazy loading untuk resource besar
- Optimasi bundle size
- Caching strategis