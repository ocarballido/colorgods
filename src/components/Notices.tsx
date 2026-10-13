// Lista única de avisos y notas encima de las tiras (U5, ux.md §6.2): avisos antes que notas, cada uno con el nombre
// de su escala. Los que señalan un paso llevan "Show in table", que abre la pestaña de su escala y lleva el foco a la
// fila. Sin avisos ni notas, la sección no aparece. Desde 640 px el enlace va al lado; por debajo, debajo (Figma).
import type { Notice } from './noticeData';
import { Callout } from './ui';

export function Notices({ list, onShow }: { list: Notice[]; onShow: (n: Notice) => void }) {
  if (!list.length) return null;
  return (
    <section aria-labelledby="notices-heading" className="flex flex-col gap-200">
      <h3 id="notices-heading" className="text-heading-4 font-600 leading-snug">
        Warnings and notes
      </h3>
      <ul className="flex flex-col gap-200">
        {list.map((n) => (
          <li key={n.key} className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-400">
            <Callout variant={n.warning ? 'warning' : 'note'} className="w-full sm:min-w-0 sm:flex-1">
              {n.text}
            </Callout>
            {n.row !== undefined && (
              <button
                type="button"
                onClick={() => onShow(n)}
                className="min-h-[24px] shrink-0 rounded-control text-body-small leading-normal text-accent-default underline"
              >
                Show in table<span className="sr-only">: {n.at}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
