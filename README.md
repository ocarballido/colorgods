# colorgods

App web para generar escalas tonales de color con el número de pasos que quieras, la convención de nombres que elijas y el mismo contraste en cada paso, lista para exportar a Figma (DTCG) y a código (CSS y `@theme` de Tailwind CSS 4).

Se publicará en [colorgods.com](https://colorgods.com). La interfaz es en inglés; los documentos del proyecto, en español.

## Estado

En construcción. El avance está en [`docs/plan.md`](docs/plan.md) y las decisiones, en [`docs/decisiones.md`](docs/decisiones.md).

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/` | La app (Vite, React y TypeScript) |
| `tools/` | Motor de escalas (`scales.mjs`) y conversión de las variables de Figma a DTCG (`figma-to-dtcg.mjs`) |
| `tests/` | Pruebas del motor (`node --test`) |
| `tokens/` | Variables del sistema de diseño exportadas de Figma y su paso a CSS con Terrazzo |
| `docs/` | Funcionalidades, UX, decisiones, plan y las pruebas que las sostienen |

## Uso

Con Node 24:

```sh
npm install
npm test          # pruebas del motor
npm run tokens    # variables de Figma (tokens/figma/) a CSS (src/styles/)
npm run dev       # servidor local
npm run build     # página estática en dist/
```

## Origen

Nace de la herramienta "Generar escalas" de [DesignToken101](https://github.com/ocarballido/design-tokens-101). El motor, sus pruebas, `figma-to-dtcg.mjs` y la configuración de Terrazzo se copian de ese repositorio en el commit `f4885d7`, con el origen en la cabecera de cada archivo. Las curvas de referencia son datos de [Tailwind CSS](https://tailwindcss.com) (MIT).

## Autoría

Oscar Carballido, con la ayuda de Claude (Anthropic). Licencia MIT.
