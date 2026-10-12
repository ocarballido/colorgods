// Tope de croma: el croma de cada paso no supera k veces el de la marca. Ilustración con #0E4C4C y #33CC99, método D (C por L). Prueba.
const root = process.argv[2];
const E = await import(`${root}/tools/scales.mjs`);
const { rgbToOklch, hexToRgb, oklchToRgbGamut, hexs } = E;
const { methodD } = await import('./contraste.mjs');
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const Y = (rgb) => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function cap(hex, N, k) {
  const base = methodD(hex, N, undefined, undefined, true);
  const [, aC, aH] = rgbToOklch(...hexToRgb(hex));
  return base.steps.map((s, i) => {
    if (i === base.anchor) return s.hex;
    const [L, C] = rgbToOklch(...hexToRgb(s.hex));
    if (C <= k * aC) return s.hex;
    const y = Y(hexToRgb(s.hex)); let lo = 0, hi = 1; // misma Y con el croma limitado
    for (let j = 0; j < 60; j++) { const m = (lo + hi) / 2; if (Y(oklchToRgbGamut(m, k * aC, aH)[0]) < y) lo = m; else hi = m; }
    return hexs(oklchToRgbGamut((lo + hi) / 2, k * aC, aH)[0]);
  });
}
for (const h of ['#0E4C4C', '#33CC99']) for (const k of [Infinity, 1.5, 1]) console.log(`${h} tope ${k}: ${cap(h, 10, k).join(' ')}`);
// Comprobación: el tope no cambia la luminancia relativa de ningún paso (cociente máximo de Y con y sin tope).
for (const h of ['#0E4C4C', '#33CC99']) for (const k of [1.5, 1]) {
  const a = cap(h, 10, Infinity), b = cap(h, 10, k);
  const q = Math.max(...a.map((x, i) => { const ya = Y(hexToRgb(x)), yb = Y(hexToRgb(b[i])); return Math.max(ya, yb) / Math.min(ya, yb); }));
  console.log(`${h} tope ${k}: cociente máximo de Y con y sin tope ${q.toFixed(3)}`);
}
