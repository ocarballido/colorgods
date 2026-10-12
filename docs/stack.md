# Stack y publicación (paso C1, decisión 6)

2026-10-11. Propuesta de Claude. **Decidida por Oscar el 2026-10-12** (§5): acepta la propuesta, el repositorio será público y la publicación pasa de GitHub Pages a **Vercel** (§2, Publicación). Criterios del plan: todo en el navegador, sin servidor, solo inglés (decisión 13), peso y publicación en colorgods.com (decisión 7); y los de W3: lo más lógico para la app, para los usuarios y lo más actual.

## 1. Punto de partida comprobado

- **El motor no pide nada.** `tools/scales.mjs` en `f4885d7` no tiene dependencias y funciona en el navegador y en Node (su cabecera lo dice y sus importaciones lo confirman: no importa nada). `tools/scales.d.mts` declara sus tipos (25 exportaciones). Sirve tal cual en cualquier stack con módulos ES.
- **Sus pruebas usan `node:test`** (`node --test "tests/*.test.mjs"`, 7 pruebas), sin librerías de pruebas.
- **DesignToken101 en `f4885d7`** (`package.json`): Next.js 16.3.8, React 19.3, TypeScript 7.0.2, Tailwind CSS 4.3.3, Terrazzo 2.7.1 (de DTCG a CSS) y Node 24.x. Su herramienta "Generar escalas" está en React (`src/components/ScaleGenerator.tsx`, `ChromaChart.tsx`), y `ux.md` reutiliza soluciones suyas (C22, D14, D52, el error que no aparece entre `pointerdown` y `pointerup`).
- **La app es una sola página** con estado en la URL (F18), cálculo al momento (decisión 25), posible Web Worker (decisión 38), sin cuentas ni datos del usuario.

## 2. Propuesta

| Pieza | Propuesta | Por qué |
|---|---|---|
| Construcción | **Vite** (versión 8 en su documentación hoy; pide Node 20.19+ o 22.12+), plantilla `react-ts`, salida estática. | Una página sin servidor no necesita enrutado ni renderizado en servidor. Vite da módulos ES, TypeScript y Web Workers (`new Worker(new URL(...), { type: 'module' })`) sin configuración, que es la salida prevista en la decisión 38. |
| Interfaz | **React 19 con TypeScript.** | Cada ajuste recalcula seis escalas, tiras, regla, tabla, avisos, URL y exportación: con una vista declarativa eso es un solo cálculo y un render; a mano son muchas actualizaciones del DOM que pueden quedar desfasadas. Es lo que usa el curso: las soluciones de `ux.md` que vienen de `ScaleGenerator.tsx` se trasladan sin traducir, y Oscar ya lo conoce. |
| Estilos | **Tailwind CSS 4** con las variables del sistema de B2 pasadas a CSS con **Terrazzo**, como en el curso (`figma-to-dtcg.mjs` y `tz build`). | El sistema de diseño de la app sale de Figma como DTCG, el mismo formato que exporta la app, y llega al código sin copiar valores a mano. Para B2: las variables se nombran pensando en esa exportación. |
| Motor | `scales.mjs` copiado según A2 y generalizado en C3; se importa como módulo con sus tipos `.d.mts`. | Sin cambios de formato: se sigue pudiendo comparar con el curso. |
| Pruebas | Motor: `node --test`, como las copiadas. Interfaz: **Playwright** con **axe-core** solo para lo que necesita un navegador (teclado, foco, anuncios, WCAG 2.2 AA de `ux.md` §10), en el encargo de C4 que lo pida. | Ninguna librería nueva para el motor. Las comprobaciones de interfaz se piden encargo a encargo. |
| Node | **24**, como el curso; nodejs.org lo da como LTS. | Mismo entorno en los dos proyectos. |
| Idioma | Textos en inglés en el código, sin librería de traducción. | Decisión 13. El curso usa `next-intl` porque tiene dos idiomas; aquí no hace falta. |
| HTML inicial | `index.html` con título, descripción, `h1` y un `<noscript>`; el resto lo pinta React. | Sin JavaScript no hay escala que mostrar; no compensa renderizar en servidor (§3). |
| Analítica y cookies | Ninguna en la versión 1. | Sin datos del usuario no hace falta aviso de cookies. Si se quiere medir uso, se decide aparte. |

### Publicación

Decidido por Oscar el 2026-10-12: Vercel en lugar de GitHub Pages. La propuesta original (GitHub Pages, con Cloudflare Workers de alternativa) queda en §3.

