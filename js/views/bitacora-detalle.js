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
//  Soporta ambos formatos:
//    - string (formato viejo)
//    - { url, path, momento, timestamp } (formato nuevo PhotoQueue V1.0.1+)
// ─────────────────────────────────────────

function _fotoToUrl(foto) {
  if (!foto) return '';
  if (typeof foto === 'string') return foto;
  return foto.url || '';
}

// ─────────────────────────────────────────
//  RENDER PRINCIPAL DE LA VISTA
// ─────────────────────────────────────────

function renderBitacoraDetalle(bitacora, clienteNombre = '') {
  if (!bitacora) return `<div class="p-8 text-center" style="color: #6FB8C6; font-family: 'Bricolage Grotesque', sans-serif;">Bitácora no encontrada.</div>`;

  const { lecturas, acciones, notas, fotos = [], estado,
          tecnico, fecha, pdf_url, litros_retrolav,
          litros_evap, quimicos_usados, _id } = bitacora;

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

    <!-- ── GRÁFICO 3D DE SALUD DEL AGUA (RADAR) ── -->
    <div>
      <h2 style="color:#6FB8C6; font-size:13px; font-weight:700; letter-spacing:2px; margin-bottom:12px; text-transform:uppercase;">
        Balance del agua
      </h2>
      ${_renderWaterRadar(bitacora, scoreColor)}
    </div>

    <!-- ── BANNER DE ALERTA DINÁMICO ── -->
    ${hasAlertBanner ? `
    <div style="background-color: rgba(232, 168, 56, 0.12); border-left: 3px solid #E8A838; border-radius: 12px; padding: 16px; display: flex; gap: 12px; align-items: start;">
      <span style="color: #E8A838; font-size: 18px;">⚠️</span>
      <div style="color: #EEF1F5; font-size: 15px; font-weight: 500; line-height: 1.5;">
        ${alertBannerMsg}
      </div>
    </div>` : ''}

    <!-- ── CARRUSEL DESLIZABLE DE DETALLES (parámetros + trabajo + dosificación) ── -->
    <div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <h2 style="color:#6FB8C6; font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">
          Detalle del servicio
        </h2>
        <div style="display:flex; gap:8px;">
          <button class="bslide-arrow" onclick="BitacoraUI.slideDetails(-1)" aria-label="Anterior" type="button">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="bslide-arrow" onclick="BitacoraUI.slideDetails(1)" aria-label="Siguiente" type="button">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="bslide-track custom-scrollbar" id="bslide-track" role="list">
        ${parametrosAMostrar.map(key => {
          const cfg = PARAMETROS[key];
          const val = lecturas[key];
          if (val === undefined || val === null || !cfg) return '';
          return _paramSlideHTML(key, cfg, val, bitacora);
        }).join('')}
        ${trabajoRealizado.length ? _workSlideHTML(trabajoRealizado) : ''}
        ${_prod.length ? _doseSlideHTML(_prod) : ''}
        ${notas ? _noteSlideHTML(notas, fecha, tecnico) : ''}
      </div>
      <p style="text-align:center; color:rgba(255,255,255,0.3); font-size:11px; margin-top:10px;">Desliza para ver cada parámetro</p>
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

    <!-- Lightbox galería -->
    <div id="gallery-modal" class="photo-modal hidden" role="dialog" aria-modal="true" aria-label="Galería de fotos" style="z-index: 1000;"
         onclick="if(event.target===this)BitacoraUI.closeGallery()">
      <div style="position:relative;max-width:92vw;max-height:88dvh;min-width:250px;">
        <img id="gallery-modal-img" src="" alt="" style="max-width:92vw;max-height:80dvh;min-height:150px;border-radius:16px;object-fit:contain;display:block;background:rgba(255,255,255,0.05);" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:12px;">
          <button onclick="BitacoraUI.galleryPrev()" class="btn btn-ghost btn-sm" aria-label="Foto anterior">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <span id="gallery-counter" style="color:rgba(255,255,255,0.6);font-size:0.8rem;"></span>
          <button onclick="BitacoraUI.galleryNext()" class="btn btn-ghost btn-sm" aria-label="Foto siguiente">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
        <button onclick="BitacoraUI.closeGallery()" class="photo-modal-close" aria-label="Cerrar galería"
                style="position:fixed;top:16px;right:16px;z-index:1001;width:42px;height:42px;">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </div>

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
//  HERO: CARRUSEL 3D DE FOTOS + SCORE SUPERPUESTO
// ─────────────────────────────────────────

function _renderPhotoHero(fotos, score, scoreColor) {
  const list = (fotos && fotos.length) ? fotos : [null];

  const cards = list.map((foto, i) => {
    const url = foto ? _fotoToUrl(foto) : 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800';
    return `
      <div class="gallery-3d-card" role="listitem" data-index="${i}"
           onclick="BitacoraUI.handleCardClick(${i})" tabindex="0"
           aria-label="Ver foto ${i + 1} de ${list.length}">
        <img src="${url}" alt="Foto ${i + 1} del servicio" loading="lazy" />
        <div class="bita-card-veil" aria-hidden="true"></div>
        <div class="bita-card-score" aria-label="Salud del agua: ${score} de 100">
          <span class="bita-score-num" style="color:${scoreColor};">${score}</span>
          <span class="bita-score-den">/ 100</span>
        </div>
        <div class="gallery-3d-overlay"><i class="fa-solid fa-expand text-white"></i></div>
      </div>`;
  }).join('');

  const arrows = list.length > 1 ? `
    <button class="gallery-3d-arrow prev" onclick="BitacoraUI.slide3D(-1)" aria-label="Foto anterior" type="button"><i class="fa-solid fa-chevron-left"></i></button>
    <button class="gallery-3d-arrow next" onclick="BitacoraUI.slide3D(1)" aria-label="Foto siguiente" type="button"><i class="fa-solid fa-chevron-right"></i></button>` : '';

  const dots = list.length > 1
    ? `<div class="gallery-3d-dots" id="gallery-3d-dots">${list.map((_, i) => `<span class="gallery-3d-dot ${i === 0 ? 'active' : ''}" onclick="BitacoraUI.goTo3DSlide(${i})" role="button" aria-label="Ir a foto ${i + 1}"></span>`).join('')}</div>`
    : '';

  return `
  <section class="bita-hero" aria-label="Fotografías del servicio">
    <div class="gallery-3d-wrapper" style="margin:0;">
      ${arrows}
      <div class="gallery-3d-container">
        <div class="gallery-3d-track" id="gallery-3d-track" role="list">
          ${cards}
        </div>
      </div>
      ${dots}
    </div>
  </section>`;
}

// ─────────────────────────────────────────
//  GRÁFICO 3D DE SALUD DEL AGUA (RADAR)
// ─────────────────────────────────────────

function _renderWaterRadar(bitacora, accent) {
  const lecturas = bitacora.lecturas || {};
  const axes = [
    { key: 'ph',              label: 'pH' },
    { key: 'cloro_libre',     label: 'Cloro' },
    { key: 'alcalinidad',     label: 'Alcal.' },
    { key: 'dureza_calcica',  label: 'Dureza' },
    { key: 'lsi',             label: 'LSI' },
    { key: 'cloro_combinado', label: 'Cl. comb.' },
  ].filter(a => lecturas[a.key] !== undefined && lecturas[a.key] !== null && PARAMETROS[a.key]);

  const N = axes.length;
  if (N < 3) return '';

  const cx = 140, cy = 130, R = 92;
  const valOf = (a) => {
    const est = _estadoParamCtx(a.key, PARAMETROS[a.key], lecturas[a.key], bitacora);
    return est === 'optimo' ? 1 : est === 'alerta' ? 0.58 : 0.3;
  };
  const ang = (i) => (-90 + i * 360 / N) * Math.PI / 180;
  const pt  = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];

  let grid = '';
  [0.25, 0.5, 0.75, 1].forEach(level => {
    const pts = axes.map((_, i) => pt(i, R * level).map(n => n.toFixed(1)).join(',')).join(' ');
    grid += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  });

  let spokes = '', labels = '';
  axes.forEach((a, i) => {
    const [x, y] = pt(i, R);
    spokes += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
    const [lx, ly] = pt(i, R + 17);
    const anchor = Math.abs(lx - cx) < 8 ? 'middle' : (lx > cx ? 'start' : 'end');
    labels += `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" fill="#9fb3c2" font-size="10.5" font-weight="700" text-anchor="${anchor}" font-family="'Bricolage Grotesque',sans-serif">${a.label}</text>`;
  });

  const dataPts = axes.map((a, i) => pt(i, R * valOf(a)).map(n => n.toFixed(1)).join(',')).join(' ');
  const dots = axes.map((a, i) => {
    const [x, y] = pt(i, R * valOf(a));
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${accent}" stroke="#0b1420" stroke-width="1.5"/>`;
  }).join('');

  const legend = [['#2D9E6B', 'Óptimo'], ['#E8A838', 'Corregido'], ['#D95C5C', 'Alerta']]
    .map(([c, l]) => `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;color:#9fb3c2;"><span style="width:9px;height:9px;border-radius:50%;background:${c};"></span>${l}</span>`)
    .join('');

  return `
  <div class="premium-dark-card" style="padding:18px 10px 14px; display:flex; flex-direction:column; align-items:center;">
    <svg width="280" height="252" viewBox="0 0 280 252" style="max-width:100%;" role="img" aria-label="Gráfico de balance químico del agua">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="44%" r="62%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0.10"/>
        </radialGradient>
        <filter id="radarGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="${accent}" flood-opacity="0.5"/>
        </filter>
      </defs>
      ${grid}
      ${spokes}
      <polygon points="${dataPts}" fill="url(#radarFill)" stroke="${accent}" stroke-width="2.5" stroke-linejoin="round" filter="url(#radarGlow)"/>
      ${dots}
      ${labels}
    </svg>
    <div style="display:flex; gap:16px; margin-top:8px; flex-wrap:wrap; justify-content:center;">${legend}</div>
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
  <article class="bslide-card" role="listitem">
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
  <article class="bslide-card" role="listitem">
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
  <article class="bslide-card" role="listitem">
    <div class="bslide-head">
      <span class="bslide-ico"><i class="fa-solid fa-flask-vial" aria-hidden="true"></i></span>
      <span class="bslide-title">Dosificación aplicada</span>
    </div>
    <div class="bslide-pills">${pills}</div>
  </article>`;
}

