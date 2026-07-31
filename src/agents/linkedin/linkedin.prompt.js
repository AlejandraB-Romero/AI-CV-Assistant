export const LINKEDIN_PROMPT = (cvText, sectorContext) => `
[DIRECTRIZ DE ESTRATEGA DE LINKEDIN Y MARCA PERSONAL PARA: ${sectorContext.sectorLabel}]

Analiza cómo este CV puede traducirse a una presencia optimizada en LinkedIn dentro de su sector "${sectorContext.sectorLabel}".

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "score": 75,
  "summary": "Recomendaciones para potenciar el perfil en LinkedIn.",
  "strengths": ["Titular o competencias destacables para el perfil social"],
  "weaknesses": ["Secciones del perfil social que faltan por trabajar"],
  "recommendations": ["Sugerencia de titular en LinkedIn", "Palabras clave para incluir en el extracto"]
}

--- CV A EVALUAR ---
${cvText}
`;