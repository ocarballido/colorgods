// Pruebas del motor a N pasos (paso C3). Sustituyen a las pruebas de hex copiadas de DesignToken101 (f4885d7), que
// comprobaban los hex del curso con 11 pasos (A3, sustituida por las decisiones 4 y 30). Las pruebas de entrada, tinte,
// nombre de paleta y curva propuesta vienen de aquel archivo, adaptadas.
//
// Referencias: docs/funcionalidades.md (F5 a F8, F12, F21, F22, F24 a F26), decisiones 3, 17, 30, 32 y 35,
// y docs/comparacion/a7-fixtures.json (hex del prototipo docs/comparacion/metodo-d.mjs con N = 11).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  build, colorScale, paletteScale, neutralScale, isExtreme, nearestStep, proposeRoles, contrastRule, truncate2,
  stepNames, checkCustomNames, fillNames, parseSteps, MAX_STEPS, ROLES, ROLE_PALETTES,
  parseColor, parseTint, isPaletteName, suggest, toFigmaTokens, rgbToOklch, hexToRgb, hexs, contrast, TW_HUES, TW_CURVES, ACHROMATIC,
} from '../tools/scales.mjs';

const fixtures = JSON.parse(fs.readFileSync(new URL('../docs/comparacion/a7-fixtures.json', import.meta.url), 'utf8'));
const BRANDS = Object.keys(fixtures.colors); // los 13 colores de prueba
const PALS = Object.keys(fixtures.roles); // las 8 paletas de rol
const TW11 = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const W = [1, 1, 1];
const L = (s) => s.steps.map((x) => x.oklch[0]);
const hexOf = (s) => s.steps.map((x) => x.hex);
const monotone = (s) => L(s).every((l, i, a) => i === 0 || a[i - 1] > l);
const unique = (s) => new Set(hexOf(s)).size === s.steps.length;
// Barrido de A7: 16 valores por canal (0, 17 … 255), 4.096 colores; 4.080 con croma.
const SWEEP = [];
for (let r = 0; r < 256; r += 17) for (let g = 0; g < 256; g += 17) for (let b = 0; b < 256; b += 17) SWEEP.push(hexs([r / 255, g / 255, b / 255]));
const chromatic = (h) => rgbToOklch(...hexToRgb(h))[1] > ACHROMATIC;

// --- Hex de referencia (decisión 30) --------------------------------------------------------------

test('N = 11: los hex coinciden con a7-fixtures.json (color, neutros con tinte 0,5 y roles)', () => {
  assert.equal(BRANDS.length, 13);
  for (const h of BRANDS) {
    assert.deepEqual(hexOf(colorScale(h, 11)), fixtures.colors[h], `color ${h}`);
    assert.deepEqual(hexOf(neutralScale(h, 11, 0.5)), fixtures.neutrals[h], `neutros ${h}`);
  }
  for (const p of PALS) assert.deepEqual(hexOf(paletteScale(p, 11)), fixtures.roles[p], `rol ${p}`);
});

// --- F7, F8 y F25 ----------------------------------------------------------------------------------

test('F7, F8 y F25: de 3 a 30 pasos, L decreciente, sin hex repetidos y el mismo contraste en cada paso', () => {
  let worst = 1;
  for (let N = 3; N <= 30; N++) {
    const all = [];
    for (const h of BRANDS) {
      const s = colorScale(h, N);
      assert.ok(monotone(s) && unique(s), `color ${h} N ${N}`);
      assert.equal(s.steps[s.anchor].hex, h, `marca ${h} N ${N}`);
      assert.equal(s.steps.filter((x) => x.anchor).length, 1);
      all.push({ s, skip: s.anchor });
      for (const opt of [{ cap: true }, { curve: 'red' }, { curve: 'blue' }, { curve: 'yellow' }]) {
        const o = colorScale(h, N, opt);
        all.push({ s: o, skip: o.anchor });
      }
    }
    for (const p of PALS) {
      const s = paletteScale(p, N);
      assert.ok(monotone(s) && unique(s), `rol ${p} N ${N}`);
      all.push({ s, skip: -1 });
    }
    for (const tint of [0, 0.5, 1]) {
      for (const h of BRANDS) {
        const s = neutralScale(h, N, tint);
        assert.ok(monotone(s) && unique(s), `neutros ${h} ${tint} N ${N}`);
        all.push({ s, skip: -1 });
      }
    }
    for (let k = 0; k < N; k++) {
      const v = all.filter((a) => a.skip !== k).map((a) => contrast(hexToRgb(a.s.steps[k].hex), W));
      worst = Math.max(worst, Math.max(...v) / Math.min(...v));
    }
  }
  assert.ok(worst <= 1.015, `mayor cociente ${worst}`);
});

