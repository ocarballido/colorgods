// Exploración (después de A3): paletas semánticas (info, success, warning, danger) asociadas a la marca.
// Prueba, no código de la app. Usa tools/scales.mjs de DesignToken101 en f4885d7 sin cambios.
//
// Cada rol usa la curva de Tailwind CSS de su tono convencional (como S18 del curso: red, amber, blue;
// success con green). Variantes de la propuesta:
//   T   tono y croma de Tailwind CSS, sin tocar (lo que se usaría sin armonizar).
//   R   croma × proporción de la marca (método C), como S18 generalizado; tono de Tailwind.
//   RH  R + tono girado hacia el de la marca como Material (Blend.harmonize: min(diferencia/2, 15°)).
// Se mide en el paso central (t = 0,5) con N = 11.
// Uso: node semanticas.mjs /ruta/a/dt101
const root = process.argv[2] ?? '/root/dt101';
const { suggest, rgbToOklch, oklchToRgbGamut, hexs, hexToRgb, contrast, TW_CURVES, TW_HUES, ACHROMATIC } = await import(`${root}/tools/scales.mjs`);
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
function ratioOf(hex) {
  const { fL, fC } = curve(suggest(hex).curve);
  let [aL, aC] = rgbToOklch(...hexToRgb(hex)); if (aC <= ACHROMATIC) return 0;
  let a = 0, b = 1; if (aL >= fL(0)) b = 0; else if (aL <= fL(1)) a = 1; else for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (fL(m) > aL) a = m; else b = m; }
  return aC / fC((a + b) / 2);
}
const diff = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
const dir = (from, to) => (((to - from + 540) % 360) - 180 >= 0 ? 1 : -1);
const lab = ([L, C, H]) => [L, C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)];
const dE = (x, y) => Math.hypot(...lab(x).map((v, i) => v - lab(y)[i]));
const okOf = (hex) => rgbToOklch(...hexToRgb(hex));

const ROLES = { danger: 'red', warning: 'amber', success: 'green', info: 'blue' };
const BRANDS = [['DesignToken101', '#33CC99'], ['Rojo puro', '#FF0000'], ['Naranja', '#FF6B00'], ['Amarillo', '#FFD600'],
  ['Azul puro', '#0000FF'], ['Violeta', '#7C3AED'], ['Azul marino', '#1A2B5C'], ['Verde azulado', '#008080'],
  ['Gris azulado', '#607D8B'], ['Gris puro', '#808080'], ['Casi negro', '#111418'], ['Rosa pastel', '#F8C8DC'], ['Crema', '#F5F5DC']];

function roleColor(role, brandHex, variant, t = 0.5) {
  const name = ROLES[role], { fL, fC } = curve(name);
  const [, bC, bH] = okOf(brandHex);
  let H = TW_HUES[name], C = fC(t);
  if (variant !== 'T') C *= ratioOf(brandHex);
  if (variant === 'RH' && bC > ACHROMATIC) H = (H + Math.min(diff(H, bH) * 0.5, 15) * dir(H, bH) + 360) % 360;
  const [rgb, used] = oklchToRgbGamut(fL(t), C, H);
  return { hex: hexs(rgb), ok: okOf(hexs(rgb)), clip: C > 0 ? Math.round(100 * (1 - used / C)) : 0 };
}

console.log('Proporción de croma de cada marca (método C): la R y RH multiplican por ella el croma de los semánticos.');
console.log('  ' + BRANDS.map(([l, h]) => `${l} ${ratioOf(h).toFixed(2)}`).join(' · '));

for (const variant of ['T', 'R', 'RH']) {
  console.log(`\nVariante ${variant}: paso central de cada rol. ΔE con la marca en su paso (ΔE mín. entre roles) · croma`);
  let low = 0, near = 0, rolesNear = 0;
  for (const [label, hex] of BRANDS) {
    const b = okOf(hex);
    const cols = Object.keys(ROLES).map((r) => [r, roleColor(r, hex, variant)]);
    // Con la marca: el rol en la misma L que la marca (t de la marca en la curva del rol no se usa; se compara a su paso).
    const vsBrand = Object.keys(ROLES).map((r) => {
      const { fL } = curve(ROLES[r]); let a = 0, z = 1; for (let i = 0; i < 60; i++) { const m = (a + z) / 2; if (fL(m) > b[0]) a = m; else z = m; }
      return [r, dE(roleColor(r, hex, variant, (a + z) / 2).ok, b)];
    });
    const closest = vsBrand.reduce((p, q) => (q[1] < p[1] ? q : p));
    let minRoles = Infinity, pair = '';
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const d = dE(cols[i][1].ok, cols[j][1].ok); if (d < minRoles) { minRoles = d; pair = `${cols[i][0]}/${cols[j][0]}`; } }
    const chroma = cols.map(([, c]) => c.ok[1]);
    if (Math.max(...chroma) < 0.05) low++;
    if (closest[1] < 0.05) near++;
    if (minRoles < 0.08) rolesNear++;
    console.log(`  ${label.padEnd(15)} ${cols.map(([r, c]) => `${r} ${c.hex}`).join(' ')} | más parecido a la marca: ${closest[0]} ${closest[1].toFixed(3)} | roles ${pair} ${minRoles.toFixed(3)} | C máx ${Math.max(...chroma).toFixed(3)}`);
  }
  console.log(`  Resumen ${variant}: marcas con semánticos casi grises (C < 0,05): ${low}; con un rol casi igual a la marca (ΔE < 0,05): ${near}; con dos roles parecidos entre sí (ΔE < 0,08): ${rolesNear}`);
}

// Contraste: paso más claro (t) de cada rol con texto blanco ≥ 4,5, variante T (no depende de la marca en L).
console.log('\nContraste: L de los roles sale de su curva de Tailwind, igual para cualquier marca. Con N = 11, primer paso con blanco ≥ 4,5:');
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
for (const r of Object.keys(ROLES)) {
  const k = STEPS.findIndex((_, i) => contrast(hexToRgb(roleColor(r, '#33CC99', 'T', i / 10).hex), [1, 1, 1]) >= 4.5);
  console.log(`  ${r} (${ROLES[r]}): ${STEPS[k]}`);
}
