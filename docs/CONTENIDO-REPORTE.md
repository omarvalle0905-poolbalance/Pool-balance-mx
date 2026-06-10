# Pool Balance — Propuesta de contenido del Reporte (textos + datos del servicio)

> **Para:** la sala que desarrolla la **app del técnico** (`pool-balance-t-cnico-`).
> **De:** el Portal del Cliente (`Pool-balance-mx`).
> **Qué es:** mi propuesta de **cómo debería leerse** cada explicación y **qué
> campos** convendría escribir para que el reporte se sienta claro, cálido y
> honesto. Todo es compatible: el portal ya tiene fallbacks; esto eleva el contenido.

---

## A. Tono de las explicaciones (criterios)

1. **En segundo persona, cálido y humano** ("Tu pH está en su punto…"), no técnico-frío.
2. **Explica el "y eso qué"** para el cliente (comodidad, seguridad, cuidado del equipo),
   no solo el dato.
3. **Sin alarmismo**: es una app del agua. Reservar el rojo (🚨) para lo realmente
   serio; lo "un poco fuera" es ámbar (🔶), no rojo.
4. **El color SIGUE al emoji** del texto (el portal ya lo hace): por eso el emoji
   debe reflejar la gravedad real → **texto y color nunca se contradicen**.
   - `✅` = óptimo (verde) · `🔶`/`⚠️` = atención (ámbar) · `🚨` = crítico (rojo).
5. Frases cortas (1–2 oraciones). Termina en tranquilidad cuando ya quedó resuelto.

### Cómo se escriben en Firestore (ya soportado)
```jsonc
"explicaciones": {
  "ph":          { "emoji": "✅", "texto": "Tu pH está justo en su punto…" },
  "estabilizador": { "emoji": "🔶", "texto": "El estabilizador está un poco alto…" }
}
```
Si no las mandas, el portal usa los textos por defecto de abajo (ya cargados).

---

## B. Textos propuestos por parámetro (los que ya quedaron por defecto)

> Estos son **exactamente** los que el portal renderiza ahora si Firestore no manda
> `explicaciones`. Puedes adoptarlos como base y personalizarlos por bitácora.

### pH (óptimo 7.2–7.6)
| Rango | Emoji | Texto |
|---|---|---|
| < 7.0 | 🚨 | Tu pH está bajo y el agua se vuelve ácida: puede irritar ojos y piel y desgastar superficies y equipos. Ya lo corregimos para devolverlo a su punto. |
| 7.0–7.2 | 🔶 | Tu pH va un poco por debajo del ideal. Lo dejamos ajustado para que el agua quede suave y el cloro rinda mejor. |
| 7.2–7.6 | ✅ | Tu pH está justo en su punto. El agua queda suave para la piel y los ojos, y el cloro trabaja con toda su eficiencia. |
| 7.6–7.8 | 🔶 | Tu pH va ligeramente alto. Lo ajustamos para que el cloro no pierda fuerza y el agua se mantenga cristalina. |
| > 7.8 | ⚠️ | Tu pH está alto. A este nivel el cloro rinde poco y puede aparecer turbidez o sarro. Ya aplicamos la corrección. |

### Cloro Libre (óptimo 1.0–3.0 ppm; **si hay `rangos_dinamicos`, el color manda por CYA**)
| Rango | Emoji | Texto |
|---|---|---|
| < 0.5 | 🚨 | El desinfectante está muy bajo y el agua queda desprotegida frente a bacterias y algas. Reforzamos el cloro para dejarla segura. |
| 0.5–1.0 | 🔶 | El cloro va un poco bajo. Lo reforzamos para mantener el agua protegida hasta la próxima visita. |
| 1.0–3.0 | ✅ | Tienes el nivel de desinfectante ideal: el agua está protegida y es completamente segura para nadar. |
| 3.0–5.0 | 🔶 | El cloro está en la parte alta. Es seguro; con el sol y el uso normal bajará solo a su rango habitual. |
| > 5.0 | 🔶 | El cloro está elevado. Si fue parte de un tratamiento, es temporal y a propósito; en cuanto baje, el agua queda lista. |

> En modos de tratamiento (choque, etc.) **manda** `rangos_dinamicos.cloro_libre`
> + `seguro_banarse`: el portal pinta el cloro contra ese rango, no contra 1–3.

