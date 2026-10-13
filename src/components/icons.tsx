// Iconos de Lucide (lucide.dev, licencia ISC), con los trazos de ColorScaleUI (B2). En línea y con currentColor
// para que tomen el color del texto, también en modo oscuro y con colores forzados. Decorativos: aria-hidden.
type IconProps = { size?: number; className?: string };

const svg = (size: number, className: string | undefined, d: string[], box = 24) => (
  <svg
    aria-hidden="true"
    focusable="false"
    width={size}
    height={size}
    viewBox={`0 0 ${box} ${box}`}
    fill="currentColor"
    className={className}
  >
    {d.map((path) => (
      <path key={path} fillRule="evenodd" clipRule="evenodd" d={path} />
    ))}
  </svg>
);

export const ChevronDown = ({ size = 16, className }: IconProps) =>
  svg(
    size,
    className,
    [
      'M3.5286 5.5286C3.78895 5.26825 4.21106 5.26825 4.4714 5.5286L8 9.05719L11.5286 5.5286C11.7889 5.26825 12.2111 5.26825 12.4714 5.5286C12.7318 5.78895 12.7318 6.21106 12.4714 6.4714L8.47141 10.4714C8.21106 10.7318 7.78895 10.7318 7.5286 10.4714L3.5286 6.4714C3.26825 6.21106 3.26825 5.78895 3.5286 5.5286Z',
    ],
    16,
  );

export const CircleAlert = ({ size = 16, className }: IconProps) =>
  svg(
    size,
    className,
    [
      'M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2ZM0.666667 8C0.666667 3.94991 3.94991 0.666667 8 0.666667C12.0501 0.666667 15.3333 3.94991 15.3333 8C15.3333 12.0501 12.0501 15.3333 8 15.3333C3.94991 15.3333 0.666667 12.0501 0.666667 8Z',
      'M8 4.66667C8.36819 4.66667 8.66667 4.96514 8.66667 5.33333V8C8.66667 8.36819 8.36819 8.66667 8 8.66667C7.63181 8.66667 7.33333 8.36819 7.33333 8V5.33333C7.33333 4.96514 7.63181 4.66667 8 4.66667Z',
      'M7.33333 10.6667C7.33333 10.2985 7.63181 10 8 10H8.00667C8.37486 10 8.67333 10.2985 8.67333 10.6667C8.67333 11.0349 8.37486 11.3333 8.00667 11.3333H8C7.63181 11.3333 7.33333 11.0349 7.33333 10.6667Z',
    ],
    16,
  );

export const Info = ({ size = 24, className }: IconProps) =>
  svg(size, className, [
    'M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12Z',
    'M12 11C12.5523 11 13 11.4477 13 12V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V12C11 11.4477 11.4477 11 12 11Z',
    'M11 8C11 7.44772 11.4477 7 12 7H12.01C12.5623 7 13.01 7.44772 13.01 8C13.01 8.55228 12.5623 9 12.01 9H12C11.4477 9 11 8.55228 11 8Z',
  ]);
