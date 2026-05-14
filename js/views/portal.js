/**
 * ============================================================
 *  POOL BALANCE — PORTAL DEL CLIENTE (REFACTORIZADO)
 *  Conectado a Firebase Authentication + Firestore
 *
 *  Pantalla A: Login  →  Firebase Auth
 *  Pantalla B: Dashboard  →  Firestore listener en tiempo real
 *  Pantalla C: Bitácora Detallada  →  renderBitacoraDetalle()
 * ============================================================
 */

// Estado del portal
const PortalState = {
  isAuthenticated: false,
  clientProfile:   null,
  bitacoras:       [],
  unsubscribe:     null,
};

// ─────────────────────────────────────────
//  RENDER PRINCIPAL
// ─────────────────────────────────────────

function renderPortal() {
  if (PortalState.isAuthenticated && PortalState.clientProfile) {
    return renderDashboard();
  }
  return renderLogin();
}

// ─────────────────────────────────────────
//  PANTALLA A: LOGIN
// ─────────────────────────────────────────

function renderLogin() {
  const { loginTitle, loginSubtitle, loginFields,
          loginCta, helpText } = APP_CONFIG.portal;
  const { company } = APP_CONFIG;
  const waUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Hola, olvidé mi código de acceso al portal Pool Balance.')}`;

  return `
  <article class="view-page portal-login" id="view-portal-login">
    <svg class="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none"
         viewBox="0 0 1440 120" fill="none" aria-hidden="true">
      <path d="M0,80 C360,20 720,120 1080,40 C1260,0 1380,60 1440,80 L1440,120 L0,120 Z" fill="#6FB8C6"/>
    </svg>

    <div class="login-card" role="main">
      <div class="login-logo">
        <svg width="52" height="52" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <rect width="56" height="56" rx="16" fill="#EEF1F5"/>
          <path d="M14 34C14 34 17 24 28 24C39 24 42 34 42 34" stroke="#6FB8C6" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M10 38C10 38 15 26 28 26C41 26 46 38 46 38" stroke="#0E4569" stroke-width="2" stroke-linecap="round" stroke-opacity="0.3"/>
          <circle cx="28" cy="20" r="5" fill="#C97A4F"/>
        </svg>
        <div class="login-logo-name">Pool Balance</div>
        <div class="badge badge-marino">${loginTitle}</div>
      </div>

      <p class="text-sm text-center mb-6 leading-relaxed" style="color:var(--text-secondary);">
        ${loginSubtitle}
      </p>

      <form id="login-form" onsubmit="PortalAuth.handleLogin(event)" novalidate>

        <div class="mb-4">
          <label class="input-label" for="client-id">${loginFields.clientId.label}</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-id-card input-icon" aria-hidden="true"></i>
            <input type="text" id="client-id" class="input-field with-icon"
              placeholder="${loginFields.clientId.placeholder}"
              autocomplete="username" autocapitalize="characters"
              required aria-required="true" aria-describedby="client-id-hint"/>
          </div>
          <p id="client-id-hint" class="text-xs mt-1" style="color:var(--text-muted);">
            <i class="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
            Lo encuentras en el reporte PDF de tu último servicio
          </p>
        </div>

        <div class="mb-6">
          <label class="input-label" for="access-code">${loginFields.accessCode.label}</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-lock input-icon" aria-hidden="true"></i>
            <input type="password" id="access-code" class="input-field with-icon"
              placeholder="${loginFields.accessCode.placeholder}"
              autocomplete="current-password" inputmode="numeric" maxlength="6"
              required aria-required="true"/>
            <button type="button" onclick="PortalAuth.togglePassword()"
              aria-label="Mostrar u ocultar código" id="toggle-pw-btn"
              style="position:absolute;right:12px;top:50%;transform:translateY(-50%);
                     background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;">
              <i class="fa-solid fa-eye" id="toggle-pw-icon" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div id="login-error" class="hidden mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
             style="background:var(--color-danger-bg);color:var(--color-danger);"
             role="alert" aria-live="assertive">
          <i class="fa-solid fa-circle-exclamation flex-shrink-0" aria-hidden="true"></i>
          <span id="login-error-msg"></span>
        </div>

        <button type="submit" class="btn btn-primary btn-full btn-lg" id="login-submit">
          <i class="fa-solid fa-right-to-bracket mr-1" aria-hidden="true"></i>
          ${loginCta}
        </button>
      </form>

      <div class="mt-4 p-3 rounded-xl text-center" style="background:var(--color-cristal-light);">
        <p class="text-xs font-medium" style="color:var(--color-cristal-dark);">
          <i class="fa-solid fa-flask-vial mr-1" aria-hidden="true"></i>
          <strong>Demo:</strong>&nbsp; ID <code>${APP_CONFIG.portal.demoClientId}</code>
          &nbsp;·&nbsp; Código <code>${APP_CONFIG.portal.demoAccessCode}</code>
        </p>
      </div>

      <p class="text-center text-xs mt-4" style="color:var(--text-muted);">
        <a href="${waUrl}" target="_blank" rel="noopener"
           style="color:var(--color-arcilla);" class="font-medium hover:underline">
          <i class="fa-brands fa-whatsapp mr-1" aria-hidden="true"></i>
          ${helpText}
        </a>
      </p>
    </div>
  </article>
  `;
}

