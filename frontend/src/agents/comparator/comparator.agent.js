import { BaseAgent } from '../base.agent.js';
import { COMPARATOR_PROMPT } from './comparator.prompt.js';

/**
 * ComparatorAgent.js
 * Agente encargado de ejecutar el análisis comparativo entre dos CVs usando Ollama.
 */
export class ComparatorAgent extends BaseAgent {
  /**
   * Ejecuta la comparación entre el CV viejo y el nuevo
   * @param {string} oldCv - Texto del CV original
   * @param {string} newCv - Texto del CV optimizado
   * @param {string} model - Nombre del modelo de Ollama
   */
  async compareCVs(oldCv, newCv, model) {
    const prompt = COMPARATOR_PROMPT(oldCv, newCv);
    const result = await this.execute(model, prompt);

    return {
      improvementScore: typeof result.improvementScore === 'number' ? result.improvementScore : 15,
      summary: result.summary || 'Comparación completada.',
      keyImprovements: Array.isArray(result.keyImprovements) ? result.keyImprovements : []
    };
  }
}