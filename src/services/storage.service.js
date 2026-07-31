import { HistoryModel } from '../models/history.model.js';

export class StorageService {
  /**
   * Guarda un nuevo análisis vinculándolo opcionalmente a un nodo padre (v1 -> v2)
   */
  static saveAnalysis(analysisData, parentId = null) {
    return HistoryModel.saveVersion(analysisData, parentId);
  }

  /**
   * Recupera todo el historial de análisis/versiones
   */
  static getHistory() {
    return HistoryModel.getAll();
  }

  /**
   * Obtiene el árbol o linaje completo de versiones asociadas a un CV
   */
  static getVersionHistory(versionId) {
    return HistoryModel.getVersionTree(versionId);
  }

  /**
   * Elimina un elemento del historial por su ID
   */
  static deleteItem(id) {
    HistoryModel.deleteVersion(id);
  }

  /**
   * Vacía todo el historial
   */
  static clearHistory() {
    localStorage.removeItem(HistoryModel.STORAGE_KEY);
  }
}