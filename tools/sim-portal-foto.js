/**
 * Simulación del flujo "ver foto en tamaño completo" del portal.
 * Carga el código REAL (bitacora-detalle.js + portal.js) en un sandbox
 * con DOM/historial falsos y reproduce el bug reportado:
 *   abrir bitácora → abrir foto → botón atrás del teléfono.
 * Verifica que nada quede congelado (scroll bloqueado) y que la
 * navegación sea correcta en todos los caminos de cierre.
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const REPO = require("path").join(__dirname, "..");

// ── Mini-DOM ──────────────────────────────────────────────
class FakeEl {
  constructor(id) {
    this.id = id; this.style = {}; this._cls = new Set();
    this.innerHTML = ''; this.src = ''; this.alt = ''; this.textContent = '';
    this.offsetHeight = 0;
  }
  get classList() {
    const s = this._cls;
    return {
      add: c => s.add(c), remove: c => s.delete(c), contains: c => s.has(c),
      toggle: (c, v) => { if (v === undefined) { s.has(c) ? s.delete(c) : s.add(c); } else { v ? s.add(c) : s.delete(c); } },
    };
  }
  scrollTo() {} addEventListener() {} removeEventListener() {}
  querySelector() { return null; } querySelectorAll() { return []; }
}

const els = {};
function mk(id, hidden = false) { const e = new FakeEl(id); if (hidden) e._cls.add('hidden'); els[id] = e; return e; }

mk('gallery-modal', true);
mk('gallery-modal-img');
mk('gallery-counter');
mk('view-bitacora-detalle');
mk('view-container');
mk('main-content');

// ── Historial falso (simula el botón atrás del teléfono) ──
const listeners = {};
const history = {
  _stack: [{ state: { view: 'portal' }, hash: '#portal' }],
  _i: 0,
  get state() { return this._stack[this._i].state; },
  get hash()  { return this._stack[this._i].hash; },
  pushState(state, _t, hash) {
    this._stack = this._stack.slice(0, this._i + 1);
    this._stack.push({ state, hash });
    this._i++;
  },
  back() { if (this._i > 0) { this._i--; firePop(); } },
};
function firePop() { (listeners.popstate || []).forEach(f => f({ state: history.state })); }

// ── Sandbox ───────────────────────────────────────────────
const sandbox = {
  console, setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: f => setTimeout(f, 0),
  history,
  addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
  removeEventListener: (t, f) => { if (listeners[t]) listeners[t] = listeners[t].filter(x => x !== f); },
  document: {
    getElementById: id => els[id] || null,
    addEventListener: () => {}, removeEventListener: () => {},
    querySelectorAll: () => [], createElement: () => new FakeEl('tmp'),
    body: new FakeEl('body'),
    documentElement: { clientWidth: 412 },
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  Nav: { setActive() {} },
  Toast: { show() {} },
  Router: { navigate() {} },
  PostRender: {},
  APP_CONFIG: { company: { whatsapp: 'x' }, portal: { demoClientId: 'PB', demoAccessCode: '1', loginCta: 'Entrar' } },
  open: () => {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);

function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(REPO, rel), 'utf8'), sandbox, { filename: rel });
}
load('js/views/bitacora-detalle.js');
load('js/views/portal.js');

// Estado autenticado (como con el usuario real de la app del técnico)
vm.runInContext(`
  PortalState.isAuthenticated = true;
  PortalState.clientProfile = { nombre:'Omar', plan:'Mantenimiento', direccion:'Veracruz', volumen_m3:'40.8', proxima_visita:'2026-07-15', cliente_desde:'2026-05-21' };
  PortalState.bitacoras = [];
  PostRender.portal();    // engancha el popstate del portal
  PostRender.bitacora();  // expone BitacoraUI
  window._currentBitacora = { fotos: [
    { url: 'https://storage.test/foto1.jpg', path: 'a', momento: 'antes' },
    'https://storage.test/foto2.jpg'
  ]};
`, sandbox);

// ── Asserts ───────────────────────────────────────────────
let failed = 0;
function ok(cond, msg) {
  if (cond) console.log('  ✅ ' + msg);
  else { failed++; console.log('  ❌ ' + msg); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const body = sandbox.document.body;
const modal = els['gallery-modal'];
const img = els['gallery-modal-img'];
const counter = els['gallery-counter'];

(async () => {
  const B = vm.runInContext('BitacoraUI', sandbox);

  // El cliente abrió la bitácora (openBitacora empuja #servicio)
  history.pushState({ pbView: 'servicio' }, '', '#servicio');

  console.log('\n[1] Abrir foto en tamaño completo (formato objeto {url})');
  B.openGallery(0);
  ok(!modal._cls.has('hidden'), 'el visor se abre');
  ok(body.style.overflow === 'hidden', 'scroll bloqueado mientras el visor está abierto');
  ok(history.state && history.state.pbView === 'foto', 'se empujó la entrada #foto al historial');
  ok(String(counter.textContent).startsWith('Cargando'), 'muestra "Cargando foto…" mientras descarga');
  ok(img.src === 'https://storage.test/foto1.jpg', 'normaliza la foto objeto→url correctamente');
  img.onload();
  ok(counter.textContent === '1 / 2', 'al cargar muestra el contador 1 / 2');

  console.log('\n[2] BOTÓN ATRÁS del teléfono con la foto abierta (el caso del congelamiento)');
  history.back();
  ok(modal._cls.has('hidden'), 'el visor se cierra (no navega)');
  ok(body.style.overflow === '', '🔓 scroll LIBERADO — ya no se congela');
  ok(history.state && history.state.pbView === 'servicio', 'sigue en el reporte (#servicio)');
  ok(els['view-container'].innerHTML === '', 'NO se renderizó el dashboard por error');

  console.log('\n[3] Segundo BOTÓN ATRÁS (ya sin foto) → regresa al dashboard');
  history.back();
  await sleep(300);
  ok(els['view-container'].innerHTML.includes('view-dashboard'), 'se renderiza el dashboard');
  ok(body.style.overflow === '', 'scroll sigue libre en el dashboard');

  console.log('\n[4] Cerrar foto con la X (y con el fondo): no debe navegar');
  els['view-container'].innerHTML = '';
  history.pushState({ pbView: 'servicio' }, '', '#servicio');
  B.openGallery(1);
  ok(!modal._cls.has('hidden'), 'visor abierto de nuevo (foto 2, formato string)');
  ok(img.src === 'https://storage.test/foto2.jpg', 'carga la foto correcta');
  B.closeGallery(); // X / fondo / Escape
  await sleep(50);
  ok(modal._cls.has('hidden'), 'el visor se cierra con la X');
  ok(body.style.overflow === '', 'scroll liberado tras cerrar con la X');
  ok(history.state && history.state.pbView === 'servicio', 'el historial regresó a #servicio (entrada #foto consumida)');
  ok(els['view-container'].innerHTML === '', 'NO navegó al dashboard al cerrar con la X');

  console.log('\n[5] Navegación con foto: siguiente/anterior y foto que falla');
  B.openGallery(0);
  B.galleryNext();
  ok(img.src === 'https://storage.test/foto2.jpg', 'galleryNext avanza a la foto 2');
  img.onerror();
  ok(String(counter.textContent).startsWith('No se pudo cargar'), 'foto rota muestra aviso (no pantalla negra)');
  ok(history._stack.filter(e => e.hash === '#foto').length <= 2 && history.state.pbView === 'foto',
     'no se apilan entradas #foto duplicadas al reabrir');
  B.closeGallery(true); // como lo haría el popstate
  ok(body.style.overflow === '', 'scroll liberado al cierre vía popstate');

  console.log('\n[6] Fotos vacías / bitácora sin fotos: no truena');
  vm.runInContext('window._currentBitacora = { fotos: [] }', sandbox);
  B.openGallery(0);
  ok(modal._cls.has('hidden'), 'con 0 fotos el visor no se abre y no rompe nada');

  console.log(failed === 0 ? '\n══ TODAS LAS PRUEBAS PASARON ══' : `\n══ ${failed} PRUEBAS FALLARON ══`);
  process.exit(failed === 0 ? 0 : 1);
})().catch(e => { console.error('ERROR EN SIMULACIÓN:', e); process.exit(1); });
