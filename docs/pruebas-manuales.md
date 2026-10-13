# colorgods: Guion de pruebas manuales (paso C6)

Pruebas que hace Oscar a mano, sin herramientas de desarrollo, antes de publicar la versión 1. Adaptado del bloque A ("Generar escalas") de `docs/pruebas-herramientas.md` del curso (github.com/ocarballido/design-tokens-101, commit `f4885d7`) y de `docs/ux.md` §10. Lo que el curso probaba y la app no tiene (botón "Generar", resultado desactualizado que pulsa, casillas "Exportar") no está.

Los resultados esperados salen del motor y de los textos de la interfaz en la rama `c6-fuentes`: `node docs/comparacion/c6-guion.mjs` (salida en `docs/comparacion/c6-guion-salida.txt`, calculada el 2026-10-13). Los textos de la interfaz se copian tal cual, en inglés.

## 0. Antes de empezar

- **Dónde:** la página publicada (vista previa de Vercel o colorgods.com, cuando se publique en C6). Donde el guion dice `<página>`, pon esa dirección; por ejemplo, `<página>/?steps=30` es la dirección con `/?steps=30` al final.
- **Cada prueba empieza** en una pestaña nueva con `<página>` sin nada detrás, salvo que la prueba diga otra dirección. Así se parte de los valores por defecto.
- **Navegadores:** Safari, Chrome y Firefox en el Mac; Safari en el iPhone; y un móvil de gama media para la prueba B7 (§2).
- **Cómo apuntar:** marca la casilla si sale lo esperado. Si no, apunta en §10 el número de la prueba, el navegador y qué ha pasado, con una captura si se puede.

## 1. Generar escalas (bloque A del curso)

- [ ] **A1. Abrir la página.** Abre `<página>`.
  Esperado: "Your color" `#1877F2` y debajo "Using #1877F2"; "Palette name" `blue` ("Suggested by the hue"); "Steps" 11; "Names" en Tailwind; "Chroma curve" en "Suggested (blue)"; "Neutral tint" 0.5. El resultado ya está calculado: celdas "Scales for #1877F2", "11 steps", "Tailwind names", "Curve blue", "Tint 0.5". Una nota: "blue: in steps 50, 700 and 800 the color doesn’t fit in sRGB, so its chroma is reduced (Clip column)." La regla dice "Text on white: 700 and darker (AA)" y "Text on black: 600 and lighter". Debajo de las tiras: "✓ marks your color: blue 600 … 4.23 with white, 4.95 with black". El par: 4.23:1 y "Passes 2 of 5 levels".
- [ ] **A2. Formatos del color (F1).** En "Your color" escribe, uno tras otro: `rgb(24 119 242)`, `rgb(24, 119, 242)`, `hsl(214 89.2% 52.2%)`, `24 119 242`.
  Esperado: las cuatro veces, "Using #1877F2" y el resultado no cambia.
- [ ] **A3. Hex corto.** Escribe `#17F`.
  Esperado: "Using #1177FF"; el resultado cambia al momento, sin pulsar nada.
- [ ] **A4. Error al salir del campo.** Escribe `#33CC9` y pulsa Tab.
  Esperado: mientras escribes no hay error; al salir, "Use hex, RGB or HSL, like #1877F2." y "The result still uses #…" (el último color válido). El resultado no cambia. En Export, en vez del archivo, "Fix 1 error to export" con un enlace al campo.
- [ ] **A5. Corregir el error.** Corrige a `#33CC99`.
  Esperado: el error desaparece y vuelve la vista previa del archivo en Export.
- [ ] **A6. Nombre propio.** Escribe `brand-blue` en "Palette name" y cambia el color a `#F40009`.
  Esperado: el nombre se queda en `brand-blue`; la curva sigue en "Suggested" y ahora propone `red`. Prueba después `neutral`, `Brand` y `2brand`: cada uno da error de nombre al salir del campo.
- [ ] **A7. Curva elegida.** Elige la curva `green` y cambia el color.
  Esperado: la curva se queda en `green`. Vuelve a "Suggested": la curva sigue otra vez al color.
- [ ] **A8. Tinte.** Arrastra el pulgar del deslizador, haz clic en un punto de la pista y usa las flechas del teclado.
  Esperado: con las tres cosas el valor cambia, cae siempre en un múltiplo de 0.05 sin salir de 0 a 1 y se lee al lado (por ejemplo, "0.5 / 1"); las flechas lo mueven de 0.05 en 0.05. Con 0, el último paso de neutral es `#272727` (en la tabla de neutral).
