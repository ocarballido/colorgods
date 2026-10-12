// Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tools/figma-to-dtcg.mjs.
// Copiado sin cambios en colorgods (decisión A2 o paso C2). Lo que sigue es el archivo original.

// Convierte la exportación de Figma (tokens/figma/, C10) en DTCG 2025.10 estricto (tokens/dtcg/).
// Motivo y pruebas: docs/paso-7-tokens.md §1 y §3 (V06) y docs/investigacion-herramientas.md §6 (T21, T22).
// La herramienta "Normalizar la exportación" de la web usa este mismo archivo (función normalize).
//
// Lo que Figma exporta y lo que hace este script:
//   1. Alias a otra colección: valor resuelto, con la referencia solo en $extensions["com.figma.aliasData"]
//      → referencia DTCG: "color/neutral/950" → "{color.neutral.950}". Un alias dentro de la misma
//      colección ya sale como referencia DTCG en $value ("{space.100}") y se deja como está.
//   2. El tipo DTCG sale del scope de Figma (una decisión de diseño, S22), nunca del valor: el Format
//      Module prohíbe adivinarlo. Qué scope da qué tipo lo dice SCOPE_TYPES, justo debajo.
//   3. `dimension` lleva unidad: 16 → { "value": 16, "unit": "px" }.
//   4. Quita $extensions de la raíz (com.figma.modeName): el modo se sabe por el nombre del archivo.
//   5. Opacidad (alpha) en float32: Figma exporta 90 % como 0.8999999761581421, que en hex da e5
//      (89,8 %). Se sustituye por el decimal más corto con el mismo float32 (0.9 → e6): es el valor
//      escrito en Figma, no una aproximación (V31). Si el alpha no es un float32, se deja igual.
// Si un token no tiene un tipo decidido en SCOPE_TYPES, o una referencia no tiene destino, el script
// lo dice todo de una vez y no escribe nada.
//
// Uso: node tools/figma-to-dtcg.mjs (o npm run tokens)

// <scope-types>
// Para cada tipo de Figma, qué scope (tal como lo escribe la exportación) da qué tipo DTCG.
// Añade aquí tus decisiones. La clave puede ser un scope ('LINE_HEIGHT'), varios scopes unidos
// con "+" en orden alfabético ('FONT_STYLE+GAP') o '(sin scopes)'. Tipos posibles en TYPE_OPTIONS;
// 'exclude' deja el token fuera de la salida.
export const SCOPE_TYPES = {
  number: {
    FONT_STYLE: 'fontWeight',
    GAP: 'dimension',
    CORNER_RADIUS: 'dimension',
    STROKE_FLOAT: 'dimension',
    FONT_SIZE: 'dimension',
    WIDTH_HEIGHT: 'dimension',
  },
  string: {
    FONT_FAMILY: 'fontFamily',
  },
  boolean: {},
};
// </scope-types>

// Tipos DTCG que se pueden elegir para cada tipo de Figma (investigacion-herramientas.md §6.3).
export const TYPE_OPTIONS = {
  number: ['dimension', 'number', 'fontWeight', 'exclude'],
  string: ['fontFamily', 'exclude'],
  boolean: ['number', 'exclude'],
};

const NO_SCOPES = '(sin scopes)';

// Una referencia DTCG: el valor entero entre llaves (Format Module 2025.10, Aliases / References).
const isReference = (value) => typeof value === 'string' && /^\{[^{}]+\}$/.test(value);

// Decimal más corto que Figma guarda como el mismo float32 (punto 5).
function float32Decimal(value) {
  if (Math.fround(value) !== value) return value;
  for (let digits = 1; digits <= 9; digits++) {
    const candidate = Number(value.toPrecision(digits));
    if (Math.fround(candidate) === value) return candidate;
  }
  return value;
}

// Tipo de Figma: un Boolean sale como `number` con com.figma.type "boolean" (comprobado el 2026-10-08).
function figmaType(token) {
  const declared = token.$extensions?.['com.figma.type'];
  return token.$type === 'number' && declared === 'boolean' ? 'boolean' : token.$type;
}

export function scopeKey(scopes) {
  return scopes.length ? [...scopes].sort().join('+') : NO_SCOPES;
}

