# Pool Balance — Esquema de Firebase / Firestore

> **Para quién es este documento:** el desarrollador (o sesión de IA) que está
> construyendo la **app de bitácora del técnico**, la que **escribe** los datos
> en Firebase. Esta guía describe exactamente **qué escribir y dónde** para que
> el **Portal del Cliente** (esta aplicación) lo lea y muestre de una, sin tocar
> nada más.
>
> El portal es **solo lectura**. La app del técnico es la que **crea/actualiza**
> los documentos.

---

## 1. Proyecto Firebase

Ambas apps usan el **mismo proyecto**:

| Dato | Valor |
|---|---|
| **projectId** | `pool-balance-mx` |
| **authDomain** | `pool-balance-mx.firebaseapp.com` |
| **storageBucket** | `pool-balance-mx.firebasestorage.app` |

Servicios usados: **Authentication** (Email/Password), **Cloud Firestore** y
**Storage** (para fotos). La config web del portal vive en
`js/firebase/firebase.js`.

---

## 2. Autenticación (cómo entra el cliente)

El cliente **no** usa un email real. Ingresa:

- **ID de Cliente** → ej. `PB-2025-001`
- **Código / PIN** de 6 dígitos → ej. `847291`

Internamente el portal convierte eso en un **email sintético** para Firebase Auth:

```
email    = "<id-del-cliente-en-minúsculas>@poolbalance.cliente"
password = "<PIN de 6 dígitos>"

Ejemplo:
  ID  PB-2025-001   →  email: pb-2025-001@poolbalance.cliente
  PIN 847291        →  password: 847291
```

> ⚠️ El sufijo del dominio es **`@poolbalance.cliente`** (no es un dominio real,
> es solo el formato interno). Debe coincidir **exactamente**.

### Cómo dar de alta a un cliente (una vez por cliente)
1. En **Authentication → Users → Add user**, crear el usuario con:
   - Email: `pb-2025-001@poolbalance.cliente` (el ID en **minúsculas**)
   - Password: el PIN de 6 dígitos
2. Crear su documento de perfil en Firestore (ver sección 4).

La app del técnico puede automatizar esto con el **Firebase Admin SDK**
(`auth().createUser({ email, password })`).

---

## 3. Estructura de Firestore (árbol)

```
clientes (colección)
└── {clienteId}                      ← doc, ej. "PB-2025-001"  (MAYÚSCULAS)
    │   nombre, plan, direccion, volumen_m3, proxima_visita, cliente_desde...
    │
    └── albercas (subcolección)
        └── {albercaId}              ← doc, normalmente "principal"
            │   volumen_m3, tipo_acabado... (opcional)
            │
            └── bitacoras (subcolección)
                └── {fecha}          ← doc, el ID ES la fecha "YYYY-MM-DD"
                        ph, cloro_libre, ... (ver sección 5)
```

**Reglas de oro:**
- El **ID del documento de cliente** se escribe en **MAYÚSCULAS** (`PB-2025-001`).
  (El login lo normaliza a mayúsculas; Firestore distingue mayúsculas/minúsculas.)
- El **ID del documento de bitácora** es la **fecha en formato `YYYY-MM-DD`**
  (ej. `2026-05-22`). Si hay varias visitas el mismo día, agrega sufijo:
  `2026-05-22_1316` (fecha_hora). El portal lo acepta igual.
- La alberca por defecto es **`principal`**. Si el cliente tiene varias, el
  perfil debe traer el campo `alberca_id` con la que se quiere mostrar.

---

## 4. Documento de **cliente**  → `clientes/{clienteId}`

Campos que el portal **lee y muestra** (todos en español):

