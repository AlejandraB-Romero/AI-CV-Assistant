/**
 * main.js
 * Punto de entrada principal (Entry Point) de la SPA.
 * Inicializa los servicios centrales y el controlador principal de la interfaz.
 */
import { OllamaService } from './services/ollama.service.js';
import { AgentOrchestrator } from './agents/agent.orchestrator.js';
import { AppController } from './ui/app.controller.js';

// Instanciación de servicios globales
const ollamaService = new OllamaService();
const orchestrator = new AgentOrchestrator(ollamaService);

// Inicialización del controlador SPA cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController(orchestrator, ollamaService);
});