test('F7: la proporción de croma no depende de N', () => {
  for (const h of BRANDS) {
    const r = colorScale(h, 11).chromaRatio;
    for (const N of [3, 7, 16, 30]) assert.equal(colorScale(h, N).chromaRatio, r, `${h} N ${N}`);
  }
});

// --- F12 ------------------------------------------------------------------------------------------

test('F12.1: sin croma, escala gris, neutros sin tinte y ningún otro aviso', () => {
  const out = build('#808080', { tint: 0.5 });
  assert.deepEqual(out.warnings, [{ code: 'achromatic' }]);
  for (const s of [...out.color, ...out.neutral]) assert.equal(rgbToOklch(...hexToRgb(s.hex))[1] < 1e-3, true, s.hex);
});

test('F12.2: aviso de extremo sobre la escalera (decisión 35)', () => {
  const warned = BRANDS.filter(isExtreme);
  assert.deepEqual(warned, ['#1A2B5C', '#111418', '#F5F5DC']); // azul marino, casi negro y crema
  for (const N of [3, 5, 11, 16, 30]) {
    for (const h of BRANDS) assert.equal(build(h, { steps: N, names: 'radix' }).warnings.some((w) => w.code === 'extreme'), warned.includes(h), `${h} N ${N}`);
  }
  const sweep = SWEEP.filter(chromatic);
  assert.equal(sweep.length, 4080);
  let n = 0;
  for (const h of sweep) {
    const step = TW11[nearestStep(h, 11)];
    const edge = ['50', '100', '900', '950'].includes(step);
    assert.equal(isExtreme(h), edge, `${h} cae en ${step}`);
    if (edge) n++;
  }
  assert.equal(n, 678);
});

test('F12.3: recorte del azul puro con N = 11 y de amber', () => {
  const out = build('#0000FF');
  const w = out.warnings.find((x) => x.code === 'clipped' && x.scale === 'color');
  assert.deepEqual(w.steps.map((s) => s.name), ['50', '100', '200', '300', '400', '500', '600', '700', '900']);
  assert.equal(Math.max(...w.steps.map((s) => s.clip)), 47);
  assert.equal(out.color[3].clip, w.steps[3].clip);
  const amber = paletteScale('amber', 11).steps.filter((s) => s.clip);
  assert.equal(amber.length, 11);
  assert.equal(Math.max(...amber.map((s) => s.clip)), 55);
});

test('F12.4: pasos muy juntos con la L del motor', () => {
  const near = (s) => L(s).some((l, i, a) => i > 0 && a[i - 1] - l < 0.014);
  const expected = { 10: [0, 0, 0], 11: [1, 0, 0], 16: [1, 0, 0], 17: [6, 3, 0], 18: [11, 6, 13], 19: [11, 6, 13] };
  for (let N = 3; N <= 19; N++) {
    const got = [BRANDS.filter((h) => near(colorScale(h, N))).length, PALS.filter((p) => near(paletteScale(p, N))).length, BRANDS.filter((h) => near(neutralScale(h, N))).length];
    assert.deepEqual(got, expected[N] ?? (N < 10 ? [0, 0, 0] : [1, 0, 0]), `N ${N}`);
  }
  for (const N of [20, 30]) {
    assert.ok(BRANDS.every((h) => near(colorScale(h, N)) && near(neutralScale(h, N))), `N ${N}`);
    assert.ok(PALS.every((p) => near(paletteScale(p, N))), `N ${N}`);
  }
  const cream = build('#F5F5DC');
  assert.deepEqual(cream.warnings.find((x) => x.code === 'close'), { code: 'close', scale: 'color', pairs: [['50', '100']] });
});

