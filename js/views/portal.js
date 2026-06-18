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

      <!-- ── CABECERA: logo limpio + saludo typewriter ── -->
      <header class="pd-hero2" role="banner">
        <div class="pd-hero2-top">
          <div class="pd-brandmark" aria-hidden="true">
            <img src="images/logo.png" alt="" class="pd-brandmark-img" width="48" height="48" draggable="false" />
            <span class="pd-brandmark-pulse"></span>
          </div>
          <button onclick="PortalAuth.logout()" class="pd-logout" aria-label="Cerrar sesión">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
            Salir
          </button>
        </div>

        <h1 class="pd-greet" id="pd-greet"
            data-greet="${(_saludoCliente(client) || '').replace(/"/g, '&quot;')}">
          <span class="pd-greet-text" id="pd-greet-text"></span><span class="pd-greet-caret" id="pd-greet-caret">|</span>
        </h1>

        <div class="pd-plan-row">
          <button class="pd-plan-btn" onclick="PortalNav.openUpsell()"
                  aria-label="Ver mi plan y opciones de mejora">
            <i class="fa-solid fa-star fa-xs" aria-hidden="true"></i>
            <span>Plan ${client.plan}</span>
            <i class="fa-solid fa-chevron-right pd-plan-chevron" aria-hidden="true"></i>
          </button>
          ${(client.address || client.direccion) ? `
          <span class="pd-loc">
            <i class="fa-solid fa-location-dot mr-1" aria-hidden="true"></i>
            ${client.address || client.direccion}
          </span>` : ''}
        </div>
      </header>

      <!-- ── DOS TARJETAS: Próxima visita · Retrolavado ── -->
      <div class="pd-twin" id="pd-twin">
        ${_twinCardsHTML(client, bits)}
      </div>

      <!-- ── CARRUSEL 3D DE BITÁCORAS ── -->
      <section class="pd-carousel-sec" aria-labelledby="bitacoras-title">
        <div class="pd-history-head">
          <h2 id="bitacoras-title">
            <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>
            Bitácoras de servicio
          </h2>
          <span class="pd-count" id="bitacoras-count">${bits.length}</span>
        </div>

        <div id="bitacoras-carousel">
          ${_renderCarousel3D(bits)}
        </div>

        ${client._isDemo ? `
        <div class="pd-demo-note">
          <i class="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
          <strong>Modo demo.</strong> Configura Firebase en <code>js/firebase/firebase.js</code> para datos reales.
        </div>` : ''}
      </section>

    </div>

    <!-- ── MODAL DE MEJORA DE PLAN (upsell · cableado para el futuro) ── -->
    <div id="pd-upsell-modal" class="pd-upsell-modal hidden" role="dialog" aria-modal="true"
         aria-label="Mejora tu plan" onclick="if(event.target===this)PortalNav.closeUpsell()">
      <div class="pd-upsell-card">
        <button class="pd-upsell-x" onclick="PortalNav.closeUpsell()" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="pd-upsell-ico"><i class="fa-solid fa-arrow-trend-up"></i></div>
        <h3 class="pd-upsell-title">Tu plan actual: ${client.plan}</h3>
        <p class="pd-upsell-sub">Muy pronto podrás mejorar tu plan y desbloquear visitas ilimitadas, atención prioritaria 24 h y análisis de laboratorio — directo desde aquí.</p>
        <a class="pd-upsell-cta" id="pd-upsell-cta" href="#" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> Quiero saber más
        </a>
      </div>
    </div>
  </article>
  `;
}

// ── Saludo personalizado con tratamiento cortés ──
function _saludoCliente(client) {
  if (!client) return 'Bienvenido';
  if (client.saludo) return client.saludo;
  const full = String(client.nombre || client.name || 'Cliente').trim();
  if (/^familia/i.test(full)) return `Bienvenida ${full}`;
  const first = full.split(/\s+/)[0];
  // Por defecto "Bienvenido"; con el campo `genero: 'f'` cambia a "Bienvenida".
  const g = String(client.genero || client.sexo || '').toLowerCase();
  return `${g.startsWith('f') ? 'Bienvenida' : 'Bienvenido'}, ${first}`;
}

// ── Litros de retrolavado del mes en curso (fallback: última bitácora) ──
function _retroDelMes(bitacoras) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const delMes = (bitacoras || []).filter(b => typeof b.fecha === 'string' && b.fecha.startsWith(ym));
  if (delMes.length) {
    return delMes.reduce((s, b) => s + (Number(b.litros_retrolav) || 0), 0);
  }
  const ultima = (bitacoras || []).find(b => Number(b.litros_retrolav) > 0);
  return ultima ? Number(ultima.litros_retrolav) : 0;
}

// ── Las dos tarjetas del dashboard: Próxima visita + Retrolavado ──
function _twinCardsHTML(client, bits) {
  const dias  = _daysUntilNext(client.nextVisit || client.proxima_visita);
  const fecha = _formatFecha(client.nextVisit || client.proxima_visita);
  const retro = _retroDelMes(bits);
  const retroStr = retro > 0 ? Math.round(retro).toLocaleString('es-MX') : '—';

  return `
    <div class="pd-twin-card">
      <div class="pd-twin-ico"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i></div>
      <div class="pd-twin-body">
        <p class="pd-twin-lbl">Próxima visita</p>
        <p class="pd-twin-val" style="color:var(--color-arcilla);">${dias}</p>
        <p class="pd-twin-sub">${fecha}</p>
      </div>
    </div>
    <div class="pd-twin-card">
      <div class="pd-twin-ico"><i class="fa-solid fa-droplet" aria-hidden="true"></i></div>
      <div class="pd-twin-body">
        <p class="pd-twin-lbl">Retrolavado del mes</p>
        <p class="pd-twin-val">${retroStr}<span class="pd-twin-unit">${retro > 0 ? ' L' : ''}</span></p>
        <p class="pd-twin-sub">agua recuperada del filtro</p>
      </div>
    </div>
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
//  CARRUSEL 3D DE BITÁCORAS (coverflow)
// ─────────────────────────────────────────

