// Paso A7, comprobaciones complementarias: nota de pasos muy juntos de 13 a 20 pasos, recorte de los roles antes (A5) y ahora,
// y tiempo de una versión con tablas (la que tendría que hacer C3). Prueba, no código de la app. Uso: DT101=/ruta node a7b.mjs
const M = await import('./metodo-d.mjs');
const { colorScale, roleScale, neutralScale, ladder, CURVES, TW_HUES, oklchToRgbGamut, hexs, Y, rgbToOklch, hexToRgb, suggest } = M;
const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
const BR = ['#33CC99', '#FF0000', '#FF6B00', '#FFD600', '#0000FF', '#7C3AED', '#1A2B5C', '#008080', '#607D8B', '#808080', '#111418', '#F8C8DC', '#F5F5DC'];
const near = (s) => { const L = s.steps.map((x) => x.L); return L.slice(1).some((l, i) => L[i] - l < 0.014); };
for (let N = 13; N <= 20; N++) console.log(`N ${N}: colores con nota ${BR.filter((h) => near(colorScale(h, N))).length} de 13; neutros ${near(neutralScale('#33CC99', N)) ? 'sí' : 'no'}; rol red ${near(roleScale('red', N)) ? 'sí' : 'no'}`);
// Recorte de los roles con 11 pasos en A5 (paleta de Tailwind remuestreada en su L, roleAt de roles.mjs) y con el método D.
for (const p of ['red', 'amber', 'yellow', 'orange', 'green', 'emerald', 'blue', 'sky']) {
  const { fL, fC } = CURVES[p]; let n = 0, mx = 0;
  for (let k = 0; k < 11; k++) { const t = k / 10, want = fC(t), [, used] = oklchToRgbGamut(fL(t), want, TW_HUES[p]); if (used < want - 1e-9) { n++; mx = Math.max(mx, Math.round(100 * (1 - used / want))); } }
  const d = roleScale(p, 11).steps.filter((s) => s.clip);
  console.log(`rol ${p}: A5 ${n} pasos (máx ${mx} %); método D ${d.length} pasos (máx ${Math.max(0, ...d.map((s) => s.clip))} %)`);
}
// Tiempo con tablas: la escalera, el croma de cada curva en función de L (512 muestras) y 24 iteraciones de bisección en L.
// Mismo resultado salvo redondeo: se cuenta cuántos hex cambian frente a metodo-d.mjs en las seis escalas de 30 pasos.
const tAtL = (fL, L) => { if (L >= fL(0)) return 0; if (L <= fL(1)) return 1; let a = 0, b = 1; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (fL(m) > L) a = m; else b = m; } return (a + b) / 2; };
const TAB = {}; for (const [k, { fL, fC }] of Object.entries(CURVES)) TAB[k] = Array.from({ length: 513 }, (_, i) => fC(tAtL(fL, i / 512)));
const cAt = (k, L) => { const x = Math.min(1, Math.max(0, L)) * 512, i = Math.min(511, Math.floor(x)); return TAB[k][i] + (TAB[k][i + 1] - TAB[k][i]) * (x - i); };
const LAD = new Map(); const lad = (t) => { if (!LAD.has(t)) LAD.set(t, ladder(t)); return LAD.get(t); };
function solveFast(target, chroma, H) { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (Y(oklchToRgbGamut(m, chroma(m), H)[0]) < target) lo = m; else hi = m; } const L = (lo + hi) / 2; return hexs(oklchToRgbGamut(L, chroma(L), H)[0]); }
function fast(hex, N, pal) {
  const ts = Array.from({ length: N }, (_, k) => k / (N - 1));
  if (pal) return ts.map((t) => solveFast(lad(t), (l) => cAt(pal, l), TW_HUES[pal]));
  const [aL, aC, aH] = rgbToOklch(...hexToRgb(hex)); const cv = suggest(hex).curve; const ratio = aC / cAt(cv, aL);
  return ts.map((t) => solveFast(lad(t), (l) => cAt(cv, l) * ratio, aH));
}
const pals = ['red', 'amber', 'green', 'blue']; fast('#1877F2', 30); for (const p of pals) fast(null, 30, p);
let t0 = performance.now(); for (let i = 0; i < 50; i++) { fast('#1877F2', 30); for (const p of pals) fast(null, 30, p); fast('#808080', 30); }
const ms = (performance.now() - t0) / 50;
const ref = colorScale('#1877F2', 30).steps.map((s) => s.hex), got = fast('#1877F2', 30);
const diff = ref.filter((h, i) => i !== colorScale('#1877F2', 30).anchor && h !== got[i]).length;
let dr = 0; for (const p of pals) { const r = roleScale(p, 30).steps.map((s) => s.hex), g = fast(null, 30, p); dr += r.filter((h, i) => h !== g[i]).length; }
console.log(`Con tablas: seis escalas de 30 pasos en ${f(ms, 1)} ms; hex distintos de metodo-d.mjs: color ${diff} de 29, roles ${dr} de 120`);

