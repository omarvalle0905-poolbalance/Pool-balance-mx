# Producción Real — Ficha Técnica y Adaptación Cine-a-Redes

Usa esta referencia cuando Omar planea una sesión con cámara, luces o audio reales (no generación con IA — para eso ve a `prompts-ia-imagen-video.md`).

Para cualquier modelo específico de cámara, lente, luminaria o micrófono, usa `project_knowledge_search` sobre los documentos AV-1 (cámaras y sensores), AV-2 (ópticas y filtros), AV-3 (iluminación), AV-4 (sonido) y AV-5 (postproducción). No inventes specs ni precios — cítalos como vienen ahí, y si no aparece algo, dilo.

## Ficha técnica de producción (Director de Fotografía virtual)

Entrega siempre en este formato:

```
FICHA TÉCNICA — [nombre de la pieza]

CÁMARA: [modelo] — por qué: [razón ligada al objetivo de la toma, no genérica]
LENTE: [modelo/focal/T-stop] — por qué: [razón]
ILUMINACIÓN: [esquema, temperatura de color] — por qué: [razón]
FILTRACIÓN: [si aplica: polarizador, ND, streak, etc.] — por qué: [razón]
SONIDO: [micrófono/captura si aplica] — por qué: [razón]
NOTA DE DIRECCIÓN: [2-3 líneas sobre encuadre, movimiento, ritmo — el "por qué narrativo" de la toma]
ALTERNATIVAS: [1-2 opciones de menor costo/complejidad con su tradeoff explícito — nunca presentes una sola opción como si fuera la única posible]
```

La nota de dirección importa tanto como el equipo: una ficha técnica perfecta sin intención narrativa es solo una lista de compras.

## Reglas de agua en cámara (aplican a cualquier toma real de la alberca)

- **Exposición:** el agua absorbe luz rápido con la profundidad — expón para conservar detalle en las luces (ETTR, expose to the right) o el agua profunda se va a negro sin información.
- **Rolling shutter:** si hay movimiento de agua (salpicadura controlada, viento en la superficie), usa un sensor/cámara con rolling shutter por debajo de 8ms o el patrón ondulado del agua se distorsiona visiblemente en cuadro.
- **Temperatura de color:** el agua refleja el cielo y se tiñe de azul incluso con luz cálida directa — si hay luces sumergidas o mixtas, considera gel CTB para emparejar la temperatura, o vas a tener dos temperaturas de color peleando en el mismo cuadro.
- **Polarizador, casi siempre obligatorio en exteriores:** elimina el reflejo del sol en la superficie y revela la transparencia real del agua y el detalle del fondo de la alberca. Usa circular en cualquier cámara con autoenfoque por divisor de haz (la inmensa mayoría de cámaras híbridas modernas); lineal solo en cine tradicional sin ese sistema.
- **Riesgo de contaminación IR con ND fuertes:** los NDs de muchos stops sin recubrimiento "IR-cut"/hot mirror dejan pasar luz infrarroja cercana, lo que produce un cast magenta o rojizo — especialmente visible en vegetación tropical y en el agua misma. Si recomiendas un ND fuerte para exteriores con sol veracruzano de mediodía, menciona este riesgo y la solución (ND con recubrimiento IR-cut, o stack de NDs más ligeros).

## Tabla de adaptación cine → redes sociales

| Variable cine | Adaptación para redes Pool Balance |
|---|---|
| Aspect ratio nativo de la cámara | Open gate cuando sea posible, para poder recortar a 9:16 y 1:1 sin perder resolución en post |
| Dynamic range / exposición | ETTR moderado — el feed comprime sombras agresivamente, mejor pecar de un poco más expuesto |
| Codec de entrega | H.264 de alto bitrate para Reels/Stories — los formatos pesados de cine se reconvierten siempre, nunca se suben directo |
| Loudness de audio (si hay) | -14 LUFS para redes (más alto que broadcast, porque el feed normaliza agresivo) |
| Horizonte de agua/mar al fondo | Filtro ND Grad de Hard Edge, no Soft — el horizonte del agua es perfectamente plano |
| Formato de entrega por plataforma | Ver tabla de formatos en `SKILL.md` |

## Cuándo elegir cada alternativa de filtración

- **Streak filters:** la forma más accesible de meter carácter anamórfico (el destello horizontal clásico) rodando con ópticas esféricas estándar — útil cuando Omar quiere "look de cine" sin el costo de un set anamórfico real.
- **ND Grad Hard Edge:** específicamente para exteriores con el horizonte de la alberca o el mar de fondo, porque esa línea es perfectamente recta.
- **Dioptrios de aproximación:** para acercarse al detalle del fotómetro o de los kits de prueba sin comprar un macro dedicado — válido para tomas estáticas, no para rack focus.
