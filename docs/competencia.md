# Competencia: Scale (enlace del 2026-10-11) y color.mcdms.dev

2026-10-11. Oscar pasa dos herramientas para ver cómo se diferencia colorgods y qué puede aportar. Scripts: `docs/comparacion/colorscale.mjs` (§1) y `docs/comparacion/scale-enlace.mjs` (§2) (motor con el método C de `anclaje.mjs`; Scale con el `getColorsList` de `compare.mjs`, `hihayk/scale` commit `69b766b`, `color` 3.0.0). Medidas como en `investigacion-comparacion.md` §1.

## 1. color.mcdms.dev (ColorScale)

Es ColorScale v2.3.1 de Matt McAdams (captura de Oscar del 2026-10-11). Código: `github.com/MattMcAdams/color-scale`, commit `a22ca8f` (2025-11-17), versión 2.3.1 en `package.json`. Licencia GPL 3.0 (archivo `LICENSE`; `package.json` dice "GPU-3.0", errata): no se puede copiar código suyo en colorgods sin publicarlo con la misma licencia. Script: `docs/comparacion/colorscale.mjs`.

### Qué hace (leído en el código)

- **Método:** el de Scale, que su README cita como inspiración. `getColorsList` es el mismo (girar tono, saturar y mezclar con blanco o negro en sRGB con `color` 3.0.0), con una curva de suavizado (`linear` y 21 de `js-easing-functions`) en cada uno de los tres ajustes, por separado en claros y oscuros. Número de claros y oscuros de 0 a 50 cada uno.
- **Gráficos:** luminancia relativa (`luminosity()`), croma de CIE LCh y tono de HSL. No son OKLCH.
- **Información por paso** (opción "Show Advanced Color Information"): hex, rgb, hsl y lch para copiar, y contraste WCAG con blanco y negro. El ratio se muestra redondeado a dos decimales y el veredicto se calcula sin redondear: `#0078D7` con blanco (4,4989) se lee 4,5 y da FAIL.
- **Salida:** copiar todos los hex separados por comas, copiar un SVG con los colores en cuadrados de 72 px para pegar en una herramienta de diseño, y la configuración en JSON (aplicar y copiar). Sin nombres de pasos, sin tokens ni variables CSS.
- **Biblioteca:** guardar configuraciones con nombre, agruparlas, reordenarlas y exportarlas o importarlas en JSON. Se guarda en el navegador (`localStorage`); la página About dice que está estudiando RemoteStorage para sincronizar.
- **Web instalable** (`next-pwa`).

### Medidas

Ajustes de la captura: marca `#0EA5E9` (oklch 0,685 0,148 237; curva propuesta `sky`), 4 oscuros (67 %, giro −10° con `easeInExpo`, saturación +15 %) y 5 claros (79 %, giro 25°, saturación 0).

| 10 pasos | Hex (claro a oscuro) | L | Tono | ΔH máx | Pasos con AA sobre blanco |
|---|---|---|---|---|---|
| ColorScale, captura | `#CCFAF5 #A6F7F5 #80ECF3 #5ADAF0 #34C3EC #0EA5E9 #088AC5 #046FA0 #01517A #002B52` | 0,952 a 0,286 | 188 a 251 | 0,062 | 3 |
| Motor, método C | `#F1F9FE #DFF0FC #B5E0FD #72C9FE #0EA5E9 #0094D3 #0073A5 #005D87 #0E4D6D #073045` | 0,978 a 0,293 | 237 a 238 | 0,001 | 4 |

ColorScale tiene 5 claros y el motor 4: la marca cae en el paso 6 y en el 5. Ambas son monótonas y contienen la marca. Con los ajustes de la captura y con los de por defecto, aplicados a los otros 12 colores de prueba con la marca en el paso del motor: L vuelve a subir en 1 escala, ΔH máximo de 0,002 a 0,067 y paso más claro con L de 0,85 a 0,99. Con los mismos colores, ColorScale se comporta mejor que el enlace de Scale de §2 (2 escalas no monótonas, ΔH hasta 0,113, paso más claro desde 0,74), pero con estos ajustes gira el tono, como pide la captura: los claros van hacia el cian (188).

## 2. Scale con el enlace de Oscar

