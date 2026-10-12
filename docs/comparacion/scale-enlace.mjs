// Scale con el enlace de Oscar del 2026-10-11 (#5/4/58/63/15/38/24/16/0E4C4C/.../white) frente al motor (método C).
// Prueba, no código de la app. Uso: node scale-enlace.mjs /ruta/a/dt101 (DesignToken101 en f4885d7).
// Necesita color 3.0.0 (con color-convert 1.9.2 y color-string 1.5.2) y scaleOf de anclaje.mjs.
// getColorsList y el orden de claro a oscuro son los de compare.mjs (hihayk/scale 69b766b).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Color = require('color');
function getColorsList(n, shift, mix, rotate, sat, main) { const l=[]; for (let s=0;s<n;s++) l.push(Color(main).rotate(((s+1)/n)*-rotate).saturate(((s+1)/n)*(sat/100)).mix(Color(mix),(shift/100)*(s+1)/n).hex()); return l; }
const scale = function scale(hex, nLight, nDark, p) {
  const dark = getColorsList(nDark, p.darkestAmount, 'black', p.darkColorsMixRotate, p.darkSaturation, hex).reverse();
  const light = getColorsList(nLight, p.lightestAmount, 'white', p.lightColorsMixRotate, p.lightSaturation, hex);
  return [...light.reverse(), hex.toUpperCase(), ...dark.reverse()].map(h=>h.toUpperCase());
};
const root = process.argv[2];
const E = await import(`${root}/tools/scales.mjs`);
const { rgbToOklch, hexToRgb, contrast, suggest } = E;
const log = console.log; console.log = () => {};
const { scaleOf } = await import('./anclaje.mjs');
console.log = log;
const P = { darkestAmount: 58, lightestAmount: 63, darkColorsMixRotate: 15, lightColorsMixRotate: 38, lightSaturation: 24, darkSaturation: 16 };
const okab = (h) => { const [l,c,hh]=rgbToOklch(...hexToRgb(h)); return [l,c*Math.cos(hh*Math.PI/180),c*Math.sin(hh*Math.PI/180)]; };
function meas(hexes, brand) {
  const lch = hexes.map(h=>rgbToOklch(...hexToRgb(h)));
  const [,bC,bH] = rgbToOklch(...hexToRgb(brand));
  const L = lch.map(x=>x[0]); const dL = L.slice(1).map((l,i)=>L[i]-l);
  const hd = (h)=>{const d=Math.abs(h-bH)%360; return d>180?360-d:d;};
  const dH = lch.map(([,C,H])=>2*C*Math.sin(hd(H)*Math.PI/360));
  const crW = hexes.map(h=>contrast(hexToRgb(h),[1,1,1]));
  return { L: L.map(x=>x.toFixed(3)).join(' '), dLmin: Math.min(...dL), dLmax: Math.max(...dL), mono: dL.every(x=>x>0),
    hue: lch.filter(x=>x[1]>0.02).map(x=>x[2]), dHmax: Math.max(...dH), Lfirst: L[0], Llast: L[L.length-1],
    aa: crW.map(c=>c>=4.5?'Y':'.').join(''), brandIn: hexes.includes(brand.toUpperCase()) };
}
const f=(x,d=3)=>x.toFixed(d);
function show(label, hexes, brand) { const m = meas(hexes, brand); log(`${label}\n  ${hexes.join(' ')}\n  L ${m.L}\n  salto L min ${f(m.dLmin)} max ${f(m.dLmax)} (prop ${f(m.dLmax/m.dLmin,1)}) monótona ${m.mono} | tono ${f(Math.min(...m.hue),0)} a ${f(Math.max(...m.hue),0)} | ΔH máx ${f(m.dHmax)} | marca dentro ${m.brandIn} | AA blanco ${m.aa}`); return m; }
const brand = '#0E4C4C';
log('Marca', brand, rgbToOklch(...hexToRgb(brand)).map(x=>x.toFixed(3)).join(' '), 'curva propuesta', suggest(brand).curve);
show('Scale, enlace (4 claros, 5 oscuros)', scale(brand,4,5,P), brand);
const c = scaleOf(brand, 10, 'C');
show(`Motor C, N=10 (marca en paso ${c.anchor}, recorte ${c.steps.filter(s=>s.clip).length} pasos máx ${Math.max(0,...c.steps.map(s=>s.clip))}%)`, c.steps.map(s=>s.hex), brand);
for (const N of [10, 11, 12]) { const s = scaleOf(brand, N, 'C'); log(`  motor N=${N}: marca en paso ${s.anchor} de ${N} (0 = más claro)`); }
// Mismo ajuste del enlace sobre los 13 colores de prueba, con la marca en la posición del motor, N=10
const B = [['#33CC99'],['#FF0000'],['#FF6B00'],['#FFD600'],['#0000FF'],['#7C3AED'],['#1A2B5C'],['#008080'],['#607D8B'],['#F8C8DC'],['#F5F5DC'],['#111418']];
let nonMono=0, dHs=[], firsts=[], props=[];
for (const [h] of B) { const s=scaleOf(h,10,'C'); const sc=scale(h,s.anchor,9-s.anchor,P); const m=meas(sc,h); if(!m.mono) nonMono++; dHs.push(m.dHmax); firsts.push(m.Lfirst); props.push(m.dLmax/m.dLmin); }
log(`\nEnlace aplicado a 12 colores de prueba con 10 pasos: no monótonas ${nonMono}; ΔH máx de ${f(Math.min(...dHs))} a ${f(Math.max(...dHs))}; L del paso más claro de ${f(Math.min(...firsts))} a ${f(Math.max(...firsts))}; prop. saltos máx ${f(Math.max(...props.filter(isFinite)),1)}`);
