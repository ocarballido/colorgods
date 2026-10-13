// Pestañas con el patrón ARIA (ux.md §6.5): flechas, Inicio y Fin para moverse, activación al momento, y Tab entra
// en el panel. Las usan los ajustes (decisión 61) y las tablas (U4). El panel oculto sigue montado para no perder lo
// escrito.
import { useRef, type KeyboardEvent, type ReactNode } from 'react';

// focusable: el panel recibe el foco con Tab cuando no tiene controles (patrón de pestañas de APG).
type Tab = { id: string; label: string; panel: ReactNode; focusable?: boolean };

export function Tabs({
  label,
  tabs,
  selected,
  onSelect,
  fill = false,
}: {
  label: string;
  tabs: Tab[];
  selected: string;
  onSelect: (id: string) => void;
  // fill: las pestañas reparten el ancho (ajustes); si no, miden su texto y la lista se desplaza si no cabe (tablas).
  fill?: boolean;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    onSelect(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };
  return (
    <div className={`flex flex-col ${fill ? 'gap-600' : 'gap-400'}`}>
      <div
        role="tablist"
        aria-label={label}
        className={`flex gap-100 rounded-300 bg-neutral-strong p-100 ${fill ? '' : 'overflow-x-auto'}`}
      >
        {tabs.map((t, i) => {
          const active = t.id === selected;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-[36px] rounded-control border border-transparent py-200 whitespace-nowrap ${fill ? 'flex-1 px-200' : 'shrink-0 px-400'} text-label-default font-500 leading-snug ${
                active ? 'bg-neutral-default text-accent-default' : 'text-neutral-subtle hover:text-neutral-default'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== selected}
          tabIndex={t.focusable ? 0 : undefined}
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
