// Pestañas de los ajustes (decisión 61) con el patrón ARIA de pestañas (ux.md §6.5): flechas, Inicio y Fin para
// moverse, activación al momento, y Tab entra en el panel. El panel oculto sigue montado para no perder lo escrito.
import { useRef, type KeyboardEvent, type ReactNode } from 'react';

type Tab = { id: string; label: string; panel: ReactNode };

export function SettingsTabs({
  tabs,
  selected,
  onSelect,
}: {
  tabs: Tab[];
  selected: string;
  onSelect: (id: string) => void;
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
    <div className="flex flex-col gap-600">
      <div role="tablist" aria-label="Settings" className="flex gap-100 rounded-300 bg-neutral-strong p-100">
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
              className={`min-h-[36px] flex-1 rounded-control border border-transparent px-200 py-200 whitespace-nowrap text-label-default font-500 leading-snug ${
                active ? 'bg-neutral-default text-accent-default' : 'text-neutral-subtle hover:text-neutral-default'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== selected}>
          {t.panel}
        </div>
      ))}
    </div>
  );
}
