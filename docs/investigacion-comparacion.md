# Comparación con Leonardo y Scale (decisiones 1 y 4)

2026-10-09. Prueba propia para cerrar las decisiones 1 y 2 del traspaso. El script es `docs/comparacion/compare.mjs` (en el Project; importa `scales.mjs` desde un clon de DesignToken101 en `f4885d7`); este documento recoge el método, las cifras y lo que se deduce de ellas. El apartado 4 es la prueba del paso A1 (decisión 4), con su propio script, `docs/comparacion/anclaje.mjs`.

## 1. Qué se comparó

Los 13 colores de la tabla de `docs/investigacion-herramientas.md` §5.2 de DesignToken101 (commit `f4885d7`), con 8, 11 y 12 pasos: 39 escalas por herramienta.

| Herramienta | Versión | Cómo se generan N pasos |
|---|---|---|
| Nuestro motor | `tools/scales.mjs` de `f4885d7`, sin cambios | Cada curva (11 valores de L y de C) se interpola con PCHIP (Fritsch y Carlson) y se toman N muestras regulares, como en la prueba del traspaso. Ancla en el paso de L más cercano y proporción de croma, como `build()`. Curva: la que propone `suggest()` (C25). |
| Leonardo | `@adobe/leonardo-contrast-colors` 1.1.0 (etiqueta del repositorio `adobe/leonardo`, commit `ed980a1`) | La marca como único color clave, fondo blanco, WCAG 2. N ratios con la luminosidad HSLuv repartida por igual entre la del primer y la del último paso del motor (lo que hace la acción "Distribute luminosity" de su web, `docs/ui/src/js/ratios.js`). Dos espacios: RGB (el que pone su web por defecto, `docs/ui/src/js/colorScale.js`) y OKLCH. |
| Scale | `hihayk/scale` commit `69b766b` (2020-06-04), `color` 3.0.0 | Su función `getColorsList` sin cambios. Pasos claros y oscuros elegidos para que la marca caiga en el mismo paso que en el motor. Dos ajustes: los del enlace de Oscar de §5.5 y los valores por defecto de Scale. |

Todo se mide igual, sobre el hex de salida y con las conversiones de `scales.mjs`:

- **Saltos de L:** diferencia de L (oklch) entre pasos seguidos; si alguna es cero o negativa, la escala "vuelve a subir".
- **Tono:** ΔH de oklab respecto al tono de la marca, 2 · C · sen(Δh / 2). Mide el cambio de tono que se ve: un giro grande en un paso casi gris da un ΔH pequeño. No usa umbrales.
- **Marca:** si el hex de la marca es uno de los pasos y, si no, la distancia en oklab al paso más cercano.
- **Recorte:** pasos en los que el ajuste a sRGB quita croma, y cuánto. Solo existe en el motor: Leonardo y Scale nunca piden colores fuera de sRGB (mezclan o interpolan dentro de él), así que lo que en el motor es recorte en ellas aparece como cambio de tono o de croma.
- **Contraste:** WCAG 2.2 de cada paso con blanco y con negro.

**Comprobaciones del montaje:**

- Con N = 11 el motor da los mismos hex y el mismo recorte que `build()` en los 13 colores.
- Scale con el enlace de Oscar reproduce §5.5: `#FFE6B3` … `#F1A035` … `#0D0900`, saltos de 0,027 a 0,156, tono de 68 a 95.
- Leonardo da el ratio pedido con una desviación máxima del 1,3 % (806 pasos).

**Dependencias:** el registro de npm no es accesible desde el entorno de prueba, así que las librerías se tomaron de sus repositorios en GitHub en la versión que piden (`chroma-js` v3.2.0, `hsluv` v1.0.1, `apca-w3` 0.1.9, `colorparsley` 0.1.8, `ciebase` 0.1.1, `ciecam02` 0.4.6, `mout` v0.11.1, `color-convert` 1.9.2, `color-string` 1.5.2, `color-name` 1.1.1). `hsluv` se compiló quitando los tipos con `node:module`; `mout` se carga con un adaptador de AMD a CommonJS. Ninguna de las dos interviene en los colores de los modos RGB y OKLCH de Leonardo, salvo `hsluv` para convertir la luminosidad en ratio, como hace su web.

## 2. Resultados

Sobre las 39 escalas de cada herramienta:

