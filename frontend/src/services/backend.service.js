/**
 * backend.service.js
 * Servicio encargado de la comunicación entre el Frontend JS y la API C# (ASP.NET Core).
 */
export class BackendService {
  constructor(baseUrl = 'http://localhost:5264/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Comprueba la conectividad con C# y Ollama
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health/ollama`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) return false;
      const data = await response.json().catch(() => ({}));
      return data.online === true || response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ejecuta la auditoría multi-agente
   */
  async runAuditPipeline(cvText, selectedModel) {
    if (!cvText || !cvText.trim()) {
      throw new Error('El texto del CV no puede estar vacío.');
    }

    const response = await fetch(`${this.baseUrl}/audit/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: cvText,
        model: selectedModel || 'llama3:latest'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error HTTP ${response.status} en Backend C#: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Genera la Carta de Presentación llamando a /api/audit/cover-letter
   */
  async generateCoverLetter(cvText, jobOfferText, selectedModel) {
    if (!cvText || !cvText.trim()) {
      throw new Error('El texto del CV no puede estar vacío.');
    }

    const response = await fetch(`${this.baseUrl}/audit/cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: cvText,
        jobOfferText: jobOfferText || '',
        model: selectedModel || 'llama3:latest'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status} al generar carta`);
    }

    return await response.json();
  }

  /**
   * Genera las Preguntas STAR llamando a /api/audit/interview
   */
  async generateStarInterview(cvText, selectedModel) {
    if (!cvText || !cvText.trim()) {
      throw new Error('El texto del CV no puede estar vacío.');
    }

    const response = await fetch(`${this.baseUrl}/audit/interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: cvText,
        model: selectedModel || 'llama3:latest'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status} al generar entrevista STAR`);
    }

    return await response.json();
  }

  /**
   * Compara un CV con una oferta de empleo
   */
  async compareCvWithJob(cvText, jobOfferText, selectedModel) {
    const response = await fetch(`${this.baseUrl}/audit/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: cvText,
        jobOfferText: jobOfferText,
        model: selectedModel || 'llama3:latest'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP ${response.status} al comparar CV`);
    }

    return await response.json();
  }
}