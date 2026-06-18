# CSS Moderno de Vanguardia (estado: mediados de 2026)

> **Antes de prometer producción, verifica en caniuse.com y MDN.** Las versiones de abajo son punto de partida; el soporte se mueve. Envuelve todo en `@supports` con fallback usable.

## Índice
1. Animaciones dirigidas por scroll
2. `linear()` — easing de resorte/rebote
3. Anchor Positioning
4. View Transitions API
5. Masonry nativo (¡ojo, aún no estandarizado!)
6. `text-box-trim`
7. Funciones y mixins nativos (`@function`, `@mixin`)
8. `@scope`, container queries, `:has()`
9. Pseudo-clases de media
10. Plantilla de mejora progresiva

---

## 1. Animaciones dirigidas por scroll

Reemplazan el cálculo con `event listeners` de scroll en JS. Corren en el **hilo del compositor** → 60fps sin tocar el hilo principal. Dos líneas de tiempo:

- **`scroll()`** — progreso de la barra de scroll de un contenedor (0%→100%). Para parallax, barras de progreso de lectura.
- **`view()`** — progreso de un elemento al cruzar el viewport. Para "aparecer al entrar", reveal.

Control fino con `animation-range` y sus fases: `cover` (todo el cruce), `contain` (solo mientras está totalmente dentro), `entry` (umbral de entrada), `exit` (umbral de salida).

```css
@keyframes aparecer {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}

.tarjeta {
  animation: aparecer linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
```

**Líneas de tiempo nombradas** y `timeline-scope` permiten que un elemento maestro dispare animaciones en elementos hermanos/anidados sin JS:

```css
.contenedor { scroll-timeline-name: --mi-scroll; timeline-scope: --mi-scroll; }
.barra { animation: crecer linear; animation-timeline: --mi-scroll; }
```

**Trampa crítica:** el shorthand `animation` resetea `animation-timeline` a `auto`. Declara `animation-timeline` **después** del shorthand, o usa selectores con suficiente especificidad. Para compatibilidad con Firefox, pon `animation-duration: 1ms` (ignora la duración temporal cuando hay timeline, pero algunos motores la exigen presente).

**Soporte (verificar):** Chrome/Edge 115+, Safari 26, Opera 101+. **Firefox: implementado pero detrás de flag en estable** (`layout.css.scroll-driven-animations.enabled`), activo por defecto en Nightly. ~85% en caniuse. Detección: `@supports (animation-timeline: scroll())`. La propiedad más nueva `animation-trigger` es solo Chrome/Edge a mayo 2026.

---

## 2. `linear()` — easing de resorte y rebote

Función de temporizado que interpola entre muchos puntos, emulando física de resortes/rebote que las curvas Bézier no pueden. Genera la curva con una herramienta (p. ej. el generador de Kevin Grajeda / linear-easing-generator) y pégala:

```css
.boton { transition: transform .5s linear(0, 0.22, 0.86, 1.05, 0.98, 1); }
```

**Advertencia de diseño:** `linear()` está **precalculado**, no tiene inercia real. Si la animación se interrumpe a medio camino, el motor aplica un factor de acortamiento inverso que puede verse robótico. Para interrupciones frecuentes (drag, gestos), una animación basada en física real (Web Animations API con resortes, o Motion/Framer) se siente mejor. Soporte amplio (Baseline).

---

## 3. Anchor Positioning

Un elemento (tooltip, menú, popover) "persigue" a su ancla sin JS, y el navegador recalcula ante colisiones de borde. Producción-listo en 2026.

```css
.disparador { anchor-name: --mi-ancla; }
.tooltip {
  position: absolute;
  position-anchor: --mi-ancla;
  top: anchor(bottom);
  justify-self: anchor-center;
  position-try-fallbacks: flip-block, flip-inline; /* si no cabe, voltea */
}
```

Combina con la **Popover API** (`popover` + `popovertarget`) para el menú; para *hover* tooltips está emergiendo la Interest Invoker API (`interesttarget`, `interest-delay`).

**Soporte (verificar):** Chrome/Edge 125+, Safari 26, Firefox 147+, Opera 111+, Samsung Internet 27+.

---

## 4. View Transitions API