- [ ] **A9. Sin croma (F12.1).** Color `#808080`.
  Esperado: un aviso "gray: Your color has no chroma, so it has no hue: the scale comes out gray and the neutrals have no tint."; debajo del tinte, "Your color has no hue, so the tint has no effect."; en el resumen, "Tint 0 (no hue)". El aviso no lleva "Show in table".
- [ ] **A10. Marca en un extremo (F12.2).** Color `#1A2B5C`.
  Esperado: aviso "blue: Your color is very dark: …Turn on the chroma cap or try another curve." y nota de recorte "blue: in step 50 …". "✓" en el 950.
- [ ] **A11. Recorte (F12.3).** Color `#0000FF`.
  Esperado: nota "blue: in 9 steps the color doesn’t fit in sRGB…"; la columna Clip de la tabla de blue da el porcentaje de cada paso.
- [ ] **A12. Pasos muy juntos (F12.4).** Color `#F5F5DC`.
  Esperado: aviso de color muy claro ("yellow: Your color is very light: …") y nota "yellow: steps 50 and 100 are very close in lightness…".
- [ ] **A13. Enlace con los ajustes (F18).** Con `#0E4C4C`, nombre `marca`, 12 pasos, curva `teal`, tope de croma y tinte 0.3, pulsa "Copy link" y pega el enlace en otra pestaña.
  Esperado: el botón dice "Link copied" unos segundos. La pestaña nueva abre con los mismos ajustes y el mismo resultado. Un enlace con solo el color (`<página>/?color=1A2B5C`) propone el nombre y la curva (`blue`).
- [ ] **A14. Descargar y copiar (F14 a F17).** En Export, con cada formato ("DTCG for Figma", "CSS", "Tailwind @theme"), pulsa "Download …" y después "Copy".
  Esperado: se descargan `Value.tokens.json`, `colors.css` y `theme.css`; cada archivo es igual a su vista previa. Al pulsar "Copy" (o el botón del icono de la cabecera de la vista previa), "Copied" aparece unos segundos en esa cabecera, junto al icono; el botón "Copy" no cambia. Lo pegado en un editor es el mismo archivo.

## 2. Comprobaciones de `ux.md` §10

Las 1 a 6, 8 (sin la parte del tope) y 9 se comprobaron en C4 con Chrome manejado por scripts; aquí se repiten a mano, la 8 entera. La 7 no se ha hecho nunca: necesita un móvil real.

- [ ] **B1. Un anuncio al final.** Con VoiceOver activado (§4), borra el color y escribe `#33CC99` letra a letra.
  Esperado: el resultado cambia al llegar a `#33C` y otra vez en `#33CC99`; VoiceOver dice "Scales updated: …" una vez, al dejar de escribir, no a cada letra.
- [ ] **B2. Error y exportación bloqueada.** Es A4: con `#33CC9` y Tab, el error, "The result still uses #…", la lista de errores en Export y el resultado sin cambios.
- [ ] **B3. Máximo de la convención.** Elige Radix, pon 25 pasos y cambia a Tailwind.
  Esperado: error en "Steps" con el máximo 16 y "The result still uses 25 steps with Radix names."; el resultado sigue con 25 pasos y nombres 1 a 25.
- [ ] **B4. Nombres pendientes.** Elige Custom (el campo se rellena con 11 nombres) y pasa a 12 pasos.
  Esperado: error en "Step names"; la escala tiene 12 pasos y la columna de la tabla dice "Step · Names pending".
- [ ] **B5. "Suggested" en la curva.** Es A7.
- [ ] **B6. "Show in table" de otra escala.** Marca danger en "Semantic palettes", abre la tabla de blue en "Tables" y pulsa "Show in table" en la nota de danger.
  Esperado: se abre la pestaña de danger y el foco (anillo visible) va a la fila del paso nombrado.
- [ ] **B7. Seis escalas de 30 pasos en un móvil de gama media (decisión 38).** En un móvil Android o iPhone de gama media (no el último modelo), abre `<página>/?steps=30&names=radix&danger=suggested&warning=suggested&success=suggested&info=suggested`.
  Pasos: 1) escribe un color letra a letra (por ejemplo `#F40009`); 2) mantén pulsado "Increase steps" y "Decrease steps" varias veces; 3) arrastra el deslizador del tinte de un extremo a otro; 4) marca y desmarca el tope de croma.
  Esperado: seis tiras (blue, danger, warning, success, info y neutral) de 30 pasos, en filas de 8 con el nombre dentro; 11 notas en la lista; el pulgar del tinte sigue al dedo sin saltos y las tiras cambian a la vez que escribes o pulsas, sin retraso que se note. Apunta el modelo del móvil. Si se nota retraso, el cálculo pasa a segundo plano (Web Worker, decisión 38): apúntalo en §10.