// ─────────────────────────────────────────
//  PANTALLA B: DASHBOARD
// ─────────────────────────────────────────

function renderDashboard() {
  const client = PortalState.clientProfile;
  const bits   = PortalState.bitacoras;

  return `
  <article class="view-page" id="view-dashboard">

    <header class="dashboard-header" role="banner">
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-widest" style="color:rgba(255,255,255,0.5);">Bienvenido</span>
            <span class="flex items-center gap-1 text-xs" style="color:var(--color-cristal);">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--color-cristal);animation:pulse-soft 2s infinite;display:inline-block;"></span>
              En vivo
            </span>
          </div>
          <button onclick="PortalAuth.logout()" class="btn btn-sm"
            style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.15);font-size:0.75rem;"
            aria-label="Cerrar sesión">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
            Salir
          </button>
        </div>
        <h1 class="dashboard-client-name">${client.nombre || client.name}</h1>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="dashboard-plan-chip">
            <i class="fa-solid fa-star fa-xs" aria-hidden="true"></i>
            Plan ${client.plan}
          </span>
          <span class="text-xs" style="color:rgba(255,255,255,0.5);">
            <i class="fa-solid fa-location-dot mr-1" aria-hidden="true"></i>
            ${client.address || client.direccion || ''}
          </span>
        </div>
      </div>
    </header>

    <!-- Quick Stats -->
    <div class="dashboard-stats" role="region" aria-label="Resumen del servicio">
      <div class="dashboard-stat-card">
        <div class="dashboard-stat-value" id="stat-total">${bits.length}</div>
        <div class="dashboard-stat-label">Servicios</div>
      </div>
      <div class="dashboard-stat-card">
        <div class="dashboard-stat-value">${client.poolVolume || client.volumen_m3 || '—'}</div>
        <div class="dashboard-stat-label">Volumen</div>
      </div>
      <div class="dashboard-stat-card">
        <div class="dashboard-stat-value" style="color:var(--color-arcilla);">
          ${_daysUntilNext(client.nextVisit || client.proxima_visita)}
        </div>
        <div class="dashboard-stat-label">Próx. visita</div>
      </div>
    </div>

    <!-- Info rápida -->
    <section class="px-5 mb-5">
      <div class="card card-body-sm">
        <div class="grid grid-cols-2 gap-3">
          ${[
            { icon:'calendar',      label:'Próxima visita', value: _formatFecha(client.nextVisit || client.proxima_visita) },
            { icon:'user-clock',    label:'Cliente desde',  value: client.clientSince || client.cliente_desde || '—' },
            { icon:'layer-group',   label:'Plan activo',    value: client.plan },
            { icon:'ruler-combined',label:'Volumen',        value: client.poolVolume || client.volumen_m3 || '—' },
          ].map(item => `
            <div class="flex items-start gap-2">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                   style="background:var(--color-marino-xlight);">
                <i class="fa-solid fa-${item.icon} text-xs text-marino" aria-hidden="true"></i>
              </div>
              <div>
                <p class="text-xs" style="color:var(--text-muted);">${item.label}</p>
                <p class="text-sm font-semibold text-marino">${item.value}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Historial de Bitácoras -->
    <section class="px-5 pb-8" aria-labelledby="bitacoras-title">
      <div class="flex items-center justify-between mb-4">
        <h2 id="bitacoras-title" class="text-sm font-bold text-marino uppercase tracking-wide flex items-center gap-2">
          <i class="fa-solid fa-clipboard-list text-cristal" aria-hidden="true"></i>
          Historial de Servicios
        </h2>
        <span class="badge badge-marino" id="bitacoras-count">${bits.length}</span>
      </div>

      <div class="flex flex-col gap-4" id="bitacoras-list" role="feed"
           aria-label="Historial de bitácoras" aria-live="polite">
        ${bits.length
          ? bits.map(b => _renderBitacoraRow(b)).join('')
          : `<div class="card card-body text-center py-10">
               <div class="text-3xl mb-3">📋</div>
               <p class="font-bold text-marino mb-1">Sin servicios registrados aún</p>
               <p class="text-sm" style="color:var(--text-muted);">
                 Aquí aparecerán tus bitácoras después de cada visita.
               </p>
             </div>`
        }
      </div>

      ${client._isDemo ? `
      <div class="mt-5 p-4 rounded-2xl text-center"
           style="background:var(--color-cristal-light);border:1px dashed var(--color-cristal);">
        <p class="text-xs font-medium" style="color:var(--color-cristal-dark);">
          <i class="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
          <strong>Modo demo.</strong> Configura Firebase en
          <code>js/firebase/firebase.js</code> para datos reales.
        </p>
      </div>` : ''}
    </section>
  </article>
  `;
}

// ─────────────────────────────────────────
//  TARJETA DE BITÁCORA (fila del listado)
// ─────────────────────────────────────────

function _renderBitacoraRow(bit) {
  const score      = (typeof _calcScore === 'function') ? _calcScore(bit.lecturas) : 85;
  const estado     = bit.estado || 'optimo';
  const stCss      = { optimo:'badge-success', corregido:'badge-warning', alerta:'badge-danger' };
  const stLabel    = { optimo:'Óptimo', corregido:'Corregido', alerta:'Alerta' };
  const scoreColor = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
  const fotosCount = bit.fotos?.length || 0;

  return `
  <article class="bitacora-card" aria-label="Servicio del ${_formatFecha(bit.fecha)}">
    <header class="bitacora-header">
      <div>
        <div class="bitacora-id">${bit._id}</div>
        <div class="bitacora-date">${_formatFechaLarga(bit.fecha)}</div>
        <div class="bitacora-tech">
          <i class="fa-solid fa-user-tie text-xs mr-1" style="color:var(--color-cristal);" aria-hidden="true"></i>
          ${bit.tecnico}
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span class="badge ${stCss[estado] || 'badge-success'}">${stLabel[estado] || 'Óptimo'}</span>
        <div class="flex items-center gap-1.5">
          <div style="width:36px;height:4px;background:rgba(14,69,105,0.1);border-radius:99px;overflow:hidden;">
            <div style="width:${score}%;height:100%;background:${scoreColor};border-radius:99px;"></div>
          </div>
          <span class="text-xs font-bold" style="color:${scoreColor};">${score}</span>
        </div>
      </div>
    </header>

    <!-- Lecturas principales -->
    <div class="bitacora-readings" aria-label="Lecturas del servicio">
      ${[
        { label:'pH',      val: bit.lecturas?.ph,             cfg: window.PARAMETROS?.ph },
        { label:'Cl Lib.', val: bit.lecturas?.cloro_libre,    cfg: window.PARAMETROS?.cloro_libre },
        { label:'LSI',     val: bit.lecturas?.lsi,            cfg: window.PARAMETROS?.lsi },
        { label:'Alcal.',  val: bit.lecturas?.alcalinidad,    cfg: window.PARAMETROS?.alcalinidad },
        { label:'Dureza',  val: bit.lecturas?.dureza_calcica, cfg: window.PARAMETROS?.dureza_calcica },
      ].filter(p => p.val !== null && p.val !== undefined).map(p => {
        const est = (p.cfg && typeof _getEstadoParam === 'function')
          ? _getEstadoParam(p.val, p.cfg) : 'optimo';
        return `
          <div class="param-chip ${est === 'optimo' ? 'optimal' : est === 'alerta' ? 'warning' : 'danger'}"
               aria-label="${p.label}: ${p.val}">
            <span class="param-chip-value">${p.val}</span>
            <span class="param-chip-label">${p.label}</span>
          </div>`;
      }).join('')}
    </div>

    ${bit.acciones?.[0] ? `
    <div class="px-5 pb-2">
      <p class="text-xs" style="color:var(--text-muted);">
        <i class="fa-solid fa-check-circle mr-1 text-success text-xs" aria-hidden="true"></i>
        ${bit.acciones[0]}
        ${bit.acciones.length > 1
          ? `<span class="ml-1 font-semibold" style="color:var(--color-marino);">+${bit.acciones.length - 1} más</span>`
          : ''}
      </p>
    </div>` : ''}

    <div class="bitacora-btns">
      <button class="btn btn-primary btn-sm"
        onclick="PortalNav.openBitacora('${bit._id}')"
        aria-label="Ver análisis completo de bitácora ${bit._id}">
        <i class="fa-solid fa-magnifying-glass-chart" aria-hidden="true"></i>
        Ver análisis completo
      </button>
      ${fotosCount > 0 ? `
      <button class="btn btn-sm"
        onclick="PortalNav.openBitacora('${bit._id}')"
        style="background:var(--color-marino-xlight);color:var(--color-marino);"
        aria-label="${fotosCount} fotos">
        <i class="fa-solid fa-camera" aria-hidden="true"></i>
        ${fotosCount} foto${fotosCount > 1 ? 's' : ''}
      </button>` : ''}
      <button class="btn btn-sm"
        onclick="PortalNav.downloadPDFFromList('${bit._id}')"
        style="background:var(--color-danger-bg);color:var(--color-danger);"
        aria-label="Descargar PDF">
        <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
        PDF
      </button>
    </div>
  </article>
  `;
}

// ─────────────────────────────────────────
//  AUTH CONTROLLER
// ─────────────────────────────────────────

const PortalAuth = {

  async handleLogin(event) {
    event.preventDefault();
    const btn    = document.getElementById('login-submit');
    const errEl  = document.getElementById('login-error');
    const errMsg = document.getElementById('login-error-msg');
    const idEl   = document.getElementById('client-id');
    const pinEl  = document.getElementById('access-code');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Verificando…';
    errEl.classList.add('hidden');

    const result = await AuthService.login(
      idEl.value.trim().toUpperCase(),
      pinEl.value.trim()
    );

    if (result.success) {
      PortalState.isAuthenticated = true;
      PortalState.clientProfile   = result.profile;
      await this._loadBitacoras(result.profile);
      this._renderDashboard();
      Toast.show(`Bienvenido${result.profile?.nombre ? ', ' + result.profile.nombre.split(' ')[0] : ''}`, 'success');
    } else {
      errEl.classList.remove('hidden');
      errMsg.textContent = result.error;
      this._shakeCard();
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-right-to-bracket mr-1"></i>${APP_CONFIG.portal.loginCta}`;
    }
  },

  async _loadBitacoras(profile) {
    const clientId  = profile._id || APP_CONFIG.portal.demoClientId;
    const albercaId = profile.alberca_id || 'principal';

    if (PortalState.unsubscribe) PortalState.unsubscribe();

    PortalState.unsubscribe = FirestoreService.subscribeToBitacoras(
      clientId,
      (bitacoras) => {
        PortalState.bitacoras = bitacoras;
        const listEl  = document.getElementById('bitacoras-list');
        const countEl = document.getElementById('bitacoras-count');
        const statEl  = document.getElementById('stat-total');
        if (listEl) {
          listEl.innerHTML = bitacoras.length
            ? bitacoras.map(b => _renderBitacoraRow(b)).join('')
            : `<div class="card card-body text-center py-10">
                 <div class="text-3xl mb-3">📋</div>
                 <p class="font-bold text-marino">Sin servicios registrados aún</p>
               </div>`;
        }
        if (countEl) countEl.textContent = bitacoras.length;
        if (statEl)  statEl.textContent  = bitacoras.length;
      },
      albercaId
    );
  },

  _renderDashboard() {
    const container = document.getElementById('view-container');
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = renderDashboard();
      container.style.opacity = '1';
      document.getElementById('main-content')?.scrollTo({ top:0 });
      Nav.setActive('portal');
      PostRender.portal();
    }, 180);
  },

  async logout() {
    if (PortalState.unsubscribe) { PortalState.unsubscribe(); PortalState.unsubscribe = null; }
    FirestoreService.unsubscribeAll();
    await AuthService.logout();
    PortalState.isAuthenticated = false;
    PortalState.clientProfile   = null;
    PortalState.bitacoras       = [];
    Router.navigate('portal');
    Toast.show('Sesión cerrada correctamente', 'success');
  },

  togglePassword() {
    const input = document.getElementById('access-code');
    const icon  = document.getElementById('toggle-pw-icon');
    if (!input || !icon) return;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  },

  _shakeCard() {
    const card = document.querySelector('.login-card');
    if (!card) return;
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'shake 0.4s ease';
  },
};

