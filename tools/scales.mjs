// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tools/scales.mjs.
// Copiado sin cambios en colorgods (decisión A2 o paso C2). Lo que sigue es el archivo original.

// Escalas de color en JavaScript para la herramienta "Generar escalas" (T8, T22, T23).
// Es tools/scales.py traducido línea a línea: mismas conversiones, mismas curvas y mismo redondeo,
// para que la web y el script den los mismos hex (prueba: tests/scales.test.mjs).
// Diferencias que hay que conservar al traducir (docs/investigacion-herramientas.md §5.4):
//   - round() de Python redondea al par en la mitad; Math.round, hacia +∞ → pyRound.
//   - el % de Python con decimales siempre da positivo → pyMod.
// La herramienta entrega dos escalas: la del color del usuario y la de neutros con su tono (T23).
// Sin dependencias; funciona en el navegador y en Node.js.

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const TW_NEUTRAL_L = [0.985, 0.97, 0.922, 0.87, 0.708, 0.556, 0.439, 0.371, 0.269, 0.205, 0.145];
const TW_GRAY_C = [0.002, 0.003, 0.006, 0.01, 0.022, 0.027, 0.03, 0.034, 0.033, 0.034, 0.028];

// Curvas de referencia: L y C de cada paso en las 17 paletas de color de Tailwind CSS 4.3.3
// (packages/tailwindcss/theme.css, etiqueta v4.3.3). Las mismas que TW_CURVES en tools/scales.py.
export const TW_CURVES = {
  red: [[0.971, 0.013], [0.936, 0.032], [0.885, 0.062], [0.808, 0.114], [0.704, 0.191], [0.637, 0.237], [0.577, 0.245], [0.505, 0.213], [0.444, 0.177], [0.396, 0.141], [0.258, 0.092]],
  orange: [[0.98, 0.016], [0.954, 0.038], [0.901, 0.076], [0.837, 0.128], [0.75, 0.183], [0.705, 0.213], [0.646, 0.222], [0.553, 0.195], [0.47, 0.157], [0.408, 0.123], [0.266, 0.079]],
  amber: [[0.987, 0.022], [0.962, 0.059], [0.924, 0.12], [0.879, 0.169], [0.828, 0.189], [0.769, 0.188], [0.666, 0.179], [0.555, 0.163], [0.473, 0.137], [0.414, 0.112], [0.279, 0.077]],
  yellow: [[0.987, 0.026], [0.973, 0.071], [0.945, 0.129], [0.905, 0.182], [0.852, 0.199], [0.795, 0.184], [0.681, 0.162], [0.554, 0.135], [0.476, 0.114], [0.421, 0.095], [0.286, 0.066]],
  lime: [[0.986, 0.031], [0.967, 0.067], [0.938, 0.127], [0.897, 0.196], [0.841, 0.238], [0.768, 0.233], [0.648, 0.2], [0.532, 0.157], [0.453, 0.124], [0.405, 0.101], [0.274, 0.072]],
  green: [[0.982, 0.018], [0.962, 0.044], [0.925, 0.084], [0.871, 0.15], [0.792, 0.209], [0.723, 0.219], [0.627, 0.194], [0.527, 0.154], [0.448, 0.119], [0.393, 0.095], [0.266, 0.065]],
  emerald: [[0.979, 0.021], [0.95, 0.052], [0.905, 0.093], [0.845, 0.143], [0.765, 0.177], [0.696, 0.17], [0.596, 0.145], [0.508, 0.118], [0.432, 0.095], [0.378, 0.077], [0.262, 0.051]],
  teal: [[0.984, 0.014], [0.953, 0.051], [0.91, 0.096], [0.855, 0.138], [0.777, 0.152], [0.704, 0.14], [0.6, 0.118], [0.511, 0.096], [0.437, 0.078], [0.386, 0.063], [0.277, 0.046]],
  cyan: [[0.984, 0.019], [0.956, 0.045], [0.917, 0.08], [0.865, 0.127], [0.789, 0.154], [0.715, 0.143], [0.609, 0.126], [0.52, 0.105], [0.45, 0.085], [0.398, 0.07], [0.302, 0.056]],
  sky: [[0.977, 0.013], [0.951, 0.026], [0.901, 0.058], [0.828, 0.111], [0.746, 0.16], [0.685, 0.169], [0.588, 0.158], [0.5, 0.134], [0.443, 0.11], [0.391, 0.09], [0.293, 0.066]],
  blue: [[0.97, 0.014], [0.932, 0.032], [0.882, 0.059], [0.809, 0.105], [0.707, 0.165], [0.623, 0.214], [0.546, 0.245], [0.488, 0.243], [0.424, 0.199], [0.379, 0.146], [0.282, 0.091]],
  indigo: [[0.962, 0.018], [0.93, 0.034], [0.87, 0.065], [0.785, 0.115], [0.673, 0.182], [0.585, 0.233], [0.511, 0.262], [0.457, 0.24], [0.398, 0.195], [0.359, 0.144], [0.257, 0.09]],
  violet: [[0.969, 0.016], [0.943, 0.029], [0.894, 0.057], [0.811, 0.111], [0.702, 0.183], [0.606, 0.25], [0.541, 0.281], [0.491, 0.27], [0.432, 0.232], [0.38, 0.189], [0.283, 0.141]],
  purple: [[0.977, 0.014], [0.946, 0.033], [0.902, 0.063], [0.827, 0.119], [0.714, 0.203], [0.627, 0.265], [0.558, 0.288], [0.496, 0.265], [0.438, 0.218], [0.381, 0.176], [0.291, 0.149]],
  fuchsia: [[0.977, 0.017], [0.952, 0.037], [0.903, 0.076], [0.833, 0.145], [0.74, 0.238], [0.667, 0.295], [0.591, 0.293], [0.518, 0.253], [0.452, 0.211], [0.401, 0.17], [0.293, 0.136]],
  pink: [[0.971, 0.014], [0.948, 0.028], [0.899, 0.061], [0.823, 0.12], [0.718, 0.202], [0.656, 0.241], [0.592, 0.249], [0.525, 0.223], [0.459, 0.187], [0.408, 0.153], [0.284, 0.109]],
  rose: [[0.969, 0.015], [0.941, 0.03], [0.892, 0.058], [0.81, 0.117], [0.712, 0.194], [0.645, 0.246], [0.586, 0.253], [0.514, 0.222], [0.455, 0.188], [0.41, 0.159], [0.271, 0.105]],
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
export function oklchToRgbGamut(L, C, H) {
  const conv = (c) => oklabToLin(L, c * Math.cos(rad(H)), c * Math.sin(rad(H)));
  const ok = (lin) => lin.every((x) => x >= -1e-6 && x <= 1 + 1e-6);
  let lin;
  let used;
  if (ok(conv(C))) {
    lin = conv(C);
    used = C;
  } else {
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

export const hexs = (rgb) => `#${rgb.map((x) => pyRound(x * 255).toString(16).toUpperCase().padStart(2, '0')).join('')}`;
export const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
// Contraste WCAG 2.2 sobre el hex guardado (S30).
export function contrast(a, b) {
  const [la, lb] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (la + 0.05) / (lb + 0.05);
}

const round = (x, digits) => Math.round(x * 10 ** digits) / 10 ** digits;

function row(step, L, C, H, rgb) {
  let clip = 0;
  if (!rgb) {
    let used;
    [rgb, used] = oklchToRgbGamut(L, C, H);
    if (C > 0 && used < C - 1e-9) clip = pyRound(100 * (1 - used / C));
    C = used;
  }
  const hex = hexs(rgb);
  const r = { step, oklch: [L, C, H], hex };
  if (clip) r.clip = clip;
  return r;
}

// --- Entrada ----------------------------------------------------------------------------------

// Hex (#RGB, #RRGGBB, con o sin #), RGB ("rgb(51, 204, 153)" o "51 204 153") o HSL
// ("hsl(160 60% 50%)" o "hsl(160, 60%, 50%)"). Devuelve el hex en mayúsculas o null.
// La escala se calcula siempre desde el hex: es el valor que se guarda en Figma (T22, decisión 9).
export function parseColor(input) {
  const text = String(input ?? '').trim().toLowerCase();
  let m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
    return `#${h.toUpperCase()}`;
  }
  const nums = (s) => s.split(/[\s,]+/).filter(Boolean);
  m = /^(?:rgb\(\s*([^)]*)\)|(\d[\d\s,.]*))$/.exec(text);
  if (m) {
    const parts = nums(m[1] ?? m[2]).map(Number);
    if (parts.length === 3 && parts.every((v) => Number.isFinite(v) && v >= 0 && v <= 255)) return hexs(parts.map((v) => v / 255));
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

// Nombre de una paleta: minúsculas, kebab-case por segmento (S4), y no "neutral", que es la de los neutros.
export function isPaletteName(name) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name) && name !== 'neutral';
}

// Tinte de los neutros: número de 0 a 1 (D45).
export function parseTint(input) {
  const text = String(input ?? '').trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const value = Number(text);
  return value >= 0 && value <= 1 ? value : null;
}

// --- Método (lección color-scales) -------------------------------------------------------------

/**
 * La escala del color y la de neutros a partir del color en hex (#RRGGBB).
 * Avisos como códigos; el texto lo pone la interfaz:
 *   { code: 'achromatic' }          la marca no tiene croma: escala gris y neutros sin tinte
 *   { code: 'extreme', step }       la marca cae en 50, 100, 900 o 950
 *   { code: 'clipped', steps }      pasos en los que el ajuste a sRGB recorta el croma
 */
export function build(hex, tint = 0.5, reference = 'green') {
  if (reference == null) reference = suggest(hex).curve; // null: la curva propuesta (C25)
  const curve = TW_CURVES[reference];
  if (!curve) throw new Error(`Curva desconocida: ${reference}`);
  const brand = hexToRgb(hex);
  let [aL, aC, aH] = rgbToOklch(...brand);
  const warnings = [];
  const achromatic = aC <= ACHROMATIC;
  if (achromatic) {
    aC = 0;
    tint = 0;
    warnings.push({ code: 'achromatic' });
  }
  let anchor = 0;
  for (let i = 1; i < 11; i++) if (Math.abs(curve[i][0] - aL) < Math.abs(curve[anchor][0] - aL)) anchor = i;
  const ratio = aC / curve[anchor][1];
  const accent = curve.map(([L, C], i) =>
    i === anchor ? { ...row(STEPS[i], aL, aC, aH, brand), anchor: true } : row(STEPS[i], L, C * ratio, aH),
  );
  if ([50, 100, 900, 950].includes(STEPS[anchor]) && !achromatic) warnings.push({ code: 'extreme', step: STEPS[anchor] });
  const clipped = accent.filter((r) => r.clip).map((r) => ({ step: r.step, clip: r.clip }));
  if (clipped.length) warnings.push({ code: 'clipped', steps: clipped });
  const neutral = TW_NEUTRAL_L.map((L, i) => row(STEPS[i], L, TW_GRAY_C[i] * tint, aH));
  return {
    input: { hex: hex.toUpperCase(), reference, oklch: [aL, aC, aH], anchorStep: STEPS[anchor], chromaRatio: ratio },
    accent,
    neutral,
    warnings,
  };
}

// Las tres cifras de oklch como las muestra la tabla de la lección: 0.755 0.145 165.4
export const oklchText = ([L, C, H]) => `${round(L, 3)} ${round(C, 3)} ${round(H, 1)}`;

// --- Archivo para Figma ------------------------------------------------------------------------

/**
 * DTCG para importar en Figma: color/<nombre>/<paso> y color/neutral/<paso>, en sRGB con hex.
 * Solo los pasos elegidos (D46). Ocultos al publicar, como pide color-scales; sin scopes, porque la
 * importación pone ALL_SCOPES de todos modos (investigacion-herramientas.md §7, prueba 3).
 * Nombre del archivo: Value.tokens.json, el modo de Primitives en el curso.
 */
export function toFigmaTokens(scales, { name, accentSteps = STEPS, neutralSteps = STEPS }) {
  const group = (rows, steps) =>
    Object.fromEntries(
      rows
        .filter((r) => steps.includes(r.step))
        .map((r) => [
          String(r.step),
          {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: hexToRgb(r.hex), alpha: 1, hex: r.hex },
            $extensions: { 'com.figma.hiddenFromPublishing': true },
          },
        ]),
    );
  const color = {};
  const accent = group(scales.accent, accentSteps);
  const neutral = group(scales.neutral, neutralSteps);
  if (Object.keys(accent).length) color[name] = accent;
  if (Object.keys(neutral).length) color.neutral = neutral;
  return `${JSON.stringify({ color }, null, 2)}\n`;
}