- [ ] **B8. Regla y tope.** Con los valores por defecto (A1), cambia la curva y después activa "Keep chroma at or below my color’s".
  Esperado: la regla ("Text on white: 700 and darker…") no cambia; la tira de blue sí.
- [ ] **B9. Tope en el resumen y en la URL.** Color `#0E4C4C`, 10 pasos, activa el tope.
  Esperado: el gráfico de la curva baja a la línea del croma de la marca; aparece la celda "Chroma cap" en el resumen y, tras medio segundo, `cap=1` en la barra de direcciones.

## 3. Teclado entero, sin ratón

Con el ratón o el trackpad apartados. En Safari, activa antes Ajustes → Avanzado → "Pulsar Tab para resaltar cada ítem de una página web" (si no, Tab se salta los enlaces).

- [ ] **T1. Orden.** Desde la barra de direcciones, pulsa Tab una y otra vez hasta el final.
  Esperado: el anillo de foco se ve siempre y nunca desaparece en algo invisible. Orden: cabecera ("How it works"), "Skip to result", pestañas de ajustes, cada control de "Main color" en el orden de la pantalla, el resultado ("Back to settings", que en dos columnas solo se ve con el foco; resumen y sus botones, avisos, tiras si se desplazan, par, pestañas y tabla), Export y el pie.
- [ ] **T1b. El foco no queda tapado (2.4.11).** Baja hasta la mitad de la página y recorre hacia atrás con Mayúsculas-Tab; pulsa también "Show in table" en un aviso.
  Esperado: el control con el foco nunca queda debajo de la cabecera fija; se ve entero o, como poco, una parte.
- [ ] **T2. Enlaces de saltar.** En la ventana estrecha o en el móvil con teclado, "Skip to result" lleva al resultado y "Back to settings" vuelve a los ajustes.
- [ ] **T3. Pestañas.** En las pestañas de ajustes y en las de "Tables", las flechas izquierda y derecha cambian de pestaña al momento; Tab sale de la lista de pestañas al contenido.
- [ ] **T4. Controles.** Los grupos de opciones (Names, Format) se mueven con las flechas; las casillas (tope, roles) con Espacio; los selectores (curva, paleta de rol, par) se abren o cambian con Espacio o con las flechas (depende del navegador); los botones con Intro y con Espacio; el deslizador con las flechas.
- [ ] **T5. Pasos.** En "Steps", "Decrease steps" y "Increase steps" no pasan del rango (3 y 16 con Tailwind); en el límite el foco se queda en el botón.
- [ ] **T6. Tablas y tiras.** Tab entra en la región de la tabla y las flechas la desplazan. Con 30 pasos, si la tira tiene barra de desplazamiento (desde 640 px de ancho, cuando no cabe), Tab también entra en ella y las flechas la mueven.
- [ ] **T7. El foco no se mueve solo.** Al cambiar un ajuste, el foco se queda en el control. Solo se mueve con "Show in table", con los enlaces de saltar y con Download o Copy con errores (va al resumen de errores, A4).
- [ ] **T8. Exportar con errores.** Con `#33CC9`, pulsa "Download …".
  Esperado: el foco va a "Fix 1 error to export"; Tab llega a su enlace e Intro lleva al campo del color.

## 4. VoiceOver en macOS

Activar y desactivar: ⌘F5. Navegar: Control-Opción con las flechas, o Tab. Con Safari, que es el navegador con el que mejor funciona VoiceOver.

- [ ] **V1. Campos.** Cada campo dice su etiqueta y su ayuda ("Your color, Hex, RGB or HSL…"); con error, también el error y "The result still uses…".
- [ ] **V2. Región de estado.** Cambia el número de pasos a 12 y espera.
  Esperado: VoiceOver dice "Scales updated: 12 steps, 0 warnings, 1 note." una vez. Cambia el color a `#1A2B5C`: dice "Scales updated: 12 steps, 1 warning, 1 note." y "New warning: blue: Your color is very dark…".
- [ ] **V3. Error fuera del campo.** Con Radix y 25 pasos, cambia a Tailwind (B3): VoiceOver dice también el error de pasos, aunque el foco esté en la convención.
- [ ] **V4. Par de contraste.** En el par, cambia "Background" a Black y pulsa "Swap".
  Esperado: con Black, "4.95:1. Blue 600 on black. Passes 4 of 5 levels: Normal text AA 4.5, Large text AA 3, Large text AAA 4.5, UI components 3."; con Swap, lo mismo con "Black on blue 600". Al cambiar otros ajustes, el par no habla.
