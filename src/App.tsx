// Página de colorgods (C4: estructura y entrada, tiras y tablas, avisos y par de contraste, paletas semánticas,
// exportación y ajustes en la URL). Dos columnas desde 1024 px; por debajo, los ajustes van en un panel modal que
// se abre desde la cabecera (decisión 95, que sustituye a la 58).
// El resultado se calcula al momento con build() del motor y los últimos valores válidos (U1, U2).
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { build, suggest, type Role } from '../tools/scales.mjs';
import { ContrastPair } from './components/ContrastPair';
import { ExportSection } from './components/ExportSection';
import { MainColorPanel } from './components/MainColorPanel';
import { Notices } from './components/Notices';
import { notices, type Notice } from './components/noticeData';
import { ResultSummary } from './components/ResultSummary';
import { ScaleStrips } from './components/ScaleStrips';
import { SemanticPanel } from './components/SemanticPanel';
import { ScaleTables, rowId } from './components/ScaleTables';
import { visibleScales } from './components/scaleData';
import { Tabs } from './components/Tabs';
import { HowItWorks, SiteFooter, SiteHeader } from './components/SiteChrome';
import { StatusRegion } from './components/StatusRegion';
import { Menu, X } from './components/icons';
import { blockingErrors, namesLabel, reducer, roleOptions, stepsError, type Field } from './settings';
import { searchFromSettings, settingsFromSearch } from './url';

// Enlaces de saltar: solo en dos columnas y solo con el foco; en una columna el resultado ya va primero (decisión 95).
const skipClass =
  'sr-only self-start rounded-control text-body-small leading-normal text-accent-default underline focus:not-sr-only focus:absolute focus:z-20 focus:bg-neutral-default focus:p-200';

// IconButton de ColorScaleUI: 40 × 40 px, sin fondo en reposo.
const iconButtonClass = 'rounded-control p-200 text-neutral-default hover:bg-neutral-hover active:bg-neutral-active';

// Dos columnas desde 1024 px (el lg de Tailwind CSS).
const wideQuery = matchMedia('(min-width: 64rem)');
const subscribeWide = (onChange: () => void) => {
  wideQuery.addEventListener('change', onChange);
  return () => wideQuery.removeEventListener('change', onChange);
};
const useWide = () => useSyncExternalStore(subscribeWide, () => wideQuery.matches);

// Un error que aparece al salir del campo no puede mover el botón entre pointerdown y pointerup, o el clic se pierde
// (ux.md §4, solución del curso): con el puntero pulsado, el error espera a que se suelte o se cancele el gesto.
function usePointerSafeBlur<T>(onBlur: (field: T) => void) {
  const down = useRef(false);
  const waiting = useRef<AbortController | null>(null);
  useEffect(() => {
    const press = () => (down.current = true);
    const release = () => (down.current = false);
    document.addEventListener('pointerdown', press, true);
    document.addEventListener('pointerup', release, true);
    document.addEventListener('pointercancel', release, true);
    return () => {
      document.removeEventListener('pointerdown', press, true);
      document.removeEventListener('pointerup', release, true);
      document.removeEventListener('pointercancel', release, true);
      waiting.current?.abort();
    };
  }, []);
  return useCallback(
    (field: T) => {
      if (!down.current) return onBlur(field);
      // Si ya había un error esperando, se muestra ya: solo espera el último.
      waiting.current?.abort();
      const controller = new AbortController();
      waiting.current = controller;
      const later = () => {
        controller.abort();
        setTimeout(() => onBlur(field));
      };
      controller.signal.addEventListener('abort', () => {
        if (waiting.current === controller) waiting.current = null;
      });
      window.addEventListener('pointerup', later, { signal: controller.signal });
      window.addEventListener('pointercancel', later, { signal: controller.signal });
    },
    [onBlur],
  );
}

// Ajustes en la URL (F18, ux.md §4): history.replaceState tras una pausa en los cambios, sin entradas en el historial.
// Al abrir la página no se toca la URL hasta el primer cambio; desde entonces se escribe siempre, también al volver a
// los ajustes del principio (revisión de la parte 5).
const URL_DELAY = 500;
const writeSearch = (search: string) => history.replaceState(history.state, '', `?${search}${location.hash}`);
function useSearchInUrl(search: string) {
  const first = useRef<string | null>(search);
  useEffect(() => {
    if (search === first.current) return;
    first.current = null;
    const timer = setTimeout(() => writeSearch(search), URL_DELAY);
    return () => clearTimeout(timer);
  }, [search]);
}

