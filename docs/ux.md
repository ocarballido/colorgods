# UX de la versión 1 (paso B1)

2026-10-10. Propuesta de Claude; Oscar sigue las recomendaciones el 2026-10-11 (§11, decisiones 25 a 29, 39 a 41). Parte de `funcionalidades.md` (F1 a F26) y del comportamiento de "Generar escalas" de DesignToken101 en `f4885d7` (`src/components/ScaleGenerator.tsx`, `ChromaChart.tsx`, `docs/pruebas-herramientas.md` bloque A, decisiones C22 a C31, D14, D52, V54 y V55), adaptado a N pasos y a varias escalas.

**Actualización del 2026-10-11 (paso A7).** Con el método D (decisión 30), el mismo paso tiene el mismo contraste en todas las escalas. Se añaden la regla de contraste por paso junto a las tiras (F26, §6.3), el tope de croma en los ajustes (F24), el nuevo sentido de la curva (solo la forma del croma, F3) y el nuevo texto de F10; cambian el tiempo de cálculo de U1 y los ejemplos. Con el método D, `#1877F2` cae en el paso 600, no en el 500.

**Actualización del 2026-10-12 (paso B3).** Las pantallas están en Figma, archivo ColorScaleUI, página "Templates": secciones "B3 · Revisión (Claude, 2026-10-12)" (escritorio con las dos pestañas de ajustes, tableta y móvil) y "B3 · Estados (ux.md §8)". Cambian: los anchos de cada disposición (§3.1, decisión 58), los ajustes en dos pestañas (decisión 61), las medidas de las tiras (§6.3, decisión 60) y la tabla de estados (§8, con su pantalla). El resto sigue igual.

Este documento dice qué hay en la pantalla, en qué orden y cómo se comporta. Cómo se ve (colores, tipografía, medidas) es de B2 y B3; los textos de la interfaz son en inglés (decisión 13) y los de aquí son borradores.

## 1. Lo que se propone, en corto

| # | Propuesta | Motivo |
|---|---|---|
| U1 | **El resultado se calcula al momento**, sin botón "Generar". | Con el método C, seis escalas de 30 pasos se recalculaban en 1,5 ms. Con el método D, el prototipo tarda 115 ms y, con tablas, de 22 a 25 ms según la ejecución (Node, `a7b.mjs`); C3 lo optimiza y, si en un móvil de gama media se nota, se calcula en segundo plano (Web Worker), sin cambiar la interfaz. Con cálculo al momento desaparece el estado desactualizado del curso (C27, C30) y con él el pulso, que era un riesgo de accesibilidad aceptado (2.2.2 y 1.4.3). |
| U2 | **El resultado usa siempre los últimos valores válidos.** Un campo con error lo dice y dice con qué valor sigue el resultado; la exportación se bloquea mientras haya errores (como F5 hace ya con el nombre). | Con cálculo al momento no puede haber "sin resultado" (C24 del curso) a cada tecla. Y al escribir se pasa por colores válidos intermedios (`#33C` es `#3333CC`; `51 204 1` es `#33CC01`): no es un error, solo un parpadeo. |
| U3 | **Dos columnas en escritorio** (ajustes a la izquierda, resultado a la derecha) y **una en móvil**. | Con cálculo al momento, el efecto de un ajuste tiene que verse sin desplazarse. |
| U4 | **Tiras de todas las escalas a la vista y una tabla cada vez**, elegida con pestañas. | Con cuatro roles y 30 pasos serían seis tablas y 180 filas seguidas. Las tiras permiten comparar todas; la tabla da el detalle de una. |
| U5 | **Avisos y notas en una lista única** encima de las tiras, cada uno con el nombre de su escala y un enlace a su fila. | Con las tablas en pestañas, un aviso de una pestaña oculta no se vería. |
| U6 | **"Suggested" como opción** en los selectores de curva y de paleta de cada rol. | Es la forma de volver a la propuesta después de elegir otra; en el curso, elegir la opción sugerida la fijaba. |
| U7 | **El gráfico de la curva (F3) es una línea de tamaño fijo con N puntos**, no una barra por paso. | Con 30 pasos, las barras del curso (una fila de 24 px por paso) medirían más de 700 px. |
| U8 | **Se mantiene el máximo de 30 pasos** (decisión 17, revisada en B3 con la 60). | Con una tabla cada vez (U4), 30 filas son una tabla larga pero única. Con muestras de al menos 24 px, los 11 pasos por defecto caben en todos los anchos (§6.3). |
| U9 | **La regla de contraste por paso (F26) va junto a las tiras**, con una fila que marca en cada paso si el texto sobre blanco y sobre negro cumple AA, y el paso de la marca dicho aparte con su contraste. | Es lo que diferencia a la app (`direccion.md`): que el número del paso diga el contraste en todas las escalas. Tiene que verse sin abrir nada. |