| Campo | Tipo | Ejemplo | Se usa para |
|---|---|---|---|
| `nombre` | string | `"Familia Herrera-Montoya"` | Nombre en el dashboard |
| `plan` | string | `"Balance"` | Chip "Plan ..." |
| `direccion` | string | `"Fracc. Costa Verde, Boca del Río, Ver."` | Ubicación |
| `volumen_m3` | string/number | `"62 m³"` | Stat "Volumen" |
| `proxima_visita` | string `YYYY-MM-DD` | `"2026-07-15"` | Stat "Próx. visita" |
| `cliente_desde` | string | `"Enero 2024"` | Info rápida |
| `alberca_id` | string (opcional) | `"principal"` | Qué alberca leer |

### Ejemplo
```json
{
  "nombre": "Familia Herrera-Montoya",
  "plan": "Balance",
  "direccion": "Fracc. Costa Verde, Boca del Río, Ver.",
  "volumen_m3": "62 m³",
  "proxima_visita": "2026-07-15",
  "cliente_desde": "Enero 2024",
  "alberca_id": "principal"
}
```

---

## 5. Documento de **bitácora**  → `clientes/{id}/albercas/{albercaId}/bitacoras/{fecha}`

Este es el documento más importante: cada visita de servicio.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `fecha` | string `YYYY-MM-DD` | ✅ | Debe coincidir con el ID del doc |
| `fecha_timestamp` | Timestamp | recomendado | Para ordenar (el portal ordena por `fecha` desc) |
| `tecnico` | string | ✅ | Nombre del técnico |
| `estado` | string | ✅ | `"optimo"` \| `"corregido"` \| `"alerta"` |
| `lecturas` | mapa | ✅ | Ver tabla de parámetros abajo |
| `acciones` | array&lt;string&gt; | opcional | Lista de acciones realizadas |
| `notas` | string | opcional | Observación del técnico (sale como cita) |
| `fotos` | array | opcional | URLs de Storage (ver sección 6) |
| `quimicos_usados` | mapa | opcional | `{ acido_mur_lt, cloro_kg, bicarbonato_kg }` |
| `litros_retrolav` | number | opcional | Litros en retrolavado |
| `litros_evap` | number | opcional | Estimado de evaporación |
| `pdf_url` | string | opcional | No requerido (el portal genera el PDF solo) |
| `explicaciones` | mapa | opcional | **Textos personalizados** de cada tarjeta (sección 7) |

### 5.1 `lecturas` — parámetros del agua

Usa **exactamente estas llaves** (las demás se ignoran):

| Llave | Unidad | Rango óptimo | Obligatorio |
|---|---|---|---|
| `ph` | — | 7.2 – 7.6 | ✅ |
| `cloro_libre` | ppm | 1.0 – 3.0 | ✅ |
| `cloro_combinado` | ppm | 0 – 0.3 (menor = mejor) | ✅ |
| `alcalinidad` | ppm | 80 – 120 | ✅ |
| `dureza_calcica` | ppm | 200 – 400 | ✅ |
| `lsi` | — | −0.3 – 0.3 (Índice de Langelier) | ✅ |
| `temperatura` | °C | 24 – 32 | opcional |
| `estabilizador` | ppm | 30 – 50 (CYA) | opcional |

> Los valores son **números** (no strings). El portal calcula automáticamente
> el estado (óptimo/atención/crítico), el color y el **score de Salud del Agua
> (0–100)** a partir de estas lecturas. **No** necesitas mandar el score.

### 5.2 `quimicos_usados`
```json
{ "acido_mur_lt": 0.5, "cloro_kg": 0.3, "bicarbonato_kg": 0 }
```
Manda solo los que aplicaste; los que valgan 0 o falten no se muestran.

### 5.3 Ejemplo completo de bitácora
```json
{
  "fecha": "2026-05-22",
  "tecnico": "Ing. Rodrigo Castellanos",
  "estado": "corregido",
  "lecturas": {
    "ph": 7.4,
    "cloro_libre": 2.1,
    "cloro_combinado": 0.2,
    "alcalinidad": 105,
    "dureza_calcica": 280,
    "lsi": 0.1,
    "temperatura": 28,
    "estabilizador": 40
  },
  "acciones": [
    "Ajuste de pH con ácido muriático",
    "Retrolavado de filtro",
    "Limpieza de canastillas"
  ],
  "notas": "Alberca en excelentes condiciones. Parámetros dentro de rango ideal.",
  "quimicos_usados": { "acido_mur_lt": 0.5, "cloro_kg": 0.3, "bicarbonato_kg": 0 },
  "litros_retrolav": 180,
  "litros_evap": 210,
  "fotos": [
    "https://firebasestorage.googleapis.com/.../foto1.jpg",
    "https://firebasestorage.googleapis.com/.../foto2.jpg"
  ]
}
```

