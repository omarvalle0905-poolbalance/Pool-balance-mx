/**
 * ============================================================
 *  POOL BALANCE — PDF GENERATOR
 *  Genera reportes profesionales en el navegador usando jsPDF.
 *  Sin servidor requerido — 100% client-side.
 * ============================================================
 */

const PDFGenerator = (() => {

  // ── Colores del sistema de diseño ──
  const C = {
    marino:   [14,  69, 105],
    arcilla:  [201, 122, 79],
    cristal:  [111, 184, 198],
    success:  [45,  158, 107],
    warning:  [232, 168, 56],
    danger:   [217, 92,  92],
    white:    [255, 255, 255],
    bruma:    [238, 241, 245],
    grayText: [107, 141, 160],
    darkText: [14,  69, 105],
  };

  /**
   * Genera y descarga el PDF de una bitácora
   * @param {Object} bitacora  — documento de Firestore
   * @param {Object} cliente   — perfil del cliente
   */
  async function generate(bitacora, cliente) {
    if (!bitacora) { Toast.show('No hay datos de bitácora para generar el PDF.', 'error'); return; }

    Toast.show('Generando reporte PDF…', 'info', 4000);

    try {
      // Cargar jsPDF dinámicamente
      const { jsPDF } = await _loadJsPDF();
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const W  = doc.internal.pageSize.getWidth();   // 210
      const H  = doc.internal.pageSize.getHeight();  // 297
      let   y  = 0;  // cursor vertical

      // ── HEADER ──
      y = _drawHeader(doc, W, bitacora, cliente, y);

      // ── SCORE Y RESUMEN ──
      y = _drawScoreSection(doc, W, bitacora, y);

      // ── TABLA DE PARÁMETROS ──
      y = _drawParametersTable(doc, W, bitacora.lecturas, y);

      // ── ACCIONES Y QUÍMICOS ──
      y = _drawAccionesSection(doc, W, bitacora, y);

      // ── NOTAS DEL TÉCNICO ──
      if (bitacora.notas) {
        y = _drawNotasSection(doc, W, bitacora.notas, y);
      }

      // ── CONSUMO DE AGUA ──
      if (bitacora.litros_retrolav !== undefined) {
        y = _drawConsumoSection(doc, W, bitacora, y);
      }

      // ── FOOTER ──
      _drawFooter(doc, W, H);

      // ── DESCARGA ──
      const filename = `PoolBalance_Bitacora_${bitacora._id || bitacora.fecha}_${(cliente?.nombre || 'Cliente').replace(/\s+/g,'_')}.pdf`;
      doc.save(filename);

      Toast.show('Reporte PDF descargado correctamente.', 'success');

    } catch (err) {
      console.error('[PDF] Error:', err);
      Toast.show('Error al generar el PDF. Intenta de nuevo.', 'error');
    }
  }

  // ─────────────────────────────────────────
  //  SECCIONES DEL PDF
  // ─────────────────────────────────────────

  function _drawHeader(doc, W, bitacora, cliente, y) {
    // Fondo header marino
    doc.setFillColor(...C.marino);
    doc.rect(0, 0, W, 42, 'F');

    // Nombre empresa
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Pool Balance', 14, 14);

    // Subtítulo empresa
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.cristal);
    doc.text('GESTORÍA TÉCNICA Y MONITOREO DE ALBERCAS · VERACRUZ, MX', 14, 20);

    // Línea divisora fina
    doc.setDrawColor(...C.cristal);
    doc.setLineWidth(0.3);
    doc.line(14, 23, W - 14, 23);

    // Datos del cliente
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(cliente?.nombre || 'Cliente Pool Balance', 14, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 235);
    doc.text(`${cliente?.address || cliente?.direccion || ''}  ·  Plan ${cliente?.plan || ''}`, 14, 36);

    // Fecha en esquina derecha
    doc.setTextColor(...C.cristal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const fechaStr = _formatFechaPDF(bitacora.fecha);
    doc.text(fechaStr, W - 14, 24, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(200, 220, 235);
    doc.text(`Técnico: ${bitacora.tecnico || ''}`, W - 14, 30, { align: 'right' });
    doc.text(`ID Bitácora: ${bitacora._id || bitacora.fecha}`, W - 14, 36, { align: 'right' });

    return 52;
  }

  function _drawScoreSection(doc, W, bitacora, y) {
    const score = _calcScorePDF(bitacora.lecturas);
    const estado = bitacora.estado || 'optimo';

    // Fondo score
    doc.setFillColor(...C.bruma);
    doc.roundedRect(14, y, W - 28, 22, 3, 3, 'F');

    // Score número
    const scoreColor = score >= 80 ? C.success : score >= 60 ? C.warning : C.danger;
    doc.setFillColor(...scoreColor);
    doc.circle(26, y + 11, 7, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(score), 26, y + 12.5, { align: 'center' });

    doc.setTextColor(...C.darkText);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Salud del Agua: ${score}/100`, 38, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.grayText);
    const label = score >= 80 ? 'Agua en condiciones óptimas' :
                  score >= 60 ? 'Correcciones realizadas en esta visita' :
                                'Intervención intensiva aplicada';
    doc.text(label, 38, y + 14);

    // Badge estado
    const estColors = { optimo: C.success, corregido: C.warning, alerta: C.danger };
    doc.setFillColor(...(estColors[estado] || C.success));
    doc.roundedRect(W - 50, y + 6, 36, 10, 3, 3, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(estado.toUpperCase(), W - 32, y + 12.5, { align: 'center' });

    return y + 30;
  }

  function _drawParametersTable(doc, W, lecturas, y) {
    // Título sección
    y = _sectionTitle(doc, W, 'ANÁLISIS DE PARÁMETROS', y);

    const params = [
      { key: 'ph',              label: 'pH del Agua',         unidad: '' },
      { key: 'cloro_libre',     label: 'Cloro Libre',         unidad: 'ppm' },
      { key: 'cloro_combinado', label: 'Cloro Combinado',     unidad: 'ppm' },
      { key: 'alcalinidad',     label: 'Alcalinidad Total',   unidad: 'ppm' },
      { key: 'dureza_calcica',  label: 'Dureza Cálcica',      unidad: 'ppm' },
      { key: 'lsi',             label: 'Índice de Langelier', unidad: '' },
      { key: 'temperatura',     label: 'Temperatura',         unidad: '°C', opcional: true },
      { key: 'estabilizador',   label: 'Estabilizador CYA',   unidad: 'ppm', opcional: true },
    ];

    // Cabecera tabla
    const colX = [14, 70, 105, 130, 165, 190];
    doc.setFillColor(...C.marino);
    doc.rect(14, y, W - 28, 8, 'F');
    doc.setTextColor(...C.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Parámetro',     colX[0] + 2, y + 5.5);
    doc.text('Valor',         colX[1],     y + 5.5);
    doc.text('Rango Óptimo',  colX[2],     y + 5.5);
    doc.text('Estado',        colX[3],     y + 5.5);
    doc.text('Detalle',       colX[4],     y + 5.5);
    y += 8;

    let rowAlt = false;
    params.forEach(p => {
      const val = lecturas[p.key];
      if (val === undefined || val === null) return;
      const cfg    = PARAMETROS[p.key];
      if (!cfg) return;
      const estado = _getEstadoPDF(val, cfg);
      const stCol  = estado === 'optimo' ? C.success : estado === 'alerta' ? C.warning : C.danger;
      const stLbl  = estado === 'optimo' ? 'ÓPTIMO' : estado === 'alerta' ? 'ALERTA' : 'CRÍTICO';
      const expTxt = cfg.explicacion(val).texto.substring(0, 60) + '…';
      const valStr = val.toFixed(cfg.decimales) + (p.unidad ? ' ' + p.unidad : '');

      if (rowAlt) {
        doc.setFillColor(246, 248, 251);
        doc.rect(14, y, W - 28, 8, 'F');
      }
      rowAlt = !rowAlt;

      doc.setTextColor(...C.darkText);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(p.label, colX[0] + 2, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.text(valStr, colX[1], y + 5.5);
      doc.text(`${cfg.optMin}–${cfg.optMax}`, colX[2], y + 5.5);

      // Badge estado
      doc.setFillColor(...stCol);
      doc.roundedRect(colX[3], y + 1.5, 22, 5, 1.5, 1.5, 'F');
      doc.setTextColor(...C.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text(stLbl, colX[3] + 11, y + 5, { align: 'center' });

      doc.setTextColor(...C.grayText);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(expTxt, colX[4], y + 5.5, { maxWidth: 30 });

      y += 8;
    });

    return y + 6;
  }

  function _drawAccionesSection(doc, W, bitacora, y) {
    if (!bitacora.acciones?.length && !bitacora.quimicos_usados) return y;

    // Dos columnas: acciones + químicos
    const colW = (W - 28 - 6) / 2;

    if (bitacora.acciones?.length) {
      y = _sectionTitle(doc, W, 'ACCIONES REALIZADAS', y);
      bitacora.acciones.forEach(acc => {
        doc.setFillColor(...C.success);
        doc.circle(18, y + 2.5, 1.5, 'F');
        doc.setTextColor(...C.darkText);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(acc, 22, y + 4);
        y += 7;
      });
      y += 4;
    }

    if (bitacora.quimicos_usados) {
      y = _sectionTitle(doc, W, 'QUÍMICOS APLICADOS', y);
      const q = bitacora.quimicos_usados;
      const qItems = [
        { label: 'Ácido Muriático', val: q.acido_mur_lt,   unit: 'L',  color: C.danger  },
        { label: 'Cloro Granular',  val: q.cloro_kg,       unit: 'kg', color: C.success },
        { label: 'Bicarbonato',     val: q.bicarbonato_kg, unit: 'kg', color: C.marino  },
      ].filter(i => i.val !== undefined && i.val !== null);

      let xQ = 14;
      qItems.forEach(item => {
        doc.setFillColor(...item.color, 20);
        doc.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
        doc.roundedRect(xQ, y, 50, 14, 2, 2, 'F');
        doc.setTextColor(...item.color);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${item.val}${item.unit}`, xQ + 25, y + 8, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.grayText);
        doc.text(item.label, xQ + 25, y + 12.5, { align: 'center' });
        xQ += 56;
      });
      y += 22;
    }

    return y;
  }

  function _drawNotasSection(doc, W, notas, y) {
    y = _sectionTitle(doc, W, 'NOTA DEL TÉCNICO', y);
    doc.setFillColor(...C.bruma);
    doc.roundedRect(14, y, W - 28, 16, 3, 3, 'F');
    doc.setTextColor(...C.grayText);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(`"${notas}"`, W - 36);
    doc.text(lines, 20, y + 6);
    return y + 22;
  }

  function _drawConsumoSection(doc, W, bitacora, y) {
    y = _sectionTitle(doc, W, 'CONSUMO DE AGUA DEL MES', y);

    const items = [
      { label: 'Litros en Retrolavados', val: bitacora.litros_retrolav, unit: 'L', icon: '🔄' },
      { label: 'Estimado Evaporación',   val: bitacora.litros_evap,     unit: 'L', icon: '☀️' },
    ].filter(i => i.val !== undefined);

    items.forEach((item, i) => {
      const xI = 14 + i * 90;
      doc.setFillColor(...C.cristal, 0.1);
      doc.setFillColor(111, 184, 198, 0.12);
      doc.roundedRect(xI, y, 82, 14, 2, 2, 'F');
      doc.setTextColor(...C.marino);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`${item.val} ${item.unit}`, xI + 41, y + 8, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.grayText);
      doc.text(item.label, xI + 41, y + 12.5, { align: 'center' });
    });

    return y + 22;
  }

  function _drawFooter(doc, W, H) {
    doc.setFillColor(...C.marino);
    doc.rect(0, H - 16, W, 16, 'F');

    doc.setTextColor(...C.cristal);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Pool Balance · Gestoría Técnica de Albercas · Veracruz, México', W / 2, H - 9, { align: 'center' });
    doc.setTextColor(200, 220, 235);
    doc.setFontSize(6.5);
    doc.text(`${APP_CONFIG.company.phone}  ·  ${APP_CONFIG.company.email}  ·  ${APP_CONFIG.seo?.canonicalUrl || 'poolbalance.com.mx'}`, W / 2, H - 4, { align: 'center' });

    // Número de página
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, H - 6);
  }

  function _sectionTitle(doc, W, text, y) {
    doc.setFillColor(...C.marino);
    doc.rect(14, y, 3, 7, 'F');
    doc.setTextColor(...C.marino);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(text, 20, y + 5.5);
    return y + 12;
  }

  // ─────────────────────────────────────────
  //  HELPERS
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

  function _formatFechaPDF(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  function _calcScorePDF(lecturas) {
    if (typeof _calcScore === 'function') return _calcScore(lecturas);
    return 85;
  }

  function _getEstadoPDF(val, cfg) {
    if (typeof _getEstadoParam === 'function') return _getEstadoParam(val, cfg);
    return val >= cfg.optMin && val <= cfg.optMax ? 'optimo' : 'alerta';
  }

  return { generate };

})();

window.PDFGenerator = PDFGenerator;