## 2. Flujo

1. Se abre la página: el resultado ya está calculado con los valores por defecto (`funcionalidades.md`, "Valores por defecto") o con los de la URL (F18). El foco no se mueve.
2. El usuario escribe su color. Mientras escribe, la escala, la curva propuesta, el nombre propuesto y los roles propuestos cambian con cada valor válido.
3. Ajusta lo que quiera en cualquier orden: pasos y convención, curva, tope de croma, tinte, nombre, roles.
4. Revisa avisos, tiras con la regla de contraste, el par de contraste y las tablas.
5. Exporta (DTCG, CSS o `@theme`) descargando o copiando, y, si quiere, copia el enlace con los ajustes.

No hay pasos obligatorios ni asistente: todo está en una pantalla.

## 3. Estructura de la pantalla

### Escritorio

Esquema, no diseño: los valores entre llaves son ilustrativos.

```
+--------------------------------------------------------------------------------+
| colorgods                                                     [How it works]   |
+--------------------------------+-----------------------------------------------+
| AJUSTES (h2, columna fija)     | RESULTADO (h2)                                |
|                                | Scales for #1877F2 · 11 steps · Tailwind      |
| Your color        Palette name | names · curve blue      [Copy link] [Export↓] |
| [#1877F2      ]   [blue      ] |                                               |
| ■ Using #1877F2                | AVISOS Y NOTAS (h3)                           |
|                                |  ⓘ {escala}: {nota}               [Show]      |
| Steps             Names        |  ⚠ {escala}: {aviso}              [Show]      |
| [−] [11] [+]      (•) Tailwind |                                               |
| 3 to 16 with      ( ) SDS      | ESCALAS (h3)                                  |
| Tailwind names    ( ) Radix    |  Same contrast at every step in every scale.  |
|                   ( ) Custom   |  Text on white: 700 and darker · on black:    |
|                                |  600 and lighter (AA)                         |
| Chroma curve                   |  white AA  · · · · · · · ✓ ✓ ✓ ✓              |
| [Suggested (blue)        ▾]    |  black AA  ✓ ✓ ✓ ✓ ✓ ✓ ✓ · · · ·              |
|  gráfico: croma por paso, ◆    |  blue    ■■■■■■◆■■■■   ◆ Your color: 600,     |
| [ ] Keep chroma at or below    |                         4.23 with white       |
|     my color's                 |  danger  ■■■■■■■■■■■                          |
|                                |  neutral ■■■■■■■■■■■                          |
| Neutral tint                   |                                               |
| [====●======] 0.5              | PAR DE CONTRASTE (h3)                         |
|                                |  Text [blue 600 ▾]  [⇅]  Background [White ▾] |
| Semantic palettes (fieldset)   |  ┌──────────────────────────┐ {ratio}         |
| [x] danger                     |  │ Aa  Sample text          │ Normal AA {Pass/Fail}
|     Palette [Suggested (red)▾] |  └──────────────────────────┘ …               |
| [ ] warning                    | TABLAS (h3)                                   |
| [ ] success                    |  [ blue ][ danger ][ neutral ]  (pestañas)     |
| [ ] info                       |  Texto de F10                                 |
|                                |  Step | Color | oklch | Hex | White | Black | Clip
|                                |  50   | ■     | …     | …   | …     | …     |
|                                |                                               |
|                                | EXPORTAR (h2)                                 |
|                                |  (•) DTCG for Figma ( ) CSS ( ) Tailwind @theme
|                                |  ┌ vista previa del archivo ──────────────┐   |
|                                |  └────────────────────────────────────────┘   |
|                                |  [Download Value.tokens.json] [Copy]          |
+--------------------------------+-----------------------------------------------+
| How it works (h2): método, fuentes, curvas de Tailwind CSS (MIT), DesignToken101|
+--------------------------------------------------------------------------------+
```

