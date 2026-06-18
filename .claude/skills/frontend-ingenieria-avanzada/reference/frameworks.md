# Frameworks Frontend (estado: mediados de 2026)

> **Verifica la versión actual en el changelog oficial antes de afirmarla.** Las versiones rotan en meses.

## Tabla de decisión rápida

| Si necesitas... | Elige | Por qué |
|---|---|---|
| App empresarial gigante, ecosistema enorme de terceros, equipo grande | **React 19** | Mayor ecosistema, RSC maduros, React Compiler quita la memoización manual |
| Reactividad pura y ligera, bundle mínimo, tiempos de interactividad bajos | **Svelte 5** | Compilador-primero, runas explícitas, runtime pequeño |
| Sitio de contenido (blog, marketing, docs), LCP mínimo, casi cero JS | **Astro** | Islas: HTML estático + interactividad solo donde hace falta |
| Arranque en milisegundos en sitios de pocas páginas | **Qwik** | Reanudabilidad: no hidrata, "resume" el estado serializado |
| Granularidad fina sin VDOM, satisfacción top | **SolidJS** | Señales fine-grained, sin Virtual DOM |
| Equipo ya en el ecosistema Vue | **Vue 3.5+** | Composition API, reactividad tipo señales |

---

## React 19 + React Compiler

- **React 19** es la versión vigente. **El React Compiler llegó a v1.0 en octubre de 2025.**
- El compilador **auto-memoiza en build**, así que `useMemo`, `useCallback` y `React.memo` suelen volverse **innecesarios** — pero **no los elimina literalmente**: hay *bail-outs* documentados (librerías de terceros, valores que cruzan fronteras de componente, efectos que dependen de estabilidad referencial). Los hooks de memo existentes quedan redundantes, no dañinos.
- **No digas "elimina `useMemo`/`useCallback`"**; di "normalmente vuelve innecesaria la memoización manual, con casos de bail-out documentados".
- React 19 también trajo la **Actions API**, el hook `use()` y **Server Components (RSC)** estables.
- **React 20 NO existe a mediados de 2026.** No lo inventes.
- Uso (State of JS 2025): React sigue siendo el más usado, **~83.6%**.
- Migración del compilador: instala el plugin Babel/SWC + el paquete runtime; verifica el badge "Memo ✨" en React DevTools; usa la directiva `'use no memo'` para optar fuera durante la migración; corre en modo report-only primero. `react-hooks/exhaustive-deps` sigue importando para `useEffect`.

## Svelte 5 (runas)

- Salió en octubre de 2024. Reemplaza el viejo `$:` por **runas**: `$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$state.raw`, `$derived.by`, `$effect.pre`.
- Reactividad por señales **explícita**, que funciona incluso en archivos `.svelte.ts` (extrae la lógica de estado fuera del componente).
- **Compilador-primero, sin Virtual DOM** — pero Svelte 5 **sí** trae un pequeño runtime de reactividad, así que el viejo discurso "runtime casi cero" de Svelte 4 ya no aplica al 100%.
- El `$:` ambiguo ahora se separa limpio: `$derived` (valores puros) vs `$effect` (efectos secundarios).
- Migración: `npx sv migrate svelte-5`.
- State of JS 2025: **91% de retención ("volvería a usar")**, la más alta de cualquier framework.

## Astro (islas)

- **Arquitectura de Islas**: hidratación parcial vía directivas `client:*` (`client:load`, `client:visible`, `client:idle`). Cero JS por defecto; las islas pueden alojar React, Svelte o Vue de forma agnóstica.
- **Astro 5.x** vigente. Cloudflare adquirió The Astro Technology Company (ene 2026); Astro sigue siendo MIT/open-source.
- State of JS 2025: **lidera satisfacción entre meta-frameworks, +39 puntos sobre Next.js.**
- Advertencia ("pantano de hidratación"): si el sitio crece hasta parecer una SPA rica e interdependiente, las islas se vuelven un laberinto — ahí conviene un framework SPA de verdad.

## Qwik (reanudabilidad)

- **Reanudabilidad (resumability)**: serializa el estado de ejecución del servidor (listeners, árbol de componentes, estado) dentro del HTML y lo "resume" en el cliente en lugar de hidratar → arranques en milisegundos.
- Crítica honesta: ecosistema más chico; brilla en sitios de contenido/pocas páginas. En dashboards muy interactivos de sesión larga, el costo de hidratación se amortiza y la ventaja se reduce. Algunos lo llaman "el C de la web": frío rendimiento a costa de abstracciones cognitivas pesadas para el ingeniero.

## Otros que conviene mencionar

- **SolidJS** — señales fine-grained, sin VDOM. State of JS 2025: mantiene la satisfacción más alta por quinto año.
- **Vue 3.5+** — Composition API, reactividad tipo señales.
- **Angular** — ya tiene **signals** estables.
- **Capa meta-framework** es donde está el movimiento: **Next.js ~59% de uso, pero su satisfacción tuvo la mayor caída, de 68% a 55%** (State of JS 2025). No asumas que "todos aman Next.js".
