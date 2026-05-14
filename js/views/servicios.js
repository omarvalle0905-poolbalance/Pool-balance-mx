/**
 * ============================================================
 *  POOL BALANCE — VISTA 2: SERVICIOS Y PRECIOS
 *  Consume: APP_CONFIG.services
 * ============================================================
 */

function renderServicios() {
  const { services, company } = APP_CONFIG;
  const wa = company.whatsapp;

  function getWaUrl(packageName) {
    const msg = encodeURIComponent(`Hola Pool Balance, me interesa el paquete "${packageName}". ¿Pueden darme más información?`);
    return `https://wa.me/${wa}?text=${msg}`;
  }

  function renderPricingCard(pkg, index) {
    const isFeatured = pkg.color === 'featured';
    const isPremium  = pkg.color === 'premium';

    const featuresHTML = pkg.features.map(f => `
      <li class="pricing-feature ${f.included ? 'feature-included' : 'feature-excluded'}">
        <span class="pricing-feature-icon" aria-hidden="true">
          <i class="fa-solid ${f.included ? 'fa-check' : 'fa-minus'}"></i>
        </span>
        <span class="pricing-feature-text">${f.text}</span>
      </li>
    `).join('');

    const badgeHTML = pkg.badge ? `
      <div class="pricing-badge">
        ${isFeatured ? '<i class="fa-solid fa-star fa-xs"></i>' : ''}
        ${pkg.badge}
      </div>
    ` : '';

    const btnClass = isFeatured
      ? 'btn btn-full' + ' bg-arcilla text-white hover:bg-arcilla-dark shadow-md'
      : isPremium
        ? 'btn btn-full btn-primary'
        : 'btn btn-full btn-secondary';

    return `
      <article
        class="pricing-card ${pkg.color} anim-fade-in-up anim-delay-${index + 1}"
        aria-label="Paquete ${pkg.name}"
      >
        <header class="pricing-header">
          ${badgeHTML}
          <h3 class="pricing-plan-name">${pkg.name}</h3>
          <p class="pricing-description">${pkg.description}</p>
        </header>

        <div class="pricing-price-block">
          <div class="pricing-price">
            <span class="pricing-currency">$</span>
            <span class="pricing-amount">${pkg.price.toLocaleString('es-MX')}</span>
          </div>
          <span class="pricing-period">${services.currency} · ${pkg.period}</span>
        </div>

        <ul class="pricing-features" aria-label="Características incluidas">
          ${featuresHTML}
        </ul>

        <div class="pricing-cta">
          <a
            href="${getWaUrl(pkg.name)}"
            target="_blank"
            rel="noopener"
            class="${btnClass}"
            aria-label="${pkg.cta} — paquete ${pkg.name}"
          >
            <i class="fa-brands fa-whatsapp mr-2"></i>
            ${pkg.cta}
          </a>
        </div>
      </article>
    `;
  }

  const addonsHTML = services.addons.map(addon => `
    <div class="addon-row">
      <div>
        <p class="addon-name">${addon.name}</p>
        <p class="text-xs mt-0.5" style="color: var(--text-muted);">${addon.unit}</p>
      </div>
      <span class="addon-price">
        $${addon.price.toLocaleString('es-MX')}
        <span class="text-xs font-normal" style="color: var(--text-muted);"> MXN</span>
      </span>
    </div>
  `).join('');

  return `
  <article class="view-page" id="view-servicios">

    <!-- ── STICKY HEADER ── -->
    <header class="sticky-header">
      <div class="content-container flex items-center justify-between">
        <div>
          <h1 class="text-base font-bold text-marino leading-tight">Servicios</h1>
          <p class="text-xs" style="color: var(--text-muted);">Paquetes para Veracruz y área metropolitana</p>
        </div>
        <a
          href="https://wa.me/${wa}"
          target="_blank"
          rel="noopener"
          class="btn btn-primary btn-sm"
          aria-label="Contactar por WhatsApp"
        >
          <i class="fa-brands fa-whatsapp"></i>
          Cotizar
        </a>
      </div>
    </header>

    <!-- ── HEADLINE ── -->
    <section class="page-section" aria-labelledby="services-title">
      <div class="content-container">
        <header class="section-header text-center mx-auto" style="max-width: 640px;">
          <p class="section-eyebrow" style="justify-content: center;">Sin contratos engañosos</p>
          <h2 class="section-title" id="services-title">${services.headline}</h2>
          <p class="section-subtitle mx-auto">${services.subheadline}</p>
        </header>

        <!-- ── PRICING CARDS ── -->
        <div class="pricing-grid" role="list" aria-label="Paquetes de servicio">
          ${services.packages.map((pkg, i) => renderPricingCard(pkg, i)).join('')}
        </div>

        <p class="text-xs text-center mt-6" style="color: var(--text-muted);">
          <i class="fa-solid fa-circle-info mr-1"></i>
          ${services.pricingNote}
        </p>
      </div>
    </section>

    <!-- ── ADD-ONS ── -->
    <section class="page-section" style="background: #fff;" aria-labelledby="addons-title">
      <div class="content-container">
        <header class="section-header">
          <p class="section-eyebrow">Servicios adicionales</p>
          <h2 class="section-title" id="addons-title">¿Necesitas algo extra?</h2>
          <p class="section-subtitle">
            Complementa tu plan con servicios especializados. Se agendan junto con tu visita regular.
          </p>
        </header>

        <div class="flex flex-col gap-3" role="list" aria-label="Servicios adicionales">
          ${addonsHTML}
        </div>
      </div>
    </section>

    <!-- ── PROCESO DE CONTRATACIÓN ── -->
    <section class="page-section bg-bruma" aria-labelledby="process-title">
      <div class="content-container">
        <header class="section-header text-center mx-auto" style="max-width: 560px;">
          <p class="section-eyebrow" style="justify-content: center;">¿Cómo empezar?</p>
          <h2 class="section-title" id="process-title">Tres pasos para tener tu alberca certificada</h2>
        </header>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-3xl mx-auto">
          ${[
            { num: '01', icon: 'comments', title: 'Contáctanos por WhatsApp', body: 'Cuéntanos sobre tu alberca: tipo, volumen aproximado y ubicación en Veracruz.' },
            { num: '02', icon: 'calendar-check', title: 'Agendamos la visita', body: 'Te asignamos un técnico certificado con disponibilidad de Lunes a Sábado.' },
            { num: '03', icon: 'file-circle-check', title: 'Recibes tu reporte', body: 'Después de cada visita recibes tu bitácora técnica en PDF con todas las lecturas.' },
          ].map((step, i) => `
            <div class="card card-body text-center anim-fade-in-up anim-delay-${i + 1}">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style="background: var(--color-marino-xlight);">
                <i class="fa-solid fa-${step.icon} text-marino text-lg"></i>
              </div>
              <div class="text-xs font-bold tracking-widest mb-1" style="color: var(--color-arcilla);">PASO ${step.num}</div>
              <h3 class="font-bold text-sm text-marino mb-2">${step.title}</h3>
              <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">${step.body}</p>
            </div>
          `).join('')}
        </div>

        <div class="text-center mt-10">
          <a
            href="https://wa.me/${wa}?text=${encodeURIComponent('Hola, quiero comenzar con Pool Balance. ¿Cómo empezamos?')}"
            target="_blank"
            rel="noopener"
            class="btn btn-whatsapp btn-lg"
          >
            <i class="fa-brands fa-whatsapp"></i>
            Comenzar ahora por WhatsApp
          </a>
        </div>
      </div>
    </section>

    <!-- ── FAQ RÁPIDO ── -->
    <section class="page-section" style="background:#fff;" aria-labelledby="faq-title">
      <div class="content-container" style="max-width: 720px;">
        <header class="section-header">
          <p class="section-eyebrow">Preguntas frecuentes</p>
          <h2 class="section-title" id="faq-title">Lo que más nos preguntan</h2>
        </header>

        <div class="flex flex-col gap-3" id="faq-accordion">
          ${[
            { q: '¿Cuánto tiempo dura una visita de servicio?', a: 'Entre 45 minutos y 1.5 horas dependiendo del estado del agua y los servicios requeridos. Siempre llegamos con el equipo completo para no hacer múltiples visitas.' },
            { q: '¿Los químicos están incluidos en el precio?', a: 'Los correctivos de ajuste de pH y alcalinidad están incluidos en el servicio. El cloro, estabilizador y otros productos de consumo regular se cobran por separado al costo, sin margen adicional.' },
            { q: '¿Atienden albercas en zonas condominio?', a: 'Sí. Atendemos albercas residenciales privadas, condominios, fraccionamientos y propiedades de renta vacacional en Veracruz, Boca del Río, Alvarado y áreas cercanas.' },
            { q: '¿Cuánto tiempo tardan en generar el reporte PDF?', a: 'El reporte se genera el mismo día de la visita y se sube a tu portal de cliente antes de 12 horas. También te llegará notificación por WhatsApp.' },
          ].map((faq, i) => `
            <div class="faq-item card" id="faq-${i}">
              <button
                class="w-full text-left px-5 py-4 flex justify-between items-center gap-4"
                onclick="toggleFaq(${i})"
                aria-expanded="false"
                aria-controls="faq-body-${i}"
              >
                <span class="font-semibold text-sm text-marino">${faq.q}</span>
                <i class="fa-solid fa-chevron-down text-arcilla text-sm transition-transform flex-shrink-0 faq-icon" aria-hidden="true"></i>
              </button>
              <div id="faq-body-${i}" class="faq-body px-5 pb-4 text-sm leading-relaxed hidden" style="color: var(--text-secondary);">
                ${faq.a}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

  </article>
  `;
}

// ── PostRender: FAQ accordion logic ──
const PostRender = window.PostRender || {};
PostRender.servicios = function () {
  window.toggleFaq = function (index) {
    const body = document.getElementById(`faq-body-${index}`);
    const btn  = body?.previousElementSibling;
    const icon = btn?.querySelector('.faq-icon');
    if (!body) return;

    const isOpen = !body.classList.contains('hidden');
    // Cerrar todos
    document.querySelectorAll('.faq-body').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.faq-icon').forEach(el => el.style.transform = '');
    document.querySelectorAll('.faq-item button').forEach(el => el.setAttribute('aria-expanded', 'false'));

    if (!isOpen) {
      body.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  };
};

window.PostRender = PostRender;
