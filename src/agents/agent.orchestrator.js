import { ClassifierAgent } from './classifier/classifier.agent.js';
import { AtsAgent } from './ats/ats.agent.js';
import { TechnicalAgent } from './technical/technical.agent.js';
import { RecruiterAgent } from './recruiter/recruiter.agent.js';
import { GrammarAgent } from './grammar/grammar.agent.js';
import { LinkedinAgent } from './linkedin/linkedin.agent.js';
import { CareerAgent } from './career/career.agent.js';
import { RewriterAgent } from './rewriter/rewriter.agent.js';
import { InterviewAgent } from './interview/interview.agent.js';

export class AgentOrchestrator {
  constructor(ollamaService) {
    this.ollama = ollamaService;

    // Instanciación de todos los agentes modulares
    this.classifierAgent = new ClassifierAgent(ollamaService);
    this.atsAgent = new AtsAgent(ollamaService);
    this.technicalAgent = new TechnicalAgent(ollamaService);
    this.recruiterAgent = new RecruiterAgent(ollamaService);
    this.grammarAgent = new GrammarAgent(ollamaService);
    this.linkedinAgent = new LinkedinAgent(ollamaService);
    this.careerAgent = new CareerAgent(ollamaService);
    this.rewriterAgent = new RewriterAgent(ollamaService);
    this.interviewAgent = new InterviewAgent(ollamaService);
  }

  /**
   * Método auxiliar para parsear respuestas JSON o limpiar respuestas en texto
   */
  parseAgentResponse(rawText) {
    if (typeof rawText === 'object' && rawText !== null) {
      return rawText;
    }
    try {
      const jsonMatch = String(rawText).match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("No se pudo parsear JSON del agente:", e);
    }

    return {
      score: 70,
      summary: String(rawText),
      strengths: [],
      weaknesses: [],
      recommendations: [],
      actionPlan: []
    };
  }

