// Paso A5 (decisión 19): márgenes de tono de danger, warning, success e info en sistemas reales,
// regla para proponer el color de cada rol y detección de colisión con la marca. Prueba, no código de la app.
// Usa tools/scales.mjs de DesignToken101 en f4885d7 sin cambios. Mismos 13 colores que anclaje.mjs.
// Uso: node roles.mjs /ruta/a/dt101
const root = process.argv[2] ?? '/root/dt101';
const { rgbToOklch, oklchToRgbGamut, hexs, hexToRgb, contrast, TW_CURVES, TW_HUES, ACHROMATIC, suggest } = await import(`${root}/tools/scales.mjs`);

// --- 1. Datos: color principal de cada rol en tema claro, leído del repositorio de cada sistema ---------
// (repositorio, archivo, commit y licencia en docs/semanticas.md §1). Solo se usa su tono; ningún valor pasa a la app.
export const SYSTEMS = {
  danger: { Bootstrap: '#DC3545', Carbon: '#DA1E28', 'Ant Design': '#FF4D4F', Polaris: '#C70A24', 'Fluent 2': '#C50F1F', Primer: '#D1242F', 'GOV.UK': '#CA3535', 'Material 3': '#BA1A1A', Spectrum: '#D73220' },
  warning: { Bootstrap: '#FFC107', Carbon: '#F1C21B', 'Ant Design': '#FAAD14', Polaris: '#FFB800', 'Fluent 2': '#F7630C', Primer: '#9A6700', Spectrum: '#FC7D00' },
  success: { Bootstrap: '#198754', Carbon: '#24A148', 'Ant Design': '#52C41A', Polaris: '#047B5D', 'Fluent 2': '#107C10', Primer: '#1A7F37', 'GOV.UK': '#0F7A52', Spectrum: '#05834E' },
  info: { Bootstrap: '#0DCAF0', Carbon: '#0043CE', 'Ant Design': '#1677FF', Polaris: '#91D0FF', Spectrum: '#3B63FB' },
  // Primer no tiene rol info (su accent es el color de enlaces y elementos interactivos); Fluent 2 tampoco.
};
export const ROLES = Object.keys(SYSTEMS);
const ok = (hex) => rgbToOklch(...hexToRgb(hex));
const hd = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };

// Margen de cada rol: del tono mínimo al máximo de los sistemas (ninguno cruza 0°). Paletas de Tailwind CSS
// cuyo tono (TW_HUES) cae dentro: las candidatas. Por defecto, la candidata más cercana a la mediana.
export const MARGINS = {};
for (const r of ROLES) {
  const hs = Object.values(SYSTEMS[r]).map((h) => ok(h)[2]).sort((a, b) => a - b);
  const med = hs.length % 2 ? hs[(hs.length - 1) / 2] : (hs[hs.length / 2 - 1] + hs[hs.length / 2]) / 2;
  const cands = Object.keys(TW_HUES).filter((k) => TW_HUES[k] >= hs[0] && TW_HUES[k] <= hs.at(-1));
  const def = cands.reduce((a, b) => (hd(TW_HUES[b], med) < hd(TW_HUES[a], med) ? b : a));
  MARGINS[r] = { min: hs[0], max: hs.at(-1), med, cands, def };
}

// --- 2. Escala de un rol: la paleta de Tailwind CSS remuestreada (A4), con su tono (TW_HUES) ------------
function pchip(ys) {
  const n = ys.length, h = 1 / (n - 1), d = ys.slice(1).map((y, i) => (y - ys[i]) / h), m = new Array(n);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
  return (t) => { t = Math.min(1, Math.max(0, t)); const i = Math.min(n - 2, Math.floor(t / h)), u = (t - i * h) / h;
    return (2*u**3-3*u**2+1)*ys[i] + (u**3-2*u**2+u)*h*m[i] + (-2*u**3+3*u**2)*ys[i+1] + (u**3-u**2)*h*m[i+1]; };
}
const curve = (name) => { const c = TW_CURVES[name]; return { fL: pchip(c.map((p) => p[0])), fC: pchip(c.map((p) => p[1])) }; };
const tAt = (fL, L) => { if (L >= fL(0)) return 0; if (L <= fL(1)) return 1; let a = 0, b = 1; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (fL(m) > L) a = m; else b = m; } return (a + b) / 2; };
export const roleAt = (pal, t) => { const { fL, fC } = curve(pal); return hexs(oklchToRgbGamut(fL(t), fC(t), TW_HUES[pal])[0]); };
export const roleScale = (pal, N) => Array.from({ length: N }, (_, k) => roleAt(pal, k / (N - 1)));

