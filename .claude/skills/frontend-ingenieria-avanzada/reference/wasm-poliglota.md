# WebAssembly Políglota (estado: mediados de 2026)

> **Verifica los hitos de WASI/Component Model en el Bytecode Alliance antes de afirmar "estable".**

## El estado real de WASM en 2026

- **WebAssembly 3.0** es estándar W3C desde **septiembre de 2025**: WasmGC, manejo de excepciones, tail calls, memoria de 64 bits, SIMD de 128 bits.
- **Component Model (WCM) + WASI 0.2 (Preview 2 / WASIp2)**: lanzados el **25 de enero de 2024** por el Bytecode Alliance — tipos de interfaz WIT estables, "worlds" (`wasi-cli`, `wasi-http`, `wasi-sockets`, clocks, random).
- **WASI 0.3 (P3)**: agrega async nativo (`stream<T>`/`future<T>`); primer RC en **Fermyon Spin v3.5 (nov 2025)**.
- **WASI 1.0 y Component Model 1.0 están planeados para 2026** (CM 1.0 debe aterrizar primero; son hitos relacionados pero distintos). → A mediados de 2026, preséntalo como **"en transición", no "1.0 estable"**, salvo que verifiques que ya salieron.
- Compatibilidad: módulos P1 y componentes P2 siguen corriendo.
- **Hueco clave del lado servidor: aún no hay multithreading nativo.**

## Qué resuelve el Component Model

Composición modular: módulos independientes hechos en **C++**, **Go** (inferencia de IA), o **Rust** (cripto) dialogan interoperablemente dentro de un sandbox, compartiendo fronteras de datos con fricción cero, sin los confines de la memoria compartida aislada. **Extism** es un framework real de plugins WASM cross-lenguaje que se apoya en esto (verifica su versión actual antes de citar detalles).

## Casos de producción reales (todos verificados)

- **Figma** — motor de render vectorial en C++ vía WASM.
- **Google Earth** — origen C++, con componentes en Rust.
- **Adobe Photoshop en la web** — C++/Emscripten.
- **AutoCAD Web**, **procesamiento de video de Google Meet**.
- **Llama.cpp / WebLLM** — LLMs corriendo en el navegador vía WASM + WebGPU (WebLLM alcanza ~80% del rendimiento de inferencia nativo).

## Rust en el navegador

- Filosofía: **Rust como el motor de alto torque, JavaScript como la capa elegante de dirección de la interfaz.** No reemplaza JS; empaqueta la lógica pesada.
- Herramientas: `wasm-pack`, `wasm-bindgen`, **`cargo-component`** (para el Component Model). Todas reales y correctas.
- Stack backend Rust validado por Discord, Shopify: **Tokio** (runtime async), **Axum** (web framework), **SQLx** (SQL async). Correcto e idiomático.
- Para el frontend: empaqueta lógica pesada en binarios rápidos con `wasm-pack`/`cargo-component` y consúmela sin penalización desde Node/el bundle.

## Java en el navegador

- **La muerte de los applets fue 2015–2018** (Chrome/Firefox quitaron NPAPI); la API de applets se deprecó en Java 9 y **se removió en JDK 17 (2021)**. **NO existe "Java 26 que mató los applets en marzo de 2026"** — eso está garbleado/falso en el documento original; corrígelo.
- **Java 21 es el LTS vigente; Java 25 es el siguiente LTS (sept 2025).** No hay "Java 26 LTS".
- **CheerpJ**: instala una JVM (OpenJDK) compilada a JS + WASM, del lado cliente; corre JARs/applets/JNLP sin modificar. **El estable vigente es 4.x (4.3, abr 2026)** con Java 8/11/17(preview). **CheerpJ 6.0 (Java 21) está en el roadmap 2026 pero NO ha salido** — el "CheerpJ 6.0" del documento es prospectivo. Útil para: modernizar el front en HTML5/Svelte/React mientras la lógica de negocio Java probada corre nativamente en el cliente.
- **TeaVM**: compilador AOT de bytecode Java (y Kotlin/Scala) → JS/WASM (ahora WasmGC), paquetes diminutos de arranque instantáneo. Real y listo para navegador. El framework **Flavour** (SPA en Java puro) es real pero de nicho.

## Cuándo meter WASM (y cuándo no)

- **Sí:** cómputo matricial pesado, procesamiento de imagen/video, criptografía, simulación, portar una base C++/Rust/Java existente, inferencia de ML en cliente.
- **No:** lógica de UI normal, formularios, fetching, animación — eso es territorio de JS/CSS nativo y meter WASM solo agrega complejidad y peso de toolchain.
