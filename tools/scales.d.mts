// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tools/scales.d.mts.
// Copiado en colorgods en el paso C2 (decisión A2) y reescrito en el paso C3 para el motor a N pasos.

// Tipos de tools/scales.mjs para la web (TypeScript). La lógica está en el .mjs.

export type Oklch = [number, number, number];
export type Convention = 'tailwind' | 'sds' | 'radix' | 'custom';
export type Role = 'danger' | 'warning' | 'success' | 'info';

// Paso de una escala sin nombre. clip: % de croma que quita el ajuste a sRGB (0 si no recorta). anchor: el de la marca.
export type Step = { hex: string; oklch: Oklch; clip: number; anchor?: true };
export type ColorScale = {
  curve: string;
  chromaRatio: number;
  anchor: number;
  achromatic: boolean;
  extreme: boolean;
  steps: Step[];
};
export type PlainScale = { steps: Step[] };
export type NamedStep = Step & { name: string };

export type RoleProposal = { palette: string; chosen?: true; changed?: string; collision?: true };

export type ScaleWarning =
  | { code: 'achromatic' }
  | { code: 'extreme' }
  | { code: 'clipped'; scale: string; steps: { name: string; clip: number }[] }
  | { code: 'close'; scale: string; pairs: [string, string][] }
  | { code: 'role-changed'; role: Role; from: string; to: string }
  | { code: 'role-collision'; role: Role; palette: string };

export type BuildOptions = {
  steps?: number;
  names?: Exclude<Convention, 'custom'> | string[];
  curve?: string | null;
  cap?: boolean;
  tint?: number;
  // Roles activos: null para la paleta propuesta, o una paleta de su margen elegida por el usuario.
  roles?: Partial<Record<Role, string | null>>;
};

export type Scales = {
  input: { hex: string; curve: string; oklch: Oklch; chromaRatio: number; anchorStep: string };
  names: string[];
  color: NamedStep[];
  roles: Partial<Record<Role, NamedStep[]>>;
  rolePalettes: Partial<Record<Role, string>>;
  neutral: NamedStep[];
  // Nombres de paso, o null si ningún paso cumple. brand: el paso de la marca y su contraste sin truncar.
  rule: {
    aa: { white: string | null; black: string | null };
    large: { white: string | null; black: string | null };
    brand: { step: string; white: number; black: number };
  };
  warnings: ScaleWarning[];
};

export type CustomNamesError =
  | { code: 'count'; have: number; need: number }
  | { code: 'char'; name: string }
  | { code: 'duplicate'; names: [string, string] };

export const TW_CURVES: Record<string, [number, number][]>;
export const TW_HUES: Record<string, number>;
export const ACHROMATIC: number;
export const ROLES: Role[];
export const ROLE_PALETTES: Record<Role, string[]>;
export const MIN_STEPS: number;
export const MAX_STEPS: Record<Convention, number>;

export function pyRound(x: number): number;
export function rgbToOklch(r: number, g: number, b: number): Oklch;
export function oklchToRgbGamut(L: number, C: number, H: number): [number[], number];
export function hexs(rgb: number[]): string;
export function hexToRgb(hex: string): number[];
export function luminance(rgb: number[]): number;
export function contrast(a: number[], b: number[]): number;
export function truncate2(x: number): number;

export function parseColor(input: unknown): string | null;
export function isPaletteName(name: string): boolean;
export function parseTint(input: unknown): number | null;
export function stepNames(N: number, convention?: Exclude<Convention, 'custom'>): string[];
export function parseSteps(input: unknown, convention?: Convention): number | null;
export function fillNames(N: number, m?: number): string[];
export function checkCustomNames(names: string[], N: number): CustomNamesError | null;

export function ladder(N: number): number[];
export function nearestStep(hex: string, N: number): number;
export function isExtreme(hex: string): boolean;
export function colorScale(hex: string, N: number, options?: { curve?: string; cap?: boolean }): ColorScale;
export function paletteScale(palette: string, N: number): PlainScale;
export function neutralScale(hex: string, N: number, tint?: number): PlainScale;
export function proposeRoles(hex: string, chosen?: Partial<Record<Role, string>>): Record<Role, RoleProposal>;
export function contrastRule(
  scales: { steps: { hex: string }[]; anchor?: number }[],
  level?: number,
): { white: number; black: number };
export function build(hex: string, options?: BuildOptions): Scales;
export function oklchText(oklch: Oklch): string;
export function toFigmaTokens(scales: Scales, options: { name: string }): string;
export function suggest(hex: string): { curve: string; name: string };
