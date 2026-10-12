// Contraste del paso de la marca frente al del resto de escalas en ese paso (método D, C por L, N = 11). Prueba.
const root = process.argv[2];
const E = await import(`${root}/tools/scales.mjs`);
const { methodD } = await import('./contraste.mjs');
const W = [1, 1, 1], ST = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const BR = ['#33CC99', '#FF0000', '#FF6B00', '#FFD600', '#0000FF', '#7C3AED', '#1A2B5C', '#008080', '#607D8B', '#F8C8DC', '#F5F5DC', '#111418'];
for (const h of BR) {
  const r = methodD(h, 11, undefined, undefined, true);
  const other = BR.map((x) => methodD(x, 11, undefined, undefined, true)).find((o) => o.anchor !== r.anchor);
  const cb = E.contrast(E.hexToRgb(h), W), cl = E.contrast(E.hexToRgb(other.steps[r.anchor].hex), W);
  console.log(`${h} paso ${ST[r.anchor]}: marca ${cb.toFixed(2)} frente a ${cl.toFixed(2)} (cociente ${(Math.max(cb, cl) / Math.min(cb, cl)).toFixed(2)})`);
}
