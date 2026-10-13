// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tools/scales.mjs.
// Copiado en colorgods en el paso C2 (decisión A2) y cambiado en el paso C3: el método de 11 pasos fijos del curso
// (STEPS, build() y las curvas de neutros) se sustituye por el método D a N pasos (decisiones 3, 30, 32 y 35).
// Siguen como en el original: las curvas y tonos de Tailwind CSS, las conversiones, el ajuste a sRGB, hexs(), contrast(),
// parseColor(), parseTint() y suggest(). Los ajustes en la URL del curso (DEFAULTS, stateFromSearch, searchFromState) se
// quitan: F18 necesita N, convención, tope y roles, y se escribe con la interfaz (C4).
// Prototipo de referencia: docs/comparacion/metodo-d.mjs.
//
// Método D (docs/funcionalidades.md §0). Para N pasos, el paso k está en t = k / (N − 1).
//   Escalera: en cada t, la mediana de la luminancia relativa (Y de WCAG) de las 17 paletas de color de Tailwind CSS,
//             con L y C remuestreados con PCHIP (A4). Todas las escalas tienen en cada paso la Y de la escalera.
//   Color:    croma de la curva elegida en la L del paso por la proporción de croma (croma de la marca entre el de la curva
//             en la L de la marca, decisión 4); tono de la marca. La marca sustituye al paso de Y más cercana (en log Y,
//             empates hacia el más claro). Tope opcional (decisión 32): ningún paso supera el croma de la marca.
//   Rol:      una paleta de Tailwind CSS, con su croma en la L del paso y su tono (decisión 20).
//   Neutros:  croma de gray de Tailwind CSS en t por el tinte, con el tono de la marca.
//   La L de cada paso se busca para que el color, ya ajustado a sRGB, tenga la Y pedida.
// Sin dependencias; funciona en el navegador y en Node.js.

const TW_GRAY_C = [0.002, 0.003, 0.006, 0.01, 0.022, 0.027, 0.03, 0.034, 0.033, 0.034, 0.028];

