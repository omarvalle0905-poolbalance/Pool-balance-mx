# Técnicas Modernas 2026 — Patrones de Código

Efectos premium sin motores pesados. Todo esto es nativo del navegador y corre fuera del hilo principal (compositor), así que se mantiene fluido aunque el JS esté ocupado. Verifica el soporte actual en MDN o caniuse antes de apoyarte en una técnica crítica — el soporte cambia y este archivo no se actualiza solo.

## 1. Animación dirigida por scroll (la base de todo)

Dos tipos de timeline, para dos propósitos distintos:

- **`scroll()`** — progreso ligado a la posición de scroll de un contenedor. Para barras de progreso, parallax de fondo, indicadores de lectura.
- **`view()`** — disparado por la visibilidad del elemento en el viewport. Es el estándar para "reveal al hacer scroll" y entradas/salidas sofisticadas.

```css
/* Reveal al entrar al viewport */
@keyframes reveal {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
.seccion {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 60%; /* empieza al asomar, termina al 60% dentro */
}

/* Parallax ligado al contenedor raíz */
.fondo-agua {
  animation: drift linear both;
  animation-timeline: scroll(root block);
}
```

Para apilar transformaciones (ej. rotar y desplazar a la vez sin que una pise a la otra), usa `animation-composition: accumulate` o `add`.

Timelines con nombre, para que un elemento reaccione al scroll de OTRO:

```css
.contenedor { scroll-timeline: --t block; }
.elemento  { animation: x linear both; animation-timeline: --t; }
```

## 2. 3D sin WebGL (tu "deslizamiento 3D")

CSS 3D + scroll timeline da el efecto coverflow / pop con perspectiva sin un solo polígono de three.js:

```css
.galeria {
  perspective: 1200px;            /* profundidad de la escena */
  transform-style: preserve-3d;
}
@keyframes coverflow {
  from { transform: rotateY(35deg) translateZ(-120px); opacity: .4; }
  to   { transform: rotateY(0)     translateZ(0);      opacity: 1; }
}
.galeria .card {
  animation: coverflow linear both;
  animation-timeline: view(inline); /* eje horizontal para un carrusel */
}
```

Regla: si CSS 3D logra el efecto, no metas un motor pesado. three.js/WebGL solo cuando de verdad necesites geometría real, físicas o muchos objetos — para una alberca/agua estilizada de marketing, casi nunca hace falta, y AQUA puede generar lo molecular como video aparte.

## 3. View Transitions (morphs cinematográficos)

Para que el hero se transforme en header pegado al hacer scroll (patrón tipo Spotify), o transiciones suaves entre páginas de un sitio multipágina. Asigna `view-transition-name` a los elementos que deben "morfear" entre estados y el navegador interpola la diferencia. Útil para el portal: la tarjeta de cliente que se expande, la transición entre la landing y el login.

## 4. Scroll-triggered (animation-trigger) — con cuidado

`animation-trigger` (Chrome 145+, 2026) reemplaza a IntersectionObserver de forma declarativa: dispara una animación normal por duración cuando cruzas un offset de scroll. Pero al momento de escribir esto solo está en Chrome/Edge — úsalo solo como mejora progresiva, nunca como dependencia crítica.

## 5. Mejora progresiva y accesibilidad (no opcional)

`animation-timeline` simplemente se ignora en navegadores que no lo entienden, así que el fallback es directo: deja el estado por defecto como el estado final visible, y mete la animación dentro de `@supports`.

```css
/* Por defecto: visible y usable, pase lo que pase */
.fade-seccion { opacity: 1; transform: none; }

@supports (animation-timeline: view()) {
  .fade-seccion {
    animation: reveal linear both;
    animation-timeline: view();
  }
}

/* Respeta siempre la preferencia de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .fade-seccion { animation: none; opacity: 1; transform: none; }
}
```

Gotcha de especificidad: el shorthand `animation` setea `animation-timeline: auto`, así que si declaras el timeline aparte, usa un selector con suficiente peso para que no te lo pise.

## 6. Rendimiento

Anima solo `transform` y `opacity` — son las que el compositor maneja sin recalcular layout. Animar `width`, `height`, `top`, `margin` provoca jank. La ventaja de todo lo anterior es justo que el trabajo se va al hilo del compositor, no al principal, así que el sitio se siente fluido incluso bajo carga.

## Dónde verificar soporte en vivo (capa de datos)

MDN (`developer.mozilla.org`) y caniuse para el estado actual de cada feature; el sitio `scroll-driven-animations.style` tiene demos CSS vs JS lado a lado y un debugger para DevTools. Si Omar pide "lo último en tendencias de diseño web", haz una búsqueda fresca en ese momento — no asumas que esta lista sigue siendo la frontera.
