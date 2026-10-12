// PostToolUse (Edit, Write), en este orden para que las pruebas lean el archivo ya formateado:
// 1. Prettier y ESLint sobre el archivo editado (decisión 50). Prettier respeta .prettierignore y ESLint sus ignores.
// 2. Si el archivo está en tools/ o tests/, npm test.
// Si ESLint o las pruebas fallan, sale con 2 y Claude recibe el error para corregirlo.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { RAIZ, avisarYSalir, leerEntrada, rutaRelativa } from './comun.mjs';

const entrada = await leerEntrada();
const rel = rutaRelativa(entrada);
if (!rel) process.exit(0);
const archivo = entrada.tool_input.file_path;
const ejecutar = (orden, args) => spawnSync(orden, args, { cwd: RAIZ, encoding: 'utf8' });
const bin = (nombre) => path.join(RAIZ, 'node_modules', '.bin', nombre);

const prettier = ejecutar(bin('prettier'), ['--write', '--ignore-unknown', '--log-level', 'warn', archivo]);
if (prettier.error) avisarYSalir('No se pudo ejecutar Prettier (¿falta npm install?).', String(prettier.error));
if (prettier.status !== 0) avisarYSalir(`Prettier no pudo formatear ${rel}:`, prettier.stderr + prettier.stdout);

if (/\.(m|c)?(j|t)sx?$/.test(archivo)) {
  const eslint = ejecutar(bin('eslint'), ['--no-warn-ignored', archivo]);
  if (eslint.error) avisarYSalir('No se pudo ejecutar ESLint (¿falta npm install?).', String(eslint.error));
  if (eslint.status !== 0)
    avisarYSalir(`ESLint encuentra problemas en ${rel}; corrígelos:`, eslint.stdout + eslint.stderr);
}

if (/^(tools|tests)\//.test(rel)) {
  const prueba = ejecutar('npm', ['test']);
  const salida = prueba.stdout + prueba.stderr;
  if (prueba.status !== 0) avisarYSalir(`npm test falla después de editar ${rel}:`, salida);
  const cifra = (nombre) => salida.match(new RegExp(`^ℹ ${nombre} (\\d+)`, 'm'))?.[1] ?? '?';
  const contexto = `npm test después de editar ${rel}: pasan ${cifra('pass')} de ${cifra('tests')} pruebas.`;
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: contexto } }),
  );
}