// El tipo decidido para estos scopes, o null si no hay decisión (sin scopes, ALL_SCOPES, un scope
// sin tipo en el mapa o scopes que darían tipos distintos).
export function typeFor(type, scopes, map = SCOPE_TYPES) {
  const byScope = map[type] ?? {};
  const key = scopeKey(scopes);
  if (key in byScope) return byScope[key];
  const types = [...new Set(scopes.map((scope) => byScope[scope]).filter(Boolean))];
  return types.length === 1 && !scopes.includes('ALL_SCOPES') ? types[0] : null;
}

function convertToken(token, id, ctx) {
  const extensions = token.$extensions ?? {};
  const scopes = extensions['com.figma.scopes'] ?? [];
  const alias = extensions['com.figma.aliasData'];
  const out = { ...token };

  if (token.$type === 'color') {
    ctx.count.color++;
    const alpha = token.$value?.alpha;
    if (typeof alpha === 'number' && float32Decimal(alpha) !== alpha) {
      out.$value = { ...token.$value, alpha: float32Decimal(alpha) };
      ctx.count.alpha++;
    }
  } else {
    const type = figmaType(token);
    const dtcgType = typeFor(type, scopes, ctx.map);
    if (!dtcgType || !(TYPE_OPTIONS[type] ?? ['exclude']).includes(dtcgType)) {
      const key = `${type}|${scopeKey(scopes)}`;
      const entry = ctx.unresolved.get(key) ?? { type, key: scopeKey(scopes), scopes, ids: [] };
      if (!entry.ids.includes(id)) entry.ids.push(id); // una vez por variable, aunque esté en varios modos
      ctx.unresolved.set(key, entry);
      return undefined;
    }
    if (dtcgType === 'exclude') {
      ctx.count.excluded++;
      return undefined;
    }
    out.$type = dtcgType;
    if (dtcgType === 'dimension' && !isReference(token.$value)) out.$value = { value: token.$value, unit: 'px' };
    ctx.count[dtcgType] = (ctx.count[dtcgType] ?? 0) + 1;
  }

  if (alias) {
    out.$value = `{${alias.targetVariableName.replace(/\//g, '.')}}`;
    ctx.count.alias++;
  } else if (isReference(token.$value)) {
    ctx.count.alias++;
  }
  return out;
}

function convertGroup(group, pathParts, ctx) {
  const out = {};
  for (const [key, value] of Object.entries(group)) {
    if (key === '$extensions' && pathParts.length === 0) continue;
    if (key.startsWith('$')) {
      out[key] = value;
    } else if (value && typeof value === 'object' && '$value' in value) {
      const id = [...pathParts, key].join('.');
      const token = convertToken(value, id, ctx);
      if (token) {
        out[key] = token;
        ctx.tokens.push({ id, value: token.$value, file: ctx.file });
      }
    } else {
      out[key] = convertGroup(value, [...pathParts, key], ctx);
    }
  }
  return out;
}

/**
 * Función pura: sin sistema de archivos, sin red, sin estado global. La usan el script y la web.
 * @param {{ path: string, text: string }[]} files  rutas relativas a la exportación ("Primitives/Value.tokens.json")
 * @param {{ map?: typeof SCOPE_TYPES }} options
 * @returns {{
 *   files: { path: string, text: string }[],
 *   count: Record<string, number>,
 *   unresolved: { type: string, key: string, scopes: string[], ids: string[] }[],
 *   missingRefs: { id: string, ref: string, file: string }[],
 * }}
 */
export function normalize(files, { map = SCOPE_TYPES } = {}) {
  const ctx = {
    map,
    unresolved: new Map(),
    tokens: [],
    count: { files: 0, alias: 0, dimension: 0, fontWeight: 0, fontFamily: 0, color: 0, alpha: 0, number: 0, excluded: 0 },
  };
  const out = [];
  for (const file of [...files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))) {
    ctx.file = file.path;
    const source = JSON.parse(file.text);
    out.push({ path: file.path, text: `${JSON.stringify(convertGroup(source, [], ctx), null, 2)}\n` });
    ctx.count.files++;
  }
  const ids = new Set(ctx.tokens.map((token) => token.id));
  const missingRefs = ctx.tokens
    .filter((token) => isReference(token.value) && !ids.has(token.value.slice(1, -1)))
    .map((token) => ({ id: token.id, ref: token.value, file: token.file }));
  return { files: out, count: ctx.count, unresolved: [...ctx.unresolved.values()], missingRefs };
}

