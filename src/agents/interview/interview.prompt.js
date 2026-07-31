export const INTERVIEW_PROMPT = (cvText, sectorContext) => `
[DIRECTRIZ DE PREPARACIÓN DE ENTREVISTA ADAPTADA AL SECTOR: ${sectorContext.sectorLabel}]

Genera una simulación de entrevista de trabajo altamente relevante para la posición "${sectorContext.targetRole}" dentro del sector "${sectorContext.sectorLabel}".
Incluye la pregunta estrella (Gold Question), el consejo del reclutador y 3 preguntas situacionales guiadas por la técnica STAR.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "goldQuestion": "¿Cuál es la pregunta más importante y desafiante que te harán para este rol de ${sectorContext.targetRole}?",
  "goldTip": "Consejo específico para responder la pregunta estrella en el sector de ${sectorContext.sectorLabel}.",
  "questions": [
    {
      "question": "Pregunta 1 relevante para el sector",
      "type": "Técnica / Operativa",
      "starGuide": {
        "situation": "Ejemplo de situación que deberías plantear...",
        "task": "La responsabilidad o reto que asumiste...",
        "action": "La herramienta o procedimiento que aplicaste...",
        "result": "El resultado cuantitativo o logro alcanzado..."
      }
    },
    {
      "question": "Pregunta 2 sobre trabajo en equipo o resolución de problemas",
      "type": "Conductual",
      "starGuide": {
        "situation": "Situación de conflicto o presión...",
        "task": "Tu función ante la crisis...",
        "action": "Cómo lo resolviste...",
        "result": "Impacto positivo final..."
      }
    }
  ]
}

--- CV DEL CANDIDATO ---
${cvText}
`;