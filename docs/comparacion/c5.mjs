// C5: exportaciones probadas. Genera los archivos de prueba con el motor y comprueba que cada variable lleva el hex
// de la tabla. Uso: node docs/comparacion/c5.mjs [carpeta]. Con TAILWIND=ruta al CLI de Tailwind CSS 4 (el binario
// de github.com/tailwindlabs/tailwindcss/releases, la versión de package-lock.json), compila además @theme.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { build, toCss, toTheme, toFigmaTokens } from '../../tools/scales.mjs';

const out = process.argv[2] ?? 'c5-salida';
const cases = {
  // a: SDS con roles y un nombre que no es de Tailwind (bg-marca-350).
  a: { hex: '#1877F2', name: 'marca', opts: { steps: 11, names: 'sds', roles: { danger: null, warning: null } },
    classes: ['bg-marca-350', 'text-marca-1000', 'bg-danger-650', 'bg-warning-100', 'bg-neutral-750', 'bg-red-500'] },
  // b: N = 5 con nombres de Tailwind: bg-neutral-100 y bg-blue-600 tienen que desaparecer.
  b: { hex: '#1877F2', name: 'blue', opts: { steps: 5, names: 'tailwind' },
    classes: ['bg-blue-250', 'bg-blue-600', 'bg-neutral-250', 'bg-neutral-100', 'bg-neutral-50', 'bg-red-500'] },
};

for (const [k, c] of Object.entries(cases)) {
  const dir = join(out, k);
  mkdirSync(dir, { recursive: true });
  const s = build(c.hex, c.opts);
  const theme = toTheme(s, { name: c.name });
  const css = toCss(s, { name: c.name });
  const tok = JSON.parse(toFigmaTokens(s, { name: c.name }));
  writeFileSync(join(dir, 'theme.css'), theme);
  writeFileSync(join(dir, 'colors.css'), css);
  const scales = { [c.name]: s.color, neutral: s.neutral, ...s.roles };
  let n = 0;
  const bad = [];
  for (const [p, steps] of Object.entries(scales))
    for (const st of steps) {
      n++;
      const v = `--color-${p}-${st.name}: ${st.hex};`;
      if (!css.includes(v)) bad.push('css ' + v);
      if (!theme.includes(v)) bad.push('theme ' + v);
      if (tok.color?.[p]?.[st.name]?.$value?.hex !== st.hex) bad.push(`dtcg ${p}/${st.name}`);
    }
  console.log(`${k}: ${n} variables, ${bad.length} distintas del motor`, bad.slice(0, 3));
  if (!process.env.TAILWIND) continue;
  writeFileSync(join(dir, 'index.html'), `<div class="${c.classes.join(' ')}"></div>\n`);
  writeFileSync(join(dir, 'input.css'), '@import "tailwindcss";\n@import "./theme.css";\n@source "./index.html";\n');
  execFileSync(process.env.TAILWIND, ['-i', 'input.css', '-o', 'out.css'], { cwd: dir, stdio: 'ignore' });
  const compiled = readFileSync(join(dir, 'out.css'), 'utf8');
  for (const cls of c.classes) {
    const m = compiled.match(new RegExp(`\\.${cls} \\{\\s*[\\w-]+: var\\(([\\w-]+)\\)`));
    const val = m && compiled.match(new RegExp(`${m[1]}:\\s*([^;]+);`));
    console.log(`  ${cls}: ${m ? `existe, ${m[1]} = ${val?.[1] ?? '(de Tailwind)'}` : 'no existe'}`);
  }
}
