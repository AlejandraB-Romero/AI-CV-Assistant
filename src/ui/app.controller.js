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

    // Estado Ollama Header
    this.ollamaStatusEl = document.getElementById('ollamaStatus');
    this.ollamaStatusText = document.getElementById('ollamaStatusText');

    this.badges = {
      ats: document.getElementById('badge-ats'),
      recruiter: document.getElementById('badge-recruiter'),
      summary: document.getElementById('badge-summary')
    };

    this.outputs = {
      ats: document.getElementById('output-ats'),
      recruiter: document.getElementById('output-recruiter'),
      summary: document.getElementById('output-summary')
    };
  }

  startOllamaHealthCheck() {
    const verify = async () => {
      const health = await this.ollamaService.checkHealth();
      if (health.online) {
        this.ollamaStatusEl.className = 'ollama-status online';
        this.ollamaStatusText.textContent = 'Ollama Online';
      } else {
        this.ollamaStatusEl.className = 'ollama-status offline';
        this.ollamaStatusText.textContent = 'Ollama Offline';
      }
    };

    verify();
    setInterval(verify, 5000); // Comprobar cada 5s
  }

  bindEvents() {
    // Cambio de Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        document.getElementById(this.activeTab).classList.add('active');
      });
    });

    // Carga de PDF
    this.fileInput.addEventListener('change', async (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0];
        this.fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        this.dropzone.style.display = 'none';
        this.fileBadge.classList.add('visible');

        try {
          this.extractedPdfText = await PDFService.extractText(file);
          this.cvTextArea.value = this.extractedPdfText;
        } catch (err) {
          alert(`Error procesando PDF: ${err.message}`);
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
        alert('Carga un archivo PDF o pega texto para realizar el análisis.');
        return;
      }

      const model = this.modelInput.value.trim() || 'llama3';
      this.setLoading(true);

      try {
        await this.orchestrator.runPipeline(cvText, model, (step, payload) => this.handleProgress(step, payload));
      } catch (err) {
        alert(`${err.message}`);
      } finally {
        this.setLoading(false);
      }
    });
  }

  clearPdf() {
    this.extractedPdfText = '';
    this.fileInput.value = '';
    this.fileBadge.classList.remove('visible');
    this.dropzone.style.display = 'block';
  }

  handleProgress(step, payload) {
    if (step === 'ATS_START') this.setUI('ats', 'working', 'Analizando...');
    if (step === 'ATS_DONE') this.setUI('ats', 'done', 'Completado', payload);

    if (step === 'RECRUITER_START') this.setUI('recruiter', 'working', 'Analizando...');
    if (step === 'RECRUITER_DONE') this.setUI('recruiter', 'done', 'Completado', payload);

    if (step === 'SUMMARY_START') this.setUI('summary', 'working', 'Sintetizando...');
    if (step === 'SUMMARY_DONE') this.setUI('summary', 'done', 'Completado', payload);
  }

  setUI(agent, statusClass, badgeText, content) {
    const badge = this.badges[agent];
    badge.className = `agent-status-badge ${statusClass}`;
    badge.textContent = badgeText;
    if (content) this.outputs[agent].textContent = content;
  }

  setLoading(loading) {
    this.analyzeBtn.disabled = loading;
    this.analyzeBtn.textContent = loading ? '⏳ Procesando Agentes...' : '🚀 Iniciar Análisis Multi-Agente';
  }
}