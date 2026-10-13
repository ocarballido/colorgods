// Ajustes de la pestaña "Main color" y sus últimos valores válidos (U2, ux.md §4; decisión 26).
// Cada campo guarda lo escrito y, aparte, el último valor válido con el que se calcula el resultado.
import {
  MAX_STEPS,
  MIN_STEPS,
  checkCustomNames,
  fillNames,
  isPaletteName,
  parseColor,
  parseSteps,
  stepNames,
  type Convention,
  type CustomNamesError,
} from '../tools/scales.mjs';

// Color por defecto: el de las pantallas de B3 (decisión 62). No es #33CC99, la marca de DesignToken101 (A5).
export const DEFAULT_COLOR = '#1877F2';

type Named = Exclude<Convention, 'custom'>;
export type Field = 'color' | 'name' | 'steps' | 'names' | 'multiple';

// Par N y convención con el que se calcula (F2): N y convención se validan juntos.
// Con nombres personalizados no válidos, el resultado sigue a N con las posiciones 1 a N (pending).
export type ValidSteps = { steps: number; convention: Convention; names: Named | string[]; pending: boolean };

export type Settings = {
  colorText: string;
  color: string;
  // null: el nombre propuesto por suggest(), que se ve en el campo hasta que el usuario escribe (F5).
  nameText: string | null;
  // Último nombre válido (null: el propuesto). Lo usan las tiras, las tablas y, después, la exportación.
  name: string | null;
  stepsText: string;
  convention: Convention;
  customText: string;
  multipleText: string;
  valid: ValidSteps;
  // null: la curva propuesta, "Suggested" (U6).
  curve: string | null;
  cap: boolean;
  tint: number;
  // Un error se ve al salir del campo y mientras siga sin ser válido (ux.md §4).
  touched: Record<Field, boolean>;
};

export type Action =
  | { type: 'color'; text: string }
  | { type: 'name'; text: string }
  | { type: 'steps'; text: string }
  | { type: 'stepBy'; delta: 1 | -1 }
  | { type: 'convention'; convention: Convention }
  | { type: 'custom'; text: string }
  | { type: 'multiple'; text: string }
  | { type: 'fill'; multiple: boolean }
  | { type: 'curve'; curve: string | null }
  | { type: 'cap'; cap: boolean }
  | { type: 'tint'; tint: number }
  | { type: 'blur'; field: Field };

export const CONVENTIONS: { value: Convention; label: string }[] = [
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'sds', label: 'SDS' },
  { value: 'radix', label: 'Radix' },
  { value: 'custom', label: 'Custom' },
];

export const namesLabel = (c: Convention) =>
  c === 'custom' ? 'custom' : CONVENTIONS.find((x) => x.value === c)!.label;

// Nombres personalizados: separados por espacios, comas o saltos de línea (ux.md §5).
export const splitNames = (text: string) => text.split(/[\s,]+/).filter(Boolean);

export const parseMultiple = (text: string) => (/^\s*[1-9]\d*\s*$/.test(text) ? Number(text) : null);

export const initialSettings: Settings = {
  colorText: DEFAULT_COLOR,
  color: DEFAULT_COLOR,
  nameText: null,
  name: null,
  stepsText: '11',
  convention: 'tailwind',
  customText: '',
  multipleText: '100',
  valid: { steps: 11, convention: 'tailwind', names: 'tailwind', pending: false },
  curve: null,
  cap: false,
  tint: 0.5,
  touched: { color: false, name: false, steps: false, names: false, multiple: false },
};

// Nombres que se ven ahora en el resultado, para rellenar el campo al pasar a Custom.
const currentNames = (v: ValidSteps) => (Array.isArray(v.names) ? v.names : stepNames(v.steps, v.names));

function resolveSteps(s: Settings): ValidSteps {
  const n = parseSteps(s.stepsText, s.convention);
  if (n === null) return s.valid;
  if (s.convention !== 'custom') return { steps: n, convention: s.convention, names: s.convention, pending: false };
  const names = splitNames(s.customText);
  if (!checkCustomNames(names, n)) return { steps: n, convention: 'custom', names, pending: false };
  return { steps: n, convention: 'custom', names: fillNames(n), pending: true };
}

// N escrita, aunque esté fuera del rango; si no es un entero, la del resultado. Base de los botones "−" y "+".
export const typedSteps = (s: Settings) => (/^\s*\d+\s*$/.test(s.stepsText) ? Number(s.stepsText) : s.valid.steps);

const touch = (s: Settings, field: Field, value: boolean): Settings => ({
  ...s,
  touched: { ...s.touched, [field]: value },
});

// Al volver a ser válido, el campo deja de mostrar el error hasta la próxima vez que se salga de él.
// Si el par no cambia, se conserva el mismo objeto: así no se recalcula ni se anuncia nada (revisión de C4).
const sameSteps = (a: ValidSteps, b: ValidSteps) =>
  a.steps === b.steps &&
  a.convention === b.convention &&
  a.pending === b.pending &&
  (Array.isArray(a.names) && Array.isArray(b.names) ? a.names.join(' ') === b.names.join(' ') : a.names === b.names);

