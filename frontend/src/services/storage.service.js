// src/services/storage.service.js

class HistoryModel {
  static STORAGE_KEY = 'cv_auditor_history_v2';

  static getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer historial:', e);
      return [];
    }
  }

  static saveVersion(analysisData, parentId = null) {
    const history = this.getAll();
    const newVersion = {
      id: `cv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      parentId: parentId,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      fileName: analysisData.fileName || 'CV_Sin_Nombre',
      candidateName: analysisData.sectorContext?.candidateName || 'Candidato',
      targetRole: analysisData.targetRole || 'Profesional',
      sectorLabel: analysisData.sectorContext?.sectorLabel || 'General',
      globalScore: analysisData.globalScore || 0,
      model: analysisData.model || 'Local LLM',
      results: analysisData.results || {},
      finalSummaryText: analysisData.finalSummaryText || '',
      data: analysisData
    };

    history.unshift(newVersion);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    return newVersion;
  }

  static getVersionTree(versionId) {
    const history = this.getAll();
    const target = history.find(item => item.id === versionId);
    if (!target) return [];

    let root = target;
    while (root.parentId) {
      const parent = history.find(item => item.id === root.parentId);
      if (!parent) break;
      root = parent;
    }

    const family = [];
    const collectChildren = (parentId) => {
      const children = history.filter(item => item.parentId === parentId);
      children.forEach(child => {
        family.push(child);
        collectChildren(child.id);
      });
    };

    family.push(root);
    collectChildren(root.id);
    return family.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  static deleteVersion(versionId) {
    const history = this.getAll().filter(item => item.id !== versionId && item.parentId !== versionId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }
}

export class StorageService {
  static saveAnalysis(analysisData, parentId = null) {
    return HistoryModel.saveVersion(analysisData, parentId);
  }

  static getHistory() {
    return HistoryModel.getAll();
  }

  static getVersionHistory(versionId) {
    return HistoryModel.getVersionTree(versionId);
  }

  static deleteItem(id) {
    HistoryModel.deleteVersion(id);
  }

  static clearHistory() {
    localStorage.removeItem(HistoryModel.STORAGE_KEY);
  }
}