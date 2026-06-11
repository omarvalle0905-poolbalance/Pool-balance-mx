const fs=require('fs'),vm=require('vm'),path=require('path');
const REPO=path.join(__dirname,'..');
const sb={console,setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:f=>setTimeout(f,0),
  document:{getElementById:()=>null,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({style:{}}),body:{style:{}},documentElement:{clientWidth:412}},
  history:{state:null,pushState(){},back(){}},addEventListener(){},removeEventListener(){},
  APP_CONFIG:{company:{whatsapp:'x'},portal:{}},open(){}};
sb.window=sb;vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(REPO,'js/views/bitacora-detalle.js'),'utf8'),sb,{filename:'b'});
let fail=0;const ok=(c,m)=>{console.log((c?'  ✅ ':'  ❌ ')+m);if(!c)fail++;};
const items=vm.runInContext('_checklistItems',sb);
const render=vm.runInContext('renderBitacoraDetalle',sb);
const prods=vm.runInContext('_productosAplicados',sb);

console.log('[1] checklist_mecanico → tareas con palomita');
const ch=items({checklist_mecanico:{cepillado:true,aspirado:true,canastillas:true,red_hojas:false,filtro_presion:true,nivel_agua:true}});
ok(ch.length===5,'5 tareas true → 5 ítems (red_hojas false se omite)');
ok(ch.includes('Cepillado de paredes y piso'),'cepillado con etiqueta legible');
ok(ch.includes('Limpieza de canastillas (skimmer y bomba)'),'canastillas con etiqueta legible');
ok(items({}).length===0 && items({checklist_mecanico:null}).length===0,'sin checklist → vacío (compat)');
ok(items({checklist_mecanico:{tarea_nueva:true}})[0]==='Tarea nueva','llave desconocida → se humaniza');

console.log('[2] Render del reporte con el payload del addendum V1.1.5');
const bit={fecha:'2026-06-10',tecnico:'Omar',_id:'x',fotos:[],
  lecturas:{ph:7.6,cloro_libre:4.0,alcalinidad:100,dureza_calcica:300,lsi:0.1,cloro_combinado:0.1},
  lecturas_llegada:{ph:8.3,cloro_libre:0.5},
  productos:[{nombre:'pH Menos Klaren (Bisulfato de Sodio)',cantidad:1000,unidad:'g'},{nombre:'Cloro Líquido (NaClO 10%)',cantidad:1.5,unidad:'L'}],
  checklist_mecanico:{cepillado:true,aspirado:true,canastillas:true,red_hojas:false,filtro_presion:true,nivel_agua:true},
  acciones:['Mantenimiento rutinario']};
const html=render(bit,'C');
ok(html.includes('pH Menos Klaren (Bisulfato de Sodio) · 1000 g'),'producto real 1 en chips');
ok(html.includes('Cloro Líquido (NaClO 10%) · 1.5 L'),'producto real 2 en chips');
ok(!html.includes('Cianúrico · 200'),'CERO hardcodeo de cianúrico');
ok(html.includes('TRABAJO REALIZADO EN LA VISITA'),'sección de trabajo realizado');
ok(html.includes('Cepillado de paredes y piso')&&html.includes('Aspirado de fondo'),'checklist pintado');
ok(!html.includes('Retiro de hojas'),'red_hojas=false NO aparece');
ok(html.includes('Mantenimiento rutinario'),'acciones se conservan junto al checklist');
ok(html.includes('Al llegar: 8.3')&&html.includes('Al llegar: 0.5'),'antes→después visible (8.3→7.6, 0.5→4.0)');

console.log('[3] Emojis de productos reales');
const p=prods(bit);
ok(p[0].emoji==='⚗️','pH Menos (bisulfato) → ⚗️ (no clarificante por la marca Klaren)');
ok(p[1].emoji==='🧪','Cloro líquido NaClO → 🧪');
ok(prods({productos:[{nombre:'Algen Blue Klaren',cantidad:1,unidad:'L'}]})[0].emoji==='🦠','Algen Blue → 🦠 alguicida');

console.log(fail===0?'\n══ OK ══':`\n══ ${fail} FALLOS ══`);process.exit(fail?1:0);
