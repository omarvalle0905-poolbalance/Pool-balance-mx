/**
 * ============================================================
 *  POOL BALANCE — FIRESTORE SERVICE
 *
 *  Esquema de colecciones:
 *
 *  clientes/
 *    {clienteId}/                    ← ej. "PB-2025-001"
 *      nombre, plan, direccion, etc.
 *      albercas/
 *        {albercaId}/                ← generalmente "principal"
 *          volumen_m3, tipo_acabado…
 *          bitacoras/
 *            {YYYY-MM-DD}/           ← fecha como ID del doc
 *              ph, cloro_libre, etc.
 *              fotos: [url1, url2…]
 *              acciones: [...]
 *
 *  MODO DEMO: Si Firebase no está configurado, retorna datos
 *  del mock de APP_CONFIG.portal para que la UI funcione igual.
 * ============================================================
 */

const FirestoreService = (() => {

  // ── Caché en memoria para evitar lecturas repetidas ──
  const _cache = new Map();
  const _unsubscribers = new Map(); // listeners activos

  // ─────────────────────────────────────────
  //  CLIENTE — Perfil
  // ─────────────────────────────────────────

  /**
   * Obtiene el perfil completo del cliente desde Firestore
   * @param {string} clientId  ej. "PB-2025-001"
   */
  async function getClientProfile(clientId) {
    if (!_isFirebaseReady()) return _getMockProfile(clientId);

    const cacheKey = `profile_${clientId}`;
    if (_cache.has(cacheKey)) return _cache.get(cacheKey);

    try {
      const docRef  = FS.doc(FB.db, 'clientes', clientId);
      const docSnap = await FS.getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn(`[Firestore] Cliente "${clientId}" no encontrado.`);
        return null;
      }

      const profile = { _id: clientId, ...docSnap.data() };
      _cache.set(cacheKey, profile);
      return profile;

    } catch (error) {
      console.error('[Firestore] Error al obtener perfil:', error);
      return _getMockProfile(clientId);
    }
  }

  // ─────────────────────────────────────────
  //  BITÁCORAS — Listado
  // ─────────────────────────────────────────

  /**
   * Obtiene las bitácoras de un cliente ordenadas por fecha desc.
   * @param {string} clientId
   * @param {string} albercaId  default: "principal"
   * @param {number} limitNum
   */
  async function getBitacoras(clientId, albercaId = 'principal', limitNum = 20) {
    if (!_isFirebaseReady()) return _getMockBitacoras(clientId);

    try {
      const colRef = FS.collection(
        FB.db, 'clientes', clientId, 'albercas', albercaId, 'bitacoras'
      );
      const q = FS.query(colRef, FS.orderBy('fecha', 'desc'), FS.limit(limitNum));
      const snap = await FS.getDocs(q);

      return snap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    } catch (error) {
      console.error('[Firestore] Error al obtener bitácoras:', error);
      return _getMockBitacoras(clientId);
    }
  }

  /**
   * Obtiene UNA bitácora específica por su ID (fecha)
   * @param {string} clientId
   * @param {string} bitacoraId   ej. "2025-06-28"
   * @param {string} albercaId
   */
  async function getBitacoraById(clientId, bitacoraId, albercaId = 'principal') {
    if (!_isFirebaseReady()) {
      return _getMockBitacoras(clientId).find(b => b._id === bitacoraId) || null;
    }

    try {
      const docRef  = FS.doc(
        FB.db, 'clientes', clientId, 'albercas', albercaId, 'bitacoras', bitacoraId
      );
      const docSnap = await FS.getDoc(docRef);

      if (!docSnap.exists()) return null;
      return { _id: docSnap.id, ...docSnap.data() };

    } catch (error) {
      console.error('[Firestore] Error al obtener bitácora:', error);
      return null;
    }
  }

  // ─────────────────────────────────────────
  //  LISTENER EN TIEMPO REAL — Bitácoras
  // ─────────────────────────────────────────

  /**
   * Suscribe a cambios en tiempo real de las bitácoras.
   * Útil si Omar actualiza Firestore desde Sheets y el cliente
   * ve los cambios sin recargar la página.
   *
   * @param {string}   clientId
   * @param {Function} callback(bitacoras[])
   * @param {string}   albercaId
   * @returns {Function}  unsubscribe — llamar para cancelar
   */
  function subscribeToBitacoras(clientId, callback, albercaId = 'principal') {
    if (!_isFirebaseReady()) {
      // Modo demo: llamar callback una vez con datos mock
      setTimeout(() => callback(_getMockBitacoras(clientId)), 200);
      return () => {};
    }

    const colRef = FS.collection(
      FB.db, 'clientes', clientId, 'albercas', albercaId, 'bitacoras'
    );
    const q = FS.query(colRef, FS.orderBy('fecha', 'desc'), FS.limit(20));

    const unsubscribe = FS.onSnapshot(q,
      (snap) => {
        const bitacoras = snap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        callback(bitacoras);
      },
      (error) => {
        console.error('[Firestore] Error en listener:', error);
        callback(_getMockBitacoras(clientId));
      }
    );

    // Guardar referencia para poder cancelar después
    const key = `bitacoras_${clientId}`;
    if (_unsubscribers.has(key)) _unsubscribers.get(key)();
    _unsubscribers.set(key, unsubscribe);

    return unsubscribe;
  }

  /**
   * Cancela todos los listeners activos (llamar al hacer logout)
   */
  function unsubscribeAll() {
    _unsubscribers.forEach(unsub => unsub());
    _unsubscribers.clear();
    _cache.clear();
  }

  // ─────────────────────────────────────────
  //  ESCRITURA — Para el Apps Script de Sheets
  // ─────────────────────────────────────────

  /**
   * Guarda o actualiza una bitácora.
   * Este método lo llamará el Apps Script de Google Sheets
   * usando la Firebase Admin SDK o REST API.
   *
   * Desde el frontend (cliente), solo es de lectura.
   * Documentado aquí para referencia del desarrollador.
   *
   * Estructura esperada del documento:
   * {
   *   fecha:             "2025-06-28",           // string YYYY-MM-DD
   *   fecha_timestamp:   Timestamp,              // para ordenar
   *   tecnico:           "Ing. Omar Castillo",
   *   estado:            "optimo" | "corregido" | "alerta",
   *   lecturas: {
   *     ph:               7.4,
   *     cloro_libre:      2.1,
   *     cloro_combinado:  0.2,
   *     alcalinidad:      105,
   *     dureza_calcica:   280,
   *     lsi:              0.1,    // Langelier Saturation Index
   *     temperatura:      28,     // °C (opcional)
   *     estabilizador:    40,     // ppm CYA (opcional)
   *   },
   *   acciones:          ["Ajuste pH", "Retrolavado de filtro"],
   *   notas:             "Alberca en condiciones óptimas.",
   *   fotos:             ["https://storage.googleapis.com/...", "https://drive.google.com/..."],
   *   pdf_url:           "https://storage.googleapis.com/...",  // opcional
   *   litros_retrolav:   180,   // litros perdidos en retrolavado
   *   litros_evap:       210,   // estimado de evaporación
   *   quimicos_usados: {
   *     acido_mur_lt:    0.5,
   *     cloro_kg:        0.3,
   *     bicarbonato_kg:  0,
   *   }
   * }
   */
  async function saveBitacora(clientId, albercaId, bitacoraData) {
    if (!_isFirebaseReady()) {
      console.warn('[Firestore] saveBitacora: Firebase no disponible.');
      return false;
    }

    try {
      const docRef = FS.doc(
        FB.db,
        'clientes', clientId,
        'albercas', albercaId,
        'bitacoras', bitacoraData.fecha
      );
      await FS.setDoc(docRef, {
        ...bitacoraData,
        fecha_timestamp: FS.serverTimestamp(),
        updated_at:      FS.serverTimestamp(),
      }, { merge: true });

      // Invalidar caché
      _cache.delete(`bitacoras_${clientId}`);
      return true;

    } catch (error) {
      console.error('[Firestore] Error al guardar bitácora:', error);
      return false;
    }
  }

  // ─────────────────────────────────────────
  //  DATOS MOCK (Modo Demo / sin Firebase)
  // ─────────────────────────────────────────

  function _getMockProfile(clientId) {
    return {
      ...APP_CONFIG.portal.mockClient,
      _id:    clientId || APP_CONFIG.portal.demoClientId,
      _isDemo: true,
    };
  }

  function _getMockBitacoras(clientId) {
    return APP_CONFIG.portal.mockBitacoras.map(b => ({
      _id:              b.id,
      fecha:            b.date,
      tecnico:          b.technician,
      estado:           b.status.toLowerCase(),
      lecturas:         {
        ph:               b.readings.ph,
        cloro_libre:      b.readings.cloro_libre,
        cloro_combinado:  b.readings.cloro_combinado,
        alcalinidad:      b.readings.alcalinidad,
        dureza_calcica:   b.readings.dureza_calcica,
        lsi:              b.readings.langelier,
        temperatura:      28,
        estabilizador:    40,
      },
      acciones:         b.actions,
      notas:            b.notes,
      fotos:            b.photos.map(p => p.url),
      pdf_url:          b.pdfUrl,
      litros_retrolav:  180,
      litros_evap:      210,
      quimicos_usados:  { acido_mur_lt: 0.5, cloro_kg: 0.3, bicarbonato_kg: 0 },
      _isDemo:          true,
    }));
  }

  function _isFirebaseReady() {
    return !!(window.FB && window.FS && window.FB.db);
  }

  return {
    getClientProfile,
    getBitacoras,
    getBitacoraById,
    subscribeToBitacoras,
    unsubscribeAll,
    saveBitacora,
  };

})();

window.FirestoreService = FirestoreService;
