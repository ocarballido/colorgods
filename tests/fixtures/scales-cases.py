# Origen: github.com/ocarballido/design-tokens-101, commit f4885d7, tests/fixtures/scales-cases.py.
# Copiado sin cambios en colorgods (decisión A2 o paso C2). Lo que sigue es el archivo original.

# Nota de colorgods: importa tools/scales.py, que no se copia (A2); para regenerar el JSON hay que ejecutarlo en DesignToken101.

"""Casos de referencia para tests/scales.test.mjs: lo que da tools/scales.py con varios colores,
curvas y tintes. La prueba comprueba que tools/scales.mjs (la herramienta de la web) da lo mismo.

Uso: python3 tests/fixtures/scales-cases.py  (escribe tests/fixtures/scales-cases.json)
Regenéralo solo si cambia el método en tools/scales.py."""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import scales as s  # noqa: E402

BRANDS = ['#33CC99', '#FF0000', '#FF6B00', '#FFD600', '#0000FF', '#7C3AED', '#1A2B5C', '#008080',
          '#607D8B', '#808080', '#111418', '#F8C8DC', '#F5F5DC', '#FFFFFF', '#000000', '#F1A035',
          '#E11D48', '#22C55E', '#0EA5E9', '#A3E635', '#6B21A8', '#7F8082']

def codes(out):
    result = []
    for w in out['warnings']:
        if 'no tiene croma' in w:
            result.append({'code': 'achromatic'})
        elif 'extremo de la curva' in w:
            result.append({'code': 'extreme', 'step': out['accent_input']['anchor_step']})
        elif 'recorta el croma' in w:
            result.append({'code': 'clipped', 'steps': [{'step': r['step'], 'clip': r['clip']} for r in out['accent'] if r.get('clip')]})
    return result

cases = []
for hx in BRANDS:
    for ref in s.TW_CURVES:
        tints = [0, 0.5, 1] if ref == 'green' else [0.5]
        for tint in tints:
            out = s.build(hx, tint, ref)
            cases.append({
                'hex': hx, 'reference': ref, 'tint': tint,
                'anchor': out['accent_input']['anchor_step'],
                'accent': [r['hex'] for r in out['accent']],
                'neutral': [r['hex'] for r in out['neutral']],
                'warnings': codes(out),
            })
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scales-cases.json')
with open(path, 'w') as f:
    json.dump(cases, f, separators=(',', ':'))
    f.write('\n')
print(f'{len(cases)} casos en {path}')
