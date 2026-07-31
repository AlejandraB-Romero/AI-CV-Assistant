export class RadarChartService {
  /**
   * Renderiza un gráfico Radar SVG interactivo y responsive
   * @param {HTMLElement} container - Elemento donde se insertará el SVG
   * @param {Object} scores - Objeto con las notas { ats, recruiter, grammar, technical, linkedin, career }
   */
  static render(container, scores = {}) {
    if (!container) return;

    const data = [
      { label: 'ATS', value: scores.ats || 0 },
      { label: 'Recruiter', value: scores.recruiter || 0 },
      { label: 'Grammar', value: scores.grammar || 0 },
      { label: 'Technical', value: scores.technical || 0 },
      { label: 'LinkedIn', value: scores.linkedin || 0 },
      { label: 'Coach', value: scores.career || 0 }
    ];

    const size = 340;
    const center = size / 2;
    const radius = 110;
    const totalAxes = data.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    // Calcular coordenadas (x, y) dada una puntuación (0 - 100) y un índice
    const getCoordinates = (val, index) => {
      const r = (val / 100) * radius;
      const angle = index * angleSlice - Math.PI / 2;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    // Generar telaraña de fondo (niveles: 25%, 50%, 75%, 100%)
    let gridLevelsHtml = '';
    [0.25, 0.5, 0.75, 1].forEach(level => {
      const levelPoints = data.map((_, i) => {
        const coords = getCoordinates(level * 100, i);
        return `${coords.x},${coords.y}`;
      }).join(' ');
      gridLevelsHtml += `<polygon points="${levelPoints}" fill="none" stroke="var(--border-color, #334155)" stroke-width="1" stroke-dasharray="${level === 1 ? '0' : '3,3'}" />`;
    });

    // Generar ejes desde el centro y etiquetas
    let axesHtml = '';
    let labelsHtml = '';
    data.forEach((d, i) => {
      const outerCoords = getCoordinates(100, i);
      const labelCoords = getCoordinates(126, i);

      axesHtml += `<line x1="${center}" y1="${center}" x2="${outerCoords.x}" y2="${outerCoords.y}" stroke="var(--border-color, #334155)" stroke-width="1" />`;

      labelsHtml += `
        <text x="${labelCoords.x}" y="${labelCoords.y}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="var(--text-main, #f8fafc)" font-size="12px" font-weight="600">
          ${d.label} (${d.value}/100)
        </text>
      `;
    });

    // Generar polígono de resultados del candidato
    const polygonPoints = data.map((d, i) => {
      const coords = getCoordinates(d.value, i);
      return `${coords.x},${coords.y}`;
    }).join(' ');

    // Generar puntos destacados (nodos)
    const pointsHtml = data.map((d, i) => {
      const coords = getCoordinates(d.value, i);
      return `<circle cx="${coords.x}" cy="${coords.y}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="2" />`;
    }).join('');

    const svgHtml = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="max-width: 100%; height: auto; overflow: visible;">
        <!-- Telaraña de fondo -->
        ${gridLevelsHtml}
        <!-- Ejes radiales -->
        ${axesHtml}
        <!-- ÁREA RELLENA DEL CANDIDATO -->
        <polygon points="${polygonPoints}" 
                 fill="rgba(37, 99, 235, 0.35)" 
                 stroke="#2563eb" 
                 stroke-width="2.5" 
                 stroke-linejoin="round"
                 style="transition: all 0.5s ease-in-out;" />
        <!-- PUNTOS -->
        ${pointsHtml}
        <!-- ETIQUETAS -->
        ${labelsHtml}
      </svg>
    `;

    container.innerHTML = svgHtml;
  }
}