| | Motor | Leonardo RGB | Leonardo OKLCH | Scale (enlace §5.5) | Scale (por defecto) |
|---|---|---|---|---|---|
| La marca es un paso | 39 | 0 | 6 | 39 | 39 |
| Distancia de la marca al paso más cercano (mediana; máximo) | 0; 0 | 0,015; 0,055 | 0,016; 0,056 | 0; 0 | 0; 0 |
| ΔH máximo de la escala (mediana; máximo) | 0,001; 0,001 | 0,004; 0,052 | 0,002; 0,058 | 0,005; 0,052 | 0,125; 0,185 |
| Escalas en que L vuelve a subir | 0 | 0 | 0 | 0 | 6 |
| Salto de L mayor entre el menor (mediana; máximo) | 4,3; 10,2 | 1,1; 1,3 | 1,1; 1,3 | 4,1; 31,4 | 2,3; 13,9 |
| L del paso más claro (mín. y máx.) | 0,97 y 0,99 | 0,97 y 0,99 | 0,97 y 0,99 | 0,78 y 1,00 | 0,86 y 0,98 |
| Escalas con recorte | 19 | No aplica | No aplica | No aplica | No aplica |

Ejemplos (de claro a oscuro):

| Azul puro, 8 pasos | Hex | Tono |
|---|---|---|
| Motor (`blue`) | `#F0F5FF #D4E3FF #A7C4FF #6394FF #2964FF #0000FF #032EBB #092262` | 263 a 264 |
| Leonardo RGB | `#F4F4FF #D0D0FF #ACACFF #8989FF #6262FF #3636FF #0000DE #000093` | 264 a 286 |
| Leonardo OKLCH | `#EEF4FF #BDD5FF #8CB4FF #5E93FF #306CFF #033EFF #1400DB #2B0082` | 262 a 282 |
| Scale (enlace §5.5) | `#B3B3FF #8F8FFF #6B6BFF #4747FF #2424FF #0000FF #000086 #00000D` | 264 a 284 |

| Amarillo, 12 pasos | Hex | Tono |
|---|---|---|
| Motor (`yellow`) | `#FFFBEB … #FFD600 … #342A00` | 94 a 96 |
| Leonardo OKLCH | `#FFFCF0 … #6B4300 #593100 #482000` | 54 a 95 |
| Scale (enlace §5.5) | `#FFFFB3 … #FFD600 … #2F2F00 #0D0D00` | 95 a 110 |

### Lo que dicen las cifras

1. **Solo el motor conserva la marca y su tono a la vez.** Scale conserva la marca, pero al mezclar con negro en sRGB el tono se desplaza (el azul va al violeta, el amarillo al oliva). Leonardo no pone la marca en ningún paso en modo RGB (6 de 39 en OKLCH, todos marcas muy oscuras); en OKLCH, al interpolar hacia el negro, el amarillo acaba en marrón anaranjado (tono 54). El motor no pasa de ΔH 0,001 en ninguna escala.
2. **Leonardo reparte la luminosidad por igual; el motor, no.** Los saltos del motor siguen las curvas de Tailwind CSS: pequeños en los claros (fondos) y grandes en el centro. No es un defecto, pero es una elección que hay que explicar. El reparto uniforme de Leonardo viene de los ratios que se le dieron en la prueba: Leonardo no propone una escala tonal, genera el ratio que le pidas.
3. **Leonardo da el mismo contraste en el mismo paso para cualquier tono; el motor, no.** Con 11 pasos, el paso 6 del motor (el `500`) tiene un contraste con blanco de 1,88 a 4,22 según el color. Es lo que hace Tailwind CSS. Es la ventaja real de Leonardo y la app no debe ocultarla.
4. **Scale no garantiza una escala tonal.** Con sus valores por defecto, L vuelve a subir en 6 de las 39 escalas y el tono gira hasta 95 grados. Con el enlace de Oscar es monótona, pero el paso más claro va de 0,78 a 1,00 según la marca y la proporción entre saltos llega a 31.
5. **El recorte del motor depende de N.** El rosa pastel `#F8C8DC` queda anclado en el tercer paso con 8, 11 y 12 pasos, pero la curva remuestreada pone en ese paso un croma distinto y la proporción de croma cambia: 0,54, 0,98 y 1,13. Con 12 pasos recorta 10 pasos (hasta el 14 %); con 11, 2 (hasta el 2 %); con 8, ninguno. Además, en 6 de las 39 escalas el salto de L más pequeño está junto a la marca, porque la marca conserva su L y se acerca a un vecino (crema con 12 pasos: 0,013 frente a 0,024 sin la marca). Las dos cosas pesan en la decisión 4.
6. **Con 11 pasos, el azul puro recorta 9 pasos hasta el 42 %**, la misma cifra que §5.3 de DesignToken101: el remuestreo no cambia el método en N = 11.

