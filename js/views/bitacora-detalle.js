/**
 * ============================================================
 *  POOL BALANCE — VISTA: BITÁCORA DETALLADA
 *  El "Traductor Visual" — convierte números crudos en un
 *  dashboard didáctico que el cliente entiende sin ser técnico.
 *
 *  Consume: objeto bitácora de Firestore (via FirestoreService)
 *
 *  v1.0.1 - Fix: soporte para fotos como objeto {url,path,momento,timestamp}
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
      if (val < 7.0)  return { emoji: '⚠️', texto: 'El agua está muy ácida. Puede irritar ojos y piel, corroer superficies metálicas y reducir la eficiencia del cloro hasta un 90%. Se aplicó corrección con carbonato de sodio.' };
      if (val < 7.2)  return { emoji: '🔶', texto: 'Ligeramente ácido. El cloro funciona bien pero el agua puede causar leve irritación. Se realizó ajuste preventivo.' };
      if (val <= 7.6) return { emoji: '✅', texto: '¡Perfecto! El pH está en el rango ideal. El cloro trabaja con máxima eficiencia y el agua es completamente segura y confortable.' };
      if (val <= 7.8) return { emoji: '🔶', texto: 'Ligeramente alcalino. El cloro pierde algo de efectividad y puede aparecer turbidez. Se ajustó con ácido muriático.' };
      return               { emoji: '⚠️', texto: 'Muy alcalino. El cloro apenas funciona (solo 10-20% de efectividad), riesgo de formación de sarro y agua turbia. Corrección inmediata aplicada.' };
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
      if (val < 0.5)  return { emoji: '🚨', texto: 'SIN PROTECCIÓN. El agua no tiene suficiente cloro activo para desinfectar. Riesgo real de bacterias, algas y patógenos. No se recomienda uso hasta corrección.' };
      if (val < 1.0)  return { emoji: '⚠️', texto: 'Cloro insuficiente. La alberca tiene protección mínima. Se realizó adición de cloro granular para restablecer el nivel de seguridad.' };
      if (val <= 3.0) return { emoji: '✅', texto: '¡Excelente! Tienes el nivel de desinfectante correcto para agua completamente segura. Sin riesgo de bacteria ni algas.' };
      if (val <= 5.0) return { emoji: '🔶', texto: 'Cloro elevado. El agua es segura pero puede irritar ligeramente. Se dejará estabilizar con el sol y el uso normal.' };
      return               { emoji: '⚠️', texto: 'Cloro muy alto. No se recomienda uso hasta que baje a 3 ppm o menos. Puede causar irritación en ojos, piel y decoloración de trajes de baño.' };
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
      if (val <= 0.2) return { emoji: '✅', texto: 'Sin cloraminas detectables. Esto significa que el cloro está trabajando libremente para desinfectar, no desperdiciándose en combatir contaminantes.' };
      if (val <= 0.5) return { emoji: '🔶', texto: 'Cloraminas detectadas. Estas son el verdadero responsable del olor a cloro y la irritación ocular. Se realizó superchoque preventivo.' };
      return               { emoji: '⚠️', texto: 'Nivel alto de cloraminas. Este es el compuesto que produce el olor fuerte, irrita ojos y piel. Se aplicó superchoque con cloro granular para eliminarlas.' };
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
      if (val < 60)   return { emoji: '⚠️', texto: 'Alcalinidad muy baja. El pH se vuelve inestable y fluctúa drásticamente con cualquier cambio. Se agregó bicarbonato de sodio para estabilizar el sistema tampón del agua.' };
      if (val < 80)   return { emoji: '🔶', texto: 'Alcalinidad baja. El pH puede saltar mucho entre servicios. Se aplicó corrección con bicarbonato para mejorar la estabilidad.' };
      if (val <= 120) return { emoji: '✅', texto: 'Perfecto. La alcalinidad actúa como "amortiguador" del pH, manteniendo el agua estable entre visitas y haciendo que los ajustes de pH sean más predecibles.' };
      if (val <= 180) return { emoji: '🔶', texto: 'Alcalinidad elevada. El pH tenderá a subir y el agua puede verse turbia. Se aplicó ácido muriático para reducirla.' };
      return               { emoji: '⚠️', texto: 'Alcalinidad muy alta. El pH sube constantemente, el cloro pierde efectividad y puede aparecer sarro. Se realizó tratamiento de reducción con ácido.' };
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
      if (val < 150)  return { emoji: '⚠️', texto: 'Agua muy blanda. El agua "hambrienta" de calcio lo extraerá de las superficies de tu alberca (azulejos, acabado, equipos). Corrosiva silenciosa. Se agregó cloruro de calcio.' };
      if (val < 200)  return { emoji: '🔶', texto: 'Dureza un poco baja. Puede haber leve ataque a superficies. Se realizó corrección preventiva.' };
      if (val <= 400) return { emoji: '✅', texto: 'Excelente. El agua tiene el contenido de calcio correcto: ni agresiva con las superficies ni incrustante. Tu acabado y equipos están protegidos.' };
      if (val <= 550) return { emoji: '🔶', texto: 'Dureza elevada. Puede aparecer sarro (escala blanca) en la línea de flotación y equipos. Se monitorea de cerca.' };
      return               { emoji: '⚠️', texto: 'Dureza muy alta. Sarro en formación activa. Los equipos y superficies están en riesgo. Se evaluará dilución parcial con agua fresca.' };
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
      if (val < -0.5) return { emoji: '🚨', texto: 'Agua AGRESIVA. El LSI negativo indica que el agua está atacando activamente las superficies de tu alberca para "robar" minerales. Daño silencioso al acabado y equipos.' };
      if (val < -0.3) return { emoji: '⚠️', texto: 'Agua ligeramente agresiva. Hay riesgo de corrosión progresiva. Se ajustaron múltiples parámetros para llevar el LSI al rango neutro.' };
      if (val <= 0.3) return { emoji: '✅', texto: '¡Equilibrio perfecto! El LSI es el indicador maestro que integra pH, temperatura, alcalinidad y dureza. Estar en rango neutro significa que tu agua no ataca ni deposita: condición ideal.' };
      if (val <= 0.5) return { emoji: '⚠️', texto: 'Agua ligeramente incrustante. Puede empezar a depositar sarro. Se corrigieron los parámetros para bajar el LSI al rango óptimo.' };
      return               { emoji: '🚨', texto: 'Agua MUY INCRUSTANTE. Formación activa de sarro en tuberías, equipos y superficies. Puede obstruir el filtro y reducir la vida útil del equipo. Tratamiento aplicado.' };
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
      if (val < 20) return { emoji: '🥶', texto: 'Agua fría. La temperatura baja ralentiza el crecimiento de algas (bueno), pero también reduce la efectividad del cloro. Ideal para natación de resistencia.' };
      if (val <= 32) return { emoji: '✅', texto: 'Temperatura confortable para uso recreativo. A este rango el cloro funciona correctamente y el riesgo de proliferación de algas es manejable.' };
      return              { emoji: '🔥', texto: 'Temperatura alta. Las altas temperaturas aceleran el consumo de cloro y favorecen el crecimiento de algas y bacterias. Se requiere monitoreo más frecuente.' };
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
      if (val < 20)  return { emoji: '⚠️', texto: 'Sin protección solar del cloro. El sol de Veracruz puede degradar hasta el 90% del cloro libre en pocas horas. Se agregó ácido cianúrico (estabilizador).' };
      if (val <= 50) return { emoji: '✅', texto: 'Nivel correcto de estabilizador. El cloro está protegido de la degradación UV del sol sin que el estabilizador lo "bloquee" (efecto lock-out).' };
      if (val <= 80) return { emoji: '🔶', texto: 'Estabilizador elevado. A este nivel el cloro empieza a perder efectividad (necesitas mantener más ppm de cloro libre para compensar).' };
      return               { emoji: '🚨', texto: 'Estabilizador muy alto (CYA lock-out). El cloro queda casi inactivo por el exceso de estabilizador. La única solución real es dilución parcial del agua.' };
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
  if (!bitacora) return `<div class="p-8 text-center text-marino">Bitácora no encontrada.</div>`;

  const { lecturas, acciones, notas, fotos = [], estado,
          tecnico, fecha, pdf_url, litros_retrolav,
          litros_evap, quimicos_usados, _id } = bitacora;

  const estadoConfig = {
    optimo:    { label: 'Óptimo',   css: 'badge-success', icon: 'fa-circle-check' },
    corregido: { label: 'Corregido',css: 'badge-warning', icon: 'fa-circle-half-stroke' },
    alerta:    { label: 'Alerta',   css: 'badge-danger',  icon: 'fa-triangle-exclamation' },
  };
  const est = estadoConfig[estado?.toLowerCase()] || estadoConfig.optimo;

  // Parámetros principales (siempre visibles)
  const paramPrincipales = ['ph','cloro_libre','cloro_combinado','alcalinidad','dureza_calcica','lsi'];
  // Parámetros opcionales (solo si existen en la bitácora)
  const paramOpcionales  = ['temperatura','estabilizador'];

  const parametrosAMostrar = [
    ...paramPrincipales,
    ...paramOpcionales.filter(p => lecturas[p] !== undefined && lecturas[p] !== null),
  ];

  return `
  <article class="view-page" id="view-bitacora-detalle">

    <!-- ── HEADER STICKY ── -->
    <header class="sticky-header">
      <div class="content-container flex items-center gap-3">
        <button
          onclick="Router.navigate('portal')"
          class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style="background: var(--color-marino-xlight); color: var(--color-marino);"
          aria-label="Volver al portal"
        >
          <i class="fa-solid fa-arrow-left text-sm" aria-hidden="true"></i>
        </button>
        <div class="min-w-0">
          <h1 class="text-sm font-bold text-marino truncate">Bitácora ${_id}</h1>
          <p class="text-xs truncate" style="color:var(--text-muted);">${_formatFechaLarga(fecha)}</p>
        </div>
        <span class="badge ${est.css} ml-auto flex-shrink-0">
          <i class="fa-solid ${est.icon} fa-xs" aria-hidden="true"></i>
          ${est.label}
        </span>
      </div>
    </header>

    <!-- ── HERO RESUMEN ── -->
    <div class="bitacora-hero px-5 pt-5 pb-3">
      <div class="card" style="background: var(--color-marino); border-radius: var(--radius-2xl); overflow:hidden; position:relative;">
        <!-- Decoración -->
        <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:rgba(111,184,198,0.1);pointer-events:none;"></div>
        <div style="position:absolute;bottom:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:rgba(201,122,79,0.08);pointer-events:none;"></div>

        <div class="card-body relative z-10">
          <p class="text-xs font-bold uppercase tracking-widest mb-1" style="color:rgba(255,255,255,0.5);">
            <i class="fa-solid fa-user mr-1" aria-hidden="true"></i>
            ${clienteNombre || 'Tu alberca'}
          </p>
          <p class="text-sm font-semibold mb-4" style="color:rgba(255,255,255,0.75);">
            Técnico: ${tecnico}
          </p>

          <!-- Score visual del agua -->
          <div class="flex items-center gap-4 mb-4">
            <div class="water-score-ring" id="score-ring" aria-label="Puntuación del agua">
              ${_renderScoreRing(_calcScore(lecturas))}
            </div>
            <div>
              <p class="text-3xl font-extrabold text-white leading-none">${_calcScore(lecturas)}<span class="text-lg font-normal opacity-60">/100</span></p>
              <p class="text-sm font-semibold mt-1" style="color:var(--color-cristal);">Salud del Agua</p>
              <p class="text-xs mt-1" style="color:rgba(255,255,255,0.55);">${_scoreLabel(_calcScore(lecturas))}</p>
            </div>
          </div>

          <!-- Mini stats -->
          <div class="grid grid-cols-3 gap-2">
            ${litros_retrolav !== undefined ? `
            <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:10px;text-align:center;">
              <p class="text-base font-bold text-white">${litros_retrolav}L</p>
              <p style="font-size:0.62rem;color:rgba(255,255,255,0.5);line-height:1.2;">Retrolav.</p>
            </div>` : ''}
            ${litros_evap !== undefined ? `
            <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:10px;text-align:center;">
              <p class="text-base font-bold text-white">${litros_evap}L</p>
              <p style="font-size:0.62rem;color:rgba(255,255,255,0.5);line-height:1.2;">Evaporac.</p>
            </div>` : ''}
            ${acciones?.length ? `
            <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:10px;text-align:center;">
              <p class="text-base font-bold text-white">${acciones.length}</p>
              <p style="font-size:0.62rem;color:rgba(255,255,255,0.5);line-height:1.2;">Acciones</p>
            </div>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- ── PARÁMETROS CON BARRAS DE RANGO ── -->
    <section class="px-5 py-4" aria-labelledby="params-title">
      <h2 id="params-title" class="text-xs font-bold uppercase tracking-widest text-marino mb-4 flex items-center gap-2">
        <i class="fa-solid fa-chart-bar text-cristal" aria-hidden="true"></i>
        Análisis de Parámetros
      </h2>

      <div class="flex flex-col gap-4">
        ${parametrosAMostrar.map(key => {
          const cfg = PARAMETROS[key];
          const val = lecturas[key];
          if (val === undefined || val === null || !cfg) return '';
          return _renderParametroCard(key, cfg, val);
        }).join('')}
      </div>
    </section>

    <!-- ── QUÍMICOS UTILIZADOS ── -->
    ${quimicos_usados ? `
    <section class="px-5 py-4" aria-labelledby="quimicos-title">
      <h2 id="quimicos-title" class="text-xs font-bold uppercase tracking-widest text-marino mb-3 flex items-center gap-2">
        <i class="fa-solid fa-flask text-arcilla" aria-hidden="true"></i>
        Químicos Aplicados
      </h2>
      <div class="card card-body-sm">
        <div class="grid grid-cols-3 gap-3">
          ${quimicos_usados.acido_mur_lt !== undefined ? `
          <div class="text-center p-3 rounded-xl" style="background:var(--color-danger-bg);">
            <p class="text-lg font-extrabold" style="color:var(--color-danger);">${quimicos_usados.acido_mur_lt}L</p>
            <p class="text-xs mt-1" style="color:var(--text-muted);line-height:1.3;">Ácido<br>Muriático</p>
          </div>` : ''}
          ${quimicos_usados.cloro_kg !== undefined ? `
          <div class="text-center p-3 rounded-xl" style="background:var(--color-success-bg);">
            <p class="text-lg font-extrabold" style="color:var(--color-success);">${quimicos_usados.cloro_kg}kg</p>
            <p class="text-xs mt-1" style="color:var(--text-muted);line-height:1.3;">Cloro<br>Granular</p>
          </div>` : ''}
          ${quimicos_usados.bicarbonato_kg !== undefined ? `
          <div class="text-center p-3 rounded-xl" style="background:var(--color-marino-xlight);">
            <p class="text-lg font-extrabold text-marino">${quimicos_usados.bicarbonato_kg}kg</p>
            <p class="text-xs mt-1" style="color:var(--text-muted);line-height:1.3;">Bicarb.<br>Sodio</p>
          </div>` : ''}
        </div>
      </div>
    </section>` : ''}

    <!-- ── ACCIONES REALIZADAS ── -->
    ${acciones?.length ? `
    <section class="px-5 py-4" aria-labelledby="acciones-title">
      <h2 id="acciones-title" class="text-xs font-bold uppercase tracking-widest text-marino mb-3 flex items-center gap-2">
        <i class="fa-solid fa-list-check text-success" aria-hidden="true"></i>
        Acciones Realizadas
      </h2>
      <div class="card card-body-sm flex flex-col gap-2">
        ${acciones.map(acc => `
          <div class="flex items-start gap-3 py-1">
            <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                 style="background:var(--color-success-bg);">
              <i class="fa-solid fa-check text-success" style="font-size:0.55rem;" aria-hidden="true"></i>
            </div>
            <span class="text-sm" style="color:var(--text-secondary);">${acc}</span>
          </div>
        `).join('')}
      </div>
    </section>` : ''}

    <!-- ── NOTAS DEL TÉCNICO ── -->
    ${notas ? `
    <section class="px-5 py-2" aria-labelledby="notas-title">
      <h2 id="notas-title" class="text-xs font-bold uppercase tracking-widest text-marino mb-3 flex items-center gap-2">
        <i class="fa-solid fa-comment-dots text-cristal" aria-hidden="true"></i>
        Nota del Técnico
      </h2>
      <div class="card card-body-sm">
        <p class="text-sm leading-relaxed italic" style="color:var(--text-secondary);">
          <i class="fa-solid fa-quote-left text-xs mr-2 opacity-40" aria-hidden="true"></i>
          ${notas}
        </p>
        <p class="text-xs mt-3 text-right font-semibold" style="color:var(--text-muted);">— ${tecnico}</p>
      </div>
    </section>` : ''}

    <!-- ── GALERÍA DE FOTOS ── -->
    ${fotos?.length ? `
    <section class="px-5 py-4" aria-labelledby="fotos-title">
      <h2 id="fotos-title" class="text-xs font-bold uppercase tracking-widest text-marino mb-3 flex items-center gap-2">
        <i class="fa-solid fa-camera text-arcilla" aria-hidden="true"></i>
        Fotos del Servicio
        <span class="badge badge-marino ml-1">${fotos.length}</span>
      </h2>
      <div class="gallery-grid" role="list" aria-label="Galería de fotos del servicio">
        ${fotos.map((foto, i) => {
          const fotoUrl = _fotoToUrl(foto);
          return `
          <div
            class="gallery-thumb"
            role="listitem"
            onclick="BitacoraUI.openGallery(${i})"
            tabindex="0"
            onkeypress="if(event.key==='Enter')BitacoraUI.openGallery(${i})"
            aria-label="Ver foto ${i + 1} de ${fotos.length}"
          >
            <img src="${fotoUrl}" alt="Foto ${i + 1} del servicio" loading="lazy" />
            <div class="gallery-thumb-overlay" aria-hidden="true">
              <i class="fa-solid fa-expand text-white text-sm"></i>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </section>` : ''}

    <!-- ── BOTONES DE ACCIÓN ── -->
    <section class="px-5 pt-2 pb-8">
      <div class="flex flex-col gap-3">
        <button
          class="btn btn-primary btn-full"
          onclick="PDFGenerator.generate(window._currentBitacora, window._currentClientProfile)"
          aria-label="Descargar reporte PDF"
        >
          <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
          Descargar Reporte PDF
        </button>
        <button
          class="btn btn-secondary btn-full"
          onclick="BitacoraUI.shareWhatsApp()"
          aria-label="Compartir por WhatsApp"
        >
          <i class="fa-brands fa-whatsapp text-green-500" aria-hidden="true"></i>
          Compartir por WhatsApp
        </button>
      </div>
    </section>

    <!-- Lightbox galería -->
    <div id="gallery-modal" class="photo-modal hidden" role="dialog" aria-modal="true" aria-label="Galería de fotos">
      <div style="position:relative;max-width:92vw;max-height:88dvh;">
        <img id="gallery-modal-img" src="" alt="" style="max-width:92vw;max-height:80dvh;border-radius:16px;object-fit:contain;display:block;" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:12px;">
          <button onclick="BitacoraUI.galleryPrev()" class="btn btn-ghost btn-sm" aria-label="Foto anterior">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <span id="gallery-counter" style="color:rgba(255,255,255,0.6);font-size:0.8rem;"></span>
          <button onclick="BitacoraUI.galleryNext()" class="btn btn-ghost btn-sm" aria-label="Foto siguiente">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
        <button onclick="BitacoraUI.closeGallery()" class="photo-modal-close" aria-label="Cerrar galería">
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

function _renderParametroCard(key, cfg, val) {
  const exp       = cfg.explicacion(val);
  const pct       = _valToPct(val, cfg);
  const optMinPct = _valToPct(cfg.optMin, cfg);
  const optMaxPct = _valToPct(cfg.optMax, cfg);
  const estado    = _getEstadoParam(val, cfg);
  const estadoCSS = { optimo:'optimal', alerta:'warning', critico:'danger' }[estado];
  const valStr    = val.toFixed(cfg.decimales);

  return `
  <div class="card anim-fade-in-up" style="overflow:visible;">
    <div class="card-body-sm">

      <!-- Header del parámetro -->
      <div class="flex items-start justify-between mb-3 gap-2">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background:${cfg.color}18; color:${cfg.color};">
            <i class="fa-solid ${cfg.icon} text-sm" aria-hidden="true"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-marino leading-tight">${cfg.label}</p>
            <p class="text-xs" style="color:var(--text-muted);">
              Óptimo: ${cfg.optMin}–${cfg.optMax} ${cfg.unidad}
            </p>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-xl font-extrabold leading-none" style="color:${cfg.color};">
            ${valStr}<span class="text-xs font-normal ml-0.5" style="color:var(--text-muted);">${cfg.unidad}</span>
          </p>
          <span class="param-chip ${estadoCSS} inline-flex mt-1" style="min-width:auto;padding:2px 8px;">
            <span class="param-chip-label" style="font-size:0.6rem;">${estado.toUpperCase()}</span>
          </span>
        </div>
      </div>

      <!-- Barra de rango -->
      <div class="range-bar-container mb-3" aria-label="${cfg.label}: ${valStr} ${cfg.unidad}">
        <div class="range-bar-track">
          <!-- Zona óptima sombreada -->
          <div class="range-bar-optimal"
               style="left:${optMinPct}%;width:${optMaxPct - optMinPct}%;"
               aria-hidden="true"></div>
          <!-- Indicador del valor actual -->
          <div class="range-bar-thumb ${estadoCSS}"
               style="left:${Math.min(Math.max(pct, 2), 98)}%;"
               role="presentation">
          </div>
        </div>
        <!-- Etiquetas Min / Óptimo / Max -->
        <div class="range-bar-labels">
          <span>${cfg.min}${cfg.unidad}</span>
          <span style="color:var(--color-success);font-weight:600;">
            ✓ ${cfg.optMin}–${cfg.optMax}
          </span>
          <span>${cfg.max}${cfg.unidad}</span>
        </div>
      </div>

      <!-- Explicación didáctica colapsable -->
      <div class="param-explanation">
        <p class="text-xs leading-relaxed" style="color:var(--text-secondary);">
          ${exp.emoji} ${exp.texto}
        </p>
      </div>

    </div>
  </div>
  `;
}

// ─────────────────────────────────────────
//  SCORE RING SVG
// ─────────────────────────────────────────

function _renderScoreRing(score) {
  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 80 ? '#2D9E6B' : score >= 60 ? '#E8A838' : '#D95C5C';

  return `
  <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="${radius}" fill="none"
            stroke="rgba(255,255,255,0.1)" stroke-width="7"/>
    <circle cx="40" cy="40" r="${radius}" fill="none"
            stroke="${color}" stroke-width="7"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 40 40)"
            style="transition: stroke-dashoffset 1s ease;"/>
  </svg>`;
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

  openGallery(index) {
    // Normaliza las fotos a array de URLs strings (soporta formato objeto y string)
    const fotosRaw = window._currentBitacora?.fotos || [];
    this._fotos = fotosRaw.map(_fotoToUrl).filter(Boolean);
    if (!this._fotos.length) return;
    this._currentIndex = index;
    this._showPhoto();
    const modal = document.getElementById('gallery-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  closeGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
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
    if (img) {
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = this._fotos[this._currentIndex];
        img.alt = `Foto ${this._currentIndex + 1}`;
        img.style.opacity = '1';
        img.style.transition = 'opacity 0.2s ease';
      }, 100);
    }
    if (counter) counter.textContent = `${this._currentIndex + 1} / ${this._fotos.length}`;
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
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') BitacoraUI.closeGallery();
    if (e.key === 'ArrowLeft')  BitacoraUI.galleryPrev();
    if (e.key === 'ArrowRight') BitacoraUI.galleryNext();
  });
};

window.renderBitacoraDetalle = renderBitacoraDetalle;
window.PARAMETROS = PARAMETROS;
