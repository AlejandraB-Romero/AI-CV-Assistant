import { StorageService } from '../../services/storage.service.js';

/**
 * history.component.js
 * Componente encargo de listar los análisis guardados en LocalStorage
 * y permitir volver a cargarlos en la UI.
 */
export class HistoryComponent {
  /**
   * @param {Object} appRef - Referencia al controlador principal de la aplicación
   */
  constructor(appRef) {
    this.app = appRef;
    this.initDOM();
  }

  /**
   * Elementos del DOM de la vista "view-history"
   */
  initDOM() {
    this.historyList = document.getElementById('historyList');
  }

  /**
   * Renderiza la lista completa de evaluaciones guardadas
   */
  render() {
    if (!this.historyList) return;

    const history = StorageService.getHistory();

    if (!history.length) {
      this.historyList.innerHTML = `
        <p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">
          No hay análisis guardados en el historial local.
        </p>
      `;
      return;
    }

    this.historyList.innerHTML = history.map(item => `
      <div class="history-item" data-id="${item.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 0.75rem; cursor: pointer; transition: background 0.2s;">
        <div class="history-item-info">
          <div class="history-item-title" style="font-weight: bold; color: var(--text-main);">📄 ${item.fileName || 'CV_Sin_Nombre'}</div>
          <div class="history-item-meta" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
            Modelo: ${item.model || 'Local LLM'} • ${item.formattedDate || ''} • Sector: ${item.sectorLabel || 'General'}
          </div>
        </div>
        <div class="history-item-score" style="font-size: 1.2rem; font-weight: bold; color: var(--accent-primary);">
          ${item.globalScore}/100
        </div>
      </div>
    `).join('');

    // Evento para volver a cargar la evaluación al hacer clic
    this.historyList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const selected = history.find(h => h.id === id);
        if (selected) {
          this.app.loadAnalysisFromHistory(selected);
          // Cambiar a la vista del dashboard para ver los resultados
          this.app.navCtrl.switchView('view-dashboard');
        }
      });
    });
  }
}