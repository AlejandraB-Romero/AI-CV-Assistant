import { PDFService } from '../services/pdf.service.js';
import { StorageService } from '../services/storage.service.js';
import { ExportService } from '../services/export.service.js';
import { PreviewController } from './preview.controller.js';
import { InterviewController } from './interview.controller.js';
import { ComparatorController } from './comparator.controller.js';

export class AppController {
  constructor(orchestrator, ollamaService) {
    this.orchestrator = orchestrator;
    this.ollamaService = ollamaService;
    this.extractedPdfText = '';
    this.activeTab = 'pdfTab';
    this.lastAnalysisData = null;
    this.currentRewrittenData = null;

    this.initDOM();
    this.initSubControllers();
    this.bindEvents();
    this.startOllamaHealthCheck();
  }

  initDOM() {
    this.form = document.getElementById('cvForm');
    this.modelInput = document.getElementById('modelSelect');
    this.concurrencyInput = document.getElementById('concurrencySelect');
    this.cvTextArea = document.getElementById('cvContent');
    this.fileInput = document.getElementById('pdfFileInput');
    this.dropzone = document.getElementById('pdfDropzone');
    this.fileBadge = document.getElementById('fileBadge');
    this.fileNameDisplay = document.getElementById('fileNameDisplay');
    this.btnRemoveFile = document.getElementById('btnRemoveFile');
    this.analyzeBtn = document.getElementById('analyzeBtn');

    // Botones de Exportación e Historial
    this.btnHistory = document.getElementById('btnHistory');
    this.btnPrintPdf = document.getElementById('btnPrintPdf');
    this.btnExportMd = document.getElementById('btnExportMd');
    this.btnExportJson = document.getElementById('btnExportJson');

    this.historyModal = document.getElementById('historyModal');
    this.btnCloseHistory = document.getElementById('btnCloseHistory');
    this.historyList = document.getElementById('historyList');

    this.consoleLogs = document.getElementById('consoleLogs');
    this.ollamaStatusEl = document.getElementById('ollamaStatus');
    this.ollamaStatusText = document.getElementById('ollamaStatusText');

    this.kpiGlobal = document.getElementById('kpiGlobalScore');
    this.kpiDuration = document.getElementById('kpiDuration');

    this.agentsList = ['ats', 'recruiter', 'grammar', 'technical', 'linkedin', 'career', 'summary'];
  }

  initSubControllers() {
    this.previewCtrl = new PreviewController(this);
    this.interviewCtrl = new InterviewController(this);
    this.comparatorCtrl = new ComparatorController(this);
  }

  getCVText() {
    return this.activeTab === 'pdfTab' ? this.extractedPdfText : this.cvTextArea.value;
  }

