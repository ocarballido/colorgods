// Resumen del resultado (ux.md §6.1): sigue a lo calculado, no a lo escrito (U2). "Copy link" llega con F18.
import type { Scales } from '../../tools/scales.mjs';
import { namesLabel, type Settings } from '../settings';

export function ResultSummary({ settings: s, result }: { settings: Settings; result: Scales }) {
  const v = s.valid;
  const items = [
    `Scales for ${result.input.hex}`,
    `${v.steps} steps`,
    v.pending ? 'Custom names (pending)' : `${namesLabel(v.convention).replace(/^c/, 'C')} names`,
    `Curve ${result.input.curve}`,
    // Sin croma, el motor calcula los neutros con tinte 0 (F12.1): el resumen dice lo calculado.
    result.warnings.some((w) => w.code === 'achromatic') ? 'Tint 0 (no hue)' : `Tint ${s.tint}`,
    ...(s.cap ? ['Chroma cap'] : []),
    // Roles activos (F20): "Roles: danger, warning".
    ...(Object.keys(result.roles).length ? [`Roles: ${Object.keys(result.roles).join(', ')}`] : []),
  ];
  return (
    <section aria-labelledby="summary-heading" className="flex flex-col gap-200">
      <h3 id="summary-heading" className="text-heading-4 font-600 leading-snug">
        Summary
      </h3>
      <ul className="grid grid-cols-2 sm:flex">
        {items.map((item) => (
          <li
            key={item}
            className="flex-1 border-b border-neutral-default px-300 py-200 text-body-small leading-normal text-neutral-default"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
