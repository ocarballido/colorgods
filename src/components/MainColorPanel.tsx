// Pestaña "Main color" (decisión 61), en el orden de ux.md §5: color (F1), nombre (F5), pasos (F2), convención (F6)
// con nombres personalizados (F6.1) y nota de Radix (F13), curva (F3) con su gráfico, tope de croma (F24) y tinte (F4).
import { useState, type Dispatch } from 'react';
import { MAX_STEPS, MIN_STEPS, TW_CURVES, type Scales } from '../../tools/scales.mjs';
import {
  CONVENTIONS,
  colorError,
  multipleError,
  nameError,
  namesError,
  namesLabel,
  splitNames,
  stepsError,
  typedSteps,
  type Action,
  type Field,
  type Settings,
} from '../settings';
import { ChromaChart } from './ChromaChart';
import { Button, Callout, Checkbox, Select, TextField, hintClass, labelClass } from './ui';

const RADIX_NOTE =
  'With Radix you get its names, 1 to N, not its scale: your color sits on the step with the closest contrast, not necessarily step 9; lightness and chroma come from Tailwind CSS; and steps 11 and 12 don’t have the contrast Radix guarantees. For the Radix scale, use Radix’s own colors.';

const CURVES = Object.keys(TW_CURVES);

type Props = {
  settings: Settings;
  dispatch: Dispatch<Action>;
  onBlur: (field: Field) => void;
  result: Scales;
  suggested: { curve: string; name: string };
};

