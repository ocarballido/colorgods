// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tools/scales.d.mts.
// Copiado sin cambios en colorgods (decisión A2 o paso C2). Lo que sigue es el archivo original.

// Tipos de tools/scales.mjs para la web (TypeScript). La lógica está en el .mjs.

export type Oklch = [number, number, number];
export type ScaleRow = { step: number; oklch: Oklch; hex: string; clip?: number; anchor?: boolean };
export type ScaleWarning =
  | { code: 'achromatic' }
  | { code: 'extreme'; step: number }
  | { code: 'clipped'; steps: { step: number; clip: number }[] };
export type Scales = {
  input: { hex: string; reference: string; oklch: Oklch; anchorStep: number; chromaRatio: number };
  accent: ScaleRow[];
  neutral: ScaleRow[];
  warnings: ScaleWarning[];
};
// name y curve en null: los propuestos por suggest() (C25, C26).
export type ScaleState = { color: string; name: string | null; tint: number; curve: string | null };

export const STEPS: number[];
export const TW_CURVES: Record<string, [number, number][]>;
export const ACHROMATIC: number;
export function pyRound(x: number): number;
export function rgbToOklch(r: number, g: number, b: number): Oklch;
export function oklchToRgbGamut(L: number, C: number, H: number): [number[], number];
export function hexs(rgb: number[]): string;
export function hexToRgb(hex: string): number[];
export function contrast(a: number[], b: number[]): number;
export function parseColor(input: unknown): string | null;
export function isPaletteName(name: string): boolean;
export function parseTint(input: unknown): number | null;
export function build(hex: string, tint?: number, reference?: string | null): Scales;
export function oklchText(oklch: Oklch): string;
export function toFigmaTokens(
  scales: Scales,
  options: { name: string; accentSteps?: number[]; neutralSteps?: number[] },
): string;
export const TW_HUES: Record<string, number>;
export function suggest(hex: string): { curve: string; name: string };
export const DEFAULTS: ScaleState;
export function stateFromSearch(search: string): ScaleState;
export function searchFromState(state: ScaleState): string;
