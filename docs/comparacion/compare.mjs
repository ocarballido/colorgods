// Comparación de tres generadores de escalas con los 13 colores de investigacion-herramientas.md §5.2
// (DesignToken101, f4885d7) y 8, 11 y 12 pasos. Prueba, no código de la app.
//
//   Motor:    tools/scales.mjs de f4885d7 sin cambios para las conversiones, el ajuste de gama y el
//             contraste. N pasos: cada curva (11 L y 11 C) se interpola con PCHIP (Fritsch–Carlson)
//             en t = 0…1 y se toman N muestras regulares; ancla en el paso de L más cercano y
//             proporción de croma, como build(). Curva: la que propone suggest() (C25).
//   Leonardo: @adobe/leonardo-contrast-colors 1.1.0, un solo color clave (la marca), fondo blanco,
//             WCAG 2. Ratios: N luminosidades HSLuv repartidas por igual entre las del primer y el
//             último paso del motor (la acción "Distribute luminosity" de su web, docs/ui/src/js/ratios.js),
//             convertidas a ratio como hace la web. Espacios: RGB (el de la web por defecto) y OKLCH.
//   Scale:    src/utils.js de hihayk/scale (69b766b) con color 3.0.0. Pasos claros y oscuros elegidos
//             para que la marca caiga en el mismo paso que en el motor. Dos ajustes: los de §5.5
//             (enlace de Oscar) y los valores por defecto de Scale.
//
// Todo se mide igual, sobre el hex de salida, con las conversiones de scales.mjs.

import { build, suggest, rgbToOklch, oklchToRgbGamut, hexs, hexToRgb, contrast, TW_CURVES, ACHROMATIC } from '/root/dt101/tools/scales.mjs';
import { Theme, Color as LeoColor, BackgroundColor, contrast as leoContrast } from '@adobe/leonardo-contrast-colors';
import { Hsluv } from 'hsluv';
import Color from 'color';

export const BRANDS = [
  ['DesignToken101', '#33CC99'], ['Rojo puro', '#FF0000'], ['Naranja', '#FF6B00'], ['Amarillo', '#FFD600'],
  ['Azul puro', '#0000FF'], ['Violeta', '#7C3AED'], ['Azul marino', '#1A2B5C'], ['Verde azulado', '#008080'],
  ['Gris azulado', '#607D8B'], ['Gris puro', '#808080'], ['Casi negro', '#111418'], ['Rosa pastel', '#F8C8DC'],
  ['Crema', '#F5F5DC'],
];
export const NS = [8, 11, 12];

