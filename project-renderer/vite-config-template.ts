import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@services': resolve(__dirname, 'src/services'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@layouts': resolve(__dirname, 'src/layouts'),
      '@data': resolve(__dirname, 'src/data'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    mainFields: ['module', 'main'],
    conditions: ['import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    exclude: [
      'vite-plugin-missing-handler'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          utils: ['lodash', 'date-fns', 'axios', 'uuid'],
          forms: ['react-hook-form', 'formik', 'yup'],
          state: ['zustand', '@reduxjs/toolkit', 'react-redux'],
          charts: ['recharts', 'react-chartjs-2', 'chart.js'],
          icons: ['react-icons', 'react-feather'],
          styling: ['styled-components', '@emotion/react', '@emotion/styled'],
          ui: ['react-toastify', 'react-circular-progressbar'],
          markdown: ['react-markdown', 'remark-gfm'],
          realtime: ['socket.io-client'],
          auth: ['@supabase/supabase-js', 'jwt-decode'],
          payments: ['@stripe/react-stripe-js'],
          qr: ['qrcode.react', 'react-qr-code'],
          maps: ['leaflet', 'react-leaflet'],
          calendar: ['react-big-calendar', 'react-datepicker', 'react-day-picker'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
    open: false,
  },
  preview: {
    port: 4173,
    host: true,
    open: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
}); 
