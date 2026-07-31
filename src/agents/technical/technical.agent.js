import { BaseAgent } from '../base.agent.js';
import { TECHNICAL_PROMPT } from './technical.prompt.js';

export class TechnicalAgent extends BaseAgent {
  async analyze(cvText, model, sectorContext) {
    const prompt = TECHNICAL_PROMPT(cvText, sectorContext);
    const result = await this.execute(model, prompt);

    return {
      score: result.score || 75,
      summary: result.summary || 'Análisis técnico de dominio completado.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  }
}