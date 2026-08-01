import { BaseAgent } from '../base.agent.js';
import { CLASSIFIER_PROMPT } from './classifier.prompt.js';

export class ClassifierAgent extends BaseAgent {
  async analyze(cvText, model) {
    const prompt = CLASSIFIER_PROMPT(cvText);
    const result = await this.execute(model, prompt);

    return {
      detectedSector: result.detectedSector || 'ADMIN_GENERAL',
      sectorLabel: result.sectorLabel || 'General / Multidisciplinar',
      candidateName: result.candidateName || 'Candidato',
      targetRole: result.targetRole || 'Profesional',
      coreCompetencies: Array.isArray(result.coreCompetencies) ? result.coreCompetencies : [],
      technicalTools: Array.isArray(result.technicalTools) ? result.technicalTools : [],
      recommendedMetricsType: result.recommendedMetricsType || 'Logros cuantitativos generales.'
    };
  }
}