El enlace se lee con el orden de `defaultState` (`src/utils.js`): 5 oscuros, 4 claros, oscuro máximo 58 %, claro máximo 63 %, giro de tono 15° en oscuros y 38° en claros, saturación +16 % en oscuros y +24 % en claros, marca `#0E4C4C`, fondo blanco. Los valores `78/161/192` (r, g, b) no los usa `getColorsList`.

Marca `#0E4C4C`: oklch 0,380 0,059 195. Curva propuesta por `suggest()`: `teal`.

| 10 pasos | Hex (claro a oscuro) | L | Tono | ΔH máx | Pasos con AA sobre blanco |
|---|---|---|---|---|---|
| Scale, enlace | `#A3C0AE #7DA491 #578778 #326A61 #0E4C4C #0B4441 #093C37 #07332D #052B23 #04221A` | 0,781 a 0,227 | 158 a 195 | 0,028 | 7 |
| Motor, método C | `#F0FDFC #C5FAF9 #85F3F2 #14E3E3 #00C5C5 #00A3A3 #007F7F #006363 #0E4C4C #042F2F` | 0,984 a 0,278 | 195 | 0,001 | 4 |

Ambas son monótonas y contienen la marca. Scale con 10 pasos aplicada a los otros 12 colores de prueba (marca en el mismo paso que el motor): 2 escalas no monótonas, ΔH máximo de 0,005 a 0,113 y paso más claro con L de 0,736 a 0,974.

### Lo que dicen las cifras

1. **Scale deja elegir dónde cae la marca; el motor, no.** El enlace pone la marca en el paso 5 de 10, en el centro. El motor la pone en el paso 9 de 10 con cualquiera de las 17 curvas (t* de 0,85 a 0,93), y en el penúltimo con 11 y 12 pasos. Salta el aviso de marca en un extremo (t* = 0,907, regla de la decisión 9), pero su consejo, probar otra curva, no cambia el paso.
2. **Con una marca oscura y apagada, los claros del motor salen mucho más saturados que la marca.** Con `teal`, la proporción de croma es 0,96 y los pasos centrales llegan a C 0,140, más del doble que la marca (0,059); 4 pasos recortan, hasta el 11 %. Cambiar de curva baja la proporción (`blue` 0,40, `violet` 0,31), pero también cambia la forma del croma.
3. **El enlace busca una familia apagada con giro de tono hacia el verde en los claros** (195 a 158). Es una decisión estética que el motor no permite: mantiene el tono por diseño (decisión 1).
4. **Lo que el motor da y Scale no:** fondo casi blanco en el primer paso (L 0,984 frente a 0,781), tono constante, reparto de L de una paleta probada, recorte medido y la misma escala con cualquier N.

## 3. Candidatas que salen de aquí

Resueltas el 2026-10-11 con `direccion.md` (decisiones 30 a 34): la posición elegible se descarta (decisión 31), el tope de croma entra en la versión 1 (F24), el giro de tono y la copia como SVG quedan como candidatas, y revisar una escala existente es la primera candidata después de la versión 1 (`funcionalidades.md` §4). Guardar escalas no pasa a candidata: lo cubre la URL (F18). Lo que sigue es la tabla tal como se propuso.

| Candidata | Por qué | Choca con |
|---|---|---|
| Posición de la marca elegible | §2 punto 1: con marcas oscuras o claras, la única salida hoy es un aviso. Scale y ColorScale la dan (número de claros y de oscuros). | Decisión 4 (se descartó desplazar la curva, método B, para el caso general). Habría que medir B solo como opción del usuario. |
| Tope de croma (no superar el de la marca, o un factor) | §2 punto 2. | Nada cerrado; cambia la proporción de croma de la decisión 4 solo si se activa. |
| Giro de tono opcional en claros y oscuros, en OKLCH, mostrando el ΔH | §2 punto 3: lo usan el enlace de Scale y la captura de ColorScale. | Decisión 1 (mantener el tono), salvo como opción explícita. |
| Revisar una escala existente | Pegar los hex de otra herramienta y obtener las mismas tablas, avisos, nombres y exportación DTCG. Reutiliza F9 a F17 sin motor nuevo. | Nada. |
| Guardar escalas en el navegador | ColorScale tiene biblioteca con grupos y exportación en JSON. En colorgods, los ajustes ya van en la URL (F18), que se puede guardar como marcador. | Nada. |
| Copiar las escalas como SVG o como muestras para pegar en Figma | ColorScale lo hace. Es complementario a la exportación DTCG (F14), no la sustituye: da muestras, no variables. | Nada. |