// --- Curva y nombre propuestos (C25 y C26) -----------------------------------------------------

// Tono (H de oklch) del paso 500 de cada paleta en el CSS fuente de Tailwind CSS 4.3.3
// (packages/tailwindcss/theme.css), comprobado el 2026-10-08.
export const TW_HUES = {
  red: 25.331, orange: 47.604, amber: 70.08, yellow: 86.047, lime: 130.85, green: 149.579,
  emerald: 162.48, teal: 182.503, cyan: 215.221, sky: 237.323, blue: 259.815, indigo: 277.117,
  violet: 292.717, purple: 303.9, fuchsia: 322.15, pink: 354.308, rose: 16.439,
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
  const curve = Object.keys(TW_HUES).reduce((best, key) => (distance(TW_HUES[key]) < distance(TW_HUES[best]) ? key : best));
  return { curve, name: curve };
}

// --- Ajustes en la URL (T22) -------------------------------------------------------------------

// name y curve en null: los propone suggest() a partir del color hasta que el usuario elige otros.
export const DEFAULTS = { color: '#33CC99', name: null, tint: 0.5, curve: null };

export function stateFromSearch(search) {
  const params = new URLSearchParams(search);
  const color = parseColor(params.get('color') ?? '') ?? DEFAULTS.color;
  const name = isPaletteName(params.get('name') ?? '') ? params.get('name') : DEFAULTS.name;
  const tint = parseTint(params.get('tint') ?? '') ?? DEFAULTS.tint;
  const curve = TW_CURVES[params.get('curve') ?? ''] ? params.get('curve') : DEFAULTS.curve;
  return { color, name, tint, curve };
}

// name y curve solo van en la URL si el usuario los eligió (no null).
export function searchFromState({ color, name, tint, curve }) {
  const params = { color: color.replace('#', ''), tint: String(tint) };
  if (name) params.name = name;
  if (curve) params.curve = curve;
  return `?${new URLSearchParams(params)}`;
}
