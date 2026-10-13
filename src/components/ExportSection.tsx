// Exportar (ux.md §7, F14 a F17): DTCG para Figma, CSS o @theme de Tailwind CSS 4, con la vista previa en el CodeBlock
// de ColorScaleUI, Download con el nombre del archivo y Copy, que confirma con "Copied". Se exportan todas las escalas
// visibles (color, roles activos y neutros). Con errores en F1, F2, F5, F6.1 o F23, la vista previa se sustituye por el
// resumen de errores (ux.md §4); Download y Copy siguen activos y, al pulsarlos, el resumen recibe el foco (D52).
import { useMemo, useRef, useState } from 'react';
import { toCss, toFigmaTokens, toTheme, type Scales } from '../../tools/scales.mjs';
import { useCopy } from '../useCopy';
import { CircleAlert, Copy } from './icons';
import { Button } from './ui';

const FORMATS = [
  { label: 'DTCG for Figma', file: 'Value.tokens.json', type: 'application/json', make: toFigmaTokens },
  { label: 'CSS', file: 'colors.css', type: 'text/css', make: toCss },
  { label: 'Tailwind @theme', file: 'theme.css', type: 'text/css', make: toTheme },
];

type Props = {
  result: Scales;
  name: string;
  errors: { id: string; text: string }[];
  // Muestra los errores en sus campos (al pulsar Download o Copy con errores).
  onShowErrors: () => void;
  // Lleva al campo de un error, en la pestaña de ajustes que toque.
  onGoTo: (id: string) => void;
};

export function ExportSection({ result, name, errors, onShowErrors, onGoTo }: Props) {
  const [format, setFormat] = useState(0);
  const [copied, copy] = useCopy('Copied', 'Couldn’t copy. Select the code and copy it.');
  const summary = useRef<HTMLDivElement>(null);
  const { file, type, make } = FORMATS[format];
  const blocked = errors.length > 0;
  const text = useMemo(() => (blocked ? '' : make(result, { name })), [blocked, make, result, name]);

  const act = (run: () => void) => () => {
    if (!blocked) return run();
    onShowErrors();
    summary.current?.focus();
  };
  const download = act(() => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = file;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href));
  });
  const copyCode = act(() => copy(text));

  return (
    <section id="export" aria-labelledby="export-heading" tabIndex={-1} className="flex flex-col gap-200">
      <h2 id="export-heading" className="text-heading-4 font-600 leading-snug">
        Export
      </h2>
      <div className="flex flex-col gap-400">
        <fieldset>
          <legend className="sr-only">Format</legend>
          <div className="flex flex-wrap gap-x-600 gap-y-200">
            {FORMATS.map((f, i) => (
              <label key={f.file} className="flex min-h-[24px] items-center gap-200 text-body-default leading-normal">
                <input
                  type="radio"
                  name="format"
                  checked={format === i}
                  onChange={() => setFormat(i)}
                  className="size-[24px] accent-[var(--cg-color-border-accent-strong)]"
                />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
        {blocked ? (
          <div
            ref={summary}
            tabIndex={-1}
            role="group"
            aria-labelledby="export-errors"
            className="flex flex-col gap-300 rounded-container border border-danger-default bg-danger-subtle p-400 lg:p-600"
          >
            <h3
              id="export-errors"
              className="flex items-center gap-300 text-body-default leading-normal font-600 text-danger-default"
            >
              <CircleAlert size={24} className="shrink-0" />
              Fix {errors.length} error{errors.length === 1 ? '' : 's'} to export
            </h3>
            <ul className="flex flex-col gap-200">
              {errors.map((e) => (
                <li key={e.id}>
                  <a
                    href={`#${e.id}`}
                    onClick={(ev) => {
                      ev.preventDefault();
                      onGoTo(e.id);
                    }}
                    className="text-body-default leading-normal text-accent-default underline hover:text-accent-hover"
                  >
                    {e.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="overflow-hidden rounded-container border border-neutral-default bg-neutral-subtle">
            <div className="flex items-center justify-between gap-200 border-b border-neutral-default py-100 pr-100 pl-400">
              <p className="text-caption-default leading-snug text-neutral-subtle">{file}</p>
              <div className="flex items-center gap-200">
                <p role="status" className="text-caption-default leading-snug text-success-default">
                  {copied}
                </p>
                <button
                  type="button"
                  aria-label={`Copy ${file}`}
                  onClick={copyCode}
                  className="rounded-control p-200 text-neutral-default hover:bg-neutral-hover active:bg-neutral-active"
                >
                  <Copy />
                </button>
              </div>
            </div>
            {/* Vista previa con su propio desplazamiento, enfocable para moverla con las flechas (1.4.10, 2.1.1). */}
            <pre
              role="region"
              aria-label={`${file} preview`}
              // jsx-a11y no contempla una región desplazable enfocable, como la de las tablas.
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              className="max-h-[18rem] overflow-auto p-400 font-mono text-code-default leading-normal"
            >
              {text}
            </pre>
          </div>
        )}
        <div className="flex flex-col gap-200 sm:flex-row">
          <Button primary className="sm:flex-1" onClick={download}>
            Download {file}
          </Button>
          <Button className="sm:flex-1" onClick={copyCode}>
            Copy
          </Button>
        </div>
      </div>
    </section>
  );
}
