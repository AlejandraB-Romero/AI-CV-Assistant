import { BaseAgent } from '../base.agent.js';
import { GRAMMAR_PROMPT } from './grammar.prompt.js';

export class GrammarAgent extends BaseAgent {
  async analyze(cvText, model) {
    const prompt = GRAMMAR_PROMPT(cvText);
    const result = await this.execute(model, prompt);

    return {
      score: result.score || 85,
      summary: result.summary || 'Análisis de gramática completado.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  }
}