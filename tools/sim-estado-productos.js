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
const prods=vm.runInContext('_productosAplicados',sb);

console.log('[1] Estabilizador 61 ppm: texto vs color');
ok(P.estabilizador.explicacion(61).emoji==='🔶','texto de 61 ppm usa 🔶 (un poco alto)');
ok(estado('estabilizador',P.estabilizador,61,{})==='alerta','color de 61 ppm = ALERTA (ya NO crítico)');
ok(estado('estabilizador',P.estabilizador,95,{})==='critico','95 ppm sí es crítico (lock-out)');

console.log('[2] Consistencia texto↔color en varios casos');
ok(estado('ph',P.ph,7.4,{})==='optimo','pH 7.4 óptimo');
ok(estado('ph',P.ph,8.2,{})==='alerta','pH 8.2 alerta (no rojo)');
ok(estado('dureza_calcica',P.dureza_calcica,251,{})==='optimo','dureza 251 óptimo');
ok(estado('cloro_libre',P.cloro_libre,7.2,{rangos_dinamicos:{cloro_libre:{min:4.58,alto:18.3}}})==='optimo','cloro 7.2 con rango dinámico → óptimo');

console.log('[3] Productos: SIN hardcode; lee lo real');
ok(prods({}).length===0,'sin datos → 0 productos (ya no muestra demo)');
const pa=prods({productos:[{nombre:'Algen Blue Klaren',cantidad:1000,unidad:'mL'},'Cepillado manual']});
ok(pa.length===2 && pa[0].label.includes('Algen Blue Klaren · 1000 mL'),'lee array productos (objeto y string)');
ok(pa[0].emoji==='🦠','alguicida → emoji correcto');
const pq=prods({quimicos_usados:{acido_mur_lt:0.1,cloro_kg:0}});
ok(pq.length===1 && pq[0].label.includes('Ácido muriático · 0.1 L'),'compat quimicos_usados (omite los que valen 0)');

console.log(fail===0?'\n══ OK ══':`\n══ ${fail} FALLOS ══`);process.exit(fail?1:0);