Morphs cinematográficos entre estados/páginas a velocidad de hardware, sin parpadeo.

**Mismo documento (SPA/cambios de estado)** — Baseline "Newly available" (oct 2025): Chrome/Edge 111+, Safari 18+, Firefox 144+.

```js
document.startViewTransition(() => actualizarDOM());
```
```css
.heroe { view-transition-name: heroe; } /* el mismo nombre en ambos estados = morph */
```

**Entre documentos (MPA, navegación real)** — Chrome/Edge 126+, Safari 18.2+; **Firefox aún no**.
```css
@view-transition { navigation: auto; }
```

Funciones avanzadas: `view-transition-name: match-element` (auto-nombrado), `view-transition-class`, tipos de transición, pseudo-clase `:active-view-transition`, y el árbol de pseudo-elementos `::view-transition-group/-image-pair/-old/-new`. Para reveal circular: usa `transition.ready.then(...)` + Web Animations API sobre `::view-transition-new(root)`.

**Siempre** respeta `prefers-reduced-motion` (desactiva o reduce el morph).

---

## 5. Masonry nativo — ¡todavía NO estandarizado!

**Cuidado:** a mediados de 2026 sigue en debate de tres bandos y **no es seguro para producción**:
- Chrome propuso `display: masonry`.
- Firefox propuso `grid-template-rows: masonry`.
- Apple/WebKit propuso `display: grid-lanes` (el CSS WG se inclinó hacia integrarlo en Grid).

Ships detrás de flags y difiere por motor. **No prometas `masonry-auto-flow` como estable.** Hoy, para mosaicos asimétricos en producción, usa CSS columns (limitado) o una solución JS ligera, y vigila el changelog del CSS WG. Verifica antes de usar.

---

## 6. `text-box-trim` / `text-box-edge`

Recorta el espacio muerto vertical (half-leading) del recuadro de la fuente para alinear cajas a precisión de subpíxel, igual que en Figma.

```css
h1 { text-box: trim-both cap alphabetic; } /* shorthand */
```

No reemplaza `line-height`; solo recorta el leading sobrante. **Soporte:** Chrome/Edge 133+, Safari 18.2+; **Firefox aún no** (degrada a un poco de leading extra, inofensivo).

---

## 7. Funciones y mixins nativos en CSS

El módulo **CSS Custom Functions and Mixins** (`@function`, `@mixin`, `@apply`) busca reducir la dependencia de Sass/Less. **Experimental/temprano** — `@function` aterrizando primero en Chrome. **No migres aún** de Sass por completo; útil saber que viene. Verifica soporte antes de usar en producción.

```css
@function --doble(--x) { result: calc(var(--x) * 2); }
.caja { padding: --doble(8px); }
```

---

## 8. `@scope`, container queries, `:has()`

- **`:has()`** — selector de padre, Baseline amplio (Chromium + Safari + Firefox). Permite estilar según hijos/estado: `.tarjeta:has(img) { ... }`.
- **Container queries** — estilar por el tamaño del contenedor, no del viewport. Baseline. `@container (min-width: 400px) { ... }`. La verdadera base del componente responsivo moderno.
- **`@scope`** — encapsula estilos a un subárbol sin metodologías tipo BEM. Producción en Chromium/Safari; **Firefox rezagado** — verifica.

---

## 9. Pseudo-clases de media

`:playing` / `:paused` (Selectors L4, en WebKit) y las más nuevas `:buffering` / `:stalled` permiten reaccionar al estado del buffer de video sin sincronizar el DOM. **Soporte Chromium/Firefox limitado a mediados de 2026 — verifica en caniuse antes de depender de ellas.**

---

## 10. Plantilla de mejora progresiva

El patrón de oro: el estado final/usable va en CSS plano; el realce va dentro de `@supports`, y todo movimiento tiene salida por `prefers-reduced-motion`.

```css
/* 1. Base: usable sin la técnica moderna */
.reveal { opacity: 1; }

/* 2. Realce solo si hay soporte */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: aparecer linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 40%;
    }
  }
}
```

**Rendimiento:** anima solo `transform` y `opacity` (van en el compositor). Nunca animes `width`, `height`, `top`, `margin` → fuerzan layout/reflow y tiran los fps.
