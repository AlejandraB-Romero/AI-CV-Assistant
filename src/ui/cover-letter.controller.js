export class CoverLetterController {
  constructor(app) {
    this.app = app;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.btnCoverLetterModal = document.getElementById('btnCoverLetterModal');
    this.coverLetterModal = document.getElementById('coverLetterModal');
    this.btnCloseCoverLetter = document.getElementById('btnCloseCoverLetter');
    
    this.targetCompanyInput = document.getElementById('targetCompanyInput');
    this.btnRegenerateCoverLetter = document.getElementById('btnRegenerateCoverLetter');
    this.coverLetterLoading = document.getElementById('coverLetterLoading');
    this.coverLetterContent = document.getElementById('coverLetterContent');

    this.subjectInput = document.getElementById('coverLetterSubject');
    this.greetingInput = document.getElementById('coverLetterGreeting');
    this.bodyContainer = document.getElementById('coverLetterBodyContainer');
    this.callToActionInput = document.getElementById('coverLetterCallToAction');
    this.signOffInput = document.getElementById('coverLetterSignOff');
    this.btnCopy = document.getElementById('btnCopyCoverLetter');
  }

  bindEvents() {
    if (this.btnCoverLetterModal) {
      this.btnCoverLetterModal.addEventListener('click', () => this.generateLetter());
    }
    if (this.btnCloseCoverLetter) {
      this.btnCloseCoverLetter.addEventListener('click', () => this.close());
    }
    if (this.btnRegenerateCoverLetter) {
      this.btnRegenerateCoverLetter.addEventListener('click', () => this.generateLetter());
    }
    if (this.btnCopy) {
      this.btnCopy.addEventListener('click', () => this.copyToClipboard());
    }
  }

  async generateLetter() {
    if (!this.app.lastAnalysisData) {
      alert('Por favor, ejecuta primero la orquestación para analizar el CV.');
      return;
    }

    this.open();
    this.coverLetterLoading.style.display = 'block';
    this.coverLetterContent.style.display = 'none';

    const cvText = this.app.getCVText();
    const model = this.app.modelInput.value;
    const targetCompany = this.targetCompanyInput?.value || '';

    const sectorContext = this.app.lastAnalysisData.sectorContext || {
      sectorLabel: 'General',
      targetRole: 'Profesional',
      candidateName: ''
    };

    try {
      const letterData = await this.app.orchestrator.generateCoverLetter(
        cvText,
        this.app.lastAnalysisData.finalSummaryText,
        model,
        sectorContext,
        targetCompany
      );

      this.renderData(letterData);
      this.coverLetterLoading.style.display = 'none';
      this.coverLetterContent.style.display = 'block';
    } catch (err) {
      alert(`Error al generar carta: ${err.message}`);
      this.close();
    }
  }

  renderData(data) {
    if (!data) return;

    this.subjectInput.value = data.subject || '';
    this.greetingInput.value = data.greeting || '';
    
    const paragraphs = Array.isArray(data.bodyParagraphs) ? data.bodyParagraphs : [];
    this.bodyContainer.innerHTML = paragraphs.map((p, idx) => `
      <textarea class="preview-textarea cover-p-${idx}" rows="3">${p}</textarea>
    `).join('');

    this.callToActionInput.value = data.callToAction || '';
    this.signOffInput.value = data.signOff || '';
  }

  copyToClipboard() {
    const pElements = this.bodyContainer.querySelectorAll('textarea');
    const pTexts = Array.from(pElements).map(el => el.value).join('\n\n');

    const fullText = `ASUNTO: ${this.subjectInput.value}\n\n${this.greetingInput.value}\n\n${pTexts}\n\n${this.callToActionInput.value}\n\n${this.signOffInput.value}`;

    navigator.clipboard.writeText(fullText).then(() => {
      alert('📋 ¡Carta de presentación copiada al portapapeles!');
    }).catch(err => {
      alert(`Error al copiar: ${err.message}`);
    });
  }

  open() {
    this.coverLetterModal.style.display = 'flex';
  }

  close() {
    this.coverLetterModal.style.display = 'none';
  }
}