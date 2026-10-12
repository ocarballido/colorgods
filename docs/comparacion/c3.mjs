// Paso C3: el motor (tools/scales.mjs) frente al prototipo (metodo-d.mjs), y tiempo de cálculo (decisión 38).
// Prueba, no código de la app. Uso: DT101=/ruta/a/dt101 node docs/comparacion/c3.mjs
// (DT101: una copia de DesignToken101 en f4885d7, o cualquier carpeta con su tools/scales.mjs, que metodo-d.mjs importa).
const P = await import('./metodo-d.mjs');
const E = await import('../../tools/scales.mjs');
const f = (x, d = 1) => x.toFixed(d).replace('.', ',');

const BR = ['#33CC99', '#FF0000', '#FF6B00', '#FFD600', '#0000FF', '#7C3AED', '#1A2B5C', '#008080', '#607D8B', '#808080', '#111418', '#F8C8DC', '#F5F5DC', '#1877F2', '#0E4C4C'];
const PALS = ['red', 'orange', 'amber', 'yellow', 'green', 'emerald', 'sky', 'blue'];
const SWEEP = [];
for (let r = 0; r < 256; r += 51) for (let g = 0; g < 256; g += 51) for (let b = 0; b < 256; b += 51) SWEEP.push(E.hexs([r / 255, g / 255, b / 255]));

// 1. Mismos hex, mismo recorte y mismo paso de la marca. L: mayor diferencia.
let steps = 0, hexDiff = 0, clipDiff = 0, anchorDiff = 0, dL = 0;
const cmp = (a, b) => {
  a.steps.forEach((s, i) => {
    steps++;
    if (s.hex !== b.steps[i].hex) hexDiff++;
    if ((s.clip ?? 0) !== (b.steps[i].clip ?? 0)) clipDiff++;
    dL = Math.max(dL, Math.abs(s.L - b.steps[i].oklch[0]));
  });
};
for (let N = 3; N <= 30; N++) {
  for (const h of [5, 11, 16, 30].includes(N) ? [...BR, ...SWEEP] : BR) {
    for (const opt of [{}, { cap: true }, { curve: 'red' }, { curve: 'blue' }]) {
      const a = P.colorScale(h, N, opt), b = E.colorScale(h, N, opt);
      if (a.anchor !== b.anchor) anchorDiff++;
      cmp(a, b);
    }
    for (const tint of [0, 0.5, 1]) cmp(P.neutralScale(h, N, tint), E.neutralScale(h, N, tint));
  }
  for (const p of Object.keys(E.TW_CURVES)) cmp(P.roleScale(p, N), E.paletteScale(p, N));
}
console.log(`1. N de 3 a 30 con ${BR.length} colores, y con N = 5, 11, 16 y 30 además ${SWEEP.length} del barrido (6 valores por canal); sin tope, con tope y con las curvas red y blue; neutros con tinte 0, 0,5 y 1; las 17 paletas`);
console.log(`   Pasos comparados ${steps}: hex distintos ${hexDiff}; recorte distinto ${clipDiff}; paso de la marca distinto ${anchorDiff}; mayor diferencia de L ${dL.toExponential(1)}`);

// 2. Tiempo: color, cuatro roles y neutros con 30 pasos (escalera ya calculada), como a7.mjs punto 8.
const time = (fn, R) => { fn(); const t0 = performance.now(); for (let i = 0; i < R; i++) fn(); return (performance.now() - t0) / R; };
const DEF = ['red', 'amber', 'green', 'blue'];
const proto = time(() => { P.colorScale('#1877F2', 30); for (const p of DEF) P.roleScale(p, 30); P.neutralScale('#1877F2', 30, 0.5); }, 10);
const motor = time(() => { E.colorScale('#1877F2', 30); for (const p of DEF) E.paletteScale(p, 30); E.neutralScale('#1877F2', 30, 0.5); }, 50);
const full = time(() => E.build('#1877F2', { steps: 30, names: 'radix', roles: { danger: null, warning: null, success: null, info: null } }), 50);
console.log(`2. Seis escalas de 30 pasos: prototipo ${f(proto)} ms; motor ${f(motor)} ms; build() completo (con propuesta de roles, avisos y regla) ${f(full)} ms`);
// Primera llamada con un N nuevo (incluye calcular la escalera de ese N).
const t0 = performance.now(); E.build('#FF6B00', { steps: 29, names: 'radix' });
console.log(`   build() con un N aún no calculado (29 pasos, sin roles): ${f(performance.now() - t0)} ms`);
