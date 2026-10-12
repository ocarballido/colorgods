// ESLint (decisión 50): JavaScript y TypeScript en todo el código; React, sus hooks y accesibilidad (jsx-a11y) en src/.
// Prettier se encarga del formato: eslint-config-prettier, al final, apaga las reglas de estilo que chocarían con él.
import { createRequire } from 'node:module';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// eslint-plugin-react no sabe detectar la versión de React con ESLint 10 (llama a context.getFilename(), que ESLint 10
// quitó); se la damos leída de node_modules.
const reactVersion = createRequire(import.meta.url)('react/package.json').version;

export default defineConfig(
  // docs/ guarda medidas y prototipos que no se tocan; tokens/ sale de Figma.
  { ignores: ['dist/', 'docs/', 'tokens/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: reactVersion } },
  },
  {
    files: ['tools/**', 'tests/**', '*.config.{js,mjs,ts}', '.claude/hooks/**'],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
