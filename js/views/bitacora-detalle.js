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

  const score = _calcScore(lecturas);

  // Dynamic chemical chips
  let chipsHTML = '';
  if (quimicos_usados) {
    const chips = [];
    if (quimicos_usados.cloro_kg > 0) {
      chips.push(`<div style="background-color: #1A2030; color: #EEF1F5; font-size: 13px; font-weight: 500; border-radius: 9999px; padding: 8px 14px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif; display: flex; align-items: center; gap: 6px;">🧪 Hipoclorito · ${quimicos_usados.cloro_kg} kg</div>`);
    }
    if (quimicos_usados.acido_mur_lt > 0) {
      chips.push(`<div style="background-color: #1A2030; color: #EEF1F5; font-size: 13px; font-weight: 500; border-radius: 9999px; padding: 8px 14px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif; display: flex; align-items: center; gap: 6px;">⚗️ Ácido muriático · ${quimicos_usados.acido_mur_lt} L</div>`);
    }
    if (quimicos_usados.bicarbonato_kg > 0) {
      chips.push(`<div style="background-color: #1A2030; color: #EEF1F5; font-size: 13px; font-weight: 500; border-radius: 9999px; padding: 8px 14px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif; display: flex; align-items: center; gap: 6px;">🧂 Bicarbonato · ${quimicos_usados.bicarbonato_kg} kg</div>`);
    }
    if (chips.length === 0) {
       chips.push(`<div style="background-color: #1A2030; color: #EEF1F5; font-size: 13px; font-weight: 500; border-radius: 9999px; padding: 8px 14px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif;">✨ Ningún químico requerido</div>`);
    }
    chipsHTML = chips.join('');
  } else {
    // Falls back to prompt's default demo values
    chipsHTML = `
      <div style="background-color: #1A2030; color: #EEF1F5; font-size: 13px; font-weight: 500; border-radius: 9999px; padding: 8px 14px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif;">🧪 Hipoclorito · 250 ml</div>
      <div style="background-color: #1A2030; color: #EEF1F5; font-size: 13px; font-weight: 500; border-radius: 9999px; padding: 8px 14px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif;">⚗️ Ácido muriático · 100 ml</div>
      <div style="background-color: #1A2030; color: #EEF1F5; font-size: 13px; font-weight: 500; border-radius: 9999px; padding: 8px 14px; white-space: nowrap; font-family: 'Bricolage Grotesque', sans-serif;">🧂 Cianúrico · 200 g</div>
    `;
  }

  // Dynamic alert validation
  let hasAlertBanner = false;
  let alertBannerMsg = "Espera 2 horas antes de usar la alberca. El cloro bajará a rango seguro solo.";
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

  return `
  <!-- Scoped style overrides for Premium Dark Theme -->
  <style>
    #view-bitacora-detalle {
      background-color: #0A0E14 !important;
      color: #EEF1F5 !important;
      font-family: 'Bricolage Grotesque', sans-serif !important;
      padding: 16px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 600px;
      margin: 0 auto;
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
        onclick="Router.navigate('portal')"
        style="width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background-color: #11161F; color: #6FB8C6; border: 1px solid rgba(111,184,198,0.15); transition: background-color 0.2s; cursor:pointer;"
        aria-label="Volver al portal"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
    </div>

    <!-- ── HERO DE SALUD DEL AGUA ── -->
    <div class="premium-dark-card" style="background: linear-gradient(180deg, #0E4569 0%, #0a3350 60%, #0A0E14 100%) !important; padding: 32px 16px; display: flex; flex-direction: column; align-items: center; gap: 20px; border: none !important;">
      <div>
        ${_renderScoreRing(score)}
      </div>
      <div style="text-align: center;">
        <h1 style="color: #EEF1F5; font-size: 22px; font-weight: 700; margin-bottom: 4px; font-family: 'Bricolage Grotesque', sans-serif;">
          ${_scoreLabel(score)}
        </h1>
        <p style="color: #d8eff3; font-size: 14px; font-weight: 400; line-height: 1.5; font-family: 'Bricolage Grotesque', sans-serif; max-width: 290px; margin: 0 auto; opacity: 0.9;">
          ${_getScoreHint(score)}
        </p>
      </div>
    </div>

    <!-- ── SECCIÓN PARÁMETROS DEL AGUA (GRID ESTRICTO DE 2 COLUMNAS) ── -->
    <div>
      <h2 style="color: #6FB8C6; font-size: 11px; font-weight: 600; letter-spacing: 2px; margin-bottom: 12px; font-family: 'Bricolage Grotesque', sans-serif; text-transform: uppercase;">
        PARÁMETROS DEL AGUA
      </h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        ${parametrosAMostrar.map(key => {
          const cfg = PARAMETROS[key];
          const val = lecturas[key];
          if (val === undefined || val === null || !cfg) return '';
          return _renderParametroCard(key, cfg, val);
        }).join('')}
      </div>
    </div>

    <!-- ── VISITA TÉCNICA ── -->
    <div class="premium-dark-card" style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
      <div style="font-size: 12px; font-weight: 500; color: #6FB8C6; font-family: 'Bricolage Grotesque', sans-serif;">
        ${_formatFechaLarga(fecha)} · ${tecnico || 'Omar Valle'}
      </div>
      
      <!-- Photo placeholder / real photo with carousel callback trigger -->
      <div style="position: relative; width: 100%; height: 200px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
        <img 
          src="${fotos?.length ? _fotoToUrl(fotos[0]) : 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'}" 
          alt="Fotografía de servicio" 
          style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;"
          onclick="BitacoraUI.openGallery(0)"
        />
        <div style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(0,0,0,0.6); border-radius: 8px; padding: 4px 8px; color: #EEF1F5; font-size: 11px; display: flex; align-items: center; gap: 4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          Ampliar
        </div>
      </div>
      
      <div style="color: #EEF1F5; font-size: 14px; font-weight: 400; line-height: 1.6; font-family: 'Bricolage Grotesque', sans-serif;">
        "${notas || 'Servicio periódico realizado. Filtro limpio, fondo aspirado y parámetros equilibrados. El agua es completamente confortable.'}"
      </div>
      
      <!-- Signature Line -->
      <div style="height: 1px; background-color: #1A2030; width: 100%;"></div>
      
      <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-family: 'Bricolage Grotesque', sans-serif;">
        <span style="color: #E8664A; font-weight: 700;">✓</span>
        <span style="color: #E8664A; font-weight: 700;">Omar Valle</span>
        <span style="color: #6FB8C6;">· Pool Balance Veracruz</span>
      </div>
    </div>

    <!-- ── PRODUCTOS APLICADOS (HORIZONTAL SCROLL CHIPS) ── -->
    <div>
      <h2 style="color: #6FB8C6; font-size: 11px; font-weight: 600; letter-spacing: 2px; margin-bottom: 12px; font-family: 'Bricolage Grotesque', sans-serif; text-transform: uppercase;">
        PRODUCTOS APLICADOS
      </h2>
      <div class="custom-scrollbar" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;">
        ${chipsHTML}
      </div>
    </div>

    <!-- ── BANNER DE ALERTA DINÁMICO ── -->
    ${hasAlertBanner ? `
    <div style="background-color: rgba(232, 168, 56, 0.12); border-left: 3px solid #E8A838; border-radius: 12px; padding: 14px; display: flex; gap: 10px; align-items: start;">
      <span style="color: #E8A838; font-size: 16px;">⚠️</span>
      <div style="color: #EEF1F5; font-size: 13px; font-weight: 500; font-family: 'Bricolage Grotesque', sans-serif; line-height: 1.4;">
        ${alertBannerMsg}
      </div>
    </div>` : ''}

    <!-- ── ACCIONES REALIZADAS (Adicional si existen en bítacora real) ── -->
    ${acciones?.length ? `
    <div class="premium-dark-card" style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
      <h3 style="color: #6FB8C6; font-size: 11px; font-weight: 600; letter-spacing: 2px; font-family: 'Bricolage Grotesque', sans-serif;">ACCIONES REALIZADAS</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${acciones.map(acc => `
          <div style="display: flex; align-items: start; gap: 8px; font-size: 13px;">
            <span style="color: #2D9E6B; font-weight: bold;">✓</span>
            <span style="color: #EEF1F5;">${acc}</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- ── GALERÍA 3D CAROUSEL (Si existe más de una foto en la bitácora) ── -->
    ${fotos?.length > 1 ? `
    <section aria-labelledby="fotos-title" style="overflow:hidden; display: flex; flex-direction: column; gap: 12px;">
      <h2 id="fotos-title" style="color: #6FB8C6; font-size: 11px; font-weight: 600; letter-spacing: 2px; font-family: 'Bricolage Grotesque', sans-serif; text-transform: uppercase;">
        RECHAZO DE SÓLIDOS Y MEJORAS (${fotos.length} fotos)
      </h2>
      
      <div class="gallery-3d-wrapper">
        <button class="gallery-3d-arrow prev" onclick="BitacoraUI.slide3D(-1)" aria-label="Foto anterior" type="button">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        
        <div class="gallery-3d-container">
          <div class="gallery-3d-track" id="gallery-3d-track" role="list">
            ${fotos.map((foto, i) => {
              const fotoUrl = _fotoToUrl(foto);
              return `
              <div
                class="gallery-3d-card"
                role="listitem"
                data-index="${i}"
                onclick="BitacoraUI.handleCardClick(${i})"
                tabindex="0"
                aria-label="Ver foto ${i + 1} de ${fotos.length}"
              >
                <img src="${fotoUrl}" alt="Foto ${i + 1} del servicio" loading="lazy" />
                <div class="gallery-3d-overlay">
                  <i class="fa-solid fa-expand text-white text-base"></i>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <button class="gallery-3d-arrow next" onclick="BitacoraUI.slide3D(1)" aria-label="Foto siguiente" type="button">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        
        <div class="gallery-3d-dots" id="gallery-3d-dots">
          ${fotos.map((_, i) => `<span class="gallery-3d-dot ${i === 0 ? 'active' : ''}" onclick="BitacoraUI.goTo3DSlide(${i})" role="button" aria-label="Ir a foto ${i+1}"></span>`).join('')}
        </div>
      </div>
    </section>` : ''}

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

    <!-- Lightbox galería -->
    <div id="gallery-modal" class="photo-modal hidden" role="dialog" aria-modal="true" aria-label="Galería de fotos" style="z-index: 1000;">
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
  const estado    = _getEstadoParam(val, cfg);
  
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

  return `
  <div class="premium-dark-card p-3 flex flex-col justify-between" style="min-height: 142px; gap: 8px;">
    <div>
      <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
        <span style="color: #6FB8C6; display: flex; align-items: center;" class="flex-shrink-0">
          ${svgIcon}
        </span>
        <span style="color: #6FB8C6; font-size: 11px; font-weight: 500; font-family: 'Bricolage Grotesque', sans-serif;" class="truncate">${cfg.label}</span>
      </div>
      
      <div style="display: flex; align-items: baseline; margin-top: 4px;">
        <span style="color: #EEF1F5; font-size: 20px; font-weight: 700; font-family: 'Bricolage Grotesque', sans-serif;">${valStr}</span>
        <span style="color: #8B95A7; font-size: 11px; margin-left: 2px; font-family: 'Bricolage Grotesque', sans-serif;">${cfg.unidad}</span>
      </div>
    </div>

    <div>
      <!-- Range bar visual indicator with glow -->
      <div style="height: 4px; background-color: #1A2030; border-radius: 9999px; position: relative; width: 100%; margin-bottom: 6px;">
        <div style="position: absolute; top: -3px; left: ${pct}%; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; filter: drop-shadow(0 0 6px ${color}); transform: translateX(-50%);"></div>
      </div>
      
      <!-- Didactic Commentary -->
      <p style="color: ${textColor}; font-size: 11px; font-weight: 400; line-height: 1.3; font-family: 'Bricolage Grotesque', sans-serif; margin: 0;">
        ${exp.emoji} ${exp.texto}
      </p>
    </div>
  </div>`;
}

// ─────────────────────────────────────────
//  SCORE RING SVG (DIÁMETRO 200PX, GLOW EN VER DE ALGA)
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
        translateX = diff * 75; 
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

  // Inicializar galería 3D Coverflow
  BitacoraUI._current3DIndex = 0;
  setTimeout(() => {
    BitacoraUI.update3DGallery();
    BitacoraUI.init3DSwipe();
  }, 100);
};

window.renderBitacoraDetalle = renderBitacoraDetalle;
window.PARAMETROS = PARAMETROS;
