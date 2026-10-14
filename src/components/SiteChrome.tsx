// Cabecera y pie, con los textos de las pantallas de B3 (decisión 62). "How it works" es una página aparte
// (decisión 108, que revisa la 40); how-it-works/index.html repite esta cabecera y este pie en HTML.
import type { ReactNode } from 'react';
import author from '../assets/author.svg';
import logoDark from '../assets/logo-dark.svg';
import logo from '../assets/logo.svg';
import { ExternalLink } from './icons';

// Logotipo de la cabecera de Figma con el texto en trazos (decisión 97); en modo oscuro, el texto en
// text/accent/default oscuro. Pesan más de 4 KB, así que Vite los sirve como archivos y no como data:.
export function Logo({ alt }: { alt: string }) {
  return (
    <picture>
      <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
      <img src={logo} alt={alt} width="106" height="44" className="block" />
    </picture>
  );
}

// "How it works" vuelve a la app con estos ajustes (decisión 108): la consulta se guarda en sessionStorage con la clave
// BACK_KEY de src/backLink.ts, repetida aquí para que la app no comparta un trozo con esa página. Sin almacenamiento,
// "Back to colorgods" lleva a "/".
const saveBack = (search: string) => {
  try {
    sessionStorage.setItem('colorgods:back', `?${search}`);
  } catch {
    // Ventana privada o datos bloqueados: se vuelve sin ajustes.
  }
};

export function SiteHeader({ menu, search }: { menu: ReactNode; search: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-[var(--cg-header-height)] items-center border-b border-neutral-default bg-neutral-translucent px-400 backdrop-blur-[var(--cg-blur-300)]">
      <div className="flex w-full items-center justify-between">
        <h1>
          <Logo alt="colorgods" />
        </h1>
        <div className="flex items-center gap-400">
          <a
            href="/how-it-works"
            onClick={() => saveBack(search)}
            className="text-body-small leading-normal text-accent-default underline"
          >
            How it works
          </a>
          {menu}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-default bg-neutral-default px-400 py-600">
      <div className="flex flex-col gap-200 text-caption-default leading-snug text-neutral-subtle">
        <p>
          Made by
          <br />
          Oscar Carballido
        </p>
        <a
          href="https://www.oscarballido.com"
          rel="noreferrer"
          aria-label="Oscar Carballido, personal website"
          className="self-start"
        >
          <img src={author} alt="" width="39" height="24" />
        </a>
        {/* Link de ColorScaleUI, externo y del tamaño caption: li:external-link a space/100 del texto (decisión 99). */}
        <a
          href="https://github.com/ocarballido/colorgods"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-100 self-start text-accent-default underline hover:text-accent-hover"
        >
          Source on GitHub
          <span className="sr-only"> (opens in a new tab)</span>
          <ExternalLink />
        </a>
        <p>Anonymous visit statistics with Vercel Web Analytics. No&nbsp;cookies.</p>
      </div>
    </footer>
  );
}
