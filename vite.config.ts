import path from 'path';
import svgr from 'vite-plugin-svgr';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Commented out proxy configuration to run without backend
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: process.env.VITE_BACKEND_BASE_URL,
  //       changeOrigin: true,
  //     },
  //   },
  // },
});