---

## 6. Fotos del servicio

El campo `fotos` es un **array**. El portal acepta dos formatos (puedes usar el
que te convenga):

**A) Lista simple de URLs (lo más fácil):**
```json
"fotos": [
  "https://firebasestorage.googleapis.com/.../antes.jpg",
  "https://firebasestorage.googleapis.com/.../despues.jpg"
]
```

**B) Lista de objetos (si quieres guardar metadata):**
```json
"fotos": [
  { "url": "https://.../antes.jpg",   "path": "clientes/PB-2025-001/2026-05-22/antes.jpg",   "momento": "antes",   "timestamp": 1716400000000 },
  { "url": "https://.../despues.jpg", "path": "clientes/PB-2025-001/2026-05-22/despues.jpg", "momento": "despues", "timestamp": 1716400600000 }
]
```
El portal usa el campo `url` de cada objeto. Las fotos se suben a **Firebase
Storage** y guardas aquí su **URL de descarga** (`getDownloadURL`).

---

## 7. (Opcional) Textos personalizados de las tarjetas → `explicaciones`

Por defecto, el portal genera el texto explicativo de cada parámetro según el
valor. Si quieres que **el técnico escriba su propio texto** por parámetro,
agrega el mapa `explicaciones` al documento de la bitácora:

```json
"explicaciones": {
  "ph":          { "emoji": "✅", "texto": "El pH está en el rango ideal; el cloro trabaja con máxima eficiencia." },
  "cloro_libre": { "emoji": "⚠️", "texto": "Cloro elevado hoy. Espera 2 horas antes de usar la alberca." }
}
```
- Las llaves son las mismas de `lecturas` (`ph`, `cloro_libre`, …).
- Si un parámetro **no** trae texto aquí, el portal usa su explicación
  automática (no se rompe nada).
- También se acepta el alias `textos` en lugar de `explicaciones`, o un string
  simple en vez de `{ emoji, texto }`.

> En el **PDF** descargable se usa el mismo texto (sin emoji).

---

## 8. Cómo escribe la app del técnico (Admin SDK)

Desde Node / Apps Script con **Firebase Admin SDK**, guardar es un `set` con
`merge: true` en la ruta de la bitácora:

```js
const db = admin.firestore();

await db
  .collection('clientes').doc('PB-2025-001')
  .collection('albercas').doc('principal')
  .collection('bitacoras').doc('2026-05-22')   // ID = fecha
  .set({
    fecha: '2026-05-22',
    fecha_timestamp: admin.firestore.FieldValue.serverTimestamp(),
    tecnico: 'Ing. Rodrigo Castellanos',
    estado: 'corregido',
    lecturas: { ph: 7.4, cloro_libre: 2.1, cloro_combinado: 0.2,
                alcalinidad: 105, dureza_calcica: 280, lsi: 0.1,
                temperatura: 28, estabilizador: 40 },
    acciones: ['Ajuste de pH con ácido muriático', 'Retrolavado de filtro'],
    notas: 'Alberca en excelentes condiciones.',
    quimicos_usados: { acido_mur_lt: 0.5, cloro_kg: 0.3, bicarbonato_kg: 0 },
    litros_retrolav: 180,
    litros_evap: 210,
    fotos: ['https://firebasestorage.googleapis.com/.../foto1.jpg']
  }, { merge: true });
```

El portal del cliente está **suscrito en tiempo real** (`onSnapshot`): en cuanto
guardes la bitácora, **aparece sola** en el dashboard del cliente sin recargar.

