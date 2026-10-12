// Paso A3: ¿por qué un máximo de pasos? Prueba, no código de la app.
// Mide, de N = 2 a 30: nombres repetidos (Tailwind y SDS, redondeo a 50 o a 10) y el salto de L más
// pequeño entre pasos vecinos con las 17 curvas de Tailwind CSS remuestreadas con PCHIP (A4), sin marca.
// Uso: node limite.mjs /ruta/a/dt101
const root = process.argv[2] ?? '/root/dt101';
const { TW_CURVES } = await import(`${root}/tools/scales.mjs`);

const TW = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950], SDS = [100, 1000];
const lerp = (names, t) => { const x = t * (names.length - 1), i = Math.min(names.length - 2, Math.floor(x)); return names[i] + (names[i + 1] - names[i]) * (x - i); };
const rule = (names, q) => (N) => Array.from({ length: N }, (_, k) => Math.round(lerp(names, k / (N - 1)) / q) * q);

function pchip(ys) {
  const n = ys.length, h = 1 / (n - 1), d = ys.slice(1).map((y, i) => (y - ys[i]) / h), m = new Array(n);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
  return (t) => { t = Math.min(1, Math.max(0, t)); const i = Math.min(n - 2, Math.floor(t / h)), u = (t - i * h) / h;
    return (2*u**3-3*u**2+1)*ys[i] + (u**3-2*u**2+u)*h*m[i] + (-2*u**3+3*u**2)*ys[i+1] + (u**3-u**2)*h*m[i+1]; };
}
const fLs = Object.values(TW_CURVES).map((c) => pchip(c.map((p) => p[0])));

for (const [label, f] of [['Tailwind, 50', rule(TW, 50)], ['SDS, 50', rule(SDS, 50)], ['Tailwind, 10', rule(TW, 10)], ['SDS, 10', rule(SDS, 10)]]) {
  const rep = []; for (let N = 2; N <= 30; N++) if (new Set(f(N)).size < N) rep.push(N);
  console.log(`${label}: repetidos en N = ${rep.join(', ') || 'ninguno'}`);
}
console.log('Tailwind, 50, N = 16:', rule(TW, 50)(16).join(' '));
console.log('\nN  ΔL mínimo entre vecinos (peor curva; la mediana de las 17)');
for (const N of [5, 11, 15, 16, 20, 25, 30]) {
  const mins = fLs.map((fL) => Math.min(...Array.from({ length: N - 1 }, (_, k) => fL(k / (N - 1)) - fL((k + 1) / (N - 1)))));
  const s = [...mins].sort((a, b) => a - b);
  console.log(`${String(N).padStart(2)} ${s[0].toFixed(4)}  ${s[8].toFixed(4)}`);
}

// Salto de L más pequeño entre pasos vecinos en las propias paletas de Tailwind CSS (11 pasos).
let raw = Infinity, rawAt = '';
for (const [name, c] of Object.entries(TW_CURVES)) c.slice(1).forEach(([L], i) => { const d = c[i][0] - L; if (d < raw) { raw = d; rawAt = `${name} ${TW[i]}→${TW[i + 1]}`; } });
console.log(`\nSalto mínimo en Tailwind CSS: ${raw.toFixed(3)} (${rawAt})`);
for (let N = 5; N <= 40; N++) {
  const worst = Math.min(...fLs.map((fL) => Math.min(...Array.from({ length: N - 1 }, (_, k) => fL(k / (N - 1)) - fL((k + 1) / (N - 1))))));
  const under = fLs.filter((fL) => Math.min(...Array.from({ length: N - 1 }, (_, k) => fL(k / (N - 1)) - fL((k + 1) / (N - 1)))) < raw - 1e-9).length;
  if (under) { console.log(`Primer N con algún salto menor que ese: ${N} (${under} de 17 curvas)`); break; }
}
for (const N of [16, 20, 25, 30]) {
  const under = fLs.filter((fL) => Math.min(...Array.from({ length: N - 1 }, (_, k) => fL(k / (N - 1)) - fL((k + 1) / (N - 1)))) < raw - 1e-9).length;
  console.log(`N = ${N}: curvas con algún salto menor que el mínimo de Tailwind: ${under} de 17`);
}
