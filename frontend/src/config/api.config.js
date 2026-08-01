/**
 * api.config.js
 * Configuración para el servidor local de LM Studio
 */
export const API_CONFIG = {
  BONSAI: {
    API_KEY: 'lm-studio-local', // No se valida, sirve cualquier texto
    BASE_URL: 'http://localhost:1234/v1', // 👈 Servidor local de LM Studio
    MODEL: 'prism-ml/bonsai-27b' // Nombre del modelo en tu biblioteca
  }
};