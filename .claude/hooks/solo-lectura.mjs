// PreToolUse (Bash) de los revisores (.claude/agents/): solo deja pasar comandos que leen.
// Es estricto a propósito: un comando con redirecciones, sustituciones o varios comandos encadenados se bloquea,
// salvo tuberías hacia los filtros de FILTROS.
import { leerEntrada } from './comun.mjs';

const PERMITIDOS = [
  /^git (status|diff|log|show|blame|ls-files|rev-parse|merge-base)\b/,
  /^git branch --show-current$/,
  /^npm (audit|ls|outdated|view)\b/,
  /^npm (test|run lint)$/,
  /^(ls|cat|head|tail|wc|grep|rg|find|stat|file|pwd)\b/,
];
const FILTROS = /^(grep|head|tail|wc|sort|uniq)\b/;
const PELIGROSOS = /[;&<>`]|\$\(|\bfind\b.*\s-(exec|execdir|delete|ok|fprint)/;

const comando = ((await leerEntrada()).tool_input?.command ?? '').trim();
const partes = comando.split('|').map((p) => p.trim());
const valido =
  !PELIGROSOS.test(comando) &&
  PERMITIDOS.some((r) => r.test(partes[0])) &&
  partes.slice(1).every((p) => FILTROS.test(p));

if (!valido) {
  process.stderr.write(`Bloqueado: los revisores son de solo lectura y este comando no está en su lista: ${comando}\n`);
  process.exit(2);
}
