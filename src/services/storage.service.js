import { STORAGE_KEYS } from '../config/constants.js';

export class StorageService {
  static saveAnalysis(analysisData) {
    const history = this.getHistory();
    
    const record = {
      id: 'analysis_' + Date.now(),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      fileName: analysisData.fileName || 'CV_Texto_Plano',
      model: analysisData.model,
      globalScore: analysisData.globalScore,
      totalDuration: analysisData.totalDuration,
      results: analysisData.results,
      finalSummaryText: analysisData.finalSummaryText
    };

    history.unshift(record);
    if (history.length > 10) history.pop();

    localStorage.setItem(STORAGE_KEYS.THEME + '_history', JSON.stringify(history));
    return record;
  }

  static getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME + '_history');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer el historial:', e);
      return [];
    }
  }

  static clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.THEME + '_history');
  }
}