| Pieza | Decisión | Notas comprobadas |
|---|---|---|
| Alojamiento | **Vercel**, conectado al repositorio de GitHub: cada cambio en `main` se publica y cada pull request tiene su vista previa. | La documentación de Vercel para Vite dice que se despliega desde Git sin configuración. Como la app es una sola página sin rutas, no hace falta la reescritura a `index.html` que Vercel indica para aplicaciones con rutas. |
| Pruebas antes de publicar | El comando de construcción en Vercel es `npm test && npm run build`: si falla una prueba del motor, no se publica. Las pruebas de interfaz con navegador (Playwright) van en una acción de GitHub cuando C4 las añada. | Así no hace falta una acción de GitHub para publicar. |
| Plan | **Hobby** (gratis) mientras la app no tenga uso comercial. | Según sus normas de uso justo, Hobby es solo para uso personal no comercial. Cuentan como comercial, entre otros: pedir o cobrar pagos, anunciar la venta de un producto o servicio, publicidad y enlaces de afiliados. Pedir donaciones no. Una herramienta gratis sin nada de eso cabe en Hobby; si algún día la página ofrece servicios de Oscar o publicidad, hay que pasar a Pro o cambiar de alojamiento. En caso de duda, Vercel pide consultar a su soporte. Límites de Hobby que afectan a una página estática: 100 GB de transferencia al mes y 1.000.000 de peticiones al mes. |
| Dominio | `colorgods.com`, registrado en CDMON. Los DNS se configuran en CDMON con los valores que da Vercel al añadir el dominio al proyecto; `www` redirige al dominio sin `www` (o al revés, lo que se elija entonces). HTTPS lo pone Vercel. | Cuándo: al final, en C6. Oscar (2026-10-12): se desarrolla en local y, cuando el resultado convenza, se conecta con Vercel y se configuran los DNS. |
| Cabeceras propias | Si se quieren (por ejemplo, política de seguridad de contenido), en `vercel.json`. | No son necesarias para la versión 1. |

## 3. Descartadas

| Opción | Por qué no |
|---|---|
| Next.js con exportación estática (continuidad con el curso) | Trae enrutado, renderizado en servidor e internacionalización que una sola página en inglés no usa, y su enrutador se carga en el navegador además de React. La continuidad que importa (React, TypeScript, Tailwind, Terrazzo) se mantiene igual. |
| Astro con React en una isla | Su ventaja es el HTML estático con poco JavaScript, pero aquí casi toda la página es interactiva; añade una herramienta más sin ganancia clara. |
| Sin framework (TypeScript y DOM) | El menor peso, pero el estado y el render a mano son la parte con más riesgo de errores, y las soluciones del curso habría que reescribirlas. |
| GitHub Pages (propuesta original de publicación) | Gratis con repositorio público y HTTPS con dominio propio, pero sin vistas previas por pull request ni cabeceras propias. Oscar elige Vercel el 2026-10-12. |
| Cloudflare Workers con recursos estáticos | Era la alternativa a Pages para repositorio privado o cabeceras propias; con Vercel ya no hace falta. |
| Svelte o Preact | Pueden pesar menos, pero se pierde el traslado directo del código del curso (Svelte) o se depende de la capa de compatibilidad (Preact). Preact queda como salida si el peso lo pide (§4): con `preact/compat` no hay que reescribir. |

## 4. Peso

No se da cifra sin medirla: el registro de npm no es accesible desde este entorno. En C2, con la página vacía de Vite y React construida, se mide el JavaScript y el CSS (comprimidos) y se fija ahí el presupuesto de la versión 1. Si React pesa más de lo que se considere aceptable para la herramienta, se prueba Preact con `preact/compat`.

**Medida de C2 (2026-10-12).** Hecha por Oscar en su ordenador, en la rama `c2-repositorio`, con Vite 8.3.4, antes de importar los tokens en `src/index.css`. El entorno de desarrollo de C2 no llega al registro de npm, por eso se midió allí. Comando:

```sh
npm run build
node -e "const fs=require('fs'),z=require('zlib'),p='dist/assets/';for(const f of fs.readdirSync(p).filter(f=>/\.(js|css)$/.test(f)))console.log(f,fs.statSync(p+f).size,'B;',z.gzipSync(fs.readFileSync(p+f),{level:9}).length,'B con gzip')"
```

| Página vacía (React 19, Tailwind CSS 4, sin tokens) | Sin comprimir | gzip (nivel 9) |
|---|---|---|
| JavaScript | 219.548 B | 67.714 B |
| CSS | 4.198 B | 1.402 B |
| HTML (dato de Vite) | 0,79 kB | 0,45 kB |

**Con los tokens importados** (2026-10-12, misma medida, después de que `src/index.css` importe `tokens.css` y `theme.css`):

