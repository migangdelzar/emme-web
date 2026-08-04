import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: false, // Use our public/manifest.json
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-static',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
        },
        '/oauth2': {
          target: 'http://localhost:8081',
          changeOrigin: true,
        },
        '/login/oauth2': {
          target: 'http://localhost:8081',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProd,
      minify: isProd ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-tooltip', 'lucide-react', 'motion'],
            charts: ['recharts'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/setupTests.ts',
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html'],
        thresholds: {
          statements: 55,
          branches: 50,
          functions: 40,
          lines: 60,
        },
      },
    },
  };
});