// --- PCHIP (Fritsch–Carlson) sobre 11 puntos equiespaciados en [0, 1] --------------------------
function pchip(ys) {
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
    let i = Math.min(n - 2, Math.floor(t / h));
    const u = (t - i * h) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

export function curveN(name, N) {
  const c = TW_CURVES[name];
  const fL = pchip(c.map((p) => p[0])), fC = pchip(c.map((p) => p[1]));
  return Array.from({ length: N }, (_, k) => { const t = N === 1 ? 0 : k / (N - 1); return [fL(t), fC(t)]; });
}

// El método de build() con la curva remuestreada. Devuelve hex, el croma pedido y el recorte.
export function engine(hex, N) {
  const ref = suggest(hex).curve;
  const curve = curveN(ref, N);
  const brand = hexToRgb(hex);
  let [aL, aC, aH] = rgbToOklch(...brand);
  if (aC <= ACHROMATIC) aC = 0;
  let anchor = 0;
  for (let i = 1; i < N; i++) if (Math.abs(curve[i][0] - aL) < Math.abs(curve[anchor][0] - aL)) anchor = i;
  const ratio = aC / curve[anchor][1];
  const steps = curve.map(([L, C], i) => {
    if (i === anchor) return { hex: hex.toUpperCase(), clip: 0 };
    const [rgb, used] = oklchToRgbGamut(L, C * ratio, aH);
    const want = C * ratio;
    return { hex: hexs(rgb), clip: want > 0 && used < want - 1e-9 ? Math.round(100 * (1 - used / want)) : 0 };
  });
  return { ref, anchor, steps };
}

// --- Leonardo -----------------------------------------------------------------------------------
const hsluvL = (hex) => { const h = new Hsluv(); h.hex = hex.toLowerCase(); h.hexToHsluv(); return h.hsluv_l; };
const hsluvGray = (l) => { const h = new Hsluv(); h.hsluv_h = 0; h.hsluv_s = 0; h.hsluv_l = l; h.hsluvToHex(); return h.hex; };
const ratioOf = (hexA) => leoContrast(hexToRgb(hexA).map((x) => x * 255), [255, 255, 255], undefined, 'wcag2');

export function leonardo(hex, N, lightHex, darkHex, colorSpace) {
  const l0 = hsluvL(lightHex), l1 = hsluvL(darkHex);
  const ratios = Array.from({ length: N }, (_, k) => +ratioOf(hsluvGray(l0 + ((l1 - l0) * k) / (N - 1))).toFixed(2));
  // Leonardo no admite ratios repetidos ni por debajo de 1: los primeros pasos claros pueden dar 1.0x.
  const color = new LeoColor({ name: 'c', colorKeys: [hex], colorSpace, ratios });
  const bg = new BackgroundColor({ name: 'bg', colorKeys: ['#ffffff'], ratios: [1] });
  const theme = new Theme({ colors: [color], backgroundColor: bg, lightness: 100 });
  const values = theme.contrastColors[1].values;
  return { ratios, steps: values.map((v) => ({ hex: v.value.toUpperCase(), target: v.contrast })) };
}

// --- Scale (hihayk/scale src/utils.js, getColorsList sin cambios salvo el # del color) ----------
function getColorsList(colorsAmount, colorsShiftAmount, mixColor, rotate, saturation, mainColor) {
  const list = [];
  for (let step = 0; step < colorsAmount; step++) {
    list.push(Color(mainColor).rotate(((step + 1) / colorsAmount) * -rotate).saturate(((step + 1) / colorsAmount) * (saturation / 100)).mix(Color(mixColor), (colorsShiftAmount / 100) * (step + 1) / colorsAmount).hex());
  }
  return list;
}
export const SCALE_PRESETS = {
  // §5.5: enlace de Oscar
  oscar: { darkestAmount: 95, lightestAmount: 70, darkColorsMixRotate: 0, lightColorsMixRotate: 0, lightSaturation: 100, darkSaturation: 100 },
  // defaultState de src/utils.js
  defecto: { darkestAmount: 50, lightestAmount: 80, darkColorsMixRotate: -51, lightColorsMixRotate: 67, lightSaturation: 20, darkSaturation: 14 },
};
export function scale(hex, nLight, nDark, p) {
  const dark = getColorsList(nDark, p.darkestAmount, 'black', p.darkColorsMixRotate, p.darkSaturation, hex).reverse();
  const light = getColorsList(nLight, p.lightestAmount, 'white', p.lightColorsMixRotate, p.lightSaturation, hex);
  // De claro a oscuro: claros invertidos (el último es el más claro), marca, oscuros.
  return { steps: [...light.reverse(), hex.toUpperCase(), ...dark.reverse()].map((h) => ({ hex: h.toUpperCase() })) };
}

// --- Medidas ------------------------------------------------------------------------------------
const W = [1, 1, 1], K = [0, 0, 0];
export function measure(steps, brandHex) {
  const lch = steps.map((s) => rgbToOklch(...hexToRgb(s.hex)));
  const [, bC, bH] = rgbToOklch(...hexToRgb(brandHex));
  const L = lch.map((x) => x[0]);
  const dL = L.slice(1).map((l, i) => L[i] - l);
  const hueDiff = (h) => { const d = Math.abs(h - bH) % 360; return d > 180 ? 360 - d : d; };
  // ΔH de oklab: 2·C·sen(Δh/2), sin umbral; 0 si la marca no tiene tono.
  const dH = lch.map(([, C, H]) => (bC <= ACHROMATIC ? 0 : 2 * C * Math.sin((hueDiff(H) * Math.PI) / 360)));
  const hues = lch.filter(([, C]) => C > ACHROMATIC).map(([, , H]) => H);
  const crW = steps.map((s) => contrast(hexToRgb(s.hex), W));
  const crK = steps.map((s) => contrast(hexToRgb(s.hex), K));
  const brandIn = steps.some((s) => s.hex === brandHex.toUpperCase());
  const okab = (hex) => { const [l, c, h] = rgbToOklch(...hexToRgb(hex)); return [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)]; };
  const bAB = okab(brandHex);
  const nearest = Math.min(...steps.map((s) => { const a = okab(s.hex); return Math.hypot(a[0] - bAB[0], a[1] - bAB[1], a[2] - bAB[2]); }));
  const boundary = steps.filter((s) => hexToRgb(s.hex).some((x) => x === 0 || x === 1)).length;
  return {
    hex: steps.map((s) => s.hex),
    L, dLmin: Math.min(...dL), dLmax: Math.max(...dL), monotonic: dL.every((x) => x > 0), reversals: dL.filter((x) => x <= 0).length,
    hueMin: hues.length ? Math.min(...hues) : null, hueMax: hues.length ? Math.max(...hues) : null,
    hueDevMax: bC <= ACHROMATIC ? null : Math.max(...lch.filter(([, C]) => C > ACHROMATIC).map(([, , H]) => hueDiff(H))),
    dHmax: Math.max(...dH),
    pass45W: crW.filter((c) => c >= 4.5).length, pass45K: crK.filter((c) => c >= 4.5).length,
    crW, crK, brandIn, nearest, boundary,
    clipSteps: steps.filter((s) => s.clip).length, clipMax: Math.max(0, ...steps.map((s) => s.clip ?? 0)),
  };
}

// Posición de la marca en Scale: la misma que el ancla del motor.
export function runAll() {
  const out = [];
  for (const [label, hex] of BRANDS) {
    for (const N of NS) {
      const e = engine(hex, N);
      const em = measure(e.steps, hex);
      const light = e.steps[0].hex, dark = e.steps[N - 1].hex;
      const lr = leonardo(hex, N, light, dark, 'RGB');
      const lo = leonardo(hex, N, light, dark, 'OKLCH');
      const nLight = e.anchor, nDark = N - 1 - e.anchor;
      const so = scale(hex, nLight, nDark, SCALE_PRESETS.oscar);
      const sd = scale(hex, nLight, nDark, SCALE_PRESETS.defecto);
      out.push({ label, hex, N, ref: e.ref, anchor: e.anchor,
        motor: em, leoRGB: { ...measure(lr.steps, hex), ratios: lr.ratios, got: lr.steps.map((s) => contrast(hexToRgb(s.hex), W)) },
        leoOKLCH: { ...measure(lo.steps, hex), ratios: lo.ratios, got: lo.steps.map((s) => contrast(hexToRgb(s.hex), W)) },
        scaleOscar: measure(so.steps, hex), scaleDefecto: measure(sd.steps, hex) });
    }
  }
  return out;
}
