// Paso A1 (decisión 4): dónde cae la marca con N pasos. Prueba, no código de la app.
// Usa tools/scales.mjs de DesignToken101 en f4885d7 sin cambios. Mismos 13 colores que compare.mjs.
//
//   A  Ancla actual: N muestras regulares de la curva (PCHIP); la marca sustituye al paso de L más
//      cercano; proporción de croma = C de la marca / C de ese paso.
//   B  Curva desplazada: se busca t* con L(t*) = L de la marca; k* = redondeo(t*·(N−1)); las muestras
//      se reparten por igual en [0, t*] (k* tramos) y en [t*, 1] (N−1−k* tramos). Extremos y número de
//      pasos iguales que en A; el paso k* cae justo en la L de la marca. Proporción = C de la marca / C(t*).
//   C  Rejilla de A, proporción de B: muestras regulares y ancla en el paso más cercano, pero la
//      proporción se calcula con C(t*), el croma de la curva en la L de la marca.
//
// Uso: node anclaje.mjs /ruta/a/dt101

const root = process.argv[2] ?? '/root/dt101';
const { build, suggest, rgbToOklch, oklchToRgbGamut, hexs, hexToRgb, TW_CURVES, ACHROMATIC } = await import(`${root}/tools/scales.mjs`);

const BRANDS = [
  ['DesignToken101', '#33CC99'], ['Rojo puro', '#FF0000'], ['Naranja', '#FF6B00'], ['Amarillo', '#FFD600'],
  ['Azul puro', '#0000FF'], ['Violeta', '#7C3AED'], ['Azul marino', '#1A2B5C'], ['Verde azulado', '#008080'],
  ['Gris azulado', '#607D8B'], ['Gris puro', '#808080'], ['Casi negro', '#111418'], ['Rosa pastel', '#F8C8DC'],
  ['Crema', '#F5F5DC'],
];
const NS = Array.from({ length: 11 }, (_, i) => i + 5); // 5 a 15

// PCHIP (Fritsch–Carlson), igual que compare.mjs.
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
    t = Math.min(1, Math.max(0, t));
    const i = Math.min(n - 2, Math.floor(t / h));
    const u = (t - i * h) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}
const funcs = (name) => { const c = TW_CURVES[name]; return { fL: pchip(c.map((p) => p[0])), fC: pchip(c.map((p) => p[1])) }; };

// t* con fL(t*) = L (fL decreciente). Fuera del rango, el extremo.
function tStar(fL, L) {
  if (L >= fL(0)) return 0;
  if (L <= fL(1)) return 1;
  let a = 0, b = 1;
  for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (fL(m) > L) a = m; else b = m; }
  return (a + b) / 2;
}

function grid(method, N, ts) {
  if (method !== 'B') return Array.from({ length: N }, (_, k) => k / (N - 1));
  const k = Math.round(ts * (N - 1));
  return Array.from({ length: N }, (_, i) =>
    i === k ? ts : i < k ? (ts * i) / k : ts + ((1 - ts) * (i - k)) / (N - 1 - k));
}

export function scaleOf(hex, N, method, curveName = suggest(hex).curve) {
  const { fL, fC } = funcs(curveName);
  let [aL, aC, aH] = rgbToOklch(...hexToRgb(hex));
  if (aC <= ACHROMATIC) aC = 0;
  const ts = tStar(fL, aL);
  const t = grid(method, N, ts);
  const pts = t.map((x) => [fL(x), fC(x)]);
  let anchor;
  if (method === 'B') anchor = Math.round(ts * (N - 1));
  else { anchor = 0; for (let i = 1; i < N; i++) if (Math.abs(pts[i][0] - aL) < Math.abs(pts[anchor][0] - aL)) anchor = i; }
  const ratio = aC / (method === 'A' ? pts[anchor][1] : fC(ts));
  const steps = pts.map(([L, C], i) => {
    if (i === anchor) return { hex: hex.toUpperCase(), L: aL, clip: 0 };
    const want = C * ratio;
    const [rgb, used] = oklchToRgbGamut(L, want, aH);
    return { hex: hexs(rgb), L, clip: want > 0 && used < want - 1e-9 ? Math.round(100 * (1 - used / want)) : 0 };
  });
  return { curve: curveName, ts, anchor, ratio, steps };
}

