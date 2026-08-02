/**
 * cover-letter.component.js
 * Componente para gestionar la generación y edición de la Carta de Presentación via C#.
 */
export class CoverLetterComponent {
  constructor(appRef) {
    this.app = appRef;
  }

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

  bindEvents() {
    if (this.btnRegenerate) {
      this.btnRegenerate.addEventListener('click', () => this.generate());
    }

    if (this.btnCopy) {
      this.btnCopy.addEventListener('click', () => this.copyToClipboard());
    }
  }

  async generate() {
    const cvText = this.app.getCVText();
    if (!cvText || !cvText.trim()) {
      alert('Por favor, proporciona o sube un CV en el Dashboard antes de generar la carta.');
      return;
    }

    if (this.loadingWrapper) this.loadingWrapper.style.display = 'block';
    if (this.contentWrapper) this.contentWrapper.style.display = 'none';

    const model = this.app.modelInput?.value || 'llama3:latest';
    const targetCompany = this.targetCompanyInput?.value || '';

    try {
      this.app.addLog('sys', 'Generando Carta de Presentación desde C#...');
      
      const response = await this.app.backendService.generateCoverLetter(cvText, targetCompany, model);
      
      let rawResult = response.rawResult || response;
      let rawStr = typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult);
      
      // Extraer únicamente el bloque JSON { ... }
      const match = rawStr.match(/\{[\s\S]*\}/);
      let cleanJson = match ? match[0] : rawStr;

      let data = {};
      try {
        cleanJson = cleanJson.replace(/[\r\n]+/g, " ");
        data = JSON.parse(cleanJson);
      } catch (e) {
        data = {
          subject: 'Candidatura Profesional',
          greeting: 'Estimado/a responsable de selección,',
          bodyParagraphs: [rawStr.replace(/\{|\}|"subject"|"greeting"|"bodyParagraphs"|"callToAction"|"signOff"/g, '')],
          callToAction: 'Quedo a su entera disposición para mantener una entrevista.',
          signOff: 'Atentamente,'
        };
      }

      this.render(data);
      if (this.loadingWrapper) this.loadingWrapper.style.display = 'none';
      if (this.contentWrapper) this.contentWrapper.style.display = 'block';
      
      this.app.addLog('sys', '✅ Carta de Presentación generada con éxito.');
    } catch (err) {
      alert(`Error al generar carta: ${err.message}`);
      if (this.loadingWrapper) this.loadingWrapper.style.display = 'none';
    }
  }

  render(data) {
    if (!data) return;

    if (this.subjectInput) this.subjectInput.value = data.subject || 'Candidatura Profesional';
    if (this.greetingInput) this.greetingInput.value = data.greeting || 'Estimado/a equipo de selección,';
    
    const paragraphs = Array.isArray(data.bodyParagraphs) ? data.bodyParagraphs : [data.bodyParagraphs || ''];
    if (this.bodyContainer) {
      this.bodyContainer.innerHTML = paragraphs.map((p, idx) => `
        <textarea class="preview-textarea cover-p-${idx}" rows="3" style="width: 100%; margin-bottom: 0.5rem; background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 0.5rem;">${p}</textarea>
      `).join('');
    }

    if (this.callToActionInput) this.callToActionInput.value = data.callToAction || 'Agradezco de antemano su tiempo y consideración.';
    if (this.signOffInput) this.signOffInput.value = data.signOff || 'Atentamente,';
  }

  copyToClipboard() {
    if (!this.bodyContainer) return;
    const textareas = this.bodyContainer.querySelectorAll('textarea');
    const paragraphsText = Array.from(textareas).map(ta => ta.value).join('\n\n');

    const fullLetter = `ASUNTO: ${this.subjectInput?.value || ''}\n\n${this.greetingInput?.value || ''}\n\n${paragraphsText}\n\n${this.callToActionInput?.value || ''}\n\n${this.signOffInput?.value || ''}`;

    navigator.clipboard.writeText(fullLetter)
      .then(() => alert('📋 ¡Carta copiada al portapapeles!'))
      .catch(err => alert(`Error al copiar: ${err.message}`));
  }
}