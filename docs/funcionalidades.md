# Funcionalidades por versión (pasos A3 y A7)

2026-10-09. Propuesta de Claude, aprobada por Oscar el 2026-10-10 con las respuestas de §5. Desarrolla la decisión 2 (alcance de la versión 1) con un criterio de aceptación por funcionalidad, y lista las candidatas para versiones siguientes. Comportamiento del curso leído en DesignToken101 `f4885d7` (`tools/scales.mjs`, `src/components/ScaleGenerator.tsx`, `messages/es.json`). Las paletas semánticas (F20 a F23) se añaden el 2026-10-10 con el paso A5 (decisiones 19 a 24, `semanticas.md`).

**Actualización del 2026-10-11 (paso A7).** Se aplica la dirección de `direccion.md` (decisiones 30 a 34): el paso es un nivel de contraste en todas las escalas (método D), con tope de croma opcional. Cambian F2, F3, F7, F8, F10, F12.2 a F12.4, F13, F18, F21 a F23, los valores por defecto, §2 y §3; se añaden F24 a F26 y las preguntas de §6, respondidas el mismo día. Prototipo del método: `docs/comparacion/metodo-d.mjs`; medidas, en la misma carpeta: `a7.mjs` (salida en `a7-salida.txt`) y `a7b.mjs` (salida en `a7b-salida.txt`); hex de referencia para C3: `a7-fixtures.json`. Las medidas anteriores siguen en `avisos.mjs`, `rango.mjs`, `limite.mjs` y `roles.mjs`, pero describen el método C.

Este documento dice **qué** hace la app y cómo se comprueba. Cómo se ve y en qué orden se usa es de B1 (`ux.md`).

## 0. El método en corto

Para N pasos, el paso k está en la posición t = k / (N − 1). Cada paso tiene, en **todas** las escalas (la del color, la de cada rol y la de neutros), la misma luminancia relativa (la Y con la que WCAG calcula el contraste): la de la **escalera**, que en cada t es la mediana de Y de las 17 paletas de color de Tailwind CSS (L y C remuestreados con PCHIP, A4). Así, el mismo paso tiene el mismo contraste en todas las escalas. En cada escala cambian el tono y el croma:

- **Color:** tono de la marca; croma de la curva elegida (F3) en la L del paso, por la proporción de croma de la decisión 4 (croma de la marca entre el de la curva en la L de la marca). La marca sustituye al paso de Y más cercana (medida en log Y; empates hacia el más claro) y conserva su hex, así que ese paso tiene su propio contraste.
- **Rol:** la paleta de Tailwind CSS del rol, con su tono y su croma en la L del paso.
- **Neutros:** croma de `gray` de Tailwind CSS en t, por el tinte (F4), con el tono de la marca.

La L de cada paso se busca para que el color, ya ajustado a sRGB, tenga la Y de la escalera. Si no cabe en sRGB, se reduce el croma (recorte, F12.3).

## 1. Versión 1

### Entrada

