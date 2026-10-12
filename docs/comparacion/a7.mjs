// Paso A7: medidas del método D para los criterios de funcionalidades.md. Prueba, no código de la app.
// Uso: node a7.mjs /ruta/a/dt101 (f4885d7). Escribe a7-fixtures.json (hex de referencia para C3).
import { writeFileSync } from 'node:fs';
const M = await import('./metodo-d.mjs');
const { colorScale, roleScale, neutralScale, ladder, extreme, nearest, suggest, rgbToOklch, hexToRgb, hexs, contrast, CURVES, TW_HUES, ACHROMATIC, Yhex, Y, oklchToRgbGamut } = M;
const W = [1, 1, 1], K = [0, 0, 0];
const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
const BRANDS = [['DesignToken101', '#33CC99'], ['Rojo puro', '#FF0000'], ['Naranja', '#FF6B00'], ['Amarillo', '#FFD600'],
  ['Azul puro', '#0000FF'], ['Violeta', '#7C3AED'], ['Azul marino', '#1A2B5C'], ['Verde azulado', '#008080'],
  ['Gris azulado', '#607D8B'], ['Gris puro', '#808080'], ['Casi negro', '#111418'], ['Rosa pastel', '#F8C8DC'], ['Crema', '#F5F5DC']];
const PALS = ['red', 'orange', 'amber', 'yellow', 'green', 'emerald', 'sky', 'blue'];
const DEF = { danger: 'red', warning: 'amber', success: 'green', info: 'blue' };
const STW = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const Ls = (s) => s.steps.map((x) => x.L);
const mono = (s) => { const L = Ls(s); return L.slice(1).every((l, i) => L[i] - l > 0); };
const dup = (s) => new Set(s.steps.map((x) => x.hex)).size < s.steps.length;

// 1. Mismo contraste por paso en todas las escalas (colores, 8 paletas de rol, neutros con tinte 0, 0,5 y 1), sin el paso de la marca.
let worst = 1, nonMono = [], dups = [];
for (let N = 3; N <= 30; N++) {
  const all = [];
  for (const [l, h] of BRANDS) { const s = colorScale(h, N); all.push({ s, skip: s.anchor }); if (!mono(s)) nonMono.push(`${l} N${N}`); if (dup(s)) dups.push(`${l} N${N}`); }
  for (const p of PALS) { const s = roleScale(p, N); all.push({ s, skip: -1 }); if (!mono(s)) nonMono.push(`${p} N${N}`); if (dup(s)) dups.push(`${p} N${N}`); }
  for (const tint of [0, 0.5, 1]) for (const [, h] of BRANDS) { const s = neutralScale(h, N, tint); all.push({ s, skip: -1 }); if (!mono(s)) nonMono.push(`neutros ${h} ${tint} N${N}`); if (dup(s)) dups.push(`neutros ${h} ${tint} N${N}`); }
  for (let k = 0; k < N; k++) { const v = all.filter((a) => a.skip !== k).map((a) => contrast(hexToRgb(a.s.steps[k].hex), W)); worst = Math.max(worst, Math.max(...v) / Math.min(...v)); }
}
console.log(`1. N de 3 a 30, 13 colores + 8 paletas de rol + neutros (tinte 0, 0,5 y 1 con los 13 tonos): mayor cociente entre contrastes del mismo paso ${f(worst, 3)}`);
console.log(`   No monótonas: ${nonMono.length ? nonMono.join(', ') : 'ninguna'}; con hex repetidos: ${dups.length ? dups.join(', ') : 'ninguna'}`);