const ST_MAP = {
  optimo:    { bg:'rgba(70,201,138,0.16)',  bd:'rgba(70,201,138,0.45)',  c:'#5fcf97', label:'Óptimo' },
  corregido: { bg:'rgba(240,185,78,0.16)',  bd:'rgba(240,185,78,0.45)',  c:'#f0b94e', label:'Corregido' },
  alerta:    { bg:'rgba(239,107,107,0.16)', bd:'rgba(239,107,107,0.45)', c:'#ef6b6b', label:'Alerta' },
};

function _scoreColorHex(score) {
  return score >= 80 ? '#5fcf97' : score >= 60 ? '#f0b94e' : '#ef6b6b';
}

function _renderCarousel3D(bits) {
  if (!bits || !bits.length) return _emptyHistory();

  const cards = bits.map((b, i) => _carouselCardHTML(b, i)).join('');
  const dots  = bits.map((_, i) => `
    <button class="pcar-dot ${i === 0 ? 'active' : ''}" data-cdot="${i}" type="button"
            aria-label="Ir a la bitácora ${i + 1}"></button>`).join('');

  return `
    <div class="pcar" id="pcar" role="region" aria-roledescription="carrusel" aria-label="Bitácoras">
      <div class="pcar-stage" id="pcar-stage">
        ${cards}
      </div>

      <button class="pcar-arrow prev" id="pcar-prev" type="button" aria-label="Anterior">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="pcar-arrow next" id="pcar-next" type="button" aria-label="Siguiente">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    <div class="pcar-dots" id="pcar-dots">${dots}</div>
    <p class="pcar-hint">Desliza o usa las flechas para navegar</p>
  `;
}