// --- F21 y F22 ------------------------------------------------------------------------------------

test('F21 y F22: paletas propuestas y colisión con la marca, 13 colores', () => {
  for (const h of BRANDS) {
    const p = proposeRoles(h);
    assert.deepEqual(Object.keys(p), ROLES);
    for (const r of ROLES) assert.equal(p[r].palette, ROLE_PALETTES[r][0], `${h} ${r}`);
    const warned = ROLES.filter((r) => p[r].collision);
    assert.deepEqual(warned, ['#FF0000', '#F8C8DC'].includes(h) ? ['danger'] : [], h);
  }
  const out = build('#FF0000', { roles: { danger: null, info: null } });
  assert.deepEqual(out.warnings.filter((w) => w.code.startsWith('role')), [{ code: 'role-collision', role: 'danger', palette: 'red' }]);
  assert.deepEqual(Object.keys(out.roles), ['danger', 'info']);
  for (const p of PALS) assert.equal(TW11[paletteScale(p, 11).steps.findIndex((s) => contrast(hexToRgb(s.hex), W) >= 4.5)], '700', p);
});

test('F21 y F22: barrido de A7 (3.402 colores con croma y fuera de los extremos)', () => {
  const sw = SWEEP.filter((h) => chromatic(h) && !isExtreme(h));
  assert.equal(sw.length, 3402);
  const count = { danger: { warn: 0 }, warning: { warn: 0 }, success: { warn: 0 }, info: { warn: 0 } };
  for (const h of sw) {
    const p = proposeRoles(h);
    for (const r of ROLES) {
      if (p[r].changed) count[r][p[r].palette] = (count[r][p[r].palette] ?? 0) + 1;
      if (p[r].collision) count[r].warn++;
    }
  }
  assert.deepEqual(count.danger, { warn: 217 });
  assert.deepEqual(count.warning, { warn: 5, orange: 103, yellow: 61 });
  assert.deepEqual(count.success, { warn: 128, emerald: 255 });
  assert.deepEqual(count.info, { warn: 0 });
});

test('F21: una paleta elegida por el usuario se mantiene', () => {
  const p = proposeRoles('#33CC99', { warning: 'yellow' });
  assert.equal(p.warning.palette, 'yellow');
  assert.equal(p.warning.chosen, true);
  const out = build('#33CC99', { roles: { warning: 'yellow' } });
  assert.deepEqual(out.roles.warning.map((s) => s.hex), hexOf(paletteScale('yellow', 11)));
  assert.throws(() => build('#33CC99', { roles: { danger: 'blue' } }), /danger/);
});

// --- F24 ------------------------------------------------------------------------------------------

test('F24: tope de croma', () => {
  const ok = (h) => rgbToOklch(...hexToRgb(h));
  const check = (h, changed, maxDiff) => {
    const a = colorScale(h, 10);
    const b = colorScale(h, 10, { cap: true });
    assert.equal(b.steps.filter((s, i) => s.hex !== a.steps[i].hex).length, changed, h);
    for (let i = 0; i < 10; i++) {
      const ca = contrast(hexToRgb(a.steps[i].hex), W);
      const cb = contrast(hexToRgb(b.steps[i].hex), W);
      assert.ok(Math.abs(cb / ca - 1) < maxDiff, `${h} paso ${i}`);
    }
    return Math.max(...b.steps.map((s) => ok(s.hex)[1]));
  };
  assert.equal(Math.round(check('#0E4C4C', 7, 0.01) * 1000) / 1000, 0.06);
  check('#33CC99', 0, 1e-12);
  check('#F8C8DC', 7, 0.02);
  // Solo la escala del color: neutros y roles no cambian.
  const a = build('#0E4C4C', { roles: { danger: null } });
  const b = build('#0E4C4C', { cap: true, roles: { danger: null } });
  assert.deepEqual(b.neutral, a.neutral);
  assert.deepEqual(b.roles, a.roles);
});

