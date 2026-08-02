/**
 * InterviewComponent.js
 * Gestiona la vista y generación de preguntas STAR conectándose al Backend C#
 */
export class InterviewComponent {
  constructor(appCtrl) {
    this.appCtrl = appCtrl;
    this.container = null;
    this.btnGenerate = null;
  }

  initDOM() {
    this.container = document.getElementById('interviewContainer');
    this.btnGenerate = document.getElementById('btnGenerateInterview');

    if (this.btnGenerate) {
      // Evitar listeners duplicados borrando y reasignando
      this.btnGenerate.onclick = () => this.generateInterview();
    }
  }

  async generateInterview() {
    const cvText = this.appCtrl.getCVText();
    if (!cvText || !cvText.trim()) {
      return alert('Por favor, proporciona primero un CV (PDF o Texto plano).');
    }

    const model = this.appCtrl.modelInput?.value || 'llama3:latest';

    if (this.btnGenerate) {
      this.btnGenerate.disabled = true;
      this.btnGenerate.textContent = '⏳ Generando Preguntas STAR...';
    }

    try {
      this.appCtrl.addLog('sys', 'Solicitando preguntas de entrevista STAR a C#...');
      
      const response = await this.appCtrl.backendService.generateStarInterview(cvText, model);
      
      let rawResult = response.rawResult || response;
      let rawStr = typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult);

      const match = rawStr.match(/\{[\s\S]*\}/);
      let cleanJson = match ? match[0] : rawStr;
      
      cleanJson = cleanJson.replace(/[\r\n]+/g, " ");
      const data = JSON.parse(cleanJson);

      this.renderQuestions(data.questions || []);
      this.appCtrl.addLog('sys', '✅ Preguntas de Entrevista STAR cargadas con éxito.');
    } catch (err) {
      this.appCtrl.addLog('error', `Error generando entrevista: ${err.message}`);
      alert(`Fallo en la entrevista: ${err.message}`);
    } finally {
      if (this.btnGenerate) {
        this.btnGenerate.disabled = false;
        this.btnGenerate.textContent = '🎯 Generar Preguntas STAR';
      }
    }
  }

  renderQuestions(questions) {
    if (!this.container) return;

    if (!questions || !questions.length) {
      this.container.innerHTML = '<p style="color: var(--text-muted);">No se pudieron generar las preguntas de entrevista.</p>';
      return;
    }

    this.container.innerHTML = questions.map((q, idx) => `
      <div class="interview-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1.2rem; margin-bottom: 1rem;">
        <div style="font-size: 0.8rem; color: var(--accent-primary, #ff007f); font-weight: bold; text-transform: uppercase;">
          Pregunta ${idx + 1} - ${q.category || 'General'}
        </div>
        <h4 style="margin: 0.5rem 0; color: #fff;">${q.question}</h4>
        <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 0.8rem;"><em>Por qué se pregunta:</em> ${q.why || ''}</p>
        
        ${q.starGuide ? `
          <div style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 6px; font-size: 0.85rem;">
            <strong style="color: var(--status-success, #00f2fe);">Guía STAR sugerida:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; color: #ddd;">
              <li><strong>S (Situación):</strong> ${q.starGuide.situation || ''}</li>
              <li><strong>T (Tarea):</strong> ${q.starGuide.task || ''}</li>
              <li><strong>A (Acción):</strong> ${q.starGuide.action || ''}</li>
              <li><strong>R (Resultado):</strong> ${q.starGuide.result || ''}</li>
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('');
  }
}