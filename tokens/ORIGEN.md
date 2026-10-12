# Origen de los archivos de tokens

JSON no admite comentarios, así que el origen de estos archivos se cita aquí.

| Archivo | Origen |
|---|---|
| `tokens101.resolver.json` | github.com/ocarballido/design-tokens-101, commit `f4885d7`, `tokens/tokens101.resolver.json`. Sin cambios. |
| `code-only.tokens.json` | github.com/ocarballido/design-tokens-101, commit `f4885d7`, `tokens/code-only.tokens.json`. Sin cambios. |
| `figma/README.md` | github.com/ocarballido/design-tokens-101, commit `f4885d7`, `tokens/figma/README.md`. Adaptado (ver su cabecera). |

`terrazzo.config.mjs` y `tools/figma-to-dtcg.mjs` llevan el origen en su cabecera.

Cómo se generan: `npm run tokens` normaliza `tokens/figma/` en `tokens/dtcg/` y Terrazzo escribe `src/styles/tokens.css` y `src/styles/theme.css`.
