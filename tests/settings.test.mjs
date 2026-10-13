// Pruebas del estado de los ajustes (src/settings.ts, paso C4 parte 1): últimos valores válidos (U2, decisión 26),
// N y convención validados juntos (F2), nombres personalizados (F6.1) y "Suggested" en la curva (U6).
// Referencias: docs/ux.md §4 y §10 (comprobaciones 2 a 5), docs/funcionalidades.md (F1, F2, F5, F6.1) y decisión 65.
// Node 24 importa el .ts quitando los tipos, sin compilar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, suggest } from '../tools/scales.mjs';
import {
  initialSettings,
  reducer,
  colorError,
  nameError,
  stepsError,
  namesError,
  multipleError,
  roleOptions,
} from '../src/settings.ts';

const run = (actions, from = initialSettings) => actions.reduce(reducer, from);
const calc = (s) =>
  build(s.color, { steps: s.valid.steps, names: s.valid.names, curve: s.curve, cap: s.cap, tint: s.tint });

test('color: el resultado sigue al último válido, también a los intermedios (U2, ux.md §10.1 y §10.2)', () => {
  let s = run([{ type: 'color', text: '#33C' }]);
  assert.equal(s.color, '#3333CC');
  s = run([{ type: 'color', text: '#33CC99' }], s);
  assert.equal(s.color, '#33CC99');
  s = run([{ type: 'color', text: '#33CC9' }], s);
  assert.equal(s.color, '#33CC99');
  assert.equal(colorError(s), 'Use hex, RGB or HSL, like #1877F2.');
  // El error se ve al salir del campo y deja de verse al volver a ser válido.
  assert.equal(s.touched.color, false);
  s = run([{ type: 'blur', field: 'color' }], s);
  assert.equal(s.touched.color, true);
  s = run([{ type: 'color', text: 'rgb(14, 76, 76)' }], s);
  assert.equal(s.color, '#0E4C4C');
  assert.equal(s.touched.color, false);
});

test('nombre: error de F5 sin bloquear el cálculo', () => {
  const blue = suggest('#1877F2').name;
  assert.equal(nameError(initialSettings, blue), null);
  for (const bad of ['Blue', 'neutral', 'danger', 'info', '1abc', '']) {
    const s = run([{ type: 'name', text: bad }]);
    assert.match(nameError(s, blue), /^Use lowercase letters/);
    assert.equal(s.color, initialSettings.color);
    assert.equal(s.valid, initialSettings.valid);
  }
});

test('pasos: fuera de rango o no entero, error y el resultado sigue con el último N (F2)', () => {
  for (const bad of ['2', '17', '11.5', 'x']) {
    const s = run([{ type: 'steps', text: bad }]);
    assert.equal(stepsError(s), 'Use a whole number from 3 to 16 with Tailwind names.');
    assert.equal(s.valid.steps, 11);
  }
});

test('Radix con 25 pasos y cambio a Tailwind: error con el máximo 16 y el resultado sigue en 25 Radix (ux.md §10.3)', () => {
  let s = run([
    { type: 'convention', convention: 'radix' },
    { type: 'steps', text: '25' },
  ]);
  assert.deepEqual(s.valid, { steps: 25, convention: 'radix', names: 'radix', pending: false });
  s = run([{ type: 'convention', convention: 'tailwind' }], s);
  assert.equal(s.stepsText, '25');
  assert.equal(stepsError(s), 'Use a whole number from 3 to 16 with Tailwind names.');
  // El error se ve ya, aunque no se haya salido del campo de pasos.
  assert.equal(s.touched.steps, true);
  assert.deepEqual(s.valid, { steps: 25, convention: 'radix', names: 'radix', pending: false });
  assert.equal(calc(s).names.length, 25);
  assert.equal(calc(s).names[24], '25');
});

