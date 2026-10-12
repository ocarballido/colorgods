---
name: encargo
description: Lleva un encargo de desarrollo de colorgods de principio a fin (un paso de docs/plan.md, o una parte si el plan lo divide), lee decisiones y plan, crea la rama, hace el trabajo, pasa las comprobaciones y los revisores, actualiza los documentos y prepara el pull request.
argument-hint: <paso del plan, por ejemplo C4> <texto del encargo>
disable-model-invocation: true
---

Encargo de desarrollo: $ARGUMENTS

## Estado del repositorio

- Rama actual: !`git branch --show-current`
- Cambios sin commit: !`git status --short`

## Pasos

1. **Leer antes de tocar nada.** `docs/decisiones.md` y `docs/plan.md` enteros; la fila del paso del encargo; y solo los documentos que esa fila y el encargo citen (`docs/funcionalidades.md`, `docs/ux.md`, `docs/stack.md`…). Si el encargo contradice una decisión cerrada, para y pregunta a Oscar antes de seguir.
2. **Rama.** Si hay cambios sin commit, para y pregunta. Si no, desde `main` al día (`git switch main`, `git pull`), crea la rama con el paso y un nombre corto: por ejemplo `c4-entrada`. Un encargo, una rama, un pull request.
3. **Trabajo.** Haz solo lo que pide el encargo. Primero las pruebas cuando el encargo cambie comportamiento. Las comprobaciones son las que el encargo enumera; si pide "solo estas", no añadas otras.
4. **Comprobaciones.** `npm test && npm run build` y `npm run lint`, sin errores. Si el cambio toca `src/`, mide el peso con el comando de `docs/stack.md` §4 y compáralo con el presupuesto de 100 kB con gzip (decisión 45). Copia las cifras tal como salen.
5. **Revisores.** Lanza en paralelo `revisor-codigo` y `revisor-seguridad`, y `revisor-accesibilidad` si el cambio toca `src/` o `index.html`. Corrige lo grave; lo que no corrijas, dilo en el pull request con el motivo. Si corriges algo, repite el paso 4.
6. **Documentos.** Actualiza la fila del paso en `docs/plan.md` (estado, qué se hizo, qué se comprobó y dónde) y registra en `docs/decisiones.md`, con fecha, lo que hayas decidido que no estuviera decidido, con su motivo. En español y sin guiones largos.
7. **Commits.** Mensajes en español que digan qué y por qué. Un commit que solo formatea va aparte.
8. **Pull request.** Pide permiso para `git push -u origin <rama>`. Si `gh` está instalado, crea el pull request con `gh pr create`; si no, da a Oscar el enlace `https://github.com/ocarballido/colorgods/compare/main...<rama>?expand=1` y el texto. El texto: qué se ha hecho, las comprobaciones con sus cifras, lo que dijeron los revisores y lo que queda pendiente. No afirmes nada que no hayas comprobado.