- **Columna de ajustes:** ancho fijo, en un contenedor con fondo `background/neutral/subtle` que ocupa todo el alto entre la cabecera y el pie; su contenido se queda fijo bajo la cabecera al desplazar la página (`position: sticky`) y, si no cabe en la ventana, se desplaza por dentro (decisiones 95 y 107). Con zoom de 400 % (1.4.10) la pantalla ya es la de móvil, con los ajustes en el panel.
- **Columna de resultado:** el resto del ancho. El resumen de arriba (color, N, convención, curva) sigue a lo calculado, no a lo escrito: con un error, dice con qué valores sigue (U2).
- **"How it works"**: sección breve al final de la página con el método (§0 de `funcionalidades.md`: la escalera de contraste, la mediana de las paletas de Tailwind CSS, la marca en el paso de contraste más cercano, la curva como forma del croma y el tope), las fuentes, el crédito de las curvas (A5) y el enlace a DesignToken101 (C6). El texto es de B3.

### 3.1. Anchos (B3, decisiones 58 y 95)

| Ancho de la ventana | Disposición | Margen lateral del resultado | Ancho de la tira (sin nombres) |
|---|---|---|---|
| 1024 px o más | Dos columnas: ajustes (360 px) y resultado | De 32 px a 1024 hasta 80 px a 1480 | 896 px a 1480; 696 px a 1280 |
| Menos de 1024 px | Una columna con el resultado; los ajustes, en un panel modal que se abre desde la cabecera (decisión 95) | 24 px (tableta, 744 en Figma) | 632 px a 744 |
| Menos de 640 px | Una columna, con los cambios de móvil de abajo | 16 px | 328 px a 360, en filas de 8 muestras |

Por debajo de 1024 px, los ajustes van en el panel lateral de las pantallas "MenuOpen" (decisión 95, que sustituye a la 58 en esto): un `<dialog>` modal a todo el alto de la ventana (tapa la cabecera), de hasta 360 px de ancho, con el logotipo y la X arriba y los ajustes sin la tarjeta, sobre un fondo negro al 40 %, que se abre con el botón de menú ("Settings") y se cierra con su botón `li:x`, con Escape o con un clic en el fondo; el foco vuelve al botón de menú. Los ajustes están en dos pestañas, "Main color" (color, nombre, pasos, convención, curva, tope y tinte) y "Semantic palettes" (los cuatro roles), con el patrón de pestañas de §6.5 (decisión 61).

### Móvil

Una columna, en este orden: resultado (resumen, avisos, regla y tiras, par, tablas), exportar, "How it works"; los ajustes, en el panel modal de §3.1 (decisión 95). No hay "Skip to result" ni "Back to settings": el resultado ya va primero, y esos enlaces solo existen en dos columnas, visibles con el foco. Con el panel abierto, la región de estado y la del par siguen hablando (tienen una copia dentro del panel). Las tablas tienen su propio desplazamiento horizontal (C2 del curso); la página no. Desde 640 px, las tiras y las filas de la regla comparten el desplazamiento horizontal cuando no caben. Por debajo de 640 px (decisión 60): las tiras no se desplazan, se parten en filas de 8 muestras con el nombre de la escala encima; no hay filas de checks de la regla, y el nombre de cada paso va dentro de su muestra, en negro o en blanco, el que cumpla AA con ella; el texto de F26 sigue encima de las tiras. Además, los dos selectores del par y el botón "Swap" se apilan, los botones de cada grupo de acciones (resumen y exportar) van uno debajo de otro, a todo el ancho.

