// Comprobaciones del método D (escalera mediana) con N libre, neutros, barrido y tiempo. Prueba, no código de la app.
// Uso: node contraste2.mjs /ruta/a/dt101. Importa methodC y methodD de contraste.mjs.
// Con "L" como segundo argumento, el punto 1 usa la variante con el croma en la L del paso (la recomendada).
const root = process.argv[2];
const E = await import(`${root}/tools/scales.mjs`);
const { methodC, methodD } = await import('./contraste.mjs');
const { rgbToOklch, hexToRgb, contrast, oklchToRgbGamut, hexs } = E;
const W = [1, 1, 1];
const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
const BR = ['#33CC99', '#FF0000', '#FF6B00', '#FFD600', '#0000FF', '#7C3AED', '#1A2B5C', '#008080', '#607D8B', '#808080', '#111418', '#F8C8DC', '#F5F5DC'];

// 1. N de 3 a 30: monotonía, hex repetidos y dispersión del contraste por paso (sin el paso de la marca).
const VAR = process.argv[3] === 'L';
let bad = 0, dup = 0, spreadMax = 0, t0 = performance.now(), count = 0;
for (let N = 3; N <= 30; N++) {
  const res = BR.map((h) => methodD(h, N, undefined, undefined, VAR)); count += res.length;
  for (const r of res) {
    const L = r.steps.map((s) => rgbToOklch(...hexToRgb(s.hex))[0]);
    if (!L.slice(1).every((l, i) => L[i] - l > 0)) bad++;
    if (new Set(r.steps.map((s) => s.hex)).size < N) dup++;
  }
  for (let k = 0; k < N; k++) {
    const v = res.filter((r) => r.anchor !== k).map((r) => contrast(hexToRgb(r.steps[k].hex), W));
    spreadMax = Math.max(spreadMax, Math.max(...v) / Math.min(...v));
  }
}
const ms = (performance.now() - t0) / count;
console.log(`1. N de 3 a 30 (13 colores, ${count} escalas): no monótonas ${bad}; con hex repetidos ${dup}; mayor cociente entre contrastes del mismo paso ${f(spreadMax, 3)}; ${f(ms, 1)} ms por escala`);

// 2. Neutros con la escalera mediana: tinte 0,5 de C de gray (como build), tono de la marca. Contraste del paso 500 (N = 11) frente al del color.
// Se reutiliza methodD con un "color" sintético: no hace falta, basta con resolver L por Y para C = 0.
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const Y = (rgb) => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const d11 = methodD('#33CC99', 11), c11 = methodC('#33CC99', 11);
console.log('2. Contraste con blanco por paso (N = 11, #33CC99), D: ' + d11.steps.map((s) => f(contrast(hexToRgb(s.hex), W))).join(' '));
console.log('   Neutros de build() del curso (tinte 0,5):      ' + E.build('#33CC99', 0.5, null).neutral.map((r) => f(contrast(hexToRgb(r.hex), W))).join(' '));

// 3. Marca oscura y apagada (#0E4C4C): croma por paso en C y D.
for (const [lab, r] of [['C', methodC('#0E4C4C', 10)], ['D', methodD('#0E4C4C', 10)], ['D con C por L', methodD('#0E4C4C', 10, undefined, undefined, true)]]) {
  const cs = r.steps.map((s) => rgbToOklch(...hexToRgb(s.hex))[1]);
  console.log(`3. #0E4C4C, 10 pasos, ${lab}: marca en el paso ${r.anchor + 1}; C máx ${f(Math.max(...cs), 3)} (marca 0,059); ${r.steps.map((s) => s.hex).join(' ')}`);
}

// 4. Barrido de sRGB (cada 17 por canal, con croma), N = 11: escalas con recorte y recorte máximo, C frente a D.
const hexesAll = [];
for (let r = 0; r < 256; r += 17) for (let g = 0; g < 256; g += 17) for (let b = 0; b < 256; b += 17) {
  const h = hexs([r / 255, g / 255, b / 255]); if (rgbToOklch(...hexToRgb(h))[1] > E.ACHROMATIC) hexesAll.push(h);
}
for (const [lab, fn] of [['C', methodC], ['D', methodD], ['D con C por L', (h, n) => methodD(h, n, undefined, undefined, true)]]) {
  let withClip = 0, steps = 0, max = 0, over20 = 0;
  for (const h of hexesAll) { const r = fn(h, 11); const c = r.steps.filter((s) => s.clip); if (c.length) withClip++; steps += c.length; const m = Math.max(0, ...r.steps.map((s) => s.clip)); max = Math.max(max, m); if (m > 20) over20++; }
  console.log(`4. Barrido ${hexesAll.length} colores, N = 11, ${lab}: escalas con recorte ${withClip}; pasos recortados ${steps}; escalas con algún recorte > 20 % ${over20}; máximo ${max} %`);
}
