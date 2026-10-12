// Utilidades de los hooks de Claude Code (.claude/settings.json). Cada hook recibe un JSON por la entrada estándar.
import path from 'node:path';

export const RAIZ = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const WORKTREE = /^\.claude\/worktrees\/[^/]+\//;

export async function leerEntrada() {
  let texto = '';
  for await (const trozo of process.stdin) texto += trozo;
  return JSON.parse(texto || '{}');
}

// Dónde está el archivo editado: `rel`, su ruta relativa a la copia de trabajo, con `/`; `base`, la carpeta de esa
// copia (la raíz del repositorio o, dentro de un worktree de Claude Code, .claude/worktrees/<nombre>/).
// null si no hay archivo o está fuera del repositorio.
export function ubicar(entrada) {
  const absoluta = entrada.tool_input?.file_path ?? entrada.tool_input?.notebook_path;
  if (!absoluta) return null;
  const rel = path.relative(RAIZ, path.resolve(RAIZ, absoluta)).split(path.sep).join('/');
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const worktree = rel.match(WORKTREE)?.[0];
  return worktree ? { rel: rel.slice(worktree.length), base: path.join(RAIZ, worktree) } : { rel, base: RAIZ };
}

// Deja en el error estándar el final de una salida larga y sale con 2: Claude Code se lo enseña a Claude.
export function avisarYSalir(mensaje, salida = '') {
  const lineas = salida.trim().split('\n');
  const final = lineas.length > 60 ? ['…', ...lineas.slice(-60)] : lineas;
  process.stderr.write(`${mensaje}\n${final.join('\n')}\n`);
  process.exit(2);
}