- [ ] **V5. "Copied" y "Link copied".** Pulsa "Copy" en Export y "Copy link" en el resumen.
  Esperado: se anuncia "Copied" y "Link copied", una vez cada uno.
- [ ] **V6. Roles.** Marca danger en "Semantic palettes", elige un paso de danger en "Text" del par y vuelve a la casilla de danger para desmarcarla.
  Esperado: se anuncia "The pair was reset because danger was turned off." y, por separado, "Scales updated: 11 steps, …" (son dos anuncios, no una repetición); el foco se queda en la casilla.
- [ ] **V7. Lo que no se ve.** Las tiras se leen como una imagen ("blue, 11 steps from 50 to 950; your color is 600"); las filas White AA y Black AA (desde 640 px de ancho), como una frase con los pasos que cumplen ("White AA: 700, 800, 900, 950"); el gráfico de la curva, un paso por elemento con su croma y "your color" en el de la marca; la tabla, con cabeceras de fila y columna.
- [ ] **V8. Encabezados.** Con el rotor (Control-Opción-U), la lista de encabezados tiene "Settings", "Result", "Export" y "How it works", y los de dentro del resultado.

## 5. VoiceOver en iOS

Activar: Ajustes → Accesibilidad → VoiceOver (o tres pulsaciones del botón lateral si está configurado). Deslizar a la derecha pasa al siguiente elemento; doble toque activa.

- [ ] **I1. Región de estado.** Con el teclado del iPhone, cambia "Steps" a 12: VoiceOver dice "Scales updated: 12 steps, …" una vez.
- [ ] **I2. Par.** Cambia "Background" del par: se anuncia el ratio y los niveles (como V4).
- [ ] **I3. "Copied".** Pulsa "Copy" en Export y "Copy link": se anuncian "Copied" y "Link copied".
- [ ] **I4. Recorrido.** Deslizando de un elemento a otro se llega a todo, en el orden de la pantalla, y nada se lee dos veces seguidas.
- [ ] **I5. Objetivos táctiles (2.5.8).** Sin VoiceOver, toca con el dedo cada botón, casilla y opción, también "Decrease steps", "Increase steps" y el icono de copiar de Export.
  Esperado: cada toque activa el control que querías, nunca el de al lado.
- [ ] **I6. Texto grande en el iPhone.** En Safari, botón "Aa" (o el de la izquierda de la barra de direcciones) y el tamaño del texto al máximo.
  Esperado: nada se corta ni se pisa; la página no se desplaza a los lados.

## 6. Texto grande y zoom (1.4.4 y 1.4.10)

- [ ] **Z1. Solo el texto al 200 %.** En Firefox: menú Ver → Zoom, marca la opción de ampliar solo el texto ("Zoom Text Only" en inglés) y después ⌘+ hasta 200 % (la cifra sale en la barra de direcciones). Los nombres de los menús de este apartado y del siguiente no se han comprobado en la versión actual de cada navegador; si no coinciden, apunta cuál es.
  Esperado: todo el texto se puede leer; nada queda cortado o encima de otra cosa; las tablas y el bloque de código se desplazan dentro de su caja. Repítelo con `<página>/?steps=30&names=radix` (mira sobre todo los nombres de los pasos del gráfico de la curva) y con la ventana a menos de 640 px de ancho (los nombres dentro de las muestras).
- [ ] **Z2. Zoom al 400 %.** En Chrome, con la ventana a 1280 px de ancho (más o menos la mitad de una pantalla de 2560), ⌘+ hasta 400 %.
  Esperado: la página pasa a una columna, como en el móvil; no hay desplazamiento horizontal de la página (solo dentro de las tablas y del código); se puede usar todo.
- [ ] **Z3. Espaciado de texto (1.4.12).** Crea un marcador en Chrome con esta dirección y ábrelo en la página: `javascript:(()=>{const s=document.createElement('style');s.textContent='*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}';document.head.append(s)})()`
  Esperado: no se corta ni se pisa ningún texto, tampoco con `<página>/?steps=30&names=radix` (nombres del gráfico de la curva). El código solo añade estilos a la página abierta; copia este y no otro, y borra el marcador al terminar.

## 7. Colores forzados y color

