// Verificación punto por punto del ADDENDUM v2 con su payload de ejemplo
const fs=require('fs'),vm=require('vm');
const sb={console,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:f=>setTimeout(f,0),
  document:{getElementById:()=>null,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({style:{}}),body:{style:{}},documentElement:{clientWidth:412}},
  history:{state:null,pushState(){},back(){}},addEventListener(){},removeEventListener(){},
  APP_CONFIG:{company:{whatsapp:'x'},portal:{}},open(){}};
sb.window=sb;vm.createContext(sb);
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..','js/views/bitacora-detalle.js'),'utf8'),sb,{filename:'b'});
let fail=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)fail++;};

const P=vm.runInContext('PARAMETROS',sb);
const estado=vm.runInContext('_estadoParamCtx',sb);
const scoreM=vm.runInContext('_scoreMostrado',sb);
const render=vm.runInContext('renderBitacoraDetalle',sb);

// ── Payload EXACTO del ejemplo del addendum (post_choque) ──
const bit = {
  fecha:'2026-06-10', tecnico:'Omar Valle', _id:'2026-06-10',
  lecturas:{ ph:7.4, cloro_libre:15, cloro_combinado:0.1, alcalinidad:100, dureza_calcica:300, lsi:0.1 },
  lecturas_llegada:{ ph:7.0, cloro_libre:0.5, cloro_combinado:null },
  contexto_servicio:{ modo:'post_choque', etiqueta:'Tratamiento de choque', es_tratamiento:true,
    banner:'Servicio de choque: el cloro está elevado a propósito y de forma temporal para sanear el agua.' },
  rangos_dinamicos:{ cloro_libre:{ min:3.75, objetivo:15, alto:25, max_seguro:10 } },
  seguro_banarse:false, salud_tope:70, fotos:[]
};

console.log('[2.1] Color del cloro CYA-aware (regla del addendum)');
ok(estado('cloro_libre',P.cloro_libre,15,bit)==='optimo','FC 15 con rango 3.75–25 → VERDE (antes era rojo)');
ok(estado('cloro_libre',P.cloro_libre,2,bit)==='alerta','FC 2 < min 3.75 → ámbar (bajo para este CYA)');
ok(estado('cloro_libre',P.cloro_libre,30,bit)==='critico','FC 30 > alto + seguro_banarse=false → ROJO');
const bitSeguro={...bit,seguro_banarse:true};
ok(estado('cloro_libre',P.cloro_libre,30,bitSeguro)==='alerta','FC 30 > alto + seguro_banarse=true → ámbar ("bajará solo")');
ok(estado('cloro_libre',P.cloro_libre,5,{})!=='critico','sin rangos dinámicos cae al criterio clásico (compat)');

console.log('[2.2] Score con tope salud_tope');
const base=vm.runInContext('_calcScore',sb)(bit.lecturas);
ok(base>70,'el score calculado sin tope sería '+base+' (>70)');
ok(scoreM(bit)===70,'score mostrado = min('+base+', 70) = 70 ✓ cap aplicado');
ok(scoreM({lecturas:bit.lecturas})===base,'sin salud_tope no se capa (compat)');

console.log('[2.3] Banner y chip en el reporte renderizado');
const html=render(bit,'Cliente');
ok(html.includes('Tratamiento de choque'),'chip con la etiqueta del modo');
ok(html.includes('el cloro está elevado a propósito'),'banner del técnico en la cabecera');

console.log('[2.4] Indicador de nadar');
ok(html.includes('En tratamiento — espera a que te avisemos'),'seguro_banarse=false → "En tratamiento…"');
const htmlOk=render({...bit,seguro_banarse:true,contexto_servicio:{}},'C');
ok(htmlOk.includes('Lista para nadar'),'seguro_banarse=true → "Lista para nadar"');
const htmlNull=render({...bit,seguro_banarse:null,contexto_servicio:{}},'C');
ok(!htmlNull.includes('Lista para nadar')&&!htmlNull.includes('En tratamiento — espera'),'null → sin indicador');

console.log('[1] lecturas_llegada (llegada → resultado)');
ok(html.includes('Al llegar: 7.0')||html.includes('Al llegar: 7'),'pH muestra "Al llegar: 7.0 → 7.4"');
ok(html.includes('Al llegar: 0.5'),'cloro muestra llegada 0.5 → 15');
ok((html.match(/Al llegar/g)||[]).length===2,'cloro_combinado llegó null → NO muestra (2 de 3)');

console.log(fail===0?'\n══ ADDENDUM v2: TODO IMPLEMENTADO Y VERIFICADO ══':`\n══ ${fail} FALLOS ══`);
process.exit(fail?1:0);
