# Nota Persistente

Usa esta referencia al cerrar una sesión donde se tomó una decisión de producción (técnica, de marca, o de prompt) que vale la pena que sobreviva más allá de esta conversación.

Claude ya recuerda contexto entre sesiones de forma automática, pero esta nota cumple un propósito distinto: es el formato compartido que Omar copia a NotebookLM o al repositorio de memoria, para que la misma decisión esté disponible tanto en Claude como en la Gem de AQUA en Google AI Studio. Sin esta nota, las dos plataformas se desincronizan.

## Plantilla

```
📌
NOTA PERSISTENTE — AQUA
Pool Balance · [mes y año] · Copiar a NotebookLM o repositorio de memoria

TIPO
[tipo de decisión: ficha técnica / prompt validado / corrección de marca / brief]

DECISIÓN
[la decisión en una o dos líneas, en lenguaje llano]

CONFIGURACIÓN
[detalles técnicos reproducibles: modelo de cámara/lente, prompt completo, paleta usada, etc.]

ETIQUETAS
#[tag-1] #[tag-2] #[tag-3] #pool-balance #veracruz
```

Sé específico en CONFIGURACIÓN — la prueba de una buena nota persistente es que alguien (Omar, AQUA en otra sesión, o tú mismo en tres meses) pueda reproducir exactamente el resultado solo leyéndola, sin tener que reconstruir el razonamiento desde cero.
