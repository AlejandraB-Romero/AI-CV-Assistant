/**
 * interview.component.js
 * Componente modular encargado de gestionar el simulador de entrevistas STAR.
 * Muestra la Pregunta de Oro (desafío principal) y el banco de preguntas por competencias.
 */
export class InterviewComponent {
  /**
   * @param {Object} appRef - Referencia al controlador principal de la aplicación
   */
  constructor(appRef) {
    this.app = appRef;
    this.initDOM();
  }

  /**
   * Enlaces con el DOM de la vista "view-interview"
   */
  initDOM() {
    this.loadingWrapper = document.getElementById('interviewLoading');
    this.contentWrapper = document.getElementById('interviewContent');
    this.goldQuestionText = document.getElementById('goldQuestionText');
    this.goldTipText = document.getElementById('goldTipText');
    this.questionsContainer = document.getElementById('questionsContainer');
  }

  /**
   * Genera el banco de preguntas mediante el orquestador
   */
  async generate() {
    if (!this.app.lastAnalysisData) {
      alert('Por favor, ejecuta primero la orquestación en la pestaña "Auditoría & Pipeline".');
      return;
    }

    // Mostrar estado de carga
    this.loadingWrapper.style.display = 'block';
    this.contentWrapper.style.display = 'none';

    const cvText = this.app.getCVText();
    const model = this.app.modelInput.value;
    const sectorContext = this.app.lastAnalysisData.sectorContext || {
      sectorLabel: 'General',
      targetRole: 'Profesional'
    };

    try {
      const interviewData = await this.app.orchestrator.generateInterviewQuestions(
        cvText,
        this.app.lastAnalysisData.finalSummaryText,
        model,
        sectorContext
      );

      this.render(interviewData);
      this.loadingWrapper.style.display = 'none';
      this.contentWrapper.style.display = 'block';
    } catch (err) {
      alert(`Error al generar entrevista: ${err.message}`);
      this.loadingWrapper.style.display = 'none';
    }
  }

  /**
   * Pinta la Pregunta de Oro y la lista de preguntas con método STAR
   */
  render(data) {
    if (!data) return;

    // 1. Pregunta de Oro (Desafío)
    if (data.goldQuestion) {
      this.goldQuestionText.textContent = data.goldQuestion.question || '---';
      this.goldTipText.textContent = `💡 Consejo de preparación: ${data.goldQuestion.tip || 'Prepara un ejemplo concreto.'}`;
    }

    // 2. Banco de Preguntas STAR
    const questions = Array.isArray(data.questions) ? data.questions : [];
    
    if (questions.length === 0) {
      this.questionsContainer.innerHTML = '<p style="color: var(--text-muted);">No se generaron preguntas adicionales.</p>';
      return;
    }

    this.questionsContainer.innerHTML = questions.map((q, idx) => `
      <div class="agent-card" style="border-left: 4px solid var(--accent-primary);">
        <div class="agent-header" style="margin-bottom: 0.5rem;">
          <div class="agent-title" style="font-size: 1rem; font-weight: bold;">
            ❓ Pregunta ${idx + 1}: ${q.question}
          </div>
          <span class="agent-status-badge" style="background: var(--bg-hover); color: var(--accent-primary);">
            ${q.category || 'Competencia'}
          </span>
        </div>

        <div style="background: var(--bg-main); padding: 0.85rem; border-radius: var(--radius-md); margin-top: 0.5rem;">
          <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-main); margin-bottom: 0.4rem;">
            🎯 Guía de Respuesta STAR:
          </div>
          <ul style="font-size: 0.85rem; color: var(--text-muted); margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;">
            <li><strong>S (Situación):</strong> ${q.starGuide?.situation || 'Describe el contexto.'}</li>
            <li><strong>T (Tarea):</strong> ${q.starGuide?.task || '¿Cuál era tu responsabilidad?'}</li>
            <li><strong>A (Acción):</strong> ${q.starGuide?.action || '¿Qué pasos concretos diste?'}</li>
            <li><strong>R (Resultado):</strong> ${q.starGuide?.result || '¿Qué impacto o logro conseguiste?'}</li>
          </ul>
        </div>
      </div>
    `).join('');
  }
}