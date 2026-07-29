import { STORAGE_KEYS } from '../config/constants.js';

export class ThemeController {
  constructor() {
    this.html = document.documentElement;
    this.toggleBtn = document.getElementById('themeToggleBtn');
    this.themeIcon = document.getElementById('themeIcon');
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    this.applyTheme(savedTheme);

    this.toggleBtn.addEventListener('click', () => {
      const currentTheme = this.html.getAttribute('data-theme');
      this.applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  applyTheme(theme) {
    this.html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}