// ─────────────────────────────────────────
//  NAVEGACIÓN INTERNA DEL PORTAL
// ─────────────────────────────────────────

const PortalNav = {

  openBitacora(bitacoraId) {
    const bit = PortalState.bitacoras.find(b => b._id === bitacoraId);
    if (!bit) { Toast.show('No se encontró la bitácora.', 'error'); return; }

    window._currentBitacora      = bit;
    window._currentClientProfile = PortalState.clientProfile;

    const container = document.getElementById('view-container');
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = renderBitacoraDetalle(bit, PortalState.clientProfile?.nombre);
      container.style.opacity = '1';
      document.getElementById('main-content')?.scrollTo({ top:0, behavior:'instant' });
      PostRender.bitacora();
    }, 180);
  },

  async downloadPDFFromList(bitacoraId) {
    const bit = PortalState.bitacoras.find(b => b._id === bitacoraId);
    if (!bit) { Toast.show('No se encontró la bitácora.', 'error'); return; }
    window._currentBitacora      = bit;
    window._currentClientProfile = PortalState.clientProfile;
    await PDFGenerator.generate(bit, PortalState.clientProfile);
  },
};

// ─────────────────────────────────────────
//  HELPERS DE FECHA
// ─────────────────────────────────────────

function _formatFecha(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { year:'numeric', month:'short', day:'numeric' });
}

function _formatFechaLarga(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
}

function _daysUntilNext(dateStr) {
  if (!dateStr) return '—';
  const diff = Math.ceil((new Date(dateStr + 'T12:00:00') - new Date()) / 86400000);
  if (diff <= 0) return 'Hoy';
  return diff + 'd';
}

// ─────────────────────────────────────────
//  POST-RENDER
// ─────────────────────────────────────────

PostRender.portal = function() {
  window.PortalAuth = PortalAuth;
  window.PortalNav  = PortalNav;
};
window.PostRender = PostRender;