| ID | Funcionalidad | Criterio de aceptación |
|---|---|---|
| F1 | **Color de marca** en hex (`#RGB`, `#RRGGBB`, con o sin `#`), RGB (`rgb(51, 204, 153)` o `51 204 153`) o HSL (`hsl(160 60% 50%)` o con comas). Es `parseColor()` del curso. | Las formas anteriores dan el hex en mayúsculas; cualquier otra cosa da un error que dice qué formatos se aceptan, y no se calcula nada con ella. Se muestra el hex con el que se calcula. |
| F2 | **Número de pasos N**, entero desde 3. El máximo depende de la convención (decisión 17): Tailwind 16, SDS 19, Radix y personalizada 30. Por defecto, 11. | Fuera de rango o no entero: error, sin resultado; el error dice el máximo de la convención elegida. Si el usuario cambia a una convención con un máximo menor que su N (25 pasos con Radix y pasa a Tailwind), N no cambia solo: sale el mismo error. |
| F3 | **Curva de croma**: una de las 17 paletas de color de Tailwind CSS 4.3.3. Da la forma del croma de la escala del color a lo largo de la luminosidad; la luminosidad de cada paso la da la escalera (§0), no la curva. Por defecto, la que propone `suggest()` por el tono (C25 del curso), marcada como propuesta; el usuario puede elegir otra. Un gráfico muestra el croma de cada paso de la escala del color (dentro de la versión 1, decisión 14). | Al cambiar el color, la curva propuesta cambia mientras el usuario no haya elegido otra; si la eligió, se mantiene. Cambiar de curva no cambia el contraste de ningún paso. El gráfico tiene una alternativa en texto. |
| F4 | **Tinte de los neutros**, de 0 a 1. Por defecto, 0,5. | 0 da neutros sin tono (croma 0); el valor se ve con su número. |
| F5 | **Nombre de la paleta**: minúsculas, números y guiones, empieza por letra, distinto de `neutral` (`isPaletteName()` del curso) y de los nombres de los roles semánticos (`danger`, `warning`, `success`, `info`; F20), estén activos o no. Por defecto, el que propone `suggest()`. | Un nombre no válido da un error que dice la regla y bloquea la exportación, no el cálculo. |
| F6 | **Convención de nombres de los pasos**: Tailwind, SDS, Radix o personalizada, según la decisión 3 y `nombres.md`. Por defecto, Tailwind. | Tailwind con N = 11: 50, 100 … 900, 950. SDS con N = 10: 100 … 1000. Radix: 1 a N. Ningún nombre repetido de 3 a 16 en Tailwind ni de 3 a 19 en SDS. Personalizada: ver F6.1. |
| F6.1 | **Nombres personalizados**: N nombres escritos por el usuario, o rellenados con "1 a N" o "múltiplos de m" (m entero de 1 en adelante). | Se aceptan letras, números, `-` y `_` (válidos en DTCG, en variables CSS y en clases de Tailwind CSS). Error, que bloquea la exportación, si falta o sobra algún nombre respecto a N (diciendo cuántos hay y cuántos hacen falta), si un nombre tiene otro carácter o si dos nombres son iguales sin distinguir mayúsculas. No hay prefijo: el nombre de la paleta (F5) ya va delante. |
| F24 | **Tope de croma** (decisión 32): casilla "Keep chroma at or below my color's", desactivada por defecto. Con ella, ningún paso de la escala del color supera el croma de la marca; la luminosidad de cada paso no cambia. Solo afecta a la escala del color (no a roles, colores propios de un rol ni neutros). | Con `#0E4C4C` y 10 pasos: cambian 7 pasos, el croma máximo es 0,060 (marca 0,059, la diferencia es del redondeo a hex) y el contraste de cada paso cambia menos de un 1 %. Con `#33CC99`: no cambia ningún paso. Con `#F8C8DC`: cambian 7 pasos y el contraste de cada paso cambia menos de un 2 % (redondeo a hex en los pasos oscuros). La regla de F26 es la misma con y sin tope (`a7b.mjs` c). |

### Resultado