function _noteSlideHTML(notas, fecha, tecnico) {
  return `
  <article class="bslide-card" role="listitem">
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
  _current3DIndex: 0,
  _fotos: [],

  openGallery(index) {
    // Normaliza las fotos a array de URLs strings (soporta formato objeto y string)
    const fotosRaw = window._currentBitacora?.fotos || [];
    this._fotos = fotosRaw.map(_fotoToUrl).filter(Boolean);
    if (!this._fotos.length) return;
    this._currentIndex = index;

    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
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

  // Carrusel deslizable de detalles (scroll-snap nativo)
  slideDetails(dir) {
    const track = document.getElementById('bslide-track');
    if (!track) return;
    const card = track.querySelector('.bslide-card');
    const w = card ? card.offsetWidth + 12 : 260;
    track.scrollBy({ left: dir * w, behavior: 'smooth' });
  },

  // Métodos del carrusel 3D Coverflow
  slide3D(dir) {
    const fotosRaw = window._currentBitacora?.fotos || [];
    if (!fotosRaw.length) return;
    this._current3DIndex = (this._current3DIndex + dir + fotosRaw.length) % fotosRaw.length;
    this.update3DGallery();
  },

  goTo3DSlide(index) {
    this._current3DIndex = index;
    this.update3DGallery();
  },

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
    const dots = Array.from(document.querySelectorAll('.gallery-3d-dot'));
    if (!cards.length) return;

    const total = cards.length;
    let activeIdx = this._current3DIndex || 0;

    cards.forEach((card, i) => {
      let diff = i - activeIdx;
      
      let rotateY = 0;
      let translateZ = 0;
      let translateX = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 100 - Math.abs(diff);

      if (diff === 0) {
        rotateY = 0;
        translateZ = 80;
        translateX = 0;
        scale = 1.05;
        opacity = 1;
      } else {
        rotateY = diff < 0 ? 30 : -30;
        translateZ = -90;
        // Shift factor is dynamic to allow card visibility on various screens
        translateX = diff * 120;
        scale = 0.82;
        opacity = 0.65;
        if (Math.abs(diff) > 1) {
          opacity = 0.25;
        }
      }

      card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.zIndex = zIndex;
      card.style.opacity = opacity;
      card.classList.toggle('active', i === activeIdx);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIdx);
    });
  },

  init3DSwipe() {
    const track = document.getElementById('gallery-3d-track');
    if (!track) return;
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          this.slide3D(1);
        } else {
          this.slide3D(-1);
        }
      }
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

// Post-render
window.PostRender = window.PostRender || {}; // <-- ESTA ES LA LÍNEA SALVAVIDAS

window.PostRender.bitacora = function() {
  window.BitacoraUI = BitacoraUI;

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
    if (e.key === 'Escape') BitacoraUI.closeGallery();
    if (e.key === 'ArrowLeft') {
      const modal = document.getElementById('gallery-modal');
      if (modal && !modal.classList.contains('hidden')) {
        BitacoraUI.galleryPrev();
      } else {
        BitacoraUI.slide3D(-1);
      }
    }
    if (e.key === 'ArrowRight') {
      const modal = document.getElementById('gallery-modal');
      if (modal && !modal.classList.contains('hidden')) {
        BitacoraUI.galleryNext();
      } else {
        BitacoraUI.slide3D(1);
      }
    }
  };
  
  document.addEventListener('keydown', window._bitacoraKeyHandler);

  // Inicializar galería 3D Coverflow (robusto: rAF + fallback + resize)
  BitacoraUI._current3DIndex = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => BitacoraUI.update3DGallery()));
  setTimeout(() => {
    BitacoraUI.update3DGallery();
    BitacoraUI.init3DSwipe();
  }, 120);

  // Re-acomodar el carrusel al rotar / cambiar tamaño de pantalla
  if (window._bitacoraResizeHandler) {
    window.removeEventListener('resize', window._bitacoraResizeHandler);
  }
  window._bitacoraResizeHandler = () => BitacoraUI.update3DGallery();
  window.addEventListener('resize', window._bitacoraResizeHandler);
};

window.renderBitacoraDetalle = renderBitacoraDetalle;
window.PARAMETROS = PARAMETROS;
window.BitacoraUI = BitacoraUI;
