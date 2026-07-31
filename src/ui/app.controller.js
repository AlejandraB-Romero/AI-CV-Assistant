import { PDFService } from '../services/pdf.service.js';
import { StorageService } from '../services/storage.service.js';
import { ExportService } from '../services/export.service.js';
import { DocxService } from '../services/docx.service.js';
import { AGENT_PROMPTS } from '../agents/agent.prompts.js';

export class AppController {
  constructor(orchestrator, ollamaService) {
    this.orchestrator = orchestrator;
    this.ollamaService = ollamaService;
    this.extractedPdfText = '';
    this.activeTab = 'pdfTab';
    this.lastAnalysisData = null;
    this.currentRewrittenData = null; // Almacenará los datos temporales del modal

    this.initDOM();
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

    this.btnGenerateDocx = document.getElementById('btnGenerateDocx');

    // Botones de Exportación e Historial
    this.btnHistory = document.getElementById('btnHistory');
    this.btnPrintPdf = document.getElementById('btnPrintPdf');
    this.btnExportMd = document.getElementById('btnExportMd');
    this.btnExportJson = document.getElementById('btnExportJson');

    this.historyModal = document.getElementById('historyModal');
    this.btnCloseHistory = document.getElementById('btnCloseHistory');
    this.historyList = document.getElementById('historyList');

    // Modal Comparador
    this.btnCompareModal = document.getElementById('btnCompareModal');
    this.compareModal = document.getElementById('compareModal');
    this.btnCloseCompare = document.getElementById('btnCloseCompare');
    this.btnRunComparison = document.getElementById('btnRunComparison');
    this.oldCvText = document.getElementById('oldCvText');
    this.newCvText = document.getElementById('newCvText');
    this.compareResult = document.getElementById('compareResult');
    this.compareScoreBadge = document.getElementById('compareScoreBadge');
    this.compareOutput = document.getElementById('compareOutput');

    // Modal Vista Previa y Edición CV
    this.previewModal = document.getElementById('previewModal');
    this.btnClosePreview = document.getElementById('btnClosePreview');
    this.btnCancelPreview = document.getElementById('btnCancelPreview');
    this.btnConfirmDownloadDocx = document.getElementById('btnConfirmDownloadDocx');

    this.prevFullName = document.getElementById('prevFullName');
    this.prevTargetRole = document.getElementById('prevTargetRole');
    this.prevSummary = document.getElementById('prevSummary');
    this.prevProjectsContainer = document.getElementById('prevProjectsContainer');
    this.prevExperienceContainer = document.getElementById('prevExperienceContainer');
    this.prevEducationContainer = document.getElementById('prevEducationContainer');
    this.prevSkills = document.getElementById('prevSkills');

    this.consoleLogs = document.getElementById('consoleLogs');
    this.ollamaStatusEl = document.getElementById('ollamaStatus');
    this.ollamaStatusText = document.getElementById('ollamaStatusText');

    this.kpiGlobal = document.getElementById('kpiGlobalScore');
    this.kpiDuration = document.getElementById('kpiDuration');

    this.agentsList = ['ats', 'recruiter', 'grammar', 'technical', 'linkedin', 'career', 'summary'];
  }

  bindEvents() {
    // Exportación a Markdown y JSON
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
      this.btnPrintPdf.addEventListener('click', () => {
        window.print();
      });
    }

    // Modal Comparador
    if (this.btnCompareModal) {
      this.btnCompareModal.addEventListener('click', () => {
        this.compareModal.style.display = 'flex';
      });
    }

    if (this.btnCloseCompare) {
      this.btnCloseCompare.addEventListener('click', () => {
        this.compareModal.style.display = 'none';
      });
    }

