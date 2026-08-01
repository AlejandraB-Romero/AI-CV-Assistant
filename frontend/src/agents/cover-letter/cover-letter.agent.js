import { BaseAgent } from '../base.agent.js';
import { COVER_LETTER_PROMPT } from './cover-letter.prompt.js';

export class CoverLetterAgent extends BaseAgent {
  async generateLetter(cvText, summaryText, model, sectorContext, targetCompany = '') {
    const prompt = COVER_LETTER_PROMPT(cvText, summaryText, sectorContext, targetCompany);
    const result = await this.execute(model, prompt);

    return {
      subject: result.subject || `Candidatura ${sectorContext.targetRole}`,
      greeting: result.greeting || 'Estimado/a Responsable de Selección,',
      bodyParagraphs: Array.isArray(result.bodyParagraphs) ? result.bodyParagraphs : [],
      callToAction: result.callToAction || 'Quedo a su disposición para mantener una entrevista.',
      signOff: result.signOff || `Atentamente,\n${sectorContext.candidateName || ''}`
    };
  }
}