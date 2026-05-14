/**
 * ============================================================
 *  POOL BALANCE — VISTA 1: HOME
 *  v2.3 — Carousel con delegación global de eventos.
 *         El init NO depende del router ni del PostRender:
 *         escucha el evento 'viewRendered' directamente
 *         en document, así funciona siempre sin importar
 *         si es primera carga, navegación o recarga.
 * ============================================================
 */

// ── Render principal ──────────────────────────────────────────
function renderHome() {
  const { hero, problemSection, methodSection, whySection } = APP_CONFIG.home;
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


    <!-- ══ VIDEO PROMOCIONAL ══ -->
    ${_renderVideoSection(hero)}


    <!-- ══ PROBLEMA ══ -->
    <section class="page-section bg-bruma" id="problema">
      <div class="content-container">
        <header class="section-header">
          <p class="section-eyebrow">El problema real</p>
          <h2 class="section-title">${problemSection.title}</h2>
          <p class="section-subtitle">${problemSection.subtitle}</p>
        </header>
        <div class="grid-cards grid-cards-4" role="list">
          ${problemSection.cards.map((card, i) => `
            <article class="didactic-card card-${card.color} anim-fade-in-up anim-delay-${i+1}"
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
        <header class="section-header">
          <p class="section-eyebrow">Nuestro proceso</p>
          <h2 class="section-title">${methodSection.title}</h2>
          <p class="section-subtitle">${methodSection.subtitle}</p>
        </header>
        <div class="flex flex-col gap-10 max-w-2xl" role="list">
          ${methodSection.steps.map((step, i) => `
            <div class="method-step anim-fade-in-up anim-delay-${Math.min(i+1,6)}" role="listitem">
              <div class="method-step-number">${step.number}</div>
              <div>
                <h3 class="text-base font-bold text-marino mb-1">${step.title}</h3>
                <p class="text-sm leading-relaxed" style="color:var(--text-secondary)">${step.description}</p>
              </div>
            </div>`).join('')}
        </div>
        <div class="mt-10">
          <button class="btn btn-primary" data-navigate="servicios">
            Ver nuestros paquetes <i class="fa-solid fa-arrow-right text-sm"></i>
          </button>
        </div>
      </div>
    </section>


    <!-- ══ COMPARATIVA ══ -->
    <section class="page-section bg-bruma" id="diferencia">
      <div class="content-container">
        <header class="section-header">
          <p class="section-eyebrow">La diferencia</p>
          <h2 class="section-title">${whySection.title}</h2>
        </header>
        <div class="overflow-x-auto rounded-2xl">
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


    <!-- ══ CTA FINAL ══ -->
    <section class="page-section-lg" style="background:var(--color-marino);">
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


// ── Sección de video promocional ─────────────────────────────
function _renderVideoSection(hero) {
  // Si no hay config de video en el config, mostrar placeholder editable
  const video = hero.promoVideo || null;

  if (video && video.url) {
    // Hay URL guardada → mostrar reproductor
    return `
    <section class="page-section" id="promo-video" style="background:#fff;">
      <div class="content-container">
        <header class="section-header" style="margin-bottom:24px;">
          <p class="section-eyebrow">Video</p>
          <h2 class="section-title" style="font-size:clamp(1.2rem,3vw,1.8rem);">
            ${video.title || 'Mira Pool Balance en acción'}
          </h2>
          ${video.subtitle ? `<p class="section-subtitle">${video.subtitle}</p>` : ''}
        </header>
        <div class="promo-video-wrap">
          ${_buildVideoEmbed(video.url)}
        </div>
      </div>
    </section>`;
  }

  // Sin URL → mostrar placeholder (solo visible en modo administrador / desarrollo)
  // En producción puedes ocultar esto con display:none o borrarlo del config
  return '';
}

// Detecta si la URL es YouTube, Vimeo o MP4 directo
function _buildVideoEmbed(url) {
  // YouTube
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

  // Vimeo
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

  // MP4 directo (Firebase Storage, etc.)
  return `<video class="promo-video-native" controls playsinline preload="metadata">
    <source src="${url}" type="video/mp4">
    Tu navegador no soporta la reproducción de video.
  </video>`;
}


// ════════════════════════════════════════════════════════════
//  CAROUSEL — Init con delegación de eventos en document.
//  Se llama desde el evento 'viewRendered' para garantizar
//  que el DOM ya existe, sin depender del PostRender del router.
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
  // Un único elemento <audio> reutilizado para todos los slides.
  // Se crea una sola vez y se reutiliza cambiando el src.
  const audioEl = new Audio();
  audioEl.preload = 'none';
  let activeAudioBtn = null;  // botón actualmente en estado "playing"

  function _stopAudio() {
    if (!audioEl.paused) audioEl.pause();
    audioEl.currentTime = 0;
    if (activeAudioBtn) {
      activeAudioBtn.classList.remove('playing');
      // Restablecer íconos
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

    // Si este botón ya está reproduciendo → pausar
    if (btn === activeAudioBtn && !audioEl.paused) {
      audioEl.pause();
      btn.classList.remove('playing');
      if (icoPlay)  icoPlay.style.display  = '';
      if (icoPause) icoPause.style.display = 'none';
      return;
    }

    // Si hay otro audio activo → detenerlo primero
    _stopAudio();

    // Cargar y reproducir
    audioEl.src = src;
    audioEl.play().catch(() => {
      // El navegador bloqueó la reproducción automática — no es error crítico
    });
    btn.classList.add('playing');
    if (icoPlay)  icoPlay.style.display  = 'none';
    if (icoPause) icoPause.style.display = '';
    activeAudioBtn = btn;

    // Cuando termine el audio → restablecer estado
    audioEl.onended = () => {
      btn.classList.remove('playing');
      if (icoPlay)  icoPlay.style.display  = '';
      if (icoPause) icoPause.style.display = 'none';
      activeAudioBtn = null;
    };
  }

  // Delegar clicks de botones de audio en el carousel
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
    // Detener audio al cambiar de slide
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

  // Flechas
  btnPrev && btnPrev.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  btnNext && btnNext.addEventListener('click', () => { goTo(current + 1); startTimer(); });

  // Dots
  dots.forEach(d => d.addEventListener('click', () => {
    goTo(parseInt(d.dataset.dot, 10));
    startTimer();
  }));

  // Swipe táctil
  let tx = 0;
  carousel.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); startTimer(); }
  }, { passive: true });

  // Pausa del auto-avance en hover (desktop)
  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);

  // Limpiar audio si el usuario navega a otra vista
  document.addEventListener('viewRendered', (e) => {
    if (e.detail?.view !== 'home') _stopAudio();
  }, { once: false });

  startTimer();
}

// ── Escuchar el evento del router → siempre que se renderice 'home' ──
document.addEventListener('viewRendered', (e) => {
  if (e.detail?.view === 'home') {
    // Dos frames de margen para asegurarnos que el DOM está pintado
    requestAnimationFrame(() => requestAnimationFrame(_initCarousel));
  }
});

// ── PostRender como respaldo adicional (doble seguro) ──
if (typeof PostRender !== 'undefined') {
  PostRender.home = function() {
    setTimeout(_initCarousel, 60);
  };
}
