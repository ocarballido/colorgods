// Regla de contraste y tiras (U9, ux.md §6.3, F7, F26; decisiones 39, 48 y 60).
// Desde 640 px: filas "White AA" y "Black AA" alineadas con los pasos y una tira por escala, con muestras de al menos
// 24 px y desplazamiento horizontal compartido si no caben. Por debajo: filas de 8 muestras con el nombre de cada paso
// dentro, en negro o en blanco (el de más contraste, que siempre cumple AA), y sin filas de checks.
import type { CSSProperties } from 'react';
import type { NamedStep } from '../../tools/scales.mjs';
import { useOverflows } from '../useOverflows';
import { Check } from './icons';
import { BLACK, WHITE, contrastWith, ratioText, type Scale } from './scaleData';

const AA = 4.5;
// Columna de nombres de 64 px y muestras de al menos 24 px (decisión 60).
const columns = (n: number): CSSProperties => ({ gridTemplateColumns: `64px repeat(${n}, minmax(24px, 1fr))` });

type Rule = {
  aa: { white: string | null; black: string | null };
  large: { white: string | null; black: string | null };
  brand: { step: string; white: number; black: number };
};

// Un paso cuenta si cumple en todas las escalas visibles, sin el paso de la marca (F26, decisión 48).
const passes = (scales: Scale[], k: number, bg: number[]) =>
  scales.every((s) => s.steps[k].anchor || contrastWith(s.steps[k].hex, bg) >= AA);

const from = (step: string | null, dir: string) => (step ? `${step} and ${dir}` : 'no step');

function altText(scale: Scale) {
  const { steps } = scale;
  const anchor = steps.find((s) => s.anchor);
  return `${scale.name}, ${steps.length} steps from ${steps[0].name} to ${steps[steps.length - 1].name}${
    anchor ? `; your color is ${anchor.name}` : ''
  }`;
}

// Marca del paso de la marca: círculo blanco con el check (ScaleSwatch de B3).
function BrandMark({ size }: { size: 18 | 22 }) {
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-neutral-default text-neutral-default ${
        size === 22 ? 'size-[22px]' : 'size-[18px]'
      }`}
    >
      <Check size={14} />
    </span>
  );
}

const swatchStyle = (s: NamedStep): CSSProperties => ({ background: s.hex });

export function ScaleStrips({ scales, rule, colorName }: { scales: Scale[]; rule: Rule; colorName: string }) {
  const [scrollRef, overflows] = useOverflows<HTMLDivElement>();
  const names = scales[0].steps.map((s) => s.name);
  const n = names.length;
  const rows = [
    { label: 'White AA', bg: WHITE },
    { label: 'Black AA', bg: BLACK },
  ].map((r) => ({ ...r, marks: names.map((_, k) => passes(scales, k, r.bg)) }));
  const { brand } = rule;

  return (
    <section aria-labelledby="scales-heading" className="flex flex-col gap-200">
      <h3 id="scales-heading" className="text-heading-4 font-600 leading-snug">
        Scales
      </h3>
      <p className="text-body-default leading-normal">
        Same contrast at every step in every scale. Text on white: {from(rule.aa.white, 'darker')} (AA). Text on black:{' '}
        {from(rule.aa.black, 'lighter')} (AA).
      </p>
      <p className="text-caption-default leading-snug">
        Large text and UI components (3:1) on white: {from(rule.large.white, 'darker')}; on black:{' '}
        {from(rule.large.black, 'lighter')}.
      </p>

      {/* Desde 640 px: filas de la regla y tiras con el mismo desplazamiento. */}
      <div
        ref={scrollRef}
        className="hidden overflow-x-auto sm:block"
        tabIndex={overflows ? 0 : undefined}
        role={overflows ? 'group' : undefined}
        aria-label={overflows ? 'Scales and contrast rule' : undefined}
      >
        <div className="flex flex-col gap-200" style={{ minWidth: 64 + n * 24 }}>
          <div className="flex flex-col gap-100">
            <div aria-hidden="true" className="grid text-center text-caption-default leading-snug" style={columns(n)}>
              <span />
              {names.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
            {rows.map((r) => (
              <div key={r.label}>
                <p className="sr-only">
                  {r.label}: {names.filter((_, k) => r.marks[k]).join(', ') || 'no step'}
                </p>
                <div aria-hidden="true" className="grid h-[28px] items-center" style={columns(n)}>
                  <span className="text-caption-default leading-snug">{r.label}</span>
                  {r.marks.map((ok, k) => (
                    <span key={names[k]} className="flex justify-center text-neutral-subtle">
                      {ok && <Check />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {scales.map((scale) => (
            <div key={scale.id} className="grid items-center" style={columns(n)}>
              <span aria-hidden="true" className="truncate text-label-default font-500 leading-snug">
                {scale.name}
              </span>
              <div
                role="img"
                aria-label={altText(scale)}
                className="flex h-[64px] overflow-hidden rounded-control forced-color-adjust-none"
                style={{ gridColumn: `span ${n}` }}
              >
                {scale.steps.map((s) => (
                  <div key={s.name} className="flex flex-1 items-center justify-center" style={swatchStyle(s)}>
                    {s.anchor && <BrandMark size={22} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Por debajo de 640 px: filas de 8 con el nombre dentro (decisión 60, "30 pasos en móvil"). */}
      <div className="flex flex-col gap-200 sm:hidden">
        {scales.map((scale) => (
          <div key={scale.id} className="flex flex-col gap-100">
            <p aria-hidden="true" className="text-label-default font-500 leading-snug">
              {scale.name}
            </p>
            <div
              role="img"
              aria-label={altText(scale)}
              className="grid grid-cols-8 overflow-hidden rounded-control forced-color-adjust-none"
            >
              {scale.steps.map((s) => {
                const dark = contrastWith(s.hex, BLACK) >= contrastWith(s.hex, WHITE);
                return (
                  <div
                    key={s.name}
                    className={`flex h-[48px] flex-col items-center justify-center gap-[2px] text-caption-default leading-snug font-600 tracking-[1.2px] ${
                      dark ? 'text-[var(--cg-color-black)]' : 'text-[var(--cg-color-white)]'
                    }`}
                    style={swatchStyle(s)}
                  >
                    {s.anchor && <BrandMark size={18} />}
                    {s.name}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-caption-default leading-snug">
        <span className="sm:hidden">Each step name is in black or white, whichever passes AA on that color. </span>✓
        marks your color: {colorName} {brand.step}. It keeps your exact color, so its contrast is its own:{' '}
        {ratioText(brand.white)} with white, {ratioText(brand.black)} with black. It isn’t counted in the rule above.
      </p>
    </section>
  );
}
