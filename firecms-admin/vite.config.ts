import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  esbuild: {
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
    },
  },

  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },

  build: {
    outDir: './build',
    target: 'ESNEXT',
  },
});