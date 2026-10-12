# Nombres con N pasos (decisión 3, paso A2)

2026-10-09. Regla para la decisión 3 (cerrada el mismo día con las tres opciones propuestas, §5): qué nombre lleva cada paso en cada convención cuando N (de 5 a 15) no es el número de pasos de esa convención. Script de comprobación: `docs/comparacion/nombres.mjs`.

## 1. Qué dicen las fuentes

| Convención | Fuente leída | Pasos | Nombres | Qué significa el número |
|---|---|---|---|---|
| Tailwind CSS | `tailwindlabs/tailwindcss`, commit `fa81d69` (2026-09-25), `packages/tailwindcss/theme.css`; página Colors de la documentación | 11 | 50, 100, 200 … 900, 950; 50 el más claro, 950 el más oscuro | Un orden de claro a oscuro. La documentación no pone ninguna restricción a los nombres de colores propios: se definen como `--color-<nombre>` en `@theme` y el nombre del paso es parte de la clave (como `--color-midnight`). |
| SDS (Simple Design System de Figma) | `figma/sds`, commit `05525f7` (2026-10-02), `src/theme.css` | 10 | 100, 200 … 1000 (`--sds-color-gray-100` es `#f5f5f5` y `-1000` es `#111111`) | Un orden de claro a oscuro. Todas sus escalas de color tienen 10 pasos. |
| Radix Colors | `radix-ui/colors`, commit `dbdb854` (2025-12-17), `src/light.ts` y `scripts/build-css-modules.js`; página *Understanding the scale* | 12 | 1 a 12; en JavaScript `blue1`, en CSS `--blue-1` | Una función: 1 y 2 fondos de la app, 3 a 5 fondos de componente y sus estados, 6 a 8 bordes, 9 y 10 fondos sólidos, 11 y 12 texto. El 9 es el de más croma; 11 y 12 garantizan APCA Lc 60 y Lc 90 sobre el 2 de la misma escala. La página dice que cada escala tiene 12 pasos y no habla de otros números. |

El motor del curso (`tools/scales.mjs` de `f4885d7`) solo conoce los nombres de Tailwind (`STEPS`), y el aviso `extreme` está escrito con ellos (`[50, 100, 900, 950]`).

DTCG 2025.10 (§5.1): un nombre no puede empezar por `$` ni contener `{`, `}` ni `.`; distingue mayúsculas.

## 2. Qué fija N

- **Ninguna convención impide otro N** en el sentido de que un nombre "no valga": Tailwind acepta cualquier clave y SDS y Radix son solo listas de variables.
- **Radix sí lo fija en el significado.** Sus números son funciones de una escala de 12 pasos diseñada para eso (el 9 es el color puro, 11 y 12 tienen contraste APCA garantizado). Incluso con N = 12, la app no reproduce esas funciones: la marca cae en el paso de L más cercano (decisión 4), no en el 9; la curva es la de Tailwind CSS, no la de Radix; y APCA está fuera de la versión 1 (decisión 5). Con la convención Radix, la app da los **nombres** de Radix, no su **escala**, y debe decirlo.

## 3. Propuesta

Una sola idea para Tailwind y SDS: **el nombre indica la posición del paso entre el más claro y el más oscuro**, con la lista de nombres de la convención como regla graduada. Como los pasos son muestras regulares de la curva (A4 y decisión 4), el paso k está en t = k / (N − 1); su nombre es el valor de la convención en ese punto, interpolando linealmente entre sus nombres y redondeando a 50.

| Convención | Regla | N natural |
|---|---|---|
| Tailwind | Interpolar en t sobre 50, 100 … 900, 950 (11 puntos) y redondear a 50. El primero es siempre 50 y el último 950; con N impar el central es 500. | 11: los nombres de siempre. |
| SDS | 100 + 900 · t, redondeado a 50. El primero es siempre 100 y el último 1000. | 10: 100 … 1000. |
| Radix | Orden: 1 a N. | 12. |
| Personalizada | El usuario escribe N nombres (sin prefijo: el nombre de la paleta ya va delante, `funcionalidades.md` F6.1), o elige "1 a N" o "múltiplos de un número". Se aceptan letras, números, `-` y `_` (válido en DTCG, en variables CSS y en clases de Tailwind); los nombres no se repiten. | Ninguno. |