## 4. Comportamiento general

- **Cálculo al momento (U1).** Cada cambio válido recalcula todo. La URL se actualiza con `history.replaceState` (sin crear entradas en el historial) tras una pausa en la escritura, así que el enlace de la barra del navegador también sirve; el botón "Copy link" (F18) se mantiene.
- **Últimos valores válidos (U2).** Cada ajuste guarda su último valor válido y el resultado se calcula con esos. Un campo con error muestra, debajo del error, con qué sigue el resultado ("The result still uses #1877F2"). N y convención se validan juntos (F2): si el par no es válido, el resultado sigue con el último par válido. Excepción: con nombres personalizados no válidos (F6.1), el resultado sigue a N y la columna de nombres muestra las posiciones 1 a N con la indicación "Names pending" en su cabecera, para no congelar N mientras se escriben los nombres.
- **Cuándo se ve un error.** Al salir del campo y mientras siga sin ser válido (C22 del curso), y en todos al pulsar Download o Copy. Mientras se escribe por primera vez, no. Se mantiene la solución del curso para que el error no aparezca entre el `pointerdown` y el `pointerup` y se pierda el clic.
- **Propuestas.** Curva, nombre de la paleta y paleta de cada rol se proponen a partir del color hasta que el usuario elige otra (C25, C26, F21). En los selectores, la primera opción es "Suggested (blue)" y significa "seguir la propuesta" (U6); las demás opciones fijan la elección. El nombre se comporta como en el curso: el propuesto se ve en el campo hasta que el usuario escribe.
- **Exportación bloqueada.** Con algún error en F1, F2, F5, F6.1 o F23, la vista previa del archivo se sustituye por la lista de esos errores con enlaces a sus campos; Download y Copy siguen activos (D14 del curso) y, al pulsarlos, esa lista pasa a ser el resumen de errores y recibe el foco (D52).
- **Sin animaciones** que transmitan información. Las que hay (el panel de ajustes en una columna y el cambio de pestaña de los ajustes, decisión 103) solo acompañan y se quitan con `prefers-reduced-motion`.

## 5. Ajustes

En este orden (el del teclado):

| Ajuste | Control | Comportamiento |
|---|---|---|
| Color (F1) | Campo de texto, `autocomplete="off"`, sin corrector. Debajo, una muestra y "Using #XXXXXX" (`<output>`), como en el curso. | Con error: el mensaje de F1 y "The result still uses #…". |
| Nombre de la paleta (F5) | Campo de texto, al lado del color desde escritorio (V54 del curso). | Error con la regla de F5; no bloquea el cálculo, sí la exportación. |
| Pasos (F2) | Campo de texto con `inputmode="numeric"` (no `type="number"`, como el curso, C22) y dos botones "Decrease steps" y "Increase steps". La ayuda dice el rango de la convención elegida ("3 to 16 with Tailwind names"). | Los botones no pasan del rango. Error de F2 con el máximo de la convención. Si la convención cambia a una con máximo menor, N no cambia y sale el error (F2). |
| Convención (F6) | Grupo de opciones (`radio`): Tailwind, SDS, Radix, Custom. | Con Radix, la nota de F13 debajo del grupo, siempre visible. Con Custom, aparece el campo de nombres. |
| Nombres personalizados (F6.1) | Área de texto: nombres separados por espacios, comas o saltos de línea. Debajo, un contador ("11 names, 11 needed") y dos acciones: "Fill 1 to N" y "Fill multiples of" con un campo para m. | Errores de F6.1 asociados al área de texto. Rellenar sustituye lo escrito; se anuncia "Names filled". |
| Curva de croma (F3) | Selector con la etiqueta "Chroma curve" y la ayuda "Shapes the chroma; contrast doesn't change." (cierto salvo el redondeo a hex, F25): "Suggested (blue)" y las 17 paletas. Debajo, el gráfico (U7). | Ver §5.1. Cambiar de curva no cambia la regla de F26. |
| Tope de croma (F24) | Casilla "Keep chroma at or below my color's", debajo del gráfico, con la ayuda de `funcionalidades.md` §3. | El gráfico y la tira del color cambian; la regla de F26 no. Con un color sin croma (F12.1), la casilla sigue activa y no cambia nada. |
| Tinte de los neutros (F4) | Deslizador nativo de 0 a 1, paso 0,05, con el valor al lado (C23, C29 y C31 del curso). | Con un color sin croma (F12.1), el deslizador sigue activo y debajo se lee "Your color has no hue, so the tint has no effect." |
| Paletas semánticas (F20) | Un `fieldset` con cuatro casillas: danger, warning, success, info. Al marcar una, aparece debajo su selector de paleta: "Suggested (red)", las demás paletas del margen del rol y "Custom color". Con "Custom color", un campo de color como el de F1. | Las notas y avisos del rol (F22, F23) se ven debajo de su selector y también en la lista de avisos (U5). Activar o desactivar un rol añade o quita su tira, su pestaña y sus opciones en el par. |

