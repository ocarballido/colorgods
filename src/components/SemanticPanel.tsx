// Pestaña "Semantic palettes" (decisión 61, ux.md §5, F20 a F23): un fieldset con una casilla por rol. Al marcar una,
// su selector de paleta ("Suggested (red)", las paletas de su margen y "Custom color") con la muestra; con "Custom
// color", un campo de color con los errores de F1. Los avisos y notas del rol van debajo y en la lista única (U5).
import { useMemo, type Dispatch } from 'react';
import { ROLES, ROLE_PALETTES, proposeRoles, type Role, type Scales } from '../../tools/scales.mjs';
import { colorError, roleOptions, type Action, type Settings } from '../settings';
import type { Notice } from './noticeData';
import { Callout, Select, TextField, hintClass } from './ui';

type Props = {
  settings: Settings;
  dispatch: Dispatch<Action>;
  onBlur: (role: Role) => void;
  result: Scales;
  list: Notice[];
};

export function SemanticPanel({ settings: s, dispatch, onBlur, result, list }: Props) {
  // Paleta propuesta de cada rol para "Suggested (…)" (F21, U6): con las elegidas en los demás roles (decisión 47) y
  // sin la suya, que es lo que se usaría al volver a "Suggested".
  const suggested = useMemo(() => {
    const chosen = Object.entries(roleOptions(s.roles)).filter((e): e is [Role, string] => typeof e[1] === 'string');
    return Object.fromEntries(
      ROLES.map((r) => [r, proposeRoles(s.color, Object.fromEntries(chosen.filter(([q]) => q !== r)))[r].palette]),
    );
  }, [s.color, s.roles]);
  // La muestra es el paso del rol en la posición del de la marca: el mismo contraste que tu color (decisión 83).
  const brand = result.color.findIndex((x) => x.anchor);

  return (
    <fieldset className="flex flex-col gap-600">
      <legend className="sr-only">Semantic palettes</legend>
      {ROLES.map((r) => {
        const rs = s.roles[r];
        const custom = rs.choice === 'custom';
        const swatch = custom ? rs.color : result.roles[r]?.[brand].hex;
        const notes = list.filter((n) => n.roles?.includes(r));
        const noteId = (i: number) => `${r}-note-${i}`;
        const err = rs.touched ? colorError(rs) : null;
        // Avisos del rol y la línea "Using …", que describen el selector y el campo (ux.md §9).
        const described = [...notes.map((_, i) => noteId(i)), !err && `${r}-using`].filter(Boolean).join(' ');
        return (
          <div
            key={r}
            className={`flex flex-col gap-400 ${rs.on ? '' : 'rounded-control border border-neutral-strong p-400'}`}
          >
            <label className="flex min-h-[24px] items-center gap-200 text-body-default leading-normal">
              <input
                type="checkbox"
                checked={rs.on}
                onChange={(e) => dispatch({ type: 'role', role: r, on: e.target.checked })}
                className="size-[24px] shrink-0 accent-[var(--cg-color-border-accent-strong)]"
              />
              {r}
            </label>
            {rs.on && (
              <>
                <Select
                  id={`role-${r}`}
                  label={
                    <>
                      Palette<span className="sr-only"> for {r}</span>
                    </>
                  }
                  value={rs.choice}
                  extraDescribedBy={described}
                  options={[
                    { value: '', label: `Suggested (${suggested[r]})` },
                    ...ROLE_PALETTES[r].map((p) => ({ value: p, label: p })),
                    { value: 'custom', label: 'Custom color' },
                  ]}
                  onChange={(choice) => dispatch({ type: 'roleChoice', role: r, choice, fill: swatch! })}
                />
                {custom && (
                  <TextField
                    id={`role-${r}-color`}
                    label={`${r} color`}
                    hint="Hex, RGB or HSL"
                    value={rs.colorText}
                    error={err}
                    still={`The result still uses ${rs.color}.`}
                    onChange={(text) => dispatch({ type: 'roleColor', role: r, text })}
                    onBlur={() => onBlur(r)}
                    extraDescribedBy={described}
                  />
                )}
                <div
                  className="swatches h-[56px] rounded-control border border-neutral-default forced-color-adjust-none"
                  style={{ background: swatch }}
                />
                {/* El color de la muestra en texto (1.1.1, 1.4.1); con error lo dice "The result still uses…". */}
                {!err && (
                  <p id={`${r}-using`} className={hintClass}>
                    Using {swatch}
                  </p>
                )}
                {notes.map((n, i) => (
                  <Callout key={n.key} id={noteId(i)} variant={n.warning ? 'warning' : 'note'}>
                    {n.body}
                  </Callout>
                ))}
              </>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
