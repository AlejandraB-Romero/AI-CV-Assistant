export const CAREER_PROMPT = (cvText, sectorContext) => `
[DIRECTRIZ DE COACH DE CARRERA PROFESIONAL PARA: ${sectorContext.sectorLabel}]

Evalúa la trayectoria laboral del candidato y su proyección de crecimiento dentro de la industria "${sectorContext.sectorLabel}".
Puesto objetivo actual: "${sectorContext.targetRole}".

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "score": 80,
  "summary": "Diagnóstico de proyección profesional y evolución en el sector.",
  "strengths": ["Continuidad o polivalencia destacable en su carrera"],
  "weaknesses": ["Vacíos temporales o falta de progresión clara"],
  "recommendations": ["Siguiente paso lógico en su carrera (ej. Encargado, Supervisor, Formación adicional)"]
}

--- CV A EVALUAR ---
${cvText}
`;