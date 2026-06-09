/**
 * ============================================================
 *  POOL BALANCE — PORTAL DEL CLIENTE (v5.0.0 · DARK PREMIUM)
 *  Conectado a Firebase Authentication + Firestore
 *
 *  Cambios v5.0.0:
 *  - Rediseño completo en modo oscuro premium (login + dashboard),
 *    mismo lenguaje visual que el reporte de servicio.
 *  - Escalado "fill-width" (.fit-canvas + zoom) para que se vea
 *    grande y a pantalla completa como un WebView nativo.
 *  - Lógica de autenticación y Firestore SIN cambios.
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
  // Sesión recordada: si el cliente ya inició sesión antes en este
  // dispositivo, restaurar automáticamente sin volver a pedir datos.
  if (typeof localStorage !== 'undefined' && localStorage.getItem('pb_session')) {
    PortalAuth.restoreSession();
    return _renderRestoring();
  }
  return renderLogin();
}

function _renderRestoring() {
  return `
  <article class="view-page portal-dark" id="view-portal-restoring">
    <div style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;">
      <img src="images/logo.png" alt="Pool Balance" width="74" height="74"
           style="border-radius:20px;object-fit:contain;background:rgba(255,255,255,0.06);padding:8px;" />
      <div style="display:flex;align-items:center;gap:10px;color:var(--color-cristal);font-weight:600;">
        <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> Cargando tu portal…
      </div>
    </div>
  </article>`;
}

// ─────────────────────────────────────────
//  PANTALLA A: LOGIN (dark premium)
// ─────────────────────────────────────────

function renderLogin() {
  const { loginTitle, loginSubtitle, loginFields,
          loginCta, helpText } = APP_CONFIG.portal;
  const { company } = APP_CONFIG;
  const waUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Hola, olvidé mi código de acceso al portal Pool Balance.')}`;

  return `
  <article class="view-page portal-dark" id="view-portal-login">
    <div class="fit-canvas" id="portal-fit">
      <div class="pd-login-wrap">
        <div class="pd-login-card login-card" role="main">

          <div class="pd-login-logo">
            <img src="images/logo.png" alt="Pool Balance" width="66" height="66" />
            <div class="pd-login-name">Pool<span>Balance</span></div>
            <div class="pd-badge">${loginTitle}</div>
          </div>

          <p class="pd-login-sub">${loginSubtitle}</p>

          <form id="login-form" onsubmit="PortalAuth.handleLogin(event)" novalidate>

            <div class="pd-field">
              <label class="pd-label" for="client-id">${loginFields.clientId.label}</label>
              <div class="pd-input-wrap">
                <i class="fa-solid fa-id-card pd-input-icon" aria-hidden="true"></i>
                <input type="text" id="client-id" class="pd-input"
                  placeholder="${loginFields.clientId.placeholder}"
                  autocomplete="username" autocapitalize="characters"
                  required aria-required="true" aria-describedby="client-id-hint"/>
              </div>
              <p id="client-id-hint" class="pd-hint">
                <i class="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
                Lo encuentras en el reporte PDF de tu último servicio
              </p>
            </div>

            <div class="pd-field">
              <label class="pd-label" for="access-code">${loginFields.accessCode.label}</label>
              <div class="pd-input-wrap">
                <i class="fa-solid fa-lock pd-input-icon" aria-hidden="true"></i>
                <input type="password" id="access-code" class="pd-input"
                  placeholder="${loginFields.accessCode.placeholder}"
                  autocomplete="current-password" inputmode="numeric" maxlength="6"
                  required aria-required="true"/>
                <button type="button" onclick="PortalAuth.togglePassword()"
                  aria-label="Mostrar u ocultar código" id="toggle-pw-btn" class="pd-eye">
                  <i class="fa-solid fa-eye" id="toggle-pw-icon" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <div id="login-error" class="pd-error hidden" role="alert" aria-live="assertive">
              <i class="fa-solid fa-circle-exclamation flex-shrink-0" aria-hidden="true"></i>
              <span id="login-error-msg"></span>
            </div>

            <button type="submit" class="pd-btn-coral" id="login-submit">
              <i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
              ${loginCta}
            </button>
          </form>

          <p class="pd-help">
            <a href="${waUrl}" target="_blank" rel="noopener">
              <i class="fa-brands fa-whatsapp mr-1" aria-hidden="true"></i>
              ${helpText}
            </a>
          </p>
        </div>
      </div>
    </div>
  </article>
  `;
}

// ─────────────────────────────────────────
//  PANTALLA B: DASHBOARD (dark premium)
// ─────────────────────────────────────────

function renderDashboard() {
  const client = PortalState.clientProfile;
  const bits   = PortalState.bitacoras;

  return `
  <article class="view-page portal-dark" id="view-dashboard">
    <div class="fit-canvas" id="portal-fit">

      <header class="pd-hero" role="banner">
        <div class="pd-hero-top">
          <span class="pd-eyebrow">
            Bienvenido
            <span class="pd-live"><span class="pd-live-dot"></span> En vivo</span>
          </span>
          <button onclick="PortalAuth.logout()" class="pd-logout" aria-label="Cerrar sesión">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
            Salir
          </button>
        </div>
        <h1 class="pd-client">${client.nombre || client.name}</h1>
        <div class="pd-hero-meta">
          <span class="pd-plan">
            <i class="fa-solid fa-star fa-xs" aria-hidden="true"></i>
            Plan ${client.plan}
          </span>
          <span class="pd-loc">
            <i class="fa-solid fa-location-dot mr-1" aria-hidden="true"></i>
            ${client.address || client.direccion || ''}
          </span>
        </div>
      </header>

      <div class="pd-stats" role="region" aria-label="Resumen del servicio">
        <div class="pd-stat">
          <div class="pd-stat-val" id="stat-total">${bits.length}</div>
          <div class="pd-stat-lbl">Servicios</div>
        </div>
        <div class="pd-stat">
          <div class="pd-stat-val">${client.poolVolume || client.volumen_m3 || '—'}</div>
          <div class="pd-stat-lbl">Volumen</div>
        </div>
        <div class="pd-stat">
          <div class="pd-stat-val" style="color:var(--color-arcilla);">
            ${_daysUntilNext(client.nextVisit || client.proxima_visita)}
          </div>
          <div class="pd-stat-lbl">Próx. visita</div>
        </div>
      </div>

      <div class="pd-card pd-info">
        <div class="pd-info-grid">
          ${[
            { icon:'calendar',      label:'Próxima visita', value: _formatFecha(client.nextVisit || client.proxima_visita) },
            { icon:'user-clock',    label:'Cliente desde',  value: client.clientSince || client.cliente_desde || '—' },
            { icon:'layer-group',   label:'Plan activo',    value: client.plan },
            { icon:'ruler-combined',label:'Volumen',        value: client.poolVolume || client.volumen_m3 || '—' },
          ].map(item => `
            <div class="pd-info-item">
              <div class="pd-info-ico"><i class="fa-solid fa-${item.icon}" aria-hidden="true"></i></div>
              <div>
                <p class="pd-info-lbl">${item.label}</p>
                <p class="pd-info-val">${item.value}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <section class="pd-history" aria-labelledby="bitacoras-title">
        <div class="pd-history-head">
          <h2 id="bitacoras-title">
            <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>
            Historial de Servicios
          </h2>
          <span class="pd-count" id="bitacoras-count">${bits.length}</span>
        </div>

        <div class="pd-list" id="bitacoras-list" role="feed" aria-label="Historial de bitácoras" aria-live="polite">
          ${bits.length
            ? bits.map(b => _renderBitacoraRow(b)).join('')
            : _emptyHistory()
          }
        </div>

        ${client._isDemo ? `
        <div class="pd-demo-note">
          <i class="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
          <strong>Modo demo.</strong> Configura Firebase en <code>js/firebase/firebase.js</code> para datos reales.
        </div>` : ''}
      </section>

    </div>
  </article>
  `;
}

function _emptyHistory() {
  return `
    <div class="pd-empty">
      <div class="pd-empty-emoji">📋</div>
      <p class="pd-empty-title">Sin servicios registrados aún</p>
      <p class="pd-empty-sub">Aquí aparecerán tus bitácoras después de cada visita.</p>
    </div>`;
}

// ─────────────────────────────────────────
//  TARJETA DE BITÁCORA (fila del listado · dark)
// ─────────────────────────────────────────

function _renderBitacoraRow(bit) {
  const score      = (typeof _scoreMostrado === 'function') ? _scoreMostrado(bit)
                   : (typeof _calcScore === 'function') ? _calcScore(bit.lecturas) : 85;
  const estado     = bit.estado || 'optimo';
  const stMap      = {
    optimo:    { bg:'rgba(70,201,138,0.16)',  c:'#5fcf97', label:'Óptimo' },
    corregido: { bg:'rgba(240,185,78,0.16)',  c:'#f0b94e', label:'Corregido' },
    alerta:    { bg:'rgba(239,107,107,0.16)', c:'#ef6b6b', label:'Alerta' },
  };
  const st         = stMap[estado] || stMap.optimo;
  const scoreColor = score >= 80 ? '#5fcf97' : score >= 60 ? '#f0b94e' : '#ef6b6b';
  const fotosCount = bit.fotos?.length || 0;

  const chips = [
    { key:'ph',             label:'pH',      val: bit.lecturas?.ph,             cfg: window.PARAMETROS?.ph },
    { key:'cloro_libre',    label:'Cl Lib.', val: bit.lecturas?.cloro_libre,    cfg: window.PARAMETROS?.cloro_libre },
    { key:'lsi',            label:'LSI',     val: bit.lecturas?.lsi,            cfg: window.PARAMETROS?.lsi },
    { key:'alcalinidad',    label:'Alcal.',  val: bit.lecturas?.alcalinidad,    cfg: window.PARAMETROS?.alcalinidad },
    { key:'dureza_calcica', label:'Dureza',  val: bit.lecturas?.dureza_calcica, cfg: window.PARAMETROS?.dureza_calcica },
  ].filter(p => p.val !== null && p.val !== undefined).map(p => {
    const est = (typeof _estadoParamCtx === 'function') ? _estadoParamCtx(p.key, p.cfg, p.val, bit)
              : (p.cfg && typeof _getEstadoParam === 'function') ? _getEstadoParam(p.val, p.cfg) : 'optimo';
    const c   = est === 'optimo' ? '#5fcf97' : est === 'alerta' ? '#f0b94e' : '#ef6b6b';
    return `
      <div class="pd-chip" aria-label="${p.label}: ${p.val}">
        <span class="pd-chip-val" style="color:${c};">${p.val}</span>
        <span class="pd-chip-lbl">${p.label}</span>
      </div>`;
  }).join('');

  return `
  <article class="pd-bita" aria-label="Servicio del ${_formatFecha(bit.fecha)}">
    <header class="pd-bita-head">
      <div>
        <div class="pd-bita-id">${bit._id}</div>
        <div class="pd-bita-date">${_formatFechaLarga(bit.fecha)}</div>
        <div class="pd-bita-tech">
          <i class="fa-solid fa-user-tie text-xs" style="color:var(--color-cristal);margin-right:4px;" aria-hidden="true"></i>
          ${bit.tecnico}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <span class="pd-bita-badge" style="background:${st.bg};color:${st.c};">${st.label}</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="width:40px;height:5px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden;">
            <div style="width:${score}%;height:100%;background:${scoreColor};border-radius:99px;"></div>
          </div>
          <span style="font-size:0.8rem;font-weight:700;color:${scoreColor};">${score}</span>
        </div>
      </div>
    </header>

    <div class="pd-chips" aria-label="Lecturas del servicio">
      ${chips}
    </div>

    ${bit.acciones?.[0] ? `
    <div class="pd-bita-action">
      <i class="fa-solid fa-circle-check" style="color:#5fcf97;margin-right:5px;" aria-hidden="true"></i>
      ${bit.acciones[0]}
      ${bit.acciones.length > 1 ? `<span style="color:var(--color-cristal);font-weight:700;margin-left:4px;">+${bit.acciones.length - 1} más</span>` : ''}
    </div>` : ''}

    <div class="pd-bita-btns">
      <button class="pd-bita-btn primary" onclick="PortalNav.openBitacora('${bit._id}')"
        aria-label="Ver análisis completo de bitácora ${bit._id}">
        <i class="fa-solid fa-magnifying-glass-chart" aria-hidden="true"></i>
        Ver análisis completo
      </button>
      ${fotosCount > 0 ? `
      <button class="pd-bita-btn soft" onclick="PortalNav.openBitacora('${bit._id}')" aria-label="${fotosCount} fotos">
        <i class="fa-solid fa-camera" aria-hidden="true"></i>
        ${fotosCount} foto${fotosCount > 1 ? 's' : ''}
      </button>` : ''}
      <button class="pd-bita-btn pdf" onclick="PortalNav.downloadPDFFromList('${bit._id}')" aria-label="Descargar PDF">
        <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
        PDF
      </button>
    </div>
  </article>
  `;
}

// ─────────────────────────────────────────
//  AUTH CONTROLLER  (lógica sin cambios)
// ─────────────────────────────────────────

const PortalAuth = {

  async loginAsDemoDirect() {
    const idEl   = document.getElementById('client-id');
    const pinEl  = document.getElementById('access-code');
    if (idEl) idEl.value = APP_CONFIG.portal.demoClientId;
    if (pinEl) pinEl.value = APP_CONFIG.portal.demoAccessCode;

    const btn = document.getElementById('btn-demo-direct');
    const submitBtn = document.getElementById('login-submit');
    const originalText = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Iniciando demo…';
    }
    if (submitBtn) submitBtn.disabled = true;

    const result = await AuthService.login(
      APP_CONFIG.portal.demoClientId,
      APP_CONFIG.portal.demoAccessCode
    );

    if (result.success) {
      PortalState.isAuthenticated = true;
      PortalState.clientProfile   = result.profile;
      this._saveSession(APP_CONFIG.portal.demoClientId, APP_CONFIG.portal.demoAccessCode);
      await this._loadBitacoras(result.profile);
      this._renderDashboard();
      Toast.show("Acceso Demo Autorizado", "success");
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      if (submitBtn) submitBtn.disabled = false;
      Toast.show("Error al iniciar demo: " + result.error, "error");
    }
  },

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
      this._saveSession(idEl.value.trim().toUpperCase(), pinEl.value.trim());
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
            : _emptyHistory();
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

  // ── Sesión recordada (persistencia local) ──
  _saveSession(id, code) {
    try { localStorage.setItem('pb_session', JSON.stringify({ id, code })); } catch (e) {}
  },

  async restoreSession() {
    let creds = null;
    try { creds = JSON.parse(localStorage.getItem('pb_session') || 'null'); } catch (e) { creds = null; }
    if (!creds || !creds.id) { this._failRestore(); return; }

    const result = await AuthService.login(creds.id, creds.code);
    if (result.success) {
      PortalState.isAuthenticated = true;
      PortalState.clientProfile   = result.profile;
      await this._loadBitacoras(result.profile);
      const c = document.getElementById('view-container');
      if (c) {
        c.innerHTML = renderDashboard();
        document.getElementById('main-content')?.scrollTo({ top: 0 });
        Nav.setActive('portal');
        PostRender.portal();
      }
    } else {
      try { localStorage.removeItem('pb_session'); } catch (e) {}
      this._failRestore();
    }
  },

  _failRestore() {
    const c = document.getElementById('view-container');
    if (c) { c.innerHTML = renderLogin(); PostRender.portal(); }
  },

  async logout() {
    try { localStorage.removeItem('pb_session'); } catch (e) {}
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

    // Entrada de historial: el botón "atrás" del teléfono regresa al
    // dashboard en lugar de salir de la aplicación.
    try { history.pushState({ pbView: 'servicio', id: bitacoraId }, '', '#servicio'); } catch (e) {}

    const container = document.getElementById('view-container');
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = renderBitacoraDetalle(bit, PortalState.clientProfile?.nombre);
      container.style.opacity = '1';
      document.getElementById('main-content')?.scrollTo({ top:0, behavior:'instant' });
      PostRender.bitacora();
    }, 180);
  },

  // Regresa del reporte al dashboard (flecha del portal).
  backToDashboard() {
    if (window.history.state && window.history.state.pbView === 'servicio') {
      window.history.back();            // dispara popstate → muestra dashboard
    } else {
      this._showDashboard();
    }
  },

  _showDashboard() {
    const container = document.getElementById('view-container');
    if (!container) return;
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = renderDashboard();
      container.style.opacity = '1';
      document.getElementById('main-content')?.scrollTo({ top:0 });
      Nav.setActive('portal');
      PostRender.portal();
    }, 150);
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
//  ESCALADO "FILL-WIDTH" (igual que el reporte)
//  El lienzo .fit-canvas se diseña a 412px y se escala
//  con zoom para llenar siempre el ancho real de pantalla.
// ─────────────────────────────────────────

function _fitPortalCanvas() {
  const DESIGN = 412;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const scale = Math.max(0.5, vw / DESIGN);
  document.querySelectorAll('#view-portal-login .fit-canvas, #view-dashboard .fit-canvas')
    .forEach(el => { el.style.zoom = scale.toFixed(4); });
}

// ─────────────────────────────────────────
//  POST-RENDER
// ─────────────────────────────────────────

PostRender.portal = function() {
  window.PortalAuth = PortalAuth;
  window.PortalNav  = PortalNav;

  _fitPortalCanvas();
  setTimeout(_fitPortalCanvas, 60);
  setTimeout(_fitPortalCanvas, 300);

  if (window._portalFitHandler) {
    window.removeEventListener('resize', window._portalFitHandler);
  }
  window._portalFitHandler = _fitPortalCanvas;
  window.addEventListener('resize', window._portalFitHandler);

  // Botón "atrás" del teléfono: si el cliente está viendo un reporte,
  // regresa al dashboard en vez de salir de la aplicación.
  if (!window._pbPopstateBound) {
    window._pbPopstateBound = true;
    window.addEventListener('popstate', function () {
      if (document.getElementById('view-bitacora-detalle') && PortalState.isAuthenticated) {
        PortalNav._showDashboard();
      }
    });
  }
};
window.PostRender = PostRender;
