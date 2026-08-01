export const RECRUITER_PROMPT = (cvText, sectorContext) => `
[DIRECTRIZ DE RECLUTADOR SENIOR PARA EL SECTOR: ${sectorContext.sectorLabel}]

Evalúa la atractividad general del CV desde la perspectiva de un reclutador o cazatalentos (Headhunter) del sector "${sectorContext.sectorLabel}".
Puesto objetivo: "${sectorContext.targetRole}".

CRITERIOS DE EVALUACIÓN:
- Mide el impacto visual y la narrativa profesional dentro de su industria.
- Evalúa si los logros y responsabilidades están redactados con verbos de acción y resultados relevantes para ${sectorContext.sectorLabel}.
- Evalúa la claridad del perfil inicial (About Me/Resumen Profesional).

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "score": 80,
  "summary": "Valoración del reclutador sobre el perfil en ${sectorContext.sectorLabel}.",
  "strengths": ["Punto fuerte de impacto 1", "Punto fuerte de narrativa 2"],
  "weaknesses": ["Falta de métricas/logros 1", "Punto débil en redacción 2"],
  "recommendations": ["Sugerencia de reclutador 1", "Sugerencia 2"]
}

--- CV A EVALUAR ---
${cvText}
`;