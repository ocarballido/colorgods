// Vercel Web Analytics (decisión 104). Se ejecuta al importarse: solo lo importa main.tsx, en producción
// y después de pintar, así que va en su propio trozo, fuera del bundle inicial.
import { inject } from '@vercel/analytics';

declare global {
  // Configuración que Vercel da al build (Resilient Intake de la versión 2): rutas únicas del proyecto para
  // el script y los envíos. Se leen igual que en las integraciones de Vue y SvelteKit del paquete.
  interface ImportMetaEnv {
    readonly VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG?: string;
    readonly VITE_VERCEL_OBSERVABILITY_BASEPATH?: string;
  }
  // Lo mínimo de la API de Trusted Types que se usa; lib.dom de TypeScript no la trae.
  interface Window {
    trustedTypes?: {
      createPolicy(name: string, rules: { createScriptURL(url: string): string | null }): unknown;
    };
  }
}

const config = import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG;
const basePath = import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH;

// Igual que makeAbsolute del paquete, que la aplica a scriptSrc antes de asignarla.
const makeAbsolute = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') ? url : `/${url}`;

// La misma ruta que calcularía el paquete; se le pasa explícita para que la política compare con la cadena
// exacta que va a asignar. Aquí no se filtra el origen: lo hace la política.
function scriptSrc(): string {
  try {
    const src: unknown = config && JSON.parse(config).analytics?.scriptSrc;
    if (typeof src === 'string') return makeAbsolute(src);
  } catch {
    // Configuración no válida: la ruta de basePath o la de siempre.
  }
  return makeAbsolute(basePath ? `${basePath}/insights/script.js` : '/_vercel/insights/script.js');
}
const SCRIPT_SRC = scriptSrc();

// El paquete crea el <script> con script.src = cadena, que require-trusted-types-for 'script' bloquea.
// Solo la política "default" recibe esas cadenas; esta acepta únicamente la URL del script de Vercel, y solo
// si es del mismo origen, y no define createHTML ni createScript: cualquier otra cadena sigue bloqueada.
window.trustedTypes?.createPolicy('default', {
  createScriptURL: (url) => (url === SCRIPT_SRC && new URL(url, location.href).origin === location.origin ? url : null),
});

inject(
  {
    mode: 'production',
    debug: false,
    basePath,
    scriptSrc: SCRIPT_SRC,
    // La URL lleva los ajustes de F18 (decisión 88): se manda sin consulta ni fragmento.
    beforeSend: (event) => ({ ...event, url: event.url.split(/[?#]/, 1)[0] }),
  },
  config,
);
