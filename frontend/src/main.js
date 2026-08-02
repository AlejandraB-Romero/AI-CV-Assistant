import { AppController } from './ui/app.controller.js';

// Inicialización limpia de la SPA
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController(null, null);
});