const fs=require('fs'),vm=require('vm');
const sb={console,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:f=>setTimeout(f,0),
  document:{getElementById:()=>null,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({style:{}}),body:{style:{}},documentElement:{clientWidth:412}},
  history:{state:null,pushState(){},back(){}},addEventListener(){},removeEventListener(){},
  APP_CONFIG:{company:{whatsapp:'x'},portal:{}},open(){}};
sb.window=sb;vm.createContext(sb);
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..','js/views/bitacora-detalle.js'),'utf8'),sb,{filename:'b'});
let fail=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)fail++;};
const scoreM=vm.runInContext('_scoreMostrado',sb);
const oldScore=vm.runInContext('_calcScore',sb);

// Bitácora _1955 de la captura: TODO óptimo, cloro 9.05 con CYA alto
const rd={cloro_libre:{min:3.75,objetivo:15,alto:25}};
const b1955={lecturas:{ph:7.6,cloro_libre:9.05,cloro_combinado:0.1,alcalinidad:96,dureza_calcica:253,lsi:0.12},rangos_dinamicos:rd};
console.log('[_1955] todos los parámetros perfectos (cloro 9.05 ok para su CYA)');
ok(oldScore(b1955.lecturas)===68,'el score VIEJO daba 68 (penalizaba el cloro 9.05 → 0)');
ok(scoreM(b1955)>=92,'score nuevo (CYA-aware) = '+scoreM(b1955)+' ✓ refleja "agua perfecta"');

// Bitácora _1950: pH 8 (alerta), LSI 0.57 (rojo), resto ok
const b1950={lecturas:{ph:8,cloro_libre:9.05,cloro_combinado:0.1,alcalinidad:107,dureza_calcica:253,lsi:0.57},rangos_dinamicos:rd};
console.log('[_1950] pH alto + LSI incrustante, cloro ok por CYA');
ok(oldScore(b1950.lecturas)===44,'el score VIEJO daba 44');
const s1950=scoreM(b1950);
ok(s1950>70 && s1950<95,'score nuevo = '+s1950+' (sube, pero no 100: refleja pH y LSI fuera)');

console.log('[tope] modo tratamiento con salud_tope');
ok(scoreM({...b1955,salud_tope:70})===70,'salud_tope=70 capa el 100 a 70 (sigue respetándose)');

console.log('[consistencia] todos óptimos sin CYA → 100');
ok(scoreM({lecturas:{ph:7.4,cloro_libre:2.0,cloro_combinado:0.0,alcalinidad:100,dureza_calcica:300,lsi:0.0}})===100,'rutina perfecta = 100');

console.log(fail===0?'\n══ OK ══':`\n══ ${fail} FALLOS ══`);process.exit(fail?1:0);
