import missingHandlerPlugin from './vite-plugin-missing-handler';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createStyleImportPlugin, AntdResolve } from 'vite-plugin-style-import'

// https://vite.dev/config/
export default defineConfig({
  plugins: [missingHandlerPlugin(), 
    react(),
    createStyleImportPlugin({
      resolves: [AntdResolve()],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1890ff',
          'border-radius-base': '4px',
        },
      },
    },
  },
})