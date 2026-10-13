// Dice si un contenedor con desplazamiento horizontal no cabe: solo entonces se puede enfocar con el teclado, para
// desplazarlo con las flechas (2.1.1), sin añadir una parada de tabulación cuando no hace falta.
import { useEffect, useRef, useState } from 'react';

export function useOverflows<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, []);
  return [ref, overflows] as const;
}
