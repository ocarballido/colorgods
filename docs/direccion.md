# Dirección de colorgods (paso A6)

2026-10-11. Oscar pide lo mejor y lo más actual para escalas de color en sistemas de diseño y UI, que aporte valor real y nos diferencie, y dice que seguirá las recomendaciones si se puede hacer. Este documento comprueba qué hacen hoy los sistemas de referencia, mide con el motor las opciones que más pesan y recomienda. Base de la competencia: `competencia.md`. Scripts: `docs/comparacion/contraste.mjs`, `contraste2.mjs`, `tope.mjs` y `marca.mjs` (importan `tools/scales.mjs` de DesignToken101 en `f4885d7` sin cambios).

**Estado (2026-10-11).** Oscar sigue las recomendaciones: decisiones 30 a 34 cerradas. Lo que §4 dice que cambia ya está en `funcionalidades.md` (paso A7), `semanticas.md` §6, `ux.md` y la propuesta A del artifact "Wireframes de colorgods"; las preguntas que abre A7 están en `funcionalidades.md` §6 (decisiones 35 a 38).

## 1. Qué es lo actual (comprobado el 2026-10-11)

| Tema | Estado | Fuente |
|---|---|---|
| Espacio de color | Tailwind CSS 4.3 define su paleta en OKLCH: 26 familias (las 17 de color, más slate, gray, zinc, neutral, stone, taupe, mauve, mist y olive) de 11 pasos. Su documentación no menciona P3. | tailwindcss.com/docs/colors (v4.3) |
| Contraste por paso | Material 3 mide el tono como L* para que el contraste sea predecible: según `hct.ts` de material-color-utilities, una diferencia de tono de 40 garantiza un ratio de 3 o más y una de 50, de 4,5 o más. Leonardo genera los pasos por ratio de contraste. Tailwind no: la L de su `500` va de 0,585 (`indigo`) a 0,795 (`yellow`) según la paleta (`TW_CURVES` de `scales.mjs`), y nuestro motor actual, que sigue esas curvas, da en el `500` un contraste con blanco de 1,88 a 4,22 según el color (`investigacion-comparacion.md` §2). | material-color-utilities `hct.ts`; investigación propia |
| Gama P3 y modo oscuro | El generador de paletas de Radix acepta colores P3, da definiciones wide-gamut con alternativa sRGB y genera el tema oscuro aparte. | radix-ui.com/colors/docs/overview/custom-palettes |
| Algoritmo de contraste | WCAG 2 sigue siendo la referencia. APCA salió del borrador de WCAG 3 en julio de 2023 y no tiene sustituto; WCAG 3 no se espera antes de 2030. Refuerza la decisión 5. | adrianroselli.com, "WCAG3 Contrast as of April 2026" |
| Tokens | El formato DTCG tiene versión estable (2025.10, 28 de octubre de 2025). Su módulo de color admite `srgb`, `oklch`, `display-p3` y otros, con `colorSpace`, `components`, `alpha` opcional y `hex` opcional como alternativa. Es un informe de grupo comunitario, no un estándar del W3C. | Design Tokens Color Module 2025.10 |

Lo que se deduce: el criterio actual no es solo "OKLCH", que ya usa todo el mundo, sino que **el número del paso signifique lo mismo en todas las paletas**, para poder escribir reglas del tipo "texto sobre blanco, del paso X en adelante". Ninguna de las herramientas comparadas lo da a la vez que conserva la marca y su tono: Tailwind y nuestro motor actual no igualan el contraste; Leonardo sí, pero no pone la marca en ningún paso en modo RGB (0 de 39) y cambia el tono; Scale y ColorScale mezclan en sRGB (`competencia.md`).

## 2. Medidas

Los 13 colores de prueba de siempre. **Método C** es el actual (decisión 4). **Método D**: la luminancia relativa (la Y de WCAG) de cada paso es la misma en todas las escalas; la escalera de Y es, en cada posición t, la mediana de Y de las 17 paletas de color de Tailwind CSS (L y C remuestreados con PCHIP, tono de `TW_HUES`); el croma sigue la curva elegida en la L del paso, con la proporción de croma medida en la L de la marca como en C; el tono es el de la marca; la marca sustituye al paso de Y más cercana.

| N = 11 | C (actual) | D |
|---|---|---|
| Contraste con blanco del paso `500` (mín. a máx. entre colores, sin el paso de la marca) | 1,88 a 4,22 | 2,80 a 2,82 |
| Contraste del paso `600` | 2,86 a 5,30 | 4,05 a 4,07 |
| Contraste del paso `700` | 4,73 a 7,09 | 5,86 a 5,92 |
| Pasos con AA (4,5) sobre blanco en todos los colores | 700 a 950 | 700 a 950 |
| Escalas monótonas | 13 de 13 | 13 de 13 |
| Pasos recortados; recorte máximo | 36; 36 % | 39; 47 % |

Con N de 3 a 30 (364 escalas), D no da ninguna escala no monótona ni hex repetidos, y en un mismo paso (sin contar el de la marca) el contraste de dos colores cualesquiera difiere como mucho un 1,4 %. Con los 4.080 colores del barrido y 11 pasos, D recorta más: 1.172 escalas con algún paso recortado más del 20 %, frente a 828 con C (máximo 78 % en los dos). Medir el croma en la t del paso, en vez de en su L, da más recorte aún (1.447 escalas), por eso D lo mide en la L.

