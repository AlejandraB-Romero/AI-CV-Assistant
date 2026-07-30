import { OLLAMA_CONFIG } from '../config/constants.js';

export class OllamaService {
  constructor(baseUrl = OLLAMA_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Comprueba si Ollama está activo
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        return { online: false, models: [] };
      }

      const data = await response.json();
      return {
        online: true,
        models: data.models || []
      };
    } catch (error) {
      console.warn('Ollama no detectado:', error.message);
      return { online: false, models: [] };
    }
  }

  async query(model, prompt) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false
        })
      });

      if (response.status === 404) {
        throw new Error(`El modelo "${model}" no está descargado. Ejecuta: ollama pull ${model}`);
      }

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: Verifica el estado de Ollama.`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('OllamaService Query Error:', error);
      throw error;
    }
  }
}