| ID | Funcionalidad | Criterio de aceptación |
|---|---|---|
| F7 | **Escala del color**: N pasos de claro a oscuro con el método de §0 (decisión 30). | El hex de la marca es uno de los pasos y está identificado con texto, no solo con color. De 3 a 30 pasos, la L baja en cada paso y no hay hex repetidos (13 colores de prueba, `a7.mjs` punto 1). Con los 13 colores y N = 11, los hex coinciden con `colors` de `a7-fixtures.json`. La proporción de croma de un color es la misma con cualquier N. |
| F8 | **Escala de neutros con tinte**: N pasos con los mismos nombres que la del color, sobre la escalera (§0); croma de `gray` de Tailwind CSS en t por el tinte, tono de la marca (sustituye a la decisión 10). | De 3 a 30 pasos, la L baja en cada paso y no hay hex repetidos (13 tonos con tinte 0, 0,5 y 1, `a7.mjs` punto 1). Con N = 11 y tinte 0,5, los hex coinciden con `neutrals` de `a7-fixtures.json`. |
| F25 | **Mismo contraste en cada paso** (decisión 30): todas las escalas tienen la misma luminancia relativa en el mismo paso, salvo el paso de la marca. | De 3 a 30 pasos, con los 13 colores, las 8 paletas de rol y los neutros (13 tonos, tinte 0, 0,5 y 1), el contraste con blanco de un mismo paso, sin contar el de la marca, difiere como mucho un 1,5 % entre escalas (medido: 1,4 %, por el redondeo a hex). Con el tope (F24) y con otras curvas (red, blue y yellow para los 13 colores) sigue dentro: 1,47 % (`a7b.mjs` b). |
| F9 | **Tabla de cada escala** (la del color, la de cada rol semántico activo y la de neutros): nombre del paso, color, `oklch()`, hex, contraste con blanco, contraste con negro y recorte. | Una fila por paso, en el orden de la escala. El contraste se calcula sobre el hex, como en el curso (S30). |
| F26 | **Regla de contraste por paso**: un texto junto a las tiras dice, para el N elegido, desde qué paso el texto sobre blanco cumple AA (4,5) y hasta qué paso lo cumple sobre negro, en todas las escalas visibles salvo el paso de la marca; y lo mismo para 3 (texto grande y componentes, criterio 1.4.11). El paso de la marca se dice aparte, con su contraste. | Se calcula con los hex de las escalas visibles, no con la escalera: un paso cuenta solo si cumplen todas. Con N = 11, con y sin tope: texto sobre blanco desde 700, sobre negro hasta 600; con 3, sobre blanco desde 600 y sobre negro hasta 700 (`a7b.mjs` c). Con `#1877F2` y N = 11, la marca cae en 600 y el texto dice que su contraste con blanco es 4,23 (no cumple AA). Con N = 12, si en un paso cumplen unas escalas y otras no (`a7.mjs` punto 2), ese paso no cuenta. |
| F10 | **Explicación del contraste por paso**: un texto junto a las tablas dice que el mismo paso tiene el mismo contraste en todas las escalas, salvo el de la marca, y remite a la regla de F26. | El texto está visible sin abrir nada. |
| F11 | **Contraste del par elegido**: el usuario elige un color de primer plano y uno de fondo entre los pasos de todas las escalas (color, roles activos y neutros), blanco y negro. Por defecto, la marca sobre blanco. Se ve una muestra de texto con el par, el ratio y qué niveles cumple: texto normal (AA 4,5; AAA 7), texto grande (AA 3; AAA 4,5) y componentes y gráficos (3, criterio 1.4.11). | El veredicto se calcula con el ratio sin redondear y el ratio se muestra **truncado** a dos decimales, no redondeado: `#0078D7` con blanco da 4,4989, que redondeado se lee 4,50 y no cumple AA. Lo mismo vale para las columnas de F9 y para F26. Si se desactiva un rol cuyo paso está en el par, el par vuelve al de por defecto y se dice. |
| F12 | **Avisos**, con el texto de §3. | Ver F12.1 a F12.4, y F22 y F23 para los roles. Los avisos se anuncian al lector de pantalla cuando aparecen. |
| F12.1 | *Sin croma*: la marca tiene C ≤ 0,000004. La escala del color sale gris, los neutros sin tinte y no hay aviso de extremo. | Con `#808080`, aparece este aviso y ningún otro; el tinte se ignora y se dice. |
| F12.2 | *Marca en un extremo*: regla de §2, que depende de la luminancia de la marca, no de N ni de la curva. | Avisan azul marino, casi negro y crema, con cualquier N; no avisan los otros 10 colores de prueba. Con N = 11, avisa exactamente cuando la marca cae en 50, 100, 900 o 950 (4.080 colores del barrido, `a7.mjs` punto 3). |
| F12.3 | *Recorte*: pasos en los que el ajuste a sRGB reduce el croma, con su porcentaje. Es una nota, no un error (C25 del curso). Vale para cada escala de color, también las de los roles. | Nombra la escala y, hasta tres, los pasos con la convención elegida; con más, los cuenta (decisión 77); la columna "Recorte" de F9 da el porcentaje de cada uno. Con azul puro y N = 11 da 9 pasos y un máximo del 47 %. Las paletas de rol también recortan, como ya pasaba en A5 (amber: 11 pasos hasta el 58 % en A5 y hasta el 55 % con el método D; `a7b.mjs`). |
| F12.4 | *Pasos muy juntos*: nota (no error) cuando el salto de L entre dos pasos vecinos es menor que el más pequeño de las paletas de Tailwind CSS (0,014, `yellow` 50 a 100). Se mide con la L que el motor da a cada paso (la de la marca en su paso), no con la del hex. Vale para todas las escalas. | Nombra los pasos con la convención elegida (hasta tres pares; con más, los cuenta, decisión 77). Con los 13 colores, las 8 paletas de rol y los neutros de los 13 tonos (`a7.mjs` punto 5 y `a7b.mjs` a): ninguna nota de 3 a 10 pasos; de 11 a 16, solo crema (su marca queda a 0,0134 del paso siguiente); con 17, 6 colores y 3 roles; con 18 y 19, 11 colores, 6 roles y los neutros; con 20 y 30, todas las escalas. |
| F13 | **Nota de Radix** (decisión 3), con el texto de §3. | Visible siempre que la convención sea Radix, junto a la elección de convención. |

