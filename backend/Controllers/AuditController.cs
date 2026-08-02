using AI.CV.Assistant.Backend.Models;
using AI.CV.Assistant.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace AI.CV.Assistant.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditController : ControllerBase
    {
        private readonly IOllamaService _ollamaService;
        private readonly ILmStudioService _lmStudioService;

        public AuditController(IOllamaService ollamaService, ILmStudioService lmStudioService)
        {
            _ollamaService = ollamaService;
            _lmStudioService = lmStudioService;
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunAudit([FromBody] AuditRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CvText))
            {
                return BadRequest(new { error = "El texto del CV no puede estar vacío." });
            }

            var startTime = DateTime.UtcNow;
            var cleanCvText = request.CvText.Trim();

            var prompt = $@"
Eres un experto auditor de Currículums Vitae. Analiza DETALLADAMENTE el texto del siguiente CV.
Debes evaluar 6 áreas obligatoriamente: ats, recruiter, grammar, technical, linkedin, career.

Instrucciones estrictas:
1. Responde ÚNICAMENTE con un objeto JSON válido. NO agregues texto antes ni después, NO uses bloques ```json.
2. Basándote EXCLUSIVAMENTE en el contenido real del CV proporcionado, calcula notas reales (0 a 100) y redacta críticas, puntos fuertes y recomendaciones personalizadas. NO uses frases genéricas de ejemplo.
3. Idioma: Español.

Estructura estricta del JSON esperado:
{{
  ""globalScore"": 82,
  ""summaryText"": ""Resumen personalizado de 2-3 frases analizando este candidato en particular."",
  ""results"": {{
    ""ats"": {{
      ""score"": 80,
      ""summary"": ""Análisis del formato ATS para este CV"",
      ""strengths"": [""Punto fuerte real 1""],
      ""weaknesses"": [""Debilidad real 1""],
      ""recommendations"": [""Recomendación real 1""]
    }},
    ""recruiter"": {{
      ""score"": 85,
      ""summary"": ""Visión de reclutador humano"",
      ""strengths"": [""Punto fuerte real 1""],
      ""weaknesses"": [""Debilidad real 1""],
      ""recommendations"": [""Recomendación real 1""]
    }},
    ""grammar"": {{
      ""score"": 90,
      ""summary"": ""Análisis de ortografía y tono"",
      ""strengths"": [""Punto fuerte real 1""],
      ""weaknesses"": [],
      ""recommendations"": []
    }},
    ""technical"": {{
      ""score"": 75,
      ""summary"": ""Evaluación del stack tecnológico detectado"",
      ""strengths"": [""Tecnología detectada 1""],
      ""weaknesses"": [""Tecnología ausente importante""],
      ""recommendations"": [""Recomendación técnica 1""]
    }},
    ""linkedin"": {{
      ""score"": 70,
      ""summary"": ""Potencial de adaptación a LinkedIn"",
      ""strengths"": [""Punto fuerte real 1""],
      ""weaknesses"": [""Debilidad real 1""],
      ""recommendations"": [""Recomendación real 1""]
    }},
    ""career"": {{
      ""score"": 88,
      ""summary"": ""Proyección de carrera y crecimiento"",
      ""strengths"": [""Punto fuerte real 1""],
      ""weaknesses"": [],
      ""recommendations"": [""Recomendación real 1""]
    }}
  }}
}}

CV REAL A EVALUAR:
{cleanCvText}
";

            try
            {
                string rawResponse;

                if (!string.IsNullOrEmpty(request.Model) && request.Model.ToLower().Contains("bonsai"))
                {
                    rawResponse = await _lmStudioService.GenerateCompletionAsync(prompt);
                }
                else
                {
                    var modelToUse = string.IsNullOrEmpty(request.Model) ? "llama3:latest" : request.Model;
                    rawResponse = await _ollamaService.GenerateAsync(modelToUse, prompt);
                }

                var totalDuration = Math.Round((DateTime.UtcNow - startTime).TotalSeconds, 2);

                return Ok(new
                {
                    status = "success",
                    durationSeconds = totalDuration,
                    rawResult = rawResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Error de procesamiento en C#: {ex.Message}" });
            }
        }

        [HttpPost("cover-letter")]
        public async Task<IActionResult> GenerateCoverLetter([FromBody] CoverLetterRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CvText))
            {
                return BadRequest(new { error = "El texto del CV no puede estar vacío." });
            }

            var cleanCvText = request.CvText.Trim();
            var targetCompany = string.IsNullOrWhiteSpace(request.JobOfferText) ? "la empresa seleccionada" : request.JobOfferText.Trim();

            var prompt = $@"
Eres un experto en redacción de cartas de presentación profesionales. Basándote en el siguiente CV y enfocado para la empresa o puesto '{targetCompany}', redacta una carta de presentación perspicaz y profesional.

Instrucciones:
Responde EXCLUSIVAMENTE con un objeto JSON válido. Sin bloques ```json o texto adicional.
Estructura JSON requerida:
{{
  ""subject"": ""Asunto sugerido para la candidatura"",
  ""greeting"": ""Estimado/a responsable de selección de {targetCompany},"",
  ""bodyParagraphs"": [
    ""Primer párrafo de introducción destacando el entusiasmo e interés por la posición..."",
    ""Segundo párrafo conectando la experiencia técnica y logros clave extraídos del CV..."",
    ""Tercer párrafo aportando propuesta de valor específica para el equipo...""
  ],
  ""callToAction"": ""Quedo a su entera disposición para mantener una entrevista personal."",
  ""signOff"": ""Atentamente,""
}}

CV DEL CANDIDATO:
{cleanCvText}
";

            try
            {
                var modelToUse = string.IsNullOrEmpty(request.Model) ? "llama3:latest" : request.Model;
                var rawResponse = await _ollamaService.GenerateAsync(modelToUse, prompt);

                return Ok(new
                {
                    status = "success",
                    rawResult = rawResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Error al generar carta en C#: {ex.Message}" });
            }
        }

        [HttpPost("interview")]
        public async Task<IActionResult> GenerateInterview([FromBody] AuditRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CvText))
            {
                return BadRequest(new { error = "El texto del CV no puede estar vacío." });
            }

            var cleanCvText = request.CvText.Trim();

            var prompt = $@"
Eres un reclutador experto y entrevistador técnico. Basándote en el siguiente CV, genera 5 preguntas clave de entrevista utilizando la metodología STAR (Situación, Tarea, Acción, Resultado).

Instrucciones:
Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura:
{{
  ""questions"": [
    {{
      ""id"": 1,
      ""category"": ""Técnica / Experiencia"",
      ""question"": ""Pregunta adaptada al CV..."",
      ""why"": ""Explicación de por qué se evalúa esto..."",
      ""starGuide"": {{
        ""situation"": ""Describe el proyecto o escenario..."",
        ""task"": ""Menciona tu rol exacto..."",
        ""action"": ""Destaca el uso de tecnologías o metodologías..."",
        ""result"": ""Aporta métricas o logros alcanzados...""
      }}
    }}
  ]
}}

CV DEL CANDIDATO:
{cleanCvText}
";

            try
            {
                var modelToUse = string.IsNullOrEmpty(request.Model) ? "llama3:latest" : request.Model;
                var rawResponse = await _ollamaService.GenerateAsync(modelToUse, prompt);

                return Ok(new
                {
                    status = "success",
                    rawResult = rawResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Error generando entrevista en C#: {ex.Message}" });
            }
        }
    }

    public class CoverLetterRequestDto : AuditRequestDto
    {
        public string? JobOfferText { get; set; }
    }
}