// Curvas de referencia: L y C de cada paso en las 17 paletas de color de Tailwind CSS 4.3.3
// (packages/tailwindcss/theme.css, etiqueta v4.3.3). Las mismas que TW_CURVES en tools/scales.py del curso.
export const TW_CURVES = {
  red: [
    [0.971, 0.013],
    [0.936, 0.032],
    [0.885, 0.062],
    [0.808, 0.114],
    [0.704, 0.191],
    [0.637, 0.237],
    [0.577, 0.245],
    [0.505, 0.213],
    [0.444, 0.177],
    [0.396, 0.141],
    [0.258, 0.092],
  ],
  orange: [
    [0.98, 0.016],
    [0.954, 0.038],
    [0.901, 0.076],
    [0.837, 0.128],
    [0.75, 0.183],
    [0.705, 0.213],
    [0.646, 0.222],
    [0.553, 0.195],
    [0.47, 0.157],
    [0.408, 0.123],
    [0.266, 0.079],
  ],
  amber: [
    [0.987, 0.022],
    [0.962, 0.059],
    [0.924, 0.12],
    [0.879, 0.169],
    [0.828, 0.189],
    [0.769, 0.188],
    [0.666, 0.179],
    [0.555, 0.163],
    [0.473, 0.137],
    [0.414, 0.112],
    [0.279, 0.077],
  ],
  yellow: [
    [0.987, 0.026],
    [0.973, 0.071],
    [0.945, 0.129],
    [0.905, 0.182],
    [0.852, 0.199],
    [0.795, 0.184],
    [0.681, 0.162],
    [0.554, 0.135],
    [0.476, 0.114],
    [0.421, 0.095],
    [0.286, 0.066],
  ],
  lime: [
    [0.986, 0.031],
    [0.967, 0.067],
    [0.938, 0.127],
    [0.897, 0.196],
    [0.841, 0.238],
    [0.768, 0.233],
    [0.648, 0.2],
    [0.532, 0.157],
    [0.453, 0.124],
    [0.405, 0.101],
    [0.274, 0.072],
  ],
  green: [
    [0.982, 0.018],
    [0.962, 0.044],
    [0.925, 0.084],
    [0.871, 0.15],
    [0.792, 0.209],
    [0.723, 0.219],
    [0.627, 0.194],
    [0.527, 0.154],
    [0.448, 0.119],
    [0.393, 0.095],
    [0.266, 0.065],
  ],
  emerald: [
    [0.979, 0.021],
    [0.95, 0.052],
    [0.905, 0.093],
    [0.845, 0.143],
    [0.765, 0.177],
    [0.696, 0.17],
    [0.596, 0.145],
    [0.508, 0.118],
    [0.432, 0.095],
    [0.378, 0.077],
    [0.262, 0.051],
  ],
  teal: [
    [0.984, 0.014],
    [0.953, 0.051],
    [0.91, 0.096],
    [0.855, 0.138],
    [0.777, 0.152],
    [0.704, 0.14],
    [0.6, 0.118],
    [0.511, 0.096],
    [0.437, 0.078],
    [0.386, 0.063],
    [0.277, 0.046],
  ],
  cyan: [
    [0.984, 0.019],
    [0.956, 0.045],
    [0.917, 0.08],
    [0.865, 0.127],
    [0.789, 0.154],
    [0.715, 0.143],
    [0.609, 0.126],
    [0.52, 0.105],
    [0.45, 0.085],
    [0.398, 0.07],
    [0.302, 0.056],
  ],
  sky: [
    [0.977, 0.013],
    [0.951, 0.026],
    [0.901, 0.058],
    [0.828, 0.111],
    [0.746, 0.16],
    [0.685, 0.169],
    [0.588, 0.158],
    [0.5, 0.134],
    [0.443, 0.11],
    [0.391, 0.09],
    [0.293, 0.066],
  ],
  blue: [
    [0.97, 0.014],
    [0.932, 0.032],
    [0.882, 0.059],
    [0.809, 0.105],
    [0.707, 0.165],
    [0.623, 0.214],
    [0.546, 0.245],
    [0.488, 0.243],
    [0.424, 0.199],
    [0.379, 0.146],
    [0.282, 0.091],
  ],
  indigo: [
    [0.962, 0.018],
    [0.93, 0.034],
    [0.87, 0.065],
    [0.785, 0.115],
    [0.673, 0.182],
    [0.585, 0.233],
    [0.511, 0.262],
    [0.457, 0.24],
    [0.398, 0.195],
    [0.359, 0.144],
    [0.257, 0.09],
  ],
  violet: [
    [0.969, 0.016],
    [0.943, 0.029],
    [0.894, 0.057],
    [0.811, 0.111],
    [0.702, 0.183],
    [0.606, 0.25],
    [0.541, 0.281],
    [0.491, 0.27],
    [0.432, 0.232],
    [0.38, 0.189],
    [0.283, 0.141],
  ],
  purple: [
    [0.977, 0.014],
    [0.946, 0.033],
    [0.902, 0.063],
    [0.827, 0.119],
    [0.714, 0.203],
    [0.627, 0.265],
    [0.558, 0.288],
    [0.496, 0.265],
    [0.438, 0.218],
    [0.381, 0.176],
    [0.291, 0.149],
  ],
  fuchsia: [
    [0.977, 0.017],
    [0.952, 0.037],
    [0.903, 0.076],
    [0.833, 0.145],
    [0.74, 0.238],
    [0.667, 0.295],
    [0.591, 0.293],
    [0.518, 0.253],
    [0.452, 0.211],
    [0.401, 0.17],
    [0.293, 0.136],
  ],
  pink: [
    [0.971, 0.014],
    [0.948, 0.028],
    [0.899, 0.061],
    [0.823, 0.12],
    [0.718, 0.202],
    [0.656, 0.241],
    [0.592, 0.249],
    [0.525, 0.223],
    [0.459, 0.187],
    [0.408, 0.153],
    [0.284, 0.109],
  ],
  rose: [
    [0.969, 0.015],
    [0.941, 0.03],
    [0.892, 0.058],
    [0.81, 0.117],
    [0.712, 0.194],
    [0.645, 0.246],
    [0.586, 0.253],
    [0.514, 0.222],
    [0.455, 0.188],
    [0.41, 0.159],
    [0.271, 0.105],
  ],
};

// CSS Color 4: con C <= 0.000004 el tono de oklch no tiene efecto (powerless hue).
export const ACHROMATIC = 0.000004;

// --- Conversiones (Björn Ottosson, https://bottosson.github.io/posts/oklab/) --------------------

const srgbToLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const pyMod = (a, n) => {
  const r = a % n;
  return r < 0 ? r + n : r;
};
export function pyRound(x) {
  const f = Math.floor(x);
  const d = x - f;
  if (d > 0.5) return f + 1;
  if (d < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}
const rad = (d) => (d * Math.PI) / 180;

function rgbToOklab(r, g, b) {
  [r, g, b] = [r, g, b].map(srgbToLin);
  let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  [l, m, s] = [l, m, s].map((x) => x ** (1 / 3));
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLin(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function rgbToOklch(r, g, b) {
  const [L, a, bb] = rgbToOklab(r, g, b);
  return [L, Math.hypot(a, bb), pyMod((Math.atan2(bb, a) * 180) / Math.PI, 360)];
}

// oklch → sRGB. Si no cabe, reduce solo el croma (búsqueda binaria) y conserva L y H.
// Mismo resultado que el original; el color que cabe se convierte una sola vez (C3, por tiempo).
export function oklchToRgbGamut(L, C, H) {
  const cos = Math.cos(rad(H));
  const sin = Math.sin(rad(H));
  const conv = (c) => oklabToLin(L, c * cos, c * sin);
  const ok = (lin) => lin.every((x) => x >= -1e-6 && x <= 1 + 1e-6);
  let lin = conv(C);
  let used = C;
  if (!ok(lin)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (ok(conv(mid))) lo = mid;
      else hi = mid;
    }
    lin = conv(lo);
    used = lo;
  }
  return [lin.map((x) => Math.min(1, Math.max(0, linToSrgb(x)))), used];
}

export const hexs = (rgb) =>
  `#${rgb
    .map((x) =>
      pyRound(x * 255)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0'),
    )
    .join('')}`;
export const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
// Luminancia relativa de WCAG 2.2.
export const luminance = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
// Contraste WCAG 2.2 sobre el hex guardado (S30).
export function contrast(a, b) {
  const [la, lb] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (la + 0.05) / (lb + 0.05);
}
// Ratio que se muestra: truncado a dos decimales, no redondeado (decisión 12). El veredicto usa el ratio sin truncar.
export const truncate2 = (x) => Math.floor(x * 100 + 1e-9) / 100;

const round = (x, digits) => Math.round(x * 10 ** digits) / 10 ** digits;

// --- Entrada ----------------------------------------------------------------------------------

// Hex (#RGB, #RRGGBB, con o sin #), RGB ("rgb(51, 204, 153)" o "51 204 153") o HSL
// ("hsl(160 60% 50%)" o "hsl(160, 60%, 50%)"). Devuelve el hex en mayúsculas o null.
// La escala se calcula siempre desde el hex: es el valor que se guarda en Figma (T22, decisión 9 del curso).
export function parseColor(input) {
  const text = String(input ?? '')
    .trim()
    .toLowerCase();
  let m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
    return `#${h.toUpperCase()}`;
  }
  const nums = (s) => s.split(/[\s,]+/).filter(Boolean);
  m = /^(?:rgb\(\s*([^)]*)\)|(\d[\d\s,.]*))$/.exec(text);
  if (m) {
    const parts = nums(m[1] ?? m[2]).map(Number);
    if (parts.length === 3 && parts.every((v) => Number.isFinite(v) && v >= 0 && v <= 255))
      return hexs(parts.map((v) => v / 255));
    return null;
  }
  m = /^hsl\(\s*([^)]*)\)$/.exec(text);
  if (m) {
    const parts = nums(m[1].replace(/%/g, ' '));
    const [h, s, l] = parts.map(Number);
    if (parts.length !== 3 || ![h, s, l].every(Number.isFinite) || s < 0 || s > 100 || l < 0 || l > 100) return null;
    return hexs(hslToRgb(pyMod(h, 360) / 360, l / 100, s / 100));
  }
  return null;
}

// colorsys.hls_to_rgb de Python.
function hslToRgb(h, l, s) {
  if (s === 0) return [l, l, l];
  const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s;
  const m1 = 2 * l - m2;
  const v = (hue) => {
    hue = pyMod(hue, 1);
    if (hue < 1 / 6) return m1 + (m2 - m1) * hue * 6;
    if (hue < 0.5) return m2;
    if (hue < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - hue) * 6;
    return m1;
  };
  return [v(h + 1 / 3), v(h), v(h - 1 / 3)];
}

// Roles semánticos (decisiones 19 a 22): paletas del margen de cada rol, la primera es la de por defecto.
export const ROLES = ['danger', 'warning', 'success', 'info'];
export const ROLE_PALETTES = {
  danger: ['red'],
  warning: ['amber', 'orange', 'yellow'],
  success: ['green', 'emerald'],
  info: ['blue', 'sky'],
};
// Margen de tono de cada rol en grados de oklch (decisión 20, docs/semanticas.md §2), para la nota de F23.
export const ROLE_HUES = { danger: [21, 30], warning: [43, 90], success: [138, 168], info: [218, 267] };

// Nombre de una paleta (F5): minúsculas, kebab-case por segmento, y ni "neutral" ni el nombre de un rol.
export function isPaletteName(name) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name) && name !== 'neutral' && !ROLES.includes(name);
}

// Tinte de los neutros: número de 0 a 1 (D45 del curso).
export function parseTint(input) {
  const text = String(input ?? '')
    .trim()
    .replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const value = Number(text);
  return value >= 0 && value <= 1 ? value : null;
}

// --- Nombres de los pasos (decisiones 3 y 17) ----------------------------------------------------

export const MIN_STEPS = 3;
export const MAX_STEPS = { tailwind: 16, sds: 19, radix: 30, custom: 30 };
const SCALE_NAMES = { tailwind: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950], sds: [100, 1000] };

