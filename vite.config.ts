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
  build: {
    // Increase the chunk size warning limit to 1000kb since some chunks might legitimately be large
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
          
          // UI libraries
          mui: ['@mui/material', '@mui/icons-material', '@mui/lab', '@mui/utils', '@mui/x-charts', '@mui/x-date-pickers'],
          radix: ['@radix-ui/react-checkbox', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-radio-group', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-tabs'],
          
          // Chart libraries - separated to avoid conflicts
          apexcharts: ['apexcharts', 'react-apexcharts'],
          chartjs: ['chart.js', 'react-chartjs-2'],
          gauges: ['react-d3-speedometer', 'react-gauge-component'],
          
          // Calendar and date libraries
          calendar: ['@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/interaction', '@fullcalendar/list', '@fullcalendar/react', '@fullcalendar/timegrid', 'react-big-calendar', 'flatpickr', 'react-flatpickr', 'moment', 'date-fns'],
          
          // Maps
          maps: ['mapbox-gl', '@mapbox/mapbox-gl-draw', '@react-jvectormap/core', '@react-jvectormap/world'],
          
          // Utility libraries
          utils: ['lodash', 'axios', 'clsx', 'classnames', 'class-variance-authority', 'tailwind-merge'],
          
          // Redux and state management
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          
          // Heavy utilities
          heavy: ['@turf/turf']
        }
      }
    },
    // Optimize minification
    minify: 'esbuild',
    // Target modern browsers to allow for better optimization
    target: 'es2020'
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
