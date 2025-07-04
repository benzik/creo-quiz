import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL || 'http://backend:8080')
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'frontend': path.resolve(__dirname, 'frontend')
        }
      }
    };
});