### 5.1. Gráfico de la curva

- Línea del croma de cada paso de la escala del color, de claro a oscuro, con un punto por paso (los N pasos) y el paso de la marca destacado con su color y la etiqueta "Your color" en texto. Tamaño fijo, sea cual sea N. Con el tope de croma (F24), el gráfico muestra la escala con el tope y una línea horizontal en el croma de la marca.
- Eje del croma fijo: el mayor de las 17 curvas, como en el curso, para que al cambiar de curva se puedan comparar.
- Alternativa en texto (F3): una lista oculta visualmente, un elemento por paso ("600, chroma {C}" y ", your color" en el de la marca), como `ChromaChart` del curso. El gráfico en sí es decorativo (`aria-hidden`).
- Pie: qué muestra y el crédito de las curvas (Tailwind CSS, MIT).

## 6. Resultado

### 6.1. Resumen

Una línea con lo calculado ("Scales for #1877F2 · 11 steps · Tailwind names · curve blue · tint 0.5", "· chroma cap" si está activado y "· Roles: danger, warning" con roles activos, decisión 83; en la app, una fila de celdas, decisión 68), "Copy link" y un enlace a la exportación ("Go to export", decisión 88). "Copy link" confirma con "Link copied", anunciado (F17, F18).

### 6.2. Avisos y notas (U5)

- Una lista, en este orden: avisos (sin croma, extremo, colisiones de roles y roles parecidos) y luego notas (recorte, pasos muy juntos, rol cambiado, fuera de margen). Cada elemento empieza con el nombre de la escala y lleva un icono con texto alternativo ("Warning" o "Note"), no solo color.
- Los que señalan una fila llevan "Show in table": selecciona la pestaña de esa escala y lleva el foco a la primera fila nombrada; el aviso de extremo, a la fila de la marca, como en Figma; el de sin croma no lo lleva (decisión 78). Va en línea al final del texto del aviso (decisión 96).
- Sin avisos ni notas, la sección no aparece.
- Casos de F12 con los colores de prueba: `#808080` da solo el aviso sin croma (F12.1); `#1A2B5C` da el aviso de extremo con cualquier N (F12.2), y con él se sugiere el tope de croma; `#0000FF` con 11 pasos da la nota de recorte en 9 pasos (F12.3); `#F5F5DC` con 11 pasos da la nota de pasos muy juntos (F12.4).

### 6.3. Regla de contraste y tiras (U9)

