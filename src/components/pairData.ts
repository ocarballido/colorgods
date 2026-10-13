// Cálculo del par de contraste (F11, ux.md §6.4), sin React para probarlo con node --test. Texto y fondo entre los
// pasos de las escalas visibles, White y Black; por defecto, la marca sobre blanco. El paso se guarda por su posición
// k: si N o la convención cambian su nombre, el par sigue en el mismo paso (con menos pasos, en el último). Veredicto
// con el ratio sin redondear y ratio truncado a dos decimales (decisión 12).
import { contrast, hexToRgb, truncate2 } from '../../tools/scales.mjs';
import type { Scale } from './scaleData';

export const LEVELS = [
  ['Normal text', 'AA 4.5', 4.5],
  ['Normal text', 'AAA 7', 7],
  ['Large text', 'AA 3', 3],
  ['Large text', 'AAA 4.5', 4.5],
  ['UI components', '3', 3],
] as const;

// Valor de un selector: "white", "black" o "<escala>:<k>". null es el de por defecto.
export type Pick = { text: string | null; bg: string | null };
type Color = { value: string; hex: string; name: string; label: string };

export const FIXED: Color[] = [
  { value: 'white', hex: '#FFFFFF', name: 'white', label: 'White' },
  { value: 'black', hex: '#000000', name: 'black', label: 'Black' },
];

export function color(scale: Scale, k: number): Color {
  const step = scale.steps[k];
  const name = `${scale.name} ${step.name}`;
  return { value: `${scale.id}:${k}`, hex: step.hex, name, label: step.anchor ? `${name} (${scale.own})` : name };
}

// Un paso de una escala que ya no se ve (un rol desactivado) vuelve al valor por defecto.
function resolve(value: string, scales: Scale[]): Color | undefined {
  const fixed = FIXED.find((c) => c.value === value);
  if (fixed) return fixed;
  const [id, k] = value.split(':');
  const scale = scales.find((s) => s.id === id);
  return scale && color(scale, Math.min(Number(k), scale.steps.length - 1));
}

export const ratioText = (x: number) => truncate2(x).toFixed(2);

// Escala de un paso elegido que ya no se ve (un rol desactivado), o undefined.
export const lostScale = (pick: Pick, scales: Scale[]) =>
  [pick.text, pick.bg]
    .map((v) => v?.split(':')[0])
    .find((id) => id && !FIXED.some((c) => c.value === id) && !scales.some((s) => s.id === id));

export function measure(pick: Pick, scales: Scale[]) {
  const brand = `color:${scales[0].steps.findIndex((s) => s.anchor)}`;
  const text = resolve(pick.text ?? brand, scales) ?? resolve(brand, scales)!;
  const bg = resolve(pick.bg ?? 'white', scales) ?? FIXED[0];
  const ratio = contrast(hexToRgb(text.hex), hexToRgb(bg.hex));
  const passes = LEVELS.map(([, , min]) => ratio >= min);
  const n = passes.filter(Boolean).length;
  const pair = `${text.name[0].toUpperCase()}${text.name.slice(1)} on ${bg.name}`;
  const which = LEVELS.filter((_, i) => passes[i]).map(([use, level]) => `${use} ${level}`);
  return {
    text,
    bg,
    ratio,
    passes,
    caption: `${pair}. Passes ${n} of 5 levels.`,
    // Lo que dice la región viva: el ratio y los niveles que cumple.
    spoken: `${ratioText(ratio)}:1. ${pair}. Passes ${n} of 5 levels${which.length ? `: ${which.join(', ')}` : ''}.`,
  };
}

// Un espacio duro alterno hace que un lector anuncie también un texto igual al anterior.
export const again = (prev: string, text: string) => (prev === text ? `${text}${String.fromCharCode(160)}` : text);