- [ ] **H1. Colores forzados.** En Firefox: Ajustes → General → Idioma y apariencia, la opción de colores o "Control de contraste", con colores personalizados que sustituyan a los de la página (el nombre de la opción cambia entre versiones de Firefox; no se ha comprobado en la versión actual). Si tienes un PC con Windows: Configuración → Accesibilidad → Temas de contraste.
  Esperado: se ven los bordes de los campos, las casillas, los botones, el anillo de foco, las marcas ✓ de la regla y de la marca, y el contorno de cada muestra de color.
- [ ] **H2. Sin color (1.4.1).** En el Mac: Ajustes del Sistema → Accesibilidad → Pantalla → Filtros de color → Escala de grises.
  Esperado: se sigue sabiendo cuál es el paso de la marca (✓), qué cumple en el par (Pass o Fail en texto), qué es aviso y qué es nota (icono y texto) y qué pasos cumplen la regla (✓ y texto). Con danger y warning activos, cada tira y cada pestaña de la tabla se distingue por su nombre.
- [ ] **H3. Modo oscuro.** Pon el sistema en oscuro (Ajustes del Sistema → Aspecto).
  Esperado: todo legible.

## 8. Importar en Figma (como en C5)

- [ ] **G1. Descarga e importación.** Con los valores por defecto, marca danger y warning; en Export, "DTCG for Figma" y "Download Value.tokens.json". En un archivo de Figma de prueba, crea una colección nueva y arrastra el archivo al panel de variables.
  Esperado: 44 variables en los grupos `color/blue`, `color/danger`, `color/warning` y `color/neutral`, en un modo `Value`. `color/blue/600` es `#1877F2`, `color/danger/50` `#FFF6F4` y `color/neutral/950` `#23272E` (los de la tabla de la app), marcadas como *Hide from publishing*.
- [ ] **G2. Nombres personalizados.** Repite con Custom y nombres como `a b c d e` (5 pasos): las variables se llaman `color/blue/a` … `color/blue/e`.

## 9. Navegadores

Repite en cada uno A1 a A8, A13, A14, B4, B6, T1 y Z2 (en el iPhone, en lugar de Z2, gira el móvil y amplía con dos dedos: la página no se desplaza a los lados).

| Prueba | Safari (Mac) | Chrome (Mac) | Firefox (Mac) | Safari (iOS) |
|---|---|---|---|---|
| A1 a A8 | [ ] | [ ] | [ ] | [ ] |
| A13 y A14 (en iOS, Download abre o guarda el archivo) | [ ] | [ ] | [ ] | [ ] |
| B4 y B6 | [ ] | [ ] | [ ] | [ ] |
| T1 (en iOS, con un teclado externo si lo hay) | [ ] | [ ] | [ ] | [ ] |
| Z2 (en iOS, girar y ampliar) | [ ] | [ ] | [ ] | [ ] |
| Las fuentes: el texto se ve con la misma letra que en Chrome (Inter, comprobada allí con Chrome sin ventana) y el código de Export, con letra de ancho fijo (JetBrains Mono) | [ ] | [ ] | [ ] | [ ] |

## 10. Qué falló

Una fila por fallo. Prueba (por ejemplo, "V4"), navegador o dispositivo, qué esperabas y qué pasó.

| Prueba | Navegador o dispositivo | Qué pasó |
|---|---|---|
| | | |
| | | |
| | | |

## 11. Qué cubre este guion

Para comprobar que no falta nada (comprobación 4 del encargo de C6, parte 1).

| Qué | Dónde |
|---|---|
| `ux.md` §10, comprobaciones 1 a 9 | B1 a B9 (la 7, en B7) |
| F19: todo se usa con teclado | §3 (T1 a T8) |
| F19: los errores dicen cómo corregirse y están asociados a su campo | A4, A6, B3, B4, T8, V1, V3 |
| F19: avisos y confirmaciones se anuncian (comprobado en C4 solo por el contenido de las regiones) | B1, V2 a V6, I1 a I3 |
| F19: ninguna información depende solo del color (marca, roles, niveles de F11, regla de F26) | H2, V7 |
| 2.4.11 (foco no tapado) y 2.5.8 (objetivos de 24 px) | T1b, I5 |
| WCAG 2.2 AA de `ux.md` §9 sin comprobar en C4: lector de pantalla real, texto al 200 %, espaciado, colores forzados, anillo de foco a la vista | §4, §5, Z1, Z3, I6, H1, T1 |
| 1.4.10 (zoom al 400 %) | Z2 |
| DTCG en Figma (F14, C5) | G1, G2 |
| Navegadores de escritorio y Safari en iOS | §9 |
