# colorgods

App web para generar escalas tonales de color con el número de pasos que quieras, la convención de nombres que elijas y el mismo contraste en cada paso, lista para exportar a Figma (DTCG) y a código (CSS y `@theme` de Tailwind CSS 4).

Está en [colorgods.com](https://colorgods.com). La interfaz es en inglés; los documentos del proyecto, en español.

## Estado

Versión 1 publicada en [colorgods.com](https://colorgods.com). El avance está en [`docs/plan.md`](docs/plan.md) y las decisiones, en [`docs/decisiones.md`](docs/decisiones.md).

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/` | La app (Vite, React y TypeScript) |
| `tools/` | Motor de escalas (`scales.mjs`) y conversión de las variables de Figma a DTCG (`figma-to-dtcg.mjs`) |
| `tests/` | Pruebas del motor (`node --test`) |
| `tokens/` | Variables del sistema de diseño exportadas de Figma y su paso a CSS con Terrazzo |
| `docs/` | Funcionalidades, UX, decisiones, plan y las pruebas que las sostienen |

## Uso

Con Node 24:

```sh
npm install
npm test          # pruebas del motor
npm run tokens    # variables de Figma (tokens/figma/) a CSS (src/styles/)
npm run dev       # servidor local
npm run build     # página estática en dist/
npm run lint      # ESLint
npm run format    # Prettier
```

El desarrollo se hace con Claude Code: las instrucciones están en [`CLAUDE.md`](CLAUDE.md) y la configuración compartida en `.claude/`. Para avisar de un fallo de seguridad, [`SECURITY.md`](SECURITY.md).

## Origen

Nace de la herramienta "Generar escalas" de [DesignToken101](https://github.com/ocarballido/design-tokens-101). El motor, sus pruebas, `figma-to-dtcg.mjs` y la configuración de Terrazzo se copian de ese repositorio en el commit `f4885d7`, con el origen en la cabecera de cada archivo. El motor se reescribe después para N pasos con el mismo contraste en cada paso, y sus pruebas son nuevas (paso C3). Las curvas de referencia son datos de [Tailwind CSS](https://tailwindcss.com) (MIT).

## Fuentes tipográficas

La página sirve sus propias fuentes en woff2, sin peticiones a otros dominios. Las dos tienen la licencia SIL Open Font License 1.1, cuyo texto está junto a los archivos, en `src/assets/fonts/`, y se publica con la página en `public/fonts/` (`/fonts/Inter-OFL.txt` y `/fonts/JetBrainsMono-OFL.txt`):

- [Inter](https://github.com/rsms/inter), variable (pesos 100 a 900), subconjunto latino. Copyright 2016 The Inter Project Authors. Licencia: `src/assets/fonts/OFL-Inter.txt`.
- [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) 400, subconjunto latino. Copyright 2020 The JetBrains Mono Project Authors. Licencia: `src/assets/fonts/OFL-JetBrainsMono.txt`.

Los archivos woff2 son los de [Fontsource](https://fontsource.org) 5.3.0 (`@fontsource-variable/inter` y `@fontsource/jetbrains-mono`), que los toma de Google Fonts (su `metadata.json` da como origen github.com/google/fonts). No se han modificado. Para comprobarlo: el `integrity` de los paquetes en el registro de npm es `sha512-OupL48va4JNofb97w6NYeF9S7W/kHNKM0Er8Dem5nqi4jeOLrVJDoE8tZEpnMJmtkvNbB1EIPPwHcdkF6b1oUA==` (Inter) y `sha512-fqDfB5I9f1p1TV486aUgB9t8zP84P0O1FtQR5Ol9vjwPy+S+EIGlVYm1cvj2W5shcZMTg2nZFdVMoH5wFu8a1A==` (JetBrains Mono), y el SHA-256 de los archivos (`shasum -a 256 src/assets/fonts/*.woff2`), el mismo que el de `files/` en esos paquetes:

```
3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62  inter-latin-wght-normal.woff2
14425ba9c695763c1547f48a206b7aa60350a33ae23de09f0407877f3fcd89eb  jetbrains-mono-latin-400-normal.woff2
```

La licencia MIT del repositorio no cubre estas fuentes.

## Autoría

Oscar Carballido, con la ayuda de Claude (Anthropic). Licencia MIT.
