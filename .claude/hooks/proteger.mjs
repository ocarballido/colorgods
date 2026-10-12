// PreToolUse (Edit, Write, NotebookEdit): bloquea la edición de archivos que no se cambian a mano.
// No cubre lo que escribe un comando de Bash; para eso están los permisos y la revisión del pull request.
// Compara en minúsculas porque el disco de macOS (APFS) no distingue mayúsculas por defecto.
import { leerEntrada, ubicar } from './comun.mjs';

const PROTEGIDOS = [
  {
    coincide: (r) => r === 'docs/comparacion/a7-fixtures.json',
    motivo:
      'guarda los hex del prototipo docs/comparacion/metodo-d.mjs con los que se comprueba el motor; ' +
      'no se edita para que una prueba pase',
  },
  {
    coincide: (r) => r.startsWith('tokens/figma/'),
    motivo: 'sale de Figma tal cual (tokens/figma/README.md): se vuelve a exportar desde ColorScaleUI',
  },
  { coincide: (r) => r === 'license', motivo: 'licencia MIT de la decisión 42' },
  {
    coincide: (r) => r === 'package-lock.json',
    motivo: 'lo escribe npm: usa npm install o npm uninstall (piden permiso)',
  },
];

const rel = ubicar(await leerEntrada())?.rel;
const protegido = rel && PROTEGIDOS.find((p) => p.coincide(rel.toLowerCase()));
if (protegido) {
  process.stderr.write(
    `Bloqueado: ${rel} está protegido: ${protegido.motivo}. Si hay que cambiarlo, pregunta a Oscar.\n`,
  );
  process.exit(2);
}