    // Ejecutar Análisis Diferencial (Comparador)
    if (this.btnRunComparison) {
      this.btnRunComparison.addEventListener('click', async () => {
        const oldText = this.oldCvText.value.trim();
        const newText = this.newCvText.value.trim();
        const model = this.modelInput.value;

        if (!oldText || !newText) {
          alert('Por favor, pega el contenido de ambos CVs para realizar la comparación.');
          return;
        }

        this.btnRunComparison.disabled = true;
        this.btnRunComparison.textContent = '⏳ Comparando versiones con IA...';
        this.compareResult.style.display = 'block';
        this.compareOutput.textContent = 'Analizando diferencias e impacto...';

        try {
          const data = await this.orchestrator.compareCVs(oldText, newText, model);

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
      });
    }

    // 1. Abrir Vista Previa del CV al pulsar "Generar Word (.docx)"
    if (this.btnGenerateDocx) {
      this.btnGenerateDocx.addEventListener('click', async () => {
        if (!this.lastAnalysisData) return;

        const cvText = this.activeTab === 'pdfTab' ? this.extractedPdfText : this.cvTextArea.value;
        const model = this.modelInput.value;

        this.btnGenerateDocx.disabled = true;
        this.btnGenerateDocx.textContent = '⏳ Redactando borrador...';

        try {
          this.addLog('orchestrator', 'Generando versión estructurada para vista previa...');

          const prompt = AGENT_PROMPTS.REWRITER(cvText, this.lastAnalysisData.finalSummaryText);
          const rawResponse = await this.ollamaService.query(model, prompt);
          this.currentRewrittenData = this.orchestrator.parseAgentResponse(rawResponse);

          // Cargar datos en el Modal de Vista Previa
          this.populatePreviewModal(this.currentRewrittenData);
          this.previewModal.style.display = 'flex';

        } catch (err) {
          alert(`Error al generar borrador: ${err.message}`);
          this.addLog('error', `Error en reescritura: ${err.message}`);
        } finally {
          this.btnGenerateDocx.disabled = false;
          this.btnGenerateDocx.textContent = '✨ Generar Word (.docx)';
        }
      });
    }

    // 2. Control del Modal de Vista Previa (Cerrar / Cancelar)
    if (this.btnClosePreview) {
      this.btnClosePreview.addEventListener('click', () => this.previewModal.style.display = 'none');
    }

    if (this.btnCancelPreview) {
      this.btnCancelPreview.addEventListener('click', () => this.previewModal.style.display = 'none');
    }

    // 3. Confirmar y Descargar Word con los cambios manuales del usuario
    if (this.btnConfirmDownloadDocx) {
      this.btnConfirmDownloadDocx.addEventListener('click', async () => {
        const editedData = this.collectDataFromPreview();

        this.btnConfirmDownloadDocx.disabled = true;
        this.btnConfirmDownloadDocx.textContent = '⏳ Compilando .docx...';

        try {
          await DocxService.generateAndDownload(editedData, `CV_${editedData.fullName.replace(/\s+/g, '_')}.docx`);
          this.addLog('sys', '¡Archivo Word (.docx) personalizado descargado con éxito!');
          this.previewModal.style.display = 'none';
        } catch (err) {
          alert(`Error al guardar documento: ${err.message}`);
        } finally {
          this.btnConfirmDownloadDocx.disabled = false;
          this.btnConfirmDownloadDocx.textContent = '📥 Descargar en Word (.docx)';
        }
      });
    }

    // Controles de Historial
    if (this.btnHistory) {
      this.btnHistory.addEventListener('click', () => this.renderHistoryModal());
    }

    if (this.btnCloseHistory) {
      this.btnCloseHistory.addEventListener('click', () => this.historyModal.style.display = 'none');
    }

    // Cerrar modales al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
      if (e.target === this.historyModal) {
        this.historyModal.style.display = 'none';
      }
      if (e.target === this.compareModal) {
        this.compareModal.style.display = 'none';
      }
      if (e.target === this.previewModal) {
        this.previewModal.style.display = 'none';
      }
    });

    // Manejo de Tabs (Pestañas)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        document.getElementById(this.activeTab)?.classList.add('active');
      });
    });

    // Subida de PDF
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

    // Submit del Formulario Principal
    if (this.form) {
      this.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cvText = this.activeTab === 'pdfTab' ? this.extractedPdfText : this.cvTextArea.value;

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

              // Guardar en LocalStorage
              StorageService.saveAnalysis(summaryData);

              // Habilitar botones de exportación
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

  // Métodos auxiliares de la vista previa
  populatePreviewModal(data) {
    if (!data) return;
    this.prevFullName.value = data.fullName || '';
    this.prevTargetRole.value = data.targetRole || '';
    this.prevSummary.value = data.aboutMe || data.summaryProfile || '';

    // Unificar Habilidades, Stack y Herramientas para la vista previa
    const allSkills = [
      ...(Array.isArray(data.techStack) ? data.techStack : []),
      ...(Array.isArray(data.tools) ? data.tools : []),
      ...(Array.isArray(data.skills) ? data.skills : [])
    ];
    this.prevSkills.value = [...new Set(allSkills)].join(' • ');

    // Renderizar Proyectos Destacados
    if (this.prevProjectsContainer) {
      if (Array.isArray(data.projects) && data.projects.length) {
        this.prevProjectsContainer.style.display = 'block';
        if (this.prevProjectsContainer.previousElementSibling) {
          this.prevProjectsContainer.previousElementSibling.style.display = 'block';
        }
        this.prevProjectsContainer.innerHTML = data.projects.map((proj, idx) => `
          <div class="preview-exp-block" style="border-left: 3px solid #2563eb; padding-left: 0.75rem; margin-bottom: 1rem;">
            <div class="preview-exp-header">
              <input type="text" class="preview-input-title" style="font-size: 1rem; font-weight: bold;" value="${proj.name || ''}" data-proj-name="${idx}">
              <input type="text" class="preview-input-text" style="width: auto; font-size: 0.85rem; color: #2563eb; font-weight: 600;" value="${proj.techStack || ''}" data-proj-tech="${idx}">
            </div>
            <textarea class="preview-textarea" rows="2" data-proj-desc="${idx}">${(proj.description || []).join('\n')}</textarea>
          </div>
        `).join('');
      } else {
        this.prevProjectsContainer.innerHTML = '';
        if (this.prevProjectsContainer.previousElementSibling) {
          this.prevProjectsContainer.previousElementSibling.style.display = 'none';
        }
      }
    }

    // Renderizar Experiencia
    if (this.prevExperienceContainer) {
      if (Array.isArray(data.experience) && data.experience.length) {
        this.prevExperienceContainer.style.display = 'block';
        if (this.prevExperienceContainer.previousElementSibling) {
          this.prevExperienceContainer.previousElementSibling.style.display = 'block';
        }
        this.prevExperienceContainer.innerHTML = data.experience.map((exp, idx) => `
          <div class="preview-exp-block">
            <div class="preview-exp-header">
              <input type="text" class="preview-input-title" style="font-size: 1rem;" value="${exp.role || ''} ${exp.company ? '— ' + exp.company : ''}" data-exp-role="${idx}">
              <input type="text" class="preview-input-text" style="width: auto; text-align: right;" value="${exp.period || ''}" data-exp-period="${idx}">
            </div>
            <textarea class="preview-textarea" rows="2" data-exp-achievements="${idx}">${(exp.achievements || []).join('\n')}</textarea>
          </div>
        `).join('');
      } else {
        this.prevExperienceContainer.innerHTML = '';
        if (this.prevExperienceContainer.previousElementSibling) {
          this.prevExperienceContainer.previousElementSibling.style.display = 'none';
        }
      }
    }

    // Renderizar Educación
    if (this.prevEducationContainer) {
      if (Array.isArray(data.education) && data.education.length) {
        this.prevEducationContainer.style.display = 'block';
        if (this.prevEducationContainer.previousElementSibling) {
          this.prevEducationContainer.previousElementSibling.style.display = 'block';
        }
        this.prevEducationContainer.innerHTML = data.education.map((edu, idx) => `
          <div class="preview-exp-block">
            <div class="preview-exp-header">
              <input type="text" class="preview-input-title" style="font-size: 0.95rem;" value="${edu.degree || ''} ${edu.institution ? '| ' + edu.institution : ''}" data-edu-title="${idx}">
              <input type="text" class="preview-input-text" style="width: auto; text-align: right;" value="${edu.period || ''}" data-edu-period="${idx}">
            </div>
          </div>
        `).join('');
      } else {
        this.prevEducationContainer.innerHTML = '';
        if (this.prevEducationContainer.previousElementSibling) {
          this.prevEducationContainer.previousElementSibling.style.display = 'none';
        }
      }
    }
  }

  collectDataFromPreview() {
    const skillsArray = this.prevSkills.value.split('•').map(s => s.trim()).filter(Boolean);

    const projects = [];
    if (this.prevProjectsContainer) {
      this.prevProjectsContainer.querySelectorAll('.preview-exp-block').forEach((block, idx) => {
        const name = block.querySelector(`[data-proj-name="${idx}"]`)?.value || '';
        const techStack = block.querySelector(`[data-proj-tech="${idx}"]`)?.value || '';
        const descRaw = block.querySelector(`[data-proj-desc="${idx}"]`)?.value || '';

        projects.push({
          name: name,
          techStack: techStack,
          description: descRaw.split('\n').map(d => d.trim()).filter(Boolean)
        });
      });
    }

    const experience = [];
    if (this.prevExperienceContainer) {
      this.prevExperienceContainer.querySelectorAll('.preview-exp-block').forEach((block, idx) => {
        const roleComp = block.querySelector(`[data-exp-role="${idx}"]`)?.value || '';
        const period = block.querySelector(`[data-exp-period="${idx}"]`)?.value || '';
        const achievementsRaw = block.querySelector(`[data-exp-achievements="${idx}"]`)?.value || '';

        const [role, company] = roleComp.split('—').map(s => s.trim());

        experience.push({
          role: role || roleComp,
          company: company || '',
          period: period,
          achievements: achievementsRaw.split('\n').map(a => a.trim()).filter(Boolean)
        });
      });
    }

    const education = [];
    if (this.prevEducationContainer) {
      this.prevEducationContainer.querySelectorAll('.preview-exp-block').forEach((block, idx) => {
        const titleInst = block.querySelector(`[data-edu-title="${idx}"]`)?.value || '';
        const period = block.querySelector(`[data-edu-period="${idx}"]`)?.value || '';
        const [degree, institution] = titleInst.split('|').map(s => s.trim());

        education.push({
          degree: degree || titleInst,
          institution: institution || '',
          period: period
        });
      });
    }

    return {
      fullName: this.prevFullName.value,
      targetRole: this.prevTargetRole.value,
      aboutMe: this.prevSummary.value,
      contactInfo: this.currentRewrittenData?.contactInfo || {},
      projects: projects,
      experience: experience,
      education: education,
      certifications: this.currentRewrittenData?.certifications || [],
      languages: this.currentRewrittenData?.languages || [],
      skills: skillsArray
    };
  }

  enableExportButtons() {
    if (this.btnGenerateDocx) this.btnGenerateDocx.disabled = false;
    if (this.btnPrintPdf) this.btnPrintPdf.disabled = false;
    if (this.btnExportMd) this.btnExportMd.disabled = false;
    if (this.btnExportJson) this.btnExportJson.disabled = false;
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
    if (output && data) {
      if (agent === 'summary') {
        output.textContent = data.summary;
      } else {
        output.innerHTML = `
          <strong>${data.summary || ''}</strong>
          ${data.strengths && data.strengths.length ? `<div class="card-section-title" style="color: var(--status-success);">Puntos Fuertes:</div><ul class="bullet-list">${data.strengths.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
          ${data.weaknesses && data.weaknesses.length ? `<div class="card-section-title" style="color: var(--status-danger);">A Mejorar:</div><ul class="bullet-list">${data.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>` : ''}
          ${data.recommendations && data.recommendations.length ? `<div class="card-section-title" style="color: var(--accent-primary);">Recomendaciones:</div><ul class="bullet-list">${data.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
        `;
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