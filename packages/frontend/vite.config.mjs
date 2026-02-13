import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
