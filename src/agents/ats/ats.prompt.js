export const ATS_PROMPT = (cvText, sectorContext) => `
[DIRECTRIZ DE AUDITOR ATS ADAPTADO AL SECTOR: ${sectorContext.sectorLabel}]

Evalúa el CV para sistemas de filtro automático ATS considerando las particularidades del sector "${sectorContext.sectorLabel}".
Puesto objetivo evaluado: "${sectorContext.targetRole}".

CRITERIOS DE EVALUACIÓN SEGÚN EL SECTOR:
- No busques lenguajes de programación si no es un perfil IT.
- Evalúa la presencia de palabras clave de su industria: ${sectorContext.coreCompetencies.join(', ')}.
- Herramientas/licencias esperadas: ${sectorContext.technicalTools.join(', ')}.
- Claridad en títulos de puestos, fechas y secciones legibles por escáner.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "score": 80,
  "summary": "Resumen ejecutivo de la legibilidad ATS para el sector ${sectorContext.sectorLabel}.",
  "strengths": ["Punto fuerte 1 específico del sector", "Punto fuerte 2"],
  "weaknesses": ["Métrica o palabra clave del sector que falta 1", "Punto a mejorar 2"],
  "recommendations": ["Sugerencia concreta 1 para pasar filtros de ${sectorContext.targetRole}", "Sugerencia 2"]
}

--- CV A EVALUAR ---
${cvText}
`;