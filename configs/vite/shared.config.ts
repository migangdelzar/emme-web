export function createSharedViteConfig({ mode, apiProxyTarget }: { mode: string; apiProxyTarget: string }) {
  const isProd = mode === 'production';

  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      },
      proxy: {
        '/api': { target: apiProxyTarget, changeOrigin: true },
        '/oauth2': { target: apiProxyTarget, changeOrigin: true },
        '/login/oauth2': { target: apiProxyTarget, changeOrigin: true },
        '/q': { target: apiProxyTarget, changeOrigin: true },
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
}
