// Método D (decisiones 30 y 32): prototipo de referencia para A7 y C3. Prueba, no código de la app.
// Importa tools/scales.mjs de DesignToken101 en f4885d7 sin cambios; TW_NEUTRAL_L y TW_GRAY_C no se exportan y se copian
// de sus líneas 11 y 12. Mismos resultados de color que methodD(hex, N, curva, Y_MEDIAN, true) de contraste.mjs.
//
//   Escalera: en cada posición t, la mediana de la luminancia relativa (Y de WCAG) de las 17 paletas de color de Tailwind CSS,
//             con L y C remuestreados con PCHIP (A4) y el tono de TW_HUES.
//   Paso k:   t = k / (N − 1); su Y es la de la escalera en t, en todas las escalas.
//   Color:    croma = croma de la curva elegida en la L del paso × proporción de croma (croma de la marca entre el de la curva
//             en la L de la marca, decisión 4); tono de la marca; la marca sustituye al paso de Y más cercana (en log Y).
//             Tope (decisión 32): croma del paso ≤ croma de la marca.
//   Rol:      la paleta de Tailwind CSS con su croma (en la L del paso) y su tono; proporción 1.
//   Neutros:  croma de gray de Tailwind CSS en t (PCHIP) × tinte, con el tono de la marca.
//   La L de cada paso se busca para que, ya ajustado a sRGB, tenga la Y pedida.
//
// Uso como módulo: import { colorScale, roleScale, neutralScale, ladder, extreme } from './metodo-d.mjs'.
export const root = process.env.DT101 ?? process.argv[2] ?? '/root/dt101';
const E = await import(`${root}/tools/scales.mjs`);
export const { suggest, rgbToOklch, oklchToRgbGamut, hexs, hexToRgb, contrast, TW_CURVES, TW_HUES, ACHROMATIC } = E;
const TW_GRAY_C = [0.002, 0.003, 0.006, 0.01, 0.022, 0.027, 0.03, 0.034, 0.033, 0.034, 0.028];

export function pchip(ys) {
  const n = ys.length, h = 1 / (n - 1);
  const d = ys.slice(1).map((y, i) => (y - ys[i]) / h);
  const m = new Array(n);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (t) => {
    t = Math.min(1, Math.max(0, t));
    const i = Math.min(n - 2, Math.floor(t / h));
    const u = (t - i * h) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const Y = (rgb) => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const Yhex = (h) => Y(hexToRgb(h));
const bisect = (f, target, lo, hi, dec) => { for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if ((f(m) > target) === dec) lo = m; else hi = m; } return (lo + hi) / 2; };

export const CURVES = Object.fromEntries(Object.entries(TW_CURVES).map(([k, c]) => [k, { fL: pchip(c.map((p) => p[0])), fC: pchip(c.map((p) => p[1])) }]));
const tAtL = (fL, L) => (L >= fL(0) ? 0 : L <= fL(1) ? 1 : bisect(fL, L, 0, 1, true));
const fGray = pchip(TW_GRAY_C);

const cache = new Map();
export function ladder(t) {
  if (cache.has(t)) return cache.get(t);
  const v = Object.entries(CURVES).map(([k, { fL, fC }]) => Y(oklchToRgbGamut(fL(t), fC(t), TW_HUES[k])[0])).sort((a, b) => a - b);
  const y = v[Math.floor(v.length / 2)];
  cache.set(t, y);
  return y;
}
const ts = (N) => Array.from({ length: N }, (_, k) => k / (N - 1));

// Un paso con la Y pedida: chroma(L) da el croma deseado en cada L.
function solve(target, chroma, H) {
  const L = bisect((l) => Y(oklchToRgbGamut(l, chroma(l), H)[0]), target, 0, 1, false);
  const want = chroma(L), [rgb, used] = oklchToRgbGamut(L, want, H);
  return { hex: hexs(rgb), L, C: used, clip: want > 0 && used < want - 1e-9 ? Math.round(100 * (1 - used / want)) : 0 };
}
// Paso de la escalera más cercano a una Y (en log Y), con los empates hacia el más claro.
export function nearest(y, N) {
  const t = ts(N); let a = 0;
  for (let i = 1; i < N; i++) if (Math.abs(Math.log(ladder(t[i]) / y)) < Math.abs(Math.log(ladder(t[a]) / y))) a = i;
  return a;
}
// Aviso de marca en un extremo (propuesta de A7): la Y de la marca está más cerca (en log Y) de la escalera en t = 0,1 que en
// t = 0,2, o en t = 0,9 que en t = 0,8. Empates hacia el más claro, como nearest(). No depende de N ni de la curva.
export function extreme(hex) {
  const [, C] = rgbToOklch(...hexToRgb(hex)); if (C <= ACHROMATIC) return false;
  const y = Yhex(hex), d = (t) => Math.abs(Math.log(ladder(t) / y));
  return d(0.1) <= d(0.2) || d(0.9) < d(0.8);
}

export function colorScale(hex, N, { curve = suggest(hex).curve, cap = false } = {}) {
  const { fL, fC } = CURVES[curve];
  let [aL, aC, aH] = rgbToOklch(...hexToRgb(hex)); const achromatic = aC <= ACHROMATIC; if (achromatic) aC = 0;
  const ratio = aC / fC(tAtL(fL, aL));
  const anchor = nearest(Yhex(hex), N);
  const chroma = (l) => { const c = fC(tAtL(fL, l)) * ratio; return cap ? Math.min(c, aC) : c; };
  const steps = ts(N).map((t, i) => (i === anchor ? { hex: hex.toUpperCase(), L: aL, C: aC, clip: 0, brand: true } : solve(ladder(t), chroma, aH)));
  return { curve, ratio, anchor, achromatic, extreme: extreme(hex), steps };
}
export function roleScale(pal, N) {
  const { fL, fC } = CURVES[pal];
  return { steps: ts(N).map((t) => solve(ladder(t), (l) => fC(tAtL(fL, l)), TW_HUES[pal])) };
}
export function neutralScale(hueOf, N, tint = 0.5) {
  const [, C, H] = rgbToOklch(...hexToRgb(hueOf)); const k = C <= ACHROMATIC ? 0 : tint;
  return { steps: ts(N).map((t) => solve(ladder(t), () => fGray(t) * k, H)) };
}
