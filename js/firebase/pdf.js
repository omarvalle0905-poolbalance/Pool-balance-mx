/**
 * ============================================================
 *  POOL BALANCE — PDF GENERATOR (v2 · Reporte Premium)
 *  Genera reportes profesionales en el navegador usando jsPDF.
 *  100% client-side. Maneja portada, parámetros con explicación
 *  completa, acciones, químicos, notas, consumo, saltos de página
 *  y paginación. Lee las explicaciones desde Firestore si existen.
 * ============================================================
 */

const PDFGenerator = (() => {

  // ── Paleta de marca ──
  const C = {
    marino:   [14,  69, 105],
    arcilla:  [232, 102, 74],
    cristal:  [111, 184, 198],
    success:  [45,  158, 107],
    warning:  [232, 168, 56],
    danger:   [217, 92,  92],
    white:    [255, 255, 255],
    bruma:    [238, 241, 245],
    grayText: [99,  120, 138],
    darkText: [14,  69, 105],
  };
  // Tintes claros (jsPDF no soporta alpha en fillColor de forma fiable)
  const LIGHT = {
    danger:  [250, 234, 234],
    success: [231, 247, 240],
    warning: [253, 243, 224],
    marino:  [232, 240, 246],
    cristal: [225, 240, 243],
  };

  const M = 14;            // margen lateral (mm)
  const CW = 210 - M * 2;  // ancho de contenido

  /**
   * Genera y descarga el PDF de una bitácora
   */
  async function generate(bitacora, cliente) {
    if (!bitacora) { Toast.show('No hay datos de bitácora para generar el PDF.', 'error'); return; }

    Toast.show('Generando reporte PDF…', 'info', 4000);

    try {
      const { jsPDF } = await _loadJsPDF();
      const logo = await _loadLogo();
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const ctx = {
        doc,
        W: doc.internal.pageSize.getWidth(),
        H: doc.internal.pageSize.getHeight(),
        y: 0,
        logo,
        bitacora,
        cliente,
      };

      _drawTopBand(ctx);
      _drawClientStrip(ctx);
      _drawScore(ctx);
      _drawBanner(ctx);
      _drawParameters(ctx);
      _drawAcciones(ctx);
      _drawQuimicos(ctx);
      _drawNotas(ctx);
      _drawConsumo(ctx);
      _drawClosing(ctx);
      _stampFooters(ctx);

      const cli = (cliente?.nombre || 'Cliente').replace(/\s+/g, '_');
      const filename = `PoolBalance_Reporte_${bitacora._id || bitacora.fecha}_${cli}.pdf`;
      doc.save(filename);

      Toast.show('Reporte PDF descargado correctamente.', 'success');
    } catch (err) {
      console.error('[PDF] Error:', err);
      Toast.show('Error al generar el PDF. Intenta de nuevo.', 'error');
    }
  }

  // ─────────────────────────────────────────
  //  ENCABEZADO (portada)
  // ─────────────────────────────────────────

  function _drawTopBand(ctx) {
    const { doc, W } = ctx;

    doc.setFillColor(...C.marino);
    doc.rect(0, 0, W, 40, 'F');
    doc.setFillColor(...C.arcilla);
    doc.rect(0, 40, W, 1.3, 'F');

    // Logo (con fondo blanco para contraste); fallback a marca vectorial
    doc.setFillColor(...C.white);
    doc.roundedRect(M, 9, 21, 21, 3, 3, 'F');
    if (ctx.logo) {
      try { doc.addImage(ctx.logo, 'PNG', M + 1.5, 10.5, 18, 18); } catch (e) { _vectorMark(ctx); }
    } else {
      _vectorMark(ctx);
    }

    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.text('Pool Balance', M + 26, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...C.cristal);
    doc.text('GESTORÍA TÉCNICA Y MONITOREO DE ALBERCAS', M + 26, 24);
    doc.setTextColor(200, 220, 235);
    doc.text('El activo más valioso es el agua · Veracruz, México', M + 26, 29);

    // Bloque derecho
    doc.setTextColor(...C.cristal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('REPORTE DE SERVICIO', W - M, 14, { align: 'right' });
    doc.setTextColor(...C.white);
    doc.setFontSize(11);
    doc.text(_capitalize(_formatFechaPDF(ctx.bitacora.fecha)), W - M, 21, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(200, 220, 235);
    doc.text(`Folio: ${ctx.bitacora._id || '—'}`, W - M, 27, { align: 'right' });

    ctx.y = 49;
  }

  function _vectorMark(ctx) {
    const { doc } = ctx;
    doc.setFillColor(...C.cristal);
    doc.circle(M + 10.5, 19.5, 6.5, 'F');
    doc.setFillColor(...C.arcilla);
    doc.circle(M + 10.5, 15.5, 2.4, 'F');
  }

  // ─────────────────────────────────────────
  //  DATOS DEL CLIENTE
  // ─────────────────────────────────────────

  function _drawClientStrip(ctx) {
    const { doc, cliente, bitacora } = ctx;
    const y = ctx.y;
    const h = 25;

    doc.setFillColor(...C.bruma);
    doc.roundedRect(M, y, CW, h, 2.5, 2.5, 'F');

    // Columna izquierda: cliente + dirección
    _label(doc, 'CLIENTE', M + 5, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...C.marino);
    doc.text(cliente?.nombre || cliente?.name || 'Cliente Pool Balance', M + 5, y + 12.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.grayText);
    const dir = cliente?.address || cliente?.direccion || '';
    if (dir) doc.text(doc.splitTextToSize(dir, 95), M + 5, y + 18.5);

    // Columna derecha: datos del servicio
    const rx = M + 108;
    _kv(doc, 'Plan',      cliente?.plan || '—',                         rx, y + 8);
    _kv(doc, 'Técnico',   bitacora.tecnico || '—',                      rx, y + 14);
    _kv(doc, 'Volumen',   (cliente?.poolVolume || cliente?.volumen_m3 || '—'), rx, y + 20);

    ctx.y = y + h + 7;
  }

  // ─────────────────────────────────────────
  //  HERO DE SALUD DEL AGUA
  // ─────────────────────────────────────────

  function _drawScore(ctx) {
    const { doc } = ctx;
    const y = ctx.y;
    const h = 24;
    const score = (typeof _scoreMostrado === 'function')
      ? _scoreMostrado(ctx.bitacora)
      : _calcScorePDF(ctx.bitacora.lecturas);
    const estado = (ctx.bitacora.estado || 'optimo').toLowerCase();
    const sCol = score >= 80 ? C.success : score >= 60 ? C.warning : C.danger;

    doc.setFillColor(...C.marino);
    doc.roundedRect(M, y, CW, h, 3, 3, 'F');

    // Círculo de score
    const cx = M + 17, cy = y + 12;
    doc.setFillColor(...sCol);
    doc.circle(cx, cy, 10, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    const sf = String(score).length >= 3 ? 12 : 16;
    doc.setFontSize(sf);
    doc.text(String(score), cx, cy + sf * 0.13, { align: 'center' });

    // Texto
    doc.setTextColor(...C.cristal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('SALUD DEL AGUA', M + 33, y + 8.5);
    doc.setTextColor(...C.white);
    doc.setFontSize(13);
    doc.text(`${score} / 100`, M + 33, y + 16.5);

    // Badge de estado
    const eMap = {
      optimo:    { c: C.success, l: 'ÓPTIMO' },
      corregido: { c: C.warning, l: 'CORREGIDO' },
      alerta:    { c: C.danger,  l: 'ALERTA' },
    };
    const e = eMap[estado] || eMap.optimo;
    doc.setFillColor(...e.c);
    doc.roundedRect(ctx.W - M - 36, y + 7.5, 30, 9, 2, 2, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(e.l, ctx.W - M - 21, y + 13.5, { align: 'center' });

    ctx.y = y + h + 5;

    // Resumen narrativo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.grayText);
    const lines = doc.splitTextToSize(_scoreSummaryPDF(score), CW);
    doc.text(lines, M, ctx.y + 1);
    ctx.y += lines.length * 4.6 + 5;
  }

  // ─────────────────────────────────────────
  //  BANNER DE CONTEXTO (tratamiento / seguro nadar)
  // ─────────────────────────────────────────

  function _drawBanner(ctx) {
    const { doc } = ctx;
    const b = ctx.bitacora || {};
    const ctxSrv = b.contexto_servicio || {};
    let msg = '';
    if (ctxSrv.banner) msg = ctxSrv.banner;
    else if (b.seguro_banarse === false) msg = 'El agua está en tratamiento. El técnico le avisará cuando sea seguro nadar.';
    if (!msg) return;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(msg, CW - 16);
    const h = lines.length * 4.4 + 9;
    _need(ctx, h + 3);
    const y = ctx.y;
    doc.setFillColor(...LIGHT.warning);
    doc.roundedRect(M, y, CW, h, 2.5, 2.5, 'F');
    doc.setFillColor(...C.warning);
    doc.rect(M, y, 1.5, h, 'F');
    doc.setTextColor(...C.darkText);
    doc.text(lines, M + 7, y + 6.5);
    if (ctxSrv.etiqueta) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...C.warning);
      doc.text(String(ctxSrv.etiqueta).toUpperCase(), ctx.W - M - 5, y + 5, { align: 'right' });
    }
    ctx.y = y + h + 5;
  }

  // ─────────────────────────────────────────
  //  ANÁLISIS DE PARÁMETROS
  // ─────────────────────────────────────────

  function _drawParameters(ctx) {
    const { doc, bitacora } = ctx;
    const lecturas = bitacora.lecturas || {};

    _sectionTitle(ctx, 'ANÁLISIS DE PARÁMETROS DEL AGUA');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.grayText);
    doc.text('Mediciones realizadas con fotómetro digital profesional.', M, ctx.y);
    ctx.y += 6;

    const orden = ['ph', 'cloro_libre', 'cloro_combinado', 'alcalinidad',
                   'dureza_calcica', 'lsi', 'temperatura', 'estabilizador'];

    orden.forEach(key => {
      const val = lecturas[key];
      const cfg = PARAMETROS[key];
      if (val === undefined || val === null || !cfg) return;

      const estado = (typeof _estadoParamCtx === 'function')
        ? _estadoParamCtx(key, cfg, val, bitacora)
        : _getEstadoPDF(val, cfg);
      const stCol  = estado === 'optimo' ? C.success : estado === 'alerta' ? C.warning : C.danger;
      const stLbl  = estado === 'optimo' ? 'ÓPTIMO' : estado === 'alerta' ? 'ATENCIÓN' : 'CRÍTICO';
      const valStr = val.toFixed(cfg.decimales) + (cfg.unidad ? ' ' + cfg.unidad : '');
      const texto  = _explicacionPDF(key, cfg, val, bitacora);

      // Rango mostrado: si el cloro trae rango dinámico (según CYA/modo), úsalo.
      let rangoTxt = `Rango óptimo: ${cfg.optMin} – ${cfg.optMax} ${cfg.unidad}`.trim();
      const _rd = bitacora.rangos_dinamicos && bitacora.rangos_dinamicos.cloro_libre;
      if (key === 'cloro_libre' && _rd && typeof _rd.min === 'number' && typeof _rd.alto === 'number') {
        rangoTxt = `Rango para este servicio: ${_rd.min} – ${_rd.alto} ${cfg.unidad}`.trim();
      }
      // Llegada → resultado (antes/después) si la bitácora lo trae
      const _lleg = bitacora.lecturas_llegada ? bitacora.lecturas_llegada[key] : undefined;
      if (typeof _lleg === 'number' && _lleg !== val) {
        rangoTxt += `   ·   Al llegar: ${_lleg.toFixed(cfg.decimales)}${cfg.unidad ? ' ' + cfg.unidad : ''}`;
      }

      const expLines = doc.splitTextToSize(texto, CW - 10);
      const blockH = 13 + expLines.length * 4 + 5;

      _need(ctx, blockH);
      const y = ctx.y;

      // Tarjeta
      doc.setFillColor(250, 251, 253);
      doc.roundedRect(M, y, CW, blockH - 3, 2, 2, 'F');
      doc.setDrawColor(...stCol);
      doc.setLineWidth(1.1);
      doc.line(M + 0.6, y + 2.5, M + 0.6, y + blockH - 5.5); // acento lateral

      // Nombre + rango
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...C.marino);
      doc.text(cfg.label, M + 6, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(...C.grayText);
      doc.text(rangoTxt, M + 6, y + 11.5);

      // Valor
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...stCol);
      doc.text(valStr, M + CW - 40, y + 9, { align: 'right' });

      // Badge
      doc.setFillColor(...stCol);
      doc.roundedRect(M + CW - 34, y + 4.5, 28, 7, 1.8, 1.8, 'F');
      doc.setTextColor(...C.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(stLbl, M + CW - 20, y + 9, { align: 'center' });

      // Explicación
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.3);
      doc.setTextColor(...C.grayText);
      doc.text(expLines, M + 6, y + 16.5);

      ctx.y = y + blockH;
    });

    ctx.y += 2;
  }

  // ─────────────────────────────────────────
  //  ACCIONES REALIZADAS
  // ─────────────────────────────────────────

  function _drawAcciones(ctx) {
    const { doc, bitacora } = ctx;
    // Checklist mecánico (cepillado, canastillas…) + acciones de la bitácora
    const items = [
      ...((typeof _checklistItems === 'function') ? _checklistItems(bitacora) : []),
      ...(bitacora.acciones || []),
    ];
    if (!items.length) return;

    _need(ctx, 16);
    _sectionTitle(ctx, 'TRABAJO REALIZADO EN LA VISITA');

    items.forEach(acc => {
      const lines = doc.splitTextToSize(acc, CW - 10);
      _need(ctx, lines.length * 4.4 + 3);
      doc.setFillColor(...C.success);
      doc.circle(M + 2.2, ctx.y - 1, 1.4, 'F');
      doc.setTextColor(...C.darkText);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.6);
      doc.text(lines, M + 7, ctx.y);
      ctx.y += lines.length * 4.4 + 2.5;
    });

    ctx.y += 4;
  }

  // ─────────────────────────────────────────
  //  QUÍMICOS APLICADOS
  // ─────────────────────────────────────────

  function _drawQuimicos(ctx) {
    const { doc, bitacora } = ctx;
    // Productos REALMENTE aplicados (array `productos` o, por
    // compatibilidad, `quimicos_usados`). Sin datos no se dibuja nada.
    const prods = (typeof _productosAplicados === 'function') ? _productosAplicados(bitacora) : [];
    if (!prods.length) return;

    _need(ctx, 16);
    _sectionTitle(ctx, 'PRODUCTOS APLICADOS');

    prods.forEach(p => {
      const lines = doc.splitTextToSize(p.label, CW - 12);
      _need(ctx, lines.length * 4.4 + 3);
      doc.setFillColor(...C.cristal);
      doc.circle(M + 2.2, ctx.y - 1, 1.4, 'F');
      doc.setTextColor(...C.darkText);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.6);
      doc.text(lines, M + 7, ctx.y);
      ctx.y += lines.length * 4.4 + 2.5;
    });

    ctx.y += 4;
  }

  // ─────────────────────────────────────────
  //  NOTA DEL TÉCNICO
  // ─────────────────────────────────────────

  function _drawNotas(ctx) {
    const { doc, bitacora } = ctx;
    if (!bitacora.notas) return;

    const lines = doc.splitTextToSize(`"${bitacora.notas}"`, CW - 14);
    const h = lines.length * 4.6 + 14;
    _need(ctx, h + 14);
    _sectionTitle(ctx, 'OBSERVACIONES DEL TÉCNICO');

    const y = ctx.y;
    doc.setFillColor(...C.bruma);
    doc.roundedRect(M, y, CW, h, 2.5, 2.5, 'F');
    doc.setFillColor(...C.cristal);
    doc.rect(M, y, 1.4, h, 'F');

    doc.setTextColor(...C.darkText);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(lines, M + 7, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.grayText);
    doc.text(`— ${bitacora.tecnico || 'Pool Balance'}`, ctx.W - M - 4, y + h - 4, { align: 'right' });

    ctx.y = y + h + 6;
  }

  // ─────────────────────────────────────────
  //  CONSUMO DE AGUA
  // ─────────────────────────────────────────

  function _drawConsumo(ctx) {
    const { doc, bitacora } = ctx;
    const items = [
      { label: 'Litros en retrolavados', val: bitacora.litros_retrolav },
      { label: 'Estimado de evaporación', val: bitacora.litros_evap },
    ].filter(i => i.val !== undefined && i.val !== null);
    if (!items.length) return;

    _need(ctx, 26);
    _sectionTitle(ctx, 'CONSUMO DE AGUA DEL PERIODO');

    const y = ctx.y;
    items.forEach((item, i) => {
      const x = M + i * 92;
      doc.setFillColor(...LIGHT.cristal);
      doc.roundedRect(x, y, 84, 16, 2.5, 2.5, 'F');
      doc.setTextColor(...C.marino);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`${item.val} L`, x + 42, y + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.grayText);
      doc.text(item.label, x + 42, y + 13, { align: 'center' });
    });
    ctx.y = y + 22;
  }

  // ─────────────────────────────────────────
  //  CIERRE
  // ─────────────────────────────────────────

  function _drawClosing(ctx) {
    const { doc } = ctx;
    _need(ctx, 16);
    doc.setDrawColor(...C.bruma);
    doc.setLineWidth(0.4);
    doc.line(M, ctx.y, ctx.W - M, ctx.y);
    ctx.y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.grayText);
    const txt = 'Este reporte resume el estado químico de su alberca al momento del servicio. Para cualquier duda, ' +
                'contáctenos por WhatsApp. Gracias por confiar en Pool Balance.';
    doc.text(doc.splitTextToSize(txt, CW), M, ctx.y);
  }

  // ─────────────────────────────────────────
  //  PIE DE PÁGINA (todas las páginas)
  // ─────────────────────────────────────────

  function _stampFooters(ctx) {
    const { doc, W, H } = ctx;
    const total = doc.getNumberOfPages();
    const phone = APP_CONFIG.company?.phone || '';
    const email = APP_CONFIG.company?.email || '';
    const url   = APP_CONFIG.seo?.canonicalUrl?.replace(/^https?:\/\//, '') || 'poolbalance.com.mx';
    const gen   = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFillColor(...C.marino);
      doc.rect(0, H - 15, W, 15, 'F');
      doc.setFillColor(...C.arcilla);
      doc.rect(0, H - 15, W, 0.8, 'F');

      doc.setTextColor(...C.cristal);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('Pool Balance', M, H - 8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 220, 235);
      doc.setFontSize(6.6);
      doc.text(`${phone}  ·  ${email}  ·  ${url}`, M, H - 4);

      doc.setTextColor(...C.cristal);
      doc.setFontSize(6.6);
      doc.text(`Generado el ${gen}`, W - M, H - 8, { align: 'right' });
      doc.setTextColor(200, 220, 235);
      doc.text(`Página ${p} de ${total}`, W - M, H - 4, { align: 'right' });
    }
  }

  // ─────────────────────────────────────────
  //  UTILIDADES DE DIBUJO
  // ─────────────────────────────────────────

  function _sectionTitle(ctx, text) {
    const { doc } = ctx;
    const y = ctx.y;
    doc.setFillColor(...C.arcilla);
    doc.rect(M, y, 3, 6.5, 'F');
    doc.setTextColor(...C.marino);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(text, M + 6, y + 5);
    ctx.y = y + 11;
  }

  function _label(doc, text, x, y) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.grayText);
    doc.text(text, x, y);
  }

  function _kv(doc, label, val, x, y) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.grayText);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.marino);
    doc.text(String(val), x + 22, y);
  }

  /** Salto de página si no cabe `h` mm; redibuja encabezado de continuación. */
  function _need(ctx, h) {
    if (ctx.y + h <= ctx.H - 20) return;
    const { doc, W } = ctx;
    doc.addPage();
    doc.setFillColor(...C.marino);
    doc.rect(0, 0, W, 16, 'F');
    doc.setFillColor(...C.arcilla);
    doc.rect(0, 16, W, 1, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Pool Balance', M, 11);
    doc.setTextColor(...C.cristal);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Reporte de Servicio — continuación', W - M, 11, { align: 'right' });
    ctx.y = 26;
  }

  // ─────────────────────────────────────────
  //  HELPERS DE DATOS
  // ─────────────────────────────────────────

  async function _loadJsPDF() {
    if (window.jspdf) return window.jspdf;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.onload  = () => resolve(window.jspdf);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /** Carga el logo (mismo origen) como dataURL; null si falla. */
  async function _loadLogo() {
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = 'images/logo.png';
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 256;
      canvas.height = img.naturalHeight || 256;
      canvas.getContext('2d').drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    } catch (e) {
      return null;
    }
  }

  /** Texto de explicación: Firestore si existe, si no el cálculo local. Sin emoji. */
  function _explicacionPDF(key, cfg, val, bitacora) {
    let exp;
    if (typeof _explicacionParam === 'function') exp = _explicacionParam(key, cfg, val, bitacora);
    else exp = cfg.explicacion(val);
    return (exp?.texto || '').trim();
  }

  function _formatFechaPDF(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function _capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function _calcScorePDF(lecturas) {
    if (typeof _calcScore === 'function') return _calcScore(lecturas);
    return 85;
  }

  function _getEstadoPDF(val, cfg) {
    if (typeof _getEstadoParam === 'function') return _getEstadoParam(val, cfg);
    return val >= cfg.optMin && val <= cfg.optMax ? 'optimo' : 'alerta';
  }

  function _scoreSummaryPDF(score) {
    if (score >= 90) return 'El agua se encuentra en condiciones óptimas. Todos los parámetros químicos están equilibrados; el agua es segura y confortable para su uso.';
    if (score >= 75) return 'El agua está segura y estable. Los parámetros se mantienen dentro de rango con ajustes menores realizados durante la visita.';
    if (score >= 60) return 'El agua requirió correcciones durante este servicio. Tras el tratamiento aplicado, quedó balanceada y segura para su uso.';
    if (score >= 40) return 'Se corrigieron varios parámetros durante el servicio. El agua ya se encuentra dentro de condiciones seguras; revise las acciones realizadas.';
    return 'Se realizó una intervención correctiva intensiva. Le recomendamos seguir las indicaciones del técnico antes de utilizar la alberca.';
  }

  return { generate };

})();

window.PDFGenerator = PDFGenerator;
