// Página de colorgods (C4, parte 1: estructura y entrada). Dos columnas desde 1024 px y una por debajo (decisión 58).
// El resultado se calcula al momento con build() del motor y los últimos valores válidos (U1, U2).
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { build, suggest } from '../tools/scales.mjs';
import { MainColorPanel } from './components/MainColorPanel';
import { ResultSummary } from './components/ResultSummary';
import { ScaleStrips } from './components/ScaleStrips';
import { ScaleTables } from './components/ScaleTables';
import { visibleScales } from './components/scaleData';
import { Tabs } from './components/Tabs';
import { HowItWorks, SiteFooter, SiteHeader } from './components/SiteChrome';
import { StatusRegion } from './components/StatusRegion';
import { initialSettings, namesLabel, reducer, stepsError, type Field } from './settings';

// Enlaces de saltar: visibles en una columna; en dos columnas, solo con el foco (decisión 58).
const skipClass =
  'self-start rounded-control text-body-small leading-normal text-accent-default underline lg:sr-only lg:focus:not-sr-only lg:focus:absolute lg:focus:z-20 lg:focus:bg-neutral-default lg:focus:p-200';

// Un error que aparece al salir del campo no puede mover el botón entre pointerdown y pointerup, o el clic se pierde
// (ux.md §4, solución del curso): con el puntero pulsado, el error espera a que se suelte o se cancele el gesto.
function usePointerSafeBlur(onBlur: (field: Field) => void) {
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
    (field: Field) => {
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

// La columna de ajustes se queda fija al desplazar solo si cabe entera en la ventana (ux.md §3).
function useFitsInWindow() {
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
  }, []);
  return [ref, fits] as const;
}

export default function App() {
  const [settings, dispatch] = useReducer(reducer, initialSettings);
  const [tab, setTab] = useState('main');
  const [settingsRef, fits] = useFitsInWindow();
  const onBlur = usePointerSafeBlur(useCallback((field: Field) => dispatch({ type: 'blur', field }), []));
  const { color, valid, curve, cap, tint } = settings;
  const suggested = useMemo(() => suggest(color), [color]);
  const result = useMemo(
    () => build(color, { steps: valid.steps, names: valid.names, curve, cap, tint }),
    [color, valid, curve, cap, tint],
  );
  const colorName = settings.name ?? suggested.name;
  const scales = useMemo(() => visibleScales(result, colorName), [result, colorName]);
  // Errores que aparecen en un campo sin el foco (al cambiar de convención o de N): se dicen con el resumen.
  const stepsErr = settings.touched.steps && stepsError(settings);
  const extra = [
    stepsErr &&
      `Steps: ${stepsErr} The result still uses ${valid.steps} steps with ${namesLabel(valid.convention)} names.`,
    valid.pending && 'Custom names pending.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <SiteHeader />
      <main className="lg:flex lg:items-start">
        <section
          ref={settingsRef}
          id="settings"
          aria-labelledby="settings-heading"
          tabIndex={-1}
          className={`flex flex-col gap-200 p-400 sm:px-600 lg:w-[22.5rem] lg:shrink-0 lg:px-400 ${fits ? 'lg:sticky lg:top-[var(--cg-header-height)]' : ''}`}
        >
          <h2 id="settings-heading" className="sr-only">
            Settings
          </h2>
          <a href="#result" className={skipClass}>
            Skip to result
          </a>
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
                  // Provisional: los roles (F20 a F23) llegan en otra parte de C4.
                  focusable: true,
                  panel: (
                    <p className="text-body-default leading-normal text-neutral-subtle">
                      Danger, warning, success and info palettes are coming soon.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </section>
        <div className="min-w-0 flex-1 px-400 py-600 sm:px-600 lg:px-[clamp(2rem,calc(10.526vw_-_4.737rem),5rem)]">
          <div className="mx-auto flex max-w-content flex-col gap-600">
            <section id="result" aria-labelledby="result-heading" tabIndex={-1} className="flex flex-col gap-600">
              <a href="#settings" className={skipClass}>
                Back to settings
              </a>
              <h2 id="result-heading" className="sr-only">
                Result
              </h2>
              <ResultSummary settings={settings} result={result} />
              <ScaleStrips scales={scales} rule={result.rule} colorName={colorName} />
              <ScaleTables scales={scales} result={result} pending={valid.pending} />
            </section>
            <StatusRegion result={result} extra={extra} />
            <HowItWorks />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