---

## 9. Reglas de seguridad sugeridas (Firestore)

El cliente solo debe leer **su propio** árbol. Como el email es
`<id>@poolbalance.cliente`, se puede derivar el ID desde el token:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // helper: ID de cliente a partir del email sintético del token
    function clienteIdDelToken() {
      return request.auth != null
        ? request.auth.token.email.split('@')[0].upper()
        : '';
    }

    match /clientes/{clienteId} {
      allow read: if request.auth != null && clienteIdDelToken() == clienteId;
      allow write: if false; // solo el Admin SDK (técnico) escribe

      match /albercas/{albercaId}/bitacoras/{bitacoraId} {
        allow read: if request.auth != null && clienteIdDelToken() == clienteId;
        allow write: if false;
      }
    }
  }
}
```
> Nota: el Admin SDK **ignora** estas reglas (escribe con privilegios), así que
> la app del técnico puede escribir sin problema; estas reglas solo limitan al
> cliente desde el portal.

---

## 10. Checklist para conectar "de una"

- [ ] Usar el proyecto `pool-balance-mx`.
- [ ] Crear el usuario en **Authentication** con email
      `<id-minúsculas>@poolbalance.cliente` y password = PIN.
- [ ] Crear el doc `clientes/{ID-MAYÚSCULAS}` con los campos de la sección 4.
- [ ] Asegurar la subcolección `albercas/principal` (puede ir vacía o con datos).
- [ ] Escribir bitácoras en `.../bitacoras/{YYYY-MM-DD}` con el esquema de la
      sección 5. Llaves de `lecturas` **idénticas**. Valores **numéricos**.
- [ ] Subir fotos a Storage y guardar sus **URLs de descarga** en `fotos`.
- [ ] (Opcional) Agregar `explicaciones` para textos personalizados.
- [ ] Publicar reglas de seguridad (sección 9).

Con eso, el portal del cliente muestra todo automáticamente: dashboard,
historial, reporte de servicio con score y el PDF descargable. ✅

---

## 11. Contexto de servicio (CYA-aware) — IMPLEMENTADO en el portal

El portal ya **lee y respeta** estos campos opcionales/aditivos de la bitácora
(para que el color y el score no contradigan el texto en tratamientos como
choque, sarro, metales, etc.). Si no vienen, todo funciona como siempre.

```jsonc
{
  "contexto_servicio": {
    "modo": "post_choque",
    "etiqueta": "Tratamiento de choque",   // chip en el reporte / PDF
    "es_tratamiento": true,                 // muestra el banner
    "banner": "Servicio de choque: el cloro está elevado a propósito y de forma temporal."
  },
  "rangos_dinamicos": {
    "cloro_libre": { "min": 3.75, "objetivo": 15, "alto": 25, "max_seguro": 10 }
  },
  "seguro_banarse": false,   // true | false | null
  "salud_tope": 70           // cap del score para este modo
}
```

Comportamiento en el portal y el PDF:

- **Color del cloro libre:** si viene `rangos_dinamicos.cloro_libre`, se colorea
  con esos rangos en vez del fijo 1.0–3.0:
  `min ≤ FC ≤ alto` → verde · `FC < min` → ámbar · `FC > alto` → ámbar si
  `seguro_banarse !== false`, rojo si `seguro_banarse === false`.
  En el PDF, además, la línea de rango cambia a "Rango para este servicio: min – alto".
- **Score:** se aplica `min(scoreCalculado, salud_tope)` en el aro del reporte,
  en el historial del dashboard y en el PDF.
- **Banner + chip:** si hay `contexto_servicio.banner` (o `seguro_banarse === false`)
  se muestra el aviso; si `etiqueta` existe se muestra como chip.
- **Indicador de nadar:** `seguro_banarse` → "Lista para nadar" (true) /
  "En tratamiento — espera a que te avisemos" (false) / nada (null).

> Estos campos son **solo de lectura** en el portal; los escribe la app del técnico.