function withSteps(s: Settings): Settings {
  const resolved = resolveSteps(s);
  const next = { ...s, valid: sameSteps(resolved, s.valid) ? s.valid : resolved };
  if (stepsError(next) === null) next.touched = { ...next.touched, steps: false };
  if (namesError(next) === null) next.touched = { ...next.touched, names: false };
  return next;
}

export function reducer(s: Settings, a: Action): Settings {
  switch (a.type) {
    case 'color': {
      const hex = parseColor(a.text);
      const next = { ...s, colorText: a.text, color: hex ?? s.color };
      return hex ? touch(next, 'color', false) : next;
    }
    case 'name': {
      if (!isPaletteName(a.text)) return { ...s, nameText: a.text };
      return touch({ ...s, nameText: a.text, name: a.text }, 'name', false);
    }
    case 'steps': {
      // Con nombres personalizados, cambiar N puede dejar los nombres cortos o largos: el error se ve ya (ux.md §10.4).
      const next = withSteps({ ...s, stepsText: a.text });
      return s.convention === 'custom' ? withSteps(touch(next, 'names', true)) : next;
    }
    case 'stepBy': {
      const max = MAX_STEPS[s.convention];
      const parsed = typedSteps(s);
      if ((a.delta > 0 && parsed >= max) || (a.delta < 0 && parsed <= MIN_STEPS)) return s;
      const n = Math.min(max, Math.max(MIN_STEPS, parsed + a.delta));
      if (String(n) === s.stepsText.trim()) return s;
      return reducer(s, { type: 'steps', text: String(n) });
    }
    case 'convention': {
      let next: Settings = { ...s, convention: a.convention };
      if (a.convention === 'custom' && !s.customText.trim()) next.customText = currentNames(s.valid).join(' ');
      // Si la convención nueva tiene un máximo menor que N, N no cambia y el error se ve ya (F2, ux.md §10.3).
      next = touch(next, 'steps', true);
      if (a.convention === 'custom') next = touch(next, 'names', true);
      return withSteps(next);
    }
    case 'custom':
      return withSteps({ ...s, customText: a.text });
    case 'multiple': {
      const next = { ...s, multipleText: a.text };
      return parseMultiple(a.text) ? touch(next, 'multiple', false) : next;
    }
    case 'fill': {
      // Rellenar sustituye lo escrito (F6.1) con la N escrita o, si no es válida, con la del resultado.
      const n = parseSteps(s.stepsText, 'custom') ?? s.valid.steps;
      const m = a.multiple ? parseMultiple(s.multipleText) : 1;
      if (m === null) return touch(s, 'multiple', true);
      return withSteps({ ...s, customText: fillNames(n, m).join(' ') });
    }
    case 'curve':
      return { ...s, curve: a.curve };
    case 'cap':
      return { ...s, cap: a.cap };
    case 'tint':
      return { ...s, tint: a.tint };
    case 'blur':
      return touch(s, a.field, true);
  }
}

// Errores de cada campo, se vean o no. null: sin error.

export const colorError = (s: Settings) => (parseColor(s.colorText) ? null : 'Use hex, RGB or HSL, like #1877F2.');

export const nameError = (s: Settings, suggested: string) =>
  isPaletteName(s.nameText ?? suggested)
    ? null
    : 'Use lowercase letters, numbers and hyphens, starting with a letter. It can’t be neutral, danger, warning, success or info.';

export const stepsError = (s: Settings) =>
  parseSteps(s.stepsText, s.convention) === null
    ? `Use a whole number from ${MIN_STEPS} to ${MAX_STEPS[s.convention]} with ${namesLabel(s.convention)} names.`
    : null;

export function customNamesError(e: CustomNamesError): string {
  if (e.code === 'count') {
    const diff = Math.abs(e.need - e.have);
    const what = `${diff} name${diff === 1 ? '' : 's'}`;
    return `${e.have} name${e.have === 1 ? '' : 's'}, ${e.need} needed. ${e.have < e.need ? 'Add' : 'Remove'} ${what}.`;
  }
  if (e.code === 'char') return `“${e.name}” has a character that isn’t allowed. Use letters, numbers, - and _.`;
  return `“${e.names[0]}” and “${e.names[1]}” are the same name. Each name must be different, whatever the case.`;
}

export function namesError(s: Settings): string | null {
  if (s.convention !== 'custom') return null;
  const n = parseSteps(s.stepsText, 'custom');
  if (n === null) return null;
  const e = checkCustomNames(splitNames(s.customText), n);
  return e ? customNamesError(e) : null;
}

export const multipleError = (s: Settings) => (parseMultiple(s.multipleText) ? null : 'Use a whole number from 1 up.');
