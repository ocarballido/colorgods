// Región role="status" (ux.md §9): resume el resultado tras una pausa en los cambios, una vez y no a cada tecla, y
// dice los avisos y notas nuevos (F12), con su texto. También dice los errores que aparecen en un campo que no tiene
// el foco (pasos al cambiar de convención, nombres personalizados al cambiar N), que si no pasarían en silencio
// (3.3.1, 4.1.3). Un aviso es nuevo si no estaba en el último anuncio (por su código y su escala: si solo cambian
// sus pasos, no se repite).
import { useEffect, useRef, useState } from 'react';
import type { Scales } from '../../tools/scales.mjs';
import { plural, type Notice } from './noticeData';

// Pausa antes de anunciar: la de ux.md §9, que se ajusta en C4.
export const ANNOUNCE_DELAY = 500;

const NBSP = String.fromCharCode(160);

export function summarize(result: Scales, list: Notice[]) {
  const warnings = list.filter((n) => n.warning).length;
  const notes = list.length - warnings;
  return `Scales updated: ${result.names.length} steps, ${plural(warnings, 'warning')}, ${plural(notes, 'note')}.`;
}

export function StatusRegion({ result, list, extra }: { result: Scales; list: Notice[]; extra: string }) {
  const [message, setMessage] = useState('');
  const initial = useRef({ result, extra });
  // Avisos ya dichos o que ya estaban al abrir la página.
  const known = useRef(new Set(list.map((n) => n.key)));
  useEffect(() => {
    // Al abrir la página no se anuncia nada: el resultado ya está ahí (ux.md §2).
    if (result === initial.current.result && extra === initial.current.extra) return;
    const timer = setTimeout(() => {
      const fresh = list.filter((n) => !known.current.has(n.key));
      known.current = new Set(list.map((n) => n.key));
      const text = [
        summarize(result, list),
        ...fresh.map((n) => `New ${n.warning ? 'warning' : 'note'}: ${n.text}`),
        extra,
      ]
        .filter(Boolean)
        .join(' ');
      // Un espacio duro alterno hace que se anuncie también un texto igual al anterior.
      setMessage((prev) => (prev === text ? `${text}${NBSP}` : text));
    }, ANNOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [result, list, extra]);
  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}
