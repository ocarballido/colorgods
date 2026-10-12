// ColorScale v2.3.1 (MattMcAdams/color-scale, commit a22ca8f) frente al motor (método C). Prueba, no código de la app.
// getColorsList, ease y el orden de los pasos copiados de src/functions/getColors.ts, src/functions/ease.ts y src/app/page.tsx;
// solo se implementan linear y easeInExpo (js-easing-functions 1.0.3, bameyrick/js-easing-functions src/index.ts).
// Uso: node colorscale.mjs /ruta/a/dt101 (f4885d7). Necesita color 3.0.0 y scaleOf de anclaje.mjs.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Color = require('color');
const root = process.argv[2];
const E = await import(`${root}/tools/scales.mjs`);
const { rgbToOklch, hexToRgb, contrast, suggest } = E;
const log = console.log; console.log = () => {};
const { scaleOf } = await import('./anclaje.mjs');
console.log = log;

const easeInExpo = (t, b, c, d) => (t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b);
const ease = (m, step, end, steps) => (m === 'easeInExpo' ? easeInExpo(step, 0, end, steps) : (step / steps) * end);
function getColorsList(n, mix, rot, rotE, sat, satE, amt, amtE, main) {
  const l = [];
  for (let s = 0; s < n; s++) l.push(Color(main).rotate(ease(rotE, s + 1, -rot, n)).saturate(ease(satE, s + 1, sat / 100, n)).mix(Color(mix), ease(amtE, s + 1, amt / 100, n)).hex());
  return l;
}
// De claro a oscuro (la app los muestra de oscuro a claro: [...dark, main, ...light]).
function cs(hex, cfg) {
  const d = cfg.dark, li = cfg.light;
  const dark = getColorsList(d.count, 'black', d.angle, d.angleEase, d.saturation, d.saturationEase, d.brightness, d.brightnessEase, hex).reverse();
  const light = getColorsList(li.count, 'white', li.angle, li.angleEase, li.saturation, li.saturationEase, li.brightness, li.brightnessEase, hex);
  return [...dark, hex.toUpperCase(), ...light].map((h) => h.toUpperCase()).reverse();
}
const SHOT = { dark: { count: 4, brightness: 67, brightnessEase: 'linear', angle: -10, angleEase: 'easeInExpo', saturation: 15, saturationEase: 'linear' },
  light: { count: 5, brightness: 79, brightnessEase: 'linear', angle: 25, angleEase: 'linear', saturation: 0, saturationEase: 'linear' } };
const DEF = { dark: { ...SHOT.dark, brightness: 50, angleEase: 'linear' }, light: { ...SHOT.light, brightness: 80 } };

function meas(hexes, brand) {
  const lch = hexes.map((h) => rgbToOklch(...hexToRgb(h)));
  const [, , bH] = rgbToOklch(...hexToRgb(brand));
  const L = lch.map((x) => x[0]); const dL = L.slice(1).map((l, i) => L[i] - l);
  const hd = (h) => { const d = Math.abs(h - bH) % 360; return d > 180 ? 360 - d : d; };
  const dH = lch.map(([, C, H]) => 2 * C * Math.sin((hd(H) * Math.PI) / 360));
  const hues = lch.filter((x) => x[1] > 0.02).map((x) => x[2]);
  const aa = hexes.map((h) => (contrast(hexToRgb(h), [1, 1, 1]) >= 4.5 ? 'Y' : '.')).join('');
  return { L, dLmin: Math.min(...dL), dLmax: Math.max(...dL), mono: dL.every((x) => x > 0), hues, dHmax: Math.max(...dH), aa, brandIn: hexes.includes(brand.toUpperCase()) };
}
const f = (x, d = 3) => x.toFixed(d);
function show(label, hexes, brand) {
  const m = meas(hexes, brand);
  log(`${label}\n  ${hexes.join(' ')}\n  L ${m.L.map((x) => f(x)).join(' ')}\n  salto L mín ${f(m.dLmin)} máx ${f(m.dLmax)} | monótona ${m.mono} | tono ${f(Math.min(...m.hues), 0)} a ${f(Math.max(...m.hues), 0)} | ΔH máx ${f(m.dHmax)} | marca dentro ${m.brandIn} | AA con blanco ${m.aa}`);
}
const brand = '#0EA5E9';
log('Marca', brand, rgbToOklch(...hexToRgb(brand)).map((x) => f(x)).join(' '), '| curva propuesta', suggest(brand).curve);
show('ColorScale, captura', cs(brand, SHOT), brand);
const c = scaleOf(brand, 10, 'C');
show(`Motor C, N = 10 (marca en el paso ${c.anchor + 1}; recorte en ${c.steps.filter((s) => s.clip).length} pasos)`, c.steps.map((s) => s.hex), brand);

const B = ['#33CC99', '#FF0000', '#FF6B00', '#FFD600', '#0000FF', '#7C3AED', '#1A2B5C', '#008080', '#607D8B', '#F8C8DC', '#F5F5DC', '#111418'];
for (const [lab, cfg] of [['captura', SHOT], ['por defecto', DEF]]) {
  let non = 0; const dHs = [], first = [];
  for (const h of B) {
    const s = scaleOf(h, 10, 'C');
    const k = { dark: { ...cfg.dark, count: 9 - s.anchor }, light: { ...cfg.light, count: s.anchor } };
    const m = meas(cs(h, k), h); if (!m.mono) non++; dHs.push(m.dHmax); first.push(m.L[0]);
  }
  log(`ColorScale (${lab}) en 12 colores de prueba, 10 pasos, marca en el paso del motor: L vuelve a subir en ${non}; ΔH máx de ${f(Math.min(...dHs))} a ${f(Math.max(...dHs))}; L del paso más claro de ${f(Math.min(...first))} a ${f(Math.max(...first))}`);
}
// Contraste mostrado: redondeo a 2 decimales (AdvancedColorInfo.tsx); veredicto sin redondear.
const r = Color('#0078D7').contrast(Color('#ffffff'));
log(`#0078D7 con blanco: ${r.toFixed(4)}; ColorScale muestra ${Math.round(r * 100) / 100} y da ${r >= 4.5 ? 'AA' : 'FAIL'} para texto normal`);
