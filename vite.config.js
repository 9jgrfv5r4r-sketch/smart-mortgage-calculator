import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Это позволит доступ из локальной сети
    port: 5173,
    strictPort: false, // Если порт занят, попробует другой
    cors: true,
    hmr: {
      host: 'localhost',
    }
  }
});
