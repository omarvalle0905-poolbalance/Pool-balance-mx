/**
 * ============================================================
 *  POOL BALANCE — VISTA 1: HOME
 *  v3.0 — Rediseño cinematográfico oscuro.
 *         · Hero con capa "aurora" + grano + carousel.
 *         · Barra de confianza, método en timeline,
 *           testimonios, FAQ acordeón y CTA flotante.
 *         · Animaciones de revelado por IntersectionObserver.
 *         Conserva toda la lógica de carousel/audio v2.3.
 * ============================================================
 */

// ── Render principal ──────────────────────────────────────────
function renderHome() {
  const { hero, problemSection, methodSection, whySection,
          trustBadges, testimonialsSection, faqSection } = APP_CONFIG.home;
  const { company } = APP_CONFIG;

  const waUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Hola Pool Balance, me gustaría conocer más sobre sus servicios.')}`;

  // Tarjetas de foto enmarcadas (no cubren toda la pantalla, sin recorte
  // agresivo) — se deslizan con scroll-snap nativo.
  const slidesHTML = hero.slides.map((s, i) => `
    <figure class="hef-card" data-slide="${i}">
      <div class="hef-img" style="background-image:url('${s.image}')"></div>
      ${s.tag ? `<figcaption class="hef-tag hef-tag--${s.accent}">${s.tag}</figcaption>` : ''}
    </figure>`).join('');

  const dotsHTML = hero.slides.map((_, i) => `
    <button class="hef-dot ${i === 0 ? 'active' : ''}"
            data-hdot="${i}" type="button"
            aria-label="Foto ${i + 1}"></button>`).join('');

  return `
  <article class="view-page hp-liquid" id="view-home">

    <!-- Aurora líquida global (atmósfera de agua para toda la landing) -->
    <div class="hp-aurora-field" aria-hidden="true">
      <span class="hp-blob hp-blob-1"></span>
      <span class="hp-blob hp-blob-2"></span>
      <span class="hp-blob hp-blob-3"></span>
    </div>

    <!-- ══ HERO EDITORIAL: titular + carrusel de fotos enmarcadas ══ -->
    <section class="hero-editorial" id="hero-carousel">
      <div class="hero-aurora" aria-hidden="true"></div>

      <div class="hero-content">
        <div class="hero-badge anim-fade-in">
          <span class="hero-badge-dot"></span>${hero.badge}
        </div>
        <h1 class="hero-headline anim-fade-in anim-delay-2">
          ${hero.headline.replace('cristalina','<em>cristalina</em>')}
        </h1>
        <p class="hero-subheadline anim-fade-in anim-delay-2">${hero.subheadline}</p>
        <div class="hero-ctas anim-fade-in anim-delay-3">
          <button class="btn btn-primary btn-lg" data-scroll="paquetes">
            Ver planes
            <i class="fa-solid fa-arrow-right text-sm"></i>
          </button>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-ghost">
            <i class="fa-brands fa-whatsapp"></i> Agendar diagnóstico
          </a>
        </div>
      </div>

      <!-- Carrusel de fotos enmarcadas (scroll-snap nativo) -->
      <div class="hef anim-fade-in anim-delay-4">
        <div class="hef-track" id="hef-track">${slidesHTML}</div>
        <button class="hef-arrow prev" id="hef-prev" type="button" aria-label="Anterior">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="hef-arrow next" id="hef-next" type="button" aria-label="Siguiente">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        <div class="hef-dots" id="hef-dots">${dotsHTML}</div>
      </div>
    </section>


    <!-- ══ VIDEO PROMOCIONAL — directamente debajo del carrusel ══ -->
    <!-- Se muestra SOLO cuando hay una URL en APP_CONFIG.home.hero.promoVideo.url
         (acepta YouTube, Vimeo o MP4). Si es null, esta sección no aparece. -->
    ${_renderVideoSection(hero)}


    <!-- ══ BARRA DE CONFIANZA ══ -->
    ${(trustBadges && trustBadges.length) ? `
    <section class="trust-bar" aria-label="Sellos de confianza">
      <div class="trust-bar-track">
        ${trustBadges.map(b => `
          <span class="trust-item">
            <i class="fa-solid fa-${b.icon}"></i>${b.label}
          </span>`).join('')}
      </div>
    </section>` : ''}


    <!-- ══ PROBLEMA ══ -->
    <section class="page-section bg-bruma" id="problema">
      <div class="content-container">
        <header class="section-header reveal">
          <p class="section-eyebrow">El problema real</p>
          <h2 class="section-title">${problemSection.title}</h2>
          <p class="section-subtitle">${problemSection.subtitle}</p>
        </header>
        <div class="grid-cards grid-cards-4" role="list">
          ${problemSection.cards.map((card, i) => `
            <article class="didactic-card card-${card.color} reveal reveal-delay-${Math.min(i+1,4)}"
                     data-num="${i + 1}"
                     role="listitem">
              <div class="didactic-icon icon-${card.color}">
                <i class="fa-solid fa-${card.icon}"></i>
              </div>
              <h3 class="didactic-card-title">${card.title}</h3>
              <p class="didactic-card-body">${card.body}</p>
            </article>`).join('')}
        </div>
      </div>
    </section>


    <!-- ══ MÉTODO ══ -->
    <section class="page-section-lg" id="metodo">
      <div class="content-container">
        <header class="section-header reveal">
          <p class="section-eyebrow">Nuestro proceso</p>
          <h2 class="section-title">${methodSection.title}</h2>
          <p class="section-subtitle">${methodSection.subtitle}</p>
        </header>
        <div class="method-timeline flex flex-col gap-10" role="list">
          ${methodSection.steps.map((step, i) => `
            <div class="method-step reveal reveal-delay-${Math.min(i+1,4)}" role="listitem">
              <div class="method-step-number">${step.number}</div>
              <div>
                <h3 class="text-base font-bold text-marino mb-1">${step.title}</h3>
                <p class="text-sm leading-relaxed" style="color:var(--text-secondary)">${step.description}</p>
              </div>
            </div>`).join('')}
        </div>
        <div class="mt-10 reveal">
          <button class="btn btn-primary" data-scroll="paquetes">
            Ver planes <i class="fa-solid fa-arrow-right text-sm"></i>
          </button>
        </div>
      </div>
    </section>


    <!-- ══ COMPARATIVA ══ -->
    <section class="page-section bg-bruma" id="diferencia">
      <div class="content-container">
        <header class="section-header reveal">
          <p class="section-eyebrow">La diferencia</p>
          <h2 class="section-title">${whySection.title}</h2>
        </header>
        <div class="overflow-x-auto rounded-2xl reveal">
          <table class="comparison-table" role="table">
            <thead>
              <tr>
                <th scope="col">Característica</th>
                <th scope="col"><i class="fa-solid fa-times-circle mr-1 opacity-70"></i> Convencional</th>
                <th scope="col" style="background:var(--color-cristal-dark);">
                  <i class="fa-solid fa-check-circle mr-1"></i> Pool Balance™
                </th>
              </tr>
            </thead>
            <tbody>
              ${whySection.comparisons.map(row => `
                <tr>
                  <td class="font-semibold" style="color:var(--text-primary);">${row.feature}</td>
                  <td style="color:var(--text-muted);">${row.conventional}</td>
                  <td class="highlight"><i class="fa-solid fa-check-circle"></i> ${row.poolBalance}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>


    <!-- ══ PAQUETES + ANTES/DESPUÉS (fusionados en la landing) ══ -->
    ${_renderHomePackages()}


    <!-- ══ TESTIMONIOS ══ -->
    ${(testimonialsSection && testimonialsSection.items?.length) ? `
    <section class="page-section-lg testimonials-section">
      <div class="content-container">
        <header class="section-header reveal" style="text-align:center;max-width:620px;margin-left:auto;margin-right:auto;">
          <p class="section-eyebrow" style="justify-content:center;">Prueba social</p>
          <h2 class="section-title">${testimonialsSection.title}</h2>
          <p class="section-subtitle" style="margin-left:auto;margin-right:auto;">${testimonialsSection.subtitle}</p>
        </header>
        <div class="testimonials-grid">
          ${testimonialsSection.items.map((t, i) => `
            <article class="testimonial-card reveal reveal-delay-${Math.min(i+1,3)}">
              <div class="testimonial-quote-mark">&ldquo;</div>
              <div class="testimonial-stars" aria-label="${t.rating} de 5">
                ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}
              </div>
              <p class="testimonial-text">${t.quote}</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">${_initials(t.name)}</div>
                <div>
                  <div class="testimonial-name">${t.name}</div>
                  <div class="testimonial-role">${t.role}</div>
                </div>
              </div>
            </article>`).join('')}
        </div>
      </div>
    </section>` : ''}


    <!-- ══ FAQ ══ -->
    ${(faqSection && faqSection.items?.length) ? `
    <section class="page-section-lg bg-bruma" id="faq">
      <div class="content-container">
        <header class="section-header reveal" style="text-align:center;max-width:620px;margin-left:auto;margin-right:auto;">
          <p class="section-eyebrow" style="justify-content:center;">Dudas frecuentes</p>
          <h2 class="section-title">${faqSection.title}</h2>
          <p class="section-subtitle" style="margin-left:auto;margin-right:auto;">${faqSection.subtitle}</p>
        </header>
        <div class="faq-list reveal">
          ${faqSection.items.map((f, i) => `
            <div class="faq-item" data-faq="${i}">
              <button class="faq-q" type="button" aria-expanded="false">
                <span>${f.q}</span>
                <span class="faq-q-icon"><i class="fa-solid fa-plus"></i></span>
              </button>
              <div class="faq-a">
                <div class="faq-a-inner">${f.a}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </section>` : ''}


    <!-- ══ CTA FINAL ══ -->
    <section class="page-section-lg cta-final">
      <div class="content-container text-center">
        <p class="section-eyebrow" style="color:var(--color-cristal);justify-content:center;">Veracruz, México</p>
        <h2 class="text-white font-extrabold mb-4" style="font-size:clamp(1.6rem,4vw,2.4rem);">
          ¿Listo para tener agua<br>
          <span style="color:var(--color-cristal);">realmente segura?</span>
        </h2>
        <p style="color:rgba(255,255,255,0.7);max-width:480px;margin:0 auto 32px;font-size:1rem;line-height:1.7;">
          Agenda tu diagnóstico inicial con fotómetro digital sin costo adicional al primer servicio.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <button class="btn btn-primary btn-lg" data-scroll="paquetes">Ver planes y precios</button>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-lg">
            <i class="fa-brands fa-whatsapp"></i> Escribir por WhatsApp
          </a>
        </div>
        <p class="mt-6 text-sm" style="color:rgba(255,255,255,0.4);">
          <i class="fa-regular fa-clock mr-1"></i> ${company.schedule}
        </p>
      </div>
    </section>

  </article>`;
}