// La columna de ajustes se queda fija al desplazar solo si cabe entera en la ventana (ux.md §3). Se vuelve a medir al
// pasar de una a dos columnas, porque los ajustes se montan en otro sitio.
function useFitsInWindow(wide: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const header = document.querySelector('header');
    const check = () => setFits(el.offsetHeight <= window.innerHeight - (header?.offsetHeight ?? 0));
    const observer = new ResizeObserver(check);
    observer.observe(el);
    window.addEventListener('resize', check);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [wide]);
  return [ref, fits] as const;
}

export default function App() {
  // Al abrir, los ajustes de la URL, cada uno validado antes de llegar al motor (src/url.ts).
  const [settings, dispatch] = useReducer(reducer, location.search, settingsFromSearch);
  const [tab, setTab] = useState('main');
  const wide = useWide();
  const [settingsRef, fits] = useFitsInWindow(wide);
  // Panel de ajustes por debajo de 1024 px: <dialog> modal (foco atrapado, Escape, resto inerte). Se cierra también
  // con el botón y con un clic en el fondo, y el foco vuelve al botón de menú. Al pasar a dos columnas, se cierra.
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const pressedBackdrop = useRef(false);
  // Hueco dentro del panel para las regiones vivas: con el panel abierto, las de fuera quedan inertes y no hablarían.
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !wide) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) dialog.close();
  }, [menuOpen, wide]);
  const onBlur = usePointerSafeBlur(useCallback((field: Field) => dispatch({ type: 'blur', field }), []));
  const onRoleBlur = usePointerSafeBlur(useCallback((role: Role) => dispatch({ type: 'roleBlur', role }), []));
  const { color, valid, curve, cap, tint } = settings;
  const suggested = useMemo(() => suggest(color), [color]);
  const roles = useMemo(() => roleOptions(settings.roles), [settings.roles]);
  const result = useMemo(
    () => build(color, { steps: valid.steps, names: valid.names, curve, cap, tint, roles }),
    [color, valid, curve, cap, tint, roles],
  );
  const colorName = settings.name ?? suggested.name;
  const search = useMemo(() => searchFromSettings(settings), [settings]);
  useSearchInUrl(search);
  const link = () => {
    writeSearch(search);
    return `${location.origin}${location.pathname}?${search}`;
  };
  const errors = blockingErrors(settings, suggested.name);
  // Enlace del resumen de errores: abre la pestaña de ajustes del campo y le da el foco (ux.md §4).
  const goTo = (id: string) => {
    flushSync(() => setTab(id.startsWith('role-') ? 'semantic' : 'main'));
    // En una columna, el campo está en el panel: se abre antes de darle el foco.
    if (!wide) {
      dialogRef.current?.showModal();
      setMenuOpen(true);
    }
    document.getElementById(id)?.focus();
  };
  const scales = useMemo(() => visibleScales(result, colorName), [result, colorName]);
  const list = useMemo(() => notices(result, scales), [result, scales]);
  // Pestaña de la tabla abierta, por escala. "Show in table" la cambia y lleva el foco a la fila (ux.md §6.2 y §9).
  const [table, setTable] = useState('color');
  const showInTable = (n: Notice) => {
    flushSync(() => setTable(n.scale));
    document.getElementById(rowId(n.scale, n.row!))?.focus();
  };
  // Errores que aparecen en un campo sin el foco (al cambiar de convención o de N): se dicen con el resumen.
  const stepsErr = settings.touched.steps && stepsError(settings);
  const extra = [
    stepsErr &&
      `Steps: ${stepsErr} The result still uses ${valid.steps} steps with ${namesLabel(valid.convention)} names.`,
    valid.pending && 'Custom names pending.',
  ]
    .filter(Boolean)
    .join(' ');

  const settingsPanel = (
    <section
      ref={settingsRef}
      id="settings"
      aria-labelledby="settings-heading"
      tabIndex={-1}
      className={`flex flex-col gap-200 p-400 sm:px-600 lg:px-400 ${fits ? 'lg:sticky lg:top-[var(--cg-header-height)]' : ''}`}
    >
      <h2 id="settings-heading" className="sr-only">
        Settings
      </h2>
      {wide && (
        <a href="#result" className={skipClass}>
          Skip to result
        </a>
      )}
      <div className="rounded-container border border-neutral-default bg-neutral-default p-400">
        <Tabs
          label="Settings"
          fill
          selected={tab}
          onSelect={setTab}
          tabs={[
            {
              id: 'main',
              label: 'Main color',
              panel: (
                <MainColorPanel
                  settings={settings}
                  dispatch={dispatch}
                  onBlur={onBlur}
                  result={result}
                  suggested={suggested}
                />
              ),
            },
            {
              id: 'semantic',
              label: 'Semantic palettes',
              panel: (
                <SemanticPanel
                  settings={settings}
                  dispatch={dispatch}
                  onBlur={onRoleBlur}
                  result={result}
                  list={list}
                />
              ),
            },
          ]}
        />
      </div>
    </section>
  );

  return (
    <>
      <SiteHeader
        menu={
          <button
            ref={menuRef}
            type="button"
            aria-label="Settings"
            aria-expanded={menuOpen}
            aria-controls="settings-dialog"
            onClick={() => setMenuOpen(true)}
            className={`${iconButtonClass} lg:hidden`}
          >
            <Menu />
          </button>
        }
      />
      <main className="lg:flex">
        {/* Columna de ajustes: todo el alto entre la cabecera y el pie, con background/neutral/subtle (Figma). */}
        {wide && <div className="w-[22.5rem] shrink-0 bg-neutral-subtle">{settingsPanel}</div>}
        {/* El panel solo se cierra con un clic que empieza y acaba en el fondo, no al soltar fuera un arrastre. El clic
            en el fondo es solo del puntero: con teclado se cierra con Escape (nativo del <dialog>) o con el botón. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
        <dialog
          ref={dialogRef}
          id="settings-dialog"
          aria-labelledby="settings-heading"
          onClose={() => {
            setMenuOpen(false);
            menuRef.current?.focus();
          }}
          onPointerDown={(e) => (pressedBackdrop.current = e.target === e.currentTarget)}
          onClick={(e) => pressedBackdrop.current && e.target === e.currentTarget && dialogRef.current?.close()}
          className="settings-dialog fixed top-[var(--cg-header-height)] bottom-0 left-0 m-0 h-auto max-h-none w-full max-w-[22.5rem] overflow-y-auto border-0 bg-neutral-subtle p-0 text-neutral-default"
        >
          {!wide && (
            <>
              <div className="flex justify-end px-400 pt-400 sm:px-600">
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => dialogRef.current?.close()}
                  className={iconButtonClass}
                >
                  <X />
                </button>
              </div>
              {settingsPanel}
              <div ref={setSlot} />
            </>
          )}
        </dialog>
        <div className="min-w-0 flex-1 px-400 py-600 sm:px-600 lg:px-[clamp(2rem,calc(10.526vw_-_4.737rem),5rem)]">
          <div className="mx-auto flex max-w-content flex-col gap-600">
            <section id="result" aria-labelledby="result-heading" tabIndex={-1} className="flex flex-col gap-600">
              {wide && (
                <a href="#settings" className={skipClass}>
                  Back to settings
                </a>
              )}
              <h2 id="result-heading" className="sr-only">
                Result
              </h2>
              <ResultSummary settings={settings} result={result} link={link} />
              <Notices list={list} onShow={showInTable} />
              <ScaleStrips scales={scales} rule={result.rule} colorName={colorName} />
              <ContrastPair scales={scales} slot={slot} />
              <ScaleTables scales={scales} list={list} pending={valid.pending} selected={table} onSelect={setTable} />
            </section>
            <ExportSection
              result={result}
              name={colorName}
              errors={errors}
              onShowErrors={() => dispatch({ type: 'showErrors' })}
              onGoTo={goTo}
            />
            <StatusRegion result={result} list={list} extra={extra} slot={slot} />
            <HowItWorks />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