  bindEvents() {
    // Exportaciones
    if (this.btnExportMd) {
      this.btnExportMd.addEventListener('click', () => {
        if (this.lastAnalysisData) ExportService.exportToMarkdown(this.lastAnalysisData);
      });
    }

    if (this.btnExportJson) {
      this.btnExportJson.addEventListener('click', () => {
        if (this.lastAnalysisData) ExportService.exportToJSON(this.lastAnalysisData);
      });
    }

    if (this.btnPrintPdf) {
      this.btnPrintPdf.addEventListener('click', () => window.print());
    }

    // Historial
    if (this.btnHistory) {
      this.btnHistory.addEventListener('click', () => this.renderHistoryModal());
    }

    if (this.btnCloseHistory) {
      this.btnCloseHistory.addEventListener('click', () => this.historyModal.style.display = 'none');
    }

    // Cierre global de modales al hacer clic fuera
    window.addEventListener('click', (e) => {
      if (e.target === this.historyModal) this.historyModal.style.display = 'none';
      if (e.target === this.comparatorCtrl.compareModal) this.comparatorCtrl.close();
      if (e.target === this.previewCtrl.previewModal) this.previewCtrl.close();
      if (e.target === this.interviewCtrl.interviewModal) this.interviewCtrl.close();
    });

    // Pestañas (PDF / Texto)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        document.getElementById(this.activeTab)?.classList.add('active');
      });
    });

    // Subida PDF
    if (this.fileInput) {
      this.fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length) {
          const file = e.target.files[0];
          this.fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          this.dropzone.style.display = 'none';
          this.fileBadge.classList.add('visible');

          try {
            this.extractedPdfText = await PDFService.extractText(file);
            this.cvTextArea.value = this.extractedPdfText;
            this.addLog('sys', `PDF "${file.name}" procesado correctamente.`);
          } catch (err) {
            alert(`Error en PDF: ${err.message}`);
            this.clearPdf();
          }
        }
      });
    }

    if (this.btnRemoveFile) {
      this.btnRemoveFile.addEventListener('click', () => this.clearPdf());
    }

    // Ejecutar Pipeline principal
    if (this.form) {
      this.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cvText = this.getCVText();

        if (!cvText.trim()) return alert('Proporciona un documento PDF o texto plano.');
        const model = this.modelInput.value;
        if (!model) return alert('Selecciona un modelo de Ollama.');

        const concurrency = parseInt(this.concurrencyInput?.value, 10) || 2;

        this.resetDashboard();
        this.setLoading(true);

        try {
          await this.orchestrator.runPipeline(cvText, model, {
            onLog: (type, text) => this.addLog(type, text),
            onAgentStatus: (agent, state, badgeText, data) => this.updateAgentUI(agent, state, badgeText, data),
            onComplete: (summaryData) => {
              this.kpiGlobal.textContent = `${summaryData.globalScore}/100`;
              this.kpiDuration.textContent = `${summaryData.totalDuration}s`;

              summaryData.fileName = this.fileInput.files[0]?.name || 'CV_Texto_Plano';
              this.lastAnalysisData = summaryData;

              StorageService.saveAnalysis(summaryData);
              this.enableExportButtons();
            }
          }, concurrency);
        } catch (err) {
          this.addLog('error', `Error durante el pipeline: ${err.message}`);
        } finally {
          this.setLoading(false);
        }
      });
    }
  }

  enableExportButtons() {
    // Buscar referencias de botones si no estaban asignadas
    const btnDocx = this.btnGenerateDocx || document.getElementById('btnGenerateDocx');
    const btnPdf = this.btnPrintPdf || document.getElementById('btnPrintPdf');
    const btnMd = this.btnExportMd || document.getElementById('btnExportMd');
    const btnJson = this.btnExportJson || document.getElementById('btnExportJson');

    if (btnDocx) btnDocx.disabled = false;
    if (btnPdf) btnPdf.disabled = false;
    if (btnMd) btnMd.disabled = false;
    if (btnJson) btnJson.disabled = false;
  }

  renderHistoryModal() {
    const history = StorageService.getHistory();
    if (!history.length) {
      this.historyList.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No hay análisis guardados en el historial.</p>';
    } else {
      this.historyList.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
          <div class="history-item-info">
            <div class="history-item-title">📄 ${item.fileName}</div>
            <div class="history-item-meta">Modelo: ${item.model} • ${item.formattedDate}</div>
          </div>
          <div class="history-item-score">${item.globalScore}/100</div>
        </div>
      `).join('');

      this.historyList.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.id;
          const selected = history.find(h => h.id === id);
          if (selected) this.loadAnalysisFromHistory(selected);
        });
      });
    }

    this.historyModal.style.display = 'flex';
  }

  loadAnalysisFromHistory(data) {
    this.lastAnalysisData = data;
    this.kpiGlobal.textContent = `${data.globalScore}/100`;
    this.kpiDuration.textContent = `${data.totalDuration}s`;

    Object.entries(data.results).forEach(([agent, result]) => {
      this.updateAgentUI(agent, 'done', `${result.score}/100`, result);
    });

    this.updateAgentUI('summary', 'done', 'Finalizado', { summary: data.finalSummaryText });

    // HABILITAR BOTONES AQUÍ
    this.enableExportButtons();

    this.historyModal.style.display = 'none';
    this.addLog('sys', `Análisis cargado desde el historial (${data.formattedDate}).`);
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
    if (!models || models.length === 0) return;

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

  resetDashboard() {
    this.kpiGlobal.textContent = '--/100';
    this.kpiDuration.textContent = '0.0s';

    if (this.btnGenerateDocx) this.btnGenerateDocx.disabled = true;
    if (this.btnPrintPdf) this.btnPrintPdf.disabled = true;
    if (this.btnExportMd) this.btnExportMd.disabled = true;
    if (this.btnExportJson) this.btnExportJson.disabled = true;

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
    if (this.fileInput) this.fileInput.value = '';
    if (this.fileBadge) this.fileBadge.classList.remove('visible');
    if (this.dropzone) this.dropzone.style.display = 'block';
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
    if (!output || !data) return;

    let parsedData = data;

    if (typeof parsedData === 'object' && parsedData !== null && parsedData.summary && typeof parsedData.summary === 'string') {
      if (parsedData.summary.trim().startsWith('{')) {
        try {
          parsedData = JSON.parse(parsedData.summary);
        } catch (e) {}
      }
    }

    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        parsedData = { summary: parsedData };
      }
    }

    if (agent === 'summary') {
      const actionPlan = Array.isArray(parsedData.actionPlan)
        ? parsedData.actionPlan
        : (Array.isArray(parsedData.recommendations) ? parsedData.recommendations : []);

      const actionListHtml = actionPlan.length
        ? actionPlan.map(item => `<li style="margin-bottom: 0.4rem;">${item}</li>`).join('')
        : `<li>${parsedData.summary || parsedData.summaryText || 'Análisis consolidado.'}</li>`;

      output.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--accent-primary);">
          ${parsedData.summary && typeof parsedData.summary === 'string' && !parsedData.summary.startsWith('{') ? parsedData.summary : 'Plan Estratégico Consolidado:'}
        </div>
        <ul class="bullet-list" style="padding-left: 1.2rem;">
          ${actionListHtml}
        </ul>
      `;
    } else {
      const strengths = Array.isArray(parsedData.strengths) ? parsedData.strengths : [];
      const weaknesses = Array.isArray(parsedData.weaknesses) ? parsedData.weaknesses : [];
      const recommendations = Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [];

      output.innerHTML = `
        <div style="margin-bottom: 0.5rem; color: var(--text-main); font-weight: 500;">
          ${parsedData.summary || 'Análisis completado.'}
        </div>
        
        ${strengths.length ? `
          <div class="card-section-title" style="color: var(--status-success); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">Puntos Fuertes:</div>
          <ul class="bullet-list">${strengths.map(s => `<li>${s}</li>`).join('')}</ul>
        ` : ''}

        ${weaknesses.length ? `
          <div class="card-section-title" style="color: var(--status-danger); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">A Mejorar:</div>
          <ul class="bullet-list">${weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
        ` : ''}

        ${recommendations.length ? `
          <div class="card-section-title" style="color: var(--accent-primary); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">Recomendaciones:</div>
          <ul class="bullet-list">${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
        ` : ''}
      `;

      if (parsedData.score && badge) {
        badge.textContent = `${parsedData.score}/100`;
      }
    }
  }

  setLoading(loading) {
    if (this.analyzeBtn) {
      this.analyzeBtn.disabled = loading;
      this.analyzeBtn.textContent = loading ? '⏳ Orquestando Agentes...' : '🚀 Ejecutar Orquestación Multi-Agente';
    }
  }
}