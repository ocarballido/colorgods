// Cabecera, pie y "How it works" (decisión 40), con los textos de las pantallas de B3 (decisión 62).
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

export function SiteHeader({ menu }: { menu: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-[var(--cg-header-height)] items-center border-b border-neutral-default bg-neutral-translucent px-400 backdrop-blur-[var(--cg-blur-300)]">
      <div className="flex w-full items-center justify-between">
        <h1>
          <Logo alt="colorgods" />
        </h1>
        <div className="flex items-center gap-400">
          <a href="#how-it-works" className="text-body-small leading-normal text-accent-default underline">
            How it works
          </a>
          {menu}
        </div>
      </div>
    </header>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      tabIndex={-1}
      className="flex flex-col gap-300 text-body-default leading-normal text-neutral-default"
    >
      <h2 id="how-it-works-heading" className="text-heading-4 font-600 leading-snug">
        How it works
      </h2>
      <p>
        Each step is a contrast level, the same in every scale: at each step, your color’s scale, the semantic palettes
        and the neutrals have the same luminance, so the same contrast with white and black. The levels are the median
        of the 17 Tailwind CSS color palettes.
      </p>
      <p>
        Your color keeps its exact value and goes on the step with the closest contrast. That step keeps its own
        contrast, so the rule above the scales leaves it out.
      </p>
      <p>
        The chroma curve only shapes how saturated each step is; it doesn’t change the contrast. The curves come from
        the Tailwind CSS palettes (MIT license). With the chroma cap, no step is more saturated than your color.
      </p>
      <p>colorgods grew out of the scale tool in DesignToken101.</p>
    </section>
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
          rel="noreferrer"
          className="flex items-center gap-100 self-start text-accent-default underline hover:text-accent-hover"
        >
          Source on GitHub
          <ExternalLink />
        </a>
      </div>
    </footer>
  );
}
