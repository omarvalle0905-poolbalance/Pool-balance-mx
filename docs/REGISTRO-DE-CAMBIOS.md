# Registro de cambios y arquitectura — Pool Balance

Este archivo es la **bitácora oficial del proyecto**. Aquí se documenta:
1. **Qué hace cada archivo** del repositorio (mapa de arquitectura).
2. **Todos los cambios** que se van haciendo, en orden cronológico.

> Regla de trabajo: cada vez que se modifica el código, se deja registro aquí
> (qué archivo, qué se cambió y por qué). Así queda trazable todo el historial.

---

## 1. Mapa de archivos (qué hace cada uno)

### Raíz
- **`index.html`** — Documento principal de la PWA. Carga fuentes (Bricolage Grotesque para la app; Bodoni Moda + Jost para la landing), Tailwind CDN, FontAwesome y los CSS/JS propios. Contiene el loader de inicio, el `brand-topbar` (móvil), el `sidebar` (escritorio), el `bottom-nav` (móvil) y el `#view-container` donde se montan las vistas.
- **`manifest.json`** — Manifiesto PWA (nombre, iconos, colores, modo standalone).
- **`sw.js`** — Service Worker. `CACHE_NAME` se incrementa en cada cambio (vNN) para refrescar el caché. Network-First para JS/CSS/JSON, Cache-First para imágenes.
- **`vercel.json`** — Configuración de despliegue en Vercel.
- **`diagnostico.html`** — Página suelta de diagnóstico (no parte del SPA).

### Datos
- **`data/config.js`** — `APP_CONFIG`: toda la configuración y contenido del sitio
  (empresa, landing/home, paquetes/servicios, textos del portal, datos demo,
  `features.portalOnly`). Es la única fuente de contenido editable sin tocar lógica.

### Estilos (`css/`)
- **`design-system.css`** — Tokens base (colores de marca, radios, sombras, tipografía, variables CSS).
- **`layout.css`** — Estructura: sidebar, bottom-nav, brand-topbar, main-content, modo `portal-only`/`portal-active`, fondo global del portal.
- **`components.css`** — Componentes reutilizables: botones, tarjetas, tabla comparativa, carrusel hero, carruseles 3D (coverflow de paquetes/bitácoras), tubos de ensayo, lightbox, estilos del portal y del reporte de bitácora.
- **`home-premium.css`** — Tema visual EXCLUSIVO de la landing (`#view-home`): estilo "Liquid Glass / Aurora" (fondo marino, blobs animados, glassmorphism, tipografía serif). Scoped para no afectar el portal.

### Lógica (`js/`)
- **`app.js`** — Arranque: inicializa Firebase, registra rutas en el Router según `portalOnly`, monta navegación, oculta el loader, registra el Service Worker.
- **`router.js`** — Router SPA hash-based. Renderiza vistas en `#view-container`, transiciones, hooks `PostRender[vista]`, evento `viewRendered`, clase `portal-active`.
- **`components/nav.js`** — Navegación: marca el item activo, maneja clicks de `data-view`.
- **`firebase/firebase.js`** — Inicializa Firebase (proyecto pool-balance-mx) y expone `window.FB` / `window.FS`. Cae a modo demo si falla.
- **`firebase/auth.js`** — `AuthService`: login con ID+PIN (email sintético), modo demo, timeout anti-cuelgue.
- **`firebase/firestore.js`** — `FirestoreService`: perfil de cliente y suscripción en vivo a bitácoras (con fallback mock).
- **`firebase/pdf.js`** — Generación de PDF del reporte.
- **`views/home.js`** — Landing pública: hero/carrusel, video, problema, método, comparativa, antes/después, paquetes (coverflow 3D), testimonios, FAQ, CTA. Incluye `PackageCarousel` y los inicializadores (`_initCarousel`, `_initReveal`, `_initFaq`, `_initScrollLinks`).
- **`views/servicios.js`** — Vista de servicios/paquetes (ya NO está en el menú; los planes viven en la landing).
- **`views/biblioteca.js`** — Vista de biblioteca de audios (fuera del menú por ahora; se moverá al portal del cliente).
- **`views/portal.js`** — Portal del cliente: login, restauración de sesión, dashboard, carrusel 3D de bitácoras, tarjetas de datos. Incluye `PortalAuth`, `PortalState`, `PortalCarousel`.
- **`views/bitacora-detalle.js`** — Reporte detallado de una bitácora: hero de fotos 3D, tubos de ensayo, tarjetas swipeables, CTAs PDF/WhatsApp.

### Herramientas (`tools/`)
- Scripts de simulación/verificación en Node (no se cargan en el navegador).

