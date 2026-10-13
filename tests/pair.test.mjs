// Pruebas del par de contraste (src/components/pairData.ts, paso C4 parte 3): F11 y docs/ux.md §6.4. Node 24 importa
// el .ts quitando los tipos, sin compilar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../tools/scales.mjs';
import { measure } from '../src/components/pairData.ts';

const scales = (hex, options) => {
  const r = build(hex, options);
  return [
    { id: 'color', name: 'blue', steps: r.color },
    { id: 'neutral', name: 'neutral', steps: r.neutral },
  ];
};
const none = { text: null, bg: null };

test('por defecto, la marca sobre blanco: #1877F2 con 11 pasos da 4.23:1 y 2 de 5 niveles, como en Figma', () => {
  const m = measure(none, scales('#1877F2', { steps: 11 }));
  assert.equal(m.text.label, 'blue 600 (your color)');
  assert.equal(m.bg.value, 'white');
  assert.equal(m.caption, 'Blue 600 on white. Passes 2 of 5 levels.');
  assert.deepEqual(m.passes, [false, false, true, false, true]);
  assert.equal(m.spoken, '4.23:1. Blue 600 on white. Passes 2 of 5 levels: Large text AA 3, UI components 3.');
});

test('#0078D7 sobre blanco: 4,4989 se lee 4.49 y no cumple AA (decisión 12)', () => {
  const s = [{ id: 'color', name: 'x', steps: [{ name: '1', hex: '#0078D7', anchor: true }] }];
  const m = measure(none, s);
  assert.match(m.spoken, /^4\.49:1\./);
  assert.equal(m.passes[0], false);
  assert.equal(m.passes[2], true);
});

test('el par sigue en la posición k al cambiar N o la convención; con menos pasos, en el último', () => {
  const pick = { text: 'color:6', bg: 'neutral:9' };
  assert.equal(measure(pick, scales('#1877F2', { steps: 12 })).text.value, 'color:6');
  const radix = measure(pick, scales('#1877F2', { steps: 11, names: 'radix' }));
  assert.equal(radix.text.name, 'blue 7');
  assert.equal(radix.bg.name, 'neutral 10');
  const five = measure(pick, scales('#1877F2', { steps: 5 }));
  assert.equal(five.text.value, 'color:4');
  assert.equal(five.bg.value, 'neutral:4');
});