El paso de la marca conserva su hex y, por tanto, su contraste: difiere del de las demás escalas en ese paso en un factor de 1,02 a 1,23 (casi negro, `950`). Un caso que importa: verde azulado `#008080` cae en `600` con 4,77, y cumple AA, cuando el `600` de las demás escalas tiene 4,06.

Neutros: hoy siguen la L de `neutral` de Tailwind (decisión 10), así que su `500` tiene 4,70 con blanco frente a 2,82 del color en D. Con D, los neutros siguen la misma escalera y el `500` de todo es igual.

Marca oscura y apagada (`#0E4C4C`, 10 pasos): con C y con D los pasos centrales llegan a C 0,133 o 0,140, más del doble de la marca (0,059). Con un tope de croma igual al de la marca, la escala queda en la misma familia apagada (`#E5FCFC … #5C9594 … #0E4C4C #022C2D`) y la luminancia relativa de cada paso cambia como mucho un 0,4 % (`tope.mjs`; con el prototipo `metodo-d.mjs`, 0,5 %). Con `#33CC99` el tope no cambia nada, porque la curva no supera su croma.

Tiempo: D tarda de 6 a 16 ms por escala en Node sin optimizar, según la ejecución (seis escalas de 30 pasos: 115 ms con `metodo-d.mjs`, de 22 a 25 ms con tablas; `funcionalidades.md` §6) (la escalera mediana se calcula una vez y se guarda); con C, seis escalas de 30 pasos tardaban 1,5 ms (medida de la decisión 25). Se optimiza y se comprueba en C3 y C4.

## 3. Recomendación

1. **Adoptar el método D: el paso es un nivel de contraste.** Es el valor nuevo: el mismo paso tiene el mismo contraste en la escala de la marca, en las de los roles semánticos y en los neutros, con cualquier N, sin perder la marca exacta ni su tono, y con la forma de croma de una paleta real. Permite que la app diga, para el N elegido, "texto sobre blanco: del paso X en adelante, en todas las escalas", que es lo que Tailwind no puede decir. Coste: más recorte en colores muy saturados (se avisa, como hoy) y la L de cada paso ya no es la del curso con 11 pasos.
2. **No dejar elegir en qué paso cae la marca.** Scale y ColorScale lo permiten, pero en D el nombre del paso es su contraste: mover la marca rompería la promesa. La app explica por qué una marca oscura cae en un paso oscuro y que su paso tiene su propio contraste.
3. **Tope de croma opcional** ("keep my color's chroma as the maximum"), desactivado por defecto. Resuelve la marca oscura y apagada sin tocar el contraste. Entra en la versión 1: es una línea del motor y un control.
4. **Giro de tono: fuera de la versión 1.** Lo usan Scale y ColorScale, pero choca con conservar el tono de la marca (decisión 1) y, en D, cambia el croma disponible en cada paso. Queda como candidata.
5. **Contraste WCAG 2.2, sin APCA** (decisión 5, reforzada por §1).
6. **Exportación:** se mantiene la de la versión 1 (DTCG en sRGB con hex para Figma, probado en el curso). Candidatas: DTCG 2025.10 con `oklch` y `hex` de alternativa para código, CSS con `oklch()` y P3. Antes de prometer `oklch` en Figma, se prueba en C5 si su importación lo acepta.
7. **Primera candidata después de la versión 1: revisar una escala existente.** Pegar los hex de otra herramienta (o de un sistema ya hecho) y obtener las tablas, el contraste por paso, los avisos, los nombres y la exportación. Reutiliza todo lo de la versión 1 y ninguna de las herramientas comparadas lo hace con lo que hemos podido ver de ellas.

## 4. Qué cambia en lo decidido

- Decisión 1: deja de ser cierto que la app "no promete el mismo contraste en el mismo paso"; ahora es su promesa, salvo en el paso de la marca.
- Decisión 4: se mantiene la proporción de croma medida en la L de la marca; la L de cada paso pasa a salir de la escalera de Y. Con N = 11, la L de los pasos no anclados ya no es la del curso.
- Decisión 9 (aviso de extremo): hay que reescribirla sobre la posición de la marca en la escalera de Y y volver a medirla.
- Decisión 10: los neutros siguen la escalera de Y (con el croma de `gray` y el tinte); con N = 11 ya no dan los hex del curso.
- Decisión 21 (colisión de la marca con un rol): se mide en la L de la marca y la escala del rol cambia con D; hay que repetir `roles.mjs`.
- `funcionalidades.md`: cambian F3 (la curva elegida solo da la forma del croma), F7, F8, F10 (el texto pasa a decir lo contrario), F11 (el par puede apoyarse en la regla por paso) y F12.2; se añade el tope de croma. Hecho en el paso A7.

## 5. Fuentes

- Tailwind CSS, documentación "Colors", v4.3: tailwindcss.com/docs/colors.
- material-color-utilities, `hct.ts` (comentario de cabecera), reproducido en developer.android.com.
- Radix Colors, "Custom palettes": radix-ui.com/colors/docs/overview/custom-palettes.
- Adrian Roselli, "WCAG3 Contrast as of April 2026": adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html.
- Design Tokens Community Group, "Design Tokens Color Module 2025.10" (28 de octubre de 2025): w3.org/community/reports/design-tokens/CG-FINAL-color-20251028/.
