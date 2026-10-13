// Cabecera, pie y "How it works" (decisión 40), con los textos de las pantallas de B3 (decisión 62).
import author from '../assets/author.svg';
import logo from '../assets/logo.svg';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-[var(--cg-header-height)] items-center border-b border-neutral-default bg-neutral-translucent px-400 backdrop-blur-[var(--cg-blur-300)]">
      <div className="flex w-full items-center justify-between">
        <h1 className="flex items-center gap-100">
          <img src={logo} alt="" width="48" height="31" />
          <span
            aria-hidden="true"
            className="flex flex-col text-[18px] leading-[1] font-600 text-accent-default uppercase"
          >
            <span>Color</span>
            <span>Gods</span>
          </span>
          <span className="sr-only">colorgods: tonal color scales with the same contrast at each step</span>
        </h1>
        <a href="#how-it-works" className="text-body-small leading-normal text-accent-default underline">
          How it works
        </a>
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
        Each step is a contrast level, the same in every scale: at each step, blue, danger, warning and neutral have the
        same luminance, so the same contrast with white and black. The levels are the median of the 17 Tailwind CSS
        color palettes.
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
      </div>
    </footer>
  );
}