// --- 3. Medidas ---------------------------------------------------------------------------------------
const lab = ([L, C, H]) => [L, C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)];
export const dE = (x, y) => { const a = lab(ok(x)), b = lab(ok(y)); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
// Parecido de la marca con un rol: ΔE (oklab) entre la marca y la escala del rol en la L de la marca.
export const vsBrand = (pal, brand) => dE(roleAt(pal, tAt(curve(pal).fL, ok(brand)[0])), brand);
// Parecido entre dos roles: ΔE entre sus pasos centrales (t = 0,5), como semanticas.mjs.
export const vsRole = (p, q) => dE(roleAt(p, 0.5), roleAt(q, 0.5));

// --- 4. Regla -----------------------------------------------------------------------------------------
// Para cada rol, la paleta por defecto. Si la marca colisiona (vsBrand < UMBRAL), la candidata del margen
// más alejada de la marca que no colisiona con ella ni con los otros roles ya elegidos; si no hay ninguna,
// la de por defecto con aviso. No se toca el croma ni el tono de la paleta (variante T de semanticas.mjs).
export const UMBRAL = Number(process.env.UMBRAL ?? 0.05);
// Aviso de extremo (decisión 9, como avisos.mjs): en los extremos de la curva todas las paletas se acercan
// al blanco o al negro y el ΔE en la L de la marca no distingue tonos, así que no se mide colisión.
export function extreme(hex) {
  const [L, C] = ok(hex); if (C <= ACHROMATIC) return false;
  const { fL } = curve(suggest(hex).curve);
  return Math.abs(fL(0.1) - L) <= Math.abs(fL(0.2) - L) || Math.abs(fL(0.9) - L) < Math.abs(fL(0.8) - L);
}
export const checks = (brand) => ok(brand)[1] > ACHROMATIC && !extreme(brand);
// Roles con comprobación de colisión con la marca (decisión 23): info no, porque los sistemas reales usan
// el color de marca o su tono para info (Ant Design, el mismo hex; Carbon, blue 60 y blue 70).
export const COLLIDE = ['danger', 'warning', 'success'];
export function propose(brand) {
  const out = {}, chk = checks(brand);
  for (const r of ROLES) {
    const { cands, def } = MARGINS[r];
    const others = Object.values(out).map((o) => o.pal);
    const okFor = (p) => (!chk || !COLLIDE.includes(r) || vsBrand(p, brand) >= UMBRAL) && others.every((q) => vsRole(p, q) >= UMBRAL);
    if (okFor(def)) { out[r] = { pal: def, changed: false, warn: false }; continue; }
    const alt = cands.filter((p) => p !== def && okFor(p)).sort((a, b) => vsBrand(b, brand) - vsBrand(a, brand))[0];
    out[r] = alt ? { pal: alt, changed: true, warn: false } : { pal: def, changed: false, warn: true };
  }
  return out;
}

// Color elegido por el usuario para un rol (decisión 24): nota si su tono está fuera del margen del rol.
export const outOfMargin = (role, hex) => { const [, C, H] = ok(hex); return C > ACHROMATIC && (H < MARGINS[role].min - 1e-9 || H > MARGINS[role].max + 1e-9); };

export const BRANDS = [
  ['DesignToken101', '#33CC99'], ['Rojo puro', '#FF0000'], ['Naranja', '#FF6B00'], ['Amarillo', '#FFD600'],
  ['Azul puro', '#0000FF'], ['Violeta', '#7C3AED'], ['Azul marino', '#1A2B5C'], ['Verde azulado', '#008080'],
  ['Gris azulado', '#607D8B'], ['Gris puro', '#808080'], ['Casi negro', '#111418'], ['Rosa pastel', '#F8C8DC'],
  ['Crema', '#F5F5DC'],
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const f = (x, d = 3) => x.toFixed(d).replace('.', ',');
  console.log('1. Tono (H de oklch) del color de cada rol en cada sistema');
  for (const r of ROLES) console.log(`  ${r.padEnd(8)} ` + Object.entries(SYSTEMS[r]).map(([k, h]) => `${k} ${ok(h)[2].toFixed(0)}`).join(' · '));
  console.log('\n2. Margen (mín.–máx.), mediana y paletas de Tailwind CSS dentro (por defecto en mayúsculas)');
  for (const r of ROLES) { const m = MARGINS[r];
    console.log(`  ${r.padEnd(8)} ${m.min.toFixed(0)}–${m.max.toFixed(0)}, mediana ${m.med.toFixed(0)}: ${m.cands.map((p) => (p === m.def ? p.toUpperCase() : p) + ' ' + TW_HUES[p].toFixed(0)).join(', ')}`);
    const near = Object.keys(TW_HUES).filter((k) => !m.cands.includes(k)).map((k) => [k, Math.min(hd(TW_HUES[k], m.min), hd(TW_HUES[k], m.max))]).sort((a, b) => a[1] - b[1])[0];
    console.log(`           fuera, la más cercana: ${near[0]} a ${near[1].toFixed(0)}°`); }

  console.log('\n3. ΔE de cada marca con cada paleta candidata, en la L de la marca');
  const pals = [...new Set(ROLES.flatMap((r) => MARGINS[r].cands))];
  console.log('  ' + ''.padEnd(15) + pals.map((p) => p.padStart(8)).join(''));
  for (const [l, h] of BRANDS) console.log('  ' + l.padEnd(15) + pals.map((p) => f(vsBrand(p, h)).padStart(8)).join(''));
  console.log('\n4. ΔE entre paletas candidatas (paso central)');
  for (let i = 0; i < pals.length; i++) for (let j = i + 1; j < pals.length; j++) { const d = vsRole(pals[i], pals[j]); if (d < 0.12) console.log(`  ${pals[i]}/${pals[j]} ${f(d)}`); }

  console.log(`\n5. Propuesta con umbral ${f(UMBRAL, 2)} (* cambiada, ! aviso de colisión sin alternativa)`);
  let nc = 0, nw = 0;
  for (const [l, h] of BRANDS) { const p = propose(h);
    nc += ROLES.filter((r) => p[r].changed).length; nw += ROLES.filter((r) => p[r].warn).length;
    console.log(`  ${l.padEnd(15)} ` + ROLES.map((r) => `${r} ${p[r].pal}${p[r].changed ? '*' : ''}${p[r].warn ? '!' : ''}`).join(' · ')); }
  console.log(`  Roles cambiados: ${nc}; avisos sin alternativa: ${nw}`);

  console.log(`  (Sin comprobación de colisión por no tener croma o estar en un extremo: ${BRANDS.filter(([, h]) => !checks(h)).map(([l]) => l).join(', ')})`);

  console.log('\n6. Barrido de sRGB (cada 17 en cada canal), colores con croma y no en un extremo');
  const hexes = []; for (let r = 0; r <= 255; r += 17) for (let g = 0; g <= 255; g += 17) for (let b = 0; b <= 255; b += 17) hexes.push(hexs([r / 255, g / 255, b / 255]));
  const sw = hexes.filter(checks), cnt = Object.fromEntries(ROLES.map((r) => [r, { col: 0, alt: 0, warn: 0, to: {} }]));
  for (const h of sw) { const p = propose(h); for (const r of ROLES) { const def = MARGINS[r].def;
    if (COLLIDE.includes(r) && vsBrand(def, h) < UMBRAL) cnt[r].col++; if (p[r].changed) { cnt[r].alt++; cnt[r].to[p[r].pal] = (cnt[r].to[p[r].pal] ?? 0) + 1; } if (p[r].warn) cnt[r].warn++; } }
  console.log(`  ${sw.length} de ${hexes.length} colores`);
  for (const r of ROLES) console.log(`  ${r.padEnd(8)} colisión con la paleta por defecto ${cnt[r].col}; resuelta con otra paleta ${cnt[r].alt} ${JSON.stringify(cnt[r].to)}; aviso sin alternativa ${cnt[r].warn}`);
  console.log('  ΔE entre paletas por defecto: ' + ROLES.flatMap((r, i) => ROLES.slice(i + 1).map((q) => `${MARGINS[r].def}/${MARGINS[q].def} ${f(vsRole(MARGINS[r].def, MARGINS[q].def))}`)).join(' · '));

  console.log('\n7. Contraste con blanco ≥ 4,5, primer paso con 11 pasos (por paleta candidata)');
  const ST = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  console.log('  ' + pals.map((p) => { const s = roleScale(p, 11); return `${p} ${ST[s.findIndex((x) => contrast(hexToRgb(x), [1, 1, 1]) >= 4.5)]}`; }).join(' · '));
}
