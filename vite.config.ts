import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    hmr: {
      host: 'localhost'
    },
    watch: {
      usePolling: true,
      interval: 300
    }
  }
});
