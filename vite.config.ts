
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // Allows access from iPad on the same WiFi
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
