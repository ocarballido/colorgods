// Pestañas con el patrón ARIA (ux.md §6.5): flechas, Inicio y Fin para moverse, activación al momento, y Tab entra
// en el panel. Las usan los ajustes (decisión 61) y las tablas (U4). El panel oculto sigue montado para no perder lo
// escrito.
import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';

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
  // Con fill (ajustes), el cambio de pestaña se anima (decisión 103): la píldora de la elegida se desliza y el panel
  // entra desde el lado de su pestaña. Solo después del primer cambio, para no animar al abrir la página.
  const [moved, setMoved] = useState(false);
  const index = tabs.findIndex((t) => t.id === selected);
  const select = (id: string) => {
    setMoved(true);
    onSelect(id);
  };
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
    select(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };
  return (
    <div className={`flex flex-col ${fill ? 'gap-600' : 'gap-400'}`}>
      <div
        role="tablist"
        aria-label={label}
        className={`flex gap-100 rounded-300 bg-neutral-strong p-100 ${fill ? 'relative' : 'overflow-x-auto'}`}
      >
        {fill && (
          <span
            aria-hidden="true"
            className="absolute inset-y-100 left-100 rounded-control bg-neutral-default motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.2,0,0,1)]"
            style={{
              width: `calc((100% - ${tabs.length + 1} * var(--cg-space-100)) / ${tabs.length})`,
              transform: `translateX(calc(${index} * (100% + var(--cg-space-100))))`,
            }}
          />
        )}
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
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-[36px] rounded-control border border-transparent py-200 whitespace-nowrap ${fill ? 'relative flex-1 px-200 motion-safe:transition-colors motion-safe:duration-200' : 'shrink-0 px-400'} text-label-default font-500 leading-snug ${
                active
                  ? `text-accent-default ${fill ? '' : 'bg-neutral-default'}`
                  : 'text-neutral-subtle hover:text-neutral-default'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          className={fill && moved ? 'tab-panel' : undefined}
          style={{ '--tab-dir': i ? 1 : -1 } as CSSProperties}
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
