// Paso A3 (decisión 17): comprobación del rango de N por convención. Prueba, no código de la app.
// Tailwind 3 a 16, SDS 3 a 19, Radix y personalizada 3 a 30. Método C (decisión 4), neutros con PCHIP (decisión 10).
// Uso: node rango.mjs /ruta/a/dt101
const root = process.argv[2] ?? '/root/dt101';
const { suggest, rgbToOklch, oklchToRgbGamut, hexs, hexToRgb, TW_CURVES, ACHROMATIC } = await import(`${root}/tools/scales.mjs`);
const src = (await import('node:fs')).readFileSync(`${root}/tools/scales.mjs`, 'utf8');
const NL = JSON.parse(/TW_NEUTRAL_L = (\[[^\]]+\])/.exec(src)[1]), GC = JSON.parse(/TW_GRAY_C = (\[[^\]]+\])/.exec(src)[1]);

const TW = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950], SDS = [100, 1000];
const lerp = (names, t) => { const x = t * (names.length - 1), i = Math.min(names.length - 2, Math.floor(x)); return names[i] + (names[i + 1] - names[i]) * (x - i); };
const rule = (names) => (N) => Array.from({ length: N }, (_, k) => Math.round(lerp(names, k / (N - 1)) / 50) * 50);
function pchip(ys) {
  const n = ys.length, h = 1 / (n - 1), d = ys.slice(1).map((y, i) => (y - ys[i]) / h), m = new Array(n);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
  return (t) => { t = Math.min(1, Math.max(0, t)); const i = Math.min(n - 2, Math.floor(t / h)), u = (t - i * h) / h;
    return (2*u**3-3*u**2+1)*ys[i] + (u**3-2*u**2+u)*h*m[i] + (-2*u**3+3*u**2)*ys[i+1] + (u**3-u**2)*h*m[i+1]; };
}

// 1. Nombres sin repetir en el rango de cada convención.
for (const [label, f, max] of [['Tailwind', rule(TW), 16], ['SDS', rule(SDS), 19]]) {
  const bad = []; for (let N = 3; N <= max; N++) if (new Set(f(N)).size < N) bad.push(N);
  console.log(`${label} 3 a ${max}: repetidos en ${bad.join(', ') || 'ninguno'}; N = 3: ${f(3).join(' ')}; N = ${max}: ${f(max).join(' ')}`);
}

// 2. Escalas de color (método C) y de neutros de 3 a 30 pasos: L del hex decreciente y sin hex repetidos.
function scale(hex, N, curve = suggest(hex).curve) {
  const c = TW_CURVES[curve], fL = pchip(c.map((p) => p[0])), fC = pchip(c.map((p) => p[1]));
  let [aL, aC, aH] = rgbToOklch(...hexToRgb(hex)); if (aC <= ACHROMATIC) aC = 0;
  let a = 0, b = 1; if (aL >= fL(0)) b = 0; else if (aL <= fL(1)) a = 1; else for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (fL(m) > aL) a = m; else b = m; }
  const ratio = aC / fC((a + b) / 2);
  let anchor = 0; for (let i = 1; i < N; i++) if (Math.abs(fL(i / (N - 1)) - aL) < Math.abs(fL(anchor / (N - 1)) - aL)) anchor = i;
  return Array.from({ length: N }, (_, k) => k === anchor ? hex.toUpperCase() : hexs(oklchToRgbGamut(fL(k / (N - 1)), fC(k / (N - 1)) * ratio, aH)[0]));
}
const nL = pchip(NL), nC = pchip(GC);
const neutral = (hex, N) => { const [, C, H] = rgbToOklch(...hexToRgb(hex)); const tint = C <= ACHROMATIC ? 0 : 0.5;
  return Array.from({ length: N }, (_, k) => hexs(oklchToRgbGamut(nL(k / (N - 1)), nC(k / (N - 1)) * tint, H)[0])); };
const BRANDS = ['#33CC99', '#FF0000', '#FF6B00', '#FFD600', '#0000FF', '#7C3AED', '#1A2B5C', '#008080', '#607D8B', '#808080', '#111418', '#F8C8DC', '#F5F5DC'];
const problems = { color: [], neutral: [] };
for (const hex of BRANDS) for (let N = 3; N <= 30; N++) for (const [kind, hs] of [['color', scale(hex, N)], ['neutral', neutral(hex, N)]]) {
  const L = hs.map((h) => rgbToOklch(...hexToRgb(h))[0]);
  if (new Set(hs).size < N || !L.slice(1).every((l, i) => l < L[i])) problems[kind].push(`${hex} N=${N}`);
}
console.log(`13 colores, N = 3 a 30: escalas de color con hex repetido o L que no baja: ${problems.color.length ? problems.color.join('; ') : 'ninguna'}`);
console.log(`Neutros: ${problems.neutral.length ? problems.neutral.join('; ') : 'ninguna'}`);

// 3. Decisión 18: nota de pasos muy juntos. Umbral: el salto de L más pequeño entre pasos vecinos en las
// paletas de Tailwind CSS (17 de color y neutral), con sus valores de L, sin pasar por hex: 0,014 (yellow 50 a
// 100). Se compara con la L que el motor da a cada paso (la de la marca en su paso), tampoco redondeada a hex:
// medido sobre hex, el redondeo cambia el salto en unas diezmilésimas y el amarillo con 11 pasos, igual que el
// de Tailwind, avisaría.
let limit = Infinity, at = '';
for (const [name, c] of Object.entries(TW_CURVES)) c.slice(1).forEach(([L], i) => { if (c[i][0] - L < limit) { limit = c[i][0] - L; at = name; } });
NL.slice(1).forEach((L, i) => { if (NL[i] - L < limit) { limit = NL[i] - L; at = 'neutral'; } });
function stepsL(hex, N, curve = suggest(hex).curve) {
  const fL = pchip(TW_CURVES[curve].map((p) => p[0])), aL = rgbToOklch(...hexToRgb(hex))[0];
  let anchor = 0; for (let i = 1; i < N; i++) if (Math.abs(fL(i / (N - 1)) - aL) < Math.abs(fL(anchor / (N - 1)) - aL)) anchor = i;
  return Array.from({ length: N }, (_, k) => (k === anchor ? aL : fL(k / (N - 1))));
}
const gap = (L) => Math.min(...L.slice(1).map((l, i) => L[i] - l));
console.log(`\nNota de pasos muy juntos. Umbral: ${limit.toFixed(3)} (${at})`);
for (const N of [5, 8, 10, 11, 12, 13, 16, 20, 30]) {
  const c = BRANDS.filter((h) => gap(stepsL(h, N)) < limit - 1e-9);
  const n = gap(Array.from({ length: N }, (_, k) => nL(k / (N - 1)))) < limit - 1e-9;
  console.log(`  N = ${String(N).padStart(2)}: escalas de color con nota ${c.length} de 13${c.length && N <= 13 ? ` (${c.join(', ')})` : ''}; neutros ${n ? 'sí' : 'no'}`);
}