- **Encima de las tiras**, el texto de F26 ("Same contrast at every step in every scale. Text on white: 700 and darker. Text on black: 600 and lighter (AA)." y, en una línea más discreta, el nivel 3 para texto grande y componentes), que se recalcula con N, la convención y los roles activos.
- **Dos filas de marcas** (desde 640 px; en móvil, ver §3) alineadas con las columnas de los pasos: "White AA" y "Black AA", con "✓" en los pasos que cumplen en todas las escalas y nada en los demás. Cada marca tiene texto para el lector de pantalla (las filas se leen como una lista: "White AA: 700, 800, 900, 950"). El nivel 3 (texto grande y componentes) va en el texto, no en filas, para no cargar la vista.
- **Tiras:** una fila por escala, en el orden color, danger, warning, success, info, neutros: el nombre de la paleta y N muestras de claro a oscuro.
- La muestra de la marca lleva una marca visual (✓) y su contraste se dice en texto en la línea de debajo de las tiras (F7, F26, 1.4.1): su contraste es el suyo, no el de la fila de marcas. (Corregido en C4, parte 2, decisión 73: decía "Your color: 600, 4.23 with white" junto a la tira, lo mismo que la línea de debajo; se sigue Figma, que solo tiene la línea.)
- Las muestras no son interactivas. Cada tira se lee como una imagen con un texto alternativo corto ("blue, 11 steps from 50 to 950; your color is 600"): los valores están en la tabla.
- Cada muestra mide como mínimo 24 px de ancho (cabe la marca de la regla, de 20 px, y un nombre de tres cifras) y 64 px de alto. Si no caben, la tira tiene su propio desplazamiento horizontal, compartido con las filas de marcas. Caben 37 muestras a 1480, 29 a 1280 y 26 a 744 (decisión 60). En móvil, filas de 8 muestras (ver "Móvil" en §3).
- Debajo de las tiras, una línea dice qué marca la marca visual: "✓ marks your color: blue 600. It keeps your exact color, so its contrast is its own: 4.23 with white, 4.95 with black. It isn't counted in the rule above."


### 6.4. Par de contraste (F11)

- Dos selectores nativos, "Text" y "Background", con las opciones agrupadas por escala (`optgroup`: blue, danger…, neutral) más White y Black. Por defecto, la marca sobre blanco. Un botón "Swap".
- Una muestra con texto normal y texto grande en el par, el ratio truncado a dos decimales (decisión 12) y los cinco niveles de F11 con "Pass" o "Fail" en texto.
- El resultado del par está en una región `aria-live="polite"`: al cambiar un selector, se anuncia el ratio y cuántos niveles cumple.
- Si se desactiva un rol cuyo paso está en el par, el par vuelve al de por defecto y se dice ("The pair was reset because danger was turned off").
- Si un cambio de N o de convención cambia el nombre del paso elegido, el par se queda en la misma posición de la escala (el paso k) y el selector muestra el nombre nuevo. Si N baja por debajo de k, el par va al último paso (decisión 81).

### 6.5. Tablas (U4)

- Pestañas con el patrón ARIA de pestañas (flechas para moverse, activación al momento): una por escala, con el nombre de la paleta y, si tiene avisos o notas, su número ("danger, 1 warning").
- Encima de la tabla, el texto de F10, visible siempre.
- Columnas de F9: nombre del paso, color, `oklch()`, hex, contraste con blanco, contraste con negro, recorte. La fila de la marca dice "Your color" en la columna del nombre, y la del color propio de un rol, "Your danger color" (decisión 83).
- La tabla tiene su propio desplazamiento horizontal; el contenedor es enfocable con teclado y tiene nombre ("blue table"), para poder desplazarlo sin ratón. Las dos primeras columnas se quedan fijas al desplazar.
- Al cambiar de escala por "Show in table", la pestaña cambia y el foco va a la fila.

## 7. Exportar

