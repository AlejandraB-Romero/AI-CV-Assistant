/**
 * theme.controller.js
 * Conmutador Claro / Oscuro. Actualiza 'data-theme' en <html> y persiste en LocalStorage.
 */
export class ThemeController {
  constructor() {
    this.initDOM();
    this.bindEvents();
    this.applyInitialTheme();
  }

  initDOM() {
    this.btnToggle = document.getElementById('themeToggleBtn');
    this.iconEl = document.getElementById('themeIcon');
    this.htmlEl = document.documentElement;
  }

  bindEvents() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  applyInitialTheme() {
    const savedTheme = localStorage.getItem('cv_auditor_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
  }

  toggleTheme() {
    const currentTheme = this.htmlEl.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme) {
    this.htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('cv_auditor_theme', theme);

    if (this.iconEl) {
      this.iconEl.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
}