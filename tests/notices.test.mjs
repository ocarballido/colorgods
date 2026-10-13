// Pruebas de la lista de avisos y notas (src/components/noticeData.ts, paso C4 parte 3): F12.1 a F12.4 con los
// colores de prueba de docs/ux.md §6.2, textos de docs/funcionalidades.md §3 y nota de recorte por escala de Figma
// (decisión 62). Node 24 importa el .ts quitando los tipos, sin compilar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, suggest } from '../tools/scales.mjs';
import { notices, count } from '../src/components/noticeData.ts';

const run = (hex, steps = 11) => {
  const r = build(hex, { steps });
  const scales = [
    { id: 'color', name: suggest(hex).name, steps: r.color },
    { id: 'neutral', name: 'neutral', steps: r.neutral },
  ];
  return { r, list: notices(r, scales) };
};

test('#808080: solo el aviso sin croma (F12.1), sin enlace a la tabla', () => {
  const { list } = run('#808080');
  assert.equal(list.length, 1);
  assert.equal(list[0].warning, true);
  assert.equal(list[0].row, undefined);
  assert.match(list[0].text, /: Your color has no chroma, so it has no hue: the scale comes out gray/);
});

test('#1A2B5C: aviso de extremo con cualquier N, el primero, "very dark" y en la fila de la marca (F12.2)', () => {
  for (let n = 3; n <= 16; n++) {
    const { r, list } = run('#1A2B5C', n);
    assert.equal(list[0].key, 'extreme:color', `N = ${n}`);
    assert.match(list[0].text, /Your color is very dark: .* Turn on the chroma cap or try another curve\.$/);
    assert.equal(
      list[0].row,
      r.color.findIndex((s) => s.anchor),
    );
    assert.equal(list[0].at, `${suggest('#1A2B5C').name} ${r.input.anchorStep}`);
  }
});

test('#0000FF con 11 pasos: nota de recorte en 9 pasos que lleva al primero (F12.3)', () => {
  const { r, list } = run('#0000FF');
  assert.equal(list.length, 1);
  assert.equal(list[0].warning, false);
  assert.match(list[0].text, /: in 9 steps the color doesn’t fit in sRGB, so its chroma is reduced \(Clip column\)\.$/);
  assert.equal(list[0].row, 0);
  assert.equal(Math.max(...r.color.map((s) => s.clip)), 47);
});

test('#F5F5DC con 11 pasos: nota de pasos muy juntos (F12.4), después del aviso de extremo', () => {
  const { list } = run('#F5F5DC');
  assert.deepEqual(
    list.map((n) => n.key),
    ['extreme:color', 'close:color'],
  );
  assert.match(list[0].text, /very light/);
  assert.match(list[1].text, /: steps 50 and 100 are very close in lightness, closer than any two steps/);
  assert.equal(list[1].row, 0);
});

test('#1877F2 con 11 pasos: la nota de recorte nombra 50, 700 y 800, como en Figma', () => {
  const { list } = run('#1877F2');
  assert.equal(
    list[0].text,
    'blue: in steps 50, 700 and 800 the color doesn’t fit in sRGB, so its chroma is reduced (Clip column).',
  );
  assert.equal(count(list), '1 note');
});
