import { DashboardTemplate } from '../components/dashboard/dashboard.template.js';
import { CoverLetterTemplate } from '../components/cover-letter/cover-letter.template.js';
import { InterviewTemplate } from '../components/interview/interview.template.js';
import { RadarTemplate } from '../components/radar/radar.template.js';
import { ComparatorTemplate } from '../components/comparator/comparator.template.js';
import { HistoryTemplate } from '../components/history/history.template.js';

/**
 * NavigationController.js
 * Gestiona el enrutamiento dinámico SPA.
 * Inyecta las plantillas HTML en el <main id="app-router-outlet"> y re-conecta
 * inmediatamente los eventos para evitar botones "muertos".
 */
export class NavigationController {
  constructor(appRef) {
    this.app = appRef;
    this.outlet = document.getElementById('app-router-outlet');
    this.navButtons = document.querySelectorAll('.sidebar-nav-btn');

    // Mapa de identificadores de vista a plantillas JavaScript
    this.templates = {
      'view-dashboard': DashboardTemplate,
      'view-cover-letter': CoverLetterTemplate,
      'view-interview': InterviewTemplate,
      'view-analytics': RadarTemplate,
      'view-comparator': ComparatorTemplate,
      'view-history': HistoryTemplate
    };

    this.bindEvents();
    // Carga inicial de la vista de entrada (Dashboard)
    this.switchView('view-dashboard');
  }

  /**
   * Registra los clics en la barra de navegación lateral
   */
  bindEvents() {
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetViewId = btn.dataset.view;
        if (targetViewId) {
          this.switchView(targetViewId);
        }
      });
    });
  }

  /**
   * Cambia la plantilla visible en pantalla y reactiva los controladores
   * @param {string} viewId - Identificador de la sección (ej. 'view-dashboard')
   */
  switchView(viewId) {
    // 1. Marcar estado activo en los botones del Sidebar
    this.navButtons.forEach(btn => {
      if (btn.dataset.view === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. Inyectar la plantilla HTML correspondiente
    const template = this.templates[viewId];
    if (template && this.outlet) {
      this.outlet.innerHTML = template;
      // 3. VINCULAR DE NUEVO LOS EVENTOS DEL DOM INYECTADO
      this.bindComponentEvents(viewId);
    }
  }

  /**
   * Re-asigna referencias del DOM y listeners para los nuevos elementos recién pintados
   */
  bindComponentEvents(viewId) {
    if (!this.app) return;

    if (viewId === 'view-dashboard') {
      // Re-capturar elementos y vincular eventos del formulario principal de CV
      this.app.initDOM();
      this.app.bindEvents();
    } else if (viewId === 'view-cover-letter' && this.app.coverLetterComp) {
      this.app.coverLetterComp.initDOM();
      this.app.coverLetterComp.bindEvents();
    } else if (viewId === 'view-interview' && this.app.interviewComp) {
      this.app.interviewComp.initDOM();
      if (this.app.lastAnalysisData) this.app.interviewComp.generate();
    } else if (viewId === 'view-analytics') {
      if (this.app.lastAnalysisData) this.app.renderRadarFromData(this.app.lastAnalysisData);
    } else if (viewId === 'view-comparator' && this.app.comparatorComp) {
      this.app.comparatorComp.initDOM();
      this.app.comparatorComp.bindEvents();
    } else if (viewId === 'view-history' && this.app.historyComp) {
      this.app.historyComp.initDOM();
      this.app.historyComp.render();
    }
  }
}