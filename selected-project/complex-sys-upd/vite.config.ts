import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      minify: true,
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'root-entry-name': 'variable',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});