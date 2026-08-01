/**
 * theme.controller.js
 * Gestiona el conmutador de tema Claro / Oscuro (Dark/Light mode).
 * Modifica el atributo 'data-theme' en el elemento <html> y persiste el estado en LocalStorage.
 */
export class ThemeController {
  constructor() {
    this.initDOM();
    this.bindEvents();
    this.applyInitialTheme();
  }

  /**
   * Captura el botón del tema y el icono en el DOM
   */
  initDOM() {
    this.btnToggle = document.getElementById('themeToggleBtn');
    this.iconEl = document.getElementById('themeIcon');
    this.htmlEl = document.documentElement; // Elemento <html>
  }

  /**
   * Asigna el listener de clic al botón de cambio de tema
   */
  bindEvents() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  /**
   * Determina el tema inicial (LocalStorage -> Preferencia del Sistema -> 'dark' por defecto)
   */
  applyInitialTheme() {
    const savedTheme = localStorage.getItem('cv_auditor_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Si hay un tema guardado se usa ese, de lo contrario se usa el del sistema o 'dark'
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
  }

  /**
   * Alterna entre los modos 'dark' y 'light'
   */
  toggleTheme() {
    const currentTheme = this.htmlEl.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  /**
   * Aplica un tema específico actualizando el DOM, el icono y LocalStorage
   * @param {string} theme - 'dark' o 'light'
   */
  setTheme(theme) {
    this.htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('cv_auditor_theme', theme);

    if (this.iconEl) {
      // ☀️ indica que al hacer clic se cambiará a claro, 🌙 a oscuro
      this.iconEl.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
}