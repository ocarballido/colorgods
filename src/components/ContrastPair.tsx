// Par de contraste (F11, ux.md §6.4); el cálculo está en pairData.ts. La región viva solo habla al cambiar un selector
// o con Swap, una vez, y no cuando cambian los ajustes; lo dicho se borra cuando cambian las escalas, para que el
// cursor virtual no lea un ratio que ya no se ve. Si se desactiva un rol que estaba en el par, el par vuelve al de
// por defecto y se dice, también a la vista (F11, ux.md §6.4); el foco se queda en la casilla del rol.
import { useState } from 'react';
import { FIXED, LEVELS, again, color, lostScale, measure, ratioText, type Pick } from './pairData';
import type { Scale } from './scaleData';
import { Button, Select, TestBadge, hintClass } from './ui';

const cell = 'border-b border-neutral-default px-300 py-200 text-left font-400 whitespace-nowrap';

export function ContrastPair({ scales }: { scales: Scale[] }) {
  const [pick, setPick] = useState<Pick>({ text: null, bg: null });
  const [said, setSaid] = useState({ text: '', scales, reset: false });
  const lost = lostScale(pick, scales);
  if (lost) {
    // Ajuste del estado durante el render (patrón de React para estado que depende de las props).
    setPick({ text: null, bg: null });
    setSaid({ text: `The pair was reset because ${lost} was turned off.`, scales, reset: true });
  }
  const m = measure(pick, scales);

  const change = (next: Pick) => {
    setPick(next);
    const { spoken } = measure(next, scales);
    setSaid((prev) => ({ text: again(prev.text, spoken), scales, reset: false }));
  };

  const options = FIXED.map(({ value, label }) => ({ value, label }));
  const groups = scales.map((s) => ({
    label: s.name,
    options: s.steps.map((_, k) => {
      const c = color(s, k);
      return { value: c.value, label: c.label };
    }),
  }));

  return (
    <section aria-labelledby="pair-heading" className="flex flex-col gap-200">
      <h3 id="pair-heading" className="text-heading-4 font-600 leading-snug">
        Contrast pair
      </h3>
      <div className="flex flex-col gap-400">
        <div className="flex flex-col gap-200 sm:flex-row sm:items-end sm:gap-400">
          <div className="sm:min-w-0 sm:flex-1">
            <Select
              id="pair-text"
              label="Text"
              value={m.text.value}
              options={options}
              groups={groups}
              onChange={(text) => change({ ...pick, text })}
            />
          </div>
          <Button onClick={() => change({ text: m.bg.value, bg: m.text.value })}>Swap</Button>
          <div className="sm:min-w-0 sm:flex-1">
            <Select
              id="pair-bg"
              label="Background"
              value={m.bg.value}
              options={options}
              groups={groups}
              onChange={(bg) => change({ ...pick, bg })}
            />
          </div>
        </div>
        {/* Visible y oculto al lector: ya lo dice la región viva de abajo. */}
        {said.reset && said.scales === scales && (
          <p aria-hidden="true" className={hintClass}>
            {said.text}
          </p>
        )}
        <div className="flex flex-col gap-400 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-400 overflow-hidden rounded-control border border-neutral-default p-400 lg:flex-1 lg:self-stretch">
            <p className="text-heading-2 font-600 leading-tight">{ratioText(m.ratio)}:1</p>
            <p className="text-caption-default leading-snug">{m.caption}</p>
            {/* Muestras sobre el fondo elegido, hasta los bordes de la caja; con colores forzados conservan su color. */}
            <div
              className="swatches -m-400 flex flex-1 flex-col gap-400 p-400 forced-color-adjust-none"
              style={{ background: m.bg.hex, color: m.text.hex }}
            >
              <p className="text-heading-2 font-600 leading-tight">Large text sample</p>
              <p className="text-body-default leading-normal">Normal text sample</p>
            </div>
          </div>
          <table className="text-body-small leading-normal lg:shrink-0">
            <caption className="sr-only">Levels for this pair</caption>
            <thead>
              <tr>
                <th scope="col" className="p-0">
                  <span className="sr-only">Use</span>
                </th>
                <th scope="col" className="p-0">
                  <span className="sr-only">Level</span>
                </th>
                <th scope="col" className="p-0">
                  <span className="sr-only">Result</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map(([use, level], i) => (
                <tr key={i}>
                  <th scope="row" className={cell}>
                    {use}
                  </th>
                  <td className={cell}>{level}</td>
                  <td className="px-100">
                    <TestBadge pass={m.passes[i]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {said.scales === scales ? said.text : ''}
      </p>
    </section>
  );
}