### Skills (`.claude/skills/`)
- **`ui-ux-pro-max`** — Inteligencia de diseño UI/UX (estilos, paletas, tipografía, guías UX).
- **`frontend-ingenieria-avanzada`** — Conocimiento de ingeniería frontend avanzada (CSS moderno, frameworks, 3D/WebGPU, WASM, MCP).

---

## 2. Registro cronológico de cambios

### Sesión actual (rama `claude/vigilant-franklin-j1df38`)

- **Fix tamaño de render del portal + paquetes en carrusel 3D** (`92cb159`)
  Se topó el zoom del portal y se centró; los paquetes pasaron a coverflow 3D.

- **Revertir tamaño del portal + instalar skill UI/UX** (`154945e`)
  Se revirtió el tope de zoom (rompía la proporción nativa) y se instaló `ui-ux-pro-max`.

- **Igualar proporción del portal en la landing (solo móvil)** (`1f38a93`) → revertido.

- **Fix: la página no abría** (`f3e8dfd`)
  Se quitó el `zoom` sobre `#view-container` (rompía iOS al combinarse con el transform animado del router).

- **Fix: el portal se quedaba "Cargando…"** (`3a5fcc3`)
  Timeouts en `AuthService.login` (10s) y `restoreSession` (8s).

- **Rediseño total de la landing — "Liquid Glass / Aurora"** (`994eb39`)
  Reescritura visual completa de `#view-home` con tema premium (fondo marino,
  blobs de aurora, glassmorphism, Bodoni Moda + Jost). Scoped a la landing.

- **Portal a prueba de cuelgues + limpieza de landing** (`9fe7173`)
  - Portal: red de seguridad dura de 6s + dashboard inmediato + bitácoras en
    segundo plano + try/catch.
  - Hero/carrusel: se quitó el texto encimado (captions, stats, audio) y la
    fila de stats; quedó imagen + etiqueta + titular + CTAs.
  - FAQ: reescrito con delegación + guard (antes ataba 2 listeners y no abría).
  - Se quitó el parallax JS del hero (causaba un "brinco" al scrollear).
  - Nav: solo Inicio + Mi Portal (se quitaron Servicios y Biblioteca).
  - Video: colocado debajo del carrusel; aparece al definir `promoVideo.url`.

- **Instalación de skill + registro de cambios**
  - Se instaló la skill `frontend-ingenieria-avanzada`.
  - Se creó este archivo `docs/REGISTRO-DE-CAMBIOS.md`.

- **Nuevo carrusel del hero (tarjeta editorial) + barras en vidrio oscuro**
  - `home.js` / `home-premium.css`: el hero deja de ser a pantalla completa.
    Ahora es titular + CTAs arriba y un carrusel de **fotos enmarcadas**
    (tarjeta 4:3 redondeada, sin recorte agresivo) que se desliza con
    **scroll-snap nativo**. Nuevo `_initHeroCarousel` (flechas, dots y
    autoplay sincronizados); se retiró el viejo `_initCarousel` a pantalla
    completa y su lógica de audio.
  - `layout.css`: `brand-topbar` (antes azul) y `bottom-nav` (antes blanco)
    pasan a **vidrio oscuro** translúcido para combinar con el tema marino;
    los botones del bottom-nav son más grandes (íconos 1.5rem).
  - `index.html`: `theme-color` del navegador a marino profundo `#07121d`.
  - `sw.js`: cache v31.

- **Hero a carrusel 3D coverflow + comparativa legible + letra más grande**
  - `home.js` / `home-premium.css`: el hero pasa de scroll-snap a **carrusel 3D
    coverflow** de fotos (tarjetas anguladas, vecinas asomando) — `HeroCarousel`
    con flechas, dots, swipe y autoplay. Titular del hero **más grande**
    (clamp 2.3–3.4rem).
  - Comparativa "¿Por qué Pool Balance?": se elimina la `<table>` a rayas
    (filas blancas con texto invisible / estilos encimados) y se rediseña como
    **tarjetas de vidrio** legibles (`.cmp-card`), mobile-first.
  - `sw.js`: cache v32.

- **Ondas de agua en las tarjetas (efecto ligero, sin WebGL)**
  - Decisión: en vez de un fondo WebGL a pantalla completa (pesado en batería
    móvil), se eligió el efecto **solo en tarjetas**. Al tocar/clic una tarjeta
    brota una onda concéntrica tipo agua desde el punto tocado.
  - `home.js`: `_initCardRipples()` (delegado, una sola vez, respeta
    prefers-reduced-motion). `home-premium.css`: `.hp-ripple-wave` + keyframes.
  - Aplica a tarjetas de problema, comparativa, método, testimonios, paquetes,
    antes/después y fotos del hero.
  - `sw.js`: cache v33.
