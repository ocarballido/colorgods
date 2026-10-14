// Región role="status" (ux.md §9): resume el resultado tras una pausa en los cambios, una vez y no a cada tecla, y
// dice los avisos y notas nuevos (F12), con su texto. También dice los errores que aparecen en un campo que no tiene
// el foco (pasos al cambiar de convención, nombres personalizados al cambiar N), que si no pasarían en silencio
// (3.3.1, 4.1.3). Un aviso es nuevo si no estaba en el último anuncio (por su código y su escala: si solo cambian
// sus pasos, no se repite).
import { useEffect, useRef, useState } from 'react';
import type { Scales } from '../../tools/scales.mjs';
import { plural, type Notice } from './noticeData';
import { LiveText } from './LiveText';
import { again } from './pairData';

// Pausa antes de anunciar: la de ux.md §9, que se ajusta en C4.
export const ANNOUNCE_DELAY = 500;

export function summarize(result: Scales, list: Notice[]) {
  const warnings = list.filter((n) => n.warning).length;
  const notes = list.length - warnings;
  const roles = Object.keys(result.roles).length;
  return `Scales updated: ${result.names.length} steps, ${roles ? `${plural(roles, 'semantic palette')}, ` : ''}${plural(warnings, 'warning')}, ${plural(notes, 'note')}.`;
}

export function StatusRegion({
  result,
  list,
  extra,
  slot,
}: {
  result: Scales;
  list: Notice[];
  extra: string;
  // Hueco del panel de ajustes, para que se oiga con el panel abierto (LiveText).
  slot: HTMLElement | null;
}) {
  const [message, setMessage] = useState('');
  // Último resultado anunciado (al abrir, el de la página): si no cambian ni él ni los errores, no se dice nada, por
  // ejemplo al escribir el nombre de la paleta, que cambia el texto de los avisos pero no el resultado.
  const last = useRef({ result, extra });
  // Avisos ya dichos o que ya estaban al abrir la página.
  const known = useRef(new Set(list.map((n) => n.key)));
  useEffect(() => {
    // Al abrir la página no se anuncia nada: el resultado ya está ahí (ux.md §2).
    if (result === last.current.result && extra === last.current.extra) return;
    const timer = setTimeout(() => {
      const fresh = list.filter((n) => !known.current.has(n.key));
      known.current = new Set(list.map((n) => n.key));
      last.current = { result, extra };
      const text = [
        summarize(result, list),
        ...fresh.map((n) => `New ${n.warning ? 'warning' : 'note'}: ${n.text}`),
        extra,
      ]
        .filter(Boolean)
        .join(' ');
      setMessage((prev) => again(prev, text));
    }, ANNOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [result, list, extra]);
  return <LiveText slot={slot} status text={message} />;
}
