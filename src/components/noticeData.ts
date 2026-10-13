// Avisos y notas de la lista única (U5, ux.md §6.2; F12.1 a F12.4), con los textos de funcionalidades.md §3 y la nota
// de recorte por escala de Figma (decisión 62). Avisos antes que notas; cada uno con su escala y, si señala un paso,
// el índice de la fila a la que lleva "Show in table". Sin dependencias de React, para probarlo con node --test.
import type { ScaleWarning, Scales } from '../../tools/scales.mjs';
import type { Scale } from './scaleData';

// row: índice de la fila de la tabla; at: su escala y su paso, para el nombre accesible de "Show in table".
export type Notice = { key: string; warning: boolean; scale: string; text: string; row?: number; at?: string };

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// "50", "50 and 950", "50, 700 and 800".
const list = (names: string[]) =>
  names.length < 2 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

function describe(w: ScaleWarning, scale: Scale): Omit<Notice, 'key' | 'scale'> | null {
  const names = scale.steps.map((s) => s.name);
  const anchor = scale.steps.findIndex((s) => s.anchor);
  switch (w.code) {
    case 'achromatic':
      return {
        warning: true,
        text: 'Your color has no chroma, so it has no hue: the scale comes out gray and the neutrals have no tint.',
      };
    case 'extreme':
      return {
        warning: true,
        // Claro u oscuro por la luminosidad de la marca, no por su paso: así no depende de N. La fila es la suya.
        text: `Your color is very ${scale.steps[anchor].oklch[0] > 0.5 ? 'light' : 'dark'}: almost every step falls on one side of it, and the middle steps may come out much more saturated than you expect. Turn on the chroma cap or try another curve.`,
        row: anchor,
      };
    case 'clipped': {
      const n = w.steps.length;
      // Hasta tres pasos se nombran; con más, se cuentan, y si son todos se aconseja otra paleta (Figma,
      // decisiones 62 y 77). La columna Clip los da todos.
      const which =
        n === names.length
          ? `all ${n} steps`
          : n > 3
            ? `${n} steps`
            : `step${n > 1 ? 's' : ''} ${list(w.steps.map((s) => s.name))}`;
      // Solo una escala de rol puede recortar en todos sus pasos: el de la marca conserva su hex y los neutros casi
      // no tienen croma. El consejo es entonces otra paleta, como en Figma.
      const advice = n === names.length && scale.id !== 'neutral' ? ' If the clip is large, try another palette.' : '';
      return {
        warning: false,
        text: `in ${which} the color doesn’t fit in sRGB, so its chroma is reduced (Clip column).${advice}`,
        row: names.indexOf(w.steps[0].name),
      };
    }
    case 'close': {
      // Hasta tres pares se nombran ("steps 50 and 100, and 900 and 950"); con más, se cuentan (decisión 77).
      const [a] = w.pairs[0];
      const named = w.pairs.map(([x, y]) => `${x} and ${y}`);
      const which =
        named.length > 3
          ? `${named.length} pairs of neighboring steps are`
          : `steps ${named.length > 1 ? `${named.slice(0, -1).join(', ')}, and ${named.at(-1)}` : named[0]} are`;
      return {
        warning: false,
        text: `${which} very close in lightness, closer than any two steps in the Tailwind CSS palettes. With fewer steps they will be easier to tell apart.`,
        row: names.indexOf(a),
      };
    }
    default:
      // Los avisos de los roles (F22, F23) llegan con los roles, en otra parte de C4.
      return null;
  }
}

export function notices(result: Scales, scales: Scale[]): Notice[] {
  const out: Notice[] = [];
  for (const w of result.warnings) {
    // Los avisos con scale van a su escala; los de un rol, a la del rol; el resto (sin croma, extremo), a la del color.
    const id = 'scale' in w ? w.scale : 'role' in w ? w.role : 'color';
    const scale = scales.find((s) => s.id === id);
    const d = scale && describe(w, scale);
    if (!d) continue;
    const at = d.row === undefined ? undefined : `${scale.name} ${scale.steps[d.row].name}`;
    out.push({ ...d, key: `${w.code}:${id}`, scale: id, text: `${scale.name}: ${d.text}`, at });
  }
  return [...out.filter((n) => n.warning), ...out.filter((n) => !n.warning)];
}

// "1 warning, 2 notes"; vacío si no hay ninguno.
export function count(list: Notice[]) {
  const warnings = list.filter((n) => n.warning).length;
  const notes = list.length - warnings;
  return [warnings && plural(warnings, 'warning'), notes && plural(notes, 'note')].filter(Boolean).join(', ');
}