function measure(s) {
  const L = s.steps.map((x) => rgbToOklch(...hexToRgb(x.hex))[0]);
  const dL = L.slice(1).map((l, i) => L[i] - l);
  const min = Math.min(...dL), iMin = dL.indexOf(min);
  return {
    ratio: s.ratio, anchor: s.anchor,
    clipSteps: s.steps.filter((x) => x.clip).length, clipMax: Math.max(0, ...s.steps.map((x) => x.clip)),
    dLmin: min, dLmax: Math.max(...dL), prop: Math.max(...dL) / min,
    minByBrand: iMin === s.anchor || iMin === s.anchor - 1,
    monotonic: dL.every((x) => x > 0),
    extreme: s.anchor === 0 || s.anchor === s.steps.length - 1,
  };
}

// --- Resultados -------------------------------------------------------------------------------
const rows = [];
for (const [label, hex] of BRANDS) for (const N of NS) for (const m of ['A', 'B', 'C']) {
  const s = scaleOf(hex, N, m);
  rows.push({ label, hex, N, m, ts: s.ts, curve: s.curve, ...measure(s), hexes: s.steps.map((x) => x.hex) });
}

// Comprobación: A con N = 11 da lo mismo que build() con la curva propuesta.
let same = 0;
const n11 = {};
for (const [label, hex] of BRANDS) {
  const ref = build(hex, 0.5, null).accent.map((r) => r.hex.toUpperCase());
  const get = (m) => rows.find((r) => r.hex === hex && r.N === 11 && r.m === m).hexes;
  if (ref.join() === get('A').join()) same++;
  n11[label] = { B: get('B').filter((h, i) => h !== ref[i]).length, C: get('C').filter((h, i) => h !== ref[i]).length };
}

const f = (x, d = 2) => (x == null ? '' : x.toFixed(d).replace('.', ','));
console.log(`A con N = 11 igual que build(): ${same} de ${BRANDS.length}`);
console.log('Pasos distintos de build() con N = 11 (B; C):');
for (const [k, v] of Object.entries(n11)) console.log(`  ${k}: ${v.B}; ${v.C}`);

console.log('\nProporción de croma por color, N = 5…15 (mín – máx) y t*:');
for (const [label, hex] of BRANDS) {
  const r = (m) => rows.filter((x) => x.hex === hex && x.m === m).map((x) => x.ratio);
  const t = rows.find((x) => x.hex === hex).ts;
  const fmt = (a) => `${f(Math.min(...a))}–${f(Math.max(...a))}`;
  console.log(`  ${label.padEnd(15)} t*=${f(t, 3)} A ${fmt(r('A'))}  B ${fmt(r('B'))}  C ${fmt(r('C'))}`);
}

console.log('\nResumen por método (143 escalas cada uno):');
for (const m of ['A', 'B', 'C']) {
  const R = rows.filter((x) => x.m === m);
  const med = (a) => { const s = [...a].sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
  const spread = BRANDS.map(([, hex]) => { const a = R.filter((x) => x.hex === hex).map((x) => x.ratio); return Math.max(...a) - Math.min(...a); });
  console.log(`  ${m}: recortan ${R.filter((x) => x.clipSteps).length}; pasos recortados ${R.reduce((s, x) => s + x.clipSteps, 0)}; recorte máx ${Math.max(...R.map((x) => x.clipMax))} %;`
    + ` ΔL mín (mediana ${f(med(R.map((x) => x.dLmin)), 3)}, peor ${f(Math.min(...R.map((x) => x.dLmin)), 3)});`
    + ` proporción salto mayor/menor (mediana ${f(med(R.map((x) => x.prop)), 1)}, máx ${f(Math.max(...R.map((x) => x.prop)), 1)});`
    + ` salto menor junto a la marca ${R.filter((x) => x.minByBrand).length}; no monótonas ${R.filter((x) => !x.monotonic).length};`
    + ` marca en extremo ${R.filter((x) => x.extreme).length}; variación de la proporción de croma con N (máx) ${f(Math.max(...spread))}`);
}

console.log('\nRosa pastel y crema por N (método: proporción, pasos recortados, recorte máx, ΔL mín):');
for (const hex of ['#F8C8DC', '#F5F5DC', '#0000FF']) for (const N of NS) {
  const r = (m) => rows.find((x) => x.hex === hex && x.N === N && x.m === m);
  console.log(`  ${hex} N=${String(N).padStart(2)} ` + ['A', 'B', 'C'].map((m) => `${m} ${f(r(m).ratio)} ${r(m).clipSteps} ${r(m).clipMax}% ${f(r(m).dLmin, 3)}`).join(' | '));
}

import { writeFileSync } from 'node:fs';
writeFileSync(new URL('./resultados.json', import.meta.url), JSON.stringify(rows));
