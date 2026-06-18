# Conectores MCP para Frontend / UX (verificados, junio 2026)

> **Antes de decir "no existe un conector para esto", búscalo** con las herramientas de búsqueda de conectores. Y **nunca inventes** un MCP: si no estás seguro de que existe, dilo. Esta lista está verificada pero el ecosistema MCP crece a diario.

## Cómo recomendar

Cuando el trabajo se beneficie de un conector, di las tres cosas: **qué hace, si es de código abierto, y si requiere pago o cuenta.** No todos los oficiales son abiertos (Figma) y no todos los abiertos están mantenidos (Puppeteer está archivado).

## El stack recomendado para frontend de élite

Para un flujo de desarrollo frontend serio, esta combinación cubre casi todo:

**Chrome DevTools MCP + Playwright MCP + shadcn MCP + (Figma oficial *o* Framelink abierto) + un MCP de accesibilidad (a11y-mcp-server)**

## Tabla verificada

| Conector | Repo / fuente | Mantenedor | ¿Open source? | Estado y uso |
|---|---|---|---|---|
| **Chrome DevTools MCP** | github.com/ChromeDevTools/chrome-devtools-mcp | Google/Chrome (oficial) | **Sí, Apache-2.0** | Activo (preview). Controla un Chrome real: trazas de performance, inspección de red/consola, screenshots, árbol de accesibilidad. `npx chrome-devtools-mcp@latest` |
| **Playwright MCP** | github.com/microsoft/playwright-mcp | Microsoft (oficial) | **Sí, Apache-2.0** | Activo. Automatización de navegador vía **árbol de accesibilidad** (no pixeles) → rápido y determinista. `@playwright/mcp` |
| **shadcn MCP** | ui.shadcn.com/docs/registry/mcp | shadcn / Vercel (oficial) | **Sí, MIT** | Activo (integrado en shadcn CLI 3.0, ago 2025). Busca e instala componentes del registro; cero config |
| **Figma Dev Mode MCP** | developers.figma.com/docs/figma-mcp-server | Figma (oficial) | **No** (propietario; gratis en beta, de pago después) | Activo (beta). `get_design_context`, definiciones de tokens/variables, assets de imagen, escribir al canvas. Servidor local `http://127.0.0.1:3845/mcp`; remoto en mcp.figma.com |
| **Framelink Figma Context MCP** | github.com/GLips/Figma-Context-MCP | GLips / Framelink | **Sí, MIT** | Activo. Alternativa abierta; simplifica las respuestas de la API de Figma para design-to-code eficiente en tokens. `figma-developer-mcp` |
| **Deque axe MCP** | github.com/dequelabs/axe-mcp-server-public | Deque (oficial) | Repo público, **requiere suscripción de pago Axe DevTools** | Activo. Escaneos + `remediate` con arreglos a nivel de código |
| **a11y-mcp-server** | github.com/ronantakizawa/a11ymcp | comunidad | **Sí, MIT** (axe-core + Puppeteer) | Activo. WCAG 2.0/2.1/2.2, contraste de color, validación ARIA. `npx -y a11y-mcp-server` |
| **mcp-accessibility-scanner** | github.com/JustasMonkev/mcp-accessibility-scanner | comunidad | **Sí** (Playwright + axe-core) | Activo. Crawl de sitio completo + reportes JSON agregados; Docker |
| **design-system-mcp** | github.com/yajihum/design-system-mcp | comunidad | Sí (licencia sin confirmar; Style Dictionary) | Activo. Expone props de componentes + design tokens |
| **Storybook MCP (oficial)** | github.com/storybookjs/mcp | Storybook.js (oficial) | **Sí (MIT)** | Activo (Storybook 10.3, experimental, React). Renderiza/inspecciona stories, corre tests de componente + a11y |
| **storybook-mcp (comunidad)** | github.com/mcpland/storybook-mcp | comunidad | **Sí, MIT** | Activo. `getComponentList`, `getComponentsProps` vía Playwright headless |
| **Puppeteer MCP** | github.com/modelcontextprotocol/servers-archived | proyecto MCP (oficial) | Sí, MIT | **ARCHIVADO/sin mantenimiento — usa Playwright o Chrome DevTools en su lugar** |

## Notas importantes

- **No existe un MCP oficial de Style Dictionary ni de Tokens Studio** a esta fecha. Desconfía si alguien lo afirma; para tokens, el MCP oficial de Figma ya expone definiciones de variables/tokens.
- Los servidores MCP de referencia **mantenidos** del proyecto oficial son: Everything, Fetch, Filesystem, Git, Memory y Sequential Thinking (github.com/modelcontextprotocol/servers). Los demás "oficiales" viejos (incluido Puppeteer) viven en `servers-archived`.
- Para verificar cualquiera: el directorio en modelcontextprotocol.io y el README del repo oficial son las fuentes primarias.

## Para Omar específicamente

Dado el stack de Pool Balance (HTML/CSS/JS vanilla + Tailwind, GitHub + Vercel, Firebase) y que ya tiene Vercel y Notion conectados, los que más le rinden enchufar:

1. **Chrome DevTools MCP** — para que Claude pruebe en un Chrome real lo que construye (performance, consola, a11y) en vez de adivinar. Abierto.
2. **Playwright MCP** — para automatizar pruebas del portal PWA. Abierto.
3. **shadcn MCP** — si algún día migra a un stack con componentes; trae piezas listas. Abierto.
4. **a11y-mcp-server** — auditoría de accesibilidad WCAG sin costo. Abierto.
5. **Framelink Figma MCP** (abierto) o el **oficial de Figma** (mejor integrado, beta gratis) — para que los diseños de AQUA bajen a código con sus tokens reales.