  async runPipeline(cvText, model, eventCallbacks, maxConcurrency = 2) {
    const { onLog, onAgentStatus, onComplete } = eventCallbacks;
    const startTime = performance.now();

    onLog('sys', 'Iniciando Pipeline Enterprise Multi-Agente...');

    // --- FASE 0: CLASIFICACIÓN DINÁMICA DE SECTOR ---
    onLog('orchestrator', '🔎 Analizando perfil y clasificando sector profesional...');
    const sectorContext = await this.classifierAgent.analyze(cvText, model);
    onLog('sys', `Sector Detectado: [${sectorContext.sectorLabel}] | Puesto Objetivo: [${sectorContext.targetRole}]`);

    onLog('sys', `Modelo: [${model}] | Concurrencia: [${maxConcurrency} agente(s) en paralelo]`);

    const agentKeys = ['ats', 'recruiter', 'grammar', 'technical', 'linkedin', 'career'];
    const results = {};

    for (let i = 0; i < agentKeys.length; i += maxConcurrency) {
      const chunk = agentKeys.slice(i, i + maxConcurrency);

      const batchPromises = chunk.map(async (key) => {
        const agentName = key.toUpperCase();
        onAgentStatus(key, 'working', 'Procesando...');
        onLog('agent', `[${agentName}] Análisis iniciado...`);

        const agentStart = performance.now();
        try {
          let parsedData;

          // Enrutamiento directo hacia cada Agente Especializado
          switch (key) {
            case 'ats':
              parsedData = await this.atsAgent.analyze(cvText, model, sectorContext);
              break;
            case 'recruiter':
              parsedData = await this.recruiterAgent.analyze(cvText, model, sectorContext);
              break;
            case 'grammar':
              parsedData = await this.grammarAgent.analyze(cvText, model);
              break;
            case 'technical':
              parsedData = await this.technicalAgent.analyze(cvText, model, sectorContext);
              break;
            case 'linkedin':
              parsedData = await this.linkedinAgent.analyze(cvText, model, sectorContext);
              break;
            case 'career':
              parsedData = await this.careerAgent.analyze(cvText, model, sectorContext);
              break;
            default:
              parsedData = { score: 70, summary: 'Agente no registrado.' };
          }

          const duration = ((performance.now() - agentStart) / 1000).toFixed(2);
          results[key] = parsedData;

          onAgentStatus(key, 'done', `${parsedData.score || 70}/100`, parsedData);
          onLog('agent', `[${agentName}] Completado en ${duration}s - Score: ${parsedData.score || 70}/100`);
        } catch (err) {
          onAgentStatus(key, 'error', 'Error');
          onLog('error', `[${agentName}] Falló: ${err.message}`);
          results[key] = { score: 0, summary: `Error: ${err.message}`, strengths: [], weaknesses: [], recommendations: [] };
        }
      });

      await Promise.all(batchPromises);
    }

    // Cálculo de puntuación global
    const validScores = Object.values(results).map(r => r.score).filter(s => s > 0);
    const globalScore = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 70;

    // FASE FINAL: Sintetizador / Director de Talento
    onAgentStatus('summary', 'working', 'Sintetizando...');
    onLog('orchestrator', 'Consolidando reportes e informando al Director de Talento...');

    const summaryStart = performance.now();
    const formattedResults = Object.entries(results)
      .map(([key, res]) => `--- AGENTE ${key.toUpperCase()} (Nota: ${res.score || 70}/100) ---\nResumen: ${res.summary || ''}`)
      .join('\n\n');

    let parsedSummary = {};
    let finalSummaryText = '';

    try {
      const summaryPrompt = `Analiza y sintetiza los siguientes reportes de evaluación de CV para generar un Plan de Acción consolidado.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO EN ESPAÑOL:
{
  "score": 80,
  "summary": "Resumen ejecutivo global de la candidatura...",
  "strengths": ["Punto fuerte clave 1", "Punto fuerte clave 2"],
  "weaknesses": ["Área prioritaria de mejora 1", "Área prioritaria de mejora 2"],
  "recommendations": ["Paso estratégico 1", "Paso estratégico 2"],
  "actionPlan": ["Acción inmediata 1", "Acción inmediata 2"]
}

--- EVALUACIONES DE LOS AGENTES ---
${formattedResults}`;

      const rawSummary = await this.ollama.query(model, summaryPrompt);
      const summaryDuration = ((performance.now() - summaryStart) / 1000).toFixed(2);

      parsedSummary = this.parseAgentResponse(rawSummary);
      finalSummaryText = parsedSummary.summary || rawSummary;

      onAgentStatus('summary', 'done', 'Finalizado', parsedSummary);
      onLog('orchestrator', `Plan de Acción consolidado generado en ${summaryDuration}s.`);
    } catch (err) {
      onAgentStatus('summary', 'error', 'Error');
      onLog('error', `[SUMMARY] Falló la síntesis: ${err.message}`);

      parsedSummary = {
        score: globalScore,
        summary: "Se generaron las evaluaciones individuales de cada agente, pero la síntesis global falló.",
        strengths: [],
        weaknesses: [],
        recommendations: [],
        actionPlan: []
      };
      finalSummaryText = parsedSummary.summary;
    }

    const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
    onLog('sys', `Pipeline finalizado en ${totalDuration}s. Nota global: ${globalScore}/100.`);

    const payload = {
      globalScore,
      totalDuration,
      results,
      parsedSummary,
      finalSummaryText,
      targetRole: sectorContext.targetRole,
      sectorContext,
      model
    };

    if (onComplete) onComplete(payload);
    return payload;
  }

  async rewriteCV(cvText, summaryText, model, sectorContext) {
    return await this.rewriterAgent.rewrite(cvText, summaryText, model, sectorContext);
  }

  async compareCVs(oldCvText, newCvText, model) {
    const rawResponse = await this.ollama.query(model, `Compara estas dos versiones de CV y destaca las mejoras cuantitativas y cualitativas:\n\n--- ORIGINAL ---\n${oldCvText}\n\n--- NUEVO ---\n${newCvText}`);
    return this.parseAgentResponse(rawResponse);
  }

  async generateInterviewQuestions(cvText, model, sectorContext) {
    return await this.interviewAgent.generateQuestions(cvText, model, sectorContext);
  }
}