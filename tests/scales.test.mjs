// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tests/scales.test.mjs.
// Copiado sin cambios en colorgods (decisión A2 o paso C2). Lo que sigue es el archivo original.

// tools/scales.mjs (la herramienta "Generar escalas") da lo mismo que tools/scales.py (T22, decisión 13).
// Casos: tests/fixtures/scales-cases.json, generado con tests/fixtures/scales-cases.py.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build, parseColor, parseTint, isPaletteName, toFigmaTokens, stateFromSearch, searchFromState, DEFAULTS, suggest, TW_HUES, TW_CURVES } from '../tools/scales.mjs';

const cases = JSON.parse(fs.readFileSync(new URL('./fixtures/scales-cases.json', import.meta.url), 'utf8'));

test('mismos hex, ancla y avisos que scales.py', () => {
  assert.ok(cases.length > 400);
  for (const c of cases) {
    const out = build(c.hex, c.tint, c.reference);
    const label = `${c.hex} ${c.reference} tinte ${c.tint}`;
    assert.deepEqual(out.accent.map((r) => r.hex), c.accent, `${label}: acento`);
    assert.deepEqual(out.neutral.map((r) => r.hex), c.neutral, `${label}: neutros`);
    assert.equal(out.input.anchorStep, c.anchor, `${label}: ancla`);
    assert.deepEqual(out.warnings, c.warnings, `${label}: avisos`);
  }
});

test('DesignToken101: emerald y neutral de la lección color-scales', () => {
  const out = build('#33CC99', 0.5, 'green');
  assert.deepEqual(out.accent.map((r) => r.hex), ['#F2FCF7', '#E1F9EE', '#C4F3DD', '#93EAC5', '#4FD7A6', '#33CC99', '#0EA075', '#1A7D5C', '#1F624A', '#1F503E', '#0D2C20']);
  assert.equal(out.neutral.at(-1).hex, '#050C09');
  assert.deepEqual(out.warnings, []);
});

test('entrada: hex, RGB y HSL dan el mismo hex', () => {
  for (const input of ['#33CC99', '33cc99', '#3c9', 'rgb(51, 204, 153)', '51 204 153', 'hsl(160 60% 50%)', 'hsl(160, 60%, 50%)']) {
    assert.equal(parseColor(input), '#33CC99', input);
  }
  for (const input of ['', '#33CC9', 'rgb(300, 0, 0)', 'hsl(160 160% 50%)', 'verde']) assert.equal(parseColor(input), null, input);
});

test('tinte y nombre', () => {
  assert.equal(parseTint('0,5'), 0.5);
  assert.equal(parseTint('1'), 1);
  assert.equal(parseTint('1.5'), null);
  assert.ok(isPaletteName('emerald'));
  assert.ok(isPaletteName('brand-blue'));
  assert.ok(!isPaletteName('Emerald'));
  assert.ok(!isPaletteName('neutral'));
});

test('archivo para Figma: solo los pasos elegidos, ocultos y sin scopes', () => {
  const json = JSON.parse(toFigmaTokens(build('#33CC99'), { name: 'emerald', accentSteps: [500, 700], neutralSteps: [950] }));
  assert.deepEqual(Object.keys(json.color.emerald), ['500', '700']);
  assert.deepEqual(Object.keys(json.color.neutral), ['950']);
  const token = json.color.emerald['500'];
  assert.equal(token.$value.hex, '#33CC99');
  assert.deepEqual(token.$value.components, [0.2, 0.8, 0.6]);
  assert.deepEqual(token.$extensions, { 'com.figma.hiddenFromPublishing': true });
});

test('ajustes en la URL', () => {
  const state = { color: '#FF6B00', name: 'brand', tint: 0.25, curve: 'orange' };
  assert.deepEqual(stateFromSearch(searchFromState(state)), state);
  assert.deepEqual(stateFromSearch('?color=zzz&name=Neutral&tint=9&curve=nada'), DEFAULTS);
});

test('curva y nombre propuestos por el tono (C25, C26)', () => {
  assert.deepEqual(Object.keys(TW_HUES), Object.keys(TW_CURVES));
  assert.deepEqual(suggest('#33CC99'), { curve: 'emerald', name: 'emerald' });
  assert.deepEqual(suggest('#1877F2'), { curve: 'blue', name: 'blue' });
  assert.deepEqual(suggest('#F40009'), { curve: 'red', name: 'red' });
  assert.deepEqual(suggest('#808080'), { curve: 'green', name: 'gray' });
  assert.equal(build('#33CC99', 0.5, null).input.reference, 'emerald');
  assert.equal(searchFromState({ color: '#33CC99', name: null, tint: 0.5, curve: null }), '?color=33CC99&tint=0.5');
  assert.deepEqual(stateFromSearch('?color=33CC99&tint=0.5'), { color: '#33CC99', name: null, tint: 0.5, curve: null });
});
