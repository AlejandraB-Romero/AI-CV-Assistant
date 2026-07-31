/**
 * Plantilla HTML aislada del componente Dashboard.
 * Cuando se migre a Angular, este contenido se copia directamente a dashboard.component.html
 */
export const DashboardTemplate = `
<section id="view-dashboard" class="spa-view active">
  <div class="main-container" style="display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem;">
    <div class="panel">
      <div class="panel-header">
        <h2>📄 Entrada de CV</h2>
        <div class="tab-group">
          <button class="tab-btn active" data-tab="pdfTab">PDF</button>
          <button class="tab-btn" data-tab="textTab">Texto</button>
        </div>
      </div>

      <form id="cvForm">
        <div class="form-group">
          <label for="modelSelect">Modelo Ollama:</label>
          <select id="modelSelect" required></select>
        </div>

        <div class="form-group" style="margin-top: 0.5rem;">
          <label for="concurrencySelect">Modo Ejecución:</label>
          <select id="concurrencySelect">
            <option value="2">Balanceado (2 Agentes)</option>
            <option value="1">Modo Ahorro (1 a 1)</option>
            <option value="6">Turbo (6 Agentes)</option>
          </select>
        </div>

        <div id="pdfTab" class="tab-content active">
          <div class="dropzone" id="pdfDropzone">
            <span class="dropzone-icon">📁</span>
            <div class="dropzone-text">Arrastra tu CV en PDF aquí</div>
            <input type="file" id="pdfFileInput" class="file-input" accept="application/pdf">
          </div>
          <div class="file-badge" id="fileBadge">
            <span id="fileNameDisplay">archivo.pdf</span>
            <button type="button" class="btn-remove-file" id="btnRemoveFile">✕</button>
          </div>
        </div>

        <div id="textTab" class="tab-content">
          <textarea id="cvContent" rows="8" placeholder="Pega el texto del CV..."></textarea>
        </div>

        <button type="submit" id="analyzeBtn" class="btn-primary" style="margin-top: 1rem; width: 100%;">
          🚀 Ejecutar Orquestación
        </button>
      </form>

      <div style="margin-top: 1.5rem;">
        <label>📟 Consola de Orquestación:</label>
        <div class="console-panel" id="consoleLogs"></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h2>📊 Evaluaciones de la Suite</h2>
        <div class="dashboard-metrics" style="display: flex; gap: 1rem;">
          <div class="metric-card"><div class="metric-value" id="kpiGlobalScore">--/100</div><div class="metric-label">Nota Media</div></div>
          <div class="metric-card"><div class="metric-value" id="kpiDuration">0.0s</div><div class="metric-label">Tiempo</div></div>
        </div>
      </div>

      <div class="agent-grid">
        <article class="agent-card"><div class="agent-header">🤖 ATS Agent <span class="agent-status-badge" id="badge-ats">En espera</span></div><div class="agent-output" id="output-ats">Esperando...</div></article>
        <article class="agent-card"><div class="agent-header">👔 Recruiter Agent <span class="agent-status-badge" id="badge-recruiter">En espera</span></div><div class="agent-output" id="output-recruiter">Esperando...</div></article>
        <article class="agent-card"><div class="agent-header">✍️ Grammar Agent <span class="agent-status-badge" id="badge-grammar">En espera</span></div><div class="agent-output" id="output-grammar">Esperando...</div></article>
        <article class="agent-card"><div class="agent-header">💻 Technical Reviewer <span class="agent-status-badge" id="badge-technical">En espera</span></div><div class="agent-output" id="output-technical">Esperando...</div></article>
        <article class="agent-card"><div class="agent-header">🌐 LinkedIn Advisor <span class="agent-status-badge" id="badge-linkedin">En espera</span></div><div class="agent-output" id="output-linkedin">Esperando...</div></article>
        <article class="agent-card"><div class="agent-header">🎯 Career Coach <span class="agent-status-badge" id="badge-career">En espera</span></div><div class="agent-output" id="output-career">Esperando...</div></article>
      </div>

      <article class="agent-card summary-card" style="margin-top: 1rem;">
        <div class="agent-header">📋 Plan Estratégico Consolidado <span class="agent-status-badge" id="badge-summary">En espera</span></div>
        <div class="agent-output" id="output-summary">Esperando resumen...</div>
      </article>
    </div>
  </div>
</section>
`;