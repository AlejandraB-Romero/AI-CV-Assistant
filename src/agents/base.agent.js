import { MODELS_CONFIG } from '../config/models.config.js';

export class BaseAgent {
  constructor(ollamaService) {
    this.ollama = ollamaService;
  }

  /**
   * Ejecuta la consulta a Ollama con reintentos y tolerancia a fallos
   */
  async execute(model, prompt) {
    let retries = 0;
    const maxRetries = MODELS_CONFIG.maxRetries || 2;

    while (retries <= maxRetries) {
      try {
        const rawResponse = await this.ollama.query(model, prompt);
        const parsed = this.parseJSON(rawResponse);

        if (parsed) {
          return parsed;
        }

        console.warn(`[${this.constructor.name}] JSON inválido en intento ${retries + 1}. Reintentando...`);
      } catch (err) {
        console.error(`[${this.constructor.name}] Error en intento ${retries + 1}: ${err.message}`);
      }

      retries++;
    }

    // Respuesta degradada de emergencia si todo falla
    return this.getFallbackResponse();
  }

  /**
   * Intenta extraer y parsear un objeto JSON de la respuesta del LLM
   */
  parseJSON(rawText) {
    try {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Estructura por defecto en caso de fallo crítico
   */
  getFallbackResponse() {
    return {
      score: 60,
      summary: 'No se pudo completar el análisis detallado para esta sección.',
      strengths: [],
      weaknesses: ['Error temporal de procesamiento en el modelo local.'],
      recommendations: ['Reintentar la orquestación o seleccionar un modelo más ligero.']
    };
  }
}