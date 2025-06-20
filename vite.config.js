import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Important for correct route resolution
  build: {
    outDir: 'dist', // Default, but you can change if needed
  },
  server: {
    port: 3000,
    open: true,
  }
});
