import { defineConfig } from 'vite';

export default defineConfig({
  base: '/github-contribution/', // Ensure that all resources use this base path
  build: {
    rollupOptions: {
      external: ['/github-contribution/app.js'], // Externalize if necessary
    },
  },
  server: {
    port: 3000,
  },
});
