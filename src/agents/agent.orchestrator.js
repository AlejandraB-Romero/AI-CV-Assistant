import { AGENT_PROMPTS } from './agent.prompts.js';

export class AgentOrchestrator {
  constructor(ollamaService) {
    this.ollama = ollamaService;
  }

  /**
   * Intenta parsear el JSON generado por el agente.
   * Si falla, genera un objeto estructurado seguro de respaldo.
   */
  parseAgentResponse(rawText) {
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("No se pudo parsear JSON estricto del agente, usando fallback:", e);
    }

    return {
      score: 70,
      summary: rawText,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  }

  async runPipeline(cvText, model, eventCallbacks) {
    const { onLog, onAgentStatus, onComplete } = eventCallbacks;
    const startTime = performance.now();

    onLog('sys', 'Iniciando Pipeline Enterprise Multi-Agente...');
    onLog('sys', `Modelo asignado: [${model}]`);

    const agentKeys = ['ats', 'recruiter', 'grammar', 'technical', 'linkedin', 'career'];
    const results = {};

    // FASE 1: Ejecución paralela de los 6 agentes especialistas
    onLog('orchestrator', 'Despachando los 6 Agentes Especialistas en paralelo...');

    const agentPromises = agentKeys.map(async (key) => {
      const agentName = key.toUpperCase();
      onAgentStatus(key, 'working', 'Procesando...');
      onLog('agent', `[${agentName}] Análisis iniciado...`);

      const agentStart = performance.now();
      try {
        const promptFn = AGENT_PROMPTS[agentName];
        const rawResponse = await this.ollama.query(model, promptFn(cvText));
        const duration = ((performance.now() - agentStart) / 1000).toFixed(2);

        const parsedData = this.parseAgentResponse(rawResponse);
        results[key] = parsedData;

        onAgentStatus(key, 'done', `${parsedData.score}/100`, parsedData);
        onLog('agent', `[${agentName}] Completado en ${duration}s - Score: ${parsedData.score}/100`);
      } catch (err) {
        onAgentStatus(key, 'error', 'Error');
        onLog('error', `[${agentName}] Falló la ejecución: ${err.message}`);
        results[key] = { score: 0, summary: `Error: ${err.message}`, strengths: [], weaknesses: [], recommendations: [] };
      }
    });

    await Promise.all(agentPromises);

    // FASE 2: Síntesis del Orquestador
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
    
    // Cálculo de Nota Global Promedio
    const validScores = Object.values(results).map(r => r.score).filter(s => s > 0);
    const globalScore = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

    onLog('sys', `Pipeline finalizado exitosamente en ${totalDuration}s. Nota global: ${globalScore}/100.`);

    if (onComplete) {
      onComplete({
        globalScore,
        totalDuration,
        results,
        finalSummaryText
      });
    }

    return results;
  }
}