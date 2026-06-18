/**
 * ============================================================
 *  POOL BALANCE — FIREBASE AUTH SERVICE
 *
 *  Estrategia de autenticación:
 *  El cliente ingresa su "ID de Cliente" (ej. PB-2025-001) y
 *  su "PIN de 6 dígitos". Internamente esto se convierte en
 *  un email sintético para Firebase Auth:
 *
 *  ID: PB-2025-001  +  PIN: 847291
 *  → email:    pb-2025-001@poolbalance.mx
 *  → password: 847291
 *
 *  Omar gestiona los usuarios desde Firebase Console o
 *  desde su Apps Script en Google Sheets.
 * ============================================================
 */

const AuthService = (() => {

  // ── Sufijo de dominio sintético para Firebase Auth ──
  const EMAIL_DOMAIN = '@poolbalance.cliente';

  // ── Estado reactivo de sesión ──
  let _currentUser   = null;
  let _clientProfile = null;
  let _authListeners = [];

  /**
   * Convierte ID de cliente → email sintético para Firebase Auth
   */
  function _toEmail(clientId) {
    return `${clientId.toLowerCase().trim()}${EMAIL_DOMAIN}`;
  }

  /**
   * Login con ID de Cliente + PIN
   * Retorna { success, error, user }
   */
  // Tiempo máximo de espera para todo el proceso de login (import de
  // Firebase Auth + signIn + lectura del perfil en Firestore). Si la red o
  // Firestore no responden, getDoc puede quedarse colgado para siempre; este
  // timeout garantiza que el login SIEMPRE resuelva y nunca deje la UI
  // atrapada en "Verificando…" o "Cargando tu portal…".
  const LOGIN_TIMEOUT_MS = 10000;

  async function login(clientId, pin) {
    if (!window.FB?.auth) {
      // ── MODO DEMO (sin Firebase real configurado) ──
      return _demoLogin(clientId, pin);
    }

    const work = (async () => {
      const { signInWithEmailAndPassword } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
      );

      const email      = _toEmail(clientId);
      const credential = await signInWithEmailAndPassword(window.FB.auth, email, pin);

      _currentUser = credential.user;

      // Cargar perfil del cliente desde Firestore
      _clientProfile = await FirestoreService.getClientProfile(clientId.toUpperCase().trim());

      _notifyListeners({ type: 'login', user: _currentUser, profile: _clientProfile });

      return { success: true, user: _currentUser, profile: _clientProfile };
    })();

    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve({ _timedOut: true }), LOGIN_TIMEOUT_MS));

    try {
      const result = await Promise.race([work, timeout]);
      if (result && result._timedOut) {
        console.warn('[Auth] Login timeout — la red/Firestore no respondió.');
        return { success: false, error: 'La conexión tardó demasiado. Revisa tu internet e inténtalo de nuevo.' };
      }
      return result;
    } catch (error) {
      console.error('[Auth] Error de login:', error.code || error.message);
      return { success: false, error: _parseAuthError(error.code) };
    }
  }

  /**
   * Cierra la sesión del cliente
   */
  async function logout() {
    if (window.FB?.auth) {
      const { signOut } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
      );
      await signOut(window.FB.auth);
    }

    _currentUser   = null;
    _clientProfile = null;
    _notifyListeners({ type: 'logout' });
  }

  /**
   * Observador del estado de autenticación.
   * Llama al callback cada vez que el estado cambia.
   * Retorna función para cancelar la suscripción.
   */
  async function onAuthStateChanged(callback) {
    _authListeners.push(callback);

    if (window.FB?.auth) {
      const { onAuthStateChanged: fbOnAuth } = await import(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
      );

      return fbOnAuth(window.FB.auth, async (user) => {
        _currentUser = user;
        if (user) {
          // Extraer clientId desde el email sintético
          const clientId = user.email.replace(EMAIL_DOMAIN, '').toUpperCase();
          _clientProfile = await FirestoreService.getClientProfile(clientId);
        } else {
          _clientProfile = null;
        }
        callback({ user: _currentUser, profile: _clientProfile });
      });
    } else {
      // Modo demo: notificar estado inicial
      callback({ user: _currentUser, profile: _clientProfile });
      return () => {};
    }
  }

  /**
   * Retorna el perfil del cliente actual
   */
  function getCurrentProfile() { return _clientProfile; }
  function getCurrentUser()    { return _currentUser; }
  function isAuthenticated()   { return !!_currentUser; }

  /**
   * MODO DEMO — Simula autenticación sin Firebase real
   * Útil durante desarrollo o cuando firebaseConfig no está configurado
   */
  async function _demoLogin(clientId, pin) {
    const DEMO_ID  = APP_CONFIG.portal.demoClientId;
    const DEMO_PIN = APP_CONFIG.portal.demoAccessCode;

    await _sleep(900); // Simular latencia de red

    if (clientId.toUpperCase().trim() === DEMO_ID && pin.trim() === DEMO_PIN) {
      _currentUser   = { uid: 'demo-user', email: _toEmail(DEMO_ID) };
      _clientProfile = APP_CONFIG.portal.mockClient;
      _clientProfile._id = DEMO_ID;
      _clientProfile._isDemo = true;

      _notifyListeners({ type: 'login', user: _currentUser, profile: _clientProfile });
      return { success: true, user: _currentUser, profile: _clientProfile };
    }

    return {
      success: false,
      error: 'ID de cliente o código de acceso incorrectos.'
    };
  }

  /**
   * Traduce códigos de error de Firebase a mensajes amigables
   */
  function _parseAuthError(code) {
    const errors = {
      'auth/user-not-found':    'No existe una cuenta con ese ID de cliente.',
      'auth/wrong-password':    'Código de acceso incorrecto.',
      'auth/invalid-credential':'ID de cliente o código incorrecto.',
      'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
      'auth/user-disabled':     'Esta cuenta ha sido desactivada. Contacta a Pool Balance.',
      'auth/network-request-failed': 'Sin conexión a internet. Verifica tu red.',
      'auth/invalid-email':     'Formato de ID de cliente inválido.',
    };
    return errors[code] || 'Error de acceso. Intenta de nuevo o contacta a Pool Balance.';
  }

  function _notifyListeners(event) {
    _authListeners.forEach(fn => fn(event));
  }

  function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return {
    login,
    logout,
    onAuthStateChanged,
    getCurrentProfile,
    getCurrentUser,
    isAuthenticated,
  };

})();

window.AuthService = AuthService;
