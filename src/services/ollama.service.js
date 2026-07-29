import { OLLAMA_CONFIG } from '../config/constants.js';

export class OllamaService {
  constructor(baseUrl = OLLAMA_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Comprueba si Ollama está respondiendo y devuelve la lista de modelos instalados.
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) return { online: false, models: [] };

      const data = await response.json();
      return {
        online: true,
        models: data.models || []
      };
    } catch (error) {
      return { online: false, models: [] };
    }
  }

  /**
   * Envía la petición de generación al modelo especificado.
   */
  async query(model, prompt) {
    try {
      // Normalizar nombre del modelo si no trae etiqueta :latest
      const modelName = model.includes(':') ? model : `${model}:latest`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          stream: false
        })
      });

      if (response.status === 404) {
        throw new Error(`El modelo "${modelName}" no está descargado en tu Ollama. Ejecuta en tu terminal: ollama pull ${model}`);
      }

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: Verifica el estado del servicio Ollama.`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('OllamaService Error:', error);
      throw error;
    }
  }
}