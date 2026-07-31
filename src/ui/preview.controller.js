import { AGENT_PROMPTS } from '../agents/agent.prompts.js';
import { DocxService } from '../services/docx.service.js';

export class PreviewController {
  constructor(app) {
    this.app = app;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.previewModal = document.getElementById('previewModal');
    this.btnClosePreview = document.getElementById('btnClosePreview');
    this.btnCancelPreview = document.getElementById('btnCancelPreview');
    this.btnConfirmDownloadDocx = document.getElementById('btnConfirmDownloadDocx');
    this.btnGenerateDocx = document.getElementById('btnGenerateDocx');

    this.prevFullName = document.getElementById('prevFullName');
    this.prevTargetRole = document.getElementById('prevTargetRole');
    this.prevSummary = document.getElementById('prevSummary');
    this.prevProjectsTitle = document.getElementById('prevProjectsTitle');
    this.prevProjectsContainer = document.getElementById('prevProjectsContainer');
    this.prevExpTitle = document.getElementById('prevExpTitle');
    this.prevExperienceContainer = document.getElementById('prevExperienceContainer');
    this.prevEduTitle = document.getElementById('prevEduTitle');
    this.prevEducationContainer = document.getElementById('prevEducationContainer');
    this.prevSkills = document.getElementById('prevSkills');
  }

  bindEvents() {
    if (this.btnGenerateDocx) {
      this.btnGenerateDocx.addEventListener('click', () => this.generateDraft());
    }
    if (this.btnClosePreview) {
      this.btnClosePreview.addEventListener('click', () => this.close());
    }
    if (this.btnCancelPreview) {
      this.btnCancelPreview.addEventListener('click', () => this.close());
    }
    if (this.btnConfirmDownloadDocx) {
      this.btnConfirmDownloadDocx.addEventListener('click', () => this.downloadWord());
    }
  }

  async generateDraft() {
    if (!this.app.lastAnalysisData) return;

    const cvText = this.app.getCVText();
    const model = this.app.modelInput.value;

    this.btnGenerateDocx.disabled = true;
    this.btnGenerateDocx.textContent = '⏳ Redactando borrador...';

    try {
      this.app.addLog('orchestrator', 'Generando versión estructurada para vista previa...');
      const prompt = AGENT_PROMPTS.REWRITER(cvText, this.app.lastAnalysisData.finalSummaryText);
      const rawResponse = await this.app.ollamaService.query(model, prompt);
      this.app.currentRewrittenData = this.app.orchestrator.parseAgentResponse(rawResponse);

      this.populate(this.app.currentRewrittenData);
      this.open();
    } catch (err) {
      alert(`Error al generar borrador: ${err.message}`);
      this.app.addLog('error', `Error en reescritura: ${err.message}`);
    } finally {
      this.btnGenerateDocx.disabled = false;
      this.btnGenerateDocx.textContent = '✨ Generar Word (.docx)';
    }
  }