// --- F26 ------------------------------------------------------------------------------------------

test('F26: regla de contraste por paso', () => {
  const scales = (N, cap) => [
    ...BRANDS.map((h) => colorScale(h, N, { cap })),
    ...PALS.map((p) => paletteScale(p, N)),
    ...BRANDS.map((h) => neutralScale(h, N)),
  ];
  for (const cap of [false, true]) {
    const all = scales(11, cap);
    assert.deepEqual(contrastRule(all, 4.5), { white: 7, black: 6 }, `AA, tope ${cap}`); // 700 y 600
    assert.deepEqual(contrastRule(all, 3), { white: 6, black: 7 }, `3, tope ${cap}`); // 600 y 700
  }
  // N = 12: un paso en el que cumplen unas escalas y otras no no cuenta.
  const s12 = scales(12, false);
  const r12 = contrastRule(s12, 4.5);
  const passAll = (k) => s12.every((s) => s.anchor === k || contrast(hexToRgb(s.steps[k].hex), W) >= 4.5);
  assert.ok(passAll(r12.white) && !passAll(r12.white - 1));
  // La marca se dice aparte, con su contraste truncado.
  const fb = build('#1877F2');
  assert.equal(fb.rule.brand.step, '600');
  assert.equal(truncate2(fb.rule.brand.white), 4.23);
  assert.deepEqual([fb.rule.aa, fb.rule.large], [{ white: '700', black: '600' }, { white: '600', black: '700' }]);
  assert.equal(truncate2(contrast(hexToRgb('#0078D7'), W)), 4.49);
});

// --- Nombres (decisiones 3 y 17) --------------------------------------------------------------------

