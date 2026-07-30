import { AGENT_PROMPTS } from './agent.prompts.js';

export class AgentOrchestrator {
  constructor(ollamaService) {
    this.ollama = ollamaService;
  }

  parseAgentResponse(rawText) {
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("No se pudo parsear JSON del agente:", e);
    }

    return {
      score: 70,
      summary: rawText,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  }

  async runPipeline(cvText, model, eventCallbacks, maxConcurrency = 2) {
    const { onLog, onAgentStatus, onComplete } = eventCallbacks;
    const startTime = performance.now();

    onLog('sys', 'Iniciando Pipeline Enterprise Multi-Agente...');
    onLog('sys', `Modelo: [${model}] | Concurrencia: [${maxConcurrency} agente(s) en paralelo]`);

    const agentKeys = ['ats', 'recruiter', 'grammar', 'technical', 'linkedin', 'career'];
    const results = {};

    // Mapeo de lotes según la concurrencia
    for (let i = 0; i < agentKeys.length; i += maxConcurrency) {
      const chunk = agentKeys.slice(i, i + maxConcurrency);

      const batchPromises = chunk.map(async (key) => {
        const agentName = key.toUpperCase();
        onAgentStatus(key, 'working', 'Procesando...');
        onLog('agent', `[${agentName}] Análisis iniciado...`);

        const agentStart = performance.now();
        try {
          const rawResponse = await this.ollama.query(model, AGENT_PROMPTS[agentName](cvText));
          const duration = ((performance.now() - agentStart) / 1000).toFixed(2);
          const parsedData = this.parseAgentResponse(rawResponse);
          results[key] = parsedData;

          onAgentStatus(key, 'done', `${parsedData.score}/100`, parsedData);
          onLog('agent', `[${agentName}] Completado en ${duration}s - Score: ${parsedData.score}/100`);
        } catch (err) {
          onAgentStatus(key, 'error', 'Error');
          onLog('error', `[${agentName}] Falló: ${err.message}`);
          results[key] = { score: 0, summary: `Error: ${err.message}`, strengths: [], weaknesses: [], recommendations: [] };
        }
      });

      await Promise.all(batchPromises);
    }

    // FASE FINAL: Sintetizador / Orquestador
    onAgentStatus('summary', 'working', 'Sintetizando...');
    onLog('orchestrator', 'Consolidando reportes e informando al Director de Talento...');

    const summaryStart = performance.now();
    const formattedResults = Object.entries(results)
      .map(([key, res]) => `--- AGENTE ${key.toUpperCase()} (Nota: ${res.score}/100) ---\nSummary: ${res.summary}`)
      .join('\n\n');

    let finalSummaryText = '';
    try {
      finalSummaryText = await this.ollama.query(model, AGENT_PROMPTS.ORCHESTRATOR(formattedResults));
      const summaryDuration = ((performance.now() - summaryStart) / 1000).toFixed(2);
      onAgentStatus('summary', 'done', 'Finalizado', { summary: finalSummaryText });
      onLog('orchestrator', `Plan de Acción consolidado generado en ${summaryDuration}s.`);
    } catch (err) {
      onAgentStatus('summary', 'error', 'Error');
      onLog('error', `[SUMMARY] Falló la síntesis: ${err.message}`);
    }

    const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
    const validScores = Object.values(results).map(r => r.score).filter(s => s > 0);
    const globalScore = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

    onLog('sys', `Pipeline finalizado en ${totalDuration}s. Nota global: ${globalScore}/100.`);

    const payload = {
      globalScore,
      totalDuration,
      results,
      finalSummaryText,
      model
    };

    if (onComplete) onComplete(payload);
    return payload;
  }

  async compareCVs(oldCvText, newCvText, model) {
    const prompt = AGENT_PROMPTS.COMPARATOR(oldCvText, newCvText);
    const rawResponse = await this.ollama.query(model, prompt);
    return this.parseAgentResponse(rawResponse);
  }
}

