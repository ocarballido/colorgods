// Avisos y notas de la lista única (U5, ux.md §6.2; F12.1 a F12.4), con los textos de funcionalidades.md §3 y la nota
// de recorte por escala de Figma (decisión 62). Avisos antes que notas; cada uno con su escala y, si señala un paso,
// el índice de la fila a la que lleva "Show in table". Sin dependencias de React, para probarlo con node --test.
import type { ScaleWarning, Scales } from '../../tools/scales.mjs';
import type { Scale } from './scaleData';

// row: índice de la fila de la tabla; at: su escala y su paso, para el nombre accesible de "Show in table".
// body: el texto sin el nombre de la escala, y roles: los roles a cuyo selector también va (F22, F23; ux.md §5).
export type Notice = {
  key: string;
  warning: boolean;
  scale: string;
  text: string;
  body: string;
  row?: number;
  at?: string;
  roles?: string[];
};

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// "50", "50 and 950", "50, 700 and 800".
const list = (names: string[]) =>
  names.length < 2 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

const icon = (r: string) => `Don’t rely on color alone: show ${r} messages with an icon and text.`;

// brand: índice del paso de la marca. Los avisos de un rol llevan a la fila donde se miden: la del paso de la marca
// (colisión, F22), la del color propio (F23) o la del paso central (roles parecidos).
function describe(w: ScaleWarning, scale: Scale, brand: number): Omit<Notice, 'key' | 'scale' | 'text'> | null {
  const names = scale.steps.map((s) => s.name);
  const anchor = scale.steps.findIndex((s) => s.anchor);
  const r = scale.id;
  switch (w.code) {
    case 'achromatic':
      return {
        warning: true,
        body: 'Your color has no chroma, so it has no hue: the scale comes out gray and the neutrals have no tint.',
      };
    case 'extreme':
      return {
        warning: true,
        // Claro u oscuro por la luminosidad de la marca, no por su paso: así no depende de N. La fila es la suya.
        body: `Your color is very ${scale.steps[anchor].oklch[0] > 0.5 ? 'light' : 'dark'}: almost every step falls on one side of it, and the middle steps may come out much more saturated than you expect. Turn on the chroma cap or try another curve.`,
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
        body: `in ${which} the color doesn’t fit in sRGB, so its chroma is reduced (Clip column).${advice}`,
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
        body: `${which} very close in lightness, closer than any two steps in the Tailwind CSS palettes. With fewer steps they will be easier to tell apart.`,
        row: names.indexOf(a),
      };
    }
    case 'role-changed':
      return {
        warning: false,
        body: `Your color is close to ${w.from}, the usual palette for ${r}, so ${r} uses ${w.to}, which design systems also use for ${r}. You can change it.`,
        row: brand,
        roles: [r],
      };
    case 'role-collision':
      return {
        warning: true,
        body: `Your color is close to ${r}, and design systems use this hue for ${r}. ${icon(r)}`,
        row: brand,
        roles: [r],
      };
    case 'role-custom-collision':
      return {
        warning: true,
        body: `This ${r} color is close to your color, so people may confuse them. ${icon(r)}`,
        row: anchor,
        roles: [r],
      };
    case 'roles-close':
      return {
        warning: true,
        body: `${r} and ${w.other} are very close in color. Choose colors that are easier to tell apart.`,
        row: (names.length - 1) >> 1,
        roles: [r, w.other],
      };
    case 'role-hue':
      return {
        warning: false,
        body: `Design systems don’t use this hue for ${r}: they use ${w.min}° to ${w.max}° (OKLCH hue).`,
        row: anchor,
        roles: [r],
      };
  }
}

export function notices(result: Scales, scales: Scale[]): Notice[] {
  const out: Notice[] = [];
  const brand = scales[0].steps.findIndex((s) => s.anchor);
  for (const w of result.warnings) {
    // Los avisos con scale van a su escala; los de un rol, a la del rol; el resto (sin croma, extremo), a la del color.
    const id = 'scale' in w ? w.scale : 'role' in w ? w.role : 'color';
    const scale = scales.find((s) => s.id === id);
    const d = scale && describe(w, scale, brand);
    if (!d) continue;
    const at = d.row === undefined ? undefined : `${scale.name} ${scale.steps[d.row].name}`;
    out.push({ ...d, key: `${w.code}:${id}`, scale: id, text: `${scale.name}: ${d.body}`, at });
  }
  return [...out.filter((n) => n.warning), ...out.filter((n) => !n.warning)];
}

// "1 warning, 2 notes"; vacío si no hay ninguno.
export function count(list: Notice[]) {
  const warnings = list.filter((n) => n.warning).length;
  const notes = list.length - warnings;
  return [warnings && plural(warnings, 'warning'), notes && plural(notes, 'note')].filter(Boolean).join(', ');
}
