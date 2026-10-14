// "Back to colorgods" de "How it works" vuelve a la app con sus ajustes (decisión 108). Con Referrer-Policy:
// strict-origin (decisión 104), document.referrer solo trae el origen, así que la app guarda su consulta en
// sessionStorage con esta clave al pulsar "How it works" (SiteHeader): no sale de la pestaña ni llega a la analítica.
// La app no importa este módulo: con dos entradas, un módulo de las dos iría a un trozo aparte que la app tendría que
// pedir; la clave se repite allí.
export const BACK_KEY = 'colorgods:back';

// La URL de vuelta: "/" con la consulta guardada, si se llegó desde la app ("/" del mismo origen); si no, "/". Con
// strict-origin, un referente del mismo origen siempre trae la ruta "/"; la ruta solo se distingue sin esa cabecera
// (npm run dev) o si la política cambia, y entonces se exige que se venga de la app.
export function backHref(referrer: string): string {
  try {
    const from = new URL(referrer);
    if (from.origin !== location.origin || from.pathname !== '/') return '/';
    const search = sessionStorage.getItem(BACK_KEY);
    return search?.startsWith('?') ? `/${search}` : '/';
  } catch {
    // Sin referente (URL no válida) o sin almacenamiento (ventana privada, datos bloqueados).
    return '/';
  }
}
