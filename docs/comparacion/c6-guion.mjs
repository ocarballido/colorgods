// Resultados esperados del guion de pruebas manuales (docs/pruebas-manuales.md, paso C6, parte 1).
// Calcula con el motor y los textos de la interfaz lo que el guion dice que tiene que verse.
// Uso: node docs/comparacion/c6-guion.mjs > docs/comparacion/c6-guion-salida.txt
import { build, suggest, parseColor } from '../../tools/scales.mjs';
import { notices, count, plural } from '../../src/components/noticeData.ts';
import { visibleScales } from '../../src/components/scaleData.ts';
import { measure } from '../../src/components/pairData.ts';

const ROLES_ON = { danger: null, warning: null, success: null, info: null };

function caso(label, hex, options = {}) {
  const r = build(hex, options);
  const name = suggest(hex).name;
  const scales = visibleScales(r, name);
  const list = notices(r, scales);
  const c = count(list);
  console.log(`\n## ${label}: ${hex} ${JSON.stringify(options)}`);
  console.log('propuesta:', suggest(hex), '| curva usada:', r.input.curve, '| paso de la marca:', r.input.anchorStep);
  console.log('nombres:', r.names.join(' '));
  console.log('regla AA:', r.rule.aa, '| 3:', r.rule.large, '| marca:', r.rule.brand);
  console.log('paletas de los roles:', r.rolePalettes);
  console.log('avisos y notas:', c);
  for (const n of list) console.log(' ', n.warning ? 'aviso' : 'nota', '|', n.text, n.at ? `| Show in table: ${n.at}` : '');
  // Mismo texto que summarize() de src/components/StatusRegion.tsx (no se importa: es .tsx con JSX).
  const roles = Object.keys(r.roles).length;
  const w = list.filter((n) => n.warning).length;
  console.log('región de estado:', `Scales updated: ${r.names.length} steps, ${roles ? `${plural(roles, 'semantic palette')}, ` : ''}${plural(w, 'warning')}, ${plural(list.length - w, 'note')}.`);
  return { r, scales };
}

console.log('# Formatos de F1');
for (const t of ['#1877F2', 'rgb(24 119 242)', 'rgb(24, 119, 242)', 'hsl(214 89.2% 52.2%)', '24 119 242', '#17F', '#33CC9'])
  console.log(JSON.stringify(t), '->', parseColor(t));

const d = caso('Por defecto', '#1877F2', { steps: 11 });
console.log('neutral 950:', d.r.neutral.at(-1).hex, '| blue 50:', d.r.color[0].hex);
const pair = measure({ text: null, bg: null }, d.scales);
console.log('par por defecto:', pair);
console.log('par con Black de fondo (V4):', measure({ text: null, bg: 'black' }, d.scales).spoken);
console.log('par con Swap tras Black (V4):', measure({ text: 'black', bg: 'color:6' }, d.scales).spoken);

const dw = caso('Por defecto con danger y warning (G1)', '#1877F2', { steps: 11, roles: { danger: null, warning: null } });
console.log('danger 50:', dw.r.roles.danger[0].hex, '| blue 600:', dw.r.color[6].hex, '| neutral 950:', dw.r.neutral.at(-1).hex);
caso('V2: 12 pasos', '#1877F2', { steps: 12 });
caso('V2: #1A2B5C con 12 pasos', '#1A2B5C', { steps: 12 });
caso('Sin croma', '#808080', { steps: 11 });
caso('Extremo', '#1A2B5C', { steps: 11 });
caso('Recorte', '#0000FF', { steps: 11 });
caso('Pasos muy juntos', '#F5F5DC', { steps: 11 });
caso('Rojo', '#F40009', { steps: 11 });
caso('Tope de croma', '#0E4C4C', { steps: 10, cap: true });
const m = caso('Comprobación 7: seis escalas de 30 pasos', '#1877F2', { steps: 30, names: 'radix', roles: ROLES_ON });
console.log('escalas:', m.scales.map((s) => `${s.name} ${s.steps.length}`).join(', '));
console.log('tinte 0, neutral último:', build('#1877F2', { steps: 11, tint: 0 }).neutral.at(-1).hex);
