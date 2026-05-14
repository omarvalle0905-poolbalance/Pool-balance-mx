# 🎙️ Carpeta de Audios — Pool Balance Carousel

## Cómo activar el audio en un slide

### Paso 1 — Graba y limpia tu audio
- Formato: **MP3** (recomendado) o M4A/WAV
- Duración ideal: **15–25 segundos** por slide
- Calidad: 128 kbps es suficiente para voz

### Paso 2 — Sube el archivo aquí
Ponle un nombre claro y sin espacios:

| Slide | Nombre sugerido |
|-------|----------------|
| Agua verde | `slide-verde.mp3` |
| LSI negativo | `slide-lsi.mp3` |
| Cloro excesivo | `slide-cloro.mp3` |
| Agua certificada | `slide-optimo.mp3` |

### Paso 3 — Actívalo en data/config.js

Busca el slide correspondiente y cambia la línea `audio`:

```javascript
// ANTES (desactivado):
// audio: "audios/slide-verde.mp3",
audio: null,

// DESPUÉS (activado):
audio: "audios/slide-verde.mp3",
```

¡Listo! El botón "🔊 Escuchar" aparece automáticamente en ese slide.
Si `audio` es `null`, el botón no aparece — no tienes que borrar nada.

---

## Comportamiento del reproductor

- ▶️ **Play**: el usuario pica el botón → se reproduce el audio
- ⏸️ **Pause**: pica de nuevo → se pausa
- ⏹️ **Stop automático**: al cambiar de slide el audio se detiene solo
- 🚫 **Sin autoplay**: nunca se reproduce solo — siempre requiere acción del usuario
- 📵 **Sin sonido si no hay archivo**: el botón simplemente no aparece

---

## Guion sugerido por slide (para que lo grabes)

**Slide 1 — Agua verde:**
> "El agua verde no es solo un problema estético. Algas, cobre y hierro en oxidación tiñen el agua y pueden irritar piel y ojos. En Pool Balance lo resolvemos en 72 horas, sin necesidad de drenar tu alberca."

**Slide 2 — LSI negativo:**
> "El agua puede verse perfectamente cristalina y estar atacando silenciosamente tu acabado y tus equipos. El Índice de Langelier negativo significa agua agresiva — nosotros lo calculamos en cada visita."

**Slide 3 — Cloro excesivo:**
> "Más cloro no es más seguro. Con niveles mayores a 5 partes por millón, el cloro irrita ojos, blanquea trajes de baño y genera cloraminas tóxicas. El equilibrio es la clave, no la cantidad."

**Slide 4 — Agua certificada:**
> "Cuando los seis parámetros están en rango al mismo tiempo — pH, cloro libre, cloro combinado, alcalinidad, dureza cálcica e índice de Langelier — eso es agua Pool Balance certificada. Segura de verdad."
