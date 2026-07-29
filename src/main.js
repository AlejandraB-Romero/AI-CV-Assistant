import { ThemeController } from './ui/theme.controller.js';
import { OllamaService } from './services/ollama.service.js';
import { AgentOrchestrator } from './agents/agent.orchestrator.js';
import { AppController } from './ui/app.controller.js';

document.addEventListener('DOMContentLoaded', () => {
  new ThemeController();

  const ollama = new OllamaService();
  const orchestrator = new AgentOrchestrator(ollama);

  new AppController(orchestrator, ollama);
});