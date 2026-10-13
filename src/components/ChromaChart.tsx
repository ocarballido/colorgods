// Gráfico de la curva (F3, U7, ux.md §5.1): línea de tamaño fijo con un punto por paso y el de la marca destacado.
// El dibujo es decorativo; la alternativa en texto es la lista oculta, un elemento por paso.
import { TW_CURVES, type NamedStep } from '../../tools/scales.mjs';

// Eje del croma fijo: el mayor de las 17 curvas, para comparar al cambiar de curva (ux.md §5.1).
const MAX_CHROMA = Math.max(...Object.values(TW_CURVES).flatMap((curve) => curve.map(([, c]) => c)));
const W = 293;
const H = 104;
const PAD = 10;
// Con más pasos los nombres no caben: solo el primero, el de la marca y el último.
const ALL_LABELS = 12;

type Props = { steps: NamedStep[]; cap: boolean; brandChroma: number };

export function ChromaChart({ steps, cap, brandChroma }: Props) {
  const n = steps.length;
  const x = (i: number) => (W / n) * (i + 0.5);
  const y = (c: number) => PAD + (1 - c / MAX_CHROMA) * (H - 2 * PAD);
  const anchor = steps.findIndex((s) => s.anchor);
  const points = steps.map((s, i) => `${x(i).toFixed(1)},${y(s.oklch[1]).toFixed(1)}`).join(' ');
  const showLabel = (i: number) => n <= ALL_LABELS || i === 0 || i === n - 1 || i === anchor;
  return (
    <div>
      <div aria-hidden="true">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" focusable="false">
          {cap && (
            <line
              x1="0"
              x2={W}
              y1={y(brandChroma)}
              y2={y(brandChroma)}
              stroke="var(--cg-color-text-neutral-default)"
              strokeDasharray="4 3"
            />
          )}
          <polyline points={points} fill="none" stroke="var(--cg-color-border-neutral-strong)" strokeWidth="1.5" />
          {steps.map((s, i) =>
            i === anchor ? (
              <circle
                key={s.name}
                cx={x(i)}
                cy={y(s.oklch[1])}
                r="8"
                fill={s.hex}
                stroke="var(--cg-color-text-neutral-default)"
              />
            ) : (
              <circle
                key={s.name}
                cx={x(i)}
                cy={y(s.oklch[1])}
                r="3.5"
                fill="var(--cg-color-background-neutral-default)"
                stroke="var(--cg-color-text-neutral-subtle)"
              />
            ),
          )}
        </svg>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => (
            <span key={s.name} className="truncate text-center text-caption-default leading-snug text-neutral-default">
              {showLabel(i) ? s.name : ''}
            </span>
          ))}
        </div>
      </div>
      <ul className="sr-only">
        {steps.map((s, i) => (
          <li key={s.name}>
            {s.name}, chroma {s.oklch[1].toFixed(3)}
            {i === anchor ? ', your color' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
