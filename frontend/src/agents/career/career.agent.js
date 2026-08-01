import { BaseAgent } from '../base.agent.js';
import { CAREER_PROMPT } from './career.prompt.js';

export class CareerAgent extends BaseAgent {
  async analyze(cvText, model, sectorContext) {
    const prompt = CAREER_PROMPT(cvText, sectorContext);
    const result = await this.execute(model, prompt);

    const cleanList = (arr) => Array.isArray(arr) 
      ? arr.map(item => typeof item === 'object' && item !== null ? (item.detail || item.recommendation || item.weakness || item.text || JSON.stringify(item)) : String(item)) 
      : [];

    return {
      score: result.score || 75,
      summary: result.summary || 'Análisis de carrera profesional completado.',
      strengths: cleanList(result.strengths),
      weaknesses: cleanList(result.weaknesses),
      recommendations: cleanList(result.recommendations)
    };
  }
}