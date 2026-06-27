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

- **Limpieza de CTAs + móvil con proporción del portal + hero interactivo**
  - Limpieza (menos botones "desesperados"): se quitan el badge y los 2 botones
    del hero, la barra de datos inferior (trust bar), TODA la sección de
    testimonios, el botón redundante del método y el botón extra bajo paquetes;
    el CTA final se reduce a un solo botón de WhatsApp. Los planes se contratan
    desde el CTA de cada tarjeta + el FAB de WhatsApp.
  - Móvil = proporción del portal: la landing se envuelve en #home-canvas y se
    escala con zoom (DESIGN 412) SOLO en móvil (_fitHomeCanvas), igual que el
    portal pero sobre un elemento interno (no rompe iOS). En escritorio queda
    responsive.
  - Hero: carrusel con ángulo 3D más pronunciado. Al tocar la foto activa, la
    explicación aparece SOBRE la imagen con efecto de agua (clip-path + wash);
    se oculta al volver a tocar o al cambiar de foto.
  - sw.js: cache v34.

- **Hero a pantalla completa + "lo que nadie te cuenta" en carrusel 3D**
  - Hero: vuelve a PANTALLA COMPLETA (100svh, usa svh para que no haya "brinco"
    con la barra del navegador) con marco ligero, saludo arriba ("Bienvenido a
    Pool Balance"), titular centrado y PARALLAX al desplazar (la foto se mueve
    más lento y el texto se desvanece; rAF para que vaya suave). Crossfade entre
    fotos, flechas, dots, swipe y autoplay. El hero va fuera del #home-canvas
    (full-bleed); el resto del contenido conserva la proporción del portal.
  - "El problema que nadie te cuenta": las 4 tarjetas pasan de grid a un
    carrusel 3D coverflow (ProblemCarousel), estilo del video de referencia
    (tarjetas que rotan en 3D, vecinas asomando).
  - sw.js: cache v35.

- **Fix: el portal no mostraba las fotos del servicio (carrusel de la bitácora)**
  - Causa probable: las fotos guardadas en Firestore no estaban bajo el campo
    exacto `fotos` (o venían en otro formato), así que el detalle mostraba la
    foto de relleno.
  - `bitacora-detalle.js`: nuevo `_collectFotos()` que reúne las fotos tolerando
    varios nombres de campo (fotos/photos/imagenes/fotos_servicio/evidencias/
    galeria/images…) y estructuras (array, mapa-objeto o string), varias claves
    de URL (url/downloadURL/src/link/href/uri/secure_url/path) y normaliza
    enlaces de Google Drive ("view" → directo de imagen). Se usa en el hero de
    fotos y en el visor a pantalla completa.
  - `portal.js`: el conteo de fotos del dashboard usa el mismo colector.
  - Diagnóstico: si no se detectan fotos, se loguea en consola la lista de
    campos de la bitácora para identificar nombres no contemplados.
  - sw.js: cache v36.

- **Fotos del servicio (v2): escaneo profundo + hallazgo del historial**
  - Revisión del historial: `firestore.js`, `_loadBitacoras` y `_fotoToUrl`
    están IDÉNTICOS a la versión que servía → el código de lectura NO cambió con
    los cambios de la landing. Conclusión: las fotos de este cliente quedaron en
    un campo/estructura distinta a `fotos`.
  - `bitacora-detalle.js`: `_collectFotos()` ahora, si no encuentra los nombres
    conocidos, ESCANEA todos los campos de la bitácora buscando URLs de imagen
    (Firebase Storage, Drive, googleusercontent, CDNs o con extensión de
    imagen), excluyendo el PDF. Encuentra las fotos sin importar el nombre.
  - `sw.js`: cache v37.

- **Fotos del servicio (v3): las fotos están en Storage, no en el doc**
  - Hallazgo (con capturas de Firebase Storage): las fotos viven en
    `clientes/{cliente}/albercas/{alberca}/bitacoras/{bitacora}/foto-N.jpg`, pero
    el documento de Firestore de la bitácora NO guarda las URLs. Por eso el
    portal no tenía nada que renderizar (mostraba la de relleno).
  - `bitacora-detalle.js`: `_hydrateFotosFromStorage()` — si el doc no trae URLs,
    lista esa carpeta de Storage (Firebase Storage SDK: ref/listAll/
    getDownloadURL), ordena foto-1, foto-2… y re-renderiza el detalle con las
    fotos reales. Se dispara en PostRender.bitacora.
  - sw.js: cache v38.

