// Tablas (F9, F10, U4, ux.md §6.5): una por escala, elegida con pestañas. Cada tabla tiene su propio desplazamiento
// horizontal en un contenedor enfocable con nombre, y las dos primeras columnas se quedan fijas al desplazar.
import { useState } from 'react';
import type { Oklch, Scales } from '../../tools/scales.mjs';
import { BLACK, WHITE, contrastWith, ratioText, tabLabel, type Scale } from './scaleData';
import { Tabs } from './Tabs';

const F10 =
  'Every scale has the same contrast at each step, except your color’s step, which keeps your exact color. See the rule above the scales, or check any pair below.';

// oklch() con 3, 3 y 1 decimales fijos, como en Figma (0.020, no 0.02).
const oklch = ([L, C, H]: Oklch) => `${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)}`;

const head = 'border-b border-neutral-default bg-neutral-subtle px-300 py-200 text-left text-label-default font-500';
const cell = 'border-b border-neutral-default px-300 py-200 whitespace-nowrap';
// Columnas fijas: paso (150 px) y color (61 px), como en Figma. Llevan fondo para tapar lo que pasa por debajo. Por
// debajo de 640 px solo se fija el paso, para que quede sitio para las demás columnas.
const stick1 = 'sticky left-0 w-[150px] min-w-[150px]';
const stick2 = 'sm:sticky sm:left-[150px] w-[61px] min-w-[61px]';

function ScaleTable({ scale, pending }: { scale: Scale; pending: boolean }) {
  return (
    // Región desplazable enfocable para moverla con las flechas sin ratón (ux.md §6.5, 2.1.1); jsx-a11y no la contempla.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div role="region" aria-label={`${scale.name} table`} tabIndex={0} className="relative overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-body-small leading-normal">
        <caption className="sr-only">{scale.name} scale</caption>
        <thead>
          <tr>
            <th scope="col" className={`${head} ${stick1}`}>
              {pending ? 'Step · Names pending' : 'Step'}
            </th>
            <th scope="col" className={`${head} ${stick2}`}>
              Color
            </th>
            <th scope="col" className={`${head} min-w-[150px]`}>
              oklch()
            </th>
            <th scope="col" className={head}>
              Hex
            </th>
            <th scope="col" className={head}>
              White
            </th>
            <th scope="col" className={head}>
              Black
            </th>
            <th scope="col" className={head}>
              Clip
            </th>
          </tr>
        </thead>
        <tbody>
          {scale.steps.map((s) => (
            <tr key={s.name}>
              <th scope="row" className={`${cell} ${stick1} bg-neutral-default text-left font-400`}>
                {s.name}
                {s.anchor && ' · Your color'}
              </th>
              <td className={`${cell} ${stick2} bg-neutral-default`}>
                <span
                  aria-hidden="true"
                  className="swatches mx-auto block size-[24px] rounded-full forced-color-adjust-none"
                  style={{ background: s.hex }}
                />
              </td>
              <td className={cell}>{oklch(s.oklch)}</td>
              <td className={cell}>{s.hex}</td>
              <td className={cell}>{ratioText(contrastWith(s.hex, WHITE))}</td>
              <td className={cell}>{ratioText(contrastWith(s.hex, BLACK))}</td>
              <td className={cell}>{s.clip ? `${s.clip}%` : <span className="sr-only">none</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScaleTables({ scales, result, pending }: { scales: Scale[]; result: Scales; pending: boolean }) {
  const tabId = (scale: Scale) => `table-${scale.id}`;
  const [selected, setSelected] = useState(tabId(scales[0]));
  // Si la escala elegida deja de verse (un rol desactivado, en otra parte de C4), se vuelve a la primera.
  const current = scales.some((s) => tabId(s) === selected) ? selected : tabId(scales[0]);
  return (
    <section aria-labelledby="tables-heading" className="flex flex-col gap-200">
      <h3 id="tables-heading" className="text-heading-4 font-600 leading-snug">
        Tables
      </h3>
      <Tabs
        label="Tables"
        selected={current}
        onSelect={setSelected}
        tabs={scales.map((scale) => ({
          id: tabId(scale),
          label: tabLabel(result, scale),
          panel: (
            <div className="flex flex-col gap-400">
              <p className="text-caption-default leading-snug">{F10}</p>
              <ScaleTable scale={scale} pending={pending} />
            </div>
          ),
        }))}
      />
    </section>
  );
}
