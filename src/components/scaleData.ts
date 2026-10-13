// Datos compartidos por las tiras y las tablas: las escalas visibles, el contraste y lo que dice cada pestaña.
import { contrast, hexToRgb, truncate2, type NamedStep, type Scales } from '../../tools/scales.mjs';

export type Scale = { id: string; name: string; steps: NamedStep[] };

export const WHITE = [1, 1, 1];
export const BLACK = [0, 0, 0];

export const contrastWith = (hex: string, bg: number[]) => contrast(hexToRgb(hex), bg);

// El ratio se muestra truncado a dos decimales, no redondeado (decisión 12, F11): #0078D7 con blanco es 4.49.
export const ratioText = (x: number) => truncate2(x).toFixed(2);

// Escalas visibles, en el orden de ux.md §6.3: color, (roles en otra parte de C4) y neutros.
export const visibleScales = (result: Scales, colorName: string): Scale[] => [
  { id: 'color', name: colorName, steps: result.color },
  { id: 'neutral', name: 'neutral', steps: result.neutral },
];

const WARNINGS = new Set(['achromatic', 'extreme', 'role-collision']);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Avisos y notas de una escala, para el nombre de su pestaña ("blue, 1 note"; ux.md §6.5).
export function tabLabel(result: Scales, scale: Scale) {
  const mine = result.warnings.filter((w) => ('scale' in w ? w.scale === scale.id : scale.id === 'color'));
  const warnings = mine.filter((w) => WARNINGS.has(w.code)).length;
  const notes = mine.length - warnings;
  const parts = [warnings && plural(warnings, 'warning'), notes && plural(notes, 'note')].filter(Boolean);
  return [scale.name, ...parts].join(', ');
}
