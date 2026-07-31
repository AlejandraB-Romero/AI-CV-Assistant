export class ComparatorController {
  constructor(app) {
    this.app = app;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.btnCompareModal = document.getElementById('btnCompareModal');
    this.compareModal = document.getElementById('compareModal');
    this.btnCloseCompare = document.getElementById('btnCloseCompare');
    this.btnRunComparison = document.getElementById('btnRunComparison');
    this.oldCvText = document.getElementById('oldCvText');
    this.newCvText = document.getElementById('newCvText');
    this.compareResult = document.getElementById('compareResult');
    this.compareScoreBadge = document.getElementById('compareScoreBadge');
    this.compareOutput = document.getElementById('compareOutput');
  }

  bindEvents() {
    if (this.btnCompareModal) {
      this.btnCompareModal.addEventListener('click', () => this.open());
    }
    if (this.btnCloseCompare) {
      this.btnCloseCompare.addEventListener('click', () => this.close());
    }
    if (this.btnRunComparison) {
      this.btnRunComparison.addEventListener('click', () => this.runComparison());
    }
  }

  async runComparison() {
    const oldText = this.oldCvText.value.trim();
    const newText = this.newCvText.value.trim();
    const model = this.app.modelInput.value;

    if (!oldText || !newText) {
      alert('Por favor, pega el contenido de ambos CVs para realizar la comparación.');
      return;
    }

    this.btnRunComparison.disabled = true;
    this.btnRunComparison.textContent = '⏳ Comparando versiones con IA...';
    this.compareResult.style.display = 'block';
    this.compareOutput.textContent = 'Analizando diferencias e impacto...';

    try {
      const data = await this.app.orchestrator.compareCVs(oldText, newText, model);

      this.compareScoreBadge.textContent = `+${data.improvementScore || 0}% Mejora Estimada`;
      this.compareOutput.innerHTML = `
        <strong>${data.summary || ''}</strong>
        <p style="margin-top:0.5rem;"><strong>Veredicto:</strong> ${data.verdict || ''}</p>
        
        ${data.resolvedIssues && data.resolvedIssues.length ? `
          <div class="card-section-title" style="color: var(--status-success);">Puntos Corregidos / Ganados:</div>
          <ul class="bullet-list">${data.resolvedIssues.map(i => `<li>${i}</li>`).join('')}</ul>
        ` : ''}

        ${data.remainingGaps && data.remainingGaps.length ? `
          <div class="card-section-title" style="color: var(--status-warning);">Detalles aún por Pulir:</div>
          <ul class="bullet-list">${data.remainingGaps.map(g => `<li>${g}</li>`).join('')}</ul>
        ` : ''}
      `;
    } catch (err) {
      this.compareOutput.textContent = `Error al comparar: ${err.message}`;
    } finally {
      this.btnRunComparison.disabled = false;
      this.btnRunComparison.textContent = '⚡ Analizar Impacto y Delta de Mejora';
    }
  }

  open() {
    this.compareModal.style.display = 'flex';
  }

  close() {
    this.compareModal.style.display = 'none';
  }
}