## 3. Incongruencia en DesignToken101

En §5.5 de `docs/investigacion-herramientas.md`, la columna "Scale (valores por defecto)" da un salto de L mínimo de 0,003. Es el valor absoluto: con `#F1A035` y los ajustes por defecto, L va 0,743, 0,736, 0,746, 0,769, 0,772, 0,762, es decir, la escala se aclara tres veces seguidas. La fila debería decir que L no es monótona (salto mínimo de −0,023).

## 4. Dónde cae la marca (decisión 4, paso A1)

2026-10-09. Script: `docs/comparacion/anclaje.mjs` (importa `tools/scales.mjs` de `f4885d7` sin cambios; mismo PCHIP que `compare.mjs`). Los mismos 13 colores, N de 5 a 15 y la curva que propone `suggest()`: 143 escalas por método.

### Métodos

| | Qué valores de L tienen los pasos | Proporción de croma |
|---|---|---|
| **A. Ancla actual** | N muestras regulares de la curva; la marca sustituye al paso de L más cercano. | C de la marca / C del paso sustituido. Es lo que hace `build()`. |
| **B. Curva desplazada** | Se busca t* (la posición en la curva cuya L es la de la marca) y el paso k* = redondeo de t* · (N − 1). Las muestras se reparten por igual a cada lado: k* tramos entre el primer paso y t*, y los demás entre t* y el último. El paso k* cae justo en la L de la marca. | C de la marca / C de la curva en t*. |
| **C. Rejilla de A, proporción en la L de la marca** | Como A. | Como B: C de la marca / C de la curva en t*. |

C no estaba en el plan; se añade porque separa las dos cosas que B cambia a la vez (la rejilla y la proporción).

### Resultados

Sobre las 143 escalas de cada método:

| | A | B | C |
|---|---|---|---|
| Variación de la proporción de croma al cambiar N (máximo entre colores) | 1,01 | 0 | 0 |
| Escalas con recorte | 67 | 55 | 55 |
| Pasos recortados (total) | 416 | 349 | 351 |
| Recorte máximo | 47 % | 36 % | 36 % |
| Salto de L mínimo (mediana; peor) | 0,031; 0,008 | 0,030; 0,008 | 0,031; 0,008 |
| Salto de L mayor entre el menor (mediana; máximo) | 4,1; 13,3 | 4,1; 16,4 | 4,1; 13,3 |
| Escalas en que el salto menor está junto a la marca | 20 | 14 | 20 |
| Escalas en que L vuelve a subir | 0 | 0 | 0 |
| Marca en el primer o el último paso | 23 | 22 | 23 |
| Con N = 11, colores que dan los hex de `build()` | 13 de 13 | 1 de 13 | 5 de 13 |
| Con N = 11, distancia oklab máxima a `build()` | 0 | 0,048 | 0,046 |

Proporción de croma con N de 5 a 15:

| Color | t* | A | B y C |
|---|---|---|---|
| DesignToken101 `#33CC99` | 0,414 | 0,82 a 0,85 | 0,82 |
| Rojo puro `#FF0000` | 0,515 | 1,05 a 1,09 | 1,07 |
| Naranja `#FF6B00` | 0,505 | 0,91 a 1,10 | 0,94 |
| Amarillo `#FFD600` | 0,340 | 0,91 a 1,15 | 0,94 |
| Azul puro `#0000FF` | 0,755 | 1,30 a 1,72 | 1,40 |
| Violeta `#7C3AED` | 0,599 | 0,88 a 0,99 | 0,88 |
| Azul marino `#1A2B5C` | 0,978 | 0,99 | 0,88 |
| Verde azulado `#008080` | 0,662 | 0,79 a 1,07 | 0,89 |
| Gris azulado `#607D8B` | 0,617 | 0,24 a 0,33 | 0,26 |
| Gris puro `#808080` | 0,627 | 0 | 0 |
| Casi negro `#111418` | 1 | 0,10 | 0,10 |
| Rosa pastel `#F8C8DC` | 0,228 | 0,54 a 1,27 | 0,80 |
| Crema `#F5F5DC` | 0,139 | 0,25 a 1,26 | 0,35 |

