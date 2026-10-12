# Paletas semánticas: márgenes, regla y colisión (paso A5, decisión 19)

2026-10-10. Propuesta de Claude para la decisión 19, a partir de `exploracion-semanticas.md`; decidida por Oscar el mismo día (§5): las semánticas entran en la versión 1 con las recomendaciones de Claude. Script: `docs/comparacion/roles.mjs` (importa `tools/scales.mjs` de DesignToken101 en `f4885d7` sin cambios). Revisión visual: artifact "Semánticas de colorgods" (las 13 marcas con sus cuatro roles y un ejemplo de cada caso del barrido).

**Actualización del 2026-10-11.** §1 a §5 describen el método C. Con el método D (decisión 30), cada rol va sobre la escalera de luminancia y la colisión se mide a la misma luminancia relativa: resultados en §6. Márgenes, candidatas, umbral y regla no cambian.

## 1. Fuentes

Color principal de cada rol en tema claro, leído en el repositorio de cada sistema. Solo se usa su tono para fijar los márgenes; ningún valor pasa a la app, que usa las paletas de Tailwind CSS (MIT).

| Sistema | Repositorio, commit (fecha) | Archivo | Licencia | danger | warning | success | info |
|---|---|---|---|---|---|---|---|
| Bootstrap 5.3.8 | `twbs/bootstrap` `25aa8cc` (2025-08-25) | `scss/_variables.scss` (`$danger` … `$info`) | MIT | `#DC3545` | `#FFC107` | `#198754` | `#0DCAF0` |
| Carbon | `carbon-design-system/carbon` `47ab671` (2026-10-09) | `packages/themes/src/dtcg/themes.json` (`support`, tema `white`) y `packages/colors/tokens/colors.tokens.json` | Apache 2.0 | `#DA1E28` (red 60) | `#F1C21B` (yellow 30) | `#24A148` (green 50) | `#0043CE` (blue 70) |
| Ant Design | `ant-design/ant-design` `e4c3c20` (2026-10-10) | `components/theme/themes/seed.ts` (`colorError` …) | MIT | `#FF4D4F` | `#FAAD14` | `#52C41A` | `#1677FF` |
| Polaris | `Shopify/polaris` `3f7954a` (2026-09-10) | `polaris-tokens/src/themes/base/color.ts` (`color-bg-fill-*`) y `colors.ts` | MIT con restricción de uso (solo apps para Shopify o visualmente distintas de Shopify): aquí solo se mide el tono | `#C70A24` (critical) | `#FFB800` | `#047B5D` | `#91D0FF` |
| Fluent 2 | `microsoft/fluentui` `6e52576` (2026-10-09) | `packages/tokens/src/statusColorMapping.ts` y `global/colors.ts` (`primary`) | MIT | `#C50F1F` (cranberry) | `#F7630C` (orange) | `#107C10` | No tiene |
| Primer | `primer/primitives` `f48bc06` (2026-09-09) | `src/tokens/functional/color/fgColor.json5` y `base/color/light/light.json5` | MIT | `#D1242F` | `#9A6700` (attention) | `#1A7F37` | No tiene |
| GOV.UK Frontend | `alphagov/govuk-frontend` `dacc29d` (2026-10-07) | `src/govuk/settings/_colours-functional.scss` y `_colours-palette--internal.scss` | MIT | `#CA3535` | No tiene | `#0F7A52` | No tiene |
| Material 3 | `material-foundation/material-color-utilities` `5b3618b` (2026-08-21) | `palettes/core_palette.ts` (error: tono 25, croma 84), tono 40 en claro (`color_spec_2021.ts`), calculado con su propio código | Apache 2.0 | `#BA1A1A` | No tiene | No tiene | No tiene |
| Spectrum | `adobe/spectrum-design-data` `eba428d` (2026-10-08) | `packages/tokens/src/color-aliases.json` (`*-background-color-default`) y `color-palette.json` (claro) | Apache 2.0 | `#D73220` (negative) | `#FC7D00` (notice) | `#05834E` (positive) | `#3B63FB` (informative) |

Notas:

- Primer no tiene rol info: su `accent` es el color de enlaces y elementos interactivos, así que no se cuenta. Polaris y Carbon tienen además un aviso amarillo (`caution` de Polaris, `#FFE600`, tono 101; `caution.minor` de Carbon) y Carbon uno naranja (`caution.major`, tono 51); se toma el rol que el sistema llama warning o, en Carbon, `support.warning`.
- Atlassian no está en GitHub y Radix y Tailwind CSS no tienen roles semánticos: no entran.
- `npm` no es accesible desde el entorno de prueba; todo se leyó de los repositorios.

## 2. Márgenes de tono

Tono H de oklch de los colores de §1, con las conversiones de `scales.mjs`:

