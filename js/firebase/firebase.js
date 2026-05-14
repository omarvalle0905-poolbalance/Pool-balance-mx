/**
 * ============================================================
 *  POOL BALANCE — FIREBASE INITIALIZATION
 *  Proyecto: pool-balance-mx
 *  Configurado: Mayo 2026
 * ============================================================
 */

// ── Configuración del proyecto Firebase ──
const firebaseConfig = {
  apiKey:            "AIzaSyBCqxnAiGFTv_Y3kpDVqWPQQgWZuSuoOJU",
  authDomain:        "pool-balance-mx.firebaseapp.com",
  projectId:         "pool-balance-mx",
  storageBucket:     "pool-balance-mx.firebasestorage.app",
  messagingSenderId: "845936824926",
  appId:             "1:845936824926:web:0c09c3b89fd361a5071acf",
  measurementId:     "G-TL48C3C8E5"   // Google Analytics (opcional)
};

// ── Importar módulos Firebase desde CDN (ES Modules) ──
// Se cargan en index.html como type="module"
// Aquí solo inicializamos la app si no está ya inicializada

let _app        = null;
let _auth       = null;
let _db         = null;
let _storage    = null;
let _initialized = false;

/**
 * Inicializa Firebase y expone los servicios globalmente.
 * Se llama una sola vez desde app.js al arrancar.
 */
async function initFirebase() {
  if (_initialized) return { app: _app, auth: _auth, db: _db, storage: _storage };

  try {
    // Importar dinámicamente los módulos Firebase
    const { initializeApp }         = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getAuth }               = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    const { getFirestore }          = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    const { getStorage }            = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js");

    _app     = initializeApp(firebaseConfig);
    _auth    = getAuth(_app);
    _db      = getFirestore(_app);
    _storage = getStorage(_app);

    _initialized = true;

    // Exponer globalmente para acceso desde todos los módulos
    window.FB = { app: _app, auth: _auth, db: _db, storage: _storage };

    // Exponer helpers de Firestore globalmente
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    window.FS = {
      collection:    firestoreModule.collection,
      doc:           firestoreModule.doc,
      getDoc:        firestoreModule.getDoc,
      getDocs:       firestoreModule.getDocs,
      setDoc:        firestoreModule.setDoc,
      addDoc:        firestoreModule.addDoc,
      updateDoc:     firestoreModule.updateDoc,
      deleteDoc:     firestoreModule.deleteDoc,
      onSnapshot:    firestoreModule.onSnapshot,
      query:         firestoreModule.query,
      where:         firestoreModule.where,
      orderBy:       firestoreModule.orderBy,
      limit:         firestoreModule.limit,
      serverTimestamp: firestoreModule.serverTimestamp,
      Timestamp:     firestoreModule.Timestamp,
    };

    console.log('%c🔥 Firebase inicializado correctamente', 'color: #FFCA28; font-weight: bold;');
    return window.FB;

  } catch (error) {
    console.error('[Firebase] Error de inicialización:', error);
    
    // Modo demo si Firebase falla (para desarrollo local sin config real)
    window.FB = null;
    window.FS = null;
    console.warn('[Firebase] Corriendo en MODO DEMO sin conexión a Firebase.');
    return null;
  }
}

window.initFirebase = initFirebase;
