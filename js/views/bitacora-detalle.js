/**
 * ============================================================
 *  POOL BALANCE — VISTA: BITÁCORA DETALLADA
 *  El "Traductor Visual" — convierte números crudos en un
 *  dashboard didáctico que el cliente entiende sin ser técnico.
 *
 *  Consume: objeto bitácora de Firestore (via FirestoreService)
 *
 *  v1.0.1 - Fix: soporte para fotos como objeto {url,path,momento,timestamp}
 *  v1.1.0 - Surgery: Premium Dark Mode theme, custom SVGs & 2-column mobile grid
 * ============================================================
 */

// ─────────────────────────────────────────
//  CONFIGURACIÓN DE PARÁMETROS
//  Define rangos óptimos, unidades y explicaciones didácticas
// ─────────────────────────────────────────

const PARAMETROS = {
  ph: {
    label:    'pH del Agua',
    unidad:   '',
    min:      0,
    max:      14,
    optMin:   7.2,
    optMax:   7.6,
    idealMin: 7.3,
    idealMax: 7.5,
    icon:     'fa-flask',
    color:    '#6FB8C6',
    decimales: 1,
    explicacion: (val) => {
      if (val < 7.0)  return { emoji: '🚨', texto: 'Tu pH está bajo y el agua se vuelve ácida: puede irritar ojos y piel y desgastar superficies y equipos. Ya lo corregimos para devolverlo a su punto.' };
      if (val < 7.2)  return { emoji: '🔶', texto: 'Tu pH va un poco por debajo del ideal. Lo dejamos ajustado para que el agua quede suave y el cloro rinda mejor.' };
      if (val <= 7.6) return { emoji: '✅', texto: 'Tu pH está justo en su punto. El agua queda suave para la piel y los ojos, y el cloro trabaja con toda su eficiencia.' };
      if (val <= 7.8) return { emoji: '🔶', texto: 'Tu pH va ligeramente alto. Lo ajustamos para que el cloro no pierda fuerza y el agua se mantenga cristalina.' };
      return               { emoji: '⚠️', texto: 'Tu pH está alto. A este nivel el cloro rinde poco y puede aparecer turbidez o sarro. Ya aplicamos la corrección.' };
    },
  },

  cloro_libre: {
    label:    'Cloro Libre',
    unidad:   'ppm',
    min:      0,
    max:      10,
    optMin:   1.0,
    optMax:   3.0,
    idealMin: 1.5,
    idealMax: 2.5,
    icon:     'fa-shield-halved',
    color:    '#2D9E6B',
    decimales: 1,
    explicacion: (val) => {
      if (val < 0.5)  return { emoji: '🚨', texto: 'El desinfectante está muy bajo y el agua queda desprotegida frente a bacterias y algas. Reforzamos el cloro para dejarla segura.' };
      if (val < 1.0)  return { emoji: '🔶', texto: 'El cloro va un poco bajo. Lo reforzamos para mantener el agua protegida hasta la próxima visita.' };
      if (val <= 3.0) return { emoji: '✅', texto: 'Tienes el nivel de desinfectante ideal: el agua está protegida y es completamente segura para nadar.' };
      if (val <= 5.0) return { emoji: '🔶', texto: 'El cloro está en la parte alta. Es seguro; con el sol y el uso normal bajará solo a su rango habitual.' };
      return               { emoji: '🔶', texto: 'El cloro está elevado. Si fue parte de un tratamiento, es temporal y a propósito; en cuanto baje, el agua queda lista.' };
    },
  },

  cloro_combinado: {
    label:    'Cloro Combinado',
    unidad:   'ppm',
    min:      0,
    max:      3,
    optMin:   0,
    optMax:   0.3,
    idealMin: 0,
    idealMax: 0.2,
    icon:     'fa-biohazard',
    color:    '#E8A838',
    decimales: 2,
    invertido: true, // menor = mejor
    explicacion: (val) => {
      if (val <= 0.2) return { emoji: '✅', texto: 'El cloro "ya gastado" (el que huele fuerte e irrita los ojos) está en su mínimo. Por eso el agua se siente fresca y sin olor.' };
      if (val <= 0.5) return { emoji: '🔶', texto: 'Aparecieron algunas cloraminas, que son el origen del olor a cloro. Aplicamos un tratamiento para eliminarlas.' };
      return               { emoji: '⚠️', texto: 'Hay cloraminas elevadas: son las que provocan el olor fuerte y la irritación en los ojos. Realizamos un superchoque para limpiarlas.' };
    },
  },

  alcalinidad: {
    label:    'Alcalinidad Total',
    unidad:   'ppm',
    min:      0,
    max:      300,
    optMin:   80,
    optMax:   120,
    idealMin: 90,
    idealMax: 110,
    icon:     'fa-water',
    color:    '#0E4569',
    decimales: 0,
    explicacion: (val) => {
      if (val < 60)   return { emoji: '⚠️', texto: 'La alcalinidad está baja, así el pH se vuelve inestable y brinca con facilidad. La subimos para estabilizar el agua.' };
      if (val < 80)   return { emoji: '🔶', texto: 'La alcalinidad va un poco baja. La reforzamos para que el pH se mantenga firme entre una visita y otra.' };
      if (val <= 120) return { emoji: '✅', texto: 'La alcalinidad está en rango. Funciona como un amortiguador que mantiene firme el pH y conserva el agua equilibrada entre visitas.' };
      if (val <= 180) return { emoji: '🔶', texto: 'La alcalinidad va algo alta y el pH tiende a subir. La ajustamos para mantener el equilibrio.' };
      return               { emoji: '⚠️', texto: 'La alcalinidad está alta: empuja el pH hacia arriba y le resta fuerza al cloro. Ya iniciamos su corrección.' };
    },
  },

  dureza_calcica: {
    label:    'Dureza Cálcica',
    unidad:   'ppm',
    min:      0,
    max:      800,
    optMin:   200,
    optMax:   400,
    idealMin: 250,
    idealMax: 350,
    icon:     'fa-gem',
    color:    '#C97A4F',
    decimales: 0,
    explicacion: (val) => {
      if (val < 150)  return { emoji: '⚠️', texto: 'El calcio está bajo y el agua "busca" minerales: puede desgastar acabados y equipos. Lo corregimos para protegerlos.' };
      if (val < 200)  return { emoji: '🔶', texto: 'El calcio va un poco bajo. Lo ajustamos de forma preventiva para cuidar las superficies de tu alberca.' };
      if (val <= 400) return { emoji: '✅', texto: 'El calcio está en su punto: ni tan bajo que desgaste los acabados, ni tan alto que forme sarro. El equilibrio que cuida tu alberca a largo plazo.' };
      if (val <= 550) return { emoji: '🔶', texto: 'El calcio va algo alto y puede aparecer sarro en la línea de flotación. Lo vigilamos de cerca.' };
      return               { emoji: '⚠️', texto: 'El calcio está alto y favorece el sarro en superficies y equipos. Evaluamos un recambio parcial de agua para regularlo.' };
    },
  },

  lsi: {
    label:    'Índice de Langelier (LSI)',
    unidad:   '',
    min:      -3,
    max:      3,
    optMin:   -0.3,
    optMax:   0.3,
    idealMin: -0.1,
    idealMax: 0.1,
    icon:     'fa-scale-balanced',
    color:    '#8B5CF6',
    decimales: 2,
    explicacion: (val) => {
      if (val < -0.5) return { emoji: '🚨', texto: 'El agua tiende a ser agresiva y "roba" minerales de las superficies. Ajustamos los parámetros para llevarla a su punto neutro.' };
      if (val < -0.3) return { emoji: '🔶', texto: 'El agua va ligeramente agresiva. Corregimos varios parámetros para devolverla al equilibrio.' };
      if (val <= 0.3) return { emoji: '✅', texto: '¡Equilibrio perfecto! Este índice integra pH, temperatura, alcalinidad y dureza. En este punto el agua ni ataca ni deposita: cuida tu alberca y sus equipos.' };
      if (val <= 0.5) return { emoji: '🔶', texto: 'El agua tiende a depositar (formar sarro). Ajustamos los parámetros para regresarla al equilibrio.' };
      return               { emoji: '🚨', texto: 'El agua está incrustante y puede formar sarro en equipos y tuberías. Aplicamos tratamiento para corregirlo.' };
    },
  },

  temperatura: {
    label:    'Temperatura',
    unidad:   '°C',
    min:      15,
    max:      45,
    optMin:   24,
    optMax:   32,
    idealMin: 26,
    idealMax: 30,
    icon:     'fa-thermometer-half',
    color:    '#F97316',
    decimales: 0,
    opcional:  true,
    explicacion: (val) => {
      if (val < 20) return { emoji: '🥶', texto: 'El agua está fresca. A esta temperatura el cloro rinde un poco menos, aunque el riesgo de algas también baja. Ideal para nado de resistencia.' };
      if (val <= 32) return { emoji: '✅', texto: 'El agua está a una temperatura muy agradable para nadar y el cloro trabaja correctamente.' };
      return              { emoji: '🔥', texto: 'El agua está cálida. El calor acelera el consumo de cloro y favorece las algas, por eso la monitoreamos más seguido.' };
    },
  },

  estabilizador: {
    label:    'Estabilizador (CYA)',
    unidad:   'ppm',
    min:      0,
    max:      200,
    optMin:   30,
    optMax:   50,
    idealMin: 35,
    idealMax: 45,
    icon:     'fa-sun',
    color:    '#EAB308',
    decimales: 0,
    opcional:  true,
    explicacion: (val) => {
      if (val < 20)  return { emoji: '🔶', texto: 'El estabilizador está bajo y el sol de Veracruz consume el cloro rápido. Lo reforzamos para proteger el desinfectante.' };
      if (val <= 50) return { emoji: '✅', texto: 'El estabilizador está en su nivel correcto: protege al cloro del sol sin restarle fuerza.' };
      if (val <= 80) return { emoji: '🔶', texto: 'El estabilizador está un poco alto. Le resta algo de fuerza al cloro; lo regulamos poco a poco con los recambios de agua.' };
      return               { emoji: '🚨', texto: 'El estabilizador está muy alto y "bloquea" al cloro (efecto lock-out). La solución es diluir parte del agua; ya lo tenemos contemplado.' };
    },
  },
};

