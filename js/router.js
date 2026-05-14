/**
 * ============================================================
 *  POOL BALANCE — SPA ROUTER
 *  Hash-based router con transiciones de vista y gestión
 *  de estado de navegación activa.
 * ============================================================
 */

// ── 🔧 FIX: Inicializar PostRender ANTES de que las vistas se registren ──
// Las vistas (biblioteca.js, portal.js, etc.) hacen "PostRender.xxx = ..."
// en el nivel superior del archivo. Como router.js carga antes que las vistas,
// aquí garantizamos que PostRender exista para evitar "ReferenceError".
window.PostRender = window.PostRender || {};

const Router = (() => {

  // ── Registro de rutas ──
  const routes = {};
  let currentView = null;
  let isNavigating = false;

  /**
   * Registra una ruta con su función de render
   * @param {string} name  - Nombre de la ruta (ej. 'home')
   * @param {Function} renderFn - Función que retorna HTML string
   */
  function register(name, renderFn) {
    routes[name] = renderFn;
  }

  /**
   * Navega a una vista por nombre
   * @param {string} viewName
   * @param {boolean} addToHistory
   */
  async function navigate(viewName, addToHistory = true) {
    if (isNavigating || viewName === currentView) return;
    if (!routes[viewName]) {
      console.warn(`[Router] Vista "${viewName}" no registrada.`);
      viewName = 'home';
    }

    isNavigating = true;
    const container = document.getElementById('view-container');

    // ── Transición de salida ──
    if (container.firstChild) {
      container.style.opacity = '0';
      container.style.transform = 'translateY(8px)';
      await sleep(180);
    }

    // ── Render de la nueva vista ──
    try {
      const html = await routes[viewName]();
      container.innerHTML = html;
      container.style.opacity = '';
      container.style.transform = '';
      container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

      // Trigger reflow para la transición
      container.offsetHeight;
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';

    } catch (err) {
      console.error('[Router] Error al renderizar vista:', err);
      container.innerHTML = renderErrorView(viewName, err);
    }

    // ── Actualizar estado ──
    currentView = viewName;

    // ── Scroll al top ──
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });

    // ── History API ──
    if (addToHistory) {
      const newHash = `#${viewName}`;
      if (window.location.hash !== newHash) {
        history.pushState({ view: viewName }, '', newHash);
      }
    }

    // ── Actualizar navegación activa ──
    Nav.setActive(viewName);

    // ── Disparar evento de vista lista ──
    document.dispatchEvent(new CustomEvent('viewRendered', { detail: { view: viewName } }));

    // ── Post-render hooks ──
    // Usamos setTimeout en lugar de requestAnimationFrame para garantizar
    // que el DOM esté completamente pintado antes de inicializar componentes JS
    if (typeof PostRender !== 'undefined' && PostRender[viewName]) {
      setTimeout(() => PostRender[viewName](), 50);
    }

    isNavigating = false;
  }

  /**
   * Inicializa el router: maneja hash inicial y navegación por historial
   */
  function init() {
    // Back/forward del navegador
    window.addEventListener('popstate', (e) => {
      const view = e.state?.view || getViewFromHash();
      navigate(view, false);
    });

    // Navegación por hash en URL
    const initialView = getViewFromHash();
    navigate(initialView, false);
  }

  /**
   * Extrae el nombre de vista del hash actual
   */
  function getViewFromHash() {
    const hash = window.location.hash.replace('#', '').trim();
    return routes[hash] ? hash : 'home';
  }

  /**
   * Vista de error genérica
   */
  function renderErrorView(viewName, err) {
    return `
      <div class="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <h2 class="text-xl font-bold text-marino mb-2">Error al cargar la vista</h2>
        <p class="text-sm text-gray-500 mb-6">No se pudo cargar "${viewName}". ${err?.message || ''}</p>
        <button onclick="Router.navigate('home')" class="btn btn-primary btn-sm">
          Ir al inicio
        </button>
      </div>
    `;
  }

  /** Utilidad: sleep para animaciones */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Obtener la vista actual */
  function getCurrent() { return currentView; }

  return { register, navigate, init, getCurrent };

})();

// Exponer globalmente
window.Router = Router;
