import { BaseAgent } from '../base.agent.js';
import { REWRITER_PROMPT } from './rewriter.prompt.js';

export class RewriterAgent extends BaseAgent {
  async rewrite(cvText, summaryText, model, sectorContext) {
    const prompt = REWRITER_PROMPT(cvText, summaryText, sectorContext);
    const result = await this.execute(model, prompt);

    return {
      fullName: result.fullName || sectorContext.candidateName || 'Candidato',
      targetRole: result.targetRole || sectorContext.targetRole || 'Profesional',
      aboutMe: result.aboutMe || '',
      contactInfo: result.contactInfo || {},
      skills: Array.isArray(result.skills) ? result.skills : [],
      techStack: Array.isArray(result.techStack) ? result.techStack : [],
      tools: Array.isArray(result.tools) ? result.tools : [],
      languages: Array.isArray(result.languages) ? result.languages : [],
      experience: Array.isArray(result.experience) ? result.experience : [],
      projects: Array.isArray(result.projects) ? result.projects : [],
      education: Array.isArray(result.education) ? result.education : [],
      certifications: Array.isArray(result.certifications) ? result.certifications : []
    };
  }
}