### Paletas semánticas

Decisiones 19 a 24 y `semanticas.md`. Cada rol es una escala más con los mismos N, convención y nombres de los pasos que la del color, y la misma escalera (§0); los neutros son los mismos para todas.

| ID | Funcionalidad | Criterio de aceptación |
|---|---|---|
| F20 | **Activar roles**: danger, warning, success e info, cada uno por separado. Todos desactivados por defecto. El nombre de la paleta de cada rol es el del rol. | Un rol activo aparece en las tablas (F9), en el par de contraste (F11), en la regla por paso (F26), en la exportación (F14 a F16) y en la URL (F18); uno desactivado, en ninguno. Activar o desactivar un rol no cambia la escala del color ni la de neutros. |
| F21 | **Paleta propuesta por rol**: una paleta de Tailwind CSS sobre la escalera (§0), con su tono y su croma, sin atarlos a la marca. Por defecto, la del rol (danger red, warning amber, success green, info blue). Si la marca colisiona con ella (F22), otra paleta del margen del rol (warning orange o yellow; success emerald). El usuario puede elegir otra paleta del margen o escribir su color (F23). | Con los 13 colores de prueba: todas por defecto, con aviso en danger para rojo puro y rosa pastel (`a7.mjs` punto 6). En el barrido (3.402 colores con croma y fuera de los extremos), warning pasa 103 veces a orange y 61 a yellow (5 avisos), y success 255 a emerald (128 avisos); danger avisa 217 veces. Con N = 11, el primer paso con AA sobre blanco es 700 en las 8 paletas. La propuesta cambia con la marca mientras el usuario no haya elegido otra para ese rol; si la eligió, se mantiene. |
| F22 | **Colisión con la marca** (danger, warning y success; info no, decisión 23): la marca colisiona con un rol si el ΔE de oklab entre la marca y el color del rol con la **misma luminancia relativa** que la marca es menor que 0,05 (decisión 21, adaptada al método D). No se comprueba si la marca no tiene croma (F12.1) o está en un extremo (F12.2). Si la paleta se cambió, una nota dice por qué; si no hay alternativa, un aviso. | Rojo puro (ΔE 0,024) y rosa pastel (0,036): aviso en danger. Crema, azul marino, casi negro y gris puro: nada. Ningún aviso ni cambio en info con ningún color. Los avisos de danger recomiendan acompañar el color con icono y texto (WCAG 2.2, criterio 1.4.1). |
| F23 | **Color propio para un rol**: en cualquiera de los formatos de F1. Su escala se calcula como la del color de marca (método de §0, curva propuesta por `suggest()`, sin tope) y la app no lo cambia. Aviso si colisiona con la marca (regla de F22, solo danger, warning y success) o si su paso central y el de otro rol activo distan menos de 0,05; nota si su tono está fuera del margen del rol (`semanticas.md` §2). | Un color no válido da el error de F1 junto al rol y bloquea la exportación. Con `#FF0000` en danger y marca `#FF0000`: aviso de colisión. Con `#FF4D80` en danger: nota de fuera de margen. Con red en warning y danger activo: aviso de roles parecidos. |

### Exportación

Se exportan todas las escalas completas (la del color, la de cada rol activo y la de neutros), con los N pasos elegidos. El número de pasos se elige con N (F2); no se añade, además, la columna "Exportar" del curso (D46). La exportación se bloquea mientras haya un error en F1, F2, F5, F6.1 o F23, y se dice cuál. Formatos sin cambios con la decisión 34.