- **Visor de fotos de la bitácora → PANTALLA COMPLETA real + CLAUDE.md**
  - El visor abría a 94vw/86dvh con padding (se veía "un poco más grande", no a
    pantalla completa). Se ajustó `css/components.css` (`.photo-modal`,
    `.gallery-stage`, `#gallery-modal-img`) a 100vw/100dvh, sin padding, fondo
    negro y `object-fit: contain` → la foto abre cubriendo TODA la pantalla.
  - Se creó `CLAUDE.md` con las reglas del proyecto: el PORTAL DEL CLIENTE está
    terminado y NO se toca sin permiso; visor a pantalla completa; fotos en
    Storage; no romper la carga; subir cache en cada cambio.
  - sw.js: cache v39.
  - PENDIENTE (a confirmar con el dueño): si además quiere restaurar el LAYOUT
    del carrusel de fotos del reporte a la versión original (foto grande + tira
    3D de todas las fotos) en vez del coverflow actual.

- **Restaurar el carrusel de fotos ORIGINAL del reporte (foto grande + tira 3D)**
  - A petición del dueño: el carrusel de fotos del reporte vuelve a su forma
    original del portal terminado: una FOTO GRANDE arriba (toca → pantalla
    completa) + una GALERÍA 3D con TODAS las fotos debajo (tarjeta central +
    vecinas anguladas, flechas y dots).
  - `bitacora-detalle.js`: `_renderPhotoHero` reescrito a foto grande + tira 3D
    (reusa el CSS `gallery-3d-*` que seguía intacto). Se restauraron en
    `BitacoraUI` los métodos `slide3D / goTo3DSlide / handleCardClick /
    update3DGallery / init3DSwipe` y `_current3DIndex`. PostRender inicializa la
    galería 3D; las flechas del teclado la controlan. El coverflow `phc` queda
    sin uso. El visor sigue a pantalla completa.
  - sw.js: cache v40.

- **Rediseño del carrusel de fotos del reporte (pila 3D flotante) + Agent Skills**
  - A petición explícita del dueño (autoriza tocar el portal para esto):
    - **Se quitó la FOTO FIJA** que iba arriba del carrusel en el reporte de
      bitácora (`_renderPhotoHero` ya no renderiza una foto grande estática +
      tira; ahora hay un solo componente de galería).
    - **Nuevo estilo 3D propio (pila / "deck" flotante)**, distinto del coverflow
      que usan los otros carruseles (`dcar`, `pkgcar`, `pcar`): la foto frontal
      va grande y levantada, y las vecinas se **apilan detrás y abajo** con giro
      hacia el centro (`rotateY`) + leve inclinación de plano (`rotateZ`),
      escala y opacidad decrecientes → más profundidad y sin verse repetitivo.
    - **Tamaño correcto:** contenedor 340px con `perspective: 1500px` y
      `overflow: visible` para que respiren sombras y vecinas; tarjeta 236×296.
    - **Sombras en capas** (3 niveles) + halo de marca en la activa, velo de
      cristal/brillo, contador `N/Total` y badge de "Ampliar".
  - Casos: 0 fotos → marco neutro "Sin fotos"; 1 foto → marco grande tappable a
    pantalla completa; ≥2 fotos → pila 3D. El visor sigue a **pantalla completa**
    (no se tocó `.photo-modal`).
  - Archivos: `js/views/bitacora-detalle.js` (`_renderPhotoHero` y
    `update3DGallery` reescritos; el engine `slide3D/goTo3DSlide/handleCardClick/
    init3DSwipe` se conserva), `css/components.css` (bloque `gallery-3d-*`
    rediseñado; se agregan `.photo-deck-*`; se quitan `.single-photo-container` y
    `.single-thumb` que ya no se usaban).
  - **Agent Skills:** se agregaron en `.claude/skills/` los skills
    `frontend-ingenieria-avanzada`, `pool-balance-web-premium` y
    `pool-balance-aqua` (con sus `reference/`) para que estén disponibles en
    futuras sesiones de Claude Code.
  - sw.js: cache v41.
