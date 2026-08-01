import { BaseAgent } from '../base.agent.js';
import { LINKEDIN_PROMPT } from './linkedin.prompt.js';

export class LinkedinAgent extends BaseAgent {
  async analyze(cvText, model, sectorContext) {
    const prompt = LINKEDIN_PROMPT(cvText, sectorContext);
    const result = await this.execute(model, prompt);

    const cleanList = (arr) => Array.isArray(arr) 
      ? arr.map(item => typeof item === 'object' && item !== null ? (item.detail || item.recommendation || item.weakness || item.text || JSON.stringify(item)) : String(item)) 
      : [];

    return {
      score: result.score || 70,
      summary: result.summary || 'Análisis de presencia en LinkedIn completado.',
      strengths: cleanList(result.strengths),
      weaknesses: cleanList(result.weaknesses),
      recommendations: cleanList(result.recommendations)
    };
  }
}