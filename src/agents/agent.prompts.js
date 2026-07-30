export const AGENT_PROMPTS = {
  ATS: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Actúa como un experto en Sistemas de Seguimiento de Candidatos (ATS).
    Analiza el siguiente CV. Debes responder al final con un objeto JSON válido con la siguiente estructura exacta:
    {
      "score": <número de 0 a 100>,
      "summary": "<resumen de 2 líneas sobre compatibilidad ATS>",
      "strengths": ["<punto fuerte 1>", "<punto fuerte 2>"],
      "weaknesses": ["<debilidad 1>", "<debilidad 2>"],
      "recommendations": ["<mejora 1>", "<mejora 2>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  RECRUITER: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Actúa como un Senior Technical Recruiter.
    Evalúa el impacto cuantitativo, logros y narrativa del CV.
    Responde al final con un objeto JSON válido con la siguiente estructura exacta:
    {
      "score": <número de 0 a 100>,
      "summary": "<resumen sobre la narrativa y experiencia>",
      "strengths": ["<logro/métrica destacada 1>", "<punto fuerte 2>"],
      "weaknesses": ["<aspecto débil 1>", "<falta de datos 2>"],
      "recommendations": ["<recomendación 1>", "<recomendación 2>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  GRAMMAR: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Actúa como un Corrector Estilístico y Gramatical Senior.
    Evalúa la ortografía, tono profesional, sintaxis y coherencia estilística del CV.
    Responde al final con un objeto JSON válido con la siguiente estructura exacta:
    {
      "score": <número de 0 a 100>,
      "summary": "<resumen del estado de la redacción>",
      "strengths": ["<acierto gramatical/estilístico 1>"],
      "weaknesses": ["<error de ortografía o redacción 1>"],
      "recommendations": ["<sugerencia de cambio de texto 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  TECHNICAL: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Actúa como un Lead Technical Reviewer / Arquitecto de Software.
    Evalúa el stack tecnológico, nivel de madurez técnica y pertinencia de las herramientas mencionadas.
    Responde al final con un objeto JSON válido con la siguiente estructura exacta:
    {
      "score": <número de 0 a 100>,
      "summary": "<evaluación general del stack técnico>",
      "strengths": ["<tecnología/skill clave destacada 1>"],
      "weaknesses": ["<tecnología obsoleta o vacíos del stack 1>"],
      "recommendations": ["<stack a incluir o profundizar 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  LINKEDIN: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Actúa como un Consultor de Personal Branding y Optimización de LinkedIn.
    Evalúa la capacidad del CV para trasladarse a un perfil de LinkedIn de alto impacto.
    Responde al final con un objeto JSON válido con la siguiente estructura exacta:
    {
      "score": <número de 0 a 100>,
      "summary": "<resumen de la propuesta de marca personal>",
      "strengths": ["<titular o sección destacable 1>"],
      "weaknesses": ["<falta de presencia de marca 1>"],
      "recommendations": ["<sugerencia para headline o sección Acerca De 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  CAREER: (cvText) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Actúa como un Executive Career Coach.
    Evalúa la proyección de carrera, liderazgo, progresión lógica y proyección futura del perfil.
    Responde al final con un objeto JSON válido con la siguiente estructura exacta:
    {
      "score": <número de 0 a 100>,
      "summary": "<evaluación de la trayectoria profesional>",
      "strengths": ["<evidencia de crecimiento/liderazgo 1>"],
      "weaknesses": ["<lagunas o estancamiento percibido 1>"],
      "recommendations": ["<estrategia de posicionamiento a futuro 1>"]
    }

    CV A ANALIZAR:
    ${cvText}
  `,

  ORCHESTRATOR: (resultsList) => `
    [REGLA DE ORO: RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    
    Actúa como el Director General de Talento y Evaluación.
    Revisa los diagnósticos consolidados de los 6 agentes expertos:
    
    ${resultsList}
    
    Sintetiza estos 6 análisis y genera un PLAN DE ACCIÓN ESTRATÉGICO DIRECTO con los 5 pasos prioritarios inmediatos para transformar este CV.
  `
};