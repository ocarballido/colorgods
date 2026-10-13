// Ajustes en la URL (F18): se escribe lo calculado (los últimos valores válidos, U2) y, al abrir, se lee cada valor
// validándolo antes de que llegue al motor. Un valor no válido se ignora y se usa el de por defecto; unos nombres
// personalizados no válidos vuelven a Tailwind; la paleta o el color no válidos de un rol, a la propuesta; un N mayor
// que el máximo de la convención, a 11. Así build() nunca recibe un valor que lo haga fallar.
import {
  ROLES,
  ROLE_PALETTES,
  TW_CURVES,
  checkCustomNames,
  isPaletteName,
  parseColor,
  parseSteps,
  parseTint,
  type Convention,
} from '../tools/scales.mjs';
import { CONVENTIONS, DEFAULT_COLOR, initialSettings, roleOptions, splitNames, type Settings } from './settings.ts';

// Parámetros: color, steps, names (convención), custom (nombres separados por comas), name, curve, tint, cap=1 y, por
// cada rol activo, su paleta, "suggested" o su color en hex sin "#".
export function searchFromSettings(s: Settings): string {
  const v = s.valid;
  const q = new URLSearchParams({ color: s.color.slice(1), steps: String(v.steps), names: v.convention });
  if (Array.isArray(v.names)) q.set('custom', v.names.join(','));
  if (s.name) q.set('name', s.name);
  if (s.curve) q.set('curve', s.curve);
  q.set('tint', String(s.tint));
  if (s.cap) q.set('cap', '1');
  for (const [r, o] of Object.entries(roleOptions(s.roles)))
    q.set(r, o === null ? 'suggested' : typeof o === 'string' ? o : o.color.slice(1));
  // Los nombres solo tienen letras, números, - y _: la coma es lo único que se codificaría, y en la consulta vale.
  return q.toString().replace(/%2C/g, ',');
}

export function settingsFromSearch(search: string): Settings {
  const q = new URLSearchParams(search);
  const get = (key: string) => q.get(key) ?? '';
  const color = parseColor(get('color')) ?? DEFAULT_COLOR;
  let convention: Convention = CONVENTIONS.find((c) => c.value === get('names'))?.value ?? 'tailwind';
  let steps = parseSteps(get('steps'), convention) ?? 11;
  const names = splitNames(get('custom'));
  if (convention === 'custom' && checkCustomNames(names, steps)) {
    convention = 'tailwind';
    steps = parseSteps(get('steps'), convention) ?? 11;
  }
  const tint = parseTint(get('tint'));
  const name = isPaletteName(get('name')) ? get('name') : null;
  const curve = Object.hasOwn(TW_CURVES, get('curve')) ? get('curve') : null;
  const roles = { ...initialSettings.roles };
  for (const r of ROLES) {
    if (!q.has(r)) continue;
    const value = get(r);
    const palette = ROLE_PALETTES[r].includes(value);
    const hex = palette ? null : parseColor(value);
    roles[r] = {
      ...roles[r],
      on: true,
      choice: hex ? 'custom' : palette ? value : '',
      ...(hex && { colorText: hex, color: hex }),
    };
  }
  return {
    ...initialSettings,
    colorText: color,
    color,
    nameText: name,
    name,
    stepsText: String(steps),
    convention,
    customText: convention === 'custom' ? names.join(' ') : '',
    valid: { steps, convention, names: convention === 'custom' ? names : convention, pending: false },
    curve,
    cap: get('cap') === '1',
    // Solo valores del deslizador (de 0 a 1 en pasos de 0,05), para que el control muestre lo que se calcula.
    tint: tint !== null && Math.abs(tint * 20 - Math.round(tint * 20)) < 1e-9 ? tint : initialSettings.tint,
    roles,
  };
}
