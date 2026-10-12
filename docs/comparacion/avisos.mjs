// Paso A3: regla del aviso "extremo" con N pasos y neutros con N pasos. Prueba, no código de la app.
// Usa tools/scales.mjs de DesignToken101 en f4885d7 sin cambios.
// Uso: node avisos.mjs /ruta/a/dt101
const root = process.argv[2] ?? '/root/dt101';
const { build, suggest, rgbToOklch, oklchToRgbGamut, contrast, hexToRgb, hexs, TW_CURVES, ACHROMATIC } = await import(`${root}/tools/scales.mjs`);

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
    const i = Math.min(n - 2, Math.floor(t / h)), u = (t - i * h) / h;
    return (2*u**3-3*u**2+1)*ys[i] + (u**3-2*u**2+u)*h*m[i] + (-2*u**3+3*u**2)*ys[i+1] + (u**3-u**2)*h*m[i+1];
  };
}
const fLof = (name) => pchip(TW_CURVES[name].map((p) => p[0]));
function anchorOf(fL, L, N) {
  let a = 0;
  for (let i = 1; i < N; i++) if (Math.abs(fL(i / (N - 1)) - L) < Math.abs(fL(a / (N - 1)) - L)) a = i;
  return a;
}
// Regla propuesta: la marca está más cerca, en L, de la curva en t = 0,1 que en t = 0,2 (o de t = 0,9 que de 0,8).
// Es la regla del curso (ancla en 50, 100, 900 o 950 con 11 pasos) escrita sin N; los empates se
// resuelven como en build(), que se queda con el paso más claro.
function extreme(hex, curve = suggest(hex).curve) {
  const [L, C] = rgbToOklch(...hexToRgb(hex));
  if (C <= ACHROMATIC) return false;
  const fL = fLof(curve);
  return Math.abs(fL(0.1) - L) <= Math.abs(fL(0.2) - L) || Math.abs(fL(0.9) - L) < Math.abs(fL(0.8) - L);
}

// 1. Igual que el curso con 11 pasos: barrido de sRGB (paso 17) y las 17 curvas para los 13 colores.
let total = 0, diff = 0, warn = 0;
for (let r = 0; r <= 255; r += 17) for (let g = 0; g <= 255; g += 17) for (let b = 0; b <= 255; b += 17) {
  const hex = hexs([r / 255, g / 255, b / 255]);
  const course = build(hex, 0.5, null).warnings.some((w) => w.code === 'extreme');
  const mine = extreme(hex);
  total++; if (course) warn++; if (course !== mine) diff++;
}
console.log(`Barrido sRGB (curva propuesta): ${total} colores, el curso avisa en ${warn}, distintos: ${diff}`);

const BRANDS = [['DesignToken101', '#33CC99'], ['Rojo puro', '#FF0000'], ['Naranja', '#FF6B00'], ['Amarillo', '#FFD600'],
  ['Azul puro', '#0000FF'], ['Violeta', '#7C3AED'], ['Azul marino', '#1A2B5C'], ['Verde azulado', '#008080'],
  ['Gris azulado', '#607D8B'], ['Gris puro', '#808080'], ['Casi negro', '#111418'], ['Rosa pastel', '#F8C8DC'], ['Crema', '#F5F5DC']];
let d2 = 0, n2 = 0;
for (const [, hex] of BRANDS) for (const curve of Object.keys(TW_CURVES)) {
  n2++; if (build(hex, 0.5, curve).warnings.some((w) => w.code === 'extreme') !== extreme(hex, curve)) d2++;
}
console.log(`13 colores × 17 curvas: ${n2} casos, distintos del curso: ${d2}`);

// 2. Con N de 5 a 15: posición del ancla de los colores que avisan y de los que no.
console.log('\nColor: aviso; ancla (paso, de 0 a N-1) con N = 5 … 15');
for (const [label, hex] of BRANDS) {
  const curve = suggest(hex).curve, fL = fLof(curve), L = rgbToOklch(...hexToRgb(hex))[0];
  const pos = [];
  for (let N = 5; N <= 15; N++) pos.push(`${anchorOf(fL, L, N)}/${N - 1}`);
  console.log(`  ${label.padEnd(15)} ${extreme(hex) ? 'sí' : 'no'}  ${pos.join(' ')}`);
}

// 3. Reglas por posición del paso: ¿cambian con N para un mismo color?
const rules = {
  'dos primeros y dos últimos': (k, N) => k <= 1 || k >= N - 2,
  'k/(N-1) <= 0,1 o >= 0,9': (k, N) => k / (N - 1) <= 0.1 + 1e-9 || k / (N - 1) >= 0.9 - 1e-9,
};
for (const [name, rule] of Object.entries(rules)) {
  let flips = 0, colors = 0;
  for (let r = 0; r <= 255; r += 17) for (let g = 0; g <= 255; g += 17) for (let b = 0; b <= 255; b += 17) {
    const hex = hexs([r / 255, g / 255, b / 255]);
    const [L, C] = rgbToOklch(...hexToRgb(hex));
    if (C <= ACHROMATIC) continue;
    const fL = fLof(suggest(hex).curve);
    const v = new Set(); for (let N = 5; N <= 15; N++) v.add(rule(anchorOf(fL, L, N), N));
    colors++; if (v.size > 1) flips++;
  }
  console.log(`Regla "${name}": el aviso cambia con N en ${flips} de ${colors} colores con croma`);
}

// 4. Neutros con N pasos: sus dos curvas (L de neutral y C de gray de Tailwind CSS) remuestreadas con PCHIP (A4).
const src = (await import('node:fs')).readFileSync(`${root}/tools/scales.mjs`, 'utf8');
const nL = pchip(JSON.parse(/TW_NEUTRAL_L = (\[[^\]]+\])/.exec(src)[1])), nC = pchip(JSON.parse(/TW_GRAY_C = (\[[^\]]+\])/.exec(src)[1]));
const neutral = (hex, tint, N) => {
  const [, C, H] = rgbToOklch(...hexToRgb(hex)); if (C <= ACHROMATIC) tint = 0;
  return Array.from({ length: N }, (_, k) => hexs(oklchToRgbGamut(nL(k / (N - 1)), nC(k / (N - 1)) * tint, H)[0]));
};
let same = 0, cases = 0, mono = true;
for (const [, hex] of BRANDS) for (const tint of [0, 0.5, 1]) {
  cases++; if (neutral(hex, tint, 11).join() === build(hex, tint, null).neutral.map((r) => r.hex).join()) same++;
  for (let N = 5; N <= 15; N++) { const L = neutral(hex, tint, N).map((h) => rgbToOklch(...hexToRgb(h))[0]); if (!L.slice(1).every((l, i) => l < L[i])) mono = false; }
}
console.log(`\nNeutros con N = 11 iguales a build(): ${same} de ${cases}; L decreciente de 5 a 15 pasos: ${mono ? 'sí' : 'no'}`);

// 5. Contraste redondeado a 2 decimales que dice 4,50 sin llegar a 4,5 (con blanco).
const c = contrast(hexToRgb('#0078D7'), [1, 1, 1]);
console.log(`#0078D7 con blanco: ${c.toFixed(4)} (redondeado ${c.toFixed(2)}, truncado ${(Math.floor(c * 100) / 100).toFixed(2)})`);
