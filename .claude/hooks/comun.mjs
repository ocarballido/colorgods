// Utilidades de los hooks de Claude Code (.claude/settings.json). Cada hook recibe un JSON por la entrada estándar.
import path from 'node:path';

export const RAIZ = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export async function leerEntrada() {
  let texto = '';
  for await (const trozo of process.stdin) texto += trozo;
  return JSON.parse(texto || '{}');
}

// Ruta del archivo editado relativa a la raíz del repositorio, con `/`. Dentro de un worktree de Claude Code
// (.claude/worktrees/<nombre>/), relativa a ese worktree. null si el archivo está fuera del repositorio.
export function rutaRelativa(entrada) {
  const absoluta = entrada.tool_input?.file_path ?? entrada.tool_input?.notebook_path;
  if (!absoluta) return null;
  const rel = path.relative(RAIZ, path.resolve(RAIZ, absoluta)).split(path.sep).join('/');
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.replace(/^\.claude\/worktrees\/[^/]+\//, '');
}

// Deja en el error estándar el final de una salida larga y sale con 2: Claude Code se lo enseña a Claude.
export function avisarYSalir(mensaje, salida = '') {
  const lineas = salida.trim().split('\n');
  const final = lineas.length > 60 ? ['…', ...lineas.slice(-60)] : lineas;
  process.stderr.write(`${mensaje}\n${final.join('\n')}\n`);
  process.exit(2);
}
