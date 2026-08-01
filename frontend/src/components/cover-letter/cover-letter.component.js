/**
 * cover-letter.component.js
 * Componente desacoplado para gestionar la generación y edición de la Carta de Presentación.
 */
export class CoverLetterComponent {
  /**
   * @param {Object} appRef - Referencia a la instancia principal de la app para coordinar datos u orquestador
   */
  constructor(appRef) {
    this.app = appRef;
    this.initDOM();
    this.bindEvents();
  }

  /**
   * Inicializar enlaces al DOM de la vista "view-cover-letter"
   */
  initDOM() {
    this.targetCompanyInput = document.getElementById('targetCompanyInput');
    this.btnRegenerate = document.getElementById('btnRegenerateCoverLetter');
    this.loadingWrapper = document.getElementById('coverLetterLoading');
    this.contentWrapper = document.getElementById('coverLetterContent');

    this.subjectInput = document.getElementById('coverLetterSubject');
    this.greetingInput = document.getElementById('coverLetterGreeting');
    this.bodyContainer = document.getElementById('coverLetterBodyContainer');
    this.callToActionInput = document.getElementById('coverLetterCallToAction');
    this.signOffInput = document.getElementById('coverLetterSignOff');
    this.btnCopy = document.getElementById('btnCopyCoverLetter');
  }

  /**
   * Registrar oyentes de eventos interactivos
   */
  bindEvents() {
    if (this.btnRegenerate) {
      this.btnRegenerate.addEventListener('click', () => this.generate());
    }

    if (this.btnCopy) {
      this.btnCopy.addEventListener('click', () => this.copyToClipboard());
    }
  }

  /**
   * Solicitar la redacción de la carta al orquestador
   */
  async generate() {
    if (!this.app.lastAnalysisData) {
      alert('Por favor, ejecuta primero la orquestación en la pestaña "Auditoría & Pipeline".');
      return;
    }

    // Mostrar spinner de carga
    this.loadingWrapper.style.display = 'block';
    this.contentWrapper.style.display = 'none';

    const cvText = this.app.getCVText();
    const model = this.app.modelInput.value;
    const targetCompany = this.targetCompanyInput?.value || '';
    const sectorContext = this.app.lastAnalysisData.sectorContext || {
      sectorLabel: 'General',
      targetRole: 'Profesional',
      candidateName: ''
    };

    try {
      const data = await this.app.orchestrator.generateCoverLetter(
        cvText,
        this.app.lastAnalysisData.finalSummaryText,
        model,
        sectorContext,
        targetCompany
      );

      this.render(data);
      this.loadingWrapper.style.display = 'none';
      this.contentWrapper.style.display = 'block';
    } catch (err) {
      alert(`Error al generar carta: ${err.message}`);
      this.loadingWrapper.style.display = 'none';
    }
  }

  /**
   * Pintar los campos editables del formulario con los datos devueltos por la IA
   */
  render(data) {
    if (!data) return;

    this.subjectInput.value = data.subject || '';
    this.greetingInput.value = data.greeting || '';
    
    const paragraphs = Array.isArray(data.bodyParagraphs) ? data.bodyParagraphs : [];
    this.bodyContainer.innerHTML = paragraphs.map((p, idx) => `
      <textarea class="preview-textarea cover-p-${idx}" rows="3" style="width: 100%;">${p}</textarea>
    `).join('');

    this.callToActionInput.value = data.callToAction || '';
    this.signOffInput.value = data.signOff || '';
  }

  /**
   * Copiar el texto concatenado al portapapeles del navegador
   */
  copyToClipboard() {
    const textareas = this.bodyContainer.querySelectorAll('textarea');
    const paragraphsText = Array.from(textareas).map(ta => ta.value).join('\n\n');

    const fullLetter = `ASUNTO: ${this.subjectInput.value}\n\n${this.greetingInput.value}\n\n${paragraphsText}\n\n${this.callToActionInput.value}\n\n${this.signOffInput.value}`;

    navigator.clipboard.writeText(fullLetter)
      .then(() => alert('📋 ¡Carta copiada exitosamente al portapapeles!'))
      .catch(err => alert(`Error al copiar: ${err.message}`));
  }
}