// 2. Regla de contraste por paso: primer paso con AA (4,5) sobre blanco y último con AA sobre negro, en todas las escalas (sin el de la marca).
console.log('2. Regla por paso (AA 4,5; sin el paso de la marca): N: primer paso con blanco / último con negro; conflictos entre escalas');
let conflicts = 0;
for (const N of [3, 5, 8, 10, 11, 12, 16, 20, 30]) {
  const scales = [...BRANDS.map(([, h]) => { const s = colorScale(h, N); return { s, skip: s.anchor }; }), ...PALS.map((p) => ({ s: roleScale(p, N), skip: -1 })), ...BRANDS.map(([, h]) => ({ s: neutralScale(h, N, 0.5), skip: -1 }))];
  const passW = Array.from({ length: N }, (_, k) => scales.filter((a) => a.skip !== k).map((a) => contrast(hexToRgb(a.s.steps[k].hex), W) >= 4.5));
  const passK = Array.from({ length: N }, (_, k) => scales.filter((a) => a.skip !== k).map((a) => contrast(hexToRgb(a.s.steps[k].hex), K) >= 4.5));
  const mixed = passW.filter((v) => v.some(Boolean) && !v.every(Boolean)).length + passK.filter((v) => v.some(Boolean) && !v.every(Boolean)).length;
  conflicts += mixed;
  const fw = passW.findIndex((v) => v.every(Boolean)), lk = passK.map((v) => v.every(Boolean)).lastIndexOf(true);
  console.log(`   N ${String(N).padStart(2)}: blanco desde el paso ${fw + 1} de ${N}${N === 11 ? ` (${STW[fw]})` : ''}; negro hasta el paso ${lk + 1}${N === 11 ? ` (${STW[lk]})` : ''}; pasos con escalas que cumplen y que no: ${mixed}`);
}
// Contraste de la escalera con blanco y negro con 11 pasos.
const crY = (y, bg) => (Math.max(y, bg) + 0.05) / (Math.min(y, bg) + 0.05);
console.log('   Escalera con 11 pasos, contraste con blanco: ' + STW.map((s, k) => `${s} ${f(crY(ladder(k / 10), 1))}`).join(' · '));
console.log('   Escalera con 11 pasos, contraste con negro:  ' + STW.map((s, k) => `${s} ${f(crY(ladder(k / 10), 0))}`).join(' · '));

// 3. Aviso de extremo sobre la escalera, frente a la regla de la decisión 9 (L sobre la curva propuesta).
const oldExtreme = (h) => { const [L, C] = rgbToOklch(...hexToRgb(h)); if (C <= ACHROMATIC) return false; const { fL } = CURVES[suggest(h).curve]; return Math.abs(fL(0.1) - L) <= Math.abs(fL(0.2) - L) || Math.abs(fL(0.9) - L) < Math.abs(fL(0.8) - L); };
console.log(`3. Aviso de extremo, 13 colores: nuevo ${BRANDS.filter(([, h]) => extreme(h)).map(([l]) => l).join(', ')}; decisión 9 ${BRANDS.filter(([, h]) => oldExtreme(h)).map(([l]) => l).join(', ')}`);
const sweep = []; for (let r = 0; r < 256; r += 17) for (let g = 0; g < 256; g += 17) for (let b = 0; b < 256; b += 17) { const h = hexs([r / 255, g / 255, b / 255]); if (rgbToOklch(...hexToRgb(h))[1] > ACHROMATIC) sweep.push(h); }
const nNew = sweep.filter(extreme).length, nOld = sweep.filter(oldExtreme).length, both = sweep.filter((h) => extreme(h) && oldExtreme(h)).length;
console.log(`   Barrido ${sweep.length} colores: avisan ${nNew} (nuevo) y ${nOld} (decisión 9); los dos ${both}`);
// La marca en el primer o los dos primeros pasos / últimos con 11 pasos, entre los que avisan.
const pos = sweep.filter(extreme).map((h) => nearest(Yhex(h), 11)); const cnt = {}; for (const p of pos) cnt[STW[p]] = (cnt[STW[p]] ?? 0) + 1;
console.log(`   Con 11 pasos, paso de la marca en los que avisan: ${JSON.stringify(cnt)}`);
const posNo = sweep.filter((h) => !extreme(h)).map((h) => nearest(Yhex(h), 11)); const cnt2 = {}; for (const p of posNo) cnt2[STW[p]] = (cnt2[STW[p]] ?? 0) + 1;
console.log(`   Con 11 pasos, paso de la marca en los que no avisan: ${JSON.stringify(cnt2)}`);

// 4. Recorte: azul puro con 11 pasos y los 13 colores por N.
const blue = colorScale('#0000FF', 11);
console.log(`4. Azul puro, 11 pasos: recorte en ${blue.steps.filter((s) => s.clip).length} pasos (${blue.steps.map((s, i) => (s.clip ? STW[i] : null)).filter(Boolean).join(', ')}), máximo ${Math.max(...blue.steps.map((s) => s.clip))} %`);
for (const [l, h] of BRANDS) { const s = colorScale(h, 11); const c = s.steps.filter((x) => x.clip); if (c.length) console.log(`   ${l}: ${c.length} pasos, máx ${Math.max(...c.map((x) => x.clip))} %`); }
for (const p of PALS) { const s = roleScale(p, 11); const c = s.steps.filter((x) => x.clip); if (c.length) console.log(`   rol ${p}: ${c.length} pasos, máx ${Math.max(...c.map((x) => x.clip))} %`); }

