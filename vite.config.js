import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix all absolute /src/... imports so they resolve correctly in production builds
      '/src': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: false,
    proxy: {
      // In development, proxy /api calls to the local backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss('./tailwind.config.cjs')]
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    outDir: 'dist',
    target: 'esnext'
  }
});
