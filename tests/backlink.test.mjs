// Pruebas de "Back to colorgods" (src/backLink.ts, decisión 108): vuelve a la app con los ajustes guardados solo si se
// llegó desde la app; en cualquier otro caso, a "/". Node 24 importa el .ts sin compilar; location y sessionStorage
// se simulan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BACK_KEY, backHref } from '../src/backLink.ts';

const ORIGIN = 'https://colorgods.com';
const store = new Map();
globalThis.location = { origin: ORIGIN };
globalThis.sessionStorage = { getItem: (k) => store.get(k) ?? null };

test('desde la app, vuelve con la consulta guardada', () => {
  store.set(BACK_KEY, '?color=0E4C4C&steps=12');
  assert.equal(backHref(`${ORIGIN}/`), '/?color=0E4C4C&steps=12');
});

test('sin referente, de otro origen o de otra ruta, lleva a "/"', () => {
  store.set(BACK_KEY, '?steps=12');
  assert.equal(backHref(''), '/');
  assert.equal(backHref('https://example.com/'), '/');
  assert.equal(backHref(`${ORIGIN}/how-it-works`), '/');
});

test('sin valor guardado, o uno que no empieza por "?", lleva a "/"', () => {
  store.delete(BACK_KEY);
  assert.equal(backHref(`${ORIGIN}/`), '/');
  store.set(BACK_KEY, '//example.com');
  assert.equal(backHref(`${ORIGIN}/`), '/');
});

test('sin almacenamiento (lanza un error), lleva a "/"', () => {
  const saved = globalThis.sessionStorage;
  globalThis.sessionStorage = {
    getItem() {
      throw new Error('SecurityError');
    },
  };
  try {
    assert.equal(backHref(`${ORIGIN}/`), '/');
  } finally {
    globalThis.sessionStorage = saved;
  }
});

test('la app guarda con la misma clave (repetida en SiteChrome.tsx para no compartir un trozo)', () => {
  const chrome = readFileSync(new URL('../src/components/SiteChrome.tsx', import.meta.url), 'utf8');
  assert.ok(chrome.includes(`sessionStorage.setItem('${BACK_KEY}'`));
});
