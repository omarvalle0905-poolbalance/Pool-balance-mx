/**
 * ============================================================
 *  POOL BALANCE — ARCHIVO DE CONFIGURACIÓN Y DATOS
 *  Versión: 1.0.0
 *
 *  ⚠️  INSTRUCCIÓN PARA EL CLIENTE:
 *  Este es el ÚNICO archivo que necesitas editar para actualizar
 *  textos, precios, paquetes, episodios de podcast e imágenes.
 *  NO modifiques ningún otro archivo a menos que seas desarrollador.
 * ============================================================
 */

const APP_CONFIG = {

  // ─────────────────────────────────────────────
  //  BANDERAS DE FUNCIONALIDAD (FEATURE FLAGS)
  // ─────────────────────────────────────────────
  //  portalOnly: cuando es true, la aplicación arranca y se
  //  mantiene SIEMPRE en el Portal del Cliente. Los módulos
  //  Inicio, Servicios y Biblioteca quedan ocultos (siguen en
  //  el código pero sin acceso) hasta que estén terminados.
  //  Para reactivar toda la app, cambia esto a false.
  // ─────────────────────────────────────────────
  features: {
    portalOnly: false,
  },

  // ─────────────────────────────────────────────
  //  INFORMACIÓN GENERAL DE LA EMPRESA
  // ─────────────────────────────────────────────
  company: {
    name: "Pool Balance",
    tagline: "Gestoría Técnica y Monitoreo de Albercas",
    location: "Veracruz, México",
    phone: "+52 33 2793 5845",
    whatsapp: "523327935845",
    email: "contacto@poolbalance.mx",
    instagram: "https://instagram.com/poolbalancemx",
    facebook: "https://facebook.com/poolbalancemx",
    address: "Veracruz, Ver., México",
    schedule: "Lun–Sáb · 8:00 AM – 6:00 PM",
  },

  // ─────────────────────────────────────────────
  //  SEO & OPEN GRAPH
  // ─────────────────────────────────────────────
  seo: {
    title: "Pool Balance | Gestoría Técnica y Monitoreo de Albercas en Veracruz",
    description:
      "Una alberca cristalina no siempre es una alberca segura. Pool Balance usa fotómetros digitales profesionales para garantizar el equilibrio químico real del agua de tu alberca en Veracruz. Servicio técnico certificado, bitácoras digitales y monitoreo continuo.",
    ogImage: "https://d8j0ntlcm91z4.cloudfront.net/user_3FI25AySj9ABMbASSeIkvl2eo2x/hf_20260618_023731_c26a86f3-4ce6-4634-af55-1677b9d0a4ad.png",
    ogType: "website",
    canonicalUrl: "https://poolbalance.com.mx",
    keywords: "mantenimiento de albercas Veracruz, química de agua piscinas, monitoreo albercas, gestoría hídrica, Pool Balance Veracruz",
  },

  // ─────────────────────────────────────────────
  //  VISTA 1: HOME — HERO & SECCIONES DIDÁCTICAS
  // ─────────────────────────────────────────────
  home: {
    hero: {
      badge: "Método Pool Balance™",
      headline: "Una alberca cristalina no siempre es una alberca segura.",
      subheadline:
        "El agua puede verse perfecta y aun así contener niveles peligrosos de patógenos, desequilibrios de pH o cloraminas irritantes. Nosotros usamos fotómetros digitales profesionales para leer lo que tus ojos no pueden ver.",
      cta_primary: { label: "Conoce nuestros servicios", view: "servicios" },
      cta_secondary: { label: "¿Cómo funciona?", view: "home", anchor: "metodo" },

      // ── Video promocional (opcional) ──────────────────────────
      // Para ACTIVAR: pega la URL de tu video en "url" y ajusta título.
      // Acepta: YouTube  → https://www.youtube.com/watch?v=XXXXXXX
      //         Vimeo    → https://vimeo.com/XXXXXXX
      //         MP4      → https://firebasestorage.googleapis.com/...mp4
      // Para OCULTAR: deja url como null o borra este bloque.
      promoVideo: {
        url: null,   // ← PON AQUÍ TU URL DE VIDEO
        title: "Pool Balance en acción",
        subtitle: "Así trabajamos para que tu alberca sea genuinamente segura.",
      },
      // ── Carousel de 4 slides educativos ──
      // Para editar: cambia image, tag, caption y stat de cada slide.
      // El orden de los slides es el orden en que aparecen en el hero.
      // ══════════════════════════════════════════════════════════
      //  📸 FOTOS DEL CAROUSEL — INSTRUCCIONES PARA OMAR
      // ══════════════════════════════════════════════════════════
      //
      //  Cada slide tiene un campo  image: "images/NOMBRE.jpg"
      //  Para cambiar la foto de un slide:
      //
      //    1. Crea o descarga la foto nueva
      //    2. Ponle EXACTAMENTE el nombre que dice abajo
      //    3. Súbela a la carpeta  images/  del proyecto
      //    4. ¡Listo! No hay que tocar código
      //
      //  Nombres fijos de cada slide:
      //  ┌─────────────────────────────────────────────────────┐
      //  │  Slide 1 → images/carousel-1.jpg   (agua verde)    │
      //  │  Slide 2 → images/carousel-2.jpg   (LSI/cristalina)│
      //  │  Slide 3 → images/carousel-3.jpg   (cloro/química) │
      //  │  Slide 4 → images/carousel-4.jpg   (alberca ideal) │
      //  │  Logo    → images/logo.png          (yin-yang agua) │
      //  └─────────────────────────────────────────────────────┘
      //
      //  Especificaciones recomendadas para las fotos:
      //  - Tamaño: 1400 x 900 px (horizontal / landscape)
      //  - Formato: JPG o WebP
      //  - Peso: máximo 500 KB por foto
      //  - Orientación: horizontal (no vertical)
      //
      //  Tip: las fotos actuales (carousel-1 a 4) son temporales.
      //  Cuando Yamile genere las imágenes, dile que las guarde
      //  con esos nombres exactos y súbelas a images/
      //
      // ══════════════════════════════════════════════════════════
      slides: [
        {
          id: "slide-verde",
          image: "https://d8j0ntlcm91z4.cloudfront.net/user_3FI25AySj9ABMbASSeIkvl2eo2x/hf_20260618_023202_fecac0cb-bbf9-49fb-be98-352c8f7844b1.png",   // ← Slide 1: alberca verde (IA Higgsfield)
          tag: "⚠️ Agua verde",
          caption: "El color verde es causado por algas y metales en oxidación. El cobre, hierro y manganeso reaccionan con el cloro y tiñen el agua — incluso el cabello rubio. Sin tratamiento específico, el problema empeora cada día.",
          stat: { value: "72h", label: "para resolver sin drenar" },
          accent: "danger",
          // audio: "audios/carousel-1.mp3",  ← descomenta cuando tengas el audio
          audio: null,
        },
        {
          id: "slide-lsi",
          image: "https://d8j0ntlcm91z4.cloudfront.net/user_3FI25AySj9ABMbASSeIkvl2eo2x/hf_20260618_023331_f114c20c-a415-407a-9e15-28a1be4704fb.png",   // ← Slide 2: cristalina engañosa / LSI (IA Higgsfield)
          tag: "🔬 LSI negativo — agua agresiva",
          caption: "El agua puede verse perfectamente cristalina y aun así tener un Índice de Langelier negativo. Esto significa que está en modo 'corrosivo': disuelve activamente el acabado, los accesorios metálicos y el equipo de filtración.",
          stat: { value: "LSI", label: "el parámetro invisible" },
          accent: "warning",
          // audio: "audios/carousel-2.mp3",
          audio: null,
        },
        {
          id: "slide-cloro",
          image: "https://d8j0ntlcm91z4.cloudfront.net/user_3FI25AySj9ABMbASSeIkvl2eo2x/hf_20260618_023607_c49cdbee-6f16-4456-baae-94fb56062373.png",   // ← Slide 3: fotómetro digital (IA Higgsfield)
          tag: "🧪 Cloro excesivo",
          caption: "Una alberca cristalina con cloro libre superior a 5 ppm irrita los ojos, blanquea trajes de baño y libera cloraminas tóxicas al respirar cerca de la superficie. Más cloro no es más seguro — es un riesgo diferente.",
          stat: { value: ">5 ppm", label: "cloro libre: zona de riesgo" },
          accent: "warning",
          // audio: "audios/carousel-3.mp3",
          audio: null,
        },
        {
          id: "slide-optimo",
          image: "https://d8j0ntlcm91z4.cloudfront.net/user_3FI25AySj9ABMbASSeIkvl2eo2x/hf_20260618_023731_c26a86f3-4ce6-4634-af55-1677b9d0a4ad.png",   // ← Slide 4: alberca certificada (IA Higgsfield)
          tag: "✅ Agua certificada Pool Balance™",
          caption: "Cuando los 6 parámetros están en rango simultáneamente — pH, cloro libre, cloro combinado, alcalinidad, dureza cálcica e índice de Langelier — el agua es genuinamente segura, no solo transparente.",
          stat: { value: "6/6", label: "parámetros en rango" },
          accent: "success",
          // audio: "audios/carousel-4.mp3",
          audio: null,
        },
      ],
      stats: [
        { value: "+200", label: "Albercas gestionadas" },
        { value: "98%", label: "Índice de satisfacción" },
        { value: "6", label: "Parámetros monitoreados" },
        { value: "24h", label: "Respuesta garantizada" },
      ],
    },

    problemSection: {
      title: "El problema que nadie te dice",
      subtitle:
        "La industria de las albercas vende apariencia. Nosotros vendemos seguridad real, respaldada por datos.",
      cards: [
        {
          icon: "eye-slash",
          color: "danger",
          title: "Lo que ves vs. lo que hay",
          body: "El agua turbia es una señal obvia, pero los problemas más graves son invisibles: bacterias, cloraminas y desequilibrios químicos que causan infecciones, irritación y corrosión silenciosa.",
        },
        {
          icon: "flask",
          color: "warning",
          title: "El método del cloro casero falla",
          body: "Agregar cloro sin medir pH, alcalinidad y dureza del calcio primero es como tomar medicamento sin diagnóstico. El cloro sin balance es ineficiente y potencialmente agresivo para la piel y los equipos.",
        },
        {
          icon: "chart-line",
          color: "primary",
          title: "Los fotómetros digitales no mienten",
          body: "A diferencia de las tiras reactivas de color que usan la mayoría de servicios, usamos fotómetros calibrados profesionalmente que entregan lecturas precisas al 0.01 ppm. Son los mismos equipos usados en albercas olímpicas.",
        },
        {
          icon: "shield-halved",
          color: "success",
          title: "Balance real, no apariencia",
          body: "Monitoreamos 6 parámetros clave: pH, cloro libre, cloro combinado, alcalinidad total, dureza cálcica e índice de Langelier. Solo cuando todos están en rango, certificamos que tu alberca es segura.",
        },
      ],
    },

    methodSection: {
      title: "El Método Pool Balance™",
      subtitle: "Un proceso técnico riguroso, no una rutina de mantenimiento genérica.",
      steps: [
        {
          number: "01",
          title: "Diagnóstico con Fotómetro Digital",
          description:
            "Medición precisa de los 6 parámetros críticos del agua con equipo profesional calibrado. Generamos una lectura de línea base antes de tocar cualquier químico.",
        },
        {
          number: "02",
          title: "Análisis del Índice de Langelier",
          description:
            "Calculamos el índice de saturación para determinar si el agua es corrosiva o incrustante. Este cálculo protege tu acabado, equipos y bañistas a largo plazo.",
        },
        {
          number: "03",
          title: "Dosificación Técnica Precisa",
          description:
            "Con base en los datos, calculamos las dosis exactas de cada correctivo. Sin estimaciones, sin excesos, sin desperdicio de químicos.",
        },
        {
          number: "04",
          title: "Bitácora Digital de Servicio",
          description:
            "Cada visita genera un reporte técnico descargable (PDF) con todas las lecturas, acciones tomadas y fotografías del estado del agua y equipo.",
        },
        {
          number: "05",
          title: "Monitoreo Continuo",
          description:
            "El historial de tu alberca vive en tu portal de cliente. Puedes comparar la evolución del agua mes a mes y tener evidencia documentada de cada servicio.",
        },
      ],
    },

    whySection: {
      title: "¿Por qué Pool Balance y no un servicio convencional?",
      comparisons: [
        { feature: "Medición de pH", conventional: "Tiras reactivas de color", poolBalance: "Fotómetro digital ±0.01" },
        { feature: "Cloro libre", conventional: "Estimación visual", poolBalance: "Lectura en ppm exacta" },
        { feature: "Reporte de servicio", conventional: "Ninguno o verbal", poolBalance: "PDF descargable con fotos" },
        { feature: "Índice de Langelier", conventional: "No se calcula", poolBalance: "Calculado en cada visita" },
        { feature: "Historial del agua", conventional: "No existe", poolBalance: "Portal digital del cliente" },
        { feature: "Capacitación al propietario", conventional: "No incluida", poolBalance: "Mini-guías incluidas" },
      ],
    },

    // ── Sellos de confianza (trust bar bajo el hero) ──
    trustBadges: [
      { icon: "microscope",      label: "Fotómetros calibrados" },
      { icon: "file-shield",     label: "Bitácora digital PDF" },
      { icon: "droplet",         label: "6 parámetros medidos" },
      { icon: "location-dot",    label: "Veracruz y zona conurbada" },
      { icon: "clock",           label: "Respuesta en 24 h" },
    ],

    // ── Testimonios (prueba social) ──
    testimonialsSection: {
      title: "Lo que dicen quienes ya tienen agua segura",
      subtitle: "Propietarios, administradores y desarrolladores que cambiaron la apariencia por la certeza.",
      items: [
        {
          quote: "Llevaba años pagando mantenimiento y nunca me daban un número. Pool Balance me entrega un PDF con las lecturas exactas cada visita. Por fin entiendo mi alberca.",
          name: "Mariana Esquivel",
          role: "Casa residencial · Boca del Río",
          rating: 5,
        },
        {
          quote: "Administramos una torre con alberca de uso intensivo. El historial digital nos da evidencia ante condóminos y autoridades. Cero quejas desde que entraron.",
          name: "Arq. Luis Domínguez",
          role: "Administrador · Fraccionamiento Costa de Oro",
          rating: 5,
        },
        {
          quote: "Tenía el agua verde y tres cotizaciones para drenar 60,000 litros. La resolvieron en 72 horas sin vaciar. El ahorro pagó el servicio del año.",
          name: "Roberto Nava",
          role: "Villa vacacional · Antón Lizardo",
          rating: 5,
        },
      ],
    },

    // ── Preguntas frecuentes (acordeón) ──
    faqSection: {
      title: "Preguntas que todo propietario debería hacer",
      subtitle: "Si tu servicio actual no puede responder esto, vale la pena una segunda opinión.",
      items: [
        {
          q: "¿Por qué un fotómetro digital y no las tiras reactivas?",
          a: "Las tiras de color dependen del ojo humano y tienen un margen de error enorme. El fotómetro mide la concentración real de cada compuesto con precisión de laboratorio (±0.01 ppm), los mismos equipos usados en albercas olímpicas. Si no se mide bien, no se puede dosificar bien.",
        },
        {
          q: "¿Qué es el Índice de Langelier y por qué me importa?",
          a: "Es el cálculo que determina si tu agua es corrosiva o incrustante. Un agua que se ve cristalina puede estar disolviendo activamente el acabado, las luminarias y el equipo metálico. Lo calculamos en cada visita para proteger tu inversión, no solo la transparencia.",
        },
        {
          q: "¿Tengo que firmar un contrato forzoso?",
          a: "No. Trabajamos con planes mensuales claros y servicios por visita. Sin permanencias engañosas ni letras pequeñas. Si no estás satisfecho, te quedas con tus bitácoras y nos despedimos como amigos.",
        },
        {
          q: "¿Atienden mi zona?",
          a: "Damos servicio en Veracruz puerto, Boca del Río, Medellín y zona conurbada. Para volúmenes mayores o desarrollos fuera del área, cotizamos a la medida. Escríbenos por WhatsApp y te confirmamos en minutos.",
        },
        {
          q: "¿Cada cuánto deben darle servicio a mi alberca?",
          a: "Depende del uso, exposición solar y carga de bañistas. Una alberca residencial estándar suele necesitar de 1 a 2 visitas técnicas al mes. En el diagnóstico inicial te damos una recomendación basada en datos, no en una rutina genérica.",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  //  VISTA 2: SERVICIOS Y PRECIOS
  // ─────────────────────────────────────────────
  services: {
    headline: "Elige el nivel de gestión que tu alberca necesita",
    subheadline:
      "Sin contratos engañosos. Sin letras pequeñas. Precios transparentes para Veracruz y zona metropolitana.",
    currency: "MXN",
    pricingNote: "* Precios base para albercas residenciales estándar (hasta 80 m³). Bajo cotización para volúmenes mayores.",
    packages: [
      {
        id: "esencial",
        name: "Esencial",
        badge: null,
        price: 890,
        period: "por visita",
        description: "Para propietarios que ya tienen servicio pero quieren respaldo técnico certificado.",
        color: "default",
        features: [
          { included: true,  text: "Diagnóstico con fotómetro digital (6 parámetros)" },
          { included: true,  text: "Dosificación técnica correctiva" },
          { included: true,  text: "Limpieza de filtro y canastillas" },
          { included: true,  text: "Reporte PDF básico de la visita" },
          { included: false, text: "Fotos del servicio incluidas" },
          { included: false, text: "Historial en portal de cliente" },
          { included: false, text: "Cálculo de Índice de Langelier" },
          { included: false, text: "Asesoría técnica directa" },
        ],
        cta: "Agendar visita",
      },
      {
        id: "balance",
        name: "Balance",
        badge: "Más popular",
        price: 1490,
        period: "mensual · 2 visitas",
        description: "Nuestro servicio insignia. Equilibrio químico sostenido con documentación completa.",
        color: "featured",
        features: [
          { included: true,  text: "Diagnóstico con fotómetro digital (6 parámetros)" },
          { included: true,  text: "Dosificación técnica correctiva" },
          { included: true,  text: "Limpieza de filtro y canastillas" },
          { included: true,  text: "Reporte PDF detallado con fotos" },
          { included: true,  text: "Galería de fotos en portal de cliente" },
          { included: true,  text: "Historial en portal de cliente" },
          { included: true,  text: "Cálculo de Índice de Langelier" },
          { included: false, text: "Atención de emergencias 24h" },
        ],
        cta: "Contratar ahora",
      },
      {
        id: "premium",
        name: "Premium",
        badge: "Gestión Total",
        price: 2490,
        period: "mensual · visitas ilimitadas",
        description: "Para propiedades de alto valor, rentas vacacionales o albercas de uso intensivo.",
        color: "premium",
        features: [
          { included: true,  text: "Diagnóstico con fotómetro digital (6 parámetros)" },
          { included: true,  text: "Dosificación técnica correctiva" },
          { included: true,  text: "Limpieza profunda de equipos" },
          { included: true,  text: "Reporte PDF detallado con fotos" },
          { included: true,  text: "Galería de fotos en portal de cliente" },
          { included: true,  text: "Historial completo en portal de cliente" },
          { included: true,  text: "Cálculo de Índice de Langelier" },
          { included: true,  text: "Atención de emergencias 24h" },
        ],
        cta: "Solicitar cotización",
      },
    ],
    addons: [
      { name: "Análisis microbiológico de laboratorio", price: 650, unit: "por análisis" },
      { name: "Renovación de agua (purga parcial)", price: 450, unit: "por servicio" },
      { name: "Tratamiento de algas (shockeo)", price: 380, unit: "por tratamiento" },
      { name: "Revisión y limpieza de bomba", price: 520, unit: "por visita" },
    ],
  },

  // ─────────────────────────────────────────────
  //  VISTA 3: BIBLIOTECA TÉCNICA / PODCASTS
  // ─────────────────────────────────────────────
  library: {
    headline: "Biblioteca Técnica Pool Balance",
    subheadline:
      "Conocimiento real sobre la química del agua. Sin mitos, sin marketing. Solo ciencia aplicada a tu alberca.",
    categories: ["Todos", "Química del Agua", "Equipo y Filtración", "Temporada", "Casos de Estudio"],
    episodes: [
      {
        id: "ep001",
        number: "EP. 01",
        category: "Química del Agua",
        title: "pH perfecto: el parámetro que controla todo lo demás",
        summary:
          "Descubre por qué el pH es el 'director de orquesta' de la química de tu alberca. Un pH fuera de rango hace que el cloro pierda hasta el 90% de su efectividad. Explicamos la escala, los rangos óptimos y por qué ajustar pH siempre va primero.",
        duration: "18 min",
        audioUrl: null, // Reemplazar con URL real de audio
        coverImage: "https://images.unsplash.com/photo-1628191139369-9c45b07a10d6?w=600&h=400&fit=crop",
        publishDate: "2024-03-15",
        tags: ["pH", "Cloro", "Fundamentos"],
        featured: true,
      },
      {
        id: "ep002",
        number: "EP. 02",
        category: "Química del Agua",
        title: "Cloraminas: el veneno invisible que irrita tus ojos",
        summary:
          "El olor fuerte a cloro en una alberca no es señal de que está limpia — es exactamente lo contrario. Explicamos qué son las cloraminas combinadas, cómo se forman y cómo eliminarlas con un superchoque correctamente calculado.",
        duration: "22 min",
        audioUrl: null,
        coverImage: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop",
        publishDate: "2024-04-02",
        tags: ["Cloraminas", "Salud", "Choque"],
        featured: true,
      },
      {
        id: "ep003",
        number: "EP. 03",
        category: "Equipo y Filtración",
        title: "El filtro de arena: cuándo lavar, cuándo renovar",
        summary:
          "Un filtro de arena mal mantenido puede convertirse en un cultivo bacteriano activo. Aprende los ciclos correctos de lavado a contracorriente, cómo interpretar la presión del manómetro y cuándo es momento de renovar la arena.",
        duration: "15 min",
        audioUrl: null,
        coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
        publishDate: "2024-04-18",
        tags: ["Filtración", "Mantenimiento", "Equipos"],
        featured: false,
      },
      {
        id: "ep004",
        number: "EP. 04",
        category: "Temporada",
        title: "Preparación de temporada: protocolo de apertura de verano",
        summary:
          "El protocolo de apertura correcto al inicio de la temporada de calor marca la diferencia entre una alberca estable y tres meses de problemas. Cubrimos el orden correcto de cada paso: desde el primer diagnóstico hasta la primera natación segura.",
        duration: "26 min",
        audioUrl: null,
        coverImage: "https://images.unsplash.com/photo-1560090995-01632a28895b?w=600&h=400&fit=crop",
        publishDate: "2024-05-05",
        tags: ["Verano", "Apertura", "Temporada"],
        featured: true,
      },
      {
        id: "ep005",
        number: "EP. 05",
        category: "Casos de Estudio",
        title: "Caso real: alberca verde resuelta en 72 horas sin drenar",
        summary:
          "Muchos tecnicistas recomiendan drenar cuando hay crecimiento de algas severo. En este caso de estudio documentado en Boca del Río, Veracruz, resolvemos una infestación avanzada en 72 horas con tratamiento técnico y sin desperdiciar 60,000 litros de agua.",
        duration: "31 min",
        audioUrl: null,
        coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
        publishDate: "2024-05-20",
        tags: ["Algas", "Caso Real", "Veracruz"],
        featured: false,
      },
      {
        id: "ep006",
        number: "EP. 06",
        category: "Química del Agua",
        title: "Dureza cálcica y el índice de Langelier: protege tu acabado",
        summary:
          "El índice de Langelier es el parámetro más ignorado en México y el más destructivo cuando está fuera de rango. Explicamos cómo el agua agresiva destruye acabados, corrode equipos y cómo calculamos este índice en cada visita para proteger tu inversión.",
        duration: "20 min",
        audioUrl: null,
        coverImage: "https://images.unsplash.com/photo-1542496658-e33a6d0d0f89?w=600&h=400&fit=crop",
        publishDate: "2024-06-08",
        tags: ["Langelier", "Dureza", "Protección"],
        featured: false,
      },
    ],
  },

  // ─────────────────────────────────────────────
  //  VISTA 4: PORTAL DEL CLIENTE (UI SHELL)
  // ─────────────────────────────────────────────
  portal: {
    loginTitle: "Portal del Cliente",
    loginSubtitle: "Accede a tu historial de servicios, bitácoras técnicas y reportes en PDF.",
    loginFields: {
      clientId: { label: "ID de Cliente", placeholder: "Ej. PB-2024-0042" },
      accessCode: { label: "Código de Acceso", placeholder: "Tu código de 6 dígitos" },
    },
    loginCta: "Ingresar al portal",
    helpText: "¿Olvidaste tu código? Escríbenos por WhatsApp",
    demoClientId: "PB-2024-0042",
    demoAccessCode: "123456",

    // Datos simulados del dashboard (Fase 2 conectará a API real)
    mockClient: {
      name: "Familia Herrera-Montoya",
      plan: "Balance",
      address: "Fracc. Costa Verde, Boca del Río, Ver.",
      poolVolume: "62 m³",
      nextVisit: "2024-07-15",
      clientSince: "Enero 2024",
      avatar: "FH",
    },

    mockBitacoras: [
      {
        id: "BIT-2024-018",
        date: "2024-06-28",
        technician: "Ing. Rodrigo Castellanos",
        status: "Óptimo",
        statusColor: "success",
        readings: {
          ph: 7.4,
          cloro_libre: 2.1,
          cloro_combinado: 0.2,
          alcalinidad: 105,
          dureza_calcica: 280,
          langelier: 0.1,
        },
        actions: ["Ajuste de pH con ácido muriático", "Mantenimiento de filtro", "Limpieza de canastillas"],
        notes: "Alberca en excelentes condiciones. Parámetros dentro de rango ideal.",
        pdfUrl: "#",
        photos: [
          { url: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&h=300&fit=crop", caption: "Vista general" },
          { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", caption: "Área de filtración" },
          { url: "https://images.unsplash.com/photo-1560090995-01632a28895b?w=400&h=300&fit=crop", caption: "Lectura de fotómetro" },
        ],
      },
      {
        id: "BIT-2024-014",
        date: "2024-06-10",
        technician: "Ing. Rodrigo Castellanos",
        status: "Corregido",
        statusColor: "warning",
        readings: {
          ph: 7.8,
          cloro_libre: 0.8,
          cloro_combinado: 0.6,
          alcalinidad: 130,
          dureza_calcica: 275,
          langelier: 0.4,
        },
        actions: ["Corrección de pH", "Supercloración preventiva", "Lavado a contracorriente del filtro"],
        notes: "Se detectó inicio de crecimiento algal en escalones. Se aplicó tratamiento preventivo con éxito.",
        pdfUrl: "#",
        photos: [
          { url: "https://images.unsplash.com/photo-1542496658-e33a6d0d0f89?w=400&h=300&fit=crop", caption: "Vista general pre-tratamiento" },
          { url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop", caption: "Medición inicial" },
        ],
      },
      {
        id: "BIT-2024-010",
        date: "2024-05-24",
        technician: "Ing. Rodrigo Castellanos",
        status: "Óptimo",
        statusColor: "success",
        readings: {
          ph: 7.3,
          cloro_libre: 2.4,
          cloro_combinado: 0.1,
          alcalinidad: 100,
          dureza_calcica: 270,
          langelier: 0.0,
        },
        actions: ["Revisión general", "Adición de estabilizador", "Limpieza de línea de flotación"],
        notes: "Servicio de apertura de temporada. Alberca lista para uso.",
        pdfUrl: "#",
        photos: [
          { url: "https://images.unsplash.com/photo-1628191139369-9c45b07a10d6?w=400&h=300&fit=crop", caption: "Apertura de temporada" },
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────
//  EXPORTAR (para uso como módulo en entornos con bundler)
//  En HTML estático, APP_CONFIG está disponible globalmente.
// ─────────────────────────────────────────────
if (typeof module !== "undefined" && module.exports) {
  module.exports = APP_CONFIG;
}
