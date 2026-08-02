import { PDFService } from '../services/pdf.service.js';
import { StorageService } from '../services/storage.service.js';
import { NavigationController } from './navigation.controller.js';
import { ThemeController } from './theme.controller.js';
import { RadarComponent } from '../components/radar/radar.component.js';
import { InterviewComponent } from '../components/interview/interview.component.js';
import { CoverLetterComponent } from '../components/cover-letter/cover-letter.component.js';
import { HistoryComponent } from '../components/history/history.component.js';
import { BackendService } from '../services/backend.service.js';

/**
 * AppController.js
 * Controlador orquestador central del Frontend.
 * Coordina la UI del Dashboard, el estado global de la app y la comunicación con C# (.NET Core).
 */
export class AppController {
  constructor(orchestrator, ollamaService) {
    this.orchestrator = orchestrator;
    this.ollamaService = ollamaService;
    this.backendService = new BackendService();
    this.extractedPdfText = '';
    this.activeTab = 'pdfTab';
    this.lastAnalysisData = null;
    this.eventsBound = false;

    try {
      this.initComponents();
    } catch (err) {
      console.error('Error inicializando componentes:', err);
    }
  }

  /**
   * Captura y re-asigna los elementos del DOM de la vista Dashboard.
   */
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

    this.populateModelDropdown();
    this.startBackendHealthCheck();
  }

  /**
   * Instanciación de componentes modulares y controladores del sistema.
   */
  initComponents() {
    this.radarComp = new RadarComponent('radarSvgWrapper');
    this.interviewComp = new InterviewComponent(this);
    this.coverLetterComp = new CoverLetterComponent(this);
    this.historyComp = new HistoryComponent(this);

    this.themeCtrl = new ThemeController();
    this.navCtrl = new NavigationController(this);
  }

  /**
   * Retorna el texto del CV disponible según la pestaña seleccionada o activa
   */
  getCVText() {
    const textFromPdf = this.extractedPdfText || '';
    const textFromArea = this.cvTextArea?.value || '';

    if (this.activeTab === 'pdfTab' && textFromPdf.trim()) {
      return textFromPdf;
    }
    return textFromArea || textFromPdf;
  }

  /**
   * Asigna los listeners de eventos para el formulario de entrada y el dropzone del PDF.
   */
  bindEvents() {
    if (this.eventsBound) return;

    // Eventos para pestañas PDF / Texto
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        document.getElementById(this.activeTab)?.classList.add('active');
      });
    });

    // Subida y lectura de archivo PDF
    if (this.fileInput) {
      this.fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length) {
          const file = e.target.files[0];
          if (this.fileNameDisplay) this.fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          if (this.dropzone) this.dropzone.style.display = 'none';
          if (this.fileBadge) this.fileBadge.classList.add('visible');

          try {
            this.extractedPdfText = await PDFService.extractText(file);
            if (this.cvTextArea) this.cvTextArea.value = this.extractedPdfText;
            this.activeTab = 'pdfTab';
            this.addLog('sys', `PDF "${file.name}" procesado e introducido.`);
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

    // Submit del Formulario Principal
    if (this.form) {
      this.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cvText = this.getCVText();

        if (!cvText || !cvText.trim()) {
          return alert('Proporciona un documento PDF o texto plano.');
        }

        const model = this.modelInput?.value || 'llama3:latest';

        this.resetDashboard();
        this.setLoading(true);

        try {
          this.addLog('sys', `Enviando petición a C# usando modelo (${model})...`);

          const result = await this.backendService.runAuditPipeline(cvText, model);

          this.addLog('sys', `Respuesta recibida en ${result.durationSeconds}s desde C#.`);

          // Extracción limpia del JSON devuelto
          let rawStr = typeof result.rawResult === 'string' ? result.rawResult : JSON.stringify(result.rawResult);
          
          let cleanJson = rawStr;
          const match = rawStr.match(/\{[\s\S]*\}/);
          if (match) {
            cleanJson = match[0];
          }

          let data = {};
          try {
            cleanJson = cleanJson.replace(/[\r\n]+/g, " ");
            data = JSON.parse(cleanJson);
          } catch (jsonErr) {
            console.warn("Fallo leve de parseo en JSON de Ollama. Intentando limpieza secundaria...", jsonErr);
            try {
              cleanJson = cleanJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
              data = JSON.parse(cleanJson);
            } catch (e2) {
              data = { summaryText: rawStr };
            }
          }

          // Actualización de KPIs
          if (this.kpiGlobal) this.kpiGlobal.textContent = `${data.globalScore || 80}/100`;
          if (this.kpiDuration) this.kpiDuration.textContent = `${result.durationSeconds}s`;

          // Actualización de Tarjetas de Agentes
          if (data.results) {
            Object.keys(data.results).forEach(agentKey => {
              const agentData = data.results[agentKey];
              this.updateAgentUI(agentKey, 'done', `${agentData.score || 0}/100`, agentData);
            });
          }

          // Tarjeta de Resumen Estratégico
          this.updateAgentUI('summary', 'done', 'Finalizado', { 
            summary: data.summaryText || "Auditoría completada con éxito." 
          });

          // Guardar estado global de la auditoría
          const summaryData = {
            globalScore: data.globalScore || 80,
            totalDuration: result.durationSeconds,
            results: data.results || {},
            finalSummaryText: data.summaryText || 'Evaluación completada.',
            cvText: cvText,
            fileName: this.fileInput?.files[0]?.name || 'CV_Texto_Plano',
            formattedDate: new Date().toLocaleString()
          };

          this.lastAnalysisData = summaryData;
          this.renderRadarFromData(summaryData);
          StorageService.saveAnalysis(summaryData);

          this.addLog('sys', '✅ Renderizado de tarjetas y Radar 360° completado.');

        } catch (err) {
          this.addLog('error', `Error en la API C#: ${err.message}`);
          alert(`Fallo en la auditoría: ${err.message}`);
        } finally {
          this.setLoading(false);
        }
      });
    }

    this.eventsBound = true;
  }

  /**
   * Restaura el estado visual de las tarjetas al navegar entre secciones SPA
   */
  restoreDashboardState(data) {
    if (!data) return;
    if (this.kpiGlobal) this.kpiGlobal.textContent = `${data.globalScore}/100`;
    if (this.kpiDuration) this.kpiDuration.textContent = `${data.totalDuration}s`;

    if (data.results) {
      Object.keys(data.results).forEach(agentKey => {
        const agentData = data.results[agentKey];
        this.updateAgentUI(agentKey, 'done', `${agentData.score || 0}/100`, agentData);
      });
    }

    this.updateAgentUI('summary', 'done', 'Finalizado', { summary: data.finalSummaryText });
    if (this.cvTextArea && data.cvText) {
      this.cvTextArea.value = data.cvText;
    }
  }

  /**
   * Pasa los puntajes de los 6 agentes al componente Radar 360° SVG
   */
  renderRadarFromData(data) {
    if (!this.radarComp) return;
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
   * Comprueba en segundo plano si C# y Ollama responden en /health/ollama
   */
  startBackendHealthCheck() {
    const verify = async () => {
      try {
        const isBackendUp = await this.backendService.checkHealth();
        if (!this.ollamaStatusEl || !this.ollamaStatusText) return;

        if (isBackendUp) {
          this.ollamaStatusEl.className = 'ollama-status online';
          this.ollamaStatusText.textContent = 'API C# Online';
        } else {
          this.ollamaStatusEl.className = 'ollama-status offline';
          this.ollamaStatusText.textContent = 'C# API Offline';
        }
      } catch (e) {
        if (this.ollamaStatusEl) this.ollamaStatusEl.className = 'ollama-status offline';
        if (this.ollamaStatusText) this.ollamaStatusText.textContent = 'Offline';
      }
    };
    verify();
    setInterval(verify, 10000);
  }

  /**
   * Rellena el selector con los modelos locales de Ollama disponibles
   */
  populateModelDropdown() {
    if (!this.modelInput) return;

    const currentSelection = this.modelInput.value;

    const listToRender = [
      { name: 'llama3:latest', size: 4.7 * 1024 * 1024 * 1024 },
      { name: 'llama3.2:latest', size: 2.0 * 1024 * 1024 * 1024 }
    ];

    let optionsHtml = listToRender.map(m => `
      <option value="${m.name}">${m.name} (${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB - Local)</option>
    `).join('');

    optionsHtml = `
      <optgroup label="💻 Modelos Locales (Ollama via C#)">
        ${optionsHtml}
      </optgroup>
      <optgroup label="⚡ Cloud API / Otros">
        <option value="prism-ml/bonsai-27b">🌲 Bonsai 27B (LM Studio / API)</option>
      </optgroup>
    `;

    this.modelInput.innerHTML = optionsHtml;

    if (currentSelection) {
      this.modelInput.value = currentSelection;
    }
  }

  /**
   * Agrega mensajes a la consola interactiva del panel
   */
  addLog(type, text) {
    if (!this.consoleLogs) return;
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-time">[${time}]</span>${text}`;
    this.consoleLogs.appendChild(entry);
    this.consoleLogs.scrollTop = this.consoleLogs.scrollHeight;
  }

  /**
   * Resetea el panel a su estado de espera antes de una nueva orquestación
   */
  resetDashboard() {
    if (this.kpiGlobal) this.kpiGlobal.textContent = '--/100';
    if (this.kpiDuration) this.kpiDuration.textContent = '0.0s';
    if (this.radarComp) this.radarComp.reset();

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

  /**
   * Limpia el PDF cargado y restaura la vista del Dropzone
   */
  clearPdf() {
    this.extractedPdfText = '';
    if (this.fileInput) this.fileInput.value = '';
    if (this.fileNameDisplay) this.fileNameDisplay.textContent = '';
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

  /**
   * Formatea e inyecta la información devuelta por la IA en la tarjeta de cada agente
   */
  updateAgentUI(agent, state, badgeText, data) {
    const badge = document.getElementById(`badge-${agent}`);
    if (badge) {
      badge.className = `agent-status-badge ${state}`;
      badge.textContent = badgeText;
    }

    const output = document.getElementById(`output-${agent}`);
    if (!output || !data) return;

    let parsedData = data;

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
        <div style="font-weight: bold; margin-bottom: 0.5rem; color: var(--accent-primary, #ff007f);">
          ${parsedData.summary || 'Plan Estratégico Consolidado:'}
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
        <div style="margin-bottom: 0.5rem; color: var(--text-main, #fff); font-weight: 500;">
          ${parsedData.summary || 'Análisis completado.'}
        </div>
        
        ${strengths.length ? `
          <div style="color: var(--status-success, #00f2fe); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">Puntos Fuertes:</div>
          <ul class="bullet-list">${strengths.map(s => `<li>${this.#formatListItem(s)}</li>`).join('')}</ul>
        ` : ''}

        ${weaknesses.length ? `
          <div style="color: var(--status-danger, #ff4b2b); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">A Mejorar:</div>
          <ul class="bullet-list">${weaknesses.map(w => `<li>${this.#formatListItem(w)}</li>`).join('')}</ul>
        ` : ''}

        ${recommendations.length ? `
          <div style="color: var(--accent-primary, #ff007f); margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;">Recomendaciones:</div>
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