export function MainColorPanel({ settings: s, dispatch, onBlur, result, suggested }: Props) {
  const [filled, setFilled] = useState('');
  const shown = (field: Field, error: string | null) => (s.touched[field] ? error : null);
  const colorErr = shown('color', colorError(s));
  const stepsErr = shown('steps', stepsError(s));
  const namesErr = shown('names', namesError(s));
  const multipleErr = shown('multiple', multipleError(s));
  const typed = typedSteps(s);
  const max = MAX_STEPS[s.convention];
  const v = s.valid;
  const achromatic = result.warnings.some((w) => w.code === 'achromatic');
  const brand = result.color.find((x) => x.anchor)!;
  const count = splitNames(s.customText).length;

  const fill = (multiple: boolean) => {
    dispatch({ type: 'fill', multiple });
    // Rellenar sustituye lo escrito y se anuncia (ux.md §5); con m no válido, se dice por qué no se rellena.
    // El texto alterna un punto final para que se anuncie también cuando se repite.
    const error = multiple ? multipleError(s) : null;
    const text = error ? `Names not filled: ${error.charAt(0).toLowerCase()}${error.slice(1)}` : 'Names filled.';
    setFilled((t) => (t === text ? text.replace(/\.$/, '') : text));
  };

  return (
    <div className="flex flex-col gap-600">
      <div className="flex flex-col gap-200">
        <div className="flex gap-400">
          <TextField
            id="color"
            className="min-w-0 flex-1"
            label="Your color"
            hint="Hex, RGB or HSL"
            value={s.colorText}
            error={colorErr}
            extraDescribedBy="color-using"
            onChange={(text) => dispatch({ type: 'color', text })}
            onBlur={() => onBlur('color')}
          />
          <TextField
            id="palette-name"
            className="min-w-0 flex-1"
            label="Palette name"
            hint="Suggested by the hue"
            value={s.nameText ?? suggested.name}
            error={shown('name', nameError(s, suggested.name))}
            onChange={(text) => dispatch({ type: 'name', text })}
            onBlur={() => onBlur('name')}
          />
        </div>
        <div className="h-[56px] rounded-control border border-neutral-default" style={{ background: s.color }} />
        <p id="color-using" className={hintClass}>
          {colorErr ? `The result still uses ${s.color}.` : `Using ${s.color}`}
        </p>
      </div>

      <TextField
        id="steps"
        label="Steps"
        hint={`${MIN_STEPS} to ${max} with ${namesLabel(s.convention)} names`}
        inputMode="numeric"
        value={s.stepsText}
        error={stepsErr}
        still={`The result still uses ${v.steps} steps with ${namesLabel(v.convention)} names.`}
        onChange={(text) => dispatch({ type: 'steps', text })}
        onBlur={() => onBlur('steps')}
        addon={
          <>
            <Button
              label="Decrease steps"
              inactive={typed <= MIN_STEPS}
              onClick={() => dispatch({ type: 'stepBy', delta: -1 })}
            >
              −
            </Button>
            <Button
              label="Increase steps"
              inactive={typed >= max}
              onClick={() => dispatch({ type: 'stepBy', delta: 1 })}
            >
              +
            </Button>
          </>
        }
      />

      <fieldset className="flex flex-col gap-200">
        <legend className={`${labelClass} mb-200`}>Names</legend>
        <div className="flex flex-wrap gap-x-400 gap-y-200">
          {CONVENTIONS.map((c) => (
            <label key={c.value} className="flex min-h-[24px] items-center gap-200 text-body-default leading-normal">
              <input
                type="radio"
                name="convention"
                value={c.value}
                checked={s.convention === c.value}
                aria-describedby={c.value === 'radix' && s.convention === 'radix' ? 'radix-note' : undefined}
                onChange={() => dispatch({ type: 'convention', convention: c.value })}
                className="size-[24px] accent-[var(--cg-color-border-accent-strong)]"
              />
              {c.label}
            </label>
          ))}
        </div>
        {s.convention === 'radix' && <Callout id="radix-note">{RADIX_NOTE}</Callout>}
      </fieldset>

      {s.convention === 'custom' && (
        <div className="flex flex-col gap-200">
          <TextField
            id="custom-names"
            label="Step names"
            hint="Separated by spaces, commas or new lines"
            multiline
            code
            value={s.customText}
            error={namesErr}
            extraDescribedBy={namesErr ? undefined : 'custom-count'}
            onChange={(text) => dispatch({ type: 'custom', text })}
            onBlur={() => onBlur('names')}
          />
          {!namesErr && (
            <p id="custom-count" className={hintClass}>
              {count} name{count === 1 ? '' : 's'}, {typed} needed
            </p>
          )}
          <div className="flex flex-wrap items-end gap-200">
            <Button onClick={() => fill(false)}>Fill 1 to N</Button>
            <Button onClick={() => fill(true)}>Fill multiples of</Button>
            <TextField
              id="multiple"
              className="min-w-[72px] flex-1"
              label={
                <>
                  m<span className="sr-only">, the multiple</span>
                </>
              }
              inputMode="numeric"
              value={s.multipleText}
              error={multipleErr}
              onChange={(text) => dispatch({ type: 'multiple', text })}
              onBlur={() => onBlur('multiple')}
            />
          </div>
          <p role="status" className="sr-only">
            {filled}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-400">
        <Select
          id="curve"
          label="Chroma curve"
          hint="Shapes the chroma; contrast doesn’t change."
          value={s.curve ?? ''}
          options={[
            { value: '', label: `Suggested (${suggested.curve})` },
            ...CURVES.map((c) => ({ value: c, label: c })),
          ]}
          onChange={(value) => dispatch({ type: 'curve', curve: value || null })}
        />
        <ChromaChart steps={result.color} cap={s.cap} brandChroma={brand.oklch[1]} />
        <p className={hintClass}>
          Chroma at each step, light to dark. Your color is {brand.name}, the large dot
          {s.cap ? '; the dashed line is its chroma' : ''}. Curves from Tailwind CSS (MIT).
        </p>
        <div className="flex flex-col gap-200">
          <Checkbox checked={s.cap} hintId="cap-hint" onChange={(cap) => dispatch({ type: 'cap', cap })}>
            Keep chroma at or below my color’s
          </Checkbox>
          <p id="cap-hint" className={hintClass}>
            For muted colors: the scale stays as muted as your color, with the same contrast at each step.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-100">
        <label htmlFor="tint" className={labelClass}>
          Neutral tint
        </label>
        <p id="tint-hint" className={hintClass}>
          0 gives pure grays
        </p>
        <div className="flex items-center gap-300 text-body-small leading-normal">
          <span aria-hidden="true">0</span>
          <input
            id="tint"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={s.tint}
            aria-describedby={achromatic ? 'tint-hint tint-none' : 'tint-hint'}
            onChange={(e) => dispatch({ type: 'tint', tint: Number(e.target.value) })}
            className="range min-w-0 flex-1"
          />
          <span aria-hidden="true" className="min-w-1200 text-right">
            {s.tint} / 1
          </span>
        </div>
        {achromatic && (
          <p id="tint-none" className={hintClass}>
            Your color has no hue, so the tint has no effect.
          </p>
        )}
      </div>
    </div>
  );
}