- Grupo de opciones: "DTCG for Figma" (F14), "CSS" (F15), "Tailwind @theme" (F16). Por defecto, DTCG.
- Vista previa del archivo en un bloque de código de solo lectura, con su propio desplazamiento y el nombre del archivo encima.
- "Download" (con el nombre del archivo en el botón) y "Copy". Copy confirma con "Copied", anunciado (F17). Archivos: `Value.tokens.json`, `colors.css` y `theme.css`; el CodeBlock lleva también el botón de copiar de Figma en su cabecera (decisión 86).
- Con errores, ver §4 "Exportación bloqueada".
- Se exportan todas las escalas visibles en las tiras (color, roles activos, neutros), con los N pasos (decisiones 11 y 15).

## 8. Estados

| Estado | Qué se ve | En Figma (página "Templates") |
|---|---|---|
| Inicio | Valores por defecto o de la URL, resultado calculado, sin errores. Valores no válidos de la URL: se ignoran en silencio (F18). | "B3 · Revisión": escritorio, tableta y móvil |
| Error de entrada | Error junto al campo, "The result still uses…" y, en Exportar, la lista de errores en vez de la vista previa. El resultado no se atenúa. | "B3 · Estados": "Error de entrada" y "Exportación bloqueada" |
| Avisos | Lista de §6.2, avisos antes que notas; en la tabla, el número en la pestaña; en los roles, también junto a su selector. | "Avisos" (`#1A2B5C`) |
| Recorte | Nota en la lista y porcentaje en la columna de recorte de cada paso. | "B3 · Revisión" (con los valores por defecto ya hay recorte) |
| Tope de croma | Casilla marcada; gráfico con la línea del croma de la marca; "· chroma cap" en el resumen. La regla de F26 no cambia. | "Tope de croma" (`#0E4C4C`, 10 pasos) |
| Rol activado | Su selector, su tira, su pestaña, sus opciones en el par, en la regla de F26 y en la exportación. | "B3 · Revisión": escritorio, pestaña "Semantic palettes" |
| Rol con paleta cambiada por colisión | Selector en "Suggested (orange)" y la nota de F22 debajo. | "Rol con paleta cambiada" (`#F59E0B`) |
| Colisión sin alternativa | Aviso de F22 debajo del selector del rol y en la lista. | "Colisión sin alternativa" (`#DC2626`) |
| Rol con color propio | Campo de color; avisos y notas de F23 debajo. Un color no válido, error de F1 junto al rol. | "Rol con color propio" |
| Sin croma | Aviso F12.1; nota en el tinte; tira del color en gris; sin aviso de extremo ni comprobación de colisión (F22). | "Sin croma" (`#808080`) |
| Radix | Nota de F13 debajo de la convención; la ayuda de pasos dice "3 to 30 with Radix names". | "Convención Radix" |
| Nombres personalizados | Campo de nombres con su error y las acciones de rellenar; con nombres no válidos, la tabla dice "Names pending". | "Nombres personalizados" |
| Copiado | "Link copied" o "Copied" unos segundos, anunciado. | "Copiado" |
| Muchos pasos en móvil | Filas de 8 muestras con el nombre de cada paso dentro, sin filas de checks. | "30 pasos en móvil" |

## 9. Teclado y lector de pantalla (WCAG 2.2 AA)