Rosa pastel, por N (proporción; pasos recortados y recorte máximo):

| N | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 0,69; 0 | 0,98; 0 | 1,27; 6 (23 %) | 0,54; 0 | 0,69; 0 | 0,83; 0 | 0,98; 2 (2 %) | 1,13; 10 (14 %) | 0,69; 0 | 0,78; 0 | 0,88; 0 |
| C | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 | 0,80; 0 |

Azul puro con C recorta de 3 a 12 pasos según N, siempre con un máximo del 34 % o el 35 %; con A, el máximo salta entre el 30 % y el 47 %.

**Comprobación del montaje:** A con N = 11 da los mismos hex que `build()` en los 13 colores, y A con 8, 11 y 12 pasos reproduce las cifras de §2 punto 5.

### Lo que dicen las cifras

1. **Lo que hace variar la proporción de croma con N es dónde se mide el croma de referencia, no la rejilla.** En A, la referencia es el croma de la curva en un paso cuya L no es la de la marca, y ese paso se mueve al cambiar N. B y C miden la curva en la L real de la marca, así que la proporción es una propiedad del color y no de N. El rosa pastel pasa de oscilar entre 0,54 y 1,27 a quedarse en 0,80, y deja de recortar con cualquier N.
2. **Desplazar la rejilla (B) no aporta nada sobre C.** Da casi el mismo recorte, el mismo salto mínimo y deforma más el reparto de L (proporción entre saltos de hasta 16,4 frente a 13,3), porque estira un lado de la curva y comprime el otro. Lo único que mejora es que el salto menor queda junto a la marca en 14 escalas en vez de 20; en C esos casos tienen saltos de 0,014 a 0,091, del orden de los demás, y el salto mínimo peor (0,008) no está junto a la marca en C. B, además, cambia más el resultado con N = 11.
3. **C cambia la salida con N = 11 en 8 de los 13 colores.** Los pasos no anclados mantienen su L y cambia solo el croma (la proporción). En DesignToken101, amarillo, violeta, gris puro y casi negro el resultado es idéntico; en rojo, naranja y gris azulado la diferencia es de 0,003 o menos en oklab; en verde azulado 0,010, en azul puro 0,019, en crema 0,022, en azul marino 0,029 y en rosa pastel 0,046. Es incompatible con A3 tal como está escrita ("con 11 pasos y nombres de Tailwind, la app da los mismos hex que el curso").
4. **Ningún método evita que la marca caiga en un extremo** (22 o 23 de 143): depende de la L de la marca (casi negro, crema, azul marino), no del anclaje. El aviso `extreme` sigue haciendo falta.

### Propuesta

Método C: rejilla regular (la curva de Tailwind CSS remuestreada, igual para cualquier marca) y la marca en el paso de L más cercano, con la proporción de croma calculada en la L de la marca. Es un cambio de una línea en `build()` (el denominador de la proporción) más una búsqueda de t* sobre la curva interpolada.

Queda una decisión que es de Oscar, porque choca con A3 (cerrada):

- **C y se reabre A3:** la app y el curso dan hex distintos con 11 pasos en 8 de 13 colores. El curso puede seguir como está o adoptar el mismo cambio.
- **C en la app y en DesignToken101:** A3 se mantiene cambiando el motor del curso y sus pruebas (`tests/fixtures/`), lo que toca una lección ya publicada.
- **A y se mantiene A3:** la proporción de croma y el recorte siguen variando con N (rosa pastel, crema, azul puro), y la app tiene que explicarlo.

No se propone usar A con 11 pasos y C con los demás: la escala cambiaría de carácter al pasar de 10 a 11 y de 11 a 12 pasos.

## 5. Fuentes

- DesignToken101, `github.com/ocarballido/design-tokens-101`, commit `f4885d7`: `tools/scales.mjs`, `tests/scales.test.mjs` (7 pruebas, todas pasan), `docs/investigacion-herramientas.md` §5.
- Leonardo, `github.com/adobe/leonardo`, etiqueta `@adobe/leonardo-contrast-colors@1.1.0`: `packages/contrast-colors/lib/color.js` (espacio por defecto `RGB`), `lib/utils.js` (`createScale`), `docs/ui/src/js/ratios.js`.
- Scale, `github.com/hihayk/scale`, commit `69b766b`: `src/utils.js`, `src/App.js`.
