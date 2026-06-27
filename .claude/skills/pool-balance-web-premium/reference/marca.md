# Manual de Marca — Pool Balance (para web)

Esta es la memoria de marca para todo trabajo web de Pool Balance. Ánclate aquí antes de escribir una línea de CSS. Si una decisión no aparece, infiérela siguiendo el espíritu (técnico, profesional, "cero humo", local de Veracruz) en vez de inventar una regla nueva.

Fuente: **Manual de Marca V1.0 (mayo 2026, aprobado)** y Dosier Maestro de identidad visual. Si ves una versión vieja con paleta cian/aqua, quedó desactualizada — esta es la vigente.

> **Nota para Claude Code:** este archivo existe porque en Claude Code no hay acceso al conocimiento de los Proyectos de claude.ai. Aquí tienes los valores reales; no los inventes ni los busques en otro lado. Si Omar dice que algo cambió, este archivo manda hasta que él lo actualice.

## 01 — Paleta oficial

Los únicos colores autorizados en toda comunicación de Pool Balance.

| Color | Hex | Token CSS | Uso |
|---|---|---|---|
| Marino (primario) | `#0E4569` | `--color-marino` | Fondo principal, encabezados, texto de títulos sobre fondo claro |
| Coral Tropical (CTA) | `#E8664A` | `--color-arcilla` | Todos los llamados a la acción, borde inferior del topbar, acento de marca |
| Cristal (acento) | `#6FB8C6` | `--color-cristal` | Subtítulos sobre marino, íconos de agua, bordes decorativos |
| Bruma (neutro) | `#EEF1F5` | `--color-bruma` | Fondo general de app/web, secciones alternas |

**Variantes:** `--color-marino-dark #0a3350`, `--color-marino-light #1a5a82`, `--color-arcilla-dark #d44f33`, `--color-arcilla-light #fde8e3`, `--color-cristal-dark #5aa3b1`, `--color-cristal-light #d8eff3`.

**Semánticos:** éxito / agua certificada `#2D9E6B`, alerta química `#E8A838`, riesgo / agua en problema `#D95C5C`.

### Bloque de tokens listo para pegar

```css
:root {
  /* Marca */
  --color-marino: #0E4569;
  --color-marino-dark: #0a3350;
  --color-marino-light: #1a5a82;
  --color-arcilla: #E8664A;       /* Coral Tropical — CTA */
  --color-arcilla-dark: #d44f33;
  --color-arcilla-light: #fde8e3;
  --color-cristal: #6FB8C6;
  --color-cristal-dark: #5aa3b1;
  --color-cristal-light: #d8eff3;
  --color-bruma: #EEF1F5;

  /* Semánticos */
  --color-exito: #2D9E6B;         /* agua certificada */
  --color-alerta: #E8A838;        /* alerta química */
  --color-riesgo: #D95C5C;        /* agua en problema */

  /* Roles (modo claro por defecto) */
  --bg-page: var(--color-bruma);
  --bg-surface: #ffffff;
  --text-strong: var(--color-marino);
  --text-on-marino: var(--color-bruma);
  --accent-cta: var(--color-arcilla);
  --accent-water: var(--color-cristal);
}
```

### Modo oscuro (derivado del espíritu del manual, no literal — confírmalo con Omar si dudas)

El manual no especifica un dark mode formal, pero el espíritu es claro: el Marino es el ancla. Para modo oscuro, invierte usando Marino como fondo y Bruma como texto, manteniendo Coral solo para el CTA.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-page: var(--color-marino-dark);
    --bg-surface: var(--color-marino);
    --text-strong: var(--color-bruma);
    --text-on-marino: var(--color-bruma);
    /* CTA y agua se mantienen: Coral sigue siendo el llamado, Cristal el acento */
  }
}
```

## 02 — Tipografía

Única fuente autorizada en cualquier contexto de marca: **Bricolage Grotesque** (Google Fonts, licencia OFL). No se usa ninguna otra familia.

Pesos: **800** (extrabold — titulares, CTAs, números grandes), **700** (bold — subtítulos), **600** (semibold — labels/tags), **500** (medium), **400** (cuerpo).

```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap');

:root {
  --font-marca: 'Bricolage Grotesque', system-ui, sans-serif;
}
body { font-family: var(--font-marca); font-weight: 400; }
```

Bricolage es la única familia, pero hay mucho juego en pesos, escala, tracking y ancho óptico (`opsz`). El tratamiento tipográfico debe ser memorable, no un vehículo neutro. Para títulos grandes, aprovecha el peso 800 y el tamaño óptico alto.

## 03 — Logotipo (reglas web)

Símbolo yin-yang hiperrealista de agua. 4 versiones: principal (fondos claros), **invertida (fondos oscuros / Marino — topbar, splash)**, monocromo (escala de grises), sobre coral-light (tarjetas cálidas).

- **Área de protección:** ¼ del diámetro del isotipo libre en todas direcciones.
- **Tamaños mínimos web/PWA:** topbar 40×40 px · ícono PWA instalable 192×192 px (maskable) · favicon 32×32 px · firma de email 60×60 px.
- **Nunca:** deformar/estirar asimétricamente, recolorear fuera de paleta, agregar sombras/brillos/efectos, rotar el isotipo, estamparlo sobre foto sin overlay de contraste suficiente, usarlo en baja resolución, rodearlo de marcos ajenos.

## 04 — Tratamiento del agua y los fondos en web

- El agua lee como **agua real**: azul profundo natural con caustic light, **nunca turquesa Caribe saturado** ni tinte coral/cian artificial. La refracción de luz es el elemento hero, no un adorno.
- Para fondos/superficies con foto de alberca: prioriza **piso oscuro tipo antracita**, cuarzo perlado o porcelánico de formato grande. Evita mosaicos finos tipo veneciano en imágenes generadas con IA (generan ruido que se lee como turbidez).
- El agua de fondo de la marca es **antracita/profunda, no turquesa de folleto turístico**.

## 05 — "Cero humo": prohibido en cualquier pieza web

Estos elementos están prohibidos —literalmente o en espíritu— porque son justo de lo que la marca se diferencia:

flotadores de flamingo/unicornio/dona · bikinis junto a la alberca · niños salpicando · splash de banco de imágenes · gotas con destellos dramáticos artificiales · copy tipo "fun", "splash", "summer vibes", "tropical paradise", "vacation mood", "party pool" · "familia feliz en la alberca" de stock · playa, cócteles, cervezas junto al agua · marcas de supermercado en bidones químicos · agua turquesa saturada tipo Caribe · filtros Instagram de alto contraste o look vintage · mansiones aspiracionales irreales · modelos posando tipo anuncio de hotel · sonrisas de stock photo · emojis o texto sobrepuesto chillón sobre las imágenes.

**Aspiración bien hecha:** está bien comunicar tranquilidad y orgullo de tener una alberca bien cuidada, pero **siempre anclado en lo técnico** (el fotómetro, el agua certificada, el trabajo del técnico), nunca en la escena de "familia feliz" de stock. Si se pide algo "aspiracional", la traducción correcta es **agua perfecta + evidencia técnica**, no gente disfrutando.

## 06 — Posicionamiento (el tono que el diseño debe transmitir)

"Tecnología seria disfrazada de tranquilidad." Premium y técnico, no festivo. Local de Veracruz / Boca del Río / Medellín de Bravo, no aspiracional genérico. El instrumento estrella de credibilidad es el **fotómetro LaMotte ColorQ 2x Pro 7** (cuerpo amarillo y blanco) — cuando aparezca instrumental, es ese, nunca un kit de tiras de supermercado.