| ID | Funcionalidad | Criterio de aceptación |
|---|---|---|
| F14 | **DTCG para Figma**: la estructura de `toFigmaTokens()` del curso (`color/<paleta>/<paso>` y `color/neutral/<paso>`, sRGB con hex, ocultos al publicar), con los nombres de la convención elegida; cada rol activo como `color/<rol>/<paso>`. Mismo nombre de archivo que en el curso, `Value.tokens.json`. | Se importa en Figma como en §7 del curso (se prueba en C5) y cada variable tiene el hex de la tabla. |
| F15 | **CSS**: variables `--color-<paleta>-<paso>`, `--color-<rol>-<paso>` y `--color-neutral-<paso>` en `:root`, con el hex. | El archivo es CSS válido y cada valor es el hex de la tabla. |
| F16 | **`@theme` de Tailwind CSS 4**: las mismas variables dentro de `@theme`, cada paleta (también las de los roles) precedida de `--color-<paleta>-*: initial;`. | Sin esa línea, una paleta con nombre de Tailwind (la propuesta por `suggest()` siempre lo es, como `green`, y los neutros se llaman `neutral`) solo sustituiría los pasos con el mismo nombre y mezclaría el resto con los de Tailwind; la documentación de Tailwind CSS (Colors, "Disabling default colors") da esa forma para quitar una paleta entera. En C5 se comprueba con una clase que no es de la paleta de Tailwind (como `bg-marca-150`) y con una de Tailwind que la escala no tiene (con N = 5, `bg-neutral-100` ya no existe). |
| F17 | Cada exportación se puede **descargar y copiar**. | Copiar confirma con un mensaje que se anuncia al lector de pantalla. |

### Estado y accesibilidad

| ID | Funcionalidad | Criterio de aceptación |
|---|---|---|
| F18 | **Ajustes en la URL**: color, N, curva (si se eligió), tinte, tope de croma (si está activado), nombre (si se eligió), convención, nombres personalizados y, por cada rol activo, la paleta o el color elegidos. Hay un botón para copiar el enlace. | Abrir el enlace da el mismo resultado. Un valor no válido en la URL se ignora y se usa el de por defecto, como en el curso (`stateFromSearch()`); unos nombres personalizados no válidos vuelven a Tailwind; la paleta o el color no válidos de un rol vuelven a la propuesta. Un N mayor que el máximo de la convención de la URL vuelve a 11. |
| F19 | **Accesibilidad**: la app cumple WCAG 2.2 AA. | Todo se usa con teclado; los errores dicen cómo corregirse y están asociados a su campo; avisos y confirmaciones se anuncian; ninguna información depende solo del color (la marca, los roles, los niveles de F11 y la regla de F26 llevan texto). El detalle es de B1. |

### Valores por defecto

Color: el principal de la identidad de colorgods (B2); mientras no exista, uno de prueba que **no** sea `#33CC99`, que es la marca de DesignToken101 (A5) y es el valor por defecto del curso. N: 11. Curva: la propuesta. Tinte: 0,5. Tope de croma: desactivado. Nombre: el propuesto. Convención: Tailwind. Roles semánticos: desactivados.

## 2. Aviso de marca en un extremo

**Hasta A6 (decisión 9).** El aviso dependía de dónde caía la L de la marca en la curva elegida: saltaba si estaba más cerca de la curva en t = 0,1 que en t = 0,2, o en t = 0,9 que en t = 0,8. Con 11 pasos era la regla del curso (marca en 50, 100, 900 o 950) y no cambiaba con N. La prueba de entonces (`avisos.mjs`) mostró que cualquier regla por posición del paso cambia con N para un mismo color (de 298 a 1.912 de 4.080 colores entre 5 y 15 pasos).

**Con el método D.** La posición de la marca ya no depende de la curva sino de la escalera (§0), así que la regla se escribe sobre ella: **salta si la luminancia relativa de la marca está más cerca, en log Y, de la escalera en t = 0,1 que en t = 0,2, o en t = 0,9 que en t = 0,8** (empates hacia el más claro, como el paso de la marca). No depende de N ni de la curva.

Medidas (`a7.mjs` punto 3):

- Con los 13 colores de prueba avisan los mismos que antes: azul marino, casi negro y crema.
- En el barrido de 4.080 colores avisan 678 (con la decisión 9, 498; los dos a la vez, 476).
- Con 11 pasos, los 678 que avisan tienen la marca en 50 (36), 100 (134), 900 (314) o 950 (194), y ninguno de los que no avisan cae en esos pasos. Es la regla del curso, ahora sin depender de la curva.

