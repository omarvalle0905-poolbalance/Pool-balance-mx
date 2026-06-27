# Prompts de IA — Imagen y Video

Usa esta referencia cuando Omar pide un prompt para generar contenido con IA (Imagen 3, Nano Banana, Veo, Flow, Kling, Runway). Antes de escribir el prompt, repasa `identidad-visual-marca.md` — los "Sujetos aprobados" y "Absolutamente prohibido" de ahí son las variables que rellenan las plantillas de abajo.

Recuerda: tu trabajo es entregar el prompt en inglés, listo para copiar y pegar. No generas el archivo — dilo explícitamente al entregarlo. Si Omar quiere ver referencias reales de un estilo o equipo antes de decidir el prompt (no el asset final), puedes usar `image_search`.

## Estructura de un prompt de imagen

```
[SUJETO PRINCIPAL — del listado aprobado de identidad-visual-marca.md, con el LaMotte ColorQ 2x Pro 7
descrito como amarillo y blanco si aparece el fotómetro]
[ACCIÓN/POSE si aplica — manos profesionales, técnico en uniforme, nunca gente disfrutando como stock photo]
[ENTORNO — alberca residencial real de Veracruz/Boca del Río/Medellín de Bravo, vegetación tropical real]
[ILUMINACIÓN — hora dorada / luz natural controlada / caustic light como elemento hero]
[COMPOSICIÓN — cenital, primer plano de detalle, etc.]
[PALETA — tonos de agua azul profundo natural; Coral Tropical y Cristal solo si se pide un elemento gráfico
explícito, no como tinte de la escena]
[CALIDAD — cinematic, photorealistic, 8K, editorial technical photography style]
[NEGATIVO — ver banco de negativos abajo]
```

**Ejemplo completo:** "Close-up of a LaMotte ColorQ 2x Pro 7 photometer (yellow and white body, digital display, test cells) held by professional hands at the edge of a residential pool in Boca del Río, Veracruz, golden hour natural light, deep navy blue water with natural caustic light reflections, technical editorial photography style, shallow depth of field on the instrument, photorealistic, 8K. Negative prompt: flamingo floats, bikinis, splashing, stock photo smiles, oversaturated turquoise water, vintage filter, tropical paradise vibes, generic supermarket chemical bottles, logo or text overlays."

## Estructura de un prompt de video

Misma lógica que imagen, más estas capas:

```
[MOVIMIENTO DE CÁMARA — estático, paneo lento, dolly-in sutil; nada que se sienta como anuncio de resort]
[DURACIÓN/RITMO — coherente con el formato de plataforma elegido]
[ÓPTICA VIRTUAL — ver guía de lente abajo, depende de si el hero es la claridad del agua o un sujeto]
[SONIDO AMBIENTAL sugerido — aunque no lo genere el modelo de video, anótalo para la edición]
```

**Guía de lente para video generado con IA (aprendizaje validado en pruebas de Pool Balance, no es una regla universal de cine — es específica de cómo rinden los modelos generativos):**

- Si el hero de la toma es la **claridad del agua** (textura, superficie, refracción): usa primas esféricas de gran formato a profundidad de campo cerrada (T5.6–T8) en la descripción virtual del lente. Las ópticas anamórficas, en cambio, tienden a introducir una suavidad que los modelos de video leen como turbidez — lo opuesto a lo que se busca.
- Si el hero es un **sujeto** (retrato del técnico, detalle de producto con separación de fondo): el bokeh abierto (T1.8–T2.8) sigue siendo válido y deseable.

## Variables de Pool Balance para rellenar las plantillas

- **Sujetos frecuentes (aprobados):** agua quieta cenital con caustic light · fotómetro LaMotte ColorQ 2x Pro 7 en uso · manos profesionales con instrumentos · detalle de manómetros/dosificadores/kits de prueba · técnico en uniforme azul marino con logo · bidones de químicos profesionales · filtros de arena/bombas/skimmer · vegetación tropical real de fondo.
- **Nunca como sujeto:** familias o personas "disfrutando" la alberca como escena central, niños, bikinis, cualquier ítem de la lista prohibida de `identidad-visual-marca.md`.
- **Acabado del fondo de la alberca:** antracita oscuro, cuarzo perlado, o porcelánico de formato grande. Evita mosaicos pequeños en piezas de IA (ver razón en `identidad-visual-marca.md` sección 05).
- **Iluminación:** hora dorada o luz natural controlada; caustic light como elemento hero, no decorativo.
- **Paleta:** agua en azul profundo natural — nunca turquesa Caribe saturado. Coral Tropical/Cristal son acentos gráficos de postproducción, no tintes de la escena fotorrealista.

## Banco de negativos recomendados (combina los que apliquen)

flamingo floats, unicorn floats, donut floats, bikinis, kids splashing, stock photo splash, dramatic glittery droplets, slow-motion artifacts in a still image, oversaturated Caribbean turquoise water, vintage Instagram filter, tropical paradise vibes, summer vacation mood, happy family in pool, generic supermarket chemical bottles, duck-shaped chlorine tablets, manual telescopic pool vacuum, logo or text overlays, low resolution, watermark.

## Reglas que mejoran el rendimiento del prompt (aprendizaje validado)

- Negativos explícitos + hex de paleta + descripción física detallada del equipo real rinden mejor que descripciones genéricas ("professional pool testing kit" genera resultados inconsistentes; "LaMotte ColorQ 2x Pro 7, yellow and white, digital screen" es reproducible).
- El logo se agrega siempre en postproducción (Canva), nunca dentro del prompt — ver regla en `identidad-visual-marca.md` sección 03.
- Cuando el prompt vaya a Veo/Flow específicamente, ten en cuenta que la consistencia entre generaciones es menor que con Imagen 3 — si Omar necesita variantes para elegir, pide explícitamente que generes 2-3 variaciones del mismo prompt con micro-ajustes (ángulo, hora del día) en vez de confiar en una sola corrida.
