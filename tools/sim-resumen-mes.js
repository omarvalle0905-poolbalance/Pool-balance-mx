const fs = require('fs'), vm = require('vm'), path = require('path');
const REPO = require("path").join(__dirname, "..");
const sb = { console, setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: f=>setTimeout(f,0),
  document:{ getElementById:()=>null, addEventListener(){}, querySelectorAll:()=>[], createElement:()=>({style:{}}), body:{style:{}}, documentElement:{clientWidth:412} },
  history:{ state:null, pushState(){}, back(){} }, addEventListener(){}, removeEventListener(){},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  Nav:{setActive(){}}, Toast:{show(){}}, Router:{navigate(){}}, PostRender:{},
  APP_CONFIG:{ company:{whatsapp:'x'}, portal:{} }, PARAMETROS:{ ph:{label:'pH',unidad:'',min:0,max:14,optMin:7.2,optMax:7.6,decimales:1,icon:'',color:'#000',explicacion:()=>({emoji:'',texto:'x'})} }, open(){} };
sb.window = sb; vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(REPO,'js/views/bitacora-detalle.js'),'utf8'), sb, {filename:'b'});
vm.runInContext(fs.readFileSync(path.join(REPO,'js/views/portal.js'),'utf8'), sb, {filename:'p'});

let fail=0; const ok=(c,m)=>{ console.log((c?'  ✅ ':'  ❌ ')+m); if(!c)fail++; };

// ── Resumen mensual ──
const now = new Date();
const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
const otro = (now.getMonth()===0?`${now.getFullYear()-1}-12`:`${now.getFullYear()}-${String(now.getMonth()).padStart(2,'0')}`);
const bits = [
  { fecha:`${ym}-05`, litros_retrolav:1200, litros_evap:896 },
  { fecha:`${ym}-12_1316`, litros_retrolav:800, litros_evap:null },   // evap null
  { fecha:`${otro}-20`, litros_retrolav:9999, litros_evap:9999 },     // otro mes: NO suma
];
const html = vm.runInContext('_resumenMes', sb)(bits);
console.log('[1] Reporte mensual');
ok(html.includes('2,000 L'), 'suma retrolavado del mes (1200+800=2000), excluye otros meses');
ok(html.includes('≈ 896 L'), 'suma evaporación tratando null como 0 (896)');
ok(html.includes('2,896 L'), 'total del mes correcto');
ok(html.includes('2 servicios este mes'), 'cuenta servicios del mes');
ok(vm.runInContext('_resumenMes',sb)([]).includes('Aún sin servicios este mes'), 'mes vacío muestra mensaje amable');

// ── Antes→después en la tarjeta ──
console.log('[2] Llegada → resultado en la tarjeta');
const cfg = sb.PARAMETROS.ph;
const card = vm.runInContext('_renderParametroCard',sb)('ph', cfg, 7.4, { lecturas_llegada:{ ph:6.9 } });
ok(card.includes('Al llegar: 6.9'), 'muestra el valor de llegada');
ok(card.includes('→'), 'muestra la flecha antes→después');
const cardSin = vm.runInContext('_renderParametroCard',sb)('ph', cfg, 7.4, {});
ok(!cardSin.includes('Al llegar'), 'sin lecturas_llegada NO muestra nada extra');
const cardIgual = vm.runInContext('_renderParametroCard',sb)('ph', cfg, 7.4, { lecturas_llegada:{ ph:7.4 } });
ok(!cardIgual.includes('Al llegar'), 'si llegada == resultado, no muestra (sin ruido)');
const cardNull = vm.runInContext('_renderParametroCard',sb)('ph', cfg, 7.4, { lecturas_llegada:{ ph:null } });
ok(!cardNull.includes('Al llegar'), 'llegada null (no medido) no muestra');

console.log(fail===0?'\n══ OK ══':`\n══ ${fail} FALLOS ══`);
process.exit(fail?1:0);