El motivo del aviso es el mismo que con el método C: en los extremos, casi todos los pasos quedan a un solo lado de la marca, y la proporción de croma se mide donde la curva tiene poco croma, así que los pasos centrales pueden salir mucho más o mucho menos saturados de lo esperado (con `#0E4C4C`, que cae en el penúltimo paso, los centrales llegan a más del doble del croma de la marca). Ahora la app tiene una salida para eso: el tope de croma (F24).

## 3. Textos

La interfaz es solo en inglés (decisión 13). Borradores; el texto final se ajusta en B1 y B3.

- **Sin croma:** "Your color has no chroma, so it has no hue: the scale comes out gray and the neutrals have no tint."
- **Marca en un extremo:** "Your color is very light (or very dark): almost every step falls on one side of it, and the middle steps may come out much more saturated than you expect. Turn on the chroma cap or try another curve."
- **Pasos muy juntos:** "Steps {a} and {b} are very close in lightness, closer than any two steps in the Tailwind CSS palettes. With fewer steps they will be easier to tell apart." Con más de tres pares, "{n} pairs of neighboring steps are very close…" (decisión 77).
- **Recorte:** "In {step … / steps …}, the calculated color doesn't fit in sRGB, so its chroma is reduced (Clip column). This is common: many steps of the Tailwind CSS palettes don't fit in sRGB either. If the clip is large, try another curve." Sustituido en C4 por la nota por escala de Figma (decisiones 62 y 77): "{scale}: in steps 50, 700 and 800 / in 9 steps / in all 11 steps the color doesn’t fit in sRGB, so its chroma is reduced (Clip column)." y, si recortan todos, "If the clip is large, try another palette."
- **Radix:** "With Radix you get its names, 1 to N, not its scale: your color sits on the step with the closest contrast, not necessarily step 9; lightness and chroma come from Tailwind CSS; and steps 11 and 12 don't have the contrast Radix guarantees. For the Radix scale, use Radix's own colors."
- **Regla por paso (F26):** "Same contrast at every step in every scale. Text on white: {step} and darker (AA). Text on black: {step} and lighter (AA). Large text and UI on white: {step} and darker; on black: {step} and lighter." Y, aparte: "Your color ({step}) keeps its own contrast: {ratio} with white."
- **Contraste por paso (F10):** "Every scale has the same contrast at each step, except your color's step, which keeps your exact color. See the rule above the scales, or check any pair below."
- **Tope de croma (F24):** etiqueta "Keep chroma at or below my color's"; ayuda "For muted colors: the scale stays as muted as your color, with the same contrast at each step." (el contraste cambia como mucho lo que da el redondeo a hex, dentro del margen de F25)
- **Rol cambiado (F22):** "Your color is close to {palette}, the usual palette for {role}, so {role} uses {new palette}, which design systems also use for {role}. You can change it."
- **Colisión sin alternativa (F22):** "Your color is close to {role}, and design systems use this hue for {role}. Don't rely on color alone: show {role} messages with an icon and text."
- **Color propio que colisiona con la marca (F23):** "This {role} color is close to your color, so people may confuse them. Don't rely on color alone: show {role} messages with an icon and text."
- **Roles parecidos (F23):** "{Role a} and {role b} are very close in color. Choose colors that are easier to tell apart."
- **Fuera del margen (F23):** "Design systems don't use this hue for {role}: they use {min}° to {max}° (OKLCH hue)."

## 4. Candidatas para versiones siguientes

Sin orden de prioridad salvo la primera (decisión 34).

