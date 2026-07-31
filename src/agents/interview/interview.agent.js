import { BaseAgent } from '../base.agent.js';
import { INTERVIEW_PROMPT } from './interview.prompt.js';

export class InterviewAgent extends BaseAgent {
  async generateQuestions(cvText, model, sectorContext) {
    const prompt = INTERVIEW_PROMPT(cvText, sectorContext);
    const result = await this.execute(model, prompt);

    return {
      goldQuestion: result.goldQuestion || '¿Por qué deberíamos contratarte para este puesto?',
      goldTip: result.goldTip || 'Destaca tus logros más cuantitativos y tu capacidad de adaptación.',
      questions: Array.isArray(result.questions) ? result.questions : []
    };
  }
}