// Nombres de los N pasos. Tailwind y SDS por posición: el valor de la convención en t, interpolando entre sus
// nombres y redondeando a 50 (docs/nombres.md). Radix: 1 a N.
export function stepNames(N, convention = 'tailwind') {
  if (convention === 'radix') return Array.from({ length: N }, (_, k) => String(k + 1));
  const names = SCALE_NAMES[convention];
  if (!names) throw new Error(`Unknown convention: ${convention}`);
  return Array.from({ length: N }, (_, k) => {
    const x = (k / (N - 1)) * (names.length - 1);
    const i = Math.min(names.length - 2, Math.floor(x));
    return String(Math.round((names[i] + (names[i + 1] - names[i]) * (x - i)) / 50) * 50);
  });
}

// N como texto: entero de 3 al máximo de la convención (F2). Devuelve el número o null.
export function parseSteps(input, convention = 'tailwind') {
  const text = String(input ?? '').trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= MIN_STEPS && n <= MAX_STEPS[convention] ? n : null;
}

// Rellenos de los nombres personalizados (F6.1): "1 a N" (m = 1) o "múltiplos de m".
export const fillNames = (N, m = 1) => Array.from({ length: N }, (_, k) => String((k + 1) * m));

// Nombres personalizados (F6.1): null si valen; si no, el primer problema.
//   { code: 'count', have, need }   faltan o sobran nombres
//   { code: 'char', name }          un nombre vacío o con un carácter que no es letra, número, - o _
//   { code: 'duplicate', names }    dos nombres iguales sin distinguir mayúsculas
export function checkCustomNames(names, N) {
  if (names.length !== N) return { code: 'count', have: names.length, need: N };
  const bad = names.find((n) => !/^[A-Za-z0-9_-]+$/.test(n));
  if (bad !== undefined) return { code: 'char', name: bad };
  const seen = new Map();
  for (const n of names) {
    const key = n.toLowerCase();
    if (seen.has(key)) return { code: 'duplicate', names: [seen.get(key), n] };
    seen.set(key, n);
  }
  return null;
}

// --- Método D ---------------------------------------------------------------------------------