test('Custom con 11 nombres y 12 pasos: error de nombres y el resultado sigue a N con nombres pendientes (ux.md §10.4)', () => {
  let s = run([{ type: 'convention', convention: 'custom' }]);
  assert.equal(s.customText, '50 100 200 300 400 500 600 700 800 900 950');
  assert.equal(s.valid.pending, false);
  s = run([{ type: 'steps', text: '12' }], s);
  assert.equal(namesError(s), '11 names, 12 needed. Add 1 name.');
  assert.equal(s.touched.names, true);
  assert.equal(s.valid.steps, 12);
  assert.equal(s.valid.pending, true);
  assert.deepEqual(calc(s).names, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
});

test('nombres personalizados: sobra, carácter y repetidos sin distinguir mayúsculas (F6.1)', () => {
  const custom = run([{ type: 'convention', convention: 'custom' }]);
  const error = (text) => namesError(run([{ type: 'custom', text }], custom));
  assert.equal(error('a b c d e f g h i j k l'), '12 names, 11 needed. Remove 1 name.');
  assert.equal(
    error('a b c d e f g h i j k.'),
    '“k.” has a character that isn’t allowed. Use letters, numbers, - and _.',
  );
  assert.equal(
    error('a b c d e f g h i j A'),
    '“a” and “A” are the same name. Each name must be different, whatever the case.',
  );
  const ok = run([{ type: 'custom', text: 'a,b\nc d-1 e_2 f g h i j k' }], custom);
  assert.equal(namesError(ok), null);
  assert.deepEqual(ok.valid.names, ['a', 'b', 'c', 'd-1', 'e_2', 'f', 'g', 'h', 'i', 'j', 'k']);
});

test('rellenar: 1 a N y múltiplos de m; con m no válido no rellena y se ve el error (F6.1)', () => {
  let s = run([
    { type: 'convention', convention: 'custom' },
    { type: 'steps', text: '5' },
    { type: 'fill', multiple: false },
  ]);
  assert.equal(s.customText, '1 2 3 4 5');
  s = run([{ type: 'fill', multiple: true }], s);
  assert.equal(s.customText, '100 200 300 400 500');
  s = run(
    [
      { type: 'multiple', text: '0' },
      { type: 'fill', multiple: true },
    ],
    s,
  );
  assert.equal(s.customText, '100 200 300 400 500');
  assert.equal(multipleError(s), 'Use a whole number from 1 up.');
  assert.equal(s.touched.multiple, true);
});

test('botones de pasos: no pasan del rango de la convención (F2, decisión 59)', () => {
  assert.equal(
    run([
      { type: 'steps', text: '3' },
      { type: 'stepBy', delta: -1 },
    ]).stepsText,
    '3',
  );
  assert.equal(
    run([
      { type: 'steps', text: '16' },
      { type: 'stepBy', delta: 1 },
    ]).stepsText,
    '16',
  );
  const over = run([
    { type: 'convention', convention: 'radix' },
    { type: 'steps', text: '25' },
    { type: 'convention', convention: 'tailwind' },
  ]);
  assert.equal(run([{ type: 'stepBy', delta: 1 }], over).stepsText, '25');
  const down = run([{ type: 'stepBy', delta: -1 }], over);
  assert.equal(down.stepsText, '16');
  assert.deepEqual(down.valid, { steps: 16, convention: 'tailwind', names: 'tailwind', pending: false });
});

test('"Suggested" en la curva: elegir green la fija; volver a Suggested sigue al color (U6, ux.md §10.5)', () => {
  let s = run([
    { type: 'curve', curve: 'green' },
    { type: 'color', text: '#FF0000' },
  ]);
  assert.equal(calc(s).input.curve, 'green');
  s = run([{ type: 'curve', curve: null }], s);
  assert.equal(calc(s).input.curve, suggest('#FF0000').curve);
  assert.equal(calc(s).input.curve, 'red');
});

test('el par N y convención no cambia de objeto si no cambia (no se recalcula ni se anuncia)', () => {
  const custom = run([{ type: 'convention', convention: 'custom' }]);
  const same = run([{ type: 'custom', text: `${custom.customText} ` }], custom);
  assert.equal(same.valid, custom.valid);
  assert.equal(run([{ type: 'steps', text: ' 11' }]).valid, initialSettings.valid);
});

test('roles: activar, elegir paleta y color propio con su último valor válido (F20, F21, F23)', () => {
  let s = run([{ type: 'role', role: 'danger', on: true }]);
  assert.deepEqual(roleOptions(s.roles), { danger: null });
  s = run(
    [
      { type: 'roleChoice', role: 'warning', choice: 'orange', fill: '#000000' },
      { type: 'role', role: 'warning', on: true },
    ],
    s,
  );
  assert.deepEqual(roleOptions(s.roles), { danger: null, warning: 'orange' });
  // Al pasar a "Custom color", el campo se rellena con el color de la muestra; después sigue al último válido.
  s = run([{ type: 'roleChoice', role: 'danger', choice: 'custom', fill: '#F71D2F' }], s);
  assert.deepEqual(roleOptions(s.roles).danger, { color: '#F71D2F' });
  s = run(
    [
      { type: 'roleColor', role: 'danger', text: '#FF4D8' },
      { type: 'roleBlur', role: 'danger' },
    ],
    s,
  );
  assert.equal(colorError(s.roles.danger), 'Use hex, RGB or HSL, like #1877F2.');
  assert.deepEqual(roleOptions(s.roles).danger, { color: '#F71D2F' });
  s = run([{ type: 'roleColor', role: 'danger', text: 'rgb(255, 77, 128)' }], s);
  assert.deepEqual(roleOptions(s.roles).danger, { color: '#FF4D80' });
  assert.equal(s.roles.danger.touched, false);
  // Volver a una paleta conserva lo escrito para la próxima vez; desactivar quita el rol del cálculo.
  s = run(
    [
      { type: 'roleChoice', role: 'danger', choice: '', fill: '#000000' },
      { type: 'role', role: 'warning', on: false },
    ],
    s,
  );
  assert.deepEqual(roleOptions(s.roles), { danger: null });
  assert.equal(s.roles.danger.colorText, 'rgb(255, 77, 128)');
  assert.deepEqual(Object.keys(build(s.color, { roles: roleOptions(s.roles) }).roles), ['danger']);
});