// 5. Pasos muy juntos (salto de L del motor < 0,014): escalas que avisan por N.
for (const N of [10, 11, 12, 16, 20, 30]) {
  const near = (s) => { const L = Ls(s); return L.slice(1).some((l, i) => L[i] - l < 0.014); };
  const c = BRANDS.filter(([, h]) => near(colorScale(h, N))).map(([l]) => l);
  const r = PALS.filter((p) => near(roleScale(p, N)));
  const n = near(neutralScale('#33CC99', N, 0.5));
  console.log(`5. N ${N}: colores con nota ${c.length} (${c.join(', ')}); roles ${r.join(', ') || 'ninguno'}; neutros ${n ? 'sí' : 'no'}`);
}
// Salto mínimo de L de la escalera en gris (neutros sin tinte) con 11 pasos, y menor salto por escala.
const g11 = neutralScale('#808080', 11, 0); const gl = Ls(g11);
console.log(`   Neutros sin tinte, 11 pasos, saltos de L: ${gl.slice(1).map((l, i) => f(gl[i] - l, 3)).join(' ')}`);

// 6. Roles: colisión con la marca a la misma Y (ΔE oklab < 0,05), 13 colores y barrido. Paso por defecto y primer AA.
const ok = (h) => rgbToOklch(...hexToRgb(h));
const lab = ([L, C, H]) => [L, C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)];
const dE = (x, y) => { const a = lab(ok(x)), b = lab(ok(y)); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
const tAtL = (fL, L) => { if (L >= fL(0)) return 0; if (L <= fL(1)) return 1; let a = 0, b = 1; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (fL(m) > L) a = m; else b = m; } return (a + b) / 2; };
const roleAtY = (pal, y) => { const { fL, fC } = CURVES[pal]; let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; const c = fC(tAtL(fL, m)); if (Y(oklchToRgbGamut(m, c, TW_HUES[pal])[0]) < y) lo = m; else hi = m; } const L = (lo + hi) / 2; return hexs(oklchToRgbGamut(L, fC(tAtL(fL, L)), TW_HUES[pal])[0]); };
const vsBrand = (pal, h) => dE(roleAtY(pal, Yhex(h)), h);
const vsRole = (p, q) => dE(roleScale(p, 3).steps[1].hex, roleScale(q, 3).steps[1].hex); // paso central (t = 0,5)
const MARG = { danger: ['red'], warning: ['amber', 'orange', 'yellow'], success: ['green', 'emerald'], info: ['blue', 'sky'] };
const COLLIDE = ['danger', 'warning', 'success'];
const checks = (h) => ok(h)[1] > ACHROMATIC && !extreme(h);
function propose(h) {
  const out = {}, chk = checks(h);
  for (const r of Object.keys(MARG)) {
    const others = Object.values(out).map((o) => o.pal);
    const okFor = (p) => (!chk || !COLLIDE.includes(r) || vsBrand(p, h) >= 0.05) && others.every((q) => vsRole(p, q) >= 0.05);
    const def = DEF[r];
    if (okFor(def)) { out[r] = { pal: def }; continue; }
    const alt = MARG[r].filter((p) => p !== def && okFor(p)).sort((a, b) => vsBrand(b, h) - vsBrand(a, h))[0];
    out[r] = alt ? { pal: alt, changed: true } : { pal: def, warn: true };
  }
  return out;
}
console.log('6. Roles con el método D (umbral 0,05):');
for (const [l, h] of BRANDS) { const p = propose(h); const s = Object.entries(p).filter(([, v]) => v.changed || v.warn).map(([r, v]) => `${r} ${v.pal}${v.changed ? ' (cambiada)' : ''}${v.warn ? ' (aviso)' : ''}`); console.log(`   ${l.padEnd(15)} ${checks(h) ? '' : '[sin comprobación] '}${s.join(', ') || 'sin cambios'}  ΔE danger ${checks(h) ? f(vsBrand('red', h), 3) : '-'}`); }
const sw = sweep.filter(checks); const c6 = Object.fromEntries(COLLIDE.map((r) => [r, { alt: {}, warn: 0, col: 0 }]));
for (const h of sw) { const p = propose(h); for (const r of COLLIDE) { if (vsBrand(DEF[r], h) < 0.05) c6[r].col++; if (p[r].changed) c6[r].alt[p[r].pal] = (c6[r].alt[p[r].pal] ?? 0) + 1; if (p[r].warn) c6[r].warn++; } }
console.log(`   Barrido: ${sw.length} de 4.096 colores con croma y fuera de los extremos`);
for (const r of COLLIDE) console.log(`   ${r}: colisión con la paleta por defecto ${c6[r].col}; resuelta ${JSON.stringify(c6[r].alt)}; aviso sin alternativa ${c6[r].warn}`);
console.log('   ΔE entre paletas (paso central): ' + [['amber', 'yellow'], ['red', 'orange'], ['red', 'amber'], ['amber', 'blue'], ['green', 'emerald'], ['blue', 'sky']].map(([a, b]) => `${a}/${b} ${f(vsRole(a, b), 3)}`).join(' · '));
console.log('   Primer paso con AA sobre blanco, 11 pasos: ' + PALS.map((p) => `${p} ${STW[roleScale(p, 11).steps.findIndex((s) => contrast(hexToRgb(s.hex), W) >= 4.5)]}`).join(' · '));