// ─────────────────────────────────────────
//  HELPER: normaliza una foto a URL string
//  Soporta múltiples formatos y orígenes:
//    - string (formato viejo)
//    - { url | downloadURL | src | link | href | uri | path } (objeto)
//    - enlaces de Google Drive de "ver/compartir" → enlace directo de imagen
// ─────────────────────────────────────────

function _driveDirect(u) {
  if (typeof u !== 'string') return u;
  // Convierte enlaces de Drive (file/d/ID, open?id=, uc?id=) a uno que SÍ
  // renderiza dentro de <img>. Los enlaces "view" no cargan como imagen.
  const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return u;
}

function _fotoToUrl(foto) {
  if (!foto) return '';
  let u = '';
  if (typeof foto === 'string') {
    u = foto;
  } else if (typeof foto === 'object') {
    u = foto.url || foto.downloadURL || foto.downloadUrl || foto.src ||
        foto.link || foto.href || foto.uri || foto.secure_url || '';
    // Algunos pipelines guardan solo "path"; si es una URL completa, úsala.
    if (!u && typeof foto.path === 'string' && /^https?:\/\//.test(foto.path)) u = foto.path;
  }
  u = (u || '').trim();
  return u ? _driveDirect(u) : '';
}

// ¿La URL parece una imagen (Storage/Drive/CDN o con extensión de imagen)?
function _isImageUrl(u) {
  if (typeof u !== 'string' || !/^https?:\/\//.test(u)) return false;
  if (/\.pdf(\?|#|$)/i.test(u)) return false;            // nunca el PDF
  return /\.(jpe?g|png|webp|gif|avif|heic|bmp)(\?|#|$)/i.test(u)
    || /firebasestorage\.googleapis\.com|storage\.googleapis\.com|googleusercontent\.com|drive\.google\.com|lh3\.google|cloudinary\.com|cloudfront\.net|imgur\.com|unsplash\.com|\.amazonaws\.com/i.test(u);
}

// Reúne las fotos de una bitácora tolerando distintos nombres de campo y
// estructuras (array, mapa-objeto o string suelto). Así el portal SIEMPRE
// encuentra las fotos aunque el pipeline de guardado use otro nombre.
function _collectFotos(bitacora) {
  if (!bitacora || typeof bitacora !== 'object') return [];
  const KEYS = [
    'fotos', 'photos', 'imagenes', 'imágenes', 'images',
    'fotos_servicio', 'fotosServicio', 'fotosUrls', 'fotos_urls',
    'evidencias', 'galeria', 'galería', 'gallery', 'media', 'archivos', 'adjuntos',
  ];
  let raw = null;
  for (const k of KEYS) {
    const v = bitacora[k];
    if (v == null) continue;
    if (Array.isArray(v) ? v.length : true) { raw = v; break; }
  }

  if (raw != null) {
    let arr;
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === 'string') arr = [raw];
    else if (typeof raw === 'object') arr = Object.values(raw); // mapa {0:..} o {a:{url}}
    else arr = [];
    const out = arr.map(_fotoToUrl).filter(Boolean);
    if (out.length) return out;
  }

  // Último recurso: escanear TODOS los campos buscando URLs de imagen, sin
  // importar el nombre del campo (excluye PDF). Garantiza encontrar las fotos.
  const found = [];
  for (const [k, v] of Object.entries(bitacora)) {
    if (/pdf/i.test(k)) continue;
    let items = [];
    if (Array.isArray(v)) items = v;
    else if (v && typeof v === 'object') items = Object.values(v);
    else if (typeof v === 'string') items = [v];
    items.forEach(it => { const u = _fotoToUrl(it); if (u && _isImageUrl(u)) found.push(u); });
  }
  return [...new Set(found)];
}

// ─────────────────────────────────────────
//  HIDRATAR FOTOS DESDE FIREBASE STORAGE
//  Cuando el documento de Firestore NO trae las URLs de las fotos pero sí
//  existen en Storage (caso real: el pipeline sube las fotos a
//  clientes/{cliente}/albercas/{alberca}/bitacoras/{bitacora}/foto-N.jpg pero
//  no escribe las URLs al doc), listamos esa carpeta y cargamos las fotos.
// ─────────────────────────────────────────
async function _hydrateFotosFromStorage(bitacora) {
  try {
    if (!bitacora || !window.FB || !window.FB.storage) return;
    // Si el doc ya trae URLs, no hace falta tocar Storage.
    if (_collectFotos(bitacora).length) return;

    const prof = window._currentClientProfile || {};
    const clientId  = prof._id || bitacora.cliente_id || bitacora.clienteId || bitacora.cliente;
    const albercaId = prof.alberca_id || bitacora.alberca_id || bitacora.albercaId || 'principal';
    const folder    = bitacora._id || bitacora.id || bitacora.fecha;
    if (!clientId || !folder) return;

    const { ref, listAll, getDownloadURL } = await import(
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js'
    );
    const path = `clientes/${clientId}/albercas/${albercaId}/bitacoras/${folder}`;
    const dir = ref(window.FB.storage, path);
    const res = await listAll(dir);
    if (!res || !res.items || !res.items.length) {
      console.warn('[Bitácora] No se hallaron fotos en Storage en:', path);
      return;
    }
    // Ordenar foto-1, foto-2, … de forma natural.
    res.items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const urls = (await Promise.all(
      res.items.map(it => getDownloadURL(it).catch(() => ''))
    )).filter(Boolean);
    if (!urls.length) return;

    bitacora.fotos = urls;                     // adjunta para que todo lo lea
    window._currentBitacora = bitacora;

    // Re-render del detalle ahora que ya hay fotos (vuelve a inicializar el
    // carrusel). El guard de _collectFotos evita repetir esta carga.
    const c = document.getElementById('view-container');
    if (c && document.getElementById('view-bitacora-detalle')) {
      c.innerHTML = renderBitacoraDetalle(bitacora, (window._currentClientProfile || {}).nombre || '');
      if (window.PostRender && window.PostRender.bitacora) window.PostRender.bitacora();
    }
  } catch (e) {
    console.warn('[Bitácora] No se pudieron listar las fotos en Storage:', e);
  }
}
window._hydrateFotosFromStorage = _hydrateFotosFromStorage;

// ─────────────────────────────────────────
//  RENDER PRINCIPAL DE LA VISTA
// ─────────────────────────────────────────

function renderBitacoraDetalle(bitacora, clienteNombre = '') {
  if (!bitacora) return `<div class="p-8 text-center" style="color: #6FB8C6; font-family: 'Bricolage Grotesque', sans-serif;">Bitácora no encontrada.</div>`;

  const { lecturas, acciones, notas, estado,
          tecnico, fecha, pdf_url, litros_retrolav,
          litros_evap, quimicos_usados, _id } = bitacora;

  // Fotos: se reúnen de forma robusta (varios nombres de campo y formatos).
  const fotos = _collectFotos(bitacora);
  // Diagnóstico: si no se encontraron fotos pero la bitácora trae datos, deja
  // ver en consola QUÉ campos llegaron (para detectar nombres no contemplados).
  if (!fotos.length) {
    try { console.warn('[Bitácora] Sin fotos detectadas. Campos disponibles:', Object.keys(bitacora)); } catch (e) {}
  }

  // Parámetros principales (siempre visibles)
  const paramPrincipales = ['ph','cloro_libre','cloro_combinado','alcalinidad','dureza_calcica','lsi'];
  // Parámetros opcionales (solo si existen en la bitácora)
  const paramOpcionales  = ['temperatura','estabilizador'];

  const parametrosAMostrar = [
    ...paramPrincipales,
    ...paramOpcionales.filter(p => lecturas[p] !== undefined && lecturas[p] !== null),
  ];

  const score = _scoreMostrado(bitacora);

  // ── Contexto de servicio (addendum CYA-aware) · campos opcionales/aditivos ──
  const ctxSrv   = bitacora.contexto_servicio || {};
  const seguro   = bitacora.seguro_banarse;
  const tieneCtx = !!(bitacora.rangos_dinamicos || bitacora.contexto_servicio ||
                      bitacora.salud_tope !== undefined || bitacora.seguro_banarse !== undefined);

  // Pills de contexto: etiqueta del modo + estado para nadar
  const _pills = [];
  if (ctxSrv.etiqueta) {
    const trat = ctxSrv.es_tratamiento;
    const pc  = trat ? '#f0b94e' : '#6FB8C6';
    const pb  = trat ? 'rgba(240,185,78,0.16)' : 'rgba(111,184,198,0.16)';
    const pbd = trat ? 'rgba(240,185,78,0.35)' : 'rgba(111,184,198,0.35)';
    _pills.push(`<span style="display:inline-flex;align-items:center;gap:6px;background:${pb};color:${pc};border:1px solid ${pbd};font-size:12.5px;font-weight:700;padding:6px 13px;border-radius:9999px;font-family:'Bricolage Grotesque',sans-serif;">${trat ? '🧪 ' : ''}${ctxSrv.etiqueta}</span>`);
  }
  if (seguro === true) {
    _pills.push(`<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(70,201,138,0.16);color:#5fcf97;border:1px solid rgba(70,201,138,0.35);font-size:12.5px;font-weight:700;padding:6px 13px;border-radius:9999px;font-family:'Bricolage Grotesque',sans-serif;">✅ Lista para nadar</span>`);
  } else if (seguro === false) {
    _pills.push(`<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(232,168,56,0.16);color:#f0b94e;border:1px solid rgba(232,168,56,0.35);font-size:12.5px;font-weight:700;padding:6px 13px;border-radius:9999px;font-family:'Bricolage Grotesque',sans-serif;">⏳ En tratamiento — espera a que te avisemos</span>`);
  }
  const pillsHTML = _pills.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:16px;">${_pills.join('')}</div>` : '';

  // ── Productos / dosificación REALMENTE aplicados ──
  // Soporta el array flexible `productos: [{nombre, cantidad, unidad, emoji}]`
  // (recomendado) y, por compatibilidad, el viejo `quimicos_usados`.
  // SIN valores demo: si no hay nada, la sección no se muestra.
  const _prod = _productosAplicados(bitacora);
  const chipsHTML = _prod.map(p => `<div style="background-color: #1A2030; color: #EEF1F5; font-size: 14.5px; font-weight: 500; border-radius: 9999px; padding: 10px 16px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif; display: flex; align-items: center; gap: 6px;">${p.emoji} ${p.label}</div>`).join('');

  // ── Trabajo realizado: checklist mecánico (cepillado, canastillas…)
  //    + acciones de la bitácora, en una sola lista con palomitas. ──
  const trabajoRealizado = [..._checklistItems(bitacora), ...(acciones || [])];

  // ── Banner ── Prioriza el aviso que escribe el técnico (contexto_servicio).
  let hasAlertBanner = false;
  let alertBannerMsg = '';
  if (ctxSrv.banner) {
    hasAlertBanner = true;
    alertBannerMsg = ctxSrv.banner;
  } else if (seguro === false) {
    hasAlertBanner = true;
    alertBannerMsg = "El agua está en tratamiento. El técnico te avisará cuando sea seguro nadar.";
  } else if (!tieneCtx) {
    // Bitácoras antiguas (sin contexto): heurística previa
    if (lecturas.cloro_libre > 3.0) {
      hasAlertBanner = true;
      alertBannerMsg = "Espera 2 horas antes de usar la alberca. El cloro libre está elevado y bajará a rango seguro en unas horas.";
    } else if (lecturas.ph < 7.1 || lecturas.ph > 7.7) {
      hasAlertBanner = true;
      alertBannerMsg = "Se realizó un ajuste preventivo del pH en este servicio. Espera 1 hora antes de ingresar a nadar.";
    } else if (score < 75) {
      hasAlertBanner = true;
      alertBannerMsg = "Se aplicaron adiciones químicas correctoras en esta visita. Espera 1 hora para una dilución completa del tratamiento.";
    }
  }

  const scoreColor = score >= 80 ? '#2D9E6B' : score >= 60 ? '#E8A838' : '#D95C5C';

  // Tarjetas del carrusel 3D de detalles: parámetros + trabajo + dosificación + nota
  const _detailCards = [
    ...parametrosAMostrar.map(key => {
      const cfg = PARAMETROS[key];
      const val = lecturas[key];
      if (val === undefined || val === null || !cfg) return '';
      return _paramSlideHTML(key, cfg, val, bitacora);
    }),
    trabajoRealizado.length ? _workSlideHTML(trabajoRealizado) : '',
    _prod.length ? _doseSlideHTML(_prod) : '',
    notas ? _noteSlideHTML(notas, fecha, tecnico) : '',
  ].filter(Boolean);

  const _dcarSlides = _detailCards.map((html, i) => `<div class="dcar-slide" data-dindex="${i}">${html}</div>`).join('');
  const _dcarDots = _detailCards.map((_, i) => `<button class="dcar-dot ${i === 0 ? 'active' : ''}" data-ddot="${i}" type="button" aria-label="Tarjeta ${i + 1}"></button>`).join('');

  return `
  <!-- Scoped style overrides for Premium Dark Theme -->
  <style>
    #view-bitacora-detalle {
      background-color: transparent !important;
      color: #EEF1F5 !important;
      font-family: 'Bricolage Grotesque', sans-serif !important;
      min-height: 100vh;
      width: 100%;
      max-width: 100%;
      margin: 0;
      overflow-x: hidden;
    }
    /* Lienzo de "ancho de diseño" — se escala con zoom (JS) para
       llenar siempre el ancho real de la pantalla, igual que un
       WebView nativo, sin importar el navegador o su zoom. */
    #view-bitacora-detalle #rp-fit {
      width: 412px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    #view-bitacora-detalle .premium-dark-card {
      background-color: #11161F !important;
      border: 1px solid rgba(111, 184, 198, 0.08) !important;
      border-radius: 16px !important;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4) !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #view-bitacora-detalle .btn-coral {
      background-color: #E8664A !important;
      color: #EEF1F5 !important;
      font-weight: 700 !important;
      font-family: 'Bricolage Grotesque', sans-serif !important;
      box-shadow: 0 8px 24px rgba(232,102,74,0.35) !important;
      border-radius: 9999px !important;
      height: 52px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100% !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: none !important;
      cursor: pointer;
    }
    #view-bitacora-detalle .btn-coral:hover {
      background-color: #d44f33 !important;
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(232,102,74,0.45) !important;
    }
    #view-bitacora-detalle .btn-coral:active {
      transform: translateY(0);
    }
    #view-bitacora-detalle .btn-whatsapp {
      background-color: transparent !important;
      border: 1.5px solid #6FB8C6 !important;
      color: #6FB8C6 !important;
      font-weight: 600 !important;
      font-family: 'Bricolage Grotesque', sans-serif !important;
      border-radius: 9999px !important;
      height: 52px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100% !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      cursor: pointer;
    }
    #view-bitacora-detalle .btn-whatsapp:hover {
      background-color: rgba(111, 184, 198, 0.1) !important;
      color: #8ecbd7 !important;
      border-color: #8ecbd7 !important;
      transform: translateY(-2px);
    }
    #view-bitacora-detalle .btn-whatsapp:active {
      transform: translateY(0);
    }
    .custom-scrollbar::-webkit-scrollbar {
      height: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #0A0E14;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #1A2030;
      border-radius: 10px;
    }
  </style>

  <article id="view-bitacora-detalle">
    <div id="rp-fit">

    <!-- ── TOPBAR PREMIUM ── -->
    <div style="position: relative; height: 64px; margin: -16px -16px 8px; background-color: #0A0E14; border-bottom: 2px solid #E8664A; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <!-- Simulated Yin-Yang Logo in a 40x40 circle -->
        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #11161F; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="transform: rotate(-135deg);">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#E8664A" stroke-width="2"/>
            <path d="M12,2 A10,10 0 0,0 12,22 A5,5 0 0,0 12,12 A5,5 0 0,1 12,2" fill="#E8664A"/>
            <path d="M12,2 A10,10 0 0,1 12,22 A5,5 0 0,1 12,12 A5,5 0 0,0 12,2" fill="#6FB8C6"/>
          </svg>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div style="font-size: 15px; font-weight: 700; font-family: 'Bricolage Grotesque', sans-serif; line-height: 1.2;">
            <span style="color: #EEF1F5;">Pool</span><span style="color: #E8664A;">Balance</span>
          </div>
          <span style="color: #6FB8C6; font-size: 11px; font-weight: 400;">Reporte de servicio</span>
        </div>
      </div>
      
      <!-- Back Button to return to view-cliente / client portal -->
      <button
        onclick="(window.PortalNav && PortalNav.backToDashboard) ? PortalNav.backToDashboard() : Router.navigate('portal')"
        style="width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background-color: #11161F; color: #6FB8C6; border: 1px solid rgba(111,184,198,0.15); transition: background-color 0.2s; cursor:pointer;"
        aria-label="Volver al portal"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
    </div>

    <!-- ── HERO: CARRUSEL 3D DE FOTOS + SCORE SUPERPUESTO ── -->
    ${_renderPhotoHero(fotos, score, scoreColor)}

    <!-- Resumen breve + pills de estado -->
    <div style="text-align:center; margin-top:-8px;">
      <h1 style="color:#EEF1F5; font-size:23px; font-weight:800; line-height:1.2; margin-bottom:6px;">
        ${_scoreLabel(score)}
      </h1>
      <p style="color:#aebfcd; font-size:14.5px; line-height:1.55; max-width:350px; margin:0 auto;">
        ${_getScoreHint(score)}
      </p>
      ${pillsHTML}
    </div>

    <!-- ── LECTURAS DEL FOTÓMETRO (TUBOS 3D) ── -->
    <div>
      <h2 style="color:#6FB8C6; font-size:13px; font-weight:700; letter-spacing:2px; margin-bottom:12px; text-transform:uppercase;">
        Lecturas del fotómetro
      </h2>
      ${_renderTubes(bitacora)}
    </div>

    <!-- ── BANNER DE ALERTA DINÁMICO ── -->
    ${hasAlertBanner ? `
    <div style="background-color: rgba(232, 168, 56, 0.12); border-left: 3px solid #E8A838; border-radius: 12px; padding: 16px; display: flex; gap: 12px; align-items: start;">
      <span style="color: #E8A838; font-size: 18px;">⚠️</span>
      <div style="color: #EEF1F5; font-size: 15px; font-weight: 500; line-height: 1.5;">
        ${alertBannerMsg}
      </div>
    </div>` : ''}

    <!-- ── CARRUSEL 3D DE DETALLES (parámetros + trabajo + dosificación) ── -->
    <div>
      <h2 style="color:#6FB8C6; font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px;">
        Detalle del servicio
      </h2>

      <div class="dcar" id="dcar" role="region" aria-roledescription="carrusel" aria-label="Detalle del servicio">
        <div class="dcar-stage" id="dcar-stage" role="list">
          ${_dcarSlides}
        </div>
        <button class="dcar-arrow prev" id="dcar-prev" type="button" aria-label="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="dcar-arrow next" id="dcar-next" type="button" aria-label="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="dcar-dots" id="dcar-dots">${_dcarDots}</div>
      <p style="text-align:center; color:rgba(255,255,255,0.3); font-size:11px; margin-top:4px;">Desliza para ver cada parámetro</p>
    </div>

    <!-- ── ACCIONES BOTONES ── -->
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
      <button
        class="btn-coral"
        onclick="PDFGenerator.generate(window._currentBitacora, window._currentClientProfile)"
        aria-label="Descargar reporte PDF"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <polyline points="9 15 12 12 15 15"></polyline>
        </svg>
        Descargar reporte PDF
      </button>
      
      <button
        class="btn-whatsapp"
        onclick="BitacoraUI.shareWhatsApp()"
        aria-label="Contactar a mi técnico por WhatsApp"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        Contactar a mi técnico por WhatsApp
      </button>
    </div>

    <!-- ── FOOTER HIGH STYLE ── -->
    <footer style="display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 32px 0 16px 0; border-top: 1px solid #1A2030; margin-top: 16px;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #11161F; display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="transform: rotate(-135deg);">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#E8664A" stroke-width="2"/>
          <path d="M12,2 A10,10 0 0,0 12,22 A5,5 0 0,0 12,12 A5,5 0 0,1 12,2" fill="#E8664A"/>
          <path d="M12,2 A10,10 0 0,1 12,22 A5,5 0 0,1 12,12 A5,5 0 0,0 12,2" fill="#6FB8C6"/>
        </svg>
      </div>
      
      <div style="text-align: center; font-family: 'Bricolage Grotesque', sans-serif;">
        <p style="color: #6FB8C6; font-size: 12px; font-weight: 500; margin: 0;">Pool Balance™ · Veracruz, México</p>
        <p style="color: #8B95A7; font-size: 10px; font-weight: 400; margin: 2px 0 0 0;">Servicio del ${_formatFechaLarga(fecha)}</p>
      </div>
    </footer>

    </div><!-- /#rp-fit -->

  </article>
  `;
}

// ─────────────────────────────────────────
//  RENDER DE TARJETA DE PARÁMETRO
// ─────────────────────────────────────────

// ─────────────────────────────────────────
//  EXPLICACIONES — LISTO PARA FIRESTORE
//  Origen del texto explicativo de cada tarjeta, por prioridad:
//   1) El documento de la bitácora (Firestore) puede traer textos
//      personalizados escritos por el técnico desde la app de bitácora:
//        bitacora.explicaciones = {
//          ph:              { emoji: '✅', texto: '...' },
//          cloro_libre:     { emoji: '⚠️', texto: '...' },
//          cloro_combinado: { emoji: '✅', texto: '...' },
//          alcalinidad:     { ... }, dureza_calcica: { ... },
//          lsi: { ... }, temperatura: { ... }, estabilizador: { ... }
//        }
//      (También se acepta el alias  bitacora.textos[key]  y, si el valor
//       es un string simple, se usa como texto sin emoji.)
//   2) Si Firestore no trae texto para ese parámetro, se usa la
//      explicación calculada localmente por rango (fallback).
// ─────────────────────────────────────────

function _explicacionParam(key, cfg, val, bitacora) {
  const src    = bitacora && (bitacora.explicaciones || bitacora.textos);
  const custom = src && src[key];
  if (custom && typeof custom === 'object' && custom.texto) {
    return { emoji: custom.emoji || '', texto: custom.texto };
  }
  if (typeof custom === 'string' && custom.trim()) {
    return { emoji: '', texto: custom };
  }
  return cfg.explicacion(val);
}

// ── Estado de un parámetro considerando el contexto del técnico ──
//    (rangos dinámicos de cloro según CYA/modo). Aditivo: sin estos
//    campos, cae al cálculo por rango fijo de siempre.
// ── Estado a partir del emoji de la explicación (única fuente de verdad
//    del mensaje → garantiza que color y texto NUNCA se contradigan). ──
function _estadoDeEmoji(emoji) {
  if (!emoji) return null;
  if (emoji.indexOf('✅') !== -1) return 'optimo';
  if (emoji.indexOf('🚨') !== -1) return 'critico';
  if (emoji.indexOf('⚠️') !== -1 || emoji.indexOf('🔶') !== -1 ||
      emoji.indexOf('🔥') !== -1 || emoji.indexOf('🥶') !== -1) return 'alerta';
  return null;
}

function _estadoParamCtx(key, cfg, val, bitacora) {
  // 1) Cloro libre con rangos dinámicos (CYA-aware): manda la doctrina química.
  if (key === 'cloro_libre' && bitacora) {
    const rd = bitacora.rangos_dinamicos && bitacora.rangos_dinamicos.cloro_libre;
    if (rd && val != null && typeof rd.min === 'number' && typeof rd.alto === 'number') {
      if (val >= rd.min && val <= rd.alto) return 'optimo';
      if (val < rd.min) return 'alerta';
      return bitacora.seguro_banarse === false ? 'critico' : 'alerta';
    }
  }
  // 2) Seguir el emoji de la explicación: primero la del técnico (Firestore),
  //    luego la local por rango. Así el color SIEMPRE coincide con el texto.
  let e = null;
  if (typeof _explicacionParam === 'function') {
    e = _estadoDeEmoji((_explicacionParam(key, cfg, val, bitacora) || {}).emoji);
  }
  if (!e && cfg && typeof cfg.explicacion === 'function') {
    e = _estadoDeEmoji((cfg.explicacion(val) || {}).emoji);
  }
  if (e) return e;
  // 3) Último recurso: clasificación numérica.
  return (typeof _getEstadoParam === 'function') ? _getEstadoParam(val, cfg) : 'optimo';
}

// ── Checklist mecánico de la visita (trabajo físico realizado) ──
const CHECKLIST_LABELS = {
  cepillado:      'Cepillado de paredes y piso',
  aspirado:       'Aspirado de fondo',
  canastillas:    'Limpieza de canastillas (skimmer y bomba)',
  red_hojas:      'Retiro de hojas con red',
  filtro_presion: 'Revisión de filtro y presión',
  nivel_agua:     'Revisión de nivel de agua',
};

function _checklistItems(bitacora) {
  const ch = bitacora && bitacora.checklist_mecanico;
  if (!ch || typeof ch !== 'object') return [];
  return Object.keys(ch)
    .filter(k => ch[k] === true)
    .map(k => CHECKLIST_LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, ' '));
}
window._checklistItems = _checklistItems;

// ── Productos realmente aplicados en el servicio ──
function _emojiProducto(nombre) {
  // Nota: "Klaren" es marca (aparece en muchos productos), no es señal de tipo.
  const n = (nombre || '').toLowerCase();
  if (/(alguicid|algen|alga)/.test(n))                     return '🦠';
  if (/(ácido|acido|muri|bisulfato|ph menos|ph-)/.test(n)) return '⚗️';
  if (/(cloro|hipoclor|triclor|naclo|pastilla)/.test(n))   return '🧪';
  if (/(clarific|floc|clear|brillo)/.test(n))              return '✨';
  if (/(bicarbon|alcalin|ph m[aá]s)/.test(n))              return '🧂';
  if (/(cianúr|cianur|estabiliz|cya)/.test(n))             return '☀️';
  if (/(calcio|dureza)/.test(n))                           return '💎';
  if (/(sal)/.test(n))                                     return '🧂';
  return '🧴';
}

function _productosAplicados(bitacora) {
  const out = [];
  // 1) Array flexible (recomendado): productos: [{nombre, cantidad, unidad, emoji}]
  if (bitacora && Array.isArray(bitacora.productos)) {
    bitacora.productos.forEach(p => {
      if (!p) return;
      const nombre = (typeof p === 'string') ? p : (p.nombre || p.producto || '');
      if (!nombre) return;
      const cantidad = (typeof p === 'object' && p.cantidad !== undefined && p.cantidad !== null) ? p.cantidad : '';
      const unidad   = (typeof p === 'object' && p.unidad) ? p.unidad : '';
      const dosis    = cantidad !== '' ? ` · ${cantidad}${unidad ? ' ' + unidad : ''}` : '';
      const emoji    = (typeof p === 'object' && p.emoji) ? p.emoji : _emojiProducto(nombre);
      out.push({ emoji, label: `${nombre}${dosis}` });
    });
  }
  // 2) Compatibilidad: quimicos_usados con llaves fijas
  const q = bitacora && bitacora.quimicos_usados;
  if (!out.length && q) {
    if (q.cloro_kg > 0)        out.push({ emoji:'🧪', label:`Hipoclorito · ${q.cloro_kg} kg` });
    if (q.acido_mur_lt > 0)    out.push({ emoji:'⚗️', label:`Ácido muriático · ${q.acido_mur_lt} L` });
    if (q.bicarbonato_kg > 0)  out.push({ emoji:'🧂', label:`Bicarbonato · ${q.bicarbonato_kg} kg` });
  }
  return out;
}

// ── Score CYA-aware: usa los MISMOS estados que pintan los chips, así el
//    número de salud nunca contradice los colores. Si el cloro está alto
//    pero correcto para su CYA (chip verde), suma como óptimo. ──
function _calcScoreCtx(bitacora) {
  const lecturas = (bitacora && bitacora.lecturas) || {};
  const pesos = { ph: 25, cloro_libre: 25, cloro_combinado: 15, alcalinidad: 15, dureza_calcica: 10, lsi: 10 };
  const pts   = { optimo: 100, alerta: 60, critico: 25 };
  let total = 0, peso = 0;
  Object.keys(pesos).forEach(key => {
    const val = lecturas[key];
    const cfg = PARAMETROS[key];
    if (val === undefined || val === null || !cfg) return;
    const est = (typeof _estadoParamCtx === 'function') ? _estadoParamCtx(key, cfg, val, bitacora) : 'optimo';
    total += (pts[est] != null ? pts[est] : 60) * pesos[key];
    peso  += pesos[key];
  });
  return peso ? Math.round(total / peso) : 0;
}

// ── Score mostrado: CYA-aware + cap con salud_tope del modo (choque 70…) ──
function _scoreMostrado(bitacora) {
  const base = _calcScoreCtx(bitacora);
  const tope = (bitacora && typeof bitacora.salud_tope === 'number') ? bitacora.salud_tope : 100;
  return Math.min(base, tope);
}
window._estadoParamCtx = _estadoParamCtx;
window._calcScoreCtx    = _calcScoreCtx;
window._scoreMostrado   = _scoreMostrado;

function _renderParametroCard(key, cfg, val, bitacora) {
  const exp       = _explicacionParam(key, cfg, val, bitacora);
  const pct       = _valToPct(val, cfg);
  const estado    = _estadoParamCtx(key, cfg, val, bitacora);
  
  // M3 status color
  const color = estado === 'optimo' ? '#2D9E6B' : estado === 'alerta' ? '#E8A838' : '#D95C5C';
  const textColor = estado === 'optimo' ? '#2D9E6B' : estado === 'alerta' ? '#E8A838' : '#EEF1F5';

  // Custom Inline SVG Icons:
  let svgIcon = '';
  if (key === 'ph') {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 3h12M8 3v3a4 4 0 0 1-1 2.5L3 18a2 2 0 0 0 1.5 3h15a2 2 0 0 0 1.5-3l-4-9.5A4 4 0 0 1 16 6V3"/>
      <path d="M5.5 15h13"/>
    </svg>`;
  } else if (key === 'cloro_libre') {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`;
  } else if (key === 'cloro_combinado') {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="2.5"/>
      <path d="M12 7.5v9M7.5 12h9"/>
      <circle cx="12" cy="19" r="2.5"/>
      <circle cx="5" cy="12" r="2.5"/>
      <circle cx="19" cy="12" r="2.5"/>
    </svg>`;
  } else if (key === 'alcalinidad') {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 6c4-2 6 2 10 0s6-2 10 0M2 12c4-2 6 2 10 0s6-2 10 0M2 18c4-2 6 2 10 0s6-2 10 0"/>
    </svg>`;
  } else if (key === 'dureza_calcica') {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 3h12l4 6-10 12L2 9z"/>
      <path d="M11 3 8 9l4 12 4-12-3-6"/>
      <path d="M2 9h20"/>
    </svg>`;
  } else if (key === 'lsi') {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v17M12 5h7M12 5H5M5 5v3a4 4 0 0 0 4 4M19 5v3a4 4 0 0 1-4 4"/>
      <path d="M2 20h20"/>
    </svg>`;
  } else if (key === 'temperatura') {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>`;
  } else {
    svgIcon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>`;
  }

  const valStr = val.toFixed(cfg.decimales);

  // Llegada → resultado (antes/después). Solo si la bitácora trae
  // lecturas_llegada con un valor numérico distinto al resultado.
  const u = cfg.unidad ? ' ' + cfg.unidad : '';
  const llegada = (bitacora && bitacora.lecturas_llegada) ? bitacora.lecturas_llegada[key] : undefined;
  const llegadaHTML = (typeof llegada === 'number' && llegada !== val)
    ? `<div style="display:flex;align-items:center;gap:5px;margin-top:7px;font-size:11.5px;font-family:'Bricolage Grotesque',sans-serif;">
         <span style="color:#8B95A7;">Al llegar: ${llegada.toFixed(cfg.decimales)}${u}</span>
         <span style="color:#6FB8C6;">→</span>
         <span style="color:#cfe0ea;font-weight:600;">${valStr}${u}</span>
       </div>`
    : '';

  return `
  <div class="premium-dark-card flex flex-col justify-between" style="min-height: 176px; gap: 12px; padding: 16px;">
    <div>
      <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
        <span style="color: #6FB8C6; display: flex; align-items: center;" class="flex-shrink-0">
          ${svgIcon}
        </span>
        <span style="color: #6FB8C6; font-size: 14px; font-weight: 500; font-family: 'Bricolage Grotesque', sans-serif;" class="truncate">${cfg.label}</span>
      </div>

      <div style="display: flex; align-items: baseline; margin-top: 8px;">
        <span style="color: #EEF1F5; font-size: 28px; font-weight: 700; line-height: 1; font-family: 'Bricolage Grotesque', sans-serif;">${valStr}</span>
        <span style="color: #8B95A7; font-size: 13px; margin-left: 3px; font-family: 'Bricolage Grotesque', sans-serif;">${cfg.unidad}</span>
      </div>
      ${llegadaHTML}
    </div>

    <div>
      <!-- Range bar visual indicator with glow -->
      <div style="height: 6px; background-color: #1A2030; border-radius: 9999px; position: relative; width: 100%; margin-bottom: 12px;">
        <div style="position: absolute; top: -4px; left: ${pct}%; width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; filter: drop-shadow(0 0 7px ${color}); transform: translateX(-50%);"></div>
      </div>

      <!-- Didactic Commentary -->
      <p style="color: ${textColor}; font-size: 13px; font-weight: 400; line-height: 1.5; font-family: 'Bricolage Grotesque', sans-serif; margin: 0;">
        ${exp.emoji} ${exp.texto}
      </p>
    </div>
  </div>`;
}

// ─────────────────────────────────────────
//  HERO: CARRUSEL 3D DE FOTOS (coverflow unificado) + SCORE
// ─────────────────────────────────────────

function _renderPhotoHero(fotos, score, scoreColor) {
  const list = (fotos && fotos.length) ? fotos : [];

  // ── Sin fotos: marco neutro (no se inventa galería) ──
  if (!list.length) {
    const ph = 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800';
    return `
      <div class="photo-deck-single" aria-label="Sin fotografías del servicio">
        <img src="${ph}" alt="Servicio de alberca" loading="lazy" />
        <span class="photo-deck-badge"><i class="fa-solid fa-image"></i> Sin fotos</span>
      </div>`;
  }

  // ── Una sola foto: marco grande tappable a pantalla completa ──
  if (list.length === 1) {
    return `
      <div class="photo-deck-single" onclick="BitacoraUI.openGallery(0)" role="button"
           tabindex="0" aria-label="Ampliar fotografía del servicio">
        <img src="${_fotoToUrl(list[0])}" alt="Fotografía del servicio" loading="lazy" />
        <span class="photo-deck-badge"><i class="fa-solid fa-expand"></i> Ampliar</span>
      </div>`;
  }

  // ── Varias fotos: PILA 3D FLOTANTE (deck) — estilo propio, distinto del
  //    coverflow de los otros carruseles: tarjeta frontal grande y las vecinas
  //    apiladas detrás/abajo con inclinación y sombras en capas (profundidad).
  return `
    <section class="photo-deck-sec" aria-label="Galería del servicio (${list.length} fotos)">
      <h2 class="photo-deck-title">Galería del servicio · ${list.length} fotos</h2>
      <div class="gallery-3d-wrapper">
        <button class="gallery-3d-arrow prev" onclick="BitacoraUI.slide3D(-1)" aria-label="Foto anterior" type="button"><i class="fa-solid fa-chevron-left"></i></button>
        <div class="gallery-3d-container">
          <div class="gallery-3d-track" id="gallery-3d-track" role="list">
            ${list.map((foto, i) => {
              const u = _fotoToUrl(foto);
              return `<div class="gallery-3d-card" role="listitem" data-index="${i}" onclick="BitacoraUI.handleCardClick(${i})" tabindex="0" aria-label="Ver foto ${i + 1} de ${list.length}">
                <img src="${u}" alt="Foto ${i + 1} del servicio" loading="lazy" />
                <span class="gallery-3d-count">${i + 1}/${list.length}</span>
                <div class="gallery-3d-overlay"><i class="fa-solid fa-expand"></i></div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <button class="gallery-3d-arrow next" onclick="BitacoraUI.slide3D(1)" aria-label="Foto siguiente" type="button"><i class="fa-solid fa-chevron-right"></i></button>
        <div class="gallery-3d-dots" id="gallery-3d-dots">
          ${list.map((_, i) => `<span class="gallery-3d-dot ${i === 0 ? 'active' : ''}" onclick="BitacoraUI.goTo3DSlide(${i})" role="button" aria-label="Ir a foto ${i + 1}"></span>`).join('')}
        </div>
      </div>
      <p class="photo-deck-hint">Desliza o toca una foto · toca el centro para pantalla completa</p>
    </section>`;
}

// ─────────────────────────────────────────
//  LECTURAS DEL FOTÓMETRO — TUBOS DE ENSAYO 3D
//  El líquido toma el color del REACTIVO (como un fotómetro real) y un
//  foquito de estado (semáforo) debajo se enciende verde/amarillo/rojo.
// ─────────────────────────────────────────

// Color del reactivo por parámetro (aproximado a la química real del test)
const REAGENT_COLOR = {
  ph:              '#E8526E', // rojo fenol
  cloro_libre:     '#E14B8A', // DPD · rosa/magenta
  cloro_combinado: '#B65BD6', // DPD combinado · púrpura
  alcalinidad:     '#3DBE8E', // verde bromocresol
  dureza_calcica:  '#3E8EDE', // azul (calcio)
  lsi:             '#6FB8C6', // índice · cristal/agua
  temperatura:     '#F0883E', // naranja
  estabilizador:   '#E8C24B', // amarillo (turbidez)
};

function _renderTubes(bitacora) {
  const lecturas = bitacora.lecturas || {};
  const tubos = [
    { key: 'ph',              label: 'pH' },
    { key: 'cloro_libre',     label: 'Cloro' },
    { key: 'alcalinidad',     label: 'Alcal.' },
    { key: 'dureza_calcica',  label: 'Dureza' },
    { key: 'lsi',             label: 'LSI' },
    { key: 'cloro_combinado', label: 'Cl.comb' },
  ].filter(t => lecturas[t.key] !== undefined && lecturas[t.key] !== null && PARAMETROS[t.key]);

  if (!tubos.length) return '';

  const cols = tubos.map(t => {
    const cfg     = PARAMETROS[t.key];
    const val     = lecturas[t.key];
    const estado  = _estadoParamCtx(t.key, cfg, val, bitacora);
    const stColor = estado === 'optimo' ? '#2D9E6B' : estado === 'alerta' ? '#E8A838' : '#D95C5C';
    const stIcon  = estado === 'optimo' ? 'fa-check' : estado === 'alerta' ? 'fa-exclamation' : 'fa-xmark';
    const stTxt   = estado === 'optimo' ? 'Óptimo' : estado === 'alerta' ? 'Atención' : 'Alerta';
    const liq     = REAGENT_COLOR[t.key] || '#6FB8C6';
    const fill    = Math.max(14, Math.min(94, _valToPct(val, cfg)));
    const valStr  = val.toFixed(cfg.decimales);
    return `
      <div class="tube-col">
        <div class="tube-val">${valStr}</div>
        <div class="tube" role="img" aria-label="${cfg.label}: ${valStr} (${stTxt})">
          <div class="tube-cap"></div>
          <div class="tube-liquid" style="height:${fill}%; --liq:${liq};">
            <span class="tube-meniscus"></span>
            <span class="tube-shine"></span>
          </div>
          <div class="tube-glass"></div>
        </div>
        <div class="tube-lbl">${t.label}</div>
        <div class="tube-led" style="--led:${stColor};" title="${stTxt}">
          <i class="fa-solid ${stIcon}" aria-hidden="true"></i>
        </div>
      </div>`;
  }).join('');

  return `
  <div class="premium-dark-card tube-card">
    <div class="tube-rack">${cols}</div>
  </div>`;
}

// ─────────────────────────────────────────
//  TARJETAS DEL CARRUSEL DESLIZABLE DE DETALLES
//  Regla de color: SOLO el valor numérico cambia de color;
//  títulos y textos descriptivos quedan en neutro (bruma/gris).
// ─────────────────────────────────────────

function _paramSlideHTML(key, cfg, val, bitacora) {
  const exp    = _explicacionParam(key, cfg, val, bitacora);
  const pct    = _valToPct(val, cfg);
  const estado = _estadoParamCtx(key, cfg, val, bitacora);
  const color  = estado === 'optimo' ? '#2D9E6B' : estado === 'alerta' ? '#E8A838' : '#D95C5C';
  const valStr = val.toFixed(cfg.decimales);
  const u      = cfg.unidad ? ' ' + cfg.unidad : '';

  const llegada = bitacora.lecturas_llegada ? bitacora.lecturas_llegada[key] : undefined;
  const llegadaHTML = (typeof llegada === 'number' && llegada !== val)
    ? `<div class="bslide-llegada">Al llegar <b style="color:#cfe0ea;">${llegada.toFixed(cfg.decimales)}${u}</b> <span style="color:#6FB8C6;">→</span> <b style="color:${color};">${valStr}${u}</b></div>`
    : '';

  return `
  <article class="dcar-card" role="listitem">
    <div class="bslide-head">
      <span class="bslide-ico"><i class="fa-solid ${cfg.icon}" aria-hidden="true"></i></span>
      <span class="bslide-title">${cfg.label}</span>
    </div>
    <div class="bslide-value">
      <span class="bslide-num" style="color:${color};">${valStr}</span>
      <span class="bslide-unit">${cfg.unidad}</span>
    </div>
    ${llegadaHTML}
    <div class="bslide-bar"><span style="left:${pct}%; background:${color}; box-shadow:0 0 8px ${color};"></span></div>
    <p class="bslide-desc">${exp.emoji} ${exp.texto}</p>
  </article>`;
}

function _workSlideHTML(items) {
  const pills = items.map(t => `<span class="bslide-pill"><i class="fa-solid fa-check" style="color:#5fcf97;" aria-hidden="true"></i> ${t}</span>`).join('');
  return `
  <article class="dcar-card" role="listitem">
    <div class="bslide-head">
      <span class="bslide-ico"><i class="fa-solid fa-screwdriver-wrench" aria-hidden="true"></i></span>
      <span class="bslide-title">Trabajo realizado</span>
    </div>
    <div class="bslide-pills">${pills}</div>
  </article>`;
}

function _doseSlideHTML(prods) {
  const pills = prods.map(p => `<span class="bslide-pill">${p.emoji} ${p.label}</span>`).join('');
  return `
  <article class="dcar-card" role="listitem">
    <div class="bslide-head">
      <span class="bslide-ico"><i class="fa-solid fa-flask-vial" aria-hidden="true"></i></span>
      <span class="bslide-title">Dosificación aplicada</span>
    </div>
    <div class="bslide-pills">${pills}</div>
  </article>`;
}

function _noteSlideHTML(notas, fecha, tecnico) {
  return `
  <article class="dcar-card" role="listitem">
    <div class="bslide-head">
      <span class="bslide-ico"><i class="fa-solid fa-pen-nib" aria-hidden="true"></i></span>
      <span class="bslide-title">Nota del técnico</span>
    </div>
    <p class="bslide-desc" style="flex:1;">"${notas}"</p>
    <div class="bslide-sign">
      <span style="color:#E8664A; font-weight:700;">✓ ${tecnico || 'Pool Balance'}</span>
      <span style="color:#6FB8C6;"> · ${_formatFechaLarga(fecha)}</span>
    </div>
  </article>`;
}

// ─────────────────────────────────────────
//  SCORE RING SVG (legado — ya no se usa en el hero)
// ─────────────────────────────────────────

function _renderScoreRing(score) {
  const radius = 80;
  const strokeWidth = 16;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  
  const color = score >= 80 ? '#2D9E6B' : score >= 60 ? '#E8A838' : '#D95C5C';
  const glowHex = score >= 80 ? 'rgba(45,158,107,0.5)' : score >= 60 ? 'rgba(232,168,56,0.5)' : 'rgba(217,92,92,0.5)';

  return `
  <div style="position:relative; width:200px; height:200px; margin:0 auto;">
    <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true" style="transform: rotate(-90deg);">
      <circle cx="100" cy="100" r="${radius}" fill="none"
              stroke="#1A2030" stroke-width="${strokeWidth}"/>
      <circle cx="100" cy="100" r="${radius}" fill="none"
              stroke="${color}" stroke-width="${strokeWidth}"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
              stroke-linecap="round"
              style="transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1); filter: drop-shadow(0 0 16px ${glowHex});"/>
    </svg>
    <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; pointer-events:none;">
      <span style="font-size: 64px; font-weight: 800; color: #EEF1F5; line-height: 1; font-family: 'Bricolage Grotesque', sans-serif;">${score}</span>
      <span style="font-size: 11px; font-weight: 700; color: #d8eff3; letter-spacing: 2px; margin-top: 2px; font-family: 'Bricolage Grotesque', sans-serif;">DE 100</span>
    </div>
  </div>`;
}

// ─────────────────────────────────────────
//  DETALLADO DE COMENTARIOS DE SALUD (SENSITIVOS AL SCORE GENERAL)
// ─────────────────────────────────────────

function _getScoreHint(score) {
  if (score >= 90) return "Todos los parámetros químicos están en perfecto equilibrio. El agua es completamente confortable y segura para nadar.";
  if (score >= 75) return "El agua tiene un gran equilibrio químico. Hay algún detalle menor que tu técnico está resolviendo, pero es totalmente segura para uso.";
  if (score >= 60) return "Se realizaron tratamientos específicos este servicio para restaurar el balance. Te sugerimos revisar las recomendaciones del técnico.";
  return "Se aplicó un tratamiento correctivo intensivo en esta visita. Te recomendamos seguir estrictamente las indicaciones de seguridad antes de ingresar.";
}

// ─────────────────────────────────────────
//  CÁLCULO DE SCORE DEL AGUA (0–100)
// ─────────────────────────────────────────

function _calcScore(lecturas) {
  const pesos = {
    ph:              25,
    cloro_libre:     25,
    cloro_combinado: 15,
    alcalinidad:     15,
    dureza_calcica:  10,
    lsi:             10,
  };

  let total = 0, pesoTotal = 0;

  Object.entries(pesos).forEach(([key, peso]) => {
    const val = lecturas[key];
    const cfg = PARAMETROS[key];
    if (val === undefined || val === null || !cfg) return;

    let puntos = 0;
    if (val >= cfg.idealMin && val <= cfg.idealMax) puntos = 100;
    else if (val >= cfg.optMin && val <= cfg.optMax) puntos = 80;
    else {
      // Gradiente de penalización basado en distancia al rango óptimo
      const distMin = Math.max(0, cfg.optMin - val);
      const distMax = Math.max(0, val - cfg.optMax);
      const dist    = Math.max(distMin, distMax);
      const rango   = (cfg.optMax - cfg.optMin) || 1;
      puntos = Math.max(0, 80 - (dist / rango) * 80);
    }

    if (cfg.invertido) {
      // Para parámetros donde menor = mejor (cloro combinado)
      puntos = val <= cfg.optMax ? 100 : Math.max(0, 100 - ((val - cfg.optMax) / cfg.optMax) * 100);
    }

    total     += puntos * peso;
    pesoTotal += peso;
  });

  return pesoTotal > 0 ? Math.round(total / pesoTotal) : 0;
}

function _scoreLabel(score) {
  if (score >= 90) return 'Agua en condiciones perfectas';
  if (score >= 75) return 'Agua segura, parámetros estables';
  if (score >= 60) return 'Requirió correcciones este servicio';
  if (score >= 40) return 'Múltiples parámetros corregidos';
  return 'Intervención intensiva realizada';
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────

function _valToPct(val, cfg) {
  return Math.min(100, Math.max(0, ((val - cfg.min) / (cfg.max - cfg.min)) * 100));
}

function _getEstadoParam(val, cfg) {
  if (cfg.invertido) {
    if (val <= cfg.optMax)  return 'optimo';
    if (val <= cfg.optMax * 2) return 'alerta';
    return 'critico';
  }
  if (val >= cfg.optMin && val <= cfg.optMax) return 'optimo';
  // Zona de alerta: 20% fuera del rango óptimo
  const margen = (cfg.optMax - cfg.optMin) * 0.5;
  if (val >= cfg.optMin - margen && val <= cfg.optMax + margen) return 'alerta';
  return 'critico';
}

function _formatFechaLarga(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-MX', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
}

// ─────────────────────────────────────────
//  UI CONTROLLER (galería + WhatsApp share)
// ─────────────────────────────────────────

const BitacoraUI = {
  _currentIndex: 0,
  _fotos: [],

  // Visor de foto a pantalla completa: vive como singleton en <body> para
  // que NUNCA herede el transform/zoom de un ancestro (eso hacía que la
  // foto apareciera recortada en la parte inferior de la pantalla).
  _ensureLightbox() {
    let modal = document.getElementById('gallery-modal');
    if (modal && modal.parentElement !== document.body) { modal.remove(); modal = null; }
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'gallery-modal';
      modal.className = 'photo-modal hidden';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Galería de fotos');
      modal.style.zIndex = '2000';
      modal.innerHTML = `
        <button onclick="BitacoraUI.closeGallery()" class="photo-modal-close" aria-label="Cerrar galería"
                style="position:fixed;top:max(16px,env(safe-area-inset-top));right:16px;z-index:2002;width:44px;height:44px;">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
        <button onclick="BitacoraUI.galleryPrev()" class="gallery-nav prev" aria-label="Foto anterior" type="button">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <div class="gallery-stage">
          <img id="gallery-modal-img" src="" alt="" />
          <span id="gallery-counter" class="gallery-counter"></span>
        </div>
        <button onclick="BitacoraUI.galleryNext()" class="gallery-nav next" aria-label="Foto siguiente" type="button">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>`;
      modal.addEventListener('click', (e) => { if (e.target === modal) BitacoraUI.closeGallery(); });
      document.body.appendChild(modal);
    }
    return modal;
  },

  openGallery(index) {
    // Reúne las fotos de forma robusta (varios nombres de campo y formatos).
    this._fotos = _collectFotos(window._currentBitacora);
    if (!this._fotos.length) return;
    this._currentIndex = index;

    const modal = this._ensureLightbox();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Entrada de historial: el botón "atrás" del teléfono cierra la foto
    // en lugar de navegar (el popstate del portal libera el scroll).
    if (!(window.history.state && window.history.state.pbView === 'foto')) {
      try { history.pushState({ pbView: 'foto' }, '', '#foto'); } catch (e) {}
    }

    this._showPhoto();
  },

  isGalleryOpen() {
    const modal = document.getElementById('gallery-modal');
    return !!(modal && !modal.classList.contains('hidden'));
  },

  closeGallery(fromPopstate = false) {
    const modal = document.getElementById('gallery-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
    // Si se cerró con la X / el fondo / Escape, retirar la entrada "#foto"
    // del historial sin volver a navegar (el popstate queda suprimido).
    if (!fromPopstate && window.history.state && window.history.state.pbView === 'foto') {
      this._suppressPop = true;
      try { history.back(); } catch (e) { this._suppressPop = false; }
    }
  },

  galleryPrev() {
    this._currentIndex = (this._currentIndex - 1 + this._fotos.length) % this._fotos.length;
    this._showPhoto();
  },

  galleryNext() {
    this._currentIndex = (this._currentIndex + 1) % this._fotos.length;
    this._showPhoto();
  },

  _showPhoto() {
    const img     = document.getElementById('gallery-modal-img');
    const counter = document.getElementById('gallery-counter');
    if (!img) return;
    const total = this._fotos.length;
    const n     = this._currentIndex + 1;

    // Indicador de carga: las fotos reales (Firebase Storage) pueden
    // tardar; sin esto el visor se ve negro y parece congelado.
    if (counter) counter.textContent = `Cargando foto ${n} / ${total}…`;
    img.style.transition = 'opacity 0.2s ease';
    img.style.opacity = '0.3';
    img.onload = () => {
      img.style.opacity = '1';
      if (counter) counter.textContent = `${n} / ${total}`;
    };
    img.onerror = () => {
      img.style.opacity = '1';
      if (counter) counter.textContent = `No se pudo cargar la foto ${n} / ${total}`;
    };
    img.alt = `Foto ${n}`;
    img.src = this._fotos[this._currentIndex];
  },

  // ── Galería 3D (tira de fotos del reporte, estilo original) ──
  _current3DIndex: 0,

  slide3D(dir) {
    const fotos = _collectFotos(window._currentBitacora);
    if (!fotos.length) return;
    this._current3DIndex = (this._current3DIndex + dir + fotos.length) % fotos.length;
    this.update3DGallery();
  },

  goTo3DSlide(index) {
    this._current3DIndex = index;
    this.update3DGallery();
  },

  // Tocar una tarjeta: si ya está al centro, abre a pantalla completa; si no, la centra.
  handleCardClick(index) {
    if (this._current3DIndex === index) {
      this.openGallery(index);
    } else {
      this._current3DIndex = index;
      this.update3DGallery();
    }
  },

  update3DGallery() {
    const track = document.getElementById('gallery-3d-track');
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.gallery-3d-card'));
    const dots  = Array.from(document.querySelectorAll('.gallery-3d-dot'));
    if (!cards.length) return;
    const activeIdx = this._current3DIndex || 0;
    cards.forEach((card, i) => {
      const diff = i - activeIdx;
      const a = Math.abs(diff);
      const side = diff < 0 ? -1 : 1;
      const zIndex = 100 - a;
      let tx, ty, tz, ry, rz, scale, opacity;
      if (diff === 0) {
        // Tarjeta frontal: grande, ligeramente levantada, sin giro.
        tx = 0; ty = -10; tz = 110; ry = 0; rz = 0; scale = 1; opacity = 1;
      } else {
        // Vecinas: apiladas DETRÁS y ABAJO, tucked (no se abren como coverflow),
        // con giro hacia el centro + leve inclinación de plano (efecto baraja).
        tx = side * (66 + (a - 1) * 30);
        ty = 16 + (a - 1) * 12;
        tz = -70 - (a - 1) * 78;
        ry = side * -24;
        rz = side * 5;
        scale = Math.max(0.6, 0.86 - (a - 1) * 0.1);
        opacity = a > 2 ? 0.12 : (a > 1 ? 0.4 : 0.74);
      }
      card.style.transform =
        `translateX(${tx}px) translateY(${ty}px) translateZ(${tz}px) ` +
        `rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
      card.style.zIndex = zIndex;
      card.style.opacity = opacity;
      card.classList.toggle('active', i === activeIdx);
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIdx));
  },

  init3DSwipe() {
    const track = document.getElementById('gallery-3d-track');
    if (!track || track.dataset.swipeBound) return;
    track.dataset.swipeBound = '1';
    let startX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) this.slide3D(diff > 0 ? 1 : -1);
    }, { passive: true });
  },

  shareWhatsApp() {
    const bit  = window._currentBitacora;
    const prof = window._currentClientProfile;
    if (!bit) return;

    const score = _calcScore(bit.lecturas);
    const lec   = bit.lecturas;

    const msg = `
🌊 *Pool Balance — Reporte de Servicio*
📅 Fecha: ${_formatFechaLarga(bit.fecha)}
👤 Cliente: ${prof?.nombre || ''}

*🔬 Lecturas con Fotómetro Digital:*
• pH: ${lec.ph} ${_iconEstado(lec.ph, PARAMETROS.ph)}
• Cloro Libre: ${lec.cloro_libre} ppm ${_iconEstado(lec.cloro_libre, PARAMETROS.cloro_libre)}
• Cloro Comb.: ${lec.cloro_combinado} ppm ${_iconEstado(lec.cloro_combinado, PARAMETROS.cloro_combinado)}
• Alcalinidad: ${lec.alcalinidad} ppm ${_iconEstado(lec.alcalinidad, PARAMETROS.alcalinidad)}
• Dureza Cálc.: ${lec.dureza_calcica} ppm ${_iconEstado(lec.dureza_calcica, PARAMETROS.dureza_calcica)}
• LSI: ${lec.lsi} ${_iconEstado(lec.lsi, PARAMETROS.lsi)}

*💧 Salud del Agua: ${score}/100*
${score >= 80 ? '✅ Agua en condiciones óptimas' : score >= 60 ? '🔶 Correcciones realizadas' : '⚠️ Intervención aplicada'}

${bit.notas ? `📝 ${bit.notas}` : ''}

_Pool Balance · Gestoría Técnica de Albercas · Veracruz_
    `.trim();

    const wa = APP_CONFIG.company.whatsapp;
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  },
};

