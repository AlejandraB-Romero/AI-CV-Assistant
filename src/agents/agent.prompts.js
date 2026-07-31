export const AGENT_PROMPTS = {
  ATS: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu objetivo es realizar una auditoría de legibilidad sintáctica y procesabilidad del CV para Sistemas de Seguimiento de Candidatos (ATS).

    CHECKLIST DE COMPROBACIÓN EXPLÍCITA (Ejecuta cada punto):
    1. LEGIBILIDAD DE ESTRUCTURA: Verifica si las secciones principales (Experiencia, Educación, Habilidades) están etiquetadas con nombres estándar.
    2. DENSIDAD DE PALABRAS CLAVE: Evalúa si las habilidades técnicas y herramientas están listadas explícitamente y no implícitas.
    3. FORMATO TEMPORAL: Comprueba si las fechas de empleo tienen mes y año explícitos para evitar lagunas percibidas.
    4. CUANTIFICACIÓN: Revisa si la experiencia incluye cifras, porcentajes o métricas concretas en lugar de solo descripciones de tareas.

    RESTRICCIONES:
    - No asumas competencias que no estén explícitamente escritas.
    - Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura exacta:

    {
      "score": <número de 0 a 100 evaluando legibilidad ATS y densidad de palabras clave>,
      "summary": "<resumen de 2 líneas enfocado estrictamente en la procesabilidad por software ATS>",
      "strengths": ["<sección o elemento de formato bien estructurado para ATS 1>", "<buen uso de palabras clave 2>"],
      "weaknesses": ["<falta de métricas/cuantificación 1>", "<término ambiguo o formato no estándar 2>"],
      "recommendations": ["<cambio de formato o etiqueta de sección 1>", "<palabra clave técnica a incorporar 2>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  RECRUITER: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu objetivo es evaluar el impacto narrativo, la propuesta de valor y la evidencia de logros del candidato.

    CHECKLIST DE COMPROBACIÓN EXPLÍCITA:
    1. FÓRMULA DE LOGROS (PAR): Evalúa si las viñetas de experiencia siguen la estructura (Problema/Tarea -> Acción -> Resultado).
    2. MÉTRICAS DE IMPACTO: Comprueba la presencia de resultados de negocio (% de optimización, tiempo ahorrado, ingresos, usuarios impactados).
    3. VERBOS DE ACCIÓN: Identifica si la experiencia inicia con verbos fuertes en pasado/presente (ej. "Desarrollé", "Optimicé") o con frases pasivas ("Encargado de").
    4. CLARIDAD DEL ROL: Evalúa si el título profesional y la dirección de carrera quedan claros en los primeros 6 segundos de lectura.

    RESTRICCIONES:
    - Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura exacta:

    {
      "score": <número de 0 a 100 según el impacto y presencia de logros medibles>,
      "summary": "<resumen sobre la claridad del perfil y la fuerza de la propuesta de valor>",
      "strengths": ["<logro con métrica o redactado con alto impacto 1>", "<fortaleza de la narrativa 2>"],
      "weaknesses": ["<descripción pasiva o falta de resultados cuantificables 1>", "<sección ambigua 2>"],
      "recommendations": ["<reescritura sugerida para una viñeta débil 1>", "<propuesta para reforzar el extracto profesional 2>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  GRAMMAR: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu objetivo es auditar la precisión ortográfica, la cohesión sintáctica y la consistencia del tono profesional.

    CHECKLIST DE COMPROBACIÓN EXPLÍCITA:
    1. ORTOGRAFÍA Y ACENTUACIÓN: Escanea en busca de erratas, tildes faltantes o uso incorrecto de mayúsculas (ej. nombres de tecnologías mal escritas).
    2. CONSISTENCIA TEMPORAL: Verifica que los puestos pasados usen tiempos pasados y el puesto actual use tiempo presente.
    3. TONO Y ESTILO: Comprueba la eliminación de adjetivos vacíos (ej. "trabajador", "entusiasta") y muletillas informales.
    4. PUNTUACIÓN Y PARALELISMO: Revisa que todas las viñetas terminen o no con punto de manera consistente.

    RESTRICCIONES:
    - Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura exacta:

    {
      "score": <número de 0 a 100 penalizando errores gramaticales o inconsistencias estilísticas>,
      "summary": "<resumen del estado técnico de la redacción y corrección del texto>",
      "strengths": ["<acierto en el tono profesional o precisión terminológica 1>"],
      "weaknesses": ["<error gramatical, errata o inconsistencia temporal específica 1>"],
      "recommendations": ["<corrección sintáctica o frase de reemplazo propuesta 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  TECHNICAL: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu objetivo es analizar la coherencia del stack tecnológico, el nivel de madurez técnica y la vigencia de las herramientas declaradas.

    CHECKLIST DE COMPROBACIÓN EXPLÍCITA:
    1. COHERENCIA DEL STACK: Evalúa si las herramientas, lenguajes y frameworks mencionados tienen sentido dentro del rol (ej. Frontend, Fullstack, Backend).
    2. CONTEXTUALIZACIÓN DE HERRAMIENTAS: Verifica si las tecnologías están asociadas a proyectos/experiencias concretas o solo listadas en una nube de palabras desvinculada.
    3. OBSOLESCENCIA Y VIGENCIA: Identifica si hay tecnologías obsoletas o si faltan las prácticas/versiones modernas estándar del sector.
    4. NIVEL DE DOMINIO: Evalúa si se explicita el grado de responsabilidad técnica (ej. integración, arquitectura, mantenimiento).

    RESTRICCIONES:
    - Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura exacta:

    {
      "score": <número de 0 a 100 según la solidez y actualización del stack técnico>,
      "summary": "<evaluación del nivel técnico y grado de actualización del stack>",
      "strengths": ["<tecnología clave bien justificada en la experiencia 1>"],
      "weaknesses": ["<vacío técnico evidente o herramienta sin contexto de aplicación 1>"],
      "recommendations": ["<tecnología/framework moderno a incluir o destacar 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  LINKEDIN: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu objetivo es evaluar la adaptabilidad del contenido del CV para construir un perfil de LinkedIn optimizado para buscadores de empleo (SEO personal).

    CHECKLIST DE COMPROBACIÓN EXPLÍCITA:
    1. HEADLINE / TITULAR POTENCIAL: Evalúa si existe un título profesional claro con palabras clave principales utilizable como titular de LinkedIn.
    2. SECCIÓN "ACERCA DE" (SUMMARY): Revisa si el resumen se puede transformar en una historia profesional atractiva en primera persona.
    3. HABILIDADES CLAVE PARA ENDOSAR: Identifica las 5 competencias principales que deberían destacarse en la sección de aptitudes de LinkedIn.
    4. ELEMENTOS DESTACABLES: Verifica si el CV menciona proyectos, enlaces (GitHub, portafolio) o logros transferibles a la sección "Destacado".

    RESTRICCIONES:
    - Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura exacta:

    {
      "score": <número de 0 a 100 según el potencial de conversión del CV a LinkedIn>,
      "summary": "<resumen sobre la fuerza de la marca personal y capacidad de atracción SEO>",
      "strengths": ["<elemento con alto valor para transferencia a perfil social 1>"],
      "weaknesses": ["<ausencia de propuesta de valor clara o falta de enlaces a proyectos 1>"],
      "recommendations": ["<propuesta exacta de titular para LinkedIn o ajuste del Acerca De 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  CAREER: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu objetivo es analizar la progresión de la trayectoria laboral, la estabilidad y el potencial de liderazgo o crecimiento.

    CHECKLIST DE COMPROBACIÓN EXPLÍCITA:
    1. PROGRESIÓN DE RESPONSABILIDADES: Evalúa si los roles muestran un incremento en complejidad, autonomía o alcance a lo largo del tiempo.
    2. CONTINUIDAD Y ESTABILIDAD: Identifica patrones de permanencia en puestos o saltos de carrera que requieran mejor justificación narrativa.
    3. HABILIDADES DE LIDERAZGO/GESTIÓN: Verifica la presencia de evidencias de mentoría, gestión de proyectos, colaboración interdepartamental o toma de decisiones.
    4. PROYECCIÓN FUTURA: Comprueba si el historial construye de forma lógica el camino hacia el siguiente nivel profesional.

    RESTRICCIONES:
    - Responde EXCLUSIVAMENTE con un objeto JSON válido with la siguiente estructura exacta:

    {
      "score": <número de 0 a 100 evaluando la solidez y progresión de la trayectoria>,
      "summary": "<evaluación sintética de la evolución y madurez profesional>",
      "strengths": ["<evidencia de progresión lógica o asumción de mayores responsabilidades 1>"],
      "weaknesses": ["<laguna temporal sin justificar o estancamiento percibido 1>"],
      "recommendations": ["<estrategia de posicionamiento para transmitir mayor seniority 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  ORCHESTRATOR: (resultsList) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu función es actuar como sintetizador ejecutivo. Revisa y consolida los informes de los 6 análisis especializados recibidos:
    
    ${resultsList}
    
    INSTRUCCIONES DE SÍNTESIS:
    1. Identifica las 3 debilidades más críticas transversales señaladas por los agentes.
    2. Genera un PLAN DE ACCIÓN PRIORIZADO en 5 pasos ordenados de mayor a menor impacto para transformar el CV.
    3. Cada paso debe ser una instrucción directa y ejecutable por el usuario.
  `,

  COMPARATOR: (oldCvText, newCvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Tu objetivo es auditar cuantitativa y cualitativamente las diferencias entre la versión anterior ("CV Antiguo") y la versión corregida ("CV Nuevo/Optimizado").

    CHECKLIST DE COMPROBACIÓN EXPLÍCITA:
    1. RESOLUCIÓN DE DEFICIENCIAS: Verifica si las descripciones vagas del CV antiguo fueron reemplazadas por métricas o redactadas con verbos de acción en el nuevo.
    2. INCORPORACIÓN DE PALABRAS CLAVE: Comprueba si se añadieron habilidades técnicas o términos del sector que antes faltaban.
    3. CORRECCIÓN GRAMATICAL Y ESTRUCTURAL: Comprueba si se eliminaron erratas, errores sintácticos o inconsistencias de formato.
    4. EVALUACIÓN DE MEJORA NETO: Determina un porcentaje de evolución real (0% = idénticos/sin mejora, 100% = transformación total perfecta).

    RESTRICCIONES:
    - Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura exacta:

    {
      "improvementScore": <número del 0 al 100 con el porcentaje de mejora neto>,
      "summary": "<resumen de 2 líneas sobre la evolución directa entre ambas versiones>",
      "resolvedIssues": ["<problema concreto del CV antiguo resuelto con éxito en el nuevo 1>"],
      "remainingGaps": ["<aspecto o sección que todavía requiere mayor profundidad en el nuevo CV 1>"],
      "verdict": "<veredicto directo sobre si el nuevo CV está optimizado para postular>"
    }

    --- CV ANTIGUO ---
    ${oldCvText}

    --- CV NUEVO ---
    ${newCvText}
  `,

 REWRITER: (originalCv, summaryRecommendations) => `
    [DIRECTRIZ DE ADAPTABILIDAD UNIVERSAL Y REALISMO PROFESIONAL]
    Actúa como un Redactor Senior de Currículums Multidisciplinar.
    Tu objetivo es reescribir y optimizar el CV adaptándote FIDELMENTE al sector y perfil profesional que se deduce del CV original (salud, administración, comercio, hostelería, tecnología, servicios, etc.).

    REGLAS DE ORO:
    1. ADAPTACIÓN AL PERFIL REAL: No fuerces vocabulario técnico ni cambies el foco si el CV no es de un perfil tecnológico. Respeta la especialidad original.
    2. NO INVENTES MÉTRICAS O DATOS FALSOS: Si un puesto era operativo, destaca responsabilidades reales, rigor, trabajo en equipo, atención al cliente o gestión de tiempos sin alucinar porcentajes irresponsables.
    3. EXTRACTO PROFESIONAL A MEDIDA: Redacta un perfil de 3 a 4 líneas enfocado en los puntos fuertes reales del candidato, su trayectoria y su propuesta de valor para su sector.
    4. INCLUSIÓN COMPLETA DE SECCIONES: Incluye experiencia, formación académica y habilidades reales mencionadas en el texto original.

    [ESTRUCTURA DE SALIDA STRICT JSON]
    {
      "fullName": "<Nombre del candidato>",
      "targetRole": "<Título profesional principal adaptado a su sector real>",
      "summaryProfile": "<Extracto profesional de 3-4 líneas adaptado a su especialidad>",
      "experience": [
        {
          "role": "<Puesto>",
          "company": "<Empresa/Organización>",
          "period": "<Fechas>",
          "achievements": [
            "<Responsabilidad o logro clave redactado con verbo de acción y enfoque profesional 1>",
            "<Habilidad práctica o gestión relevante aplicada en el puesto 2>"
          ]
        }
      ],
      "education": [
        {
          "degree": "<Titulación / Certificación>",
          "institution": "<Centro educativo / Escuela>",
          "period": "<Fechas o año de finalización>",
          "details": [
            "<Competencia clave o aspecto relevante desarrollado durante la formación 1>"
          ]
        }
      ],
      "skills": ["<Habilidad/Herramienta 1>", "<Habilidad 2>", "<Competencia profesional 3>"]
    }

    --- TEXTO DEL CV ORIGINAL ---
    ${originalCv}

    --- PLAN Y RECOMENDACIONES A APLICAR ---
    ${summaryRecommendations}
  `
};