Ejemplos (de claro a oscuro):

| N | Tailwind | SDS |
|---|---|---|
| 5 | 50 250 500 750 950 | 100 350 550 800 1000 |
| 8 | 50 150 300 450 550 700 850 950 | 100 250 350 500 600 750 850 1000 |
| 10 | 50 100 200 350 450 550 650 800 900 950 | 100 200 … 1000 |
| 11 | 50 100 200 … 900 950 | 100 200 300 350 450 550 650 750 800 900 1000 |
| 12 | 50 100 200 250 350 450 550 650 750 800 900 950 | 100 200 250 350 450 500 600 650 750 850 900 1000 |
| 15 | 50 100 150 200 300 350 450 500 550 650 700 800 850 900 950 | 100 150 250 300 350 400 500 550 600 700 750 800 850 950 1000 |

**Comprobado con el script:** de N = 5 a 15 no se repite ningún nombre en ninguna de las dos convenciones (con la decisión 17 el rango pasa a 3 a 16 en Tailwind y 3 a 19 en SDS, comprobado con `comparacion/rango.mjs`); con N = 11 Tailwind da sus 11 nombres y con N = 10 SDS da los suyos.

**Por qué posición y no orden.** Con la posición, el primero y el último tienen siempre el mismo nombre y un nombre indica más o menos la misma claridad con cualquier N (500 de Tailwind está siempre hacia la mitad de la curva). Es lo que una persona que conoce Tailwind espera al ver `primary-500`. Con el orden (100, 200 … N · 100 en SDS), con 5 pasos el más oscuro sería 500 y con 15 sería 1500.

**Por qué redondear a 50.** Los nombres quedan en el vocabulario de las dos convenciones (múltiplos de 50) y no se repiten. Redondear a 10 da nombres más exactos (N = 8 en Tailwind: 50 140 290 430 570 710 860 950) pero menos reconocibles. El precio del 50 es que los saltos entre nombres son irregulares (N = 8: de 300 a 450 y de 450 a 550), aunque los colores estén a la misma distancia en la curva.

**Neutros.** La escala de neutros con tinte lleva los mismos N y los mismos nombres que la de la marca.

## 4. Consecuencias para otros pasos

- **Aviso `extreme`.** En el curso depende de los nombres de Tailwind (los dos primeros y los dos últimos pasos). Con N y convención libres, tiene que definirse sin nombres. Decidido en A3 (decisión 9, cerrada el 2026-10-10): por la posición de la marca en la curva, no por la del paso, porque cualquier regla por paso cambia con N (`funcionalidades.md` §2). Se programa en C3.
- **C3.** Las pruebas de nombres: con N = 11 y Tailwind, los nombres de `STEPS`; con N = 10 y SDS, 100 … 1000; ningún nombre repetido de 3 a 16 en Tailwind ni de 3 a 19 en SDS (decisión 17).
- **C5.** La prueba de `@theme` incluye un nombre que no es de la paleta de Tailwind (por ejemplo `bg-marca-150`), porque la documentación no lo prohíbe pero tampoco lo muestra.

## 5. Decisión

2026-10-09. Oscar pide elegir lo mejor para quien use la app y para los estándares de desarrollo; se adoptan las tres opciones propuestas:

1. **Tailwind y SDS por posición.** Quien elige una convención espera que los nombres signifiquen lo mismo que en ella: el primero y el último fijos y 500 hacia la mitad. Con el orden, el más oscuro se llamaría 500 o 1500 según N.
2. **Redondeo a 50.** Nombres reconocibles en las dos convenciones y sin repetir de 5 a 15. Fija el máximo de pasos de cada una: 16 en Tailwind y 19 en SDS (decisión 17, 2026-10-10). Quien quiera otros números tiene la convención personalizada.
3. **Radix con cualquier N, nombres 1 a N y una nota.** Fijar 12 pasos no daría la escala de Radix (curva, posición de la marca y APCA son otros), así que solo quitaría libertad. La nota dice que se usan los nombres de Radix, no la función de sus pasos.