| Candidata | Nota |
|---|---|
| **Revisar una escala existente** (primera después de la versión 1) | Pegar los hex de otra herramienta o de un sistema ya hecho y obtener tablas, contraste por paso, avisos, nombres y exportación. Reutiliza F9 a F17. |
| Varias marcas a la vez | Varias escalas con los mismos neutros y N. Con el método D, todas comparten la escalera, así que la regla de F26 vale para todas. |
| Tema oscuro | Escalas o asignación de pasos para modo oscuro, y vista previa en claro y oscuro (el curso la tiene). Con la escalera, la asignación de pasos en oscuro se puede razonar por contraste. |
| Contraste elegido por el usuario | Que el usuario fije el contraste de algún paso (lo que hace Leonardo con todos). Con el método D sería mover la escalera, igual para todas las escalas. |
| Contraste APCA | Antes, comprobar la licencia de su implementación de referencia (decisión 5). APCA salió del borrador de WCAG 3 en 2023 (`direccion.md` §1). |
| Giro de tono por pasos | Lo hacen Scale y ColorScale (`competencia.md`). Choca con conservar el tono de la marca (decisión 1) salvo como opción explícita, en OKLCH y mostrando cuánto se desvía (decisión 33). |
| Otras exportaciones | DTCG 2025.10 con `colorSpace` `oklch` y `hex` de alternativa, CSS con `oklch()`, JSON plano, SCSS. Cada una con su prueba de uso; antes de prometer `oklch` en Figma, probar su importación en C5 (decisión 34). |
| Copiar como muestras o SVG | Para pegar en una herramienta de diseño, como ColorScale. Complementa a F14 (muestras, no variables). |
| Elegir qué pasos exportar | La columna "Exportar" del curso (D46). Con N libre no hace falta en la versión 1. |
| Copiar el valor de una fila | Copiar el hex o el `oklch()` desde la tabla. |
| Otras entradas | `oklch()`, nombres de color CSS. |
| Curvas de otros sistemas | Además de las de Tailwind CSS (decisión 16). Con el método D darían solo la forma del croma; la escalera sigue siendo la de Tailwind. De cada sistema hay que comprobar licencia y datos. |
| Curvas propias | Que el usuario dibuje o pegue su curva de croma. |
| Gama P3 | Escalas fuera de sRGB para pantallas que la admiten. Reduciría el recorte (F12.3). |
| Otros idiomas | La versión 1 sale solo en inglés. El español es el candidato natural (el curso lo tiene). |
| Nombres de los roles | Que el usuario llame a los roles como su sistema (error, critical, negative, caution…). En la versión 1 son danger, warning, success e info. |

Descartada: elegir en qué paso cae la marca (decisión 31). Con el método D, el nombre del paso es su contraste.

## 5. Preguntas para Oscar (A3 y A5)

Respondidas el 2026-10-10:

1. **Idiomas de la versión 1:** solo inglés. Los documentos del proyecto siguen en español; los textos de la interfaz (§3) se escriben en inglés.
2. **Gráfico de la curva (F3):** dentro.
3. **Elegir qué pasos exportar:** fuera. El número de pasos se elige con N (F2).
4. **Curvas de otros sistemas:** fuera de la versión 1; quedan como candidata (decisión 16).
5. **Rango de N:** mínimo 3; máximo 16 con Tailwind, 19 con SDS y 30 con Radix y personalizada (decisión 17), medido con `comparacion/limite.mjs` (nombres) y `rango.mjs`. Con el método D, de 3 a 30 pasos tampoco hay escalas no monótonas ni hex repetidos (`a7.mjs` punto 1).
6. **Nota de pasos muy juntos:** dentro, como F12.4 (decisión 18).
7. **Paletas semánticas (paso A5):** dentro de la versión 1, con las recomendaciones de `semanticas.md` §5 (decisiones 19 a 24).

## 6. Preguntas para Oscar (A7)

Respondidas el 2026-10-11: Oscar sigue las cuatro recomendaciones (decisiones 35 a 38).

1. **Regla de contraste por paso (F26) con dos niveles** (AA 4,5 y 3 para texto grande y componentes) junto a las tiras. Recomendación: sí; es lo que hace visible el valor del método.
2. **Aviso de extremo sobre la escalera** (§2), que con 11 pasos es exactamente "marca en 50, 100, 900 o 950" y no depende de la curva. Recomendación: sí.
3. **Colisión de roles a la misma luminancia relativa** (F22): con los 13 colores da los mismos avisos que antes. Recomendación: sí, con el umbral 0,05 aún provisional (decisión 21).
4. **Tiempo de cálculo.** El prototipo tarda 115 ms en las seis escalas de 30 pasos y, con tablas, de 22 a 25 ms según la ejecución (Node, `a7b.mjs`), frente a 1,5 ms del método C. Recomendación: mantener el cálculo al momento (decisión 25) y que C3 lo optimice (el ajuste a sRGB es lo que más tarda); si en C4 un móvil de gama media nota retraso, calcular en segundo plano (Web Worker).
