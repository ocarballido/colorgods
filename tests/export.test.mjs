// Pruebas de la exportación (paso C4 parte 5): DTCG para Figma (F14), CSS (F15) y @theme de Tailwind CSS 4 (F16).
// Se exportan todas las escalas visibles (color, roles activos y neutros) con los N pasos (decisiones 11 y 15).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, toCss, toFigmaTokens, toTheme } from '../tools/scales.mjs';

// Escalas como en las tiras: color, roles activos en el orden de ROLES y neutros.
const tables = (r, name) => [[name, r.color], ...Object.entries(r.roles), ['neutral', r.neutral]];
const result = build('#1877F2', { steps: 11, roles: { danger: null, warning: 'orange', info: { color: '#0EA5E9' } } });

test('F14: cada variable de color/<paleta>/<paso> lleva el hex de la tabla, también la de un color propio', () => {
  const json = JSON.parse(toFigmaTokens(result, { name: 'blue' }));
  assert.deepEqual(Object.keys(json.color), ['blue', 'danger', 'warning', 'info', 'neutral']);
  let n = 0;
  for (const [p, rows] of tables(result, 'blue'))
    for (const s of rows) {
      const v = json.color[p][s.name].$value;
      assert.equal(v.hex, s.hex);
      assert.deepEqual(
        v.components.map((c) => Math.round(c * 255)),
        [1, 3, 5].map((i) => parseInt(s.hex.slice(i, i + 2), 16)),
      );
      n++;
    }
  assert.equal(n, 55);
});

test('F15: CSS válido, una variable --color-<paleta>-<paso> por paso en :root, con el hex de la tabla', () => {
  const css = toCss(result, { name: 'blue' });
  const lines = css.trim().split('\n');
  assert.equal(lines[0], ':root {');
  assert.equal(lines.at(-1), '}');
  const vars = lines.slice(1, -1).filter(Boolean);
  // Cada línea es una declaración de una propiedad personalizada con un hex de 6 cifras.
  for (const l of vars) assert.match(l, /^ {2}--color-[a-z][a-z0-9-]*-[A-Za-z0-9_-]+: #[0-9A-F]{6};$/);
  const expected = tables(result, 'blue').flatMap(([p, rows]) =>
    rows.map((s) => `  --color-${p}-${s.name}: ${s.hex};`),
  );
  assert.deepEqual(vars, expected);
  // Llaves equilibradas y nada fuera de :root.
  assert.equal(css.split('{').length, 2);
  assert.equal(css.split('}').length, 2);
});

test('F16: @theme con las mismas variables y cada paleta precedida de su línea initial, todas antes de las variables', () => {
  const theme = toTheme(result, { name: 'blue' });
  const lines = theme.trim().split('\n');
  assert.equal(lines[0], '@theme {');
  assert.equal(lines.at(-1), '}');
  const [initial, ...blocks] = lines.slice(1, -1).join('\n').split('\n\n');
  const groups = tables(result, 'blue');
  assert.deepEqual(
    initial.split('\n'),
    groups.map(([p]) => `  --color-${p}-*: initial;`),
  );
  assert.equal(blocks.length, groups.length);
  groups.forEach(([p, rows], i) =>
    assert.deepEqual(
      blocks[i].split('\n'),
      rows.map((s) => `  --color-${p}-${s.name}: ${s.hex};`),
    ),
  );
  // Las declaraciones de color son las mismas que las del CSS (F15).
  const decl = (text) => text.split('\n').filter((l) => /: #/.test(l));
  assert.deepEqual(decl(theme), decl(toCss(result, { name: 'blue' })));
});

test('F16: una paleta cuyo nombre empieza por el de otra (neutral-warm) no queda detrás de una línea initial', () => {
  // Tailwind borra todo lo que empieza por --color-neutral, también --color-neutral-warm-50 (revisión de la parte 5).
  const theme = toTheme(build('#1877F2', { roles: { info: null } }), { name: 'neutral-warm' });
  const lastInitial = theme.lastIndexOf(': initial;');
  const firstVar = theme.search(/: #/);
  assert.ok(lastInitial < firstVar);
});

test('el motor no exporta con un nombre de paleta no válido', () => {
  for (const name of ['a;}body{color:red', 'Blue', 'neutral', 'danger', ''])
    for (const f of [toCss, toTheme, toFigmaTokens]) assert.throws(() => f(result, { name }), /Invalid palette name/);
});

test('CSS y @theme con nombres personalizados y 5 pasos: los nombres de la convención, sin más pasos', () => {
  const r = build('#33CC99', { steps: 5, names: ['xs', 'S_1', 'm-2', 'L', 'XL'] });
  const css = toCss(r, { name: 'marca' });
  assert.match(css, /--color-marca-S_1: #[0-9A-F]{6};/);
  assert.equal(css.match(/--color-neutral-/g).length, 5);
  const theme = toTheme(r, { name: 'marca' });
  assert.equal(theme.match(/: initial;/g).length, 2);
  assert.doesNotMatch(theme, /--color-neutral-100:/);
});
