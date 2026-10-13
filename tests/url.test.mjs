// Pruebas de los ajustes en la URL (src/url.ts, paso C4 parte 5): F18 de docs/funcionalidades.md. Cada valor se
// valida antes de llegar al motor: uno no válido se ignora y se usa el de por defecto, y build() no puede fallar con
// lo que llegue en la URL (nota de seguridad de la parte 4 en docs/plan.md). Node 24 importa el .ts sin compilar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../tools/scales.mjs';
import { initialSettings, reducer, roleOptions } from '../src/settings.ts';
import { searchFromSettings, settingsFromSearch } from '../src/url.ts';

const run = (actions, from = initialSettings) => actions.reduce(reducer, from);
const calc = (s) =>
  build(s.color, {
    steps: s.valid.steps,
    names: s.valid.names,
    curve: s.curve,
    cap: s.cap,
    tint: s.tint,
    roles: roleOptions(s.roles),
  });

test('sin parámetros: los valores por defecto', () => {
  assert.deepEqual(settingsFromSearch(''), initialSettings);
});

test('ida y vuelta: el enlace da el mismo resultado, con roles, nombres personalizados, nombre, curva y tope', () => {
  const s = run([
    { type: 'color', text: '#0E4C4C' },
    { type: 'steps', text: '10' },
    { type: 'convention', convention: 'custom' },
    { type: 'custom', text: 'a b c d e f g h i Last_1' },
    { type: 'name', text: 'marca' },
    { type: 'curve', curve: 'green' },
    { type: 'cap', cap: true },
    { type: 'tint', tint: 0.35 },
    { type: 'role', role: 'danger', on: true },
    { type: 'role', role: 'warning', on: true },
    { type: 'roleChoice', role: 'warning', choice: 'yellow', fill: '#000000' },
    { type: 'role', role: 'info', on: true },
    { type: 'roleChoice', role: 'info', choice: 'custom', fill: '#0EA5E9' },
  ]);
  const search = searchFromSettings(s);
  assert.match(search, /(^|&)cap=1(&|$)/);
  const t = settingsFromSearch(search);
  assert.deepEqual(calc(t), calc(s));
  assert.equal(t.name, 'marca');
  assert.equal(t.curve, 'green');
  assert.deepEqual(t.valid, s.valid);
  assert.deepEqual(roleOptions(t.roles), roleOptions(s.roles));
  // Lo leído se ve en los campos.
  assert.equal(t.colorText, '#0E4C4C');
  assert.equal(t.stepsText, '10');
  assert.equal(t.customText, 'a b c d e f g h i Last_1');
  assert.equal(t.roles.info.colorText, '#0EA5E9');
});

test('se escribe lo calculado, no lo escrito: con un color no válido en el campo, el último válido', () => {
  const s = run([
    { type: 'color', text: '#33CC99' },
    { type: 'color', text: '#33CC9' },
  ]);
  assert.equal(settingsFromSearch(searchFromSettings(s)).color, '#33CC99');
});

test('valores no válidos: se ignoran y se usa el de por defecto (F18)', () => {
  const s = settingsFromSearch(
    'color=nope&steps=abc&names=bogus&curve=mauve&tint=2&cap=yes&name=Neutral&danger=purple&warning=suggested&foo=1',
  );
  assert.equal(s.color, '#1877F2');
  assert.equal(s.valid.steps, 11);
  assert.equal(s.valid.convention, 'tailwind');
  assert.equal(s.curve, null);
  assert.equal(s.tint, 0.5);
  assert.equal(s.cap, false);
  assert.equal(s.name, null);
  assert.equal(s.nameText, null);
  // Una paleta que no es del margen del rol vuelve a la propuesta.
  assert.deepEqual(roleOptions(s.roles), { danger: null, warning: null });
  assert.doesNotThrow(() => calc(s));
});

test('un N mayor que el máximo de la convención de la URL vuelve a 11', () => {
  const s = settingsFromSearch('steps=25&names=tailwind');
  assert.equal(s.valid.steps, 11);
  assert.equal(s.stepsText, '11');
  assert.equal(settingsFromSearch('steps=25&names=radix').valid.steps, 25);
});

test('nombres personalizados no válidos vuelven a Tailwind', () => {
  for (const custom of ['a,b,c', 'a,b,c,d,a', 'a,b,c,d,e%21', ''])
    assert.equal(settingsFromSearch(`steps=5&names=custom&custom=${custom}`).valid.convention, 'tailwind', custom);
  const ok = settingsFromSearch('steps=5&names=custom&custom=a,b,c,d,e');
  assert.deepEqual(ok.valid.names, ['a', 'b', 'c', 'd', 'e']);
  // Con 20 pasos, que no caben en Tailwind, vuelve también a 11.
  const big = settingsFromSearch('steps=20&names=custom&custom=x');
  assert.equal(big.valid.convention, 'tailwind');
  assert.equal(big.valid.steps, 11);
});

test('un color de rol no válido vuelve a la propuesta y la página no se queda en blanco (build no falla)', () => {
  for (const bad of ['zzzzzz', '12345', 'rgb(300,0,0)', '%23GG0000', 'javascript:alert(1)', '']) {
    const s = settingsFromSearch(`danger=${bad}`);
    assert.equal(s.roles.danger.on, true, bad);
    assert.equal(s.roles.danger.choice, '', bad);
    assert.doesNotThrow(() => calc(s), bad);
  }
  const ok = settingsFromSearch('danger=FF4D80');
  assert.deepEqual(roleOptions(ok.roles), { danger: { color: '#FF4D80' } });
});

test('el tinte de la URL tiene que caer en un paso del deslizador (0,05)', () => {
  assert.equal(settingsFromSearch('tint=0.35').tint, 0.35);
  assert.equal(settingsFromSearch('tint=0').tint, 0);
  assert.equal(settingsFromSearch('tint=0.33').tint, 0.5);
});
