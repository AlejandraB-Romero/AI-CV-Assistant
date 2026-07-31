import { ComparatorAgent } from '../../agents/comparator/comparator.agent.js';

/**
 * comparator.component.js
 * Componente para comparar la versión antigua y nueva del CV y calcular el delta de mejora.
 */
export class ComparatorComponent {
  /**
   * @param {Object} appRef - Referencia a la app principal para acceder a Ollama u Orquestador
   */
  constructor(appRef) {
    this.app = appRef;
    this.comparatorAgent = new ComparatorAgent(appRef.ollamaService);
    this.initDOM();
    this.bindEvents();
  }

  /**
   * Captura de elementos DOM en la vista "view-comparator"
   */
  initDOM() {
    this.oldCvInput = document.getElementById('oldCvText');
    this.newCvInput = document.getElementById('newCvText');
    this.btnRunComparison = document.getElementById('btnRunComparison');
    this.resultCard = document.getElementById('compareResult');
    this.scoreBadge = document.getElementById('compareScoreBadge');
    this.outputContainer = document.getElementById('compareOutput');
  }

  /**
   * Eventos del botón de análisis
   */
  bindEvents() {
    if (this.btnRunComparison) {
      this.btnRunComparison.addEventListener('click', () => this.runComparison());
    }
  }

  /**
   * Ejecuta el análisis comparativo entre los dos textos de CV
   */
  async runComparison() {
    const oldText = this.oldCvInput?.value || '';
    const newText = this.newCvInput?.value || '';

    if (!oldText.trim() || !newText.trim()) {
      alert('Por favor, pega el texto de ambos CVs (Antiguo y Nuevo) para realizar la comparación.');
      return;
    }

    const model = this.app.modelInput.value;
    if (!model) return alert('Selecciona un modelo de Ollama.');

    this.btnRunComparison.disabled = true;
    this.btnRunComparison.textContent = '⏳ Analizando impacto de mejoras...';
    this.resultCard.style.display = 'block';
    this.outputContainer.textContent = 'Procesando comparación en tiempo real...';

    try {
      const result = await this.comparatorAgent.compareCVs(oldText, newText, model);

      // Renderizar porcentaje de mejora y reporte
      this.scoreBadge.textContent = `+${result.improvementScore || 0}% Mejora`;
      
      const strengths = Array.isArray(result.keyImprovements) ? result.keyImprovements : [];
      const summary = result.summary || 'Análisis comparativo completado.';

      this.outputContainer.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 0.75rem;">${summary}</div>
        ${strengths.length ? `
          <div style="font-weight: bold; color: var(--status-success); margin-bottom: 0.4rem;">🚀 Principales Mejoras Detectadas:</div>
          <ul class="bullet-list" style="padding-left: 1.2rem;">
            ${strengths.map(item => `<li>${typeof item === 'string' ? item : item.detail || JSON.stringify(item)}</li>`).join('')}
          </ul>
        ` : ''}
      `;
    } catch (err) {
      this.outputContainer.textContent = `Error al comparar: ${err.message}`;
    } finally {
      this.btnRunComparison.disabled = false;
      this.btnRunComparison.textContent = '⚡ Analizar Impacto y Delta de Mejora';
    }
  }
}