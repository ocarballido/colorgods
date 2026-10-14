// Texto de una región viva. Por debajo de 1024 px se repite en un hueco dentro del panel de ajustes (decisión 95):
// con el panel abierto, lo de fuera queda inerte y su región no se anunciaría; con el panel cerrado, la copia de
// dentro no se ve ni se anuncia. Así habla siempre una sola de las dos.
import { createPortal } from 'react-dom';

export function LiveText({ slot, status, text }: { slot: HTMLElement | null; status?: boolean; text: string }) {
  const p = (
    <p role={status ? 'status' : undefined} aria-live={status ? undefined : 'polite'} className="sr-only">
      {text}
    </p>
  );
  return (
    <>
      {p}
      {slot && createPortal(p, slot)}
    </>
  );
}
