// Resumen del resultado (ux.md §6.1): sigue a lo calculado, no a lo escrito (U2). "Copy link" copia el enlace con los
// ajustes (F18) y confirma con "Link copied" en el botón y en una región de estado; "Go to export" lleva a Exportar.
import type { Scales } from '../../tools/scales.mjs';
import { namesLabel, type Settings } from '../settings';
import { useCopy } from '../useCopy';
import { Button, buttonClass } from './ui';

type Props = { settings: Settings; result: Scales; link: () => string };

export function ResultSummary({ settings: s, result, link }: Props) {
  const [copied, copy, failed] = useCopy('Link copied', 'Couldn’t copy. Copy the address from the browser bar.');
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
      <div className="flex flex-col gap-200 sm:flex-row">
        {/* El nombre del botón no cambia: lo dice la región de estado, una sola vez (4.1.3, 2.5.3). */}
        <Button className="sm:flex-1" label="Copy link" onClick={() => copy(link())}>
          {failed ? 'Copy link' : copied || 'Copy link'}
        </Button>
        <a href="#export" className={`${buttonClass(true)} sm:flex-1`}>
          Go to export
        </a>
      </div>
      <p role="status" className={failed ? 'text-caption-default leading-snug text-danger-default' : 'sr-only'}>
        {copied}
      </p>
    </section>
  );
}
