// Copiar al portapapeles con un mensaje que dura unos segundos (F17, F18; estado "Copiado" de Figma). El mensaje va en
// una región role="status", así que se anuncia; si se copia otra vez antes de que se borre, se anuncia de nuevo.
// failed: el mensaje es el de fallo, que se ve en el color de error y no en el de éxito.
import { useEffect, useRef, useState } from 'react';
import { again } from './components/pairData';

export function useCopy(done: string, failed: string) {
  const [message, setMessage] = useState('');
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async (text: string) => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      ok = false;
    }
    clearTimeout(timer.current);
    setMessage((prev) => again(prev, ok ? done : failed));
    timer.current = window.setTimeout(() => setMessage(''), 3000);
  };
  return [message, copy, message !== '' && !message.startsWith(done)] as const;
}
