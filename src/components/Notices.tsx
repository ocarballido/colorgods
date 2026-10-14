// Lista única de avisos y notas encima de las tiras (U5, ux.md §6.2): avisos antes que notas, cada uno con el nombre
// de su escala. Los que señalan un paso llevan "Show in table", que abre la pestaña de su escala y lleva el foco a la
// fila. Sin avisos ni notas, la sección no aparece. El enlace va en línea al final del texto (decisión 96).
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
          <li key={n.key}>
            <Callout variant={n.warning ? 'warning' : 'note'}>
              {n.text}
              {n.row !== undefined && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => onShow(n)}
                    className="rounded-control text-accent-default underline hover:text-accent-hover"
                  >
                    Show in table<span className="sr-only">: {n.at}</span>
                  </button>
                </>
              )}
            </Callout>
          </li>
        ))}
      </ul>
    </section>
  );
}
