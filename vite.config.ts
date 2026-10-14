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
    // el ayudante solo llama al import (decisión 105). Si algún día un import() trae CSS o dependencias, el build
    // falla para que se quite esto.
    {
      name: 'colorgods:import-sin-precarga',
      apply: 'build',
      enforce: 'pre',
      load(id) {
        if (id === '\0vite/preload-helper.js') return 'export const __vitePreload = (load) => load();';
      },
      generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (
            chunk.type === 'chunk' &&
            chunk.isDynamicEntry &&
            (chunk.viteMetadata?.importedCss.size || chunk.imports.length)
          )
            this.error(
              `${chunk.fileName} trae CSS o dependencias: quita colorgods:import-sin-precarga (decisión 105).`,
            );
        }
      },
    },
  ],
});
