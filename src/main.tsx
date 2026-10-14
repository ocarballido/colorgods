import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Analítica solo en producción (decisión 104): en npm run dev la rama desaparece y no se carga nada.
// Se pide cuando el navegador queda libre tras el primer render; sin requestIdleCallback (Safari), a los 2 s.
if (import.meta.env.PROD) {
  const load = () => {
    import('./analytics').catch(() => {});
  };
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 5000 });
  else setTimeout(load, 2000);
}
