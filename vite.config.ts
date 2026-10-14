import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // Dos páginas: la app y "How it works", HTML estático sin React (decisión 108). Vite la pone en
  // dist/how-it-works/index.html, que Vercel sirve en /how-it-works.
  build: {
    // Sin el polyfill de modulepreload: las dos entradas no comparten trozos (solo el de la analítica, que se pide con
    // import()), así que no hay ningún <link rel="modulepreload"> que atender, y en las dos iría a un trozo compartido.
    modulePreload: { polyfill: false },
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        howItWorks: fileURLToPath(new URL('how-it-works/index.html', import.meta.url)),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    // Vite envuelve cada import() en un ayudante que precarga el CSS y las dependencias del trozo (unos 450 B
    // con gzip en el bundle inicial). Los únicos import() son los de la analítica, sin CSS ni dependencias, así que
    // el ayudante solo llama al import (decisión 105). Si algún día un import() trae CSS o dependencias, el build
    // falla para que se quite esto.
    {
      name: 'colorgods:import-sin-precarga',
      apply: 'build',
      enforce: 'pre',
      // Una copia del ayudante por módulo que lo pide (main.tsx y how-it-works.ts): con una sola, iría a un trozo
      // compartido que la app tendría que pedir aparte (decisión 108).
      resolveId(id, importer) {
        if (id === '\0vite/preload-helper.js') return `\0colorgods-preload:${importer}`;
      },
      load(id) {
        if (id.startsWith('\0colorgods-preload:')) return 'export const __vitePreload = (load) => load();';
      },
      generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) {
          // Las páginas no comparten trozos (decisión 108): si una entrada importa otro, la app lo pediría aparte.
          if (chunk.type === 'chunk' && chunk.isEntry && chunk.imports.length)
            this.error(
              `${chunk.fileName} importa ${chunk.imports.join(', ')}: las entradas no comparten trozos (decisión 108).`,
            );
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
