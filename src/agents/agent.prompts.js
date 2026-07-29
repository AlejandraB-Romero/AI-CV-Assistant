export const AGENT_PROMPTS = {
  ATS: (cvText) => `
    [REGLA DE ORO: DEBES RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    Actúa como un experto en Sistemas de Seguimiento de Candidatos (ATS). 
    Analiza el siguiente CV e identifica:
    1. Errores de formato que dificulten el escaneo automático.
    2. Ausencia de palabras clave técnicas esenciales.
    3. Puntuación de compatibilidad ATS estimada (0 a 100%).
    
    Sé conciso, directo y usa puntos clave.
    CV:
    ${cvText}
  `,

  RECRUITER: (cvText) => `
    [REGLA DE ORO: DEBES RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    Actúa como un Senior Technical Recruiter.
    Evalúa este CV enfocándote en:
    1. Si las experiencias muestran impacto cuantitativo (métricas, números, logros).
    2. Claridad en la redacción y brevedad.
    3. Red flags o vacíos en la trayectoria.
    
    Sé constructivo pero muy riguroso.
    CV:
    ${cvText}
  `,

  ORCHESTRATOR: (atsOutput, recruiterOutput) => `
    [REGLA DE ORO: DEBES RESPONDER OBLIGATORIAMENTE EN ESPAÑOL]
    Actúa como el Director de RRHH. Revisa los análisis previos del Agente ATS y del Agente Reclutador:
    
    [ANÁLISIS ATS]:
    ${atsOutput}
    
    [ANÁLISIS RECLUTADOR]:
    ${recruiterOutput}
    
    Genera un plan de acción de 3 pasos clave priorizados que el candidato debe aplicar inmediatamente para mejorar su CV.
  `
};