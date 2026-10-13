// Par de contraste (F11, ux.md §6.4): texto y fondo entre los pasos de las escalas visibles, White y Black; por
// defecto, la marca sobre blanco. Ratio truncado y veredicto sin redondear (decisión 12). El paso se guarda por su
// posición k: si N o la convención cambian su nombre, el par sigue en el mismo paso (con menos pasos, en el último).
// La región viva solo habla al cambiar un selector o con Swap, una vez, y no cuando cambian los ajustes.
import { useState } from 'react';
import { hexToRgb } from '../../tools/scales.mjs';
import { contrastWith, ratioText, type Scale } from './scaleData';
import { Button, Select, TestBadge } from './ui';

const LEVELS = [
  ['Normal text', 'AA 4.5', 4.5],
  ['Normal text', 'AAA 7', 7],
  ['Large text', 'AA 3', 3],
  ['Large text', 'AAA 4.5', 4.5],
  ['UI components', '3', 3],
] as const;

const NBSP = String.fromCharCode(160);
const cell = 'border-b border-neutral-default px-300 py-200 text-left font-400 whitespace-nowrap';

// Valor de un selector: "white", "black" o "<escala>:<k>". null es el de por defecto.
type Pick = { text: string | null; bg: string | null };
type Color = { value: string; hex: string; name: string; label: string };

const FIXED: Color[] = [
  { value: 'white', hex: '#FFFFFF', name: 'white', label: 'White' },
  { value: 'black', hex: '#000000', name: 'black', label: 'Black' },
];

function color(scale: Scale, k: number): Color {
  const step = scale.steps[k];
  const name = `${scale.name} ${step.name}`;
  return { value: `${scale.id}:${k}`, hex: step.hex, name, label: step.anchor ? `${name} (your color)` : name };
}

// Un paso que ya no existe (un rol desactivado, en otra parte de C4) vuelve al valor por defecto.
function resolve(value: string, scales: Scale[]): Color | undefined {
  const fixed = FIXED.find((c) => c.value === value);
  if (fixed) return fixed;
  const [id, k] = value.split(':');
  const scale = scales.find((s) => s.id === id);
  return scale && color(scale, Math.min(Number(k), scale.steps.length - 1));
}

function measure(pick: Pick, scales: Scale[]) {
  const brand = `color:${scales[0].steps.findIndex((s) => s.anchor)}`;
  const text = resolve(pick.text ?? brand, scales) ?? resolve(brand, scales)!;
  const bg = resolve(pick.bg ?? 'white', scales) ?? FIXED[0];
  const ratio = contrastWith(text.hex, hexToRgb(bg.hex));
  const passes = LEVELS.map(([, , min]) => ratio >= min);
  const n = passes.filter(Boolean).length;
  const caption = `${text.name[0].toUpperCase()}${text.name.slice(1)} on ${bg.name}. Passes ${n} of 5 levels.`;
  return { text, bg, ratio, passes, caption };
}

export function ContrastPair({ scales }: { scales: Scale[] }) {
  const [pick, setPick] = useState<Pick>({ text: null, bg: null });
  const [said, setSaid] = useState('');
  const m = measure(pick, scales);

  const change = (next: Pick) => {
    setPick(next);
    const n = measure(next, scales);
    const which = LEVELS.filter((_, i) => n.passes[i]).map(([use, level]) => `${use.toLowerCase()} ${level}`);
    const text = `${ratioText(n.ratio)}:1. ${n.caption.slice(0, -1)}${which.length ? `: ${which.join(', ')}` : ''}.`;
    // Un espacio duro alterno hace que se anuncie también un texto igual al anterior.
    setSaid((prev) => (prev === text ? `${text}${NBSP}` : text));
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
        {said}
      </p>
    </section>
  );
}