function _iconEstado(val, cfg) {
  const est = _getEstadoParam(val, cfg);
  return est === 'optimo' ? '✅' : est === 'alerta' ? '🔶' : '⚠️';
}

// ─────────────────────────────────────────
//  CARRUSEL 3D DE DETALLES (coverflow) — mismo efecto que los otros
// ─────────────────────────────────────────

const DetailCarousel = {
  active: 0,
  total: 0,
  _onUp: null,

  init() {
    const stage = document.getElementById('dcar-stage');
    if (!stage) return;
    this.total = stage.querySelectorAll('.dcar-slide').length;
    this.active = 0;
    this.layout();

    const prev = document.getElementById('dcar-prev');
    const next = document.getElementById('dcar-next');
    prev && (prev.onclick = () => this.go(this.active - 1));
    next && (next.onclick = () => this.go(this.active + 1));

    document.querySelectorAll('[data-ddot]').forEach(d => {
      d.onclick = () => this.go(parseInt(d.dataset.ddot, 10));
    });

    // Enlazar gestos UNA sola vez por elemento (evita listeners duplicados
    // que hacían saltar el carrusel de 2 en 2 al deslizar).
    if (!stage.dataset.carBound) {
      stage.dataset.carBound = '1';

      stage.querySelectorAll('.dcar-slide').forEach(sl => {
        sl.addEventListener('click', (e) => {
          if (this._swiped) { this._swiped = false; e.stopPropagation(); return; }
          const idx = parseInt(sl.dataset.dindex, 10);
          if (idx !== this.active && !e.target.closest('button, a')) {
            e.stopPropagation();
            this.go(idx);
          }
        });
      });

      // Swipe táctil
      let sx = null;
      stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; this._swiped = false; }, { passive: true });
      stage.addEventListener('touchend', (e) => {
        if (sx == null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 8) { this._swiped = true; setTimeout(() => { this._swiped = false; }, 400); }
        if (dx > 40) this.go(this.active - 1);
        else if (dx < -40) this.go(this.active + 1);
        sx = null;
      }, { passive: true });

      // Arrastre con mouse (solo desktop; en touch lo maneja touchend)
      let mx = null;
      stage.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; mx = e.clientX; });
      if (this._onUp) window.removeEventListener('pointerup', this._onUp);
      this._onUp = (e) => {
        if (mx == null) return;
        const dx = e.clientX - mx;
        if (dx > 50) this.go(this.active - 1);
        else if (dx < -50) this.go(this.active + 1);
        mx = null;
      };
      window.addEventListener('pointerup', this._onUp);
    }
  },

  go(i) {
    if (!this.total) return;
    this.active = ((i % this.total) + this.total) % this.total;
    this.layout();
  },

  layout() {
    const slides = Array.from(document.querySelectorAll('#dcar-stage .dcar-slide'));
    const total = slides.length;
    slides.forEach((sl, i) => {
      let off = i - this.active;
      if (off > total / 2) off -= total;
      if (off < -total / 2) off += total;

      let transform, opacity, z, pe = 'auto';
      if (off === 0) {
        transform = 'translateX(-50%) rotateY(0deg) scale(1)';
        opacity = 1; z = 30;
      } else if (Math.abs(off) === 1) {
        const d = off > 0 ? 1 : -1;
        transform = `translateX(calc(-50% + ${d * 64}%)) rotateY(${d * -32}deg) scale(0.84)`;
        opacity = 1; z = 20;
      } else {
        const d = off > 0 ? 1 : -1;
        transform = `translateX(calc(-50% + ${d * 78}%)) rotateY(${d * -32}deg) scale(0.8)`;
        opacity = 0; z = 10; pe = 'none';
      }
      sl.style.transform = transform;
      sl.style.opacity = opacity;
      sl.style.zIndex = z;
      sl.style.pointerEvents = pe;
      sl.classList.toggle('is-active', off === 0);
    });

    document.querySelectorAll('[data-ddot]').forEach((d, i) => {
      d.classList.toggle('active', i === this.active);
    });
  },
};
window.DetailCarousel = DetailCarousel;

