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

  // En src/services/ollama.service.js
  async query(model, prompt) {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json' // <--- ESTO OBLIGA A OLLAMA A RESPETAR EL SCHEMA
      })
    });
    const data = await response.json();
    return data.response;
  }

}