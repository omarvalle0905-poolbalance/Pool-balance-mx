/**
 * ============================================================
 *  POOL BALANCE — VISTA 3: BIBLIOTECA TÉCNICA / PODCASTS
 *  Consume: APP_CONFIG.library
 *  Features: filtro por categoría, reproductor de audio UI,
 *  waveform simulada, gestión de estado de reproducción.
 * ============================================================
 */

// Estado del reproductor (singleton por sesión)
const AudioPlayerState = {
  currentEpisode: null,
  isPlaying: false,
  progress: 0,
  intervalId: null,
};

function renderBiblioteca() {
  const { library } = APP_CONFIG;

  function renderEpisodeCard(ep, index) {
    const isFeatured = ep.featured && index === 0;
    const waveformBars = _generateWaveform(28);
    const animDelay = Math.min(index + 1, 6);

    return `
      <article
        class="podcast-card ${isFeatured ? 'featured-ep' : ''} anim-fade-in-up anim-delay-${animDelay}"
        data-ep-id="${ep.id}"
        data-category="${ep.category}"
        role="article"
        aria-label="Episodio: ${ep.title}"
      >
        <!-- Cover -->
        <div class="podcast-cover">
          <img
            src="${ep.coverImage}"
            alt="Portada: ${ep.title}"
            loading="lazy"
          />
          <div class="podcast-cover-overlay" aria-hidden="true"></div>
          <span class="podcast-episode-number" aria-label="${ep.number}">${ep.number}</span>
        </div>

        <!-- Body -->
        <div class="podcast-body">
          <div class="podcast-meta">
            <span class="podcast-category">${ep.category}</span>
            <span class="podcast-duration">
              <i class="fa-regular fa-clock" aria-hidden="true"></i>
              ${ep.duration}
            </span>
            <time class="text-xs" style="color: var(--text-muted);" datetime="${ep.publishDate}">
              ${_formatDate(ep.publishDate)}
            </time>
          </div>

          <h3 class="podcast-title">${ep.title}</h3>
          <p class="podcast-summary">${ep.summary}</p>

          <!-- Tags -->
          <div class="podcast-tags" aria-label="Etiquetas">
            ${ep.tags.map(tag => `<span class="podcast-tag">${tag}</span>`).join('')}
          </div>

          <!-- Audio Player UI -->
          <div class="audio-player mt-4" role="region" aria-label="Reproductor de audio: ${ep.title}">
            <div class="audio-player-top">
              <!-- Play button -->
              <button
                class="audio-play-btn"
                onclick="AudioPlayer.toggle('${ep.id}')"
                aria-label="Reproducir ${ep.title}"
                id="play-btn-${ep.id}"
              >
                <i class="fa-solid fa-play" id="play-icon-${ep.id}" aria-hidden="true"></i>
              </button>

              <!-- Waveform -->
              <div
                class="audio-waveform"
                onclick="AudioPlayer.seekFromWaveform(event, '${ep.id}')"
                role="progressbar"
                aria-label="Progreso del episodio"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="0"
                id="waveform-${ep.id}"
              >
                ${waveformBars}
              </div>

              <!-- Time -->
              <span class="audio-time" id="time-${ep.id}" aria-live="polite">
                0:00 / ${ep.duration}
              </span>
            </div>

            <!-- Nota si no hay audio real -->
            ${!ep.audioUrl ? `
              <p class="text-xs mt-1" style="color: var(--text-muted);">
                <i class="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
                Próximamente — añade la URL del audio en <code>data/config.js</code>
              </p>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }

  return `
  <article class="view-page" id="view-biblioteca">

    <!-- ── STICKY HEADER ── -->
    <header class="sticky-header">
      <div class="content-container">
        <h1 class="text-base font-bold text-marino">Biblioteca Técnica</h1>
        <p class="text-xs" style="color: var(--text-muted);">
          ${library.episodes.length} episodios disponibles
        </p>
      </div>
    </header>

    <!-- ── HEADLINE ── -->
    <section class="page-section" aria-labelledby="library-title">
      <div class="content-container">
        <header class="section-header">
          <p class="section-eyebrow">Conocimiento técnico gratuito</p>
          <h2 class="section-title" id="library-title">${library.headline}</h2>
          <p class="section-subtitle">${library.subheadline}</p>
        </header>

        <!-- ── FILTROS DE CATEGORÍA ── -->
        <div
          class="filter-pills mb-8"
          role="group"
          aria-label="Filtrar episodios por categoría"
          id="category-filters"
        >
          ${library.categories.map((cat, i) => `
            <button
              class="filter-pill ${i === 0 ? 'active' : ''}"
              data-category="${cat}"
              onclick="AudioPlayer.filterCategory('${cat}')"
              aria-pressed="${i === 0 ? 'true' : 'false'}"
            >
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- ── GRID DE EPISODIOS ── -->
        <div
          class="grid-cards grid-cards-3"
          id="episodes-grid"
          role="feed"
          aria-label="Episodios del podcast"
          aria-live="polite"
        >
          ${library.episodes.map((ep, i) => renderEpisodeCard(ep, i)).join('')}
        </div>

        <!-- Estado vacío (oculto por defecto) -->
        <div id="no-results" class="hidden text-center py-16">
          <div class="text-4xl mb-4">🎧</div>
          <p class="font-bold text-marino mb-2">No hay episodios en esta categoría aún</p>
          <p class="text-sm" style="color: var(--text-muted);">Muy pronto subiremos nuevo contenido.</p>
        </div>

      </div>
    </section>

    <!-- ── CTA SUSCRIPCIÓN ── -->
    <section class="page-section-lg" style="background: var(--color-marino);" aria-label="Suscribirse al podcast">
      <div class="content-container text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style="background: rgba(111,184,198,0.15); font-size: 1.75rem;">
          🎙️
        </div>
        <h2 class="text-white font-extrabold mb-3" style="font-size: clamp(1.3rem,3vw,2rem);">
          Nuevo episodio cada dos semanas
        </h2>
        <p style="color: rgba(255,255,255,0.65); max-width:440px; margin: 0 auto 28px; font-size:0.9rem; line-height:1.7;">
          Recibe una notificación por WhatsApp cuando publiquemos un nuevo episodio técnico. Sin spam, sin correos, solo conocimiento útil.
        </p>
        <a
          href="https://wa.me/${APP_CONFIG.company.whatsapp}?text=${encodeURIComponent('Hola, quiero recibir avisos de nuevos episodios de la Biblioteca Pool Balance.')}"
          target="_blank"
          rel="noopener"
          class="btn btn-whatsapp btn-lg"
        >
          <i class="fa-brands fa-whatsapp"></i>
          Suscribirme por WhatsApp
        </a>
      </div>
    </section>

  </article>
  `;
}

// ─────────────────────────────────────────
//  AUDIO PLAYER CONTROLLER
// ─────────────────────────────────────────
const AudioPlayer = {

  /** Genera estado inicial del episodio */
  _getEp(id) {
    return APP_CONFIG.library.episodes.find(e => e.id === id);
  },

  /** Toggle play/pause */
  toggle(episodeId) {
    const state = AudioPlayerState;

    // Si hay audio real para este episodio
    const ep = this._getEp(episodeId);
    if (ep?.audioUrl) {
      this._playRealAudio(episodeId, ep.audioUrl);
      return;
    }

    // ── Simulación de reproductor (sin URL de audio real) ──
    if (state.currentEpisode === episodeId && state.isPlaying) {
      this._pause(episodeId);
    } else {
      if (state.currentEpisode && state.currentEpisode !== episodeId) {
        this._stopAll();
      }
      this._play(episodeId);
    }
  },

  _play(id) {
    const state = AudioPlayerState;
    state.currentEpisode = id;
    state.isPlaying = true;

    const playIcon = document.getElementById(`play-icon-${id}`);
    if (playIcon) {
      playIcon.classList.remove('fa-play');
      playIcon.classList.add('fa-pause');
      playIcon.closest('button').setAttribute('aria-label', 'Pausar episodio');
    }

    // Simular progreso
    const ep = this._getEp(id);
    const durationSeconds = this._parseDuration(ep?.duration || '20 min');

    clearInterval(state.intervalId);
    state.intervalId = setInterval(() => {
      state.progress += (100 / durationSeconds);
      if (state.progress >= 100) {
        state.progress = 100;
        this._pause(id);
        return;
      }
      this._updateUI(id, state.progress, durationSeconds);
    }, 1000);
  },

  _pause(id) {
    const state = AudioPlayerState;
    state.isPlaying = false;
    clearInterval(state.intervalId);

    const playIcon = document.getElementById(`play-icon-${id}`);
    if (playIcon) {
      playIcon.classList.add('fa-play');
      playIcon.classList.remove('fa-pause');
      playIcon.closest('button').setAttribute('aria-label', 'Reproducir episodio');
    }
  },

  _stopAll() {
    const state = AudioPlayerState;
    if (state.currentEpisode) {
      this._pause(state.currentEpisode);
      state.progress = 0;
      this._updateUI(state.currentEpisode, 0);
    }
    state.currentEpisode = null;
  },

  /** Actualiza waveform y tiempo */
  _updateUI(id, progress, totalSeconds) {
    const ep = this._getEp(id);
    if (!ep) return;

    const total = totalSeconds || this._parseDuration(ep.duration);
    const elapsed = Math.floor((progress / 100) * total);
    const timeEl = document.getElementById(`time-${id}`);
    if (timeEl) {
      timeEl.textContent = `${this._formatSeconds(elapsed)} / ${ep.duration}`;
    }

    // Waveform
    const waveform = document.getElementById(`waveform-${id}`);
    if (waveform) {
      const bars = waveform.querySelectorAll('.waveform-bar');
      const playedCount = Math.floor((progress / 100) * bars.length);
      bars.forEach((bar, i) => {
        bar.classList.toggle('played', i < playedCount);
      });
      waveform.setAttribute('aria-valuenow', Math.round(progress));
    }
  },

  /** Seek desde clic en waveform */
  seekFromWaveform(event, id) {
    const waveform = document.getElementById(`waveform-${id}`);
    if (!waveform) return;
    const rect = waveform.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

    const state = AudioPlayerState;
    if (state.currentEpisode === id) {
      state.progress = newProgress;
      const ep = this._getEp(id);
      this._updateUI(id, newProgress, this._parseDuration(ep?.duration || '20 min'));
    }
  },

  /** Filtrar por categoría */
  filterCategory(category) {
    // Actualizar pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      const isActive = pill.dataset.category === category;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', String(isActive));
    });

    // Mostrar/ocultar tarjetas
    const cards = document.querySelectorAll('[data-ep-id]');
    let visibleCount = 0;

    cards.forEach(card => {
      const matches = category === 'Todos' || card.dataset.category === category;
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    // Estado vacío
    const noResults = document.getElementById('no-results');
    if (noResults) {
      noResults.classList.toggle('hidden', visibleCount > 0);
    }
  },

  /** Reproduce audio real si hay URL */
  _playRealAudio(id, url) {
    // Parar audio anterior
    if (AudioPlayerState._audioEl) {
      AudioPlayerState._audioEl.pause();
    }

    const audio = new Audio(url);
    AudioPlayerState._audioEl = audio;
    AudioPlayerState.currentEpisode = id;

    const playIcon = document.getElementById(`play-icon-${id}`);

    audio.addEventListener('play', () => {
      AudioPlayerState.isPlaying = true;
      if (playIcon) { playIcon.classList.replace('fa-play', 'fa-pause'); }
    });

    audio.addEventListener('pause', () => {
      AudioPlayerState.isPlaying = false;
      if (playIcon) { playIcon.classList.replace('fa-pause', 'fa-play'); }
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const progress = (audio.currentTime / audio.duration) * 100;
      this._updateUI(id, progress, audio.duration);
    });

    audio.play().catch(err => {
      console.warn('[AudioPlayer] No se pudo reproducir:', err);
      Toast.show('No se pudo cargar el audio. Intenta de nuevo.', 'error');
    });
  },

  // ── Utilidades ──
  _parseDuration(str) {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 1200;
  },

  _formatSeconds(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },
};

// ─────────────────────────────────────────
//  HELPERS PRIVADOS
// ─────────────────────────────────────────

function _generateWaveform(bars = 28) {
  const heights = [
    30,45,60,75,55,85,70,50,65,80,
    45,90,60,35,75,55,80,40,65,75,
    50,85,45,70,60,30,55,40
  ];
  return heights.slice(0, bars).map((h, i) => `
    <div
      class="waveform-bar"
      style="height: ${h}%"
      data-index="${i}"
      aria-hidden="true"
    ></div>
  `).join('');
}

function _formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Registrar PostRender
PostRender.biblioteca = function () {
  // Exponer AudioPlayer globalmente para los onclick
  window.AudioPlayer = AudioPlayer;
};

window.PostRender = PostRender;