// 7. Tope de croma (decisión 32).
for (const h of ['#0E4C4C', '#33CC99', '#F8C8DC']) {
  const a = colorScale(h, 10), b = colorScale(h, 10, { cap: true }); const bC = ok(h)[1];
  const maxC = Math.max(...b.steps.map((s) => ok(s.hex)[1])); const dy = Math.max(...a.steps.map((s, i) => { const p = Yhex(s.hex), q = Yhex(b.steps[i].hex); return Math.max(p, q) / Math.min(p, q); }));
  console.log(`7. ${h} tope: C máx ${f(maxC, 3)} (marca ${f(bC, 3)}); pasos que cambian ${a.steps.filter((s, i) => s.hex !== b.steps[i].hex).length}; cociente máx de Y ${f(dy, 3)}; ${b.steps.map((s) => s.hex).join(' ')}`);
}

// 8. Tiempo: color + 4 roles + neutros con 30 pasos, tras calentar la escalera.
colorScale('#1877F2', 30); for (const p of Object.values(DEF)) roleScale(p, 30); neutralScale('#1877F2', 30);
let t0 = performance.now(); const R = 20;
for (let i = 0; i < R; i++) { colorScale('#1877F2', 30); for (const p of Object.values(DEF)) roleScale(p, 30); neutralScale('#1877F2', 30, 0.5); }
console.log(`8. Seis escalas de 30 pasos (escalera ya calculada): ${f((performance.now() - t0) / R, 1)} ms`);

// 9. Paso de la marca: contraste propio frente a la escalera (11 pasos).
console.log('9. Paso de la marca con 11 pasos: ' + BRANDS.map(([l, h]) => { const s = colorScale(h, 11); const a = s.anchor; return `${h} ${STW[a]} ${f(contrast(hexToRgb(h), W))}/${f(crY(ladder(a / 10), 1))}`; }).join(' · '));
const b1877 = colorScale('#1877F2', 11);
console.log(`   #1877F2: marca en ${STW[b1877.anchor]}, contraste ${f(contrast(hexToRgb('#1877F2'), W))}; escala ${b1877.steps.map((s) => s.hex).join(' ')}`);

// Referencia para C3: 13 colores con 11 pasos (curva propuesta, sin tope), neutros con tinte 0,5 y roles por defecto.
writeFileSync(new URL('./a7-fixtures.json', import.meta.url), JSON.stringify({
  note: 'Método D, metodo-d.mjs, N = 11. Generado por a7.mjs.',
  colors: Object.fromEntries(BRANDS.map(([, h]) => [h, colorScale(h, 11).steps.map((s) => s.hex)])),
  neutrals: Object.fromEntries(BRANDS.map(([, h]) => [h, neutralScale(h, 11, 0.5).steps.map((s) => s.hex)])),
  roles: Object.fromEntries(PALS.map((p) => [p, roleScale(p, 11).steps.map((s) => s.hex)])),
}, null, 1));