### Cloro Combinado / cloraminas (óptimo 0–0.3 ppm, menor = mejor)
| Rango | Emoji | Texto |
|---|---|---|
| ≤ 0.2 | ✅ | El cloro "ya gastado" (el que huele fuerte e irrita los ojos) está en su mínimo. Por eso el agua se siente fresca y sin olor. |
| 0.2–0.5 | 🔶 | Aparecieron algunas cloraminas, que son el origen del olor a cloro. Aplicamos un tratamiento para eliminarlas. |
| > 0.5 | ⚠️ | Hay cloraminas elevadas: son las que provocan el olor fuerte y la irritación en los ojos. Realizamos un superchoque para limpiarlas. |

### Alcalinidad Total (óptimo 80–120 ppm)
| Rango | Emoji | Texto |
|---|---|---|
| < 60 | ⚠️ | La alcalinidad está baja, así el pH se vuelve inestable y brinca con facilidad. La subimos para estabilizar el agua. |
| 60–80 | 🔶 | La alcalinidad va un poco baja. La reforzamos para que el pH se mantenga firme entre una visita y otra. |
| 80–120 | ✅ | La alcalinidad está en rango. Funciona como un amortiguador que mantiene firme el pH y conserva el agua equilibrada entre visitas. |
| 120–180 | 🔶 | La alcalinidad va algo alta y el pH tiende a subir. La ajustamos para mantener el equilibrio. |
| > 180 | ⚠️ | La alcalinidad está alta: empuja el pH hacia arriba y le resta fuerza al cloro. Ya iniciamos su corrección. |

### Dureza Cálcica (óptimo 200–400 ppm)
| Rango | Emoji | Texto |
|---|---|---|
| < 150 | ⚠️ | El calcio está bajo y el agua "busca" minerales: puede desgastar acabados y equipos. Lo corregimos para protegerlos. |
| 150–200 | 🔶 | El calcio va un poco bajo. Lo ajustamos de forma preventiva para cuidar las superficies de tu alberca. |
| 200–400 | ✅ | El calcio está en su punto: ni tan bajo que desgaste los acabados, ni tan alto que forme sarro. El equilibrio que cuida tu alberca a largo plazo. |
| 400–550 | 🔶 | El calcio va algo alto y puede aparecer sarro en la línea de flotación. Lo vigilamos de cerca. |
| > 550 | ⚠️ | El calcio está alto y favorece el sarro en superficies y equipos. Evaluamos un recambio parcial de agua para regularlo. |

### Índice de Langelier / LSI (óptimo −0.3 a 0.3)
| Rango | Emoji | Texto |
|---|---|---|
| < −0.5 | 🚨 | El agua tiende a ser agresiva y "roba" minerales de las superficies. Ajustamos los parámetros para llevarla a su punto neutro. |
| −0.5 a −0.3 | 🔶 | El agua va ligeramente agresiva. Corregimos varios parámetros para devolverla al equilibrio. |
| −0.3 a 0.3 | ✅ | ¡Equilibrio perfecto! Este índice integra pH, temperatura, alcalinidad y dureza. En este punto el agua ni ataca ni deposita: cuida tu alberca y sus equipos. |
| 0.3 a 0.5 | 🔶 | El agua tiende a depositar (formar sarro). Ajustamos los parámetros para regresarla al equilibrio. |
| > 0.5 | 🚨 | El agua está incrustante y puede formar sarro en equipos y tuberías. Aplicamos tratamiento para corregirlo. |

### Temperatura (confort 24–32 °C)
| Rango | Emoji | Texto |
|---|---|---|
| < 20 | 🥶 | El agua está fresca. A esta temperatura el cloro rinde un poco menos, aunque el riesgo de algas también baja. Ideal para nado de resistencia. |
| 20–32 | ✅ | El agua está a una temperatura muy agradable para nadar y el cloro trabaja correctamente. |
| > 32 | 🔥 | El agua está cálida. El calor acelera el consumo de cloro y favorece las algas, por eso la monitoreamos más seguido. |