| Rol | Sistemas | Tonos | Margen | Mediana | Paletas de Tailwind CSS dentro | Por defecto | Fuera, la más cercana |
|---|---|---|---|---|---|---|---|
| danger | 9 | 21, 24, 24, 25, 26, 26, 26, 28, 30 | 21 a 30 | 26 | red (25) | red | rose (16), a 5° |
| warning | 7 | 43, 52, 75, 76, 81, 85, 90 | 43 a 90 | 76 | orange (48), amber (70), yellow (86) | amber | red, a 18° |
| success | 8 | 138, 143, 148, 148, 157, 157, 161, 168 | 138 a 168 | 152 | green (150), emerald (162) | green | lime (131), a 8° |
| info | 5 | 218, 241, 259, 263, 267 | 218 a 267 | 259 | sky (237), blue (260) | blue | cyan (215), a 3° |

La paleta por defecto es la candidata más cercana a la mediana. Coincide con las del curso (S18: `red`, `amber`, `blue`) salvo en success, que en S19 era `emerald`. Lo que dicen los datos:

1. **Danger no tiene margen.** Los nueve sistemas ponen el error en 9 grados. No hay otro rojo que un sistema real use como danger.
2. **Warning es el más ancho**: de naranja (Fluent 2, Spectrum) a amarillo (Carbon, Bootstrap).
3. **Info no es un color reservado.** Ant Design usa el mismo hex para `colorPrimary` y `colorInfo`; en Carbon, el color interactivo es blue 60 y el de info blue 70.

## 3. Regla

**Propuesta.** Cada rol es una paleta de Tailwind CSS remuestreada a N pasos (A4), con su tono y su croma, sin atarlos a la marca: es la variante T de `exploracion-semanticas.md`, la única que no deja roles grises con marcas grises ni saca un rol de su tono. El usuario puede cambiar el color de un rol; entonces se trata como una marca (método C, decisión 4; con el método D, el de §0 de `funcionalidades.md`).

**Colisión.** La marca colisiona con un rol si el ΔE de oklab entre la marca y la escala del rol en la L de la marca es menor que 0,05 (con el método D, a la misma luminancia relativa: §6). Es algo menos que la distancia más pequeña entre dos paletas candidatas de un mismo rol (amber y yellow, 0,053 en el paso central; con el método D, 0,042: §6), y 2,5 veces la diferencia apenas perceptible que usa CSS Color 4 en su algoritmo de ajuste a la gama (0,02 en OkLCh; `w3c/csswg-drafts` `4f200bd`, `css-color-4/Overview.bs`). Es provisional (decisión 21): se revisa con las pantallas (B3) y la prueba de exportaciones (C5).

**No se comprueba** si la marca no tiene croma o si está en un extremo (el aviso F12.2, decisión 9; con el método D, decisión 35): en los extremos todas las paletas se acercan al blanco o al negro y el ΔE no distingue tonos. Con la exploración, la crema "colisionaba" con los cuatro roles a la vez (ΔE de 0,015 a 0,049 con las ocho paletas).

**Solo danger, warning y success** (decisión 23). Info no se comprueba: los sistemas usan para info el color de marca o su tono (§2 punto 3).

**Si colisiona**, se propone la candidata del margen más alejada de la marca que no colisione con ella ni con los roles ya elegidos (en orden danger, warning, success, info). Si no hay ninguna, se mantiene la de por defecto y se avisa.

## 4. Resultados (método C)

**Los 13 colores de prueba** (N = 11; ΔE con la paleta por defecto en la L de la marca):

| Marca | danger | warning | success | info | Resultado |
|---|---|---|---|---|---|
| Rojo puro | 0,025 | 0,178 | 0,377 | 0,415 | Aviso en danger |
| Rosa pastel | 0,036 | 0,098 | 0,198 | 0,085 | Aviso en danger |
| DesignToken101 | 0,275 | 0,228 | 0,081 | 0,199 | Sin cambios |
| Naranja | 0,068 | 0,089 | 0,313 | 0,341 | Sin cambios |
| Amarillo | 0,171 | 0,109 | 0,151 | 0,237 | Sin cambios |
| Azul marino, casi negro, crema | | | | | En un extremo: no se comprueba |
| Gris puro | | | | | Sin croma: no se comprueba |

Los demás (azul puro, violeta, verde azulado, gris azulado) no se acercan a ningún rol (ΔE mínimo 0,081). En la exploración colisionaban 4 de 13 con T (rojo, azul marino, rosa pastel y crema); azul marino y crema salen ahora por estar en un extremo.

**Barrido de sRGB** (cada 17 en cada canal: 3.582 de 4.096 colores con croma y fuera de los extremos):

| Rol | Colisiona con la paleta por defecto | Resuelto con otra paleta | Aviso sin alternativa |
|---|---|---|---|
| danger | 225 | 0 | 225 |
| warning | 172 | 165 (orange 105, yellow 60) | 7 |
| success | 398 | 264 (emerald) | 134 |
| info | No se comprueba (con la regla de la propuesta: 172, 125 resueltos con sky, 47 avisos) | | |