// PCHIP (Fritsch y Carlson, A4) sobre 11 puntos regulares en t de 0 a 1. Igual que pchip() de metodo-d.mjs.
function pchip(ys) {
  const n = ys.length;
  const h = 1 / (n - 1);
  const d = ys.slice(1).map((y, i) => (y - ys[i]) / h);
  const m = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (t) => {
    t = Math.min(1, Math.max(0, t));
    const i = Math.min(n - 2, Math.floor(t / h));
    const u = (t - i * h) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

// Raíz de una función monótona en [lo, hi] (f(lo) y f(hi) de signo distinto): regula falsi con la corrección de
// Illinois y bisección de respaldo. Llega a la misma raíz que las 60 bisecciones del prototipo con muchas menos
// evaluaciones (decisión 38); la diferencia en L es del orden de 1e-14 y no cambia ningún hex de las pruebas.
function root(f, lo, hi, tol = 1e-14) {
  let flo = f(lo);
  let fhi = f(hi);
  if (flo === 0) return lo;
  if (fhi === 0) return hi;
  let side = 0;
  for (let i = 0; i < 100 && hi - lo > tol; i++) {
    let m = (lo * fhi - hi * flo) / (fhi - flo);
    if (!(m > lo && m < hi) || i % 8 === 7) m = (lo + hi) / 2;
    const fm = f(m);
    if (fm === 0) return m;
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = m;
      flo = fm;
      if (side === -1) fhi /= 2;
      side = -1;
    } else {
      hi = m;
      fhi = fm;
      if (side === 1) flo /= 2;
      side = 1;
    }
  }
  return (lo + hi) / 2;
}

// Cada curva como funciones de t, y su croma en función de L (la t en la que la curva tiene esa L).
const CURVES = Object.fromEntries(
  Object.entries(TW_CURVES).map(([k, c]) => {
    const fL = pchip(c.map((p) => p[0]));
    const fC = pchip(c.map((p) => p[1]));
    const L0 = fL(0);
    const L1 = fL(1);
    const tAtL = (L) => (L >= L0 ? 0 : L <= L1 ? 1 : root((t) => fL(t) - L, 0, 1, 1e-15));
    return [k, { fL, fC, tAtL, cAtL: (L) => fC(tAtL(L)) }];
  }),
);
const fGray = pchip(TW_GRAY_C);
const Yof = (L, C, H) => luminance(oklchToRgbGamut(L, C, H)[0]);
const Yhex = (hex) => luminance(hexToRgb(hex));

// Escalera: Y de cada t, mediana de las 17 paletas. Se guarda cada t calculada.
const LADDER = new Map();
function ladderAt(t) {
  let y = LADDER.get(t);
  if (y === undefined) {
    const v = Object.entries(CURVES)
      .map(([k, { fL, fC }]) => Yof(fL(t), fC(t), TW_HUES[k]))
      .sort((a, b) => a - b);
    y = v[Math.floor(v.length / 2)];
    LADDER.set(t, y);
  }
  return y;
}
const positions = (N) => Array.from({ length: N }, (_, k) => k / (N - 1));
// Y de la escalera en cada uno de los N pasos.
export const ladder = (N) => positions(N).map(ladderAt);

// Un paso con la Y pedida: chroma(L) da el croma deseado en cada L.
//   { hex, oklch: [L, C usado, H], clip }  clip: % de croma que quita el ajuste a sRGB (0 si no recorta).
function solve(target, chroma, H) {
  const L = root((l) => Yof(l, chroma(l), H) - target, 0, 1);
  const want = chroma(L);
  const [rgb, used] = oklchToRgbGamut(L, want, H);
  return {
    hex: hexs(rgb),
    oklch: [L, used, H],
    clip: want > 0 && used < want - 1e-9 ? Math.round(100 * (1 - used / want)) : 0,
  };
}

// Paso de la escalera más cercano a la Y de un hex (en log Y), con los empates hacia el más claro.
export function nearestStep(hex, N) {
  const y = Yhex(hex);
  const lad = ladder(N);
  let a = 0;
  for (let i = 1; i < N; i++) if (Math.abs(Math.log(lad[i] / y)) < Math.abs(Math.log(lad[a] / y))) a = i;
  return a;
}

// Aviso de marca en un extremo (decisión 35): la Y de la marca está más cerca (en log Y) de la escalera en t = 0,1
// que en t = 0,2, o en t = 0,9 que en t = 0,8. Nunca con una marca sin croma. No depende de N ni de la curva.
export function isExtreme(hex) {
  if (rgbToOklch(...hexToRgb(hex))[1] <= ACHROMATIC) return false;
  const y = Yhex(hex);
  const d = (t) => Math.abs(Math.log(ladderAt(t) / y));
  return d(0.1) <= d(0.2) || d(0.9) < d(0.8);
}

// Croma de un color en cada L: el de la curva por la proporción de croma (decisión 4), con el tope si se pide (32).
// Lo usan la escala del color y la de un color propio de un rol (F23), que se calcula igual.
function colorModel(hex, curve, cap) {
  const c = CURVES[curve];
  if (!c) throw new Error(`Unknown curve: ${curve}`);
  let [aL, aC, aH] = rgbToOklch(...hexToRgb(hex));
  const achromatic = aC <= ACHROMATIC;
  if (achromatic) aC = 0;
  const ratio = aC / c.cAtL(aL);
  const chroma = (l) => {
    const x = c.cAtL(l) * ratio;
    return cap ? Math.min(x, aC) : x;
  };
  return { oklch: [aL, aC, aH], achromatic, ratio, chroma };
}

/**
 * Escala del color (F7). curve: una de TW_CURVES (por defecto, la propuesta por suggest()); cap: tope de croma (F24).
 * Devuelve { curve, chromaRatio, anchor (índice del paso de la marca), achromatic, extreme, steps }.
 */
export function colorScale(hex, N, { curve, cap = false } = {}) {
  hex = hex.toUpperCase();
  curve ??= suggest(hex).curve;
  const {
    oklch: [aL, aC, aH],
    achromatic,
    ratio,
    chroma,
  } = colorModel(hex, curve, cap);
  const anchor = nearestStep(hex, N);
  const lad = ladder(N);
  const steps = lad.map((y, i) =>
    i === anchor ? { hex, oklch: [aL, aC, aH], clip: 0, anchor: true } : solve(y, chroma, aH),
  );
  return { curve, chromaRatio: ratio, anchor, achromatic, extreme: isExtreme(hex), steps };
}

// Escala de una paleta de Tailwind CSS sobre la escalera (roles, F21): su croma en la L del paso y su tono.
export function paletteScale(palette, N) {
  const c = CURVES[palette];
  if (!c) throw new Error(`Unknown palette: ${palette}`);
  return { steps: ladder(N).map((y) => solve(y, c.cAtL, TW_HUES[palette])) };
}

// Escala de neutros (F8): croma de gray en t por el tinte, con el tono del color; sin tinte si el color no tiene croma.
export function neutralScale(hex, N, tint = 0.5) {
  const [, C, H] = rgbToOklch(...hexToRgb(hex));
  const k = C <= ACHROMATIC ? 0 : tint;
  const ts = positions(N);
  return { steps: ladder(N).map((y, i) => solve(y, () => fGray(ts[i]) * k, H)) };
}

// --- Roles: propuesta y colisión (decisiones 20 a 23 y 37) ---------------------------------------

const COLLISION = 0.05; // ΔE oklab (decisión 21, provisional)
const toLab = (hex) => {
  const [L, C, H] = rgbToOklch(...hexToRgb(hex));
  return [L, C * Math.cos(rad(H)), C * Math.sin(rad(H))];
};
const deltaE = (x, y) => {
  const a = toLab(x);
  const b = toLab(y);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};
// Color de una paleta con la misma Y que la marca.
const paletteAtY = (palette, y) => solve(y, CURVES[palette].cAtL, TW_HUES[palette]).hex;
const CENTER = new Map();
// Paso central de una paleta (t = 0,5), para comparar roles entre sí.
const center = (p) => {
  if (!CENTER.has(p)) CENTER.set(p, paletteScale(p, 3).steps[1].hex);
  return CENTER.get(p);
};

/**
 * Paleta de cada rol para un color de marca (F21, F22). chosen: { rol: paleta } que el usuario eligió; se mantienen.
 * Los roles se resuelven en orden (danger, warning, success, info), sin colisionar con los ya resueltos. Con la marca
 * se comprueban danger, warning y success (info no, decisión 23), salvo si la marca no tiene croma o está en un extremo.
 * Devuelve { rol: { palette, chosen?, changed? (paleta por defecto que se cambió), collision? (sin alternativa) } }.
 */
export function proposeRoles(hex, chosen = {}) {
  const [, C] = rgbToOklch(...hexToRgb(hex));
  const checkBrand = C > ACHROMATIC && !isExtreme(hex);
  const y = Yhex(hex);
  const vsBrand = new Map();
  const brandDistance = (p) => {
    if (!vsBrand.has(p)) vsBrand.set(p, deltaE(paletteAtY(p, y), hex));
    return vsBrand.get(p);
  };
  const out = {};
  for (const r of ROLES) if (chosen[r]) out[r] = { palette: chosen[r], chosen: true };
  for (const r of ROLES) {
    if (out[r]) continue;
    const others = Object.values(out).map((o) => o.palette);
    const fits = (p) =>
      (!checkBrand || r === 'info' || brandDistance(p) >= COLLISION) &&
      others.every((q) => deltaE(center(p), center(q)) >= COLLISION);
    const [def, ...rest] = ROLE_PALETTES[r];
    if (fits(def)) out[r] = { palette: def };
    else {
      const alt = rest.filter(fits).sort((a, b) => brandDistance(b) - brandDistance(a))[0];
      out[r] = alt ? { palette: alt, changed: def } : { palette: def, collision: true };
    }
  }
  return Object.fromEntries(ROLES.map((r) => [r, out[r]]));
}

// --- Regla de contraste por paso (F26) ----------------------------------------------------------

/**
 * Con las escalas visibles ({ steps, anchor? }), el primer paso desde el que todos los pasos cumplen el nivel con blanco
 * y el último hasta el que cumplen con negro, en todas las escalas, sin contar el paso de la marca. Índices; -1 si no hay.
 */
export function contrastRule(scales, level = 4.5) {
  const N = scales[0].steps.length;
  const passes = (k, bg) => scales.every((s) => s.anchor === k || contrast(hexToRgb(s.steps[k].hex), bg) >= level);
  let white = -1;
  for (let k = N - 1; k >= 0 && passes(k, [1, 1, 1]); k--) white = k;
  let black = -1;
  for (let k = 0; k < N && passes(k, [0, 0, 0]); k++) black = k;
  return { white, black };
}

// --- Todo junto ---------------------------------------------------------------------------------

const MIN_GAP = 0.014; // salto de L más pequeño de las paletas de Tailwind CSS (yellow 50 a 100), F12.4 y decisión 18

/**
 * Las escalas del color, de los roles activos y de neutros, con los nombres de los pasos, la regla de contraste y los avisos.
 * Opciones: steps (N, por defecto 11), names ('tailwind', 'sds', 'radix' o una lista de N nombres), curve (null: la
 * propuesta), cap (tope de croma), tint (0 a 1), roles ({ rol: null para la paleta propuesta, el nombre de una paleta
 * de su margen o { color } con un color propio en cualquier formato de F1 (F23) }; los roles que no están, desactivados).
 * Lanza un error si N, los nombres, la curva, la paleta o el color de un rol no valen: la interfaz los valida antes.
 * Avisos como códigos; el texto lo pone la interfaz (docs/funcionalidades.md §3):
 *   { code: 'achromatic' }                        la marca no tiene croma: escala gris y neutros sin tinte (F12.1)
 *   { code: 'extreme' }                           la marca está en un extremo (F12.2)
 *   { code: 'clipped', scale, steps }             pasos de una escala en los que el ajuste a sRGB recorta el croma (F12.3)
 *   { code: 'close', scale, pairs }               pasos vecinos muy juntos en L (F12.4)
 *   { code: 'role-changed', role, from, to }      la marca colisiona con la paleta por defecto del rol y se cambia (F22)
 *   { code: 'role-collision', role, palette }     la marca colisiona con el rol y no hay alternativa (F22)
 *   { code: 'role-custom-collision', role }       el color propio del rol colisiona con la marca (F23)
 *   { code: 'roles-close', role, other }          el color propio del rol y otro rol activo son muy parecidos (F23)
 *   { code: 'role-hue', role, min, max }          el tono del color propio está fuera del margen del rol (F23)
 * scale es 'color', 'neutral' o el nombre de un rol.
 */
export function build(
  hex,
  { steps: N = 11, names = 'tailwind', curve = null, cap = false, tint = 0.5, roles = {} } = {},
) {
  const convention = Array.isArray(names) ? 'custom' : names;
  if (!Number.isInteger(N) || N < MIN_STEPS || N > (MAX_STEPS[convention] ?? 0))
    throw new Error(`Invalid steps for ${convention}: ${N}`);
  if (Array.isArray(names) && checkCustomNames(names, N))
    throw new Error(`Invalid custom names: ${JSON.stringify(checkCustomNames(names, N))}`);
  const custom = {};
  for (const [r, p] of Object.entries(roles)) {
    if (!ROLES.includes(r)) throw new Error(`Unknown role: ${r}`);
    if (p?.color !== undefined) {
      custom[r] = parseColor(p.color);
      if (!custom[r]) throw new Error(`Invalid ${r} color: ${p.color}`);
    } else if (p != null && !ROLE_PALETTES[r].includes(p)) throw new Error(`Palette ${p} is not in the ${r} range`);
  }
  const label = Array.isArray(names) ? [...names] : stepNames(N, names);
  const color = colorScale(hex, N, { curve: curve ?? undefined, cap });
  const neutral = neutralScale(hex, N, color.achromatic ? 0 : tint);
  const chosen = Object.fromEntries(Object.entries(roles).filter(([r, p]) => p != null && !custom[r]));
  const proposal = proposeRoles(hex, chosen);
  const active = ROLES.filter((r) => r in roles);
  // Un color propio (F23) se calcula como la marca: curva propuesta por su tono y sin tope.
  const roleScales = Object.fromEntries(
    active.map((r) => [r, custom[r] ? colorScale(custom[r], N) : paletteScale(proposal[r].palette, N)]),
  );
  const named = (s) => s.steps.map((x, i) => ({ name: label[i], ...x }));

  const warnings = [];
  if (color.achromatic) warnings.push({ code: 'achromatic' });
  if (color.extreme) warnings.push({ code: 'extreme' });
  const visible = [['color', color], ...active.map((r) => [r, roleScales[r]]), ['neutral', neutral]];
  for (const [scale, s] of visible) {
    const clipped = s.steps.map((x, i) => ({ name: label[i], clip: x.clip })).filter((x) => x.clip);
    if (clipped.length) warnings.push({ code: 'clipped', scale, steps: clipped });
  }
  for (const [scale, s] of visible) {
    const pairs = [];
    for (let i = 1; i < N; i++)
      if (s.steps[i - 1].oklch[0] - s.steps[i].oklch[0] < MIN_GAP) pairs.push([label[i - 1], label[i]]);
    if (pairs.length) warnings.push({ code: 'close', scale, pairs });
  }
  // Color propio (F23, decisión 24): la app no lo cambia; avisa si colisiona con la marca (regla de F22, sin info) o
  // si su paso central dista menos de 0,05 del de otro rol activo, y pone una nota si su tono está fuera del margen.
  const models = {};
  const centers = {};
  for (const r of active) {
    if (custom[r]) {
      const m = (models[r] = colorModel(custom[r], suggest(custom[r]).curve, false));
      centers[r] = solve(ladderAt(0.5), m.chroma, m.oklch[2]).hex;
    } else centers[r] = center(proposal[r].palette);
  }
  const checkBrand = !color.achromatic && !color.extreme;
  for (const r of active) {
    const p = proposal[r];
    const m = models[r];
    if (!m) {
      if (p.changed) warnings.push({ code: 'role-changed', role: r, from: p.changed, to: p.palette });
      if (p.collision) warnings.push({ code: 'role-collision', role: r, palette: p.palette });
      continue;
    }
    if (checkBrand && r !== 'info' && deltaE(solve(Yhex(hex), m.chroma, m.oklch[2]).hex, hex) < COLLISION)
      warnings.push({ code: 'role-custom-collision', role: r });
    // Cada par se dice una vez: con dos colores propios, en el primero.
    for (const q of active)
      if (
        q !== r &&
        !(models[q] && active.indexOf(q) < active.indexOf(r)) &&
        deltaE(centers[r], centers[q]) < COLLISION
      )
        warnings.push({ code: 'roles-close', role: r, other: q });
    // Un color sin croma (C = 0) también da la nota de fuera de margen: no tiene tono (decisión 84).
    const [min, max] = ROLE_HUES[r];
    const hue = Math.round(m.oklch[2]);
    if (m.achromatic || hue < min || hue > max) warnings.push({ code: 'role-hue', role: r, min, max });
  }

  const ruleScales = visible.map(([, s]) => s);
  const name = (i) => (i < 0 ? null : label[i]);
  const aa = contrastRule(ruleScales, 4.5);
  const large = contrastRule(ruleScales, 3);
  const brandRgb = hexToRgb(color.steps[color.anchor].hex);
  return {
    input: {
      hex: hex.toUpperCase(),
      curve: color.curve,
      oklch: color.steps[color.anchor].oklch,
      chromaRatio: color.chromaRatio,
      anchorStep: label[color.anchor],
    },
    names: label,
    color: named(color),
    roles: Object.fromEntries(active.map((r) => [r, named(roleScales[r])])),
    rolePalettes: Object.fromEntries(active.filter((r) => !custom[r]).map((r) => [r, proposal[r].palette])),
    roleColors: Object.fromEntries(active.filter((r) => custom[r]).map((r) => [r, custom[r]])),
    neutral: named(neutral),
    rule: {
      aa: { white: name(aa.white), black: name(aa.black) },
      large: { white: name(large.white), black: name(large.black) },
      brand: { step: label[color.anchor], white: contrast(brandRgb, [1, 1, 1]), black: contrast(brandRgb, [0, 0, 0]) },
    },
    warnings,
  };
}

// Las tres cifras de oklch redondeadas, sin ceros finales: 0.755 0.145 165.4. La tabla de la interfaz las muestra con
// 3, 3 y 1 decimales fijos (src/components/ScaleTables.tsx).
export const oklchText = ([L, C, H]) => `${round(L, 3)} ${round(C, 3)} ${round(H, 1)}`;

// --- Archivo para Figma (F14) -------------------------------------------------------------------

/**
 * DTCG para importar en Figma: color/<nombre>/<paso>, color/<rol>/<paso> y color/neutral/<paso>, en sRGB con hex.
 * Todas las escalas completas (decisiones 11 y 15). Ocultos al publicar; sin scopes, porque la importación pone
 * ALL_SCOPES de todos modos (investigación del curso, §7, prueba 3). Nombre del archivo: Value.tokens.json.
 */
export function toFigmaTokens(scales, { name }) {
  const group = (rows) =>
    Object.fromEntries(
      rows.map((r) => [
        r.name,
        {
          $type: 'color',
          $value: { colorSpace: 'srgb', components: hexToRgb(r.hex), alpha: 1, hex: r.hex },
          $extensions: { 'com.figma.hiddenFromPublishing': true },
        },
      ]),
    );
  const color = { [name]: group(scales.color) };
  for (const [role, rows] of Object.entries(scales.roles)) color[role] = group(rows);
  color.neutral = group(scales.neutral);
  return `${JSON.stringify({ color }, null, 2)}\n`;
}

// --- Curva y nombre propuestos (C25 y C26 del curso) --------------------------------------------

// Tono (H de oklch) del paso 500 de cada paleta en el CSS fuente de Tailwind CSS 4.3.3
// (packages/tailwindcss/theme.css), comprobado el 2026-10-08.
export const TW_HUES = {
  red: 25.331,
  orange: 47.604,
  amber: 70.08,
  yellow: 86.047,
  lime: 130.85,
  green: 149.579,
  emerald: 162.48,
  teal: 182.503,
  cyan: 215.221,
  sky: 237.323,
  blue: 259.815,
  indigo: 277.117,
  violet: 292.717,
  purple: 303.9,
  fuchsia: 322.15,
  pink: 354.308,
  rose: 16.439,
};

/**
 * La curva de tono más parecido al color (la regla de la lección color-scales) y su nombre como
 * nombre de la paleta. Sin croma no hay tono: curva green (de ella solo se usa L) y nombre gray.
 * @returns {{ curve: string, name: string }}
 */
export function suggest(hex) {
  const [, C, H] = rgbToOklch(...hexToRgb(hex));
  if (C <= ACHROMATIC) return { curve: 'green', name: 'gray' };
  const distance = (h) => Math.min(Math.abs(h - H), 360 - Math.abs(h - H));
  const curve = Object.keys(TW_HUES).reduce((best, key) =>
    distance(TW_HUES[key]) < distance(TW_HUES[best]) ? key : best,
  );
  return { curve, name: curve };
}
