/**
 * main.js
 * Punto de entrada principal de la SPA.
 */
import { OllamaService } from './services/ollama.service.js';
import { AgentOrchestrator } from './agents/agent.orchestrator.js';
import { AppController } from './ui/app.controller.js';
import { ThemeController } from './ui/theme.controller.js'; // Importamos elThemeController

// Instanciación de servicios globales
const ollamaService = new OllamaService();
const orchestrator = new AgentOrchestrator(ollamaService);

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar el controlador del tema (funciona en todo el Header)
  window.themeCtrl = new ThemeController();

  // 2. Inicializar el controlador general de la SPA
  window.app = new AppController(orchestrator, ollamaService);
});