# colorgods

App web de una sola página que genera escalas tonales de color: N pasos (3 a 30 según la convención de nombres), el mismo contraste en cada paso (método D, decisión 30), el color de marca exacto en su paso y exportación a Figma (DTCG), CSS y `@theme` de Tailwind CSS 4. Todo se calcula en el navegador; sin servidor. Se publicará en colorgods.com (Vercel, en C6).

## Fuente de verdad: `docs/`

- `docs/decisiones.md`: qué está decidido. Si algo contradice una conversación o este archivo, prevalece ese documento.
- `docs/plan.md`: los pasos, su estado y sus comprobaciones.
- `docs/funcionalidades.md`: funcionalidades F1 a F26 con su criterio de aceptación.
- Según el paso: `docs/ux.md` (pantalla, estados, accesibilidad), `docs/stack.md` (stack, peso, publicación), `docs/semanticas.md`, `docs/nombres.md`.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/` | La app: Vite, React 19 y TypeScript, Tailwind CSS 4. `src/styles/tokens.css` y `theme.css` los genera `npm run tokens` |
| `tools/` | Motor de escalas (`scales.mjs`, sin dependencias, con tipos en `scales.d.mts`) y `figma-to-dtcg.mjs` |
| `tests/` | Pruebas del motor con `node --test` |
| `tokens/` | Variables de Figma (`tokens/figma/`, exportadas tal cual) y su paso a DTCG para Terrazzo |
| `docs/` | Decisiones, plan, funcionalidades, UX y, en `docs/comparacion/`, los scripts y medidas que las sostienen |
| `.claude/` | Configuración compartida de Claude Code: permisos, hooks, revisores y la skill `/encargo` |

## Comandos (Node 24)

- `npm test`: pruebas del motor.
- `npm run build`: comprueba tipos (`tsc -b`) y construye la página en `dist/`.
- `npm run lint`: ESLint (TypeScript, React, sus hooks y `jsx-a11y`).
- `npm run format`: Prettier. No formatea `docs/`, `tokens/`, el CSS generado ni el Markdown.
- `npm run tokens`: variables de Figma a CSS (`src/styles/`).
- Peso con gzip: el comando de `docs/stack.md` §4, después de `npm run build`.

## Forma de trabajo

- Un encargo por sesión: un paso de `docs/plan.md`, o una parte de un paso si el plan lo divide (C4 va por partes). Antes de empezar, lee `docs/decisiones.md` y `docs/plan.md`.
- Una rama y un pull request por encargo. La skill `/encargo` recorre el proceso entero.
- Antes de cada pull request: `npm test && npm run build` y `npm run lint`, sin errores (no hay CI en GitHub, decisión 52). Después, los revisores `revisor-codigo`, `revisor-seguridad` y, si cambia `src/` o `index.html`, `revisor-accesibilidad`.
- Al terminar, actualiza la fila del paso en `docs/plan.md` y registra en `docs/decisiones.md`, con fecha, lo que decidas que no esté ya decidido.
- Un commit que solo formatea va aparte de los cambios.

## Reglas del proyecto

- No afirmes nada sin comprobarlo: cifras, versiones y resultados salen de un comando ejecutado o de una fuente leída, y se dice cuál. Si algo no se ha podido comprobar, se dice.
- Si ves una incongruencia (en el código, entre documentos o entre código y documentos), corrígela o dila en cuanto la veas.
- Documentos, comentarios y commits en español, sin guiones largos. La interfaz de la app, en inglés (decisión 13).
- Accesibilidad WCAG 2.2 AA (`docs/ux.md` §9 y §10).
- Presupuesto de peso: 100 kB con gzip para todo el JavaScript y el CSS de la página (decisión 45; base de C2: 70,7 kB).
- Variables CSS de la app con el prefijo `--cg-` (decisión 43).
- Sin analítica, sin cookies y sin datos que salgan de la página (decisión 6).

## Reglas del motor

- `tools/scales.mjs` no cambia ningún hex sin una prueba que lo compruebe y una decisión en `docs/decisiones.md` que lo justifique.
- `docs/comparacion/` guarda medidas: no se edita para que una prueba pase. `docs/comparacion/a7-fixtures.json` está protegido por un hook, como `tokens/figma/`, `LICENSE` y `package-lock.json`.
