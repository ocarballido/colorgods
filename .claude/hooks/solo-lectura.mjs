// PreToolUse (Bash) de los revisores (.claude/agents/): solo deja pasar comandos que leen.
// Es estricto a propósito: se bloquea todo comando con varias líneas, redirecciones, sustituciones o varios comandos
// encadenados, salvo tuberías hacia los filtros de FILTROS. Lo que va entre comillas simples se lee como texto (para
// que un patrón de grep con | o < no bloquee la búsqueda); entre comillas dobles, solo si no lleva $ ni `.
import { leerEntrada } from './comun.mjs';

const PERMITIDOS = [
  /^git (status|diff|log|show|blame|ls-files|rev-parse|merge-base)\b/,
  /^git branch --show-current$/,
  /^npm audit( --?[a-z-]+(=\S+)?)*$/,
  /^npm (ls|outdated)( [@\w./=-]+)*$/,
  /^npm view [@\w./-]+( [\w.-]+)?$/,
  /^npm (test|run lint)$/,
  /^(ls|cat|head|tail|wc|grep|rg|find|stat|file|pwd)\b/,
];
const FILTROS = [/^(grep|head|tail|wc)\b/, /^(sort|uniq)( -[a-z]+)*$/];
// Opciones que escriben archivos o ejecutan órdenes dentro de comandos de lectura (git --output, rg --pre,
// find -exec, -delete, -fprint o -fls).
const PELIGROSOS = [
  /[\r\n;&<>`]|\$\(/,
  /--output\b|--pre\b/,
  /\bfind\b.*\s-(exec|execdir|delete|ok|okdir|fprint|fprint0|fprintf|fls)\b/,
];
const SECRETOS = /\.env\b|\.pem\b|\.key\b|\.npmrc\b|\.ssh\b|\.aws\b/;

const comando = ((await leerEntrada()).tool_input?.command ?? '').trim();
const dobles = comando.match(/"[^"]*"/g) ?? [];
const sinComillas = comando.replace(/'[^']*'|"[^"]*"/g, 'Q');
const partes = sinComillas.split('|').map((p) => p.trim());
const valido =
  !SECRETOS.test(comando) &&
  !dobles.some((d) => /[$`]/.test(d)) &&
  !/['"]/.test(sinComillas) &&
  !PELIGROSOS.some((r) => r.test(sinComillas)) &&
  PERMITIDOS.some((r) => r.test(partes[0])) &&
  partes.slice(1).every((p) => FILTROS.some((r) => r.test(p)));

if (!valido) {
  process.stderr.write(`Bloqueado: los revisores son de solo lectura y este comando no está en su lista: ${comando}\n`);
  process.exit(2);
}
