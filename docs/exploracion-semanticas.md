# Paletas semánticas asociadas a la marca (exploración)

2026-10-10. Idea de Oscar: que el usuario pueda añadir las paletas de info, success, warning y danger, desactivadas por defecto; al añadir una, la app propone el color que mejor armoniza y contrasta con la marca, y el usuario puede cambiarlo. Aquí se mira si es posible, si aporta valor y qué falta para decidir (decisión 19). Script: `docs/comparacion/semanticas.mjs` (13 colores de prueba, N = 11, paso central).

## 1. Antecedente en el curso

DesignToken101 (`f4885d7`) tuvo escalas de estado y Oscar las quitó de la herramienta:

- **S18:** `red`, `amber` y `blue` (y `emerald` para success, S19) con las curvas de Tailwind CSS y el croma × 0,66, la proporción de la marca del curso.
- **T23:** la herramienta deja de generarlas por tres motivos: cada sistema elige sus colores de estado; no había escala de success si la marca no era verde; y el 0,66 es la proporción de `#33CC99`, no la de cualquier marca.

La idea nueva responde a los dos primeros (el usuario elige y cambia; cada rol tiene su escala). El tercero es el que mide este documento: cómo se deriva el color de cada rol de la marca.

## 2. Si es posible

Sí, y con poco motor. Una paleta semántica es una escala más con el mismo método: la curva de Tailwind CSS de su tono, el mismo N, la misma convención de nombres y los mismos neutros. La exportación ya admite varias paletas (`color/<paleta>/<paso>`). Lo difícil no es generarla, es **proponer** el color.

## 3. Qué da cada forma de proponerlo

Tres variantes, cada rol con la curva de su tono convencional (danger `red`, warning `amber`, success `green`, info `blue`):

| Variante | Qué hace |
|---|---|
| **T** | El color de Tailwind CSS tal cual. |
| **R** | Croma × la proporción de croma de la marca (método C). Es S18 generalizado a cualquier marca. |
| **RH** | R y, además, el tono girado hacia el de la marca como hace Material (`Blend.harmonize` de material-color-utilities: la mitad de la diferencia, como mucho 15°). |

| Medida (13 marcas) | T | R | RH |
|---|---|---|---|
| Semánticos casi grises (croma < 0,05) | 0 | 2 | 2 |
| Un rol casi igual a la marca (ΔE oklab < 0,05 a la misma L) | 4 | 6 | 8 |
| Dos roles parecidos entre sí (ΔE < 0,08) | 0 | 2 | 3 |

Lo que dicen:

1. **Armonizar con las técnicas conocidas acerca los semánticos a la marca, que es lo contrario de distinguirlos.** RH es la que más roles confunde con la marca (8 de 13) y saca roles de su significado: con marca azul puro, danger pasa a `#FE0066`, un rosa; con marca roja, success pasa a `#67C000`, un lima.
2. **Atar el croma a la marca falla con marcas poco saturadas.** Con gris puro, los cuatro roles salen grises (danger e info a ΔE 0,013, indistinguibles); con casi negro, gris azulado y crema, casi grises. Un semántico tiene que reconocerse aunque la marca sea gris.
3. **El problema real es la colisión.** Incluso sin tocar nada (T), en 4 de 13 marcas un rol es casi la marca: roja con danger (0,025), azul marino con info (0,017), rosa pastel con danger (0,036) y crema con warning (0,020). Ahí es donde la app puede aportar algo: detectarlo y proponer una alternativa.
4. **El contraste no depende de la marca.** La L de cada rol sale de su curva, así que el paso que da texto legible sobre blanco (4,5) es fijo: con 11 pasos, 600 en danger e info y 700 en warning y success.

## 4. Si aporta valor

Sí, pero no por "armonizar". Generar una escala roja ya lo hacen Leonardo y Scale, y en colorgods basta con escribir un rojo. Lo que añadiría la app, en la línea de la decisión 1:

- **Una propuesta reconocible por rol**: partir de T (paletas probadas, roles siempre distintos entre sí) y no atar el croma a la marca, o hacerlo con un mínimo.
- **Detección de colisión**: si la marca cae en el tono de un rol, decirlo y proponer otro tono dentro del margen aceptado para ese rol (por ejemplo, un danger más carmín si la marca es roja).
- **Coherencia**: mismo N, nombres y exportación para todas las paletas, en un solo archivo.

## 5. Qué falta para decidir

- **Márgenes de tono por rol.** Qué tonos se aceptan como danger, warning, success e info. Hay que sacarlo de sistemas reales (Tailwind CSS, Material, Carbon, Polaris, Atlassian, Radix u otros), no inventarlo. Sin esto no hay regla para la colisión.
- **Regla de colisión y umbral**, probada con los 13 colores y revisada visualmente por Oscar.
- **Alcance.** La decisión 2 dejó fuera "varias marcas a la vez". Las semánticas no son marcas, pero en la interfaz son lo mismo: varias paletas en la tabla, en el par de contraste y en la exportación. B1 tiene que saber si existen.
