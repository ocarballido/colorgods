# Exportaciones probadas (paso C5)

2026-10-13. Comprueba que lo que exporta la app se usa donde tiene que usarse: el DTCG en Figma, y el CSS y el `@theme` en una página con Tailwind CSS 4. Los archivos salen del motor de `main` (`614ace6`), con `toFigmaTokens()`, `toCss()` y `toTheme()`, las mismas funciones que usa la interfaz. Script: `docs/comparacion/c5.mjs`.

## 1. CSS y `@theme` (hecho por Claude)

Dos casos, con `#1877F2`:

- **a:** 11 pasos con nombres SDS, danger y warning activos y la paleta llamada `marca` (no es un nombre de Tailwind).
- **b:** 5 pasos con nombres de Tailwind (50, 250, 500, 750, 950) y la paleta llamada `blue`, que sí lo es.

Cómo se comprobó:

1. `node docs/comparacion/c5.mjs` genera los tres archivos de cada caso y compara cada variable con el hex del motor: 44 variables en a y 10 en b, ninguna distinta en CSS, `@theme` ni DTCG.
2. Con `TAILWIND=<ruta al CLI>`, el script compila además una página con `@import "tailwindcss"` y el `theme.css` exportado. CLI: Tailwind CSS 4.3.3, el binario de las *releases* de GitHub (`tailwindcss-linux-x64`), la misma versión que `package-lock.json`. El registro de npm no es accesible desde el entorno de Claude.
3. Las variables que se usan se abrieron en Chromium sin ventana, con `colors.css` y el CSS compilado: los colores calculados por el navegador coinciden con el motor (`marca-350` `#A6C9FC`, `danger-650` `#F71D2F`, `neutral-100` `#F7F8F8`, `marca-650` `#1877F2` y `warning-1000` `#3A2200`). El navegador lee `colors.css` como una regla.

Resultado de la compilación:

| Caso | Clase | Resultado | Lo esperado |
|---|---|---|---|
| a | `bg-marca-350` | Existe, `#A6C9FC` | Un nombre que no es de Tailwind funciona |
| a | `text-marca-1000`, `bg-danger-650`, `bg-warning-100`, `bg-neutral-750` | Existen, con el hex del motor | Roles y neutros con nombres SDS |
| a | `bg-red-500` | Existe, con el color de Tailwind | Las paletas de Tailwind que no se exportan siguen |
| b | `bg-blue-250`, `bg-neutral-250`, `bg-neutral-50` | Existen, con el hex del motor | Pasos de la escala |
| b | `bg-neutral-100` | No existe | `--color-neutral-*: initial;` quita la paleta `neutral` de Tailwind (F16) |
| b | `bg-blue-600` | No existe | Lo mismo con `blue`, que tiene nombre de Tailwind |
| b | `bg-red-500` | Existe | Solo se quitan las paletas exportadas |

Tailwind solo escribe en el CSS final las variables que usa una clase: es lo normal, no falta nada.

## 2. DTCG en Figma (lo hace Oscar)

Archivos en `docs/comparacion/c5/`, con `#1877F2`, 11 pasos, Tailwind, danger y warning (como las pantallas de B3), 44 variables:

| Archivo | Qué prueba |
|---|---|
| `Value.tokens.json` | La exportación de la app tal cual (sRGB con `hex`, F14) |
| `Oklch.tokens.json` | Los mismos colores con `colorSpace` `oklch` y `hex` de alternativa (decisión 34) |
| `OklchNoHex.tokens.json` | `oklch` sin `hex`: dice si Figma lee de verdad `oklch` o solo usa el `hex` |

Pasos, en un archivo de Figma de prueba (como "Generar escalas" del curso, comprobado en octubre de 2026):

1. Arrastra `Value.tokens.json` al panel de variables. Tiene que crear una colección con 44 variables en los grupos `color/blue`, `color/neutral`, `color/danger` y `color/warning`, y un modo `Value`.
2. Comprueba tres variables contra la tabla de la app: `color/blue/600` `#1877F2`, `color/danger/50` `#FFF6F4` y `color/neutral/950` `#23272E`; y que están marcadas como *Hide from publishing*.
3. Repite con `Oklch.tokens.json` y con `OklchNoHex.tokens.json`, cada uno en su colección. Apunta si importa, si da error y, si importa, el valor de `color/blue/600` (tiene que ser `#1877F2`) y el de `color/blue/50` (`#F3F8FF`).

Resultado (Oscar, 2026-10-13, en un archivo de Figma nuevo; cada archivo en su colección nueva, creada antes de arrastrarlo, como dice la ayuda de Figma, "Modes for variables"):

| Archivo | Resultado |
|---|---|
| `Value.tokens.json` | Importa: una colección con las 44 variables en los grupos esperados. F14 cumple. |
| `Oklch.tokens.json` | No importa: "Encountered errors importing 44 tokens". |
| `OklchNoHex.tokens.json` | No importa: el mismo error. |

Figma rechaza `colorSpace` `oklch` aunque el valor lleve `hex` de alternativa. Se mantiene la exportación en sRGB con `hex` (decisión 91).
