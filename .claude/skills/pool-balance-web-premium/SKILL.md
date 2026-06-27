---
name: pool-balance-web-premium
description: Estándar de desarrollo web premium de Pool Balance (servicio de albercas residenciales en Veracruz, México) para construir o rediseñar landing pages, el portal de clientes, pantallas de captura de leads o cualquier interfaz web de la marca. Úsalo cada vez que Omar pida hacer, mejorar o "pulir" una página o componente web para Pool Balance, o cuando quiera que algo se vea premium, distinto, con trabajo humano e innovación, y no genérico ni "hecho con IA" — incluso si no menciona "skill" y solo dice "ármame la landing", "hazme la página principal del portal", "mejora cómo se ve esta sección", "quiero un efecto de scroll 3D", "que se vea diferente" o "conéctate al repo y pule el front". Cubre el sistema de tokens de marca, los principios anti-genérico, y el toolkit moderno 2026 de animación dirigida por scroll, 3D en CSS y View Transitions — todo nativo, sin motores pesados. Compone con el skill público frontend-design y funciona tanto en claude.ai como en Claude Code sobre el repositorio.
---

# Desarrollo Web Premium — Pool Balance

Trabaja como el director de diseño de un estudio chico al que contratan justo porque sus entregas no se parecen a las de nadie más. Omar ya rechazó lo que se siente plantilla; está pagando por un punto de vista. Cada decisión de color, tipografía, estructura y movimiento es deliberada y específica de Pool Balance — y vale arriesgar en un lugar bien elegido.

Este skill **compone con `frontend-design`** (el skill público de Anthropic, que tiene el juicio general de diseño distintivo — actívalo también) y con **`frontend-ingenieria-avanzada`** (la capa técnica de vanguardia: estado real de las APIs nativas, frameworks, 3D/WebGPU, verificación en vivo de soporte). Lo que agrega este es: el anclaje a la marca Pool Balance, las técnicas modernas concretas de 2026, y el estándar de calidad de Omar. Funciona igual en claude.ai (artefactos) que en Claude Code trabajando sobre el repo — el stack es HTML/CSS/JS vanilla + Tailwind sin build pesado, y las técnicas de abajo encajan ahí sin framework.

## Primero: ánclate en la marca

Antes de escribir una línea de CSS, lee **`reference/marca.md`** (en esta misma carpeta del skill). Ahí están los valores reales y vigentes: paleta Marino / Coral Tropical / Cristal / Bruma con sus hex y tokens CSS listos para pegar, tipografía Bricolage Grotesque como única familia, tratamiento del agua antracita (no turquesa Caribe), reglas del logo, el "cero humo", y el posicionamiento de "tecnología seria disfrazada de tranquilidad". Premium y técnico, no festivo.

> Si estás en la app de chat con el Proyecto de Pool Balance cargado, también puedes confirmar contra el conocimiento del proyecto (`project_knowledge_search`: "paleta", "Bricolage", "tokens"); pero `reference/marca.md` es la fuente autónoma para que esto funcione igual en Claude Code, donde ese conocimiento no existe. Si los dos difieren, gana el manual más reciente — pregúntale a Omar.

Las reglas de contenido prohibido de la marca ("cero humo": nada de sonrisas de stock, turquesa saturado, vibra de vacaciones, etc.) aplican igual en web que en foto/video, y están en `reference/marca.md`.

## El estándar anti-genérico

El diseño hecho con IA hoy se agrupa en tres clichés: fondo crema con serif de alto contraste y acento terracota; fondo casi negro con un solo acento verde ácido o bermellón; o layout tipo periódico con líneas finas y cero radio. Los tres son defaults, no decisiones. No gastes la libertad del diseño en ninguno de ellos.

- **El hero es una tesis.** Abre con lo más característico del mundo de Pool Balance — el agua, la cáustica, lo molecular, el instrumento — en la forma que mejor le sirva (titular, imagen, animación, momento interactivo). El número grande con label chiquito y acento en gradiente es la respuesta plantilla; úsala solo si de verdad es lo mejor.
- **La tipografía carga la personalidad.** Bricolage Grotesque es la única familia, pero hay mucho juego en pesos (800/700/600/500/400), escala, tracking y ancho. Que el tratamiento tipográfico sea memorable, no un vehículo neutro.
- **La estructura significa.** Numeritos (01/02/03), eyebrows, divisores — solo si codifican algo verdadero (un proceso real, una secuencia). Si no, son decoración; quítalos.
- **El movimiento es deliberado.** Una secuencia orquestada pega más que efectos dispersos. Y ojo: demasiada animación es justo lo que hace sentir "esto lo hizo una IA". Menos, mejor ejecutado.
- **Gasta la audacia en un solo lugar.** Un elemento firma memorable, y todo lo demás callado y disciplinado. Antes de entregar, quita un accesorio.

## Las dos capas de este skill

Como todos los departamentos de Pool Balance, este skill tiene método durable + datos en vivo:

- **Método (durable):** todo lo de arriba — el estándar, el anclaje de marca, el piso de calidad. No cambia.
- **Datos en vivo:** la plataforma web se mueve rápido. Cuando construyas algo con una técnica moderna, verifica su soporte actual (MDN, caniuse) en vez de confiar en lo que "recuerdas", y si Omar pide "lo último en tendencias", haz una búsqueda fresca. No congeles una lista de tendencias en este archivo — se pudre.

## Toolkit moderno (resumen)

El detalle con código está en `reference/tecnicas-modernas.md`. En corto, lo que hoy permite efectos premium sin motores pesados:

- **Animación dirigida por scroll en CSS puro** (`animation-timeline: scroll()` y `view()`): corre fuera del hilo principal, 60fps, sin JS pesado. Es la base del "deslizamiento 3D" que quieres.
- **3D sin WebGL**: `perspective` + `transform-style: preserve-3d` + timelines de scroll dan coverflow, pop con rotación al entrar, etc. Nada de three.js salvo que de verdad haga falta.
- **View Transitions API**: para morphs cinematográficos (hero que se convierte en header pegado, transiciones entre páginas).
- **Mejora progresiva siempre**: `@supports (animation-timeline: view())`, estado por defecto visible/usable, y `prefers-reduced-motion` respetado.

## Cómo trabajar

1. **Plan de tokens primero** (en tu pensamiento): paleta de 4-6 hex nombrados, tipografía por roles, concepto de layout (con wireframe ASCII), y el elemento firma. Deriva todo de la marca.
2. **Crítica anti-genérico**: corre mentalmente un prompt parecido; si llegas a lo mismo, no era una decisión, era un default. Revísalo y di qué cambiaste.
3. **Construye** siguiendo el plan; cuida la especificidad de selectores CSS (el shorthand `animation` resetea `animation-timeline: auto` — usa selectores con suficiente peso).
4. **Crítica de nuevo**: responsive a mobile, foco de teclado visible, movimiento reducido respetado, y rendimiento (anima solo `transform` y `opacity`).

## Lo que nunca haces

- Nunca entregas algo que caiga en uno de los tres clichés de IA, ni copy que suene a plantilla.
- Nunca metes un motor 3D pesado (three.js/WebGL) cuando CSS nativo logra el efecto.
- Nunca rompes las reglas de marca ni el "cero humo" por hacer algo "más llamativo".
- Nunca animas propiedades de layout (width, top, margin) — solo `transform`/`opacity`, o se va el rendimiento.
- Nunca dejas una animación sin fallback `@supports` ni sin variante de `prefers-reduced-motion`.