// Comprobaciones añadidas tras la revisión (2026-10-11).
const { contrast: cr2, hexToRgb: h2r } = M;
const ROLES8 = ['red', 'orange', 'amber', 'yellow', 'green', 'emerald', 'sky', 'blue'];
// a) Nota de pasos muy juntos de 3 a 19 pasos con las 8 paletas de rol y los neutros de los 13 tonos; salto de crema junto a la marca.
for (let N = 3; N <= 19; N++) {
  const c = BR.filter((h) => near(colorScale(h, N))).length, r = ROLES8.filter((p) => near(roleScale(p, N))).length, n = BR.filter((h) => near(neutralScale(h, N))).length;
  console.log(`a) N ${N}: colores ${c} de 13; roles ${r} de 8; neutros ${n} de 13`);
}
{ const L = colorScale('#F5F5DC', 11).steps.map((x) => x.L); console.log(`a) Crema, 11 pasos: salto entre la marca (50) y 100: ${f(L[0] - L[1], 4)}`); }
// b) Mismo contraste por paso con tope y con otras curvas (red, blue, yellow para todos los colores), N de 3 a 30.
let worstB = 1;
for (let N = 3; N <= 30; N++) {
  const all = [];
  for (const h of BR) for (const opt of [{ cap: true }, { curve: 'red' }, { curve: 'blue' }, { curve: 'yellow' }]) { const s = colorScale(h, N, opt); all.push({ s, skip: s.anchor }); }
  for (const p of ROLES8) all.push({ s: roleScale(p, N), skip: -1 });
  for (let k = 0; k < N; k++) { const v = all.filter((a) => a.skip !== k).map((a) => cr2(h2r(a.s.steps[k].hex), [1, 1, 1])); worstB = Math.max(worstB, Math.max(...v) / Math.min(...v)); }
}
console.log(`b) Con tope y con las curvas red, blue y yellow (13 colores) más los 8 roles, N de 3 a 30: mayor cociente entre contrastes del mismo paso ${f(worstB, 4)}`);
// c) Regla de F26 con 11 pasos, AA y 3, con los hex de las escalas (13 colores sin y con tope, 8 roles, neutros de los 13 tonos).
{
  const N = 11, ST = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const sc = [...BR.flatMap((h) => [colorScale(h, N), colorScale(h, N, { cap: true })]).map((s) => ({ s, skip: s.anchor })), ...ROLES8.map((p) => ({ s: roleScale(p, N), skip: -1 })), ...BR.map((h) => ({ s: neutralScale(h, N), skip: -1 }))];
  for (const lvl of [4.5, 3]) {
    const pw = ST.map((_, k) => sc.filter((a) => a.skip !== k).every((a) => cr2(h2r(a.s.steps[k].hex), [1, 1, 1]) >= lvl));
    const pk = ST.map((_, k) => sc.filter((a) => a.skip !== k).every((a) => cr2(h2r(a.s.steps[k].hex), [0, 0, 0]) >= lvl));
    console.log(`c) Nivel ${lvl}: sobre blanco desde ${ST[pw.indexOf(true)]}; sobre negro hasta ${ST[pk.lastIndexOf(true)]} (con y sin tope)`);
  }
}
