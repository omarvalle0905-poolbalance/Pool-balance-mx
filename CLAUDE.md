# CLAUDE.md — Guía y reglas del proyecto Pool Balance

PWA en JS vanilla (sin build) para Pool Balance (gestoría de albercas, Veracruz).
Se sirve en Vercel / poolbalance.com.mx. Firebase (Auth + Firestore + Storage),
con fallback a modo demo.

> **Bitácora de cambios:** el detalle de CADA cambio (qué archivo, qué y por qué)
> se documenta en **`docs/REGISTRO-DE-CAMBIOS.md`** y también ahí está el **mapa de
> arquitectura** (qué hace cada archivo). Mantener ese archivo SIEMPRE actualizado.

---

## ⛔ REGLAS CRÍTICAS (leer antes de tocar nada)

1. **El PORTAL DEL CLIENTE está TERMINADO y APROBADO. No se modifica sin permiso
   explícito del dueño.** Esto incluye:
   - `js/views/portal.js` (login, dashboard, carrusel de bitácoras)
   - `js/views/bitacora-detalle.js` (reporte: carrusel de fotos, visor a pantalla
     completa, tubos, tarjetas, PDF/WhatsApp)
   - Los estilos del portal/reporte en `css/components.css`
   Si una tarea es sobre la **landing** (`#view-home`), NO tocar el portal.
   Cualquier cambio al portal debe pedirse y confirmarse aparte.

2. **Visor de fotos de la bitácora = PANTALLA COMPLETA REAL.** Al tocar una foto,
   debe abrirse cubriendo toda la pantalla (`100vw`/`100dvh`, sin marco/padding,
   fondo negro, `object-fit: contain`). Reglas en `css/components.css`
   (`.photo-modal`, `.photo-modal .gallery-stage`, `#gallery-modal-img`).

3. **Fotos del servicio: viven en Firebase STORAGE**, no (necesariamente) en el
   documento de Firestore. Ruta:
   `clientes/{clienteId}/albercas/{albercaId}/bitacoras/{bitacoraId}/foto-N.jpg`
   - El portal primero busca URLs en el documento (`_collectFotos`, tolerante a
     varios nombres de campo) y, si no hay, **lista esa carpeta de Storage**
     (`_hydrateFotosFromStorage` en `bitacora-detalle.js`).
   - **Mejora de raíz pendiente:** que el Apps Script/pipeline escriba las URLs en
     el documento (campo `fotos: [url, …]`) para no depender del listado.
   - Requiere reglas de Storage que permitan lectura al cliente autenticado.

4. **No romper la carga (la app debe ABRIR siempre).** Aprendizajes:
   - NO aplicar `zoom`/`transform` sobre `#view-container` (lo anima el router →
     en iOS deja la pantalla en blanco). Si se necesita escalar, hacerlo sobre un
     elemento **interno** (como `#home-canvas` o `.fit-canvas`).
   - El portal nunca debe quedarse en "Cargando…": `AuthService.login` y
     `restoreSession` tienen timeouts + red de seguridad.

5. **PWA / caché:** en CADA cambio subir `CACHE_NAME` en `sw.js` (vNN→vNN+1) para
   forzar refresco. El usuario debe cerrar y reabrir la app para tomar la versión.

6. **Tema:** la landing (`#view-home`) usa el tema "Liquid Glass / Aurora"
   (oscuro, glassmorphism, Bodoni Moda + Jost) y está **scoped** a `#view-home`
   para no afectar el portal. El portal tiene su propio look (no mezclar).

---

## Estructura rápida

- `data/config.js` — todo el contenido editable (`APP_CONFIG`).
- `js/views/home.js` — landing pública.
- `js/views/portal.js` + `js/views/bitacora-detalle.js` — **portal protegido**.
- `js/firebase/*` — init, auth, firestore, pdf.
- `css/` — `design-system` (tokens), `layout`, `components`, `home-premium` (landing).
- `docs/REGISTRO-DE-CAMBIOS.md` — bitácora + arquitectura detallada.

## Cómo probar localmente

```bash
python3 -m http.server 8099      # servir
# abrir http://localhost:8099/index.html
```
Cliente demo: `PB-2024-0042` / `123456` (funciona sin Firebase real).

## Git / despliegue

- Trabajar en la rama indicada; commits descriptivos; subir `CACHE_NAME`.
- Documentar cada cambio en `docs/REGISTRO-DE-CAMBIOS.md`.
