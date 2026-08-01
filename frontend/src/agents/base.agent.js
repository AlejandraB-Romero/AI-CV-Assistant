import { BonsaiService } from '../services/bonsai.service.js';

/**
 * base.agent.js
 * Clase base para todos los agentes de evaluación.
 * Enruta las peticiones hacia Ollama local o hacia Bonsai 27B Cloud.
 */
export class BaseAgent {
  constructor(ollamaService) {
    this.ollamaService = ollamaService;
    this.bonsaiService = new BonsaiService();
  }

  /**
   * Ejecuta el prompt en el modelo seleccionado (Ollama local o Bonsai 27B)
   * @param {string} model - Nombre del modelo seleccionado
   * @param {string} prompt - Prompt formateado para el agente
   */
  async execute(model, prompt) {
    let responseText = '';

    // Si el usuario eligió Bonsai 27B en el desplegable
    if (model === 'prism-ml/bonsai-27b') {
      responseText = await this.bonsaiService.generateCompletion(prompt);
    } else {
      // Si el usuario eligió un modelo local de Ollama
      responseText = await this.ollamaService.generate(model, prompt);
    }

    return this.parseJSONResponse(responseText);
  }

  /**
   * Limpia bloques de código markdown y convierte la respuesta a objeto JSON
   * @param {string|Object} text - Texto devuelto por el LLM
   */
  parseJSONResponse(text) {
    if (typeof text === 'object' && text !== null) {
      return text;
    }

    if (typeof text !== 'string') {
      return { summary: String(text) };
    }

    try {
      // Limpieza de bloques ```json ... ```
      const cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      return JSON.parse(cleanText);
    } catch (err) {
      console.warn('No se pudo parsear el JSON de la IA, devolviendo texto plano:', err);
      return { summary: text };
    }
  }
}