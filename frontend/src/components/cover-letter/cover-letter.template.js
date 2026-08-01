export const CoverLetterTemplate = `
<section id="view-cover-letter" class="spa-view active">
  <div class="panel">
    <div class="panel-header">
      <h2>✉️ Carta de Presentación Persuasiva</h2>
    </div>

    <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; align-items: flex-end; max-width: 600px;">
      <div style="flex: 1;">
        <label for="targetCompanyInput" style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">
          Empresa / Entidad de destino (Opcional):
        </label>
        <input type="text" id="targetCompanyInput" class="preview-input-text" placeholder="Ej. Mercadona, Google, Hospital Central..." style="margin: 0; width: 100%;">
      </div>
      <button id="btnRegenerateCoverLetter" type="button" class="btn-primary" style="padding: 0.6rem 1.25rem;">
        🔄 Redactar Carta
      </button>
    </div>

    <div id="coverLetterLoading" style="display: none; text-align: center; padding: 3rem 1rem;">
      <div style="font-size: 1.2rem; color: var(--accent-primary);">⏳ Redactando carta personalizada con IA...</div>
      <p style="color: var(--text-muted); font-size: 0.9rem;">Adaptando tono y propuesta de valor al sector.</p>
    </div>

    <div id="coverLetterContent" style="display: none; margin-top: 1rem;">
      <div class="cv-paper-preview" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 2rem; border-radius: var(--radius-md); max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 1rem;">
          <label style="font-size: 0.8rem; color: var(--accent-primary); font-weight: bold;">ASUNTO:</label>
          <input type="text" id="coverLetterSubject" class="preview-input-title" style="font-size: 1rem; margin: 0; width: 100%;" placeholder="Asunto del mensaje...">
        </div>
        <div style="margin-bottom: 1rem;">
          <input type="text" id="coverLetterGreeting" class="preview-input-text" style="font-weight: bold; margin: 0; width: 100%;" placeholder="Saludo...">
        </div>
        <div id="coverLetterBodyContainer" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;"></div>
        <div style="margin-bottom: 1rem;">
          <textarea id="coverLetterCallToAction" class="preview-textarea" rows="2" style="width: 100%;" placeholder="Llamada a la acción..."></textarea>
        </div>
        <div>
          <textarea id="coverLetterSignOff" class="preview-textarea" rows="2" style="font-weight: bold; width: 100%;" placeholder="Despedida y firma..."></textarea>
        </div>
      </div>
      <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;">
        <button id="btnCopyCoverLetter" class="btn-secondary" type="button" style="padding: 0.75rem 1.5rem;">📋 Copiar al Portapapeles</button>
      </div>
    </div>
  </div>
</section>
`;