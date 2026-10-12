// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, terrazzo.config.mjs.
// Adaptado en colorgods: prefijo de las variables --cg- en vez de --t101- (decisión 43, 2026-10-12). El resto, como el original.

// Genera las dos capas de tokens de la web (docs/paso-7-tokens.md, V06–V11):
//   src/styles/tokens.css  capa 1: variables --cg-* con sus modos (plugin-css de Terrazzo)
//   src/styles/theme.css   capa 2: @theme inline de Tailwind CSS v4 que apunta a la capa 1 (plugin propio)
// Entrada: tokens/tokens101.resolver.json (DTCG 2025.10 Resolver). Uso: npm run tokens

import fs from 'node:fs';
import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';

const codeOnly = JSON.parse(fs.readFileSync(new URL('./tokens/code-only.tokens.json', import.meta.url), 'utf8'));
// Valor de un breakpoint, con el alias resuelto: una consulta @media no lee variables CSS.
const breakpoint = (name) => {
  const { $value } = codeOnly.breakpoint[name];
  return typeof $value === 'string'
    ? breakpoint($value.slice(1, -1).split('.').pop()) // "{breakpoint.lg}" → lg
    : `${$value.value}${$value.unit}`;
};
const DESKTOP = `(width >= ${breakpoint('desktop')})`; // D11, S38: (width >= 64rem)

const REM_BASE = 16; // sistema-tokens-v1.md §4: px en Figma, rem en CSS con base 16

// Nombre igual al code syntax Web de Figma (S6, S27, D03): --cg- + ruta con guiones.
const variableName = (token) => `--cg-${token.id.replace(/\./g, '-')}`;

// Tokens que cambian con cada modo (el resto se escribe una sola vez en :root).
const THEME_TOKENS = ['color.background.**', 'color.text.**', 'color.border.**'];
const LAYOUT_TOKENS = ['font-size.heading.**', 'font-size.body.**', 'font-size.label.**', 'font-size.caption.**', 'font-size.code.**'];

export default defineConfig({
  tokens: ['./tokens/tokens101.resolver.json'],
  outDir: './src/styles/',
  plugins: [
    css({
      filename: 'tokens.css',
      variableName,
      legacyHex: true, // A8: hex, el mismo valor sRGB que exporta Figma (S9)
      // px → rem en los valores directos; los alias se quedan en var() (V06).
      transform: (token) =>
        token.$type === 'dimension' && !token.aliasOf && token.$value.unit === 'px'
          ? `${token.$value.value / REM_BASE}rem`
          : undefined,
      permutations: [
        {
          input: { theme: 'light', layout: 'mobile' },
          prepare: (contents) => `:root {\n  color-scheme: light;\n  ${contents}\n}`,
        },
        // D07 y V10: "dark" elegido en el selector de tema…
        {
          input: { theme: 'dark', layout: 'mobile' },
          include: THEME_TOKENS,
          prepare: (contents) => `[data-theme="dark"] {\n  color-scheme: dark;\n  ${contents}\n}`,
        },
        // …o "system" con el sistema en oscuro (todo lo que no sea "light" explícito).
        {
          input: { theme: 'dark', layout: 'mobile' },
          include: THEME_TOKENS,
          prepare: (contents) =>
            `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    color-scheme: dark;\n    ${contents}\n  }\n}`,
        },
        // D10, D11: Mobile por defecto; Desktop desde el breakpoint.
        {
          input: { theme: 'light', layout: 'desktop' },
          include: LAYOUT_TOKENS,
          prepare: (contents) => `@media ${DESKTOP} {\n  :root {\n    ${contents}\n  }\n}`,
        },
      ],
    }),
    tailwindTheme(),
  ],
});

/**
 * Capa 2 (S7): @theme inline que expone los tokens en Tailwind CSS v4 apuntando a la capa 1.
 * - `--*: initial` quita el tema por defecto de Tailwind: solo existen utilidades que salen de tokens (S27).
 * - Colores por propiedad (V09, A12): --background-color-* → bg-*, --text-color-* → text-*,
 *   --border-color-* → border-*. No documentado por Tailwind; lo vigila `npm run check:tokens`.
 * - Cada token se mapea o se descarta de forma explícita; uno sin regla detiene el build.
 */
