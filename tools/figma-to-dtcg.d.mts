// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tools/figma-to-dtcg.d.mts.
// Copiado sin cambios en colorgods (decisión A2 o paso C2). Lo que sigue es el archivo original.

// Tipos de tools/figma-to-dtcg.mjs para la web (TypeScript). La lógica está en el .mjs.

export type FigmaType = 'number' | 'string' | 'boolean';
export type ScopeTypes = Record<FigmaType, Record<string, string>>;
export type SourceFile = { path: string; text: string };
export type Unresolved = { type: FigmaType; key: string; scopes: string[]; ids: string[] };
export type MissingRef = { id: string; ref: string; file: string };
export type Count = {
  files: number;
  alias: number;
  dimension: number;
  fontWeight: number;
  fontFamily: number;
  color: number;
  alpha: number;
  number: number;
  excluded: number;
};

export const SCOPE_TYPES: ScopeTypes;
export const TYPE_OPTIONS: Record<FigmaType, string[]>;
export function scopeKey(scopes: string[]): string;
export function typeFor(type: string, scopes: string[], map?: ScopeTypes): string | null;
export function normalize(
  files: SourceFile[],
  options?: { map?: ScopeTypes },
): { files: SourceFile[]; count: Count; unresolved: Unresolved[]; missingRefs: MissingRef[] };
export function summary(count: Count): string;
export function problems(result: { unresolved: Unresolved[]; missingRefs: MissingRef[] }): string;
export function withScopeTypes(source: string, map: ScopeTypes): string;