// ── Iniciales para avatar de testimonio ──────────────────────
function _initials(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 1)   // ignora títulos cortos como "Arq."
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}


// ── Paquetes + Antes/Después fusionados en la landing ────────
function _renderHomePackages() {
  const { services, company, home } = APP_CONFIG;
  if (!services || !services.packages || !services.packages.length) return '';
  const wa = company.whatsapp;
  const slides = home.hero.slides || [];
  const greenImg = (slides[0] && slides[0].image) || '';
  const certImg  = (slides[3] && slides[3].image) || '';

  const card = (pkg, i, plain) => {
    const featured = pkg.color === 'featured';
    const waUrl = `https://wa.me/${wa}?text=${encodeURIComponent('Hola Pool Balance, me interesa el paquete "' + pkg.name + '".')}`;
    const btnClass = featured
      ? 'btn btn-full bg-arcilla text-white hover:bg-arcilla-dark shadow-md'
      : (pkg.color === 'premium' ? 'btn btn-full btn-primary' : 'btn btn-full btn-secondary');
    const feats = pkg.features.map(f => `
      <li class="pricing-feature ${f.included ? 'feature-included' : 'feature-excluded'}">
        <span class="pricing-feature-icon" aria-hidden="true"><i class="fa-solid ${f.included ? 'fa-check' : 'fa-minus'}"></i></span>
        <span class="pricing-feature-text">${f.text}</span>
      </li>`).join('');
    const badge = pkg.badge
      ? `<div class="pricing-badge">${featured ? '<i class="fa-solid fa-star fa-xs"></i> ' : ''}${pkg.badge}</div>`
      : '';
    // En el carrusel 3D las tarjetas NO usan "reveal" (las controla el coverflow).
    const revealCls = plain ? '' : ` reveal reveal-delay-${Math.min(i + 1, 3)}`;
    return `
      <article class="pricing-card ${pkg.color}${revealCls}" aria-label="Paquete ${pkg.name}">
        <header class="pricing-header">
          ${badge}
          <h3 class="pricing-plan-name">${pkg.name}</h3>
          <p class="pricing-description">${pkg.description}</p>
        </header>
        <div class="pricing-price-block">
          <div class="pricing-price"><span class="pricing-currency">$</span><span class="pricing-amount">${pkg.price.toLocaleString('es-MX')}</span></div>
          <span class="pricing-period">${services.currency} · ${pkg.period}</span>
        </div>
        <ul class="pricing-features">${feats}</ul>
        <div class="pricing-cta">
          <a href="${waUrl}" target="_blank" rel="noopener" class="${btnClass}"><i class="fa-brands fa-whatsapp mr-2"></i>${pkg.cta}</a>
        </div>
      </article>`;
  };

  // Carrusel 3D horizontal (coverflow) de paquetes — empieza en el central.
  const startIdx = Math.max(0, services.packages.findIndex(p => p.color === 'featured'));
  const pkgSlides = services.packages.map((p, i) => `
    <div class="pkgcar-slide" data-pkgindex="${i}">
      ${card(p, i, true)}
      <div class="pkgcar-veil" aria-hidden="true"></div>
    </div>`).join('');
  const pkgDots = services.packages.map((p, i) =>
    `<button class="pkgcar-dot" data-pkgdot="${i}" type="button" aria-label="Paquete ${p.name}"></button>`).join('');

  return `
    <!-- ══ ANTES / DESPUÉS — alberca verde → certificada ══ -->
    <section class="page-section bg-bruma" id="antes-despues">
      <div class="content-container">
        <header class="section-header reveal" style="text-align:center;max-width:620px;margin:0 auto 28px;">
          <p class="section-eyebrow" style="justify-content:center;">De agua verde a agua certificada</p>
          <h2 class="section-title">El cambio que tu alberca necesita</h2>
        </header>
        <div class="ba-grid reveal">
          <figure class="ba-tile">
            <div class="ba-img" style="background-image:url('${greenImg}')"></div>
            <figcaption class="ba-cap ba-cap--bad"><i class="fa-solid fa-triangle-exclamation"></i> Antes · agua verde y desbalanceada</figcaption>
          </figure>
          <figure class="ba-tile">
            <div class="ba-img" style="background-image:url('${certImg}')"></div>
            <figcaption class="ba-cap ba-cap--good"><i class="fa-solid fa-circle-check"></i> Después · agua certificada Pool Balance™</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ══ PAQUETES — fusionados en la landing ══ -->
    <section class="page-section-lg" id="paquetes">
      <div class="content-container">
        <header class="section-header reveal" style="text-align:center;max-width:640px;margin:0 auto 8px;">
          <p class="section-eyebrow" style="justify-content:center;">Planes y precios</p>
          <h2 class="section-title">${services.headline}</h2>
          <p class="section-subtitle" style="margin:0 auto;">${services.subheadline}</p>
        </header>
        <div class="pkgcar reveal" id="pkgcar" data-pkgstart="${startIdx}" role="group" aria-roledescription="carrusel" aria-label="Paquetes y precios">
          <div class="pkgcar-stage" id="pkgcar-stage">
            ${pkgSlides}
          </div>
          <button class="pkgcar-arrow prev" id="pkgcar-prev" type="button" aria-label="Paquete anterior"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="pkgcar-arrow next" id="pkgcar-next" type="button" aria-label="Paquete siguiente"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="pkgcar-dots" id="pkgcar-dots">${pkgDots}</div>
        <p class="text-xs text-center mt-6 reveal" style="color:rgba(255,255,255,0.5);">
          <i class="fa-solid fa-circle-info mr-1"></i> ${services.pricingNote}
        </p>
        <div class="text-center mt-6 reveal">
          <a href="${`https://wa.me/${wa}?text=${encodeURIComponent('Hola Pool Balance, quiero agendar mi diagnóstico.')}`}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-lg">
            <i class="fa-brands fa-whatsapp"></i> Agendar diagnóstico
          </a>
        </div>
      </div>
    </section>`;
}


// ── Sección de video promocional ─────────────────────────────
function _renderVideoSection(hero) {
  const video = hero.promoVideo || null;

  if (video && video.url) {
    return `
    <section class="page-section" id="promo-video">
      <div class="content-container">
        <header class="section-header reveal" style="margin-bottom:24px;">
          <p class="section-eyebrow">Video</p>
          <h2 class="section-title" style="font-size:clamp(1.2rem,3vw,1.8rem);">
            ${video.title || 'Mira Pool Balance en acción'}
          </h2>
          ${video.subtitle ? `<p class="section-subtitle">${video.subtitle}</p>` : ''}
        </header>
        <div class="promo-video-wrap reveal">
          ${_buildVideoEmbed(video.url)}
        </div>
      </div>
    </section>`;
  }
  return '';
}

// Detecta si la URL es YouTube, Vimeo o MP4 directo
function _buildVideoEmbed(url) {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `<div class="promo-video-iframe-wrap">
      <iframe src="https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1"
              title="Video promocional Pool Balance"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"></iframe>
    </div>`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `<div class="promo-video-iframe-wrap">
      <iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0"
              title="Video promocional Pool Balance"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
              loading="lazy"></iframe>
    </div>`;
  }

  return `<video class="promo-video-native" controls playsinline preload="metadata">
    <source src="${url}" type="video/mp4">
    Tu navegador no soporta la reproducción de video.
  </video>`;
}


// ════════════════════════════════════════════════════════════
//  CAROUSEL — Init con delegación de eventos en document.
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  CAROUSEL HERO — Tarjetas de foto enmarcadas (scroll-snap nativo)
//  La foto vive contenida en una tarjeta (no a pantalla completa);
//  se desliza con scroll-snap. Flechas, dots y autoplay sincronizados.
// ════════════════════════════════════════════════════════════

function _initHeroCarousel() {
  const track = document.getElementById('hef-track');
  if (!track || track.dataset.bound === '1') return;
  track.dataset.bound = '1';

  const cards = Array.from(track.children);
  const dots  = Array.from(document.querySelectorAll('[data-hdot]'));
  const prev  = document.getElementById('hef-prev');
  const next  = document.getElementById('hef-next');
  const total = cards.length;
  if (!total) return;

  let current = 0;
  let timer = null;

  function centerOf(card) {
    // Posición de scroll para centrar la tarjeta en el viewport del track.
    return card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
  }
  function goTo(n) {
    n = ((n % total) + total) % total;
    current = n;
    track.scrollTo({ left: centerOf(cards[n]), behavior: 'smooth' });
    _syncDots();
  }
  function _syncDots() {
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // Sincronizar el punto activo según la tarjeta más cercana al centro
  let scrollT;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollT);
    scrollT = setTimeout(() => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      cards.forEach((c, i) => {
        const cc = c.offsetLeft + c.clientWidth / 2;
        const d = Math.abs(cc - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      current = best;
      _syncDots();
    }, 90);
  }, { passive: true });

  prev && (prev.onclick = () => { goTo(current - 1); _restart(); });
  next && (next.onclick = () => { goTo(current + 1); _restart(); });
  dots.forEach(d => d.onclick = () => { goTo(parseInt(d.dataset.hdot, 10)); _restart(); });

  function _start() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5500); }
  function _stop()  { clearInterval(timer); }
  function _restart() { _stop(); _start(); }

  // Pausar autoplay mientras el usuario interactúa
  track.addEventListener('pointerdown', _stop, { passive: true });
  track.addEventListener('pointerup', _restart, { passive: true });
  track.addEventListener('mouseenter', _stop);
  track.addEventListener('mouseleave', _start);

  // Detener autoplay al salir de la vista home
  document.addEventListener('viewRendered', (e) => {
    if (e.detail?.view !== 'home') _stop();
  });

  _syncDots();
  _start();
}

// ── Parallax scroll effect driver ────────────────────────────
function _initHomeParallax() {
  const container = document.getElementById('view-home');
  if (!container) return;

  if (window._homeScrollHandler) {
    window.removeEventListener('scroll', window._homeScrollHandler);
  }

  // Parallax de fondo del hero (solo transform → corre en compositor).
  // Los reveals y el pop 3D los maneja CSS scroll-driven, no este handler.
  window._homeScrollHandler = function() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > window.innerHeight) return;   // fuera del hero: nada que mover
    const bgs = document.querySelectorAll('.hero-slide.active .hero-bg');
    bgs.forEach(bg => {
      // scale(1.06) mantiene sobre-escaneo: el borde nunca se asoma al desplazar.
      bg.style.transform = `translateY(${scrollTop * 0.32}px) scale(1.06)`;
    });
  };

  window.addEventListener('scroll', window._homeScrollHandler, { passive: true });
}

// ── Revelado al entrar al viewport (IntersectionObserver) ────
// Funciona en TODOS los teléfonos (iPhone/Safari incluido).
function _initReveal() {
  const els = document.querySelectorAll('#view-home .reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(el => io.observe(el));
}

// ── Acordeón de FAQ (delegación, se ata UNA sola vez) ─────────
// Antes se ataba un listener por pregunta y, como _initHome corre dos veces
// (viewRendered + PostRender), quedaban DOS handlers: el primer clic abría y
// el segundo, en el mismo evento, volvía a cerrar — por eso "no abría".
function _initFaq() {
  const view = document.getElementById('view-home');
  if (!view || view.dataset.faqBound) return;
  view.dataset.faqBound = '1';

  view.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    if (!item) return;
    const answer = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');

    // Cerrar todas (acordeón de una a la vez)
    view.querySelectorAll('.faq-item').forEach(other => {
      other.classList.remove('open');
      const a = other.querySelector('.faq-a');
      const b = other.querySelector('.faq-q');
      if (a) a.style.maxHeight = null;
      if (b) b.setAttribute('aria-expanded', 'false');
    });

    // Abrir la clicada si estaba cerrada
    if (!isOpen && answer) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
}

// ── Carrusel 3D horizontal de paquetes (coverflow) ───────────
const PackageCarousel = {
  active: 0,
  total: 0,
  _bound: false,
  _onUp: null,

  init() {
    const stage = document.getElementById('pkgcar-stage');
    if (!stage) return;
    this.total = stage.querySelectorAll('.pkgcar-slide').length;
    if (!this.total) return;
    const wrap = document.getElementById('pkgcar');
    const start = wrap ? parseInt(wrap.dataset.pkgstart || '0', 10) : 0;
    if (!stage.dataset.pkgInit) {
      this.active = Math.min(Math.max(0, start), this.total - 1);
      stage.dataset.pkgInit = '1';
    }
    this.active = Math.min(this.active, this.total - 1);
    this._sizeStage();
    this.layout();

    const prev = document.getElementById('pkgcar-prev');
    const next = document.getElementById('pkgcar-next');
    prev && (prev.onclick = () => this.go(this.active - 1));
    next && (next.onclick = () => this.go(this.active + 1));

    document.querySelectorAll('[data-pkgdot]').forEach(d => {
      d.onclick = () => this.go(parseInt(d.dataset.pkgdot, 10));
    });

    // Enlazar gestos UNA sola vez por elemento (evita swipe doble).
    if (!stage.dataset.pkgBound) {
      stage.dataset.pkgBound = '1';

      // Click en una tarjeta lateral → centrarla (ignorar si fue swipe).
      stage.querySelectorAll('.pkgcar-slide').forEach(sl => {
        sl.addEventListener('click', (e) => {
          if (this._swiped) { this._swiped = false; e.stopPropagation(); return; }
          const idx = parseInt(sl.dataset.pkgindex, 10);
          if (idx !== this.active && !e.target.closest('a,button')) {
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

      // Arrastre con mouse (solo desktop)
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
  },

  // Uniforma la altura de todas las tarjetas a la más alta y ajusta el
  // contenedor — así el coverflow se ve parejo con cualquier fuente.
  _sizeStage() {
    const wrap = document.getElementById('pkgcar');
    const slides = Array.from(document.querySelectorAll('#pkgcar-stage .pkgcar-slide'));
    if (!wrap || !slides.length) return;
    let max = 0;
    slides.forEach(sl => {
      sl.style.height = 'auto';
      const card = sl.querySelector('.pricing-card');
      if (card) max = Math.max(max, card.offsetHeight);
    });
    if (!max) return;
    slides.forEach(sl => { sl.style.height = max + 'px'; });
    wrap.style.height = (max + 24) + 'px';
  },

  go(i) {
    if (!this.total) return;
    this.active = ((i % this.total) + this.total) % this.total;
    this.layout();
  },

  layout() {
    const slides = Array.from(document.querySelectorAll('#pkgcar-stage .pkgcar-slide'));
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
        transform = `translateX(calc(-50% + ${dir * 66}%)) rotateY(${dir * -32}deg) scale(0.84)`;
        opacity = 1; z = 20;
      } else {
        const dir = offset > 0 ? 1 : -1;
        transform = `translateX(calc(-50% + ${dir * 82}%)) rotateY(${dir * -32}deg) scale(0.78)`;
        opacity = 0; z = 10; pe = 'none';
      }
      sl.style.transform = transform;
      sl.style.opacity = opacity;
      sl.style.zIndex = z;
      sl.style.pointerEvents = pe;
      sl.classList.toggle('is-active', offset === 0);
    });

    document.querySelectorAll('[data-pkgdot]').forEach((d, i) => {
      d.classList.toggle('active', i === this.active);
    });
  },
};
window.PackageCarousel = PackageCarousel;

function _initPackageCarousel() {
  if (!document.getElementById('pkgcar-stage')) return;
  requestAnimationFrame(() => requestAnimationFrame(() => PackageCarousel.init()));
  setTimeout(() => PackageCarousel.init(), 200);
}

// ── Botones con data-scroll → scroll suave a una sección ─────
function _initScrollLinks() {
  const view = document.getElementById('view-home');
  if (!view || view.dataset.scrollBound) return;
  view.dataset.scrollBound = '1';
  view.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-scroll]');
    if (!btn) return;
    const target = document.getElementById(btn.dataset.scroll);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// ── Inicializa todo lo de Home ───────────────────────────────
function _initHome() {
  _initHeroCarousel();
  // Nota: el parallax de scroll del hero se retiró a propósito — provocaba un
  // "brinco" al soltar el dedo en móvil. Los reveals por IntersectionObserver
  // (que sí se sienten bien) se mantienen.
  _initReveal();
  _initFaq();
  _initPackageCarousel();
  _initScrollLinks();
}

// ── Escuchar el evento del router → siempre que se renderice 'home' ──
document.addEventListener('viewRendered', (e) => {
  if (e.detail?.view === 'home') {
    requestAnimationFrame(() => {
      requestAnimationFrame(_initHome);
    });
  }
});

// ── PostRender como respaldo adicional (doble seguro) ──
if (typeof PostRender !== 'undefined') {
  PostRender.home = function() {
    setTimeout(_initHome, 60);
  };
}
