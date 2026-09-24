import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Ensures assets load properly on GitHub Pages or any subpath deployment
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        designSystem: 'design-system.html', // Figma parity page
      },
    },
  },
});
