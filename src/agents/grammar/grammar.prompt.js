export const GRAMMAR_PROMPT = (cvText) => `
[DIRECTRIZ DE AUDITOR DE GRAMÁTICA, ORTOGRAFÍA Y ESTILO]

Analiza la calidad formal del texto del CV: ortografía, gramática, tono profesional y consistencia verbal.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "score": 90,
  "summary": "Resumen del estado gramatical y ortográfico del documento.",
  "strengths": ["Buena sintaxis general", "Tono profesional adecuado"],
  "weaknesses": ["Erratas o incoherencias encontradas"],
  "recommendations": ["Corrección ortográfica o mejora de estilo 1"]
}

--- CV A EVALUAR ---
${cvText}
`;