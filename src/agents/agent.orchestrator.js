import { AGENT_PROMPTS } from './agent.prompts.js';

export class AgentOrchestrator {
  constructor(ollamaService) {
    this.ollama = ollamaService;
  }

  async runPipeline(cvText, model, onProgress) {
    onProgress('ATS_START');
    onProgress('RECRUITER_START');

    const [atsResult, recruiterResult] = await Promise.all([
      this.ollama.query(model, AGENT_PROMPTS.ATS(cvText)).then(res => {
        onProgress('ATS_DONE', res);
        return res;
      }),
      this.ollama.query(model, AGENT_PROMPTS.RECRUITER(cvText)).then(res => {
        onProgress('RECRUITER_DONE', res);
        return res;
      })
    ]);

    onProgress('SUMMARY_START');
    const summaryResult = await this.ollama.query(
      model,
      AGENT_PROMPTS.ORCHESTRATOR(atsResult, recruiterResult)
    );
    onProgress('SUMMARY_DONE', summaryResult);

    return { ats: atsResult, recruiter: recruiterResult, summary: summaryResult };
  }
}