// Región role="status" (ux.md §9): resume el resultado tras una pausa en los cambios, una vez y no a cada tecla.
// También dice los errores que aparecen en un campo que no tiene el foco (pasos al cambiar de convención, nombres
// personalizados al cambiar N), que si no pasarían en silencio (3.3.1, 4.1.3).
// Pendiente para la parte de avisos de C4: nombrar los avisos nuevos (ux.md §9, F12).
import { useEffect, useRef, useState } from 'react';
import type { Scales } from '../../tools/scales.mjs';

// Pausa antes de anunciar: la de ux.md §9, que se ajusta en C4.
export const ANNOUNCE_DELAY = 500;

const WARNINGS = new Set(['achromatic', 'extreme', 'role-collision']);
const NBSP = String.fromCharCode(160);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function summarize(result: Scales) {
  const warnings = result.warnings.filter((w) => WARNINGS.has(w.code)).length;
  const notes = result.warnings.length - warnings;
  return `Scales updated: ${result.names.length} steps, ${plural(warnings, 'warning')}, ${plural(notes, 'note')}.`;
}

export function StatusRegion({ result, extra }: { result: Scales; extra: string }) {
  const [message, setMessage] = useState('');
  const initial = useRef({ result, extra });
  useEffect(() => {
    // Al abrir la página no se anuncia nada: el resultado ya está ahí (ux.md §2).
    if (result === initial.current.result && extra === initial.current.extra) return;
    const text = `${summarize(result)}${extra ? ' ' + extra : ''}`;
    // Un espacio duro alterno hace que se anuncie también un texto igual al anterior.
    const timer = setTimeout(() => setMessage((prev) => (prev === text ? `${text}${NBSP}` : text)), ANNOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [result, extra]);
  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}
