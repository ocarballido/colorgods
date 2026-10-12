// Contraste por paso: método C (decisión 4) frente a "luminancia fija por paso" (método D). Prueba, no código de la app.
// Variante recomendada en direccion.md: methodD(hex, N, curva, Y_MEDIAN, true), con el croma medido en la L de cada paso.
// D: cada paso k tiene la misma luminancia relativa (Y de WCAG) en todas las escalas, tomada de una escalera: Y_MEDIAN (por defecto,
//    mediana de las 17 paletas de color de Tailwind CSS) o Y_NEUTRAL (el neutro de Tailwind CSS);
//    el croma sigue la curva de color elegida (PCHIP, A4) con la proporción de croma del método C, y el tono es el de la marca.
//    La marca sustituye al paso de Y más cercano (en log Y) y la proporción se mide en t*, donde el neutro tiene la Y de la marca.
// Uso: node contraste.mjs /ruta/a/dt101 (f4885d7). Importa scales.mjs sin cambios; la curva neutra (TW_NEUTRAL_L) no se exporta
// y se copia aquí de la línea 11 de scales.mjs.
const root = process.argv[2];
const E = await import(`${root}/tools/scales.mjs`);
const { suggest, rgbToOklch, oklchToRgbGamut, hexs, hexToRgb, contrast, TW_CURVES, ACHROMATIC } = E;
const TW_NEUTRAL_L = [0.985, 0.97, 0.922, 0.87, 0.708, 0.556, 0.439, 0.371, 0.269, 0.205, 0.145];

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
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const Y = (rgb) => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const fN = pchip(TW_NEUTRAL_L);
// Escalera "neutro": Y del neutro de Tailwind CSS en t.
const Y_NEUTRAL = (t) => Y(oklchToRgbGamut(fN(t), 0, 0)[0]);
// Escalera "mediana": en cada t, la mediana de Y de las 17 paletas de color de Tailwind CSS (L y C remuestreados, tono de TW_HUES).
const CURVE_F = Object.fromEntries(Object.entries(TW_CURVES).map(([k, c]) => [k, [pchip(c.map((p) => p[0])), pchip(c.map((p) => p[1]))]]));
const _ym = new Map();
const Y_MEDIAN = (t) => { if (_ym.has(t)) return _ym.get(t); const r = _Y_MEDIAN(t); _ym.set(t, r); return r; };
const _Y_MEDIAN = (t) => { const v = Object.entries(CURVE_F).map(([k, [fL, fC]]) => Y(oklchToRgbGamut(fL(t), fC(t), E.TW_HUES[k])[0])).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
function bisect(f, target, lo = 0, hi = 1, dec = true) { // f monótona; dec: decreciente
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if ((f(m) > target) === dec) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
function tStarL(fL, L) { if (L >= fL(0)) return 0; if (L <= fL(1)) return 1; return bisect(fL, L); }

// Método C (decisión 4).
export function methodC(hex, N, curve = suggest(hex).curve) {
  const c = TW_CURVES[curve], fL = pchip(c.map((p) => p[0])), fC = pchip(c.map((p) => p[1]));
  let [aL, aC, aH] = rgbToOklch(...hexToRgb(hex)); if (aC <= ACHROMATIC) aC = 0;
  const ts = tStarL(fL, aL), ratio = aC / fC(ts);
  const pts = Array.from({ length: N }, (_, k) => [fL(k / (N - 1)), fC(k / (N - 1))]);
  let anchor = 0; for (let i = 1; i < N; i++) if (Math.abs(pts[i][0] - aL) < Math.abs(pts[anchor][0] - aL)) anchor = i;
  return { anchor, ratio, steps: pts.map(([L, C], i) => {
    if (i === anchor) return { hex: hex.toUpperCase(), clip: 0 };
    const [rgb, used] = oklchToRgbGamut(L, C * ratio, aH);
    return { hex: hexs(rgb), clip: C * ratio > 0 && used < C * ratio - 1e-9 ? Math.round(100 * (1 - used / (C * ratio))) : 0 };
  }) };
}

// Método D: luminancia del neutro en cada paso.
export function methodD(hex, N, curve = suggest(hex).curve, YN = Y_MEDIAN, chromaByL = false) {
  const c = TW_CURVES[curve], fC = pchip(c.map((p) => p[1])), fL = pchip(c.map((p) => p[0]));
  let [aL, aC, aH] = rgbToOklch(...hexToRgb(hex)); if (aC <= ACHROMATIC) aC = 0;
  const yb = Y(hexToRgb(hex));
  // chromaByL: el croma de cada paso es el de la curva en la L del paso (no en su t), como la proporción de C.
  if (chromaByL) {
    const ratioL = aC / fC(tStarL(fL, aL));
    const tk = Array.from({ length: N }, (_, k) => k / (N - 1)), targets = tk.map(YN);
    let anchor = 0; for (let i = 1; i < N; i++) if (Math.abs(Math.log(targets[i] / yb)) < Math.abs(Math.log(targets[anchor] / yb))) anchor = i;
    const want = (l) => fC(tStarL(fL, l)) * ratioL;
    return { anchor, ratio: ratioL, steps: tk.map((t, i) => {
      if (i === anchor) return { hex: hex.toUpperCase(), clip: 0 };
      const L = bisect((l) => Y(oklchToRgbGamut(l, want(l), aH)[0]), targets[i], 0, 1, false);
      const w = want(L), [rgb, used] = oklchToRgbGamut(L, w, aH);
      return { hex: hexs(rgb), clip: w > 0 && used < w - 1e-9 ? Math.round(100 * (1 - used / w)) : 0 };
    }) };
  }
  const ts = yb >= YN(0) ? 0 : yb <= YN(1) ? 1 : bisect(YN, yb);
  const ratio = aC / fC(ts);
  const tk = Array.from({ length: N }, (_, k) => k / (N - 1));
  const targets = tk.map(YN);
  let anchor = 0; for (let i = 1; i < N; i++) if (Math.abs(Math.log(targets[i] / yb)) < Math.abs(Math.log(targets[anchor] / yb))) anchor = i;
  return { anchor, ratio, steps: tk.map((t, i) => {
    if (i === anchor) return { hex: hex.toUpperCase(), clip: 0 };
    const want = fC(t) * ratio;
    const L = bisect((l) => Y(oklchToRgbGamut(l, want, aH)[0]), targets[i], 0, 1, false);
    const [rgb, used] = oklchToRgbGamut(L, want, aH);
    return { hex: hexs(rgb), clip: want > 0 && used < want - 1e-9 ? Math.round(100 * (1 - used / want)) : 0 };
  }) };
}

const BRANDS = [['DesignToken101', '#33CC99'], ['Rojo puro', '#FF0000'], ['Naranja', '#FF6B00'], ['Amarillo', '#FFD600'],
  ['Azul puro', '#0000FF'], ['Violeta', '#7C3AED'], ['Azul marino', '#1A2B5C'], ['Verde azulado', '#008080'],
  ['Gris azulado', '#607D8B'], ['Gris puro', '#808080'], ['Casi negro', '#111418'], ['Rosa pastel', '#F8C8DC'], ['Crema', '#F5F5DC']];
const W = [1, 1, 1];
const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const N = 11, ST = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  for (const [lab, fn] of [['C', methodC], ['D neutro', (h, n) => methodD(h, n, undefined, Y_NEUTRAL)], ['D mediana', methodD], ['D mediana, C por L', (h, n) => methodD(h, n, undefined, undefined, true)]]) {
    const res = BRANDS.map(([, h]) => fn(h, N));
    console.log(`\nMétodo ${lab}, N = 11, contraste con blanco por paso (mín a máx entre los 13 colores; sin el paso de la marca):`);
    console.log('  ' + ST.map((s, k) => {
      const v = res.filter((r) => r.anchor !== k).map((r) => contrast(hexToRgb(r.steps[k].hex), W));
      return `${s} ${f(Math.min(...v))} a ${f(Math.max(...v))}`;
    }).join(' · '));
    const aa = ST.map((s, k) => res.filter((r) => r.anchor !== k).every((r) => contrast(hexToRgb(r.steps[k].hex), W) >= 4.5) ? s : null).filter(Boolean);
    console.log(`  Pasos que cumplen AA (4,5) con blanco en todos los colores: ${aa.join(', ') || 'ninguno'}`);
    const firstAA = res.map((r) => ST[r.steps.findIndex((s) => contrast(hexToRgb(s.hex), W) >= 4.5)]);
    console.log(`  Primer paso con AA según el color: ${[...new Set(firstAA)].sort((a, b) => a - b).join(', ')}`);
    let mono = 0, clip = 0, clipMax = 0, dLmin = 1;
    for (const r of res) {
      const L = r.steps.map((s) => rgbToOklch(...hexToRgb(s.hex))[0]); const dL = L.slice(1).map((l, i) => L[i] - l);
      if (dL.every((x) => x > 0)) mono++; dLmin = Math.min(dLmin, ...dL);
      clip += r.steps.filter((s) => s.clip).length; clipMax = Math.max(clipMax, ...r.steps.map((s) => s.clip));
    }
    console.log(`  Monótonas ${mono} de 13; salto de L mínimo ${f(dLmin, 3)}; pasos recortados ${clip}; recorte máx ${clipMax} %`);
  }
  for (const h of ['#FFD600', '#0000FF', '#33CC99']) {
    console.log(`\n${h}  C: ${methodC(h, 11).steps.map((s) => s.hex).join(' ')}`);
    console.log(`${h}  D: ${methodD(h, 11, undefined, undefined, true).steps.map((s) => s.hex).join(' ')}  (escalera mediana, C por L)`);
    console.log(`  marca en C: ${ST[methodC(h, 11).anchor]}, en D: ${ST[methodD(h, 11).anchor]}`);
  }
}
