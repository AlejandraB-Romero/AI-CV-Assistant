import { PDFService } from '../services/pdf.service.js';
import { StorageService } from '../services/storage.service.js';
import { ExportService } from '../services/export.service.js';

// Importación de la navegación SPA y de la nueva suite de Componentes
import { NavigationController } from './navigation.controller.js';
import { RadarComponent } from '../components/radar/radar.component.js';
import { CoverLetterComponent } from '../components/cover-letter/cover-letter.component.js';
import { InterviewComponent } from '../components/interview/interview.component.js';
import { ComparatorComponent } from '../components/comparator/comparator.component.js';
import { HistoryComponent } from '../components/history/history.component.js';

/**
 * AppController.js
 * Controlador principal que orquesta la interfaz SPA y comunica los componentes con los Agentes de IA.
 */
export class AppController {
  constructor(orchestrator, ollamaService) {
    this.orchestrator = orchestrator;
    this.ollamaService = ollamaService;
    this.extractedPdfText = '';
    this.activeTab = 'pdfTab';
    this.lastAnalysisData = null;

    this.initDOM();
    this.initComponents();
    this.bindEvents();
    this.startOllamaHealthCheck();
  }

  /**
   * Captura de elementos globales del DOM
   */
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

    this.consoleLogs = document.getElementById('consoleLogs');
    this.ollamaStatusEl = document.getElementById('ollamaStatus');
    this.ollamaStatusText = document.getElementById('ollamaStatusText');

    this.kpiGlobal = document.getElementById('kpiGlobalScore');
    this.kpiDuration = document.getElementById('kpiDuration');

    this.agentsList = ['ats', 'recruiter', 'grammar', 'technical', 'linkedin', 'career', 'summary'];
  }

  /**
   * Inicialización de la arquitectura basada en componentes
   */
  initComponents() {
    // Controller de navegación entre vistas de la SPA
    this.navCtrl = new NavigationController();

    // Instanciación de componentes modulares
    this.radarComp = new RadarComponent('radarSvgWrapper');
    this.coverLetterComp = new CoverLetterComponent(this);
    this.interviewComp = new InterviewComponent(this);
    this.comparatorComp = new ComparatorComponent(this);
    this.historyComp = new HistoryComponent(this);

    // Escuchar el cambio de vistas para auto-renderizar componentes dinámicos (Ej. Radar o Historial)
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        if (viewId === 'view-history') {
          this.historyComp.render();
        } else if (viewId === 'view-analytics' && this.lastAnalysisData) {
          this.renderRadarFromData(this.lastAnalysisData);
        } else if (viewId === 'view-interview' && this.lastAnalysisData) {
          this.interviewComp.generate();
        }
      });
    });
  }

  /**
   * Helper para obtener el texto del CV según la pestaña activa (PDF o Texto)
   */
  getCVText() {
    return this.activeTab === 'pdfTab' ? this.extractedPdfText : this.cvTextArea.value;
  }

  /**
   * Registro de eventos del formulario y archivo PDF
   */
  bindEvents() {
    // Cambio entre pestañas PDF / Texto Plano
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        document.getElementById(this.activeTab)?.classList.add('active');
      });
    });

    // Gestión de subida de archivo PDF
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

    // Submit del formulario para ejecutar la orquestación principal
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

              // Renderizar el gráfico Radar con las notas obtenidas
              this.renderRadarFromData(summaryData);
              // Guardar en almacenamiento local
              StorageService.saveAnalysis(summaryData);
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

  /**
   * Helper para extraer puntuaciones y mandar a dibujar el SVG al RadarComponent
   */
  renderRadarFromData(data) {
    const scores = {
      ats: data.results?.ats?.score || 0,
      recruiter: data.results?.recruiter?.score || 0,
      grammar: data.results?.grammar?.score || 0,
      technical: data.results?.technical?.score || 0,
      linkedin: data.results?.linkedin?.score || 0,
      career: data.results?.career?.score || 0
    };
    this.radarComp.render(scores);
  }

  /**
   * Carga una evaluación guardada en el historial a la interfaz principal
   */
  loadAnalysisFromHistory(data) {
    this.lastAnalysisData = data;
    this.kpiGlobal.textContent = `${data.globalScore}/100`;
    this.kpiDuration.textContent = `${data.totalDuration}s`;

    this.renderRadarFromData(data);

    Object.entries(data.results).forEach(([agent, result]) => {
      this.updateAgentUI(agent, 'done', `${result.score}/100`, result);
    });

    this.updateAgentUI('summary', 'done', 'Finalizado', { summary: data.finalSummaryText });
    this.addLog('sys', `Análisis cargado desde el historial (${data.formattedDate}).`);
  }

  /**
   * Comprueba el estado de Ollama periódicamente
   */
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
    this.radarComp.reset();

    this.agentsList.forEach(agent => {
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

  #formatListItem(item) {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      return item.detail || item.recommendation || item.weakness || item.text || item.description || JSON.stringify(item);
    }
    return String(item);
  }

  updateAgentUI(agent, state, badgeText, data) {
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
        } catch (e) { }
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
        ? actionPlan.map(item => `<li style="margin-bottom: 0.4rem;">${this.#formatListItem(item)}</li>`).join('')
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
          <ul class="bullet-list">${strengths.map(s => `<li>${this.#formatListItem(s)}</li>`).join('')}</ul>
        ` : ''}

        ${weaknesses.length ? `
          <div class="card-section-title" style="color: var(--status-danger); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">A Mejorar:</div>
          <ul class="bullet-list">${weaknesses.map(w => `<li>${this.#formatListItem(w)}</li>`).join('')}</ul>
        ` : ''}

        ${recommendations.length ? `
          <div class="card-section-title" style="color: var(--accent-primary); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">Recomendaciones:</div>
          <ul class="bullet-list">${recommendations.map(r => `<li>${this.#formatListItem(r)}</li>`).join('')}</ul>
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