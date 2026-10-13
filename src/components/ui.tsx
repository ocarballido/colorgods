// Controles básicos con el aspecto de los componentes de ColorScaleUI (TextField, Button, Select, Callout).
// Etiqueta visible; ayuda, error y estado asociados con aria-describedby; aria-invalid con error (ux.md §9).
import type { ReactNode } from 'react';
import { ChevronDown, CircleAlert, Info } from './icons';

const describedBy = (...ids: (string | false | null | undefined)[]) => ids.filter(Boolean).join(' ') || undefined;

export const labelClass = 'text-label-default font-500 leading-snug text-neutral-default';
export const hintClass = 'text-caption-default leading-snug text-neutral-subtle';
// Fondo del campo, como en Figma. El borde transparente se ve con colores forzados.
const fieldClass =
  'w-full rounded-control border border-transparent bg-neutral-strong px-300 py-200 text-body-default leading-normal text-neutral-default';

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-100 text-body-small leading-normal text-danger-default">
      <CircleAlert className="mt-[3px] shrink-0" />
      <span>{children}</span>
    </p>
  );
}

type TextFieldProps = {
  id: string;
  label: ReactNode;
  hint?: string;
  // Error que se ve (ya decidido si toca mostrarlo) y la línea que dice con qué sigue el resultado.
  error?: string | null;
  still?: string | null;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputMode?: 'numeric' | 'text';
  code?: boolean;
  multiline?: boolean;
  // Otras descripciones del campo fuera de él (por ejemplo, "Using #…" debajo de la muestra del color).
  extraDescribedBy?: string;
  // Controles al lado del campo, como los botones de los pasos.
  addon?: ReactNode;
  className?: string;
};

export function TextField({
  id,
  label,
  hint,
  error,
  still,
  value,
  onChange,
  onBlur,
  inputMode,
  code,
  multiline,
  extraDescribedBy,
  addon,
  className = '',
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const stillId = error && still ? `${id}-still` : undefined;
  const common = {
    id,
    value,
    onBlur,
    autoComplete: 'off',
    spellCheck: false,
    autoCapitalize: 'off',
    autoCorrect: 'off',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(hintId, errorId, stillId, extraDescribedBy),
    className: `${fieldClass} ${code ? 'font-mono text-code-default' : ''}`,
  } as const;
  return (
    <div className={`flex flex-col gap-100 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={hintClass}>
          {hint}
        </p>
      )}
      <div className="flex gap-200">
        {multiline ? (
          <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input {...common} type="text" inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />
        )}
        {addon}
      </div>
      {error && <FieldError id={errorId!}>{error}</FieldError>}
      {error && still && (
        <p id={stillId} className={hintClass}>
          {still}
        </p>
      )}
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  // aria-disabled y no disabled: un botón deshabilitado pierde el foco y el foco no se mueve al calcular (ux.md §9).
  inactive?: boolean;
  label?: string;
  className?: string;
};

export function Button({ children, onClick, inactive, label, className = '' }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={inactive || undefined}
      onClick={() => !inactive && onClick()}
      className={`inline-flex min-h-[38px] min-w-[44px] items-center justify-center rounded-control border border-neutral-strong px-400 py-200 text-label-default font-500 leading-snug text-neutral-default hover:bg-neutral-hover active:bg-neutral-active aria-disabled:cursor-not-allowed aria-disabled:text-neutral-subtle aria-disabled:hover:bg-transparent ${className}`}
    >
      {children}
    </button>
  );
}

type SelectProps = {
  id: string;
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function Select({ id, label, hint, value, options, onChange }: SelectProps) {
  const hintId = hint && `${id}-hint`;
  return (
    <div className="flex flex-col gap-100">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={hintClass}>
          {hint}
        </p>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-describedby={hintId || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} appearance-none pr-800`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-300 -translate-y-1/2 text-neutral-subtle" />
      </div>
    </div>
  );
}

export function Callout({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <div
      id={id}
      className="flex items-start gap-400 rounded-container border border-info-default bg-info-subtle p-400 text-neutral-default"
    >
      <Info className="shrink-0 text-info-default" />
      <div className="flex flex-col gap-200">
        <p className="text-label-default font-500 leading-snug text-info-default">Note</p>
        <p className="text-body-default leading-normal">{children}</p>
      </div>
    </div>
  );
}
