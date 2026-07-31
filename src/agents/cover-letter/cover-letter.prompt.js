export const COVER_LETTER_PROMPT = (cvText, summaryText, sectorContext, targetCompany = '') => `
[DIRECTRIZ DE REDACCIÓN DE CARTA DE PRESENTACIÓN EJECUTIVA PARA EL SECTOR: ${sectorContext.sectorLabel}]

Tu objetivo es redactar una Carta de Presentación profesional, persuasiva y adaptada al sector "${sectorContext.sectorLabel}".
Puesto objetivo: "${sectorContext.targetRole}".
${targetCompany ? `Empresa destino: "${targetCompany}".` : ''}

REGLAS DE REDACCIÓN:
1. Tono profesional, enfocado en el valor que el candidato aporta al sector.
2. Destaca 2 o 3 logros claves o competencias del CV.
3. Estructura estándar:
   - Saludo formal.
   - Introducción impactante declarando el interés en el puesto de ${sectorContext.targetRole}.
   - Cuerpo demostrando alineación de experiencia/competencias con las necesidades del sector.
   - Llamada a la acción solicitando una entrevista personal.
   - Despedida formal.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "subject": "Candidatura para el puesto de ${sectorContext.targetRole} - ${sectorContext.candidateName || 'Candidato'}",
  "greeting": "Estimado/a Responsable de Selección,",
  "bodyParagraphs": [
    "Párrafo 1: Presentación e interés en el puesto...",
    "Párrafo 2: Valor añadido y logros destacados del candidato...",
    "Párrafo 3: Por qué encaja en la filosofía y necesidades del sector..."
  ],
  "callToAction": "Agradezco de antemano su tiempo y consideración...",
  "signOff": "Atentamente,\n${sectorContext.candidateName || 'El Candidato'}"
}

--- NOTAS DE EVALUACIÓN PREVIA ---
${summaryText}

--- CV DEL CANDIDATO ---
${cvText}
`;