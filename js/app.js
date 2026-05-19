/**
 * ============================================================
 *  POOL BALANCE — APP.JS
 *  Módulo principal: inicialización, registro de rutas,
 *  sistema de toasts, Service Worker y FAB de WhatsApp.
 * ============================================================
 */

// ─────────────────────────────────────────
//  TOAST SYSTEM
// ─────────────────────────────────────────

const Toast = (() => {
  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info:    'fa-circle-info',
  };

  function show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info}" aria-hidden="true"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return { show };
})();

window.Toast = Toast;

// ─────────────────────────────────────────
//  WHATSAPP FAB
// ─────────────────────────────────────────

function injectWhatsAppFab() {
  const { whatsapp } = APP_CONFIG.company;
  const msg = encodeURIComponent('Hola Pool Balance, me gustaría agendar una visita de diagnóstico para mi alberca.');
  const waUrl = `https://wa.me/${whatsapp}?text=${msg}`;

  const fab = document.createElement('a');
  fab.id = 'whatsapp-fab';
  fab.href = waUrl;
  fab.target = '_blank';
  fab.rel = 'noopener noreferrer';
  fab.className = 'whatsapp-fab';
  fab.setAttribute('aria-label', 'Contactar por WhatsApp');
  fab.setAttribute('title', 'Agendar visita por WhatsApp');
  fab.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i>';

  document.body.appendChild(fab);
}

// ─────────────────────────────────────────
//  SERVICE WORKER REGISTRATION
// ─────────────────────────────────────────

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => {
          console.log('[SW] Registrado correctamente. Scope:', reg.scope);

          // Notificar al usuario cuando hay actualización disponible
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                Toast.show('Nueva versión disponible. Recarga para actualizar.', 'info', 6000);
              }
            });
          });
        })
        .catch(err => console.warn('[SW] Error al registrar:', err));
    });
  }
}

// ─────────────────────────────────────────
//  LOADER HIDE
// ─────────────────────────────────────────

function hideLoader() {
  const loader = document.getElementById('app-loader');
  const app    = document.getElementById('app');

  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }

  if (app) {
    app.classList.remove('opacity-0');
    app.style.opacity = '1';
  }
}

// ── Seguro de emergencia: si algo falla, el loader desaparece igual ──
// Evita que la pantalla azul se quede trabada en producción (Vercel)
setTimeout(() => {
  const loader = document.getElementById('app-loader');
  const app    = document.getElementById('app');
  if (loader && loader.style.display !== 'none') {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 400);
  }
  if (app) {
    app.classList.remove('opacity-0');
    app.style.opacity = '1';
  }
}, 3500); // 3.5 segundos máximo — si para entonces no cargó, se muestra igual

// ─────────────────────────────────────────
//  GLOBAL KEYBOARD NAVIGATION
// ─────────────────────────────────────────

function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    // No actuar dentro de inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    const viewMap = {
      '1': 'home',
      '2': 'servicios',
      '3': 'biblioteca',
      '4': 'portal',
    };

    if (viewMap[e.key] && !e.ctrlKey && !e.metaKey) {
      Router.navigate(viewMap[e.key]);
    }
  });
}

// ─────────────────────────────────────────
//  INTERSECTION OBSERVER — animaciones al scroll
// ─────────────────────────────────────────

function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // Observar elementos con animaciones de entrada
  document.querySelectorAll('.anim-fade-in-up').forEach(el => {
    // Solo si aún no es visible
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    }
  });
}

// Reiniciar observer en cada render de vista
document.addEventListener('viewRendered', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => initScrollAnimations());
  });
});

// ─────────────────────────────────────────
//  SHAKE ANIMATION (CSS injection para login)
// ─────────────────────────────────────────

function injectAdditionalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      15% { transform: translateX(-6px); }
      30% { transform: translateX(6px); }
      45% { transform: translateX(-4px); }
      60% { transform: translateX(4px); }
      75% { transform: translateX(-2px); }
      90% { transform: translateX(2px); }
    }

    /* Transición suave del contenedor de vistas */
    #view-container {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    /* Smooth scroll en main content */
    #main-content {
      scroll-behavior: smooth;
    }

    /* iOS safe area padding */
    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .bottom-nav {
        padding-bottom: env(safe-area-inset-bottom);
        height: calc(80px + env(safe-area-inset-bottom));
      }
    }

    /* Focus ring mejorado para accesibilidad */
    .bottom-nav-item:focus-visible,
    .sidebar-link:focus-visible,
    .btn:focus-visible {
      outline: 2px solid var(--color-cristal);
      outline-offset: 2px;
    }

    /* Prevenir zoom en inputs en iOS */
    @media screen and (max-width: 767px) {
      input[type="text"],
      input[type="password"],
      input[type="email"],
      input[type="number"],
      textarea {
        font-size: 16px !important;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .card { border: 1px solid rgba(14,69,105,0.3); }
      .btn-primary { border: 2px solid var(--color-arcilla-dark); }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────
//  META DINÁMICA desde config.js
// ─────────────────────────────────────────

function syncMetaFromConfig() {
  const { seo, company } = APP_CONFIG;

  // Title
  document.title = seo.title;

  // Description
  _setMeta('name', 'description', seo.description);

  // Open Graph
  _setMeta('property', 'og:title',       seo.title);
  _setMeta('property', 'og:description', seo.description);
  _setMeta('property', 'og:image',       seo.ogImage);
  _setMeta('property', 'og:type',        seo.ogType);
  _setMeta('property', 'og:url',         seo.canonicalUrl);

  // Theme color
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) themeColorMeta.content = '#0E4569';
}

function _setMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

// ─────────────────────────────────────────
//  INICIALIZACIÓN PRINCIPAL
// ─────────────────────────────────────────

async function initApp() {
  // 1. Estilos adicionales
  injectAdditionalStyles();

  // 2. Meta SEO desde config
  syncMetaFromConfig();

  // 3. PostRender global
  window.PostRender = window.PostRender || {};

 // 4. ── FIREBASE INIT (async) ──────────────
  //  Esperamos a que Firebase se descargue y conecte antes de seguir
  const fb = await initFirebase();
  if (fb) {
    console.log('%c🔥 Conectado a Firebase Firestore', 'color:#FFCA28;font-weight:bold;');
  } else {
    console.warn('%c⚡ Modo Demo — configura Firebase en js/firebase/firebase.js', 'color:#C97A4F;');
  }

  // 5. Registrar rutas en el Router
  Router.register('home',       () => renderHome());
  Router.register('servicios',  () => renderServicios());
  Router.register('biblioteca', () => renderBiblioteca());
  Router.register('portal',     () => renderPortal());

  // 6. Inicializar navegación
  Nav.init();

  // 7. Inicializar Router (carga vista inicial desde hash)
  Router.init();

  // 8. WhatsApp FAB flotante
  injectWhatsAppFab();

  // 9. Atajos de teclado (desktop)
  initKeyboardNav();

  // 10. Ocultar loader de inicio
  setTimeout(hideLoader, 700);

  // 11. Service Worker (PWA offline)
  registerServiceWorker();

  // 12. Logs de desarrollo
  console.log(
    '%c🌊 Pool Balance PWA%c v2.0 — Firebase Edition · Veracruz, México',
    'color:#6FB8C6;font-size:14px;font-weight:bold;',
    'color:#0E4569;font-size:12px;'
  );
  console.log('%c📄 Contenido → data/config.js', 'color:#C97A4F;font-size:11px;');
  console.log('%c🔥 Firebase  → js/firebase/firebase.js', 'color:#FFCA28;font-size:11px;');
}

// ─────────────────────────────────────────
//  ARRANQUE cuando el DOM esté listo
// ─────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
