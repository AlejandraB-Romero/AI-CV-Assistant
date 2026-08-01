import { API_CONFIG } from '../config/api.config.js';

export class BonsaiService {
  constructor() {
    this.apiKey = API_CONFIG.BONSAI.API_KEY;
    this.baseUrl = API_CONFIG.BONSAI.BASE_URL;
    this.modelName = API_CONFIG.BONSAI.MODEL;
  }

  async generateCompletion(promptText, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto auditor de CVs e IA para selección de personal. Devuelve las respuestas en el formato solicitado (JSON cuando aplique).'
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          temperature: options.temperature || 0.2
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status} en LM Studio: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err) {
      console.error('Error al conectar con LM Studio:', err);
      throw new Error(`Asegúrate de haber pulsado "Start Server" en la pestaña Local Model API de LM Studio. (${err.message})`);
    }
  }
}