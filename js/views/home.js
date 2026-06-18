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

  const slidesHTML = hero.slides.map((s, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}"
         data-slide="${i}"
         data-audio="${s.audio || ''}">
      <div class="hero-bg" style="background-image:url('${s.image}')"></div>
      <div class="hero-overlay"></div>
      <div class="hero-slide-tag hero-slide-tag--${s.accent}">${s.tag}</div>
      ${(s.caption || s.audio || s.stat) ? `
      <div class="hero-slide-caption">
        ${s.caption ? `<p class="hero-slide-caption-text">${s.caption}</p>` : '<span class="hero-slide-caption-text"></span>'}
        <div class="hero-slide-caption-right">
          <div class="hero-slide-stat">
            <span class="hero-slide-stat-value">${s.stat.value}</span>
            <span class="hero-slide-stat-label">${s.stat.label}</span>
          </div>
          ${s.audio ? `
          <button class="slide-audio-btn"
                  data-audio-src="${s.audio}"
                  aria-label="Escuchar explicación"
                  title="Escuchar explicación"
                  type="button">
            <span class="slide-audio-icon">
              <i class="fa-solid fa-volume-high slide-audio-ico-play"></i>
              <i class="fa-solid fa-pause slide-audio-ico-pause" style="display:none"></i>
            </span>
            <span class="slide-audio-label">Escuchar</span>
          </button>` : ''}
        </div>
      </div>` : ''}
    </div>`).join('');

  const dotsHTML = hero.slides.map((_, i) => `
    <button class="hero-dot ${i === 0 ? 'active' : ''}"
            data-dot="${i}" type="button"
            aria-label="Diapositiva ${i + 1}"></button>`).join('');

  return `
  <article class="view-page" id="view-home">

    <!-- ══ HERO CAROUSEL ══ -->
    <section class="hero-section" id="hero-carousel">
      <div class="hero-slides-track">${slidesHTML}</div>

      <!-- Atmósfera de profundidad (la imagen es la tesis) -->
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
          <button class="btn btn-primary btn-lg" data-navigate="${hero.cta_primary.view}">
            ${hero.cta_primary.label}
            <i class="fa-solid fa-arrow-right text-sm"></i>
          </button>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-ghost">
            <i class="fa-brands fa-whatsapp"></i> Agendar diagnóstico
          </a>
        </div>
        <div class="hero-stats anim-fade-in anim-delay-4">
          ${hero.stats.map(s => `
            <div class="stat-chip">
              <div class="stat-chip-value">${s.value}</div>
              <div class="stat-chip-label">${s.label}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Controles: flechas + dots -->
      <div class="carousel-controls">
        <button class="carousel-arrow carousel-arrow--prev"
                id="carousel-prev" type="button" aria-label="Anterior">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="carousel-dots">${dotsHTML}</div>
        <button class="carousel-arrow carousel-arrow--next"
                id="carousel-next" type="button" aria-label="Siguiente">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div class="scroll-indicator" aria-hidden="true">
        <div class="scroll-indicator-line"></div>
      </div>
    </section>


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


    <!-- ══ VIDEO PROMOCIONAL ══ -->
    ${_renderVideoSection(hero)}


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
    <section class="page-section-lg" id="metodo" style="background:#fff;">
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
          <button class="btn btn-primary" data-navigate="servicios">
            Ver nuestros paquetes <i class="fa-solid fa-arrow-right text-sm"></i>
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
          <button class="btn btn-primary btn-lg" data-navigate="servicios">Ver paquetes y precios</button>
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

  const card = (pkg, i) => {
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
    return `
      <article class="pricing-card ${pkg.color} reveal reveal-delay-${Math.min(i + 1, 3)}" aria-label="Paquete ${pkg.name}">
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
    <section class="page-section-lg" id="paquetes" style="background:#fff;">
      <div class="content-container">
        <header class="section-header reveal" style="text-align:center;max-width:640px;margin:0 auto 8px;">
          <p class="section-eyebrow" style="justify-content:center;">Planes y precios</p>
          <h2 class="section-title">${services.headline}</h2>
          <p class="section-subtitle" style="margin:0 auto;">${services.subheadline}</p>
        </header>
        <div class="pricing-grid reveal" role="list">
          ${services.packages.map((p, i) => card(p, i)).join('')}
        </div>
        <p class="text-xs text-center mt-6 reveal" style="color:var(--text-muted);">
          <i class="fa-solid fa-circle-info mr-1"></i> ${services.pricingNote}
        </p>
        <div class="text-center mt-6 reveal">
          <button class="btn btn-secondary" data-navigate="servicios">Ver servicios adicionales y proceso <i class="fa-solid fa-arrow-right text-sm"></i></button>
        </div>
      </div>
    </section>`;
}


// ── Sección de video promocional ─────────────────────────────
function _renderVideoSection(hero) {
  const video = hero.promoVideo || null;

  if (video && video.url) {
    return `
    <section class="page-section" id="promo-video" style="background:#fff;">
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

function _initCarousel() {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;
  if (carousel.dataset.carouselReady === '1') return;
  carousel.dataset.carouselReady = '1';

  const slides  = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots    = Array.from(carousel.querySelectorAll('[data-dot]'));
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const total   = slides.length;
  if (!total) return;

  let current = 0;
  let timer   = null;

  // ── REPRODUCTOR DE AUDIO ────────────────────────────────────
  const audioEl = new Audio();
  audioEl.preload = 'none';
  let activeAudioBtn = null;

  function _stopAudio() {
    if (!audioEl.paused) audioEl.pause();
    audioEl.currentTime = 0;
    if (activeAudioBtn) {
      activeAudioBtn.classList.remove('playing');
      const icoPlay  = activeAudioBtn.querySelector('.slide-audio-ico-play');
      const icoPause = activeAudioBtn.querySelector('.slide-audio-ico-pause');
      if (icoPlay)  icoPlay.style.display  = '';
      if (icoPause) icoPause.style.display = 'none';
      activeAudioBtn = null;
    }
  }

  function _toggleAudio(btn) {
    const src = btn.dataset.audioSrc;
    if (!src) return;

    const icoPlay  = btn.querySelector('.slide-audio-ico-play');
    const icoPause = btn.querySelector('.slide-audio-ico-pause');

    if (btn === activeAudioBtn && !audioEl.paused) {
      audioEl.pause();
      btn.classList.remove('playing');
      if (icoPlay)  icoPlay.style.display  = '';
      if (icoPause) icoPause.style.display = 'none';
      return;
    }

    _stopAudio();

    audioEl.src = src;
    audioEl.play().catch(() => {});
    btn.classList.add('playing');
    if (icoPlay)  icoPlay.style.display  = 'none';
    if (icoPause) icoPause.style.display = '';
    activeAudioBtn = btn;

    audioEl.onended = () => {
      btn.classList.remove('playing');
      if (icoPlay)  icoPlay.style.display  = '';
      if (icoPause) icoPause.style.display = 'none';
      activeAudioBtn = null;
    };
  }

  carousel.addEventListener('click', e => {
    const audioBtn = e.target.closest('.slide-audio-btn');
    if (audioBtn) {
      e.stopPropagation();
      _toggleAudio(audioBtn);
    }
  });

  // ── NAVEGACIÓN DEL CAROUSEL ─────────────────────────────────
  function goTo(n) {
    n = ((n % total) + total) % total;
    _stopAudio();
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i)   => d.classList.toggle('active', i === n));
    current = n;
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopTimer() { clearInterval(timer); }

  btnPrev && btnPrev.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  btnNext && btnNext.addEventListener('click', () => { goTo(current + 1); startTimer(); });

  dots.forEach(d => d.addEventListener('click', () => {
    goTo(parseInt(d.dataset.dot, 10));
    startTimer();
  }));

  let tx = 0;
  carousel.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); startTimer(); }
  }, { passive: true });

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);

  document.addEventListener('viewRendered', (e) => {
    if (e.detail?.view !== 'home') {
      _stopAudio();
      if (window._homeScrollHandler) {
        window.removeEventListener('scroll', window._homeScrollHandler);
        window._homeScrollHandler = null;
      }
    }
  }, { once: false });

  startTimer();
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

// ── Acordeón de FAQ ──────────────────────────────────────────
function _initFaq() {
  const items = document.querySelectorAll('#view-home .faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cerrar todos (acordeón de uno a la vez)
      items.forEach(other => {
        other.classList.remove('open');
        const a = other.querySelector('.faq-a');
        const b = other.querySelector('.faq-q');
        if (a) a.style.maxHeight = null;
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      // Abrir el clicado si estaba cerrado
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ── Inicializa todo lo de Home ───────────────────────────────
function _initHome() {
  _initCarousel();
  _initHomeParallax();
  _initReveal();
  _initFaq();
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