function _carouselCardHTML(bit, i) {
  const score  = (typeof _scoreMostrado === 'function') ? _scoreMostrado(bit)
               : (typeof _calcScore === 'function') ? _calcScore(bit.lecturas) : 85;
  const estado = bit.estado || 'optimo';
  const st     = ST_MAP[estado] || ST_MAP.optimo;
  const accent = st.c;
  const fotosCount = bit.fotos?.length || 0;

  const metrics = [
    { key:'ph',             label:'PH',     val: bit.lecturas?.ph },
    { key:'cloro_libre',    label:'CL LIB', val: bit.lecturas?.cloro_libre },
    { key:'lsi',            label:'LSI',    val: bit.lecturas?.lsi },
    { key:'alcalinidad',    label:'ALCAL',  val: bit.lecturas?.alcalinidad },
    { key:'dureza_calcica', label:'DUREZA', val: bit.lecturas?.dureza_calcica },
  ].filter(m => m.val !== null && m.val !== undefined).map(m => {
    const cfg = window.PARAMETROS?.[m.key];
    const est = (typeof _estadoParamCtx === 'function') ? _estadoParamCtx(m.key, cfg, m.val, bit)
              : (cfg && typeof _getEstadoParam === 'function') ? _getEstadoParam(m.val, cfg) : 'optimo';
    const c   = est === 'optimo' ? '#5fcf97' : est === 'alerta' ? '#f0b94e' : '#ef6b6b';
    return `
      <div class="pcar-metric">
        <div class="pcar-metric-val" style="color:${c};">${m.val}</div>
        <div class="pcar-metric-lbl">${m.label}</div>
      </div>`;
  }).join('');

  const accion = bit.acciones?.[0] || '';
  const extra  = (bit.acciones && bit.acciones.length > 1) ? `+${bit.acciones.length - 1} más` : '';
  const hora   = _horaBitacora(bit);

  return `
    <div class="pcar-slide" data-cindex="${i}">
      <article class="pcar-card" style="--accent:${accent};">
        <div class="pcar-card-bar"></div>
        <div class="pcar-card-body">
          <div class="pcar-card-top">
            <span class="pcar-time">${hora ? `<i class="fa-regular fa-clock" aria-hidden="true"></i> ${hora}` : 'Servicio'}</span>
            <span class="pcar-badge" style="color:${accent};border-color:${st.bd};background:${st.bg};">${st.label}</span>
          </div>

          <h3 class="pcar-date">${_formatFechaLarga(bit.fecha)}</h3>

          <div class="pcar-tech-row">
            <span class="pcar-tech"><i class="fa-solid fa-user-tie" aria-hidden="true"></i> ${bit.tecnico || 'Pool Balance'}</span>
            <span class="pcar-score-wrap">
              <span class="pcar-score-bar"><span style="width:${score}%;background:${accent};"></span></span>
              <span class="pcar-score-num" style="color:${accent};">${score}</span>
            </span>
          </div>

          <div class="pcar-metrics">${metrics}</div>

          ${accion ? `
          <div class="pcar-tag">
            <i class="fa-solid fa-circle-check" style="color:#5fcf97;" aria-hidden="true"></i>
            <span class="pcar-tag-text">${accion}</span>
            ${extra ? `<span class="pcar-tag-extra">${extra}</span>` : ''}
          </div>` : '<div class="pcar-tag-spacer"></div>'}

          <div class="pcar-actions">
            <button class="pcar-btn-primary" onclick="PortalNav.openBitacora('${bit._id}')"
                    aria-label="Ver análisis de la bitácora ${bit._id}">
              <i class="fa-solid fa-magnifying-glass-chart" aria-hidden="true"></i> Ver análisis
            </button>
            <button class="pcar-btn-icon" onclick="PortalNav.downloadPDFFromList('${bit._id}')" aria-label="Descargar PDF">
              <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="pcar-veil"></div>
      </article>
    </div>
  `;
}

