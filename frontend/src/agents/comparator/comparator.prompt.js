/**
 * comparator.prompt.js
 * Plantilla de prompt para solicitar la comparación evolutiva entre dos CVs.
 */
export const COMPARATOR_PROMPT = (oldCv, newCv) => `
[DIRECTRIZ DE EVALUACIÓN COMPARATIVA Y EVOLUTIVA DE CV]

Compara la versión ANTIGUA del CV con la versión NUEVA optimizada.
Calcula el porcentaje estimado de mejora (+0% a +100%) y resume los avances clave.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL CON ESTE FORMATO:
{
  "improvementScore": 25,
  "summary": "Resumen ejecutivo explicando los avances logrados...",
  "keyImprovements": [
    "Punto 1 corregido o mejorado...",
    "Punto 2 destacado..."
  ]
}

--- CV ANTIGUO (BASE) ---
${oldCv}

--- CV NUEVO (OPTIMIZADO) ---
${newCv}
`;