| Página vacía con tokens | Sin comprimir | gzip (nivel 9) |
|---|---|---|
| JavaScript | 219.548 B | 67.714 B |
| CSS | 14.275 B | 2.969 B |

El JavaScript no cambia; el CSS sube 1.567 B con gzip por las variables de los tokens. Esta es la base del presupuesto de la versión 1: unos 70,7 kB de JavaScript y CSS con gzip para la página vacía. **Presupuesto (decisión 45, 2026-10-12): 100 kB con gzip** para todo el JavaScript y el CSS, medido con este mismo comando en C4.

El JavaScript es casi todo React y React DOM: la página solo pinta un `h1`. Para referencia, los archivos que genera `npm run tokens` pesan 21.313 B (`tokens.css`, 3.646 B con gzip) y 5.434 B (`theme.css`, 1.038 B con gzip), pero cuánto CSS llega a la página lo decide Tailwind al construir, así que hay que medirlo.

## 5. Decidido (2026-10-12)

1. Se acepta la propuesta (Vite, React, TypeScript, Tailwind CSS 4 con Terrazzo, Node 24, pruebas con `node --test` y Playwright con axe-core).
2. El repositorio será público: github.com/ocarballido/colorgods (creado el 2026-10-12).
3. El dominio está registrado en CDMON; la publicación será en Vercel y los DNS se configuran cuando haya algo que publicar.

## 6. Montaje del repositorio (paso C2)

2026-10-12. Lo que se ha puesto y de dónde sale.

- **Plantilla:** `react-ts` de create-vite, leída en `vitejs/vite` (commit `40fa7d7`, `packages/create-vite/template-react-ts`): `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.gitignore`, `src/main.tsx` y las versiones de `package.json`. No se copian el logo, los estilos de ejemplo ni oxlint: el encargo pide solo los scripts `dev`, `build`, `test` y `tokens`.
- **Versiones** (comprobadas en las etiquetas de GitHub, porque npm no responde desde el entorno): Vite `^8.3.3` (la última etiqueta es v8.3.4), `@vitejs/plugin-react` `^6.1.2`, React y React DOM `^19.3.0`, TypeScript `~6.0.2` (la de la plantilla; el curso usa 7.0.2 con Next.js), Tailwind CSS y `@tailwindcss/vite` `^4.3.3` (etiqueta v4.3.3 de `tailwindlabs/tailwindcss`), Terrazzo `2.7.1` (CLI y plugin de CSS, fijos como en el curso). `engines.node`: `24.x`. Falta `package-lock.json`: lo crea el primer `npm install` y se sube con él.
- **Tailwind CSS** entra con el plugin de Vite (`@tailwindcss/vite`), no con PostCSS como en el curso, que usa Next.js. `src/index.css` limita la búsqueda de clases a `src/` con `source(".")`, como V44 del curso.
- **Tokens:** `tools/figma-to-dtcg.mjs` (y sus tipos), `tokens/tokens101.resolver.json` y `tokens/code-only.tokens.json` copiados sin cambios del curso; `terrazzo.config.mjs`, copiado con un solo cambio: el prefijo `--cg-` (decisión 43). El resolver espera las mismas colecciones que en el curso (`tokens/figma/README.md`); si ColorScaleUI tiene otras, se ajusta el resolver al ver la exportación. `src/index.css` importa `src/styles/tokens.css` y `src/styles/theme.css`, que genera `npm run tokens`.
- **Prefijo:** el *code syntax* de las variables de ColorScaleUI era `--t101-` (leído en Figma el 2026-10-12, página Templates, nodo `2015-1923`). Con la decisión 43 pasa a `--cg-`, en el código ya y en Figma cuando Oscar lo cambie, antes de exportar.
- **Copiado tal cual y a revisar:** `terrazzo.config.mjs` da a las fuentes primero las variables de `next/font` (`--font-inter`, `--font-jetbrains-mono`), que en Vite no existen y caen en el nombre del token; `code-only.tokens.json` incluye `duration.2000` para el pulso del resultado desactualizado, que la app no tiene (decisión 25).

## Fuentes

- DesignToken101, commit `f4885d7`: `package.json`, `tools/scales.mjs`, `tools/scales.d.mts`, `tests/scales.test.mjs`.
- Vite: vite.dev/guide (versión y Node, consultado el 2026-10-11).
- GitHub Pages: docs.github.com, "GitHub Pages limits" y "Securing your GitHub Pages site with HTTPS".
- Cloudflare: developers.cloudflare.com, "Migrate from Pages to Workers".
- Vercel: vercel.com/docs, "Vite on Vercel", "Vercel Hobby Plan" y "Fair Use Guidelines" (consultados el 2026-10-12).
- Node.js: nodejs.org, "Previous releases".