test('nombres: Tailwind, SDS y Radix', () => {
  assert.deepEqual(stepNames(11, 'tailwind'), TW11);
  assert.deepEqual(stepNames(10, 'sds'), ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000']);
  assert.deepEqual(stepNames(5, 'radix'), ['1', '2', '3', '4', '5']);
  assert.deepEqual(stepNames(3, 'tailwind'), ['50', '500', '950']);
  assert.deepEqual(stepNames(8, 'tailwind'), ['50', '150', '300', '450', '550', '700', '850', '950']);
  for (const [conv, first, last] of [['tailwind', '50', '950'], ['sds', '100', '1000']]) {
    for (let N = 3; N <= MAX_STEPS[conv]; N++) {
      const n = stepNames(N, conv);
      assert.equal(new Set(n).size, N, `${conv} N ${N}`);
      assert.deepEqual([n[0], n.at(-1)], [first, last]);
    }
    assert.ok(new Set(stepNames(MAX_STEPS[conv] + 1, conv)).size < MAX_STEPS[conv] + 1, `${conv}: el máximo es el último sin repetidos`);
  }
  assert.deepEqual(MAX_STEPS, { tailwind: 16, sds: 19, radix: 30, custom: 30 });
  assert.equal(stepNames(30, 'radix').at(-1), '30');
});

test('nombres: N y nombres personalizados', () => {
  assert.equal(parseSteps('11', 'tailwind'), 11);
  assert.equal(parseSteps('17', 'tailwind'), null);
  assert.equal(parseSteps('19', 'sds'), 19);
  assert.equal(parseSteps('30', 'radix'), 30);
  assert.equal(parseSteps('2', 'radix'), null);
  assert.equal(parseSteps('5.5', 'custom'), null);
  assert.deepEqual(fillNames(4), ['1', '2', '3', '4']);
  assert.deepEqual(fillNames(3, 100), ['100', '200', '300']);
  assert.equal(checkCustomNames(['a', 'b-2', 'C_3'], 3), null);
  assert.deepEqual(checkCustomNames(['a', 'b'], 3), { code: 'count', have: 2, need: 3 });
  assert.deepEqual(checkCustomNames(['a', 'b c', 'd'], 3), { code: 'char', name: 'b c' });
  assert.deepEqual(checkCustomNames(['a', 'B', 'b'], 3), { code: 'duplicate', names: ['B', 'b'] });
  assert.deepEqual(build('#33CC99', { steps: 3, names: ['a', 'b', 'c'] }).color.map((s) => s.name), ['a', 'b', 'c']);
  assert.throws(() => build('#33CC99', { steps: 3, names: ['a', 'a', 'c'] }), /names/);
  assert.throws(() => build('#33CC99', { steps: 17 }), /steps/);
});

test('build: nombres en todas las escalas y paso de la marca', () => {
  const out = build('#1877F2', { steps: 10, names: 'sds', roles: { success: null } });
  for (const s of [out.color, out.neutral, out.roles.success]) assert.deepEqual(s.map((x) => x.name), stepNames(10, 'sds'));
  assert.equal(out.input.anchorStep, out.color.find((s) => s.anchor).name);
  assert.equal(out.color.find((s) => s.anchor).hex, '#1877F2');
});

// --- Entrada, nombre de paleta, curva propuesta y Figma --------------------------------------------

test('entrada: hex, RGB y HSL dan el mismo hex', () => {
  for (const input of ['#33CC99', '33cc99', '#3c9', 'rgb(51, 204, 153)', '51 204 153', 'hsl(160 60% 50%)', 'hsl(160, 60%, 50%)']) {
    assert.equal(parseColor(input), '#33CC99', input);
  }
  for (const input of ['', '#33CC9', 'rgb(300, 0, 0)', 'hsl(160 160% 50%)', 'verde']) assert.equal(parseColor(input), null, input);
});

test('tinte y nombre de paleta (F4, F5)', () => {
  assert.equal(parseTint('0,5'), 0.5);
  assert.equal(parseTint('1'), 1);
  assert.equal(parseTint('1.5'), null);
  assert.ok(isPaletteName('emerald'));
  assert.ok(isPaletteName('brand-blue'));
  assert.ok(!isPaletteName('Emerald'));
  assert.ok(!isPaletteName('neutral'));
  for (const r of ROLES) assert.ok(!isPaletteName(r), r);
});

test('curva y nombre propuestos por el tono (C25, C26)', () => {
  assert.deepEqual(Object.keys(TW_HUES), Object.keys(TW_CURVES));
  assert.deepEqual(suggest('#33CC99'), { curve: 'emerald', name: 'emerald' });
  assert.deepEqual(suggest('#1877F2'), { curve: 'blue', name: 'blue' });
  assert.deepEqual(suggest('#F40009'), { curve: 'red', name: 'red' });
  assert.deepEqual(suggest('#808080'), { curve: 'green', name: 'gray' });
  assert.equal(build('#33CC99').input.curve, 'emerald');
  assert.equal(build('#33CC99', { curve: 'red' }).input.curve, 'red');
});

test('archivo para Figma: todas las escalas con los nombres de la convención, ocultas y sin scopes', () => {
  const json = JSON.parse(toFigmaTokens(build('#33CC99', { steps: 5, roles: { danger: null } }), { name: 'emerald' }));
  assert.deepEqual(Object.keys(json.color), ['emerald', 'danger', 'neutral']);
  assert.deepEqual(Object.keys(json.color.emerald), stepNames(5, 'tailwind'));
  const token = Object.values(json.color.emerald).find((t) => t.$value.hex === '#33CC99');
  assert.deepEqual(token.$value.components, [0.2, 0.8, 0.6]);
  assert.deepEqual(token.$extensions, { 'com.figma.hiddenFromPublishing': true });
});