  populate(data) {
    if (!data) return;
    this.prevFullName.value = data.fullName || '';
    this.prevTargetRole.value = data.targetRole || '';
    this.prevSummary.value = data.aboutMe || data.summaryProfile || '';

    // Proyectos
    if (this.prevProjectsContainer) {
      if (Array.isArray(data.projects) && data.projects.length) {
        if (this.prevProjectsTitle) this.prevProjectsTitle.style.display = 'block';
        this.prevProjectsContainer.style.display = 'block';
        this.prevProjectsContainer.innerHTML = data.projects.map((proj, idx) => `
          <div class="preview-exp-block preview-project-block">
            <div class="preview-exp-header">
              <input type="text" class="preview-input-title preview-project-title" value="${proj.name || ''}" data-proj-name="${idx}">
              <input type="text" class="preview-input-text preview-project-tech" value="${proj.techStack || ''}" data-proj-tech="${idx}">
            </div>
            <textarea class="preview-textarea" rows="2" data-proj-desc="${idx}">${(proj.description || []).join('\n')}</textarea>
          </div>
        `).join('');
      } else {
        if (this.prevProjectsTitle) this.prevProjectsTitle.style.display = 'none';
        this.prevProjectsContainer.style.display = 'none';
        this.prevProjectsContainer.innerHTML = '';
      }
    }

    // Experiencia
    if (this.prevExperienceContainer) {
      if (Array.isArray(data.experience) && data.experience.length) {
        if (this.prevExpTitle) this.prevExpTitle.style.display = 'block';
        this.prevExperienceContainer.style.display = 'block';
        this.prevExperienceContainer.innerHTML = data.experience.map((exp, idx) => `
          <div class="preview-exp-block">
            <div class="preview-exp-header">
              <input type="text" class="preview-input-title" value="${exp.role || ''} ${exp.company ? '— ' + exp.company : ''}" data-exp-role="${idx}">
              <input type="text" class="preview-input-text" value="${exp.period || ''}" data-exp-period="${idx}">
            </div>
            <textarea class="preview-textarea" rows="2" data-exp-achievements="${idx}">${(exp.achievements || []).join('\n')}</textarea>
          </div>
        `).join('');
      } else {
        if (this.prevExpTitle) this.prevExpTitle.style.display = 'none';
        this.prevExperienceContainer.style.display = 'none';
        this.prevExperienceContainer.innerHTML = '';
      }
    }

    // Educación
    if (this.prevEducationContainer) {
      if (Array.isArray(data.education) && data.education.length) {
        if (this.prevEduTitle) this.prevEduTitle.style.display = 'block';
        this.prevEducationContainer.style.display = 'block';
        this.prevEducationContainer.innerHTML = data.education.map((edu, idx) => `
          <div class="preview-exp-block">
            <div class="preview-exp-header">
              <input type="text" class="preview-input-title" value="${edu.degree || ''} ${edu.institution ? '| ' + edu.institution : ''}" data-edu-title="${idx}">
              <input type="text" class="preview-input-text" value="${edu.period || ''}" data-edu-period="${idx}">
            </div>
          </div>
        `).join('');
      } else {
        if (this.prevEduTitle) this.prevEduTitle.style.display = 'none';
        this.prevEducationContainer.style.display = 'none';
        this.prevEducationContainer.innerHTML = '';
      }
    }

    // Skills unificadas
    const allSkills = [
      ...(Array.isArray(data.techStack) ? data.techStack : []),
      ...(Array.isArray(data.tools) ? data.tools : []),
      ...(Array.isArray(data.skills) ? data.skills : [])
    ];
    this.prevSkills.value = [...new Set(allSkills)].join(' • ');
  }

  collectData() {
    const skillsArray = this.prevSkills.value.split('•').map(s => s.trim()).filter(Boolean);

    const projects = [];
    if (this.prevProjectsContainer) {
      this.prevProjectsContainer.querySelectorAll('.preview-exp-block').forEach((block, idx) => {
        const name = block.querySelector(`[data-proj-name="${idx}"]`)?.value || '';
        const techStack = block.querySelector(`[data-proj-tech="${idx}"]`)?.value || '';
        const descRaw = block.querySelector(`[data-proj-desc="${idx}"]`)?.value || '';

        projects.push({
          name,
          techStack,
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
          period,
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
          period
        });
      });
    }

    return {
      fullName: this.prevFullName.value,
      targetRole: this.prevTargetRole.value,
      aboutMe: this.prevSummary.value,
      contactInfo: this.app.currentRewrittenData?.contactInfo || {},
      projects,
      experience,
      education,
      certifications: this.app.currentRewrittenData?.certifications || [],
      languages: this.app.currentRewrittenData?.languages || [],
      skills: skillsArray
    };
  }

  async downloadWord() {
    const editedData = this.collectData();
    this.btnConfirmDownloadDocx.disabled = true;
    this.btnConfirmDownloadDocx.textContent = '⏳ Compilando .docx...';

    try {
      await DocxService.generateAndDownload(editedData, `CV_${editedData.fullName.replace(/\s+/g, '_')}.docx`);
      this.app.addLog('sys', '¡Archivo Word (.docx) descargado con éxito!');
      this.close();
    } catch (err) {
      alert(`Error al guardar documento: ${err.message}`);
    } finally {
      this.btnConfirmDownloadDocx.disabled = false;
      this.btnConfirmDownloadDocx.textContent = '📥 Descargar en Word (.docx)';
    }
  }

  open() {
    this.previewModal.style.display = 'flex';
  }

  close() {
    this.previewModal.style.display = 'none';
  }
}