import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        options: './options.html',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    emptyOutDir: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});