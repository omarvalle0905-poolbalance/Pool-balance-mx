/**
 * ============================================================
 *  POOL BALANCE — NAV COMPONENT
 *  Maneja Bottom Nav (mobile) + Sidebar (desktop)
 *  y la sincronización del estado activo entre ambas.
 * ============================================================
 */

const Nav = (() => {

  /**
   * Inicializa todos los listeners de navegación
   */
  function init() {
    // ── Bottom Navigation buttons ──
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) Router.navigate(view);
      });
    });

    // ── Sidebar links ──
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        if (view) Router.navigate(view);
      });
    });

    // ── Delegación de eventos para links de vistas dinámicas ──
    document.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-navigate]');
      if (navBtn) {
        e.preventDefault();
        const view = navBtn.dataset.navigate;
        if (view) Router.navigate(view);
      }
    });

    // ── WhatsApp FAB link ──
    _updateWhatsAppLinks();
  }

  /**
   * Actualiza el estado activo en bottom nav y sidebar
   * @param {string} activeView
   */
  function setActive(activeView) {
    // Bottom Nav
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === activeView);
    });

    // Sidebar links
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
      link.classList.toggle('active', link.dataset.view === activeView);
    });
  }

  /**
   * Actualiza los links de WhatsApp con el número del config
   */
  function _updateWhatsAppLinks() {
    const wa = APP_CONFIG.company.whatsapp;
    const msg = encodeURIComponent('Hola Pool Balance, me gustaría agendar una visita de diagnóstico para mi alberca.');
    const waUrl = `https://wa.me/${wa}?text=${msg}`;

    const sidebarBtn = document.getElementById('sidebar-whatsapp');
    if (sidebarBtn) sidebarBtn.href = waUrl;

    // FAB flotante
    const fab = document.getElementById('whatsapp-fab');
    if (fab) fab.href = waUrl;
  }

  return { init, setActive };

})();

window.Nav = Nav;
