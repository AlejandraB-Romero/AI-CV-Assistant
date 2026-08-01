import { BaseAgent } from '../base.agent.js';
import { RECRUITER_PROMPT } from './recruiter.prompt.js';

export class RecruiterAgent extends BaseAgent {
  async analyze(cvText, model, sectorContext) {
    const prompt = RECRUITER_PROMPT(cvText, sectorContext);
    const result = await this.execute(model, prompt);

    return {
      score: result.score || 75,
      summary: result.summary || 'Análisis de reclutamiento completado.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  }
}