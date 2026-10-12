// Paso A2 (decisión 3): nombres con N pasos. Prueba, no código de la app.
// Paso k de N en t = k / (N − 1) (muestras regulares, decisión 4). Nombre = valor de la convención en t,
// interpolando linealmente entre sus nombres y redondeando a q. Comprueba que no se repiten de 5 a 15.
//
// Uso: node nombres.mjs

const TW = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]; // tailwindcss fa81d69, theme.css
const SDS = [100, 1000];                                             // figma/sds 05525f7, theme.css (100 a 1000)
const lerp = (names, t) => {
  const x = t * (names.length - 1), i = Math.min(names.length - 2, Math.floor(x));
  return names[i] + (names[i + 1] - names[i]) * (x - i);
};
const rule = (names, q) => (N) => Array.from({ length: N }, (_, k) => Math.round(lerp(names, k / (N - 1)) / q) * q);

for (const [label, f] of [['Tailwind, 50', rule(TW, 50)], ['Tailwind, 10', rule(TW, 10)], ['SDS, 50', rule(SDS, 50)], ['SDS, 10', rule(SDS, 10)]]) {
  const rep = [];
  for (let N = 5; N <= 15; N++) {
    const n = f(N);
    if (new Set(n).size < N) rep.push(N);
    if ([5, 8, 10, 11, 12, 15].includes(N)) console.log(`${label.padEnd(13)} N=${String(N).padStart(2)}  ${n.join(' ')}`);
  }
  console.log(`${label}: nombres repetidos en N = ${rep.join(', ') || 'ninguno'}\n`);
}
