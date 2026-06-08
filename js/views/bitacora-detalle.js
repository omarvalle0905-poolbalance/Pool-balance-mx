/**
 * ============================================================
 *  POOL BALANCE — VISTA: BITÁCORA DETALLADA (MODO OSCURO PREMIUM)
 *  El "Traductor Visual" — convierte números crudos en un
 *  dashboard didáctico y elegante que el cliente entiende sin
 *  ser técnico.
 *
 *  Consume: objeto bitácora de Firestore (via FirestoreService)
 *
 *  v2.0.0 - Rediseño premium dark: aro de score grande, tarjetas
 *           con glow, sliders con punto luminoso y carrusel de fotos.
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
//  PALETA DE ESTADO (sobre fondo oscuro)
// ─────────────────────────────────────────

const ESTADO_DARK = {
  optimo:  { color: '#46c98a', label: 'ÓPTIMO' },
  alerta:  { color: '#f0b94e', label: 'ATENCIÓN' },
  critico: { color: '#ef6b6b', label: 'CRÍTICO' },
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

  const score = _calcScore(lecturas);

  // Parámetros principales (siempre visibles)
  const paramPrincipales = ['ph','cloro_libre','cloro_combinado','alcalinidad','dureza_calcica','lsi'];
  // Parámetros opcionales (solo si existen en la bitácora)
  const paramOpcionales  = ['temperatura','estabilizador'];

  const parametrosAMostrar = [
    ...paramPrincipales,
    ...paramOpcionales.filter(p => lecturas[p] !== undefined && lecturas[p] !== null),
  ];

  const tieneFotos = fotos && fotos.length > 0;

  return `
  <article class="view-page report-dark" id="view-bitacora-detalle">

    <!-- ── HEADER ── -->
    <header class="rp-header">
      <div class="rp-header-brand">
        <img src="images/logo.png" class="rp-header-logo" alt="Pool Balance" width="38" height="38" />
        <div class="min-w-0">
          <p class="rp-header-name">Pool<span>Balance</span></p>
          <p class="rp-header-sub">Reporte de servicio</p>
        </div>
      </div>
      <button onclick="Router.navigate('portal')" class="rp-back" aria-label="Volver al portal">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </button>
    </header>

    <!-- ── HERO SCORE ── -->
    <section class="rp-hero">
      <div class="rp-hero-ring" aria-label="Salud del agua: ${score} de 100">
        ${_renderScoreRingBig(score)}
        <div class="rp-hero-ring-num">
          <span class="rp-hero-score">${score}</span>
          <span class="rp-hero-of">DE 100</span>
        </div>
      </div>
      <h1 class="rp-hero-title">${_scoreLabel(score)}</h1>
      <p class="rp-hero-desc">${_heroDesc(score)}</p>
    </section>

    <!-- ── PARÁMETROS DEL AGUA ── -->
    <h2 class="rp-section-title">
      <i class="fa-solid fa-chart-bar" aria-hidden="true"></i>
      Parámetros del agua
    </h2>
    <section class="rp-params" aria-label="Análisis de parámetros">
      <div class="rp-params-grid">
        ${parametrosAMostrar.map(key => {
          const cfg = PARAMETROS[key];
          const val = lecturas[key];
          if (val === undefined || val === null || !cfg) return '';
          return _renderParametroCardDark(key, cfg, val);
        }).join('')}
      </div>
    </section>

    <!-- ── QUÍMICOS UTILIZADOS ── -->
    ${quimicos_usados ? `
    <h2 class="rp-section-title">
      <i class="fa-solid fa-flask" aria-hidden="true"></i>
      Químicos aplicados
    </h2>
    <section class="rp-block-wrap">
      <div class="rp-block">
        <div class="rp-chem-grid">
          ${quimicos_usados.acido_mur_lt !== undefined ? `
          <div class="rp-chem">
            <p class="rp-chem-val" style="color:#ef6b6b;">${quimicos_usados.acido_mur_lt}L</p>
            <p class="rp-chem-lbl">Ácido<br>Muriático</p>
          </div>` : ''}
          ${quimicos_usados.cloro_kg !== undefined ? `
          <div class="rp-chem">
            <p class="rp-chem-val" style="color:#46c98a;">${quimicos_usados.cloro_kg}kg</p>
            <p class="rp-chem-lbl">Cloro<br>Granular</p>
          </div>` : ''}
          ${quimicos_usados.bicarbonato_kg !== undefined ? `
          <div class="rp-chem">
            <p class="rp-chem-val" style="color:var(--color-cristal);">${quimicos_usados.bicarbonato_kg}kg</p>
            <p class="rp-chem-lbl">Bicarb.<br>Sodio</p>
          </div>` : ''}
        </div>
      </div>
    </section>` : ''}

    <!-- ── ACCIONES REALIZADAS ── -->
    ${acciones?.length ? `
    <h2 class="rp-section-title">
      <i class="fa-solid fa-list-check" aria-hidden="true"></i>
      Acciones realizadas
    </h2>
    <section class="rp-block-wrap">
      <div class="rp-block">
        ${acciones.map(acc => `
          <div class="rp-action-item">
            <i class="fa-solid fa-check" aria-hidden="true"></i>
            <span>${acc}</span>
          </div>
        `).join('')}
      </div>
    </section>` : ''}

    <!-- ── NOTA DEL TÉCNICO (si no hay fotos para el caption) ── -->
    ${notas && !tieneFotos ? `
    <h2 class="rp-section-title">
      <i class="fa-solid fa-comment-dots" aria-hidden="true"></i>
      Nota del técnico
    </h2>
    <section class="rp-block-wrap">
      <div class="rp-block">
        <p class="rp-note-text">
          <i class="fa-solid fa-quote-left text-xs mr-2 opacity-40" aria-hidden="true"></i>
          ${notas}
        </p>
        <p class="rp-note-author">— ${tecnico}</p>
      </div>
    </section>` : ''}

    <!-- ── CARRUSEL DE FOTOS ── -->
    ${tieneFotos ? `
    <section class="rp-photos" aria-label="Fotos del servicio">
      <div class="rp-photos-head">
        <span class="rp-photos-date">${_formatFechaLarga(fecha)} · ${tecnico}</span>
      </div>
      <div class="rp-carousel" id="rp-carousel">
        <div class="rp-carousel-track" id="rp-carousel-track">
          ${fotos.map((foto, i) => {
            const fotoUrl = _fotoToUrl(foto);
            return `
            <button class="rp-slide" data-slide onclick="BitacoraUI.openGallery(${i})"
                    aria-label="Ampliar foto ${i + 1} de ${fotos.length}">
              <img src="${fotoUrl}" alt="Foto ${i + 1} del servicio" loading="lazy" />
              <span class="rp-slide-zoom">
                <i class="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true"></i>
                Ampliar
              </span>
            </button>`;
          }).join('')}
        </div>
        ${fotos.length > 1 ? `
        <button class="rp-carousel-arrow prev" onclick="BitacoraUI.carouselScroll(-1)" aria-label="Foto anterior">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button class="rp-carousel-arrow next" onclick="BitacoraUI.carouselScroll(1)" aria-label="Foto siguiente">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
        <div class="rp-carousel-dots" id="rp-carousel-dots">
          ${fotos.map((_, i) => `<span class="rp-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></span>`).join('')}
        </div>` : ''}
      </div>
      ${notas ? `<p class="rp-photo-caption">"${notas}"</p>` : ''}
    </section>` : ''}

    <!-- ── BOTONES DE ACCIÓN ── -->
    <section class="rp-actions">
      <button class="rp-btn rp-btn-primary"
        onclick="PDFGenerator.generate(window._currentBitacora, window._currentClientProfile)"
        aria-label="Descargar reporte PDF">
        <i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i>
        Descargar reporte PDF
      </button>
      <button class="rp-btn rp-btn-ghost"
        onclick="BitacoraUI.contactTecnico()"
        aria-label="Contactar a mi técnico por WhatsApp">
        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
        Contactar a mi técnico por WhatsApp
      </button>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="rp-footer">
      <img src="images/logo.png" class="rp-footer-logo" alt="Pool Balance" width="40" height="40" />
      <p class="rp-footer-brand">Pool Balance™ · Veracruz, México</p>
      <p class="rp-footer-date">Servicio del ${_formatFechaLarga(fecha)}</p>
    </footer>

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
//  RENDER DE TARJETA DE PARÁMETRO (DARK)
// ─────────────────────────────────────────

function _renderParametroCardDark(key, cfg, val) {
  const exp       = cfg.explicacion(val);
  const pct       = _valToPct(val, cfg);
  const optMinPct = _valToPct(cfg.optMin, cfg);
  const optMaxPct = _valToPct(cfg.optMax, cfg);
  const estado    = _getEstadoParam(val, cfg);
  const st        = ESTADO_DARK[estado] || ESTADO_DARK.optimo;
  const valStr    = val.toFixed(cfg.decimales);
  const dotPct    = Math.min(Math.max(pct, 2), 98);

  return `
  <div class="rp-card rp-card--${estado} anim-fade-in-up">
    <div class="rp-card-top">
      <div class="rp-card-icon" style="background:${cfg.color}26; color:${cfg.color};">
        <i class="fa-solid ${cfg.icon}" aria-hidden="true"></i>
      </div>
      <div class="min-w-0">
        <p class="rp-card-label">${cfg.label}</p>
        <p class="rp-card-range">Óptimo: ${cfg.optMin}–${cfg.optMax} ${cfg.unidad}</p>
      </div>
    </div>

    <div class="rp-card-value" style="color:${st.color};">
      ${valStr}<span class="rp-card-unit">${cfg.unidad}</span>
    </div>

    <div class="rp-slider" aria-hidden="true">
      <div class="rp-slider-optimal" style="left:${optMinPct}%;width:${Math.max(optMaxPct - optMinPct, 2)}%;"></div>
      <div class="rp-slider-dot" style="left:${dotPct}%; --dot:${st.color};"></div>
    </div>
    <div class="rp-slider-scale">
      <span>${cfg.min}${cfg.unidad}</span>
      <span class="rp-slider-ok">✓ ${cfg.optMin}–${cfg.optMax}</span>
      <span>${cfg.max}${cfg.unidad}</span>
    </div>

    <p class="rp-card-note">${exp.emoji} ${exp.texto}</p>
  </div>
  `;
}

// ─────────────────────────────────────────
//  SCORE RING SVG (grande, con glow)
// ─────────────────────────────────────────

function _renderScoreRingBig(score) {
  const radius = 64;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 80 ? '#46c98a' : score >= 60 ? '#f0b94e' : '#ef6b6b';

  return `
  <svg width="170" height="170" viewBox="0 0 160 160" aria-hidden="true">
    <circle cx="80" cy="80" r="${radius}" fill="none"
            stroke="rgba(255,255,255,0.08)" stroke-width="11"/>
    <circle cx="80" cy="80" r="${radius}" fill="none"
            stroke="${color}" stroke-width="11"
            stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
            stroke-linecap="round"
            transform="rotate(-90 80 80)"
            style="filter: drop-shadow(0 0 6px ${color}aa); transition: stroke-dashoffset 1.2s ease;"/>
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

function _heroDesc(score) {
  if (score >= 90) return 'Todos los parámetros químicos están en perfecto equilibrio. El agua es completamente confortable y segura para nadar.';
  if (score >= 75) return 'El agua está segura y estable. Los parámetros se mantienen dentro de rango con ajustes mínimos.';
  if (score >= 60) return 'Tu agua requirió correcciones este servicio. Ya quedó balanceada y segura para su uso.';
  if (score >= 40) return 'Se corrigieron varios parámetros durante la visita. El agua ya está dentro de condiciones seguras.';
  return 'Se realizó una intervención intensiva para restablecer el equilibrio del agua. Revisa las acciones aplicadas.';
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
  // Zona de alerta: 50% fuera del rango óptimo
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
//  UI CONTROLLER (galería + carrusel + WhatsApp)
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

  // ── Carrusel de la vista de detalle ──
  carouselScroll(dir) {
    const track = document.getElementById('rp-carousel-track');
    if (!track) return;
    const slide = track.querySelector('[data-slide]');
    const w = slide ? slide.offsetWidth + 14 : track.clientWidth;
    track.scrollBy({ left: dir * w, behavior: 'smooth' });
  },

  _initCarousel() {
    const track = document.getElementById('rp-carousel-track');
    if (!track) return;
    const dots  = Array.from(document.querySelectorAll('#rp-carousel-dots .rp-dot'));
    const slide = track.querySelector('[data-slide]');
    if (!dots.length) return;

    const widthOf = () => (slide ? slide.offsetWidth + 14 : track.clientWidth);

    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / widthOf());
      dots.forEach((d, di) => d.classList.toggle('active', di === i));
    }, { passive: true });

    dots.forEach((d, di) => {
      d.addEventListener('click', () => {
        track.scrollTo({ left: di * widthOf(), behavior: 'smooth' });
      });
    });
  },

  contactTecnico() {
    const bit  = window._currentBitacora;
    const prof = window._currentClientProfile;
    const wa   = APP_CONFIG.company.whatsapp;
    const nombre = prof?.nombre ? prof.nombre.split(' ')[0] : '';
    const fechaTxt = bit?.fecha ? _formatFechaLarga(bit.fecha) : '';
    const msg = `Hola Pool Balance${nombre ? ', soy ' + nombre : ''}. Tengo una consulta sobre mi reporte de servicio${fechaTxt ? ' del ' + fechaTxt : ''}.`;
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
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
  BitacoraUI._initCarousel();
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') BitacoraUI.closeGallery();
    if (e.key === 'ArrowLeft')  BitacoraUI.galleryPrev();
    if (e.key === 'ArrowRight') BitacoraUI.galleryNext();
  });
};

window.renderBitacoraDetalle = renderBitacoraDetalle;
window.PARAMETROS = PARAMETROS;
