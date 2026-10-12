<!-- Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tokens/figma/README.md. Adaptado para colorgods: archivo de Figma y aviso de comprobación. -->

# Variables exportadas de Figma

Archivos DTCG tal como los exporta Figma desde el archivo [ColorScaleUI](https://www.figma.com/design/wsj9EF7WGWQJMknOlQud0m/ColorScaleUI): vista Variables → clic derecho en la colección → *Export modes*. Figma entrega un ZIP por colección, con un archivo por modo llamado `{Modo}.tokens.json` (comprobado en DesignToken101 el 2026-10-03).

Antes de exportar, el *code syntax* Web de cada variable debe empezar por `--cg-` (decisión 43): es el prefijo que usa `terrazzo.config.mjs`.

**No se editan a mano ni se renombran.** Si cambian las variables, se vuelve a exportar y se sustituyen los archivos de la carpeta de esa colección. Después: `npm run tokens`.

Carpetas que espera `tokens/tokens101.resolver.json` (las de DesignToken101; si las colecciones de ColorScaleUI son otras, se cambia el resolver):

| Carpeta | Colección de Figma | Archivos |
|---|---|---|
| `primitives/` | Primitives | `Value.tokens.json` |
| `semantic-color/` | Semantic color | `Light.tokens.json`, `Dark.tokens.json` |
| `semantic-size/` | Semantic size | `Value.tokens.json` |
| `layout/` | Layout | `Desktop.tokens.json`, `Mobile.tokens.json` |

Primitives y Semantic size tienen el mismo nombre de modo (`Value`); por eso cada colección va en su carpeta.
