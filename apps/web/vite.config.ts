// Module responsible for configuring the 1ntern web development and build runtime.

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:4501',
      '/health': process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:4501',
    },
  },
});