function tailwindTheme() {
  const FONT_FALLBACKS = {
    sans: 'ui-sans-serif, system-ui, sans-serif',
    mono: 'ui-monospace, monospace',
  }; // V11
  // V13: next/font sirve la fuente con un nombre propio y lo publica en una variable CSS
  // (https://nextjs.org/docs/app/api-reference/components/font#css-variables).
  // Va primero; si no existe, se usa el nombre del token.
  const NEXT_FONT_VARIABLES = { sans: '--font-inter', mono: '--font-jetbrains-mono' };

  const ref = (id) => `var(--cg-${id.replace(/\./g, '-')})`;
  const rules = [
    // Primitivos de color: solo son destino de alias (S22), no se exponen.
    [/^color\.(white|black|emerald|neutral|red|amber|blue)(\.|$)/, () => null],
    [/^color\.background\.(.+)$/, (m, id) => [[`--background-color-${m[1].replace(/\./g, '-')}`, ref(id)]]],
    [/^color\.text\.(.+)$/, (m, id) => [[`--text-color-${m[1].replace(/\./g, '-')}`, ref(id)]]],
    [/^color\.border\.focus$/, (m, id) => [
      ['--border-color-focus', ref(id)],
      ['--outline-color-focus', ref(id)],
      ['--ring-color-focus', ref(id)],
    ]],
    [/^color\.border\.(.+)$/, (m, id) => [[`--border-color-${m[1].replace(/\./g, '-')}`, ref(id)]]],
    [/^space\.(.+)$/, (m, id) => [[`--spacing-${m[1].replace(/\./g, '-')}`, ref(id)]]],
    [/^radius\.(.+)$/, (m, id) => [[`--radius-${m[1]}`, ref(id)]]],
    // Tailwind no tiene espacio de nombres para el grosor de borde: los componentes usan border-(length:--cg-border-width-*) (V14).
    [/^border-width\./, () => null],
    // Primitivos de tamaño de fuente: los usan los tokens de Layout (D10), no los componentes.
    [/^font-size\.\d+$/, () => null],
    [/^font-size\.(.+)$/, (m, id) => [[`--text-${m[1].replace(/\./g, '-')}`, ref(id)]]],
    [/^font-weight\.(.+)$/, (m, id) => [[`--font-weight-${m[1]}`, ref(id)]]],
    [/^font-family\.(sans|mono)$/, (m, id) => [
      [`--font-${m[1]}`, `var(${NEXT_FONT_VARIABLES[m[1]]}, ${ref(id)}), ${FONT_FALLBACKS[m[1]]}`],
    ]],
    [/^line-height\.(.+)$/, (m, id) => [[`--leading-${m[1]}`, ref(id)]]],
    // --container-* da max-w-* y w-* (https://tailwindcss.com/docs/max-width).
    [/^size\.content\.max-width$/, (m, id) => [['--container-content', ref(id)]]],
    [/^size\.sidebar\.width$/, (m, id) => [['--container-sidebar', ref(id)]]],
    // V24: --ease-* da ease-standard (https://tailwindcss.com/docs/transition-timing-function).
    // La duración no tiene espacio de nombres: duration-(--cg-duration-200)
    // (https://tailwindcss.com/docs/transition-duration).
    [/^easing\.(.+)$/, (m, id) => [[`--ease-${m[1]}`, ref(id)]]],
    [/^duration\./, () => null],
    // C27: la documentación de Tailwind no da --opacity-* como espacio de nombres del tema; los
    // componentes usan opacity-(--cg-opacity-inactive) (https://tailwindcss.com/docs/opacity).
    [/^opacity\./, () => null],
    // V28: --blur-* da blur-* y backdrop-blur-* (https://tailwindcss.com/docs/backdrop-filter-blur).
    [/^blur\.(.+)$/, (m, id) => [[`--blur-${m[1]}`, ref(id)]]],
    // Las media queries no leen variables: el breakpoint se escribe con su valor, el alias resuelto (D11, S38).
    [/^breakpoint\.(.+)$/, (m) => [[`--breakpoint-${m[1]}`, breakpoint(m[1])]]],
  ];

  return {
    name: 'tokens101-tailwind-theme',
    async build({ tokens, outputFile }) {
      const declarations = [];
      for (const id of Object.keys(tokens).sort()) {
        const rule = rules.find(([pattern]) => pattern.test(id));
        if (!rule) throw new Error(`theme.css: el token ${id} no tiene regla en terrazzo.config.mjs`);
        const result = rule[1](id.match(rule[0]), id);
        if (result) declarations.push(...result);
      }
      outputFile(
        'theme.css',
        [
          '/* Generado por `npm run tokens` (terrazzo.config.mjs). No editar a mano. */',
          '/* Capa 2 (S7): Tailwind CSS v4 apunta a las variables --cg-* de tokens.css. */',
          '@theme inline {',
          '  --*: initial;',
          '  --default-font-family: var(--font-sans);',
          '  --default-mono-font-family: var(--font-mono);',
          ...declarations.map(([name, value]) => `  ${name}: ${value};`),
          '}',
          '',
        ].join('\n'),
      );
    },
  };
}