### Estabilizador / CYA (óptimo 30–50 ppm)
| Rango | Emoji | Texto |
|---|---|---|
| < 20 | 🔶 | El estabilizador está bajo y el sol de Veracruz consume el cloro rápido. Lo reforzamos para proteger el desinfectante. |
| 20–50 | ✅ | El estabilizador está en su nivel correcto: protege al cloro del sol sin restarle fuerza. |
| 50–80 | 🔶 | El estabilizador está un poco alto. Le resta algo de fuerza al cloro; lo regulamos poco a poco con los recambios de agua. |
| > 80 | 🚨 | El estabilizador está muy alto y "bloquea" al cloro (efecto lock-out). La solución es diluir parte del agua; ya lo tenemos contemplado. |

> **Nota importante (corrige el bug que viste):** 61 ppm de CYA ahora se lee como
> 🔶 **ATENCIÓN** (texto y color coinciden), ya **no** como CRÍTICO. El crítico
> queda para > 80 ppm (lock-out real).

---

## C. Productos aplicados — `productos` (NUEVO, recomendado)

El portal **dejó de mostrar valores demo**. Ahora muestra **solo lo que la
bitácora trae**, y si no hay nada, **oculta** la sección. Para que aparezca lo
realmente dosificado, escribe un array `productos`:

```jsonc
"productos": [
  { "nombre": "Algen Blue Klaren", "cantidad": 1000, "unidad": "mL" },
  { "nombre": "Ácido muriático",   "cantidad": 100,  "unidad": "mL" },
  { "nombre": "Hipoclorito",        "cantidad": 0.3,  "unidad": "kg" }
]
```
- `nombre` (obligatorio). `cantidad` + `unidad` (opcionales).
- Puedes mandar también un string simple: `"productos": ["Cepillado con clarificante"]`.
- El portal asigna un emoji automático por tipo (alguicida 🦠, clarificante ✨,
  ácido ⚗️, cloro 🧪, bicarbonato 🧂, cianúrico ☀️, calcio 💎…); puedes forzarlo
  con `"emoji": "🦠"`.
- **Compatibilidad:** si no mandas `productos`, el portal sigue leyendo el viejo
  `quimicos_usados { acido_mur_lt, cloro_kg, bicarbonato_kg }`.

> Recomendación: que la app del técnico escriba **`productos`** con lo que de
> verdad se dosificó por servicio. Así "Productos aplicados" deja de estar
> hardcodeado y refleja la realidad (alguicida, clarificante, lo que sea).

---

## D. Acciones / checklist — `acciones` (y opcional `checklist`)

Hoy el portal muestra el array `acciones` tal cual. Para que diga lo que de verdad
se hizo (cepillado, canastillas de bombas/skimmers, aspirado, retrolavado…),
basta con que la app escriba esos ítems del checklist mecánico en `acciones`:

```jsonc
"acciones": [
  "Cepillado manual de paredes y piso",
  "Limpieza de canastillas de skimmer y bomba",
  "Aspirado de fondo",
  "Retrolavado de filtro",
  "Dosificación de alguicida"
]
```

### (Opcional, a futuro) checklist estructurado
Si más adelante quieren agruparlo, el portal puede leer un `checklist` así
(cuando lo implementen lo renderizamos como lista con palomita):

```jsonc
"checklist": {
  "limpieza_mecanica": ["Cepillado manual", "Canastillas de bomba", "Aspirado de fondo"],
  "filtro": ["Retrolavado", "Enjuague"],
  "valvulas": { "cabezal": "Filtrar", "retorno": "Abierta", "cascada": "Cerrada", "hidrojet": "Cerrada" }
}
```
> Las **posiciones de válvulas** (cabezal, retorno, cascada, hidrojet) hoy **no**
> las captura la app del técnico; cuando se capturen, este es el formato sugerido
> y el portal las puede mostrar como "Cómo dejamos las válvulas".

---

## E. Resumen de lo que el portal YA hace con todo esto

- Color de cada parámetro = severidad del **emoji** de su explicación → **texto y
  color siempre coinciden** (adiós al "61 ppm dice leve pero marca crítico").
- Cloro libre CYA-aware con `rangos_dinamicos` + `seguro_banarse`.
- Score con tope `salud_tope`.
- Banner + chip de `contexto_servicio`; indicador "Lista para nadar".
- "Al llegar → resultado" con `lecturas_llegada`.
- Reporte mensual de agua sumando `litros_retrolav` y `litros_evap`.
- **Productos** desde `productos` (o `quimicos_usados`), sin demo.
- Explicaciones desde `explicaciones` (o los textos por defecto de arriba).