// ─────────────────────────────────────────
//  CARRUSEL 3D DE FOTOS (coverflow) — mismo motor que los otros dos
// ─────────────────────────────────────────

const PhotoCarousel = {
  active: 0,
  total: 0,
  _onUp: null,

  init() {
    const stage = document.getElementById('phc-stage');
    if (!stage) return;
    this.total = stage.querySelectorAll('.phc-slide').length;
    this.active = 0;
    this.layout();

    const prev = document.getElementById('phc-prev');
    const next = document.getElementById('phc-next');
    prev && (prev.onclick = () => this.go(this.active - 1));
    next && (next.onclick = () => this.go(this.active + 1));

    document.querySelectorAll('[data-pdot]').forEach(d => {
      d.onclick = () => this.go(parseInt(d.dataset.pdot, 10));
    });

    // Enlazar gestos UNA sola vez por elemento (evita el doble-salto).
    if (!stage.dataset.carBound) {
      stage.dataset.carBound = '1';

      stage.querySelectorAll('.phc-slide').forEach(sl => {
        sl.addEventListener('click', (e) => {
          if (e.target.closest('button, a')) return;
          if (this._swiped) { this._swiped = false; e.stopPropagation(); return; }
          const idx = parseInt(sl.dataset.pindex, 10);
          e.stopPropagation();
          if (idx === this.active) BitacoraUI.openGallery(this.active);
          else this.go(idx);
        });
      });

      let sx = null;
      stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; this._swiped = false; }, { passive: true });
      stage.addEventListener('touchend', (e) => {
        if (sx == null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 8) { this._swiped = true; setTimeout(() => { this._swiped = false; }, 400); }
        if (dx > 40) this.go(this.active - 1);
        else if (dx < -40) this.go(this.active + 1);
        sx = null;
      }, { passive: true });

      // Arrastre con mouse (solo desktop; en touch lo maneja touchend)
      let mx = null;
      stage.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; mx = e.clientX; });
      if (this._onUp) window.removeEventListener('pointerup', this._onUp);
      this._onUp = (e) => {
        if (mx == null) return;
        const dx = e.clientX - mx;
        if (dx > 50) this.go(this.active - 1);
        else if (dx < -50) this.go(this.active + 1);
        mx = null;
      };
      window.addEventListener('pointerup', this._onUp);
    }
  },

  go(i) {
    if (!this.total) return;
    this.active = ((i % this.total) + this.total) % this.total;
    this.layout();
  },

  layout() {
    const slides = Array.from(document.querySelectorAll('#phc-stage .phc-slide'));
    const total = slides.length;
    slides.forEach((sl, i) => {
      let off = i - this.active;
      if (off > total / 2) off -= total;
      if (off < -total / 2) off += total;

      let transform, opacity, z, pe = 'auto';
      if (off === 0) {
        transform = 'translateX(-50%) rotateY(0deg) scale(1)';
        opacity = 1; z = 30;
      } else if (Math.abs(off) === 1) {
        const d = off > 0 ? 1 : -1;
        transform = `translateX(calc(-50% + ${d * 58}%)) rotateY(${d * -30}deg) scale(0.82)`;
        opacity = 1; z = 20;
      } else {
        const d = off > 0 ? 1 : -1;
        transform = `translateX(calc(-50% + ${d * 72}%)) rotateY(${d * -30}deg) scale(0.78)`;
        opacity = 0; z = 10; pe = 'none';
      }
      sl.style.transform = transform;
      sl.style.opacity = opacity;
      sl.style.zIndex = z;
      sl.style.pointerEvents = pe;
      sl.classList.toggle('is-active', off === 0);
    });

    document.querySelectorAll('[data-pdot]').forEach((d, i) => {
      d.classList.toggle('active', i === this.active);
    });
  },
};
window.PhotoCarousel = PhotoCarousel;