Las paletas por defecto distan entre sí de 0,213 (red y amber) a 0,398 (amber y blue) en el paso central, y la alternativa más cercana a otro rol es orange frente a red (0,116). Con 11 pasos, el primer paso con contraste 4,5 con blanco es 600 en red y blue y 700 en las demás candidatas, igual con cualquier marca.

## 5. Decisión

2026-10-10. Oscar sigue las recomendaciones de Claude en las preguntas 1 a 4 y decide que las semánticas entran en la versión 1 (si en el desarrollo no convencen, se ocultan o se quitan). Recomendaciones, con su motivo:

1. **Umbral 0,05 y sin comprobar marcas sin croma o en un extremo** (decisión 21, provisional). Las dos colisiones de los 13 colores son reales en el sentido que importa: el rojo puro es un rojo de danger (tono 29, dentro del margen de 21 a 30), y el rosa pastel tiene casi la L del paso 200 de red (0,880 frente a 0,885), así que en esa L la marca y danger son casi el mismo color (ΔE 0,036). Comprobar los extremos daría avisos falsos en los cuatro roles a la vez (crema). El umbral no tiene una validación perceptual propia, por eso queda provisional.
2. **Alternativas: orange o yellow para warning, emerald para success** (decisión 22). Todas están dentro del margen que usan los sistemas reales, así que se reconocen como su rol por construcción.
3. **Danger con marca roja: se mantiene red y se avisa** (decisión 22). Los nueve sistemas usan un rojo entre 21 y 30; rose (16) no lo usa ninguno y un danger rosa es justo el cambio de significado que la exploración quería evitar. El aviso recomienda no depender del color: WCAG 2.2, criterio 1.4.1 (nivel A), pide que el color no sea el único medio para transmitir información, así que danger debe ir con icono y texto.
4. **Info sin comprobación de colisión** (decisión 23). Ant Design usa el mismo hex para primario e info y Carbon el mismo tono; avisar contradiría lo que hacen los sistemas.

Además (decisión 24): si el usuario elige su propio color para un rol, la app no lo cambia; avisa si colisiona con la marca (danger, warning y success) o con otro rol activo, y pone una nota si su tono está fuera del margen del rol. Funcionalidades F20 a F23 de `funcionalidades.md`.

## 6. Con el método D (paso A7)

2026-10-11. Con la decisión 30, cada rol es su paleta de Tailwind CSS sobre la escalera de luminancia (`funcionalidades.md` §0): conserva su tono y la forma de su croma, y cada paso tiene el mismo contraste que el mismo paso de la marca y de los neutros. La colisión se mide con el color del rol de la **misma luminancia relativa** que la marca, no de la misma L (decisión 37, provisional). Márgenes, candidatas, umbral y regla de §2 y §3 no cambian. Script: `comparacion/a7.mjs` punto 6.

| | A5 (método C) | A7 (método D) |
|---|---|---|
| 13 colores de prueba | Aviso en danger para rojo puro (ΔE 0,025) y rosa pastel (0,036); los demás sin cambios | Igual: rojo puro (0,024) y rosa pastel (0,036) |
| Colores del barrido que se comprueban | 3.582 | 3.402 (el aviso de extremo de la decisión 35 deja fuera más colores) |
| danger | 225 avisos | 217 avisos |
| warning | 165 resueltos (orange 105, yellow 60), 7 avisos | 164 resueltos (orange 103, yellow 61), 5 avisos |
| success | 264 resueltos (emerald), 134 avisos | 255 resueltos (emerald), 128 avisos |
| Primer paso con AA sobre blanco, 11 pasos | 600 en red y blue, 700 en las demás | 700 en las 8 paletas |

Con el método D, dos paletas candidatas de un mismo rol pueden quedar más cerca entre sí que el umbral (amber y yellow, 0,042 en el paso central; antes 0,053). No afecta a la regla, porque dos candidatas de un mismo rol nunca están activas a la vez, pero el argumento de §3 sobre el umbral ("algo menos que la distancia más pequeña entre dos candidatas de un mismo rol") deja de valer: es otro motivo para revisar el umbral en B3 y C5.

Las paletas de rol ya recortaban en sRGB en A5 (las paletas de Tailwind CSS tienen pasos fuera de sRGB), y con el método D algunas recortan más (`a7b.mjs`, 11 pasos): red pasa de 5 pasos (hasta el 4 %) a 7 (hasta el 21 %), blue de 7 (19 %) a 9 (25 %) y green de 3 a 4; amber (11 pasos, del 58 % al 55 %) y yellow (del 59 % al 58 %) quedan casi igual. La nota de recorte (F12.3) vale también para ellas.
