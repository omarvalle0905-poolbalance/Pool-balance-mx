# 3D en la Web: WebGPU y Three.js (estado: mediados de 2026)

> **Verifica la revisión de Three.js y el soporte de WebGPU en vivo** (threejs.org, caniuse). Cambian rápido.

## ¿De verdad necesitas 3D pesado?

Antes de meter Three.js/WebGPU, pregunta:
- ¿Cuántos objetos? Decenas → probablemente CSS 3D (`perspective` + `preserve-3d` + scroll timelines) basta. Miles/millones → motor.
- ¿Interacción real (cámara, física, picking) o solo un efecto visual? Solo efecto → CSS.
- ¿Presupuesto de bytes? Three.js core pesa; no lo metas para un coverflow.

**Regla:** CSS nativo primero; motor solo cuando de verdad no alcance, y justifica por qué.

## WebGPU — la nueva línea base

- **WebGPU es Baseline desde enero de 2026**: Chrome/Edge (113+ desde 2023), **Safari 26** (macOS Tahoe / iOS / iPadOS / visionOS 26, sept 2025) y **Firefox** (141+ Windows jul 2025; 145+ macOS).
- **Caveat importante:** Firefox en **Linux y Android sigue en progreso** (a lo largo de 2026); iPhones pre-A12 quedan fuera. → **Un fallback a WebGL2 sigue siendo obligatorio** para una cola de ~5–10%.
- Dos implementaciones: **Dawn** (Chromium, C++) y **wgpu** (Firefox, Rust).
- Ruptura arquitectónica vs WebGL: control explícito y determinista del buffer de memoria, pensado para cómo operan las GPU modernas.
- **Compute Shaders** (ausentes en WebGL): cómputo de propósito general en la GPU — física pesada, inferencia de ML, procesamiento geoespacial masivo — sin estragos en el hilo del CPU.

## Three.js

- Revisión vigente a junio 2026: **r184** (verifica en threejs.org).
- **WebGPURenderer** (`import { WebGPURenderer } from 'three/webgpu'`): renderer de nueva generación que **cae con elegancia a WebGL2** si el cliente no soporta WebGPU. Swap de una línea desde **r171**. Requiere `await renderer.init()` antes del primer render.
- **TSL (Three.js Shading Language)**: sistema de shaders nodal en JS que compila a **WGSL (WebGPU) o GLSL (WebGL)** — "write once, run everywhere". Releases recientes mejoraron el tiempo de compilación de TSL ~3×. Imports: `three/webgpu` (renderer + node materials como `MeshStandardNodeMaterial`), `three/tsl` (funciones TSL).
- **BatchedMesh** (desde r156): fusiona varias geometrías que comparten material en una sola draw call → 30–60 FPS estables en escenas con muchos objetos. Combínalo con `InstancedMesh`, materiales compartidos y atlas de texturas.
- Compute shaders en Three.js vía `instancedArray`/`storage`/`uniform` de `three/tsl` empujan sistemas de partículas hacia millones de entidades.
- **Audita draw calls** con `renderer.info.render.calls`.

### Cifras a corregir del documento original

- "**2.7 millones de imports semanales**" → **disputado**. El contador oficial de npm/npmtrends (jun 2026) marca **~10.1 millones de descargas semanales**. La cifra "2.7M/semana" viene de un blog de terceros, no de npm. **Usa ~10M (npm) si citas descargas.**
- "**1,000,000 de entidades**" y "**recolección de basura en r184**" → **sin verificar contra el changelog oficial**. r184 sí trae mejoras de memoria/`Renderer.info`, pero confirma esos números exactos en las notas de versión antes de afirmarlos.

## Babylon.js (alternativa)

- Motor alterno real, **WebGPU-first desde v5.0 (2022)**, reescribió shaders core en WGSL; reporta escenas ~10× más rápidas vía render bundles. Considéralo para proyectos que ya viven en su ecosistema o necesitan su editor/herramientas.

## Directriz de pila (corporativa)

- **Three.js + WebGPU:** entorno predilecto para experiencias < 500 MB (la mayoría de las demandas comerciales). Gestión de objetos optimizada vía `BatchedMesh`, 30–60 FPS estables. Visualización de datos, modelos moleculares, dashboards 3D.
- **WebGPU nativo (sin librería):** solo para proyectos gigantes > 500 MB, alta fidelidad, LiDAR/topología, buscando picos de 120 FPS sin el sobrecosto de los árboles de metadatos de objeto de un motor general.