// Post-render
window.PostRender = window.PostRender || {}; // <-- ESTA ES LA LÍNEA SALVAVIDAS

window.PostRender.bitacora = function() {
  window.BitacoraUI = BitacoraUI;

  // Si el documento no trae las URLs de las fotos, intentar listarlas desde
  // Firebase Storage (carpeta de la bitácora). Si las encuentra, re-renderiza.
  _hydrateFotosFromStorage(window._currentBitacora);

  // ── ESCALADO "FILL-WIDTH" (imita el WebView nativo) ──
  // El contenido se diseña a un ancho fijo (412px) y se escala con
  // zoom para llenar SIEMPRE el ancho real de la pantalla, sin importar
  // el navegador ni su nivel de zoom. Así se ve grande y a pantalla
  // completa tanto en pestaña como instalada como PWA.
  const _fitReport = function() {
    const fit = document.getElementById('rp-fit');
    if (!fit) return;
    const DESIGN = 412;
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const scale = Math.max(0.5, vw / DESIGN);
    fit.style.zoom = scale.toFixed(4);
  };
  _fitReport();
  setTimeout(_fitReport, 60);
  setTimeout(_fitReport, 300);
  if (window._bitacoraFitHandler) {
    window.removeEventListener('resize', window._bitacoraFitHandler);
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', window._bitacoraFitHandler);
  }
  window._bitacoraFitHandler = _fitReport;
  window.addEventListener('resize', window._bitacoraFitHandler);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', window._bitacoraFitHandler);


  // Clear any existing keyboard handlers to prevent duplicates
  if (window._bitacoraKeyHandler) {
    document.removeEventListener('keydown', window._bitacoraKeyHandler);
  }
  
  window._bitacoraKeyHandler = function onKey(e) {
    const modal = document.getElementById('gallery-modal');
    const galleryOpen = modal && !modal.classList.contains('hidden');
    if (e.key === 'Escape') BitacoraUI.closeGallery();
    if (e.key === 'ArrowLeft') {
      if (galleryOpen) BitacoraUI.galleryPrev();
      else BitacoraUI.slide3D(-1);
    }
    if (e.key === 'ArrowRight') {
      if (galleryOpen) BitacoraUI.galleryNext();
      else BitacoraUI.slide3D(1);
    }
  };

  document.addEventListener('keydown', window._bitacoraKeyHandler);

  // Inicializar: galería 3D de fotos (estilo original) + carrusel de detalles.
  BitacoraUI._current3DIndex = 0;
  const _initGalerias = () => {
    BitacoraUI.update3DGallery();
    BitacoraUI.init3DSwipe();
    DetailCarousel.init();
  };
  requestAnimationFrame(() => requestAnimationFrame(_initGalerias));
  setTimeout(_initGalerias, 120);

  // Re-acomodar al rotar / cambiar tamaño de pantalla
  if (window._bitacoraResizeHandler) {
    window.removeEventListener('resize', window._bitacoraResizeHandler);
  }
  window._bitacoraResizeHandler = () => { BitacoraUI.update3DGallery(); DetailCarousel.layout(); };
  window.addEventListener('resize', window._bitacoraResizeHandler);
};

window.renderBitacoraDetalle = renderBitacoraDetalle;
window.PARAMETROS = PARAMETROS;
window.BitacoraUI = BitacoraUI;
window.DetailCarousel = DetailCarousel;
window.PhotoCarousel = PhotoCarousel;
