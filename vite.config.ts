import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Vite envuelve cada import() en un ayudante que precarga el CSS y las dependencias del trozo (unos 450 B
    // con gzip en el bundle inicial). El único import() es el de la analítica, sin CSS ni dependencias, así que
    // el ayudante solo llama al import (decisión 104). Si algún día un import() trae CSS, hay que quitar esto.
    {
      name: 'colorgods:import-sin-precarga',
      apply: 'build',
      enforce: 'pre',
      load(id) {
        if (id === '\0vite/preload-helper.js') return 'export const __vitePreload = (load) => load();';
      },
    },
  ],
});
