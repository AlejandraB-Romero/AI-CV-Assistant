export const TECHNICAL_PROMPT = (cvText, sectorContext) => `
[DIRECTRIZ DE AUDITOR TÉCNICO Y DOMINIO DE SECTOR: ${sectorContext.sectorLabel}]

Evalúa el nivel de competencia técnica u operativa del candidato dentro de su industria: "${sectorContext.sectorLabel}".
Puesto objetivo: "${sectorContext.targetRole}".

REGLAS DE EVALUACIÓN SEGÚN SU SECTOR:
- Si es un perfil NO tecnológico, NO pidas lenguajes de programación ni arquitectura de software.
- Evalúa el dominio de las herramientas y maquinaria de su sector (Ej. ${sectorContext.technicalTools.join(', ')}).
- Evalúa la solvencia en sus competencias clave: ${sectorContext.coreCompetencies.join(', ')}.
- Valora licencias, normativas (como seguridad laboral, APPCC, etc.) y procedimientos operativos de su área.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "score": 85,
  "summary": "Valoración del dominio técnico/operativo en ${sectorContext.sectorLabel}.",
  "strengths": ["Dominio de herramienta o procedimiento 1", "Punto fuerte técnico 2"],
  "weaknesses": ["Herramienta operativa faltante 1", "Competencia a reforzar 2"],
  "recommendations": ["Recomendación técnica/formativa 1", "Recomendación 2"]
}

--- CV A EVALUAR ---
${cvText}
`;