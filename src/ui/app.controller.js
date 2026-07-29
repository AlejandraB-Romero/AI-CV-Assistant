import { PDFService } from '../services/pdf.service.js';

export class AppController {
  constructor(orchestrator, ollamaService) {
    this.orchestrator = orchestrator;
    this.ollamaService = ollamaService;
    this.extractedPdfText = '';
    this.activeTab = 'pdfTab';

    this.initDOM();
    this.bindEvents();
    this.startOllamaHealthCheck();
  }

  initDOM() {
    this.form = document.getElementById('cvForm');
    this.modelInput = document.getElementById('modelSelect');
    this.cvTextArea = document.getElementById('cvContent');
    this.fileInput = document.getElementById('pdfFileInput');
    this.dropzone = document.getElementById('pdfDropzone');
    this.fileBadge = document.getElementById('fileBadge');
    this.fileNameDisplay = document.getElementById('fileNameDisplay');
    this.btnRemoveFile = document.getElementById('btnRemoveFile');
    this.analyzeBtn = document.getElementById('analyzeBtn');

    this.consoleLogs = document.getElementById('consoleLogs');
    this.ollamaStatusEl = document.getElementById('ollamaStatus');
    this.ollamaStatusText = document.getElementById('ollamaStatusText');

    this.kpiGlobal = document.getElementById('kpiGlobalScore');
    this.kpiDuration = document.getElementById('kpiDuration');

    this.agentsList = ['ats', 'recruiter', 'grammar', 'technical', 'linkedin', 'career', 'summary'];
  }

  startOllamaHealthCheck() {
    const verify = async () => {
      const health = await this.ollamaService.checkHealth();
      if (health.online) {
        this.ollamaStatusEl.className = 'ollama-status online';
        this.ollamaStatusText.textContent = 'Ollama Online';
        this.populateModelDropdown(health.models);
      } else {
        this.ollamaStatusEl.className = 'ollama-status offline';
        this.ollamaStatusText.textContent = 'Ollama Offline';
        this.modelInput.innerHTML = '<option value="">Ollama no disponible</option>';
      }
    };

    verify();
    setInterval(verify, 8000);
  }

  populateModelDropdown(models) {
    if (!models || models.length === 0) {
      this.modelInput.innerHTML = '<option value="">Sin modelos instalados</option>';
      return;
    }

    const currentSelection = this.modelInput.value;
    this.modelInput.innerHTML = models.map(m => `
      <option value="${m.name}">${m.name} (${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB)</option>
    `).join('');

    if (currentSelection && models.some(m => m.name === currentSelection)) {
      this.modelInput.value = currentSelection;
    }
  }

  addLog(type, text) {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-time">[${time}]</span>${text}`;
    this.consoleLogs.appendChild(entry);
    this.consoleLogs.scrollTop = this.consoleLogs.scrollHeight;
  }

  bindEvents() {
    // Manejo de tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        document.getElementById(this.activeTab).classList.add('active');
      });
    });

    // Subida de PDF
    this.fileInput.addEventListener('change', async (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0];
        this.fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        this.dropzone.style.display = 'none';
        this.fileBadge.classList.add('visible');

        try {
          this.extractedPdfText = await PDFService.extractText(file);
          this.cvTextArea.value = this.extractedPdfText;
          this.addLog('sys', `PDF "${file.name}" cargado y procesado (${this.extractedPdfText.length} caracteres).`);
        } catch (err) {
          alert(`Error al procesar PDF: ${err.message}`);
          this.clearPdf();
        }
      }
    });

    this.btnRemoveFile.addEventListener('click', () => this.clearPdf());

    // Submit del Formulario
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cvText = this.activeTab === 'pdfTab' ? this.extractedPdfText : this.cvTextArea.value;

      if (!cvText.trim()) {
        alert('Carga un archivo PDF o pega el texto de tu CV.');
        return;
      }

      const model = this.modelInput.value;
      if (!model) {
        alert('Selecciona un modelo válido de Ollama.');
        return;
      }

      this.resetDashboard();
      this.setLoading(true);

      try {
        await this.orchestrator.runPipeline(cvText, model, {
          onLog: (type, text) => this.addLog(type, text),
          onAgentStatus: (agent, state, badgeText, data) => this.updateAgentUI(agent, state, badgeText, data),
          onComplete: (summaryData) => {
            this.kpiGlobal.textContent = `${summaryData.globalScore}/100`;
            this.kpiDuration.textContent = `${summaryData.totalDuration}s`;
          }
        });
      } catch (err) {
        this.addLog('error', `Error durante el pipeline: ${err.message}`);
      } finally {
        this.setLoading(false);
      }
    });
  }

  resetDashboard() {
    this.kpiGlobal.textContent = '--/100';
    this.kpiDuration.textContent = '0.0s';
    this.agentsList.forEach(agent => {
      const step = document.getElementById(`step-${agent}`);
      if (step) step.className = 'pipeline-step';
      
      const badge = document.getElementById(`badge-${agent}`);
      if (badge) {
        badge.className = 'agent-status-badge';
        badge.textContent = 'En espera';
      }

      const output = document.getElementById(`output-${agent}`);
      if (output) output.textContent = 'Esperando análisis...';
    });
  }

  clearPdf() {
    this.extractedPdfText = '';
    this.fileInput.value = '';
    this.fileBadge.classList.remove('visible');
    this.dropzone.style.display = 'block';
  }

  updateAgentUI(agent, state, badgeText, data) {
    const step = document.getElementById(`step-${agent}`);
    if (step) step.className = `pipeline-step ${state}`;

    const badge = document.getElementById(`badge-${agent}`);
    if (badge) {
      badge.className = `agent-status-badge ${state}`;
      badge.textContent = badgeText;
    }

    const output = document.getElementById(`output-${agent}`);
    if (output && data) {
      if (agent === 'summary') {
        output.textContent = data.summary;
      } else {
        // Formatear los resultados estructurados del JSON en la tarjeta del agente
        output.innerHTML = `
          <strong>${data.summary || ''}</strong>
          
          ${data.strengths && data.strengths.length ? `
            <div class="card-section-title" style="color: var(--status-success);">Puntos Fuertes:</div>
            <ul class="bullet-list">${data.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
          ` : ''}

          ${data.weaknesses && data.weaknesses.length ? `
            <div class="card-section-title" style="color: var(--status-danger);">A Mejorar:</div>
            <ul class="bullet-list">${data.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
          ` : ''}

          ${data.recommendations && data.recommendations.length ? `
            <div class="card-section-title" style="color: var(--accent-primary);">Recomendaciones:</div>
            <ul class="bullet-list">${data.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
          ` : ''}
        `;
      }
    }
  }

  setLoading(loading) {
    this.analyzeBtn.disabled = loading;
    this.analyzeBtn.textContent = loading ? '⏳ Orquestando Agentes de IA...' : '🚀 Ejecutar Orquestación Multi-Agente';
  }
}