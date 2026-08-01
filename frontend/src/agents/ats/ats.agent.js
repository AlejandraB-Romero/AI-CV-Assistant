import { BaseAgent } from '../base.agent.js';
import { ATS_PROMPT } from './ats.prompt.js';

export class AtsAgent extends BaseAgent {
  async analyze(cvText, model, sectorContext) {
    const prompt = ATS_PROMPT(cvText, sectorContext);
    const result = await this.execute(model, prompt);

    return {
      score: result.score || 70,
      summary: result.summary || 'Análisis ATS completado.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  }
}