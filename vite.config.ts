import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages のプロジェクトページ配信パス（リポジトリ名と一致させる）
const base = '/transit-card-pwa-demo/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 開発中は Service Worker を無効化し、古い SW によるキャッシュ混乱を避ける
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg'],
      manifest: {
        id: base,
        name: 'Transit Pass Demo',
        short_name: 'Transit Pass',
        description:
          '交通系ICカードアプリの操作体験を参考にしたフロントエンド学習用デモPWA（実在サービスとは無関係）',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0f1f1a',
        theme_color: '#1b7a5e',
        lang: 'ja',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
})
