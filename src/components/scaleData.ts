// Datos compartidos por las tiras y las tablas: las escalas visibles, el contraste y lo que dice cada pestaña.
import { ROLES, contrast, hexToRgb, type NamedStep, type Scales } from '../../tools/scales.mjs';
import { count, type Notice } from './noticeData.ts';

// own: cómo se llama el paso con un color exacto, el de la marca o el color propio de un rol (F23).
export type Scale = { id: string; name: string; steps: NamedStep[]; own: string };

export const WHITE = [1, 1, 1];
export const BLACK = [0, 0, 0];

export const contrastWith = (hex: string, bg: number[]) => contrast(hexToRgb(hex), bg);

// El ratio se muestra truncado a dos decimales, no redondeado (decisión 12, F11): #0078D7 con blanco es 4.49.
export { ratioText } from './pairData.ts';

// Escalas visibles, en el orden de ux.md §6.3: color, roles activos (danger, warning, success, info) y neutros.
export const visibleScales = (result: Scales, colorName: string): Scale[] => [
  { id: 'color', name: colorName, steps: result.color, own: 'your color' },
  ...ROLES.filter((r) => result.roles[r]).map((r) => ({
    id: r,
    name: r,
    steps: result.roles[r]!,
    own: `your ${r} color`,
  })),
  { id: 'neutral', name: 'neutral', steps: result.neutral, own: '' },
];

// Texto de F10 junto a las tablas. Con un color propio en un rol (F23), su paso también conserva su color y su
// contraste, así que el texto lo nombra (decisión 83, arreglado en la parte 5).
export function f10(scales: Scale[]) {
  const own = [
    'your color',
    ...scales.filter((s) => s.id !== 'color' && s.steps.some((x) => x.anchor)).map((s) => s.own),
  ];
  const except =
    own.length > 1
      ? `the steps of ${own.slice(0, -1).join(', ')} and ${own.at(-1)}, which keep your exact colors`
      : 'your color’s step, which keeps your exact color';
  return `Every scale has the same contrast at each step, except ${except}. See the rule above the scales, or check any pair below.`;
}

// Nombre de la pestaña de una escala con sus avisos y notas ("blue, 1 note"; ux.md §6.5).
export const tabLabel = (scale: Scale, list: Notice[]) =>
  [scale.name, count(list.filter((n) => n.scale === scale.id))].filter(Boolean).join(', ');
