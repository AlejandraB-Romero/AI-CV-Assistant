export const REWRITER_PROMPT = (cvText, summaryText, sectorContext) => `
[DIRECTRIZ DE REESCRITURA ADAPTATIVA DE CV PARA EL SECTOR: ${sectorContext.sectorLabel}]

Tu objetivo es estructurar y optimizar el contenido del CV para generar una versión ejecutiva lista para exportar a Word.
Puesto objetivo: "${sectorContext.targetRole}".

REGLAS DE FORMATO SEGÚN SU SECTOR:
1. Si el candidato NO es del sector IT/Software:
   - En "projects": Si no hay proyectos de software, incluye proyectos clave de su área (ej. "Implementación de sistema de picking", "Apertura de tienda/restaurante", "Optimización de stock") o déjalo como un array vacío [].
   - En "techStack": Pon las herramientas/competencias clave operativas del sector (ej. ${sectorContext.technicalTools.join(', ')}).
2. Redacta la experiencia utilizando logros cuantitativos o descriptivos de alta relevancia para ${sectorContext.sectorLabel}.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL CON ESTA ESTRUCTURA EXACTA:
{
  "fullName": "${sectorContext.candidateName || 'Nombre Candidato'}",
  "targetRole": "${sectorContext.targetRole}",
  "aboutMe": "Perfil profesional redactado de forma convincente...",
  "contactInfo": {
    "email": "correo@ejemplo.com",
    "phone": "600000000",
    "location": "Ciudad, País",
    "linkedin": ""
  },
  "skills": [${sectorContext.coreCompetencies.map(c => `"${c}"`).join(', ')}],
  "techStack": [${sectorContext.technicalTools.map(t => `"${t}"`).join(', ')}],
  "tools": ["Licencia B", "Paquete Office"],
  "languages": ["Español (Nativo)", "Inglés (Intermedio)"],
  "experience": [
    {
      "role": "Puesto Ocupado",
      "company": "Nombre Empresa",
      "period": "Año Inicio - Año Fin",
      "achievements": [
        "Responsabilidad o logro clave 1",
        "Responsabilidad o logro clave 2"
      ]
    }
  ],
  "projects": [
    {
      "name": "Proyecto u Operativo Destacado",
      "techStack": "Herramientas usadas",
      "description": ["Descripción del logro u operativo"]
    }
  ],
  "education": [
    {
      "degree": "Título / Formación",
      "institution": "Centro Educativo",
      "period": "Año"
    }
  ],
  "certifications": ["Certificación o Licencia 1"]
}

--- NOTAS DE LA EVALUACIÓN PREVIA ---
${summaryText}

--- CV ORIGINAL ---
${cvText}
`;