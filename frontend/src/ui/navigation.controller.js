import { DashboardTemplate } from '../components/dashboard/dashboard.template.js';
import { CoverLetterTemplate } from '../components/cover-letter/cover-letter.template.js';
import { InterviewTemplate } from '../components/interview/interview.template.js';
import { RadarTemplate } from '../components/radar/radar.template.js';
import { ComparatorTemplate } from '../components/comparator/comparator.template.js';
import { HistoryTemplate } from '../components/history/history.template.js';

/**
 * NavigationController.js
 * Gestiona el enrutamiento dinámico SPA inyectando las plantillas HTML en <main id="app-router-outlet">.
 */
export class NavigationController {
  constructor(appRef) {
    this.app = appRef;
    this.outlet = document.getElementById('app-router-outlet');
    this.navButtons = document.querySelectorAll('.sidebar-nav-btn');

    this.templates = {
      'view-dashboard': DashboardTemplate,
      'view-cover-letter': CoverLetterTemplate,
      'view-interview': InterviewTemplate,
      'view-analytics': RadarTemplate,
      'view-comparator': ComparatorTemplate,
      'view-history': HistoryTemplate
    };

    this.bindEvents();
    this.switchView('view-dashboard');
  }

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

  switchView(viewId) {
    this.navButtons.forEach(btn => {
      if (btn.dataset.view === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const template = this.templates[viewId];
    if (template && this.outlet) {
      this.outlet.innerHTML = template;
      this.bindComponentEvents(viewId);
    }
  }

  bindComponentEvents(viewId) {
    if (!this.app) return;

    if (viewId === 'view-dashboard') {
      this.app.initDOM();
      this.app.bindEvents();
      if (this.app.lastAnalysisData) {
        this.app.restoreDashboardState(this.app.lastAnalysisData);
      }
    } else if (viewId === 'view-cover-letter' && this.app.coverLetterComp) {
      this.app.coverLetterComp.initDOM();
      this.app.coverLetterComp.bindEvents();
    } else if (viewId === 'view-interview' && this.app.interviewComp) {
      this.app.interviewComp.initDOM();
    } else if (viewId === 'view-analytics') {
      if (this.app.radarComp) {
        this.app.radarComp.initDOM('radarSvgWrapper');
      }
      if (this.app.lastAnalysisData) {
        this.app.renderRadarFromData(this.app.lastAnalysisData);
      }
    } else if (viewId === 'view-comparator' && this.app.comparatorComp) {
      this.app.comparatorComp.initDOM();
      this.app.comparatorComp.bindEvents();
    } else if (viewId === 'view-history' && this.app.historyComp) {
      this.app.historyComp.initDOM();
      this.app.historyComp.render();
    }
  }
}