- **Orden:** en dos columnas, "How it works" de la cabecera y el enlace para saltar al resultado (decisión 67), ajustes en el orden de §5, resultado (resumen, avisos, regla y tiras, par, pestañas y tabla), exportar. Por debajo de 1024 px, "How it works", el botón "Settings" (abre el panel de ajustes, donde el foco queda atrapado) y el resultado, sin enlaces de saltar (decisión 95). Encabezados: h1 (el logotipo, con el texto alternativo "colorgods", decisión 97), h2 Settings, Result, Export, How it works; h3 dentro de Result.
- **Campos:** etiqueta visible, ayuda y error asociados con `aria-describedby`; `aria-invalid` con error.
- **Anuncios:** una región `role="status"` resume el resultado tras una pausa en los cambios ("Scales updated: 11 steps, 1 warning, 2 notes"; con roles activos, "11 steps, 2 semantic palettes, …") y nombra los avisos nuevos, para cumplir F12 sin anunciar a cada tecla. La pausa empieza en unos 500 ms y se ajusta en C4. El par y las confirmaciones de copia tienen su propia región.
- **Foco:** no se mueve al calcular. Solo se mueve con acciones del usuario: "Show in table", el resumen de errores al exportar con errores, los enlaces de saltar y el panel de ajustes (al abrirlo entra en él; al cerrarlo vuelve al botón "Settings" o, si se cerró al pasar a dos columnas, a la columna de ajustes).
- **Color:** la marca, los roles, los avisos, los niveles de contraste y las marcas de la regla llevan texto (F19, 1.4.1). Las muestras de color no tienen borde, como en Figma; con colores forzados llevan un contorno del sistema. Oscar asume el riesgo el 2026-10-13: el paso más claro casi no se distingue del blanco (decisión 75, que sustituye al borde de C21 del curso).
- **Objetivos:** todos los controles de al menos 24 × 24 px (2.5.8).
- **Colores forzados:** bordes, foco, casillas, las marcas de la regla y el paso de la marca visibles.

## 10. Comprobaciones para C4

Además de los criterios de `funcionalidades.md`:

1. Al escribir `#33CC99` letra a letra, el resultado cambia en `#33C` y en `#33CC99`, y la región de estado anuncia una vez, al final.
2. Con `#33CC9`, al salir del campo: error y "The result still uses #…"; la exportación muestra la lista de errores; el resultado no cambia.
3. Con Radix y 25 pasos, cambiar a Tailwind: error en pasos con el máximo 16; el resultado sigue con 25 pasos y nombres de Radix.
4. Con Custom y 11 nombres, pasar a 12 pasos: error de nombres, la escala tiene 12 pasos y la columna dice "Names pending".
5. "Suggested" en la curva: elegir `green`, cambiar el color (la curva se queda en `green`), volver a "Suggested" (la curva sigue al color).
6. "Show in table" de un aviso de danger con la pestaña de blue abierta: se abre danger y el foco va a la fila.
7. Recalcular con seis escalas de 30 pasos en un móvil de gama media sin retraso perceptible (U1); si lo hay, el cálculo pasa a segundo plano.
8. Con `#1877F2` y 11 pasos: la regla dice "Text on white: 700 and darker" y la línea de debajo de las tiras, "✓ marks your color: blue 600 … 4.23 with white" (decisión 73); al cambiar de curva o activar el tope, la regla no cambia y la tira del color sí.
9. Con `#0E4C4C` y 10 pasos, activar el tope: el gráfico baja a la línea del croma de la marca y "Chroma cap" aparece en el resumen (una celda, decisión 68) y `cap=1` en la URL.

## 11. Preguntas para Oscar

Respondidas el 2026-10-11: Oscar sigue las recomendaciones de 1 a 4 y 6. Para la 5, sin recomendación previa, Claude recomienda que sí, con los criterios de Oscar (decisión 40). Propuesta de wireframe: la A (decisión 41).

1. **Cálculo al momento (U1)** en vez del botón del curso. Es la recomendación: quita el estado desactualizado y su pulso. El precio es el parpadeo con colores intermedios al escribir y, con el método D, optimizar el cálculo en C3.
2. **Últimos valores válidos (U2)**, sin atenuar el resultado cuando hay un error.
3. **Tiras más una tabla por pestañas (U4)** y **lista única de avisos (U5)**. La alternativa es apilar todas las tablas, que con roles y muchos pasos se hace muy larga.
4. **Máximo de 30 pasos (U8)**: se mantiene hasta ver las pantallas en B3.
5. **Sección "How it works"** al final de la página, con el método, las fuentes y el crédito de las curvas. ¿Dentro de la versión 1?
6. **Regla de contraste junto a las tiras (U9)**, con el texto y dos filas de marcas (blanco y negro). La alternativa es solo el texto, sin filas.
