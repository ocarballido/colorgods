// Página "How it works" (decisión 108): HTML estático sin React; este módulo solo pone la URL de "Back to colorgods"
// y carga la analítica como la app. No comparte módulos con la app (ver backLink.ts), salvo el trozo de la analítica.
import './how-it-works.css';
import { backHref } from './backLink';

const back = document.getElementById('back');
if (back instanceof HTMLAnchorElement) back.href = backHref(document.referrer);

// Analítica solo en producción y cuando el navegador queda libre, igual que en main.tsx (decisiones 104 y 105).
if (import.meta.env.PROD) {
  const load = () => {
    import('./analytics').catch(() => {});
  };
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 5000 });
  else setTimeout(load, 2000);
}
