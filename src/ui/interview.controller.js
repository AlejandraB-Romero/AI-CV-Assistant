import { AGENT_PROMPTS } from '../agents/agent.prompts.js';

export class InterviewController {
  constructor(app) {
    this.app = app;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.btnInterviewModal = document.getElementById('btnInterviewModal');
    this.interviewModal = document.getElementById('interviewModal');
    this.btnCloseInterview = document.getElementById('btnCloseInterview');
    this.interviewLoading = document.getElementById('interviewLoading');
    this.interviewContent = document.getElementById('interviewContent');
    this.goldQuestionText = document.getElementById('goldQuestionText');
    this.goldTipText = document.getElementById('goldTipText');
    this.questionsContainer = document.getElementById('questionsContainer');
  }

  bindEvents() {
    if (this.btnInterviewModal) {
      this.btnInterviewModal.addEventListener('click', () => this.generateInterview());
    }
    if (this.btnCloseInterview) {
      this.btnCloseInterview.addEventListener('click', () => this.close());
    }
  }

  async generateInterview() {
    if (!this.app.lastAnalysisData) {
      alert('Por favor, ejecuta primero la orquestación para analizar el CV.');
      return;
    }

    this.open();
    this.interviewLoading.style.display = 'block';
    this.interviewContent.style.display = 'none';

    const cvText = this.app.getCVText();
    const model = this.app.modelInput.value;

    try {
      const prompt = AGENT_PROMPTS.INTERVIEW(cvText, this.app.lastAnalysisData.targetRole || '');
      const rawResponse = await this.app.ollamaService.query(model, prompt);
      const interviewData = this.app.orchestrator.parseAgentResponse(rawResponse);

      this.renderData(interviewData);
      this.interviewLoading.style.display = 'none';
      this.interviewContent.style.display = 'block';
    } catch (err) {
      alert(`Error al generar entrevista: ${err.message}`);
      this.close();
    }
  }

  renderData(data) {
    if (!data) return;

    this.goldQuestionText.textContent = data.goldQuestion || '¿Por qué deberíamos contratarte?';
    this.goldTipText.textContent = `💡 Consejo del Reclutador: ${data.goldTip || 'Enfócate en tu capacidad de aprendizaje rápido.'}`;

    if (Array.isArray(data.questions)) {
      this.questionsContainer.innerHTML = data.questions.map((q, idx) => `
        <div class="agent-card">
          <div class="agent-header">
            <div class="agent-title">❓ ${idx + 1}. ${q.question}</div>
            <span class="agent-status-badge" style="background: #2563eb; color: #fff;">${q.type || 'General'}</span>
          </div>
          <div style="margin-top: 0.75rem; font-size: 0.9rem;">
            <div style="margin-bottom: 0.3rem;"><strong style="color: #2563eb;">S (Situación):</strong> ${q.starGuide?.situation || ''}</div>
            <div style="margin-bottom: 0.3rem;"><strong style="color: #2563eb;">T (Tarea):</strong> ${q.starGuide?.task || ''}</div>
            <div style="margin-bottom: 0.3rem;"><strong style="color: #2563eb;">A (Acción):</strong> ${q.starGuide?.action || ''}</div>
            <div><strong style="color: #10b981;">R (Resultado):</strong> ${q.starGuide?.result || ''}</div>
          </div>
        </div>
      `).join('');
    }
  }

  open() {
    this.interviewModal.style.display = 'flex';
  }

  close() {
    this.interviewModal.style.display = 'none';
  }
}