// ── Controlador del carrusel 3D (vanilla, táctil) ──
const PortalCarousel = {
  active: 0,
  total: 0,
  _bound: false,
  _onUp: null,

  init() {
    const stage = document.getElementById('pcar-stage');
    if (!stage) return;
    this.total = stage.querySelectorAll('.pcar-slide').length;
    this.active = Math.min(this.active, Math.max(0, this.total - 1));
    this.layout();

    const prev = document.getElementById('pcar-prev');
    const next = document.getElementById('pcar-next');
    prev && (prev.onclick = () => this.go(this.active - 1));
    next && (next.onclick = () => this.go(this.active + 1));

    document.querySelectorAll('[data-cdot]').forEach(d => {
      d.onclick = () => this.go(parseInt(d.dataset.cdot, 10));
    });

    // Enlazar gestos UNA sola vez por elemento (init() puede llamarse
    // varias veces; sin este guard los listeners se duplican y el swipe
    // saltaba de 2 en 2).
    if (!stage.dataset.carBound) {
      stage.dataset.carBound = '1';

      // Click en una tarjeta lateral → centrarla (ignorar si fue swipe)
      stage.querySelectorAll('.pcar-slide').forEach(sl => {
        sl.addEventListener('click', (e) => {
          if (this._swiped) { this._swiped = false; e.stopPropagation(); return; }
          const idx = parseInt(sl.dataset.cindex, 10);
          if (idx !== this.active && !e.target.closest('button')) {
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

    if (!this._bound) {
      this._bound = true;
      document.addEventListener('keydown', (e) => {
        if (!document.getElementById('pcar-stage')) return;
        if (document.getElementById('view-bitacora-detalle')) return;
        if (e.key === 'ArrowRight') this.go(this.active + 1);
        if (e.key === 'ArrowLeft')  this.go(this.active - 1);
      });
    }
  },

  go(i) {
    if (!this.total) return;
    this.active = ((i % this.total) + this.total) % this.total;
    this.layout();
  },

  layout() {
    const slides = Array.from(document.querySelectorAll('#pcar-stage .pcar-slide'));
    const total = slides.length;
    slides.forEach((sl, i) => {
      let offset = i - this.active;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      let transform, opacity, z, pe = 'auto';
      if (offset === 0) {
        transform = 'translateX(-50%) rotateY(0deg) scale(1)';
        opacity = 1; z = 30;
      } else if (Math.abs(offset) === 1) {
        const dir = offset > 0 ? 1 : -1;
        transform = `translateX(calc(-50% + ${dir * 70}%)) rotateY(${dir * -34}deg) scale(0.82)`;
        opacity = 1; z = 20;
      } else {
        const dir = offset > 0 ? 1 : -1;
        transform = `translateX(calc(-50% + ${dir * 84}%)) rotateY(${dir * -34}deg) scale(0.78)`;
        opacity = 0; z = 10; pe = 'none';
      }
      sl.style.transform = transform;
      sl.style.opacity = opacity;
      sl.style.zIndex = z;
      sl.style.pointerEvents = pe;
      sl.classList.toggle('is-active', offset === 0);
    });

    document.querySelectorAll('[data-cdot]').forEach((d, i) => {
      d.classList.toggle('active', i === this.active);
    });
  },

  refresh() {
    const wrap = document.getElementById('bitacoras-carousel');
    if (!wrap) return;
    this.active = 0;
    wrap.innerHTML = _renderCarousel3D(PortalState.bitacoras);
    requestAnimationFrame(() => this.init());
  },
};
window.PortalCarousel = PortalCarousel;

// ── Efecto máquina de escribir del saludo ──
function _initGreetTypewriter() {
  const el   = document.getElementById('pd-greet-text');
  const host = document.getElementById('pd-greet');
  const caret = document.getElementById('pd-greet-caret');
  if (!el || !host) return;
  const full = host.dataset.greet || '';
  if (host.dataset.typed === '1') { el.textContent = full; return; }
  host.dataset.typed = '1';
  el.textContent = '';

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { el.textContent = full; if (caret) caret.style.display = 'none'; return; }

  let n = 0;
  const tick = () => {
    if (n <= full.length) {
      el.textContent = full.slice(0, n);
      n++;
      setTimeout(tick, 55 + Math.random() * 45);
    } else if (caret) {
      caret.classList.add('pd-greet-caret--blink');
    }
  };
  // pequeño retraso para que el saludo "nazca" tras aparecer el logo
  setTimeout(tick, 360);
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
        const countEl = document.getElementById('bitacoras-count');
        if (countEl) countEl.textContent = bitacoras.length;

        // Refrescar tarjetas (Próxima visita · Retrolavado)
        const twinEl = document.getElementById('pd-twin');
        if (twinEl) twinEl.innerHTML = _twinCardsHTML(PortalState.clientProfile || {}, bitacoras);

        // Refrescar carrusel 3D de bitácoras
        if (window.PortalCarousel && document.getElementById('bitacoras-carousel')) {
          PortalCarousel.refresh();
        }
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
    document.body.style.overflow = '';

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
    document.body.style.overflow = ''; // por si quedó el candado del visor
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

  // ── Modal de mejora de plan (upsell · preparado para el futuro) ──
  openUpsell() {
    const modal = document.getElementById('pd-upsell-modal');
    if (!modal) return;
    // Cablear el CTA de WhatsApp con un mensaje contextual
    const cta = document.getElementById('pd-upsell-cta');
    if (cta) {
      const wa  = APP_CONFIG.company.whatsapp;
      const plan = PortalState.clientProfile?.plan || '';
      const msg = `Hola Pool Balance, tengo el plan ${plan} y me gustaría conocer las opciones para mejorarlo.`;
      cta.href = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeUpsell() {
    const modal = document.getElementById('pd-upsell-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  },
};

// ─────────────────────────────────────────
//  HELPERS DE FECHA
// ─────────────────────────────────────────

// Hora legible del servicio (ej. "2:30 p.m."). La saca del campo `hora`
// si existe, o la parsea del id/fecha (formato ..._HHMM / con hora).
function _horaBitacora(bit) {
  if (!bit) return '';
  let hhmm = null;
  if (bit.hora && /^\d{1,2}:\d{2}/.test(bit.hora)) {
    hhmm = bit.hora;
  } else {
    // Solo del id, y solo si trae hora tras "_" o "T" (ej. 2026-06-06_1430).
    const m = String(bit._id || '').match(/[_T](\d{2})[:_]?(\d{2})(?!\d)/);
    if (m) hhmm = `${m[1]}:${m[2]}`;
  }
  if (!hhmm) return '';
  const [H, M] = hhmm.split(':').map(Number);
  if (isNaN(H) || H > 23 || (M || 0) > 59) return '';
  const d = new Date();
  d.setHours(H, M || 0, 0, 0);
  return d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true });
}

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
  // Tope de escala: en teléfonos el lienzo llena el ancho (zoom ≈ 1); en
  // pantallas anchas (tablet/escritorio) NO debe inflarse — se mantiene como
  // una columna tipo teléfono centrada, al mismo "tamaño de render" que el
  // resto de la app. Sin este tope el portal se veía gigante (zoom 3x) junto
  // a la landing y el sidebar.
  const MAX = 1.15;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const scale = Math.min(MAX, Math.max(0.5, vw / DESIGN));
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

  // Inicializar carrusel 3D y saludo typewriter del dashboard
  if (document.getElementById('view-dashboard')) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (window.PortalCarousel) PortalCarousel.init();
      _initGreetTypewriter();
    }));
    setTimeout(() => { if (window.PortalCarousel) PortalCarousel.init(); }, 200);
  }

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
      const ui = window.BitacoraUI;
      // Retroceso sintético al cerrar la foto con la X: solo consumir.
      if (ui && ui._suppressPop) {
        ui._suppressPop = false;
        document.body.style.overflow = '';
        return;
      }
      // SIEMPRE liberar el candado de scroll del visor de fotos: si la
      // navegación ocurre con el modal abierto y no se libera, la app
      // queda "congelada" (no se puede hacer scroll en ninguna vista).
      document.body.style.overflow = '';
      // Foto abierta → este "atrás" cierra la foto, no navega.
      if (ui && typeof ui.isGalleryOpen === 'function' && ui.isGalleryOpen()) {
        ui.closeGallery(true);
        return;
      }
      if (document.getElementById('view-bitacora-detalle') && PortalState.isAuthenticated) {
        PortalNav._showDashboard();
      }
    });
  }
};
window.PostRender = PostRender;