// Resumen de una línea, el mismo en el script y en la web.
export function summary(count) {
  const extra = [count.number ? `${count.number} number` : '', count.excluded ? `${count.excluded} excluidos` : '']
    .filter(Boolean)
    .map((text) => ` · ${text}`)
    .join('');
  return (
    `tokens/dtcg: ${count.files} archivos · ${count.alias} alias · ${count.dimension} dimension · ` +
    `${count.fontWeight} fontWeight · ${count.fontFamily} fontFamily · ${count.color} color · ` +
    `${count.alpha} alpha float32${extra}`
  );
}

// Lo que falta, en texto, para el script (la web lo muestra con sus componentes).
export function problems({ unresolved, missingRefs }) {
  const lines = [];
  if (unresolved.length) {
    lines.push('Tokens sin tipo DTCG decidido:');
    for (const entry of unresolved) {
      const scopes = entry.key === NO_SCOPES ? 'sin scopes' : `con ${entry.key}`;
      const n = entry.ids.length;
      lines.push(`- ${entry.type} ${scopes}: ${n} ${n === 1 ? 'token' : 'tokens'} (${entry.ids.slice(0, 3).join(', ')}${n > 3 ? '…' : ''})`);
    }
    lines.push('', 'Decide el tipo de cada uno y añádelo a SCOPE_TYPES, al principio de este archivo. Por ejemplo:');
    for (const entry of unresolved) {
      lines.push(`  ${entry.type}: { '${entry.key}': ${(TYPE_OPTIONS[entry.type] ?? ['exclude']).map((type) => `'${type}'`).join(' | ')} }`);
    }
  }
  if (missingRefs.length) {
    if (lines.length) lines.push('');
    lines.push('Referencias sin destino (el token al que apuntan no está en los archivos):');
    for (const ref of missingRefs) lines.push(`- ${ref.id} → ${ref.ref} (${ref.file})`);
  }
  return lines.join('\n');
}

// Para la web: el mismo script con las decisiones del usuario escritas en SCOPE_TYPES.
export function withScopeTypes(source, map) {
  const body = Object.entries(map)
    .map(([type, scopes]) => {
      const entries = Object.entries(scopes).map(([key, value]) => `    ${/^[A-Z_]+$/.test(key) ? key : `'${key}'`}: '${value}',`);
      return entries.length ? `  ${type}: {\n${entries.join('\n')}\n  },` : `  ${type}: {},`;
    })
    .join('\n');
  return source.replace(
    /(\/\/ <scope-types>[\s\S]*?export const SCOPE_TYPES = \{\n)[\s\S]*?(\n\};\n\/\/ <\/scope-types>)/,
    `$1${body}$2`,
  );
}

// --- Línea de comandos: solo con `node tools/figma-to-dtcg.mjs` ------------------------------
const isCli =
  typeof process !== 'undefined' &&
  process.argv?.[1] &&
  import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href;

if (isCli) {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const IN_DIR = path.join(process.cwd(), 'tokens/figma');
  const OUT_DIR = path.join(process.cwd(), 'tokens/dtcg');

  const files = [];
  for (const collection of fs.readdirSync(IN_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
    for (const name of fs.readdirSync(path.join(IN_DIR, collection.name)).filter((item) => item.endsWith('.tokens.json'))) {
      files.push({ path: `${collection.name}/${name}`, text: fs.readFileSync(path.join(IN_DIR, collection.name, name), 'utf8') });
    }
  }

  const result = normalize(files);
  if (result.unresolved.length || result.missingRefs.length) {
    console.error(`No se ha escrito nada en tokens/dtcg/.\n\n${problems(result)}`);
    process.exitCode = 1;
  } else {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    for (const file of result.files) {
      fs.mkdirSync(path.dirname(path.join(OUT_DIR, file.path)), { recursive: true });
      fs.writeFileSync(path.join(OUT_DIR, file.path), file.text);
    }
    console.log(summary(result.count));
  }
}
