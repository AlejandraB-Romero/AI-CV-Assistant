/**
 * template-loader.js
 * Carga plantillas HTML asíncronamente para simular la arquitectura de componentes de Angular.
 */
export class TemplateLoader {
  /**
   * Carga una plantilla HTML remota/local y la inyecta en el contenedor principal
   * @param {string} path - Ruta del archivo .html
   * @param {HTMLElement} container - Contenedor donde renderizar la vista
   */
  static async loadTemplate(path, container) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP Error ${response.status} al cargar ${path}`);
      const htmlContent = await response.text();
      container.innerHTML = htmlContent;
    } catch (error) {
      console.error('Error al cargar la plantilla:', error);
      container.innerHTML = `<p style="color:var(--status-danger);">Error al cargar la vista.</p>`;
    }
  }

  /**
   * Inicializa la lógica del conmutador de tema (Dark / Light)
   */
  static initThemeToggle() {
    const themeToggleBtn = document.querySelector('#theme-toggle');

    const toggleTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      // 1. Aplica el atributo al :root [data-theme="..."]
      document.documentElement.setAttribute('data-theme', newTheme);

      // 2. Guarda la preferencia
      localStorage.setItem('theme', newTheme);
    };

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}