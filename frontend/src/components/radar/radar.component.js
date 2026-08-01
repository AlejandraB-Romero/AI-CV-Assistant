/**
 * radar.component.js
 * Componente encargarlo de renderizar la Huella Digital 360° en formato SVG.
 * Encapsula la lógica matemática y de dibujo del Radar Chart.
 */
export class RadarComponent {
  /**
   * @param {string} containerId - ID del contenedor en el DOM donde se renderizará el SVG
   */
  constructor(containerId = 'radarSvgWrapper') {
    // Referencia al elemento del DOM
    this.container = document.getElementById(containerId);
  }

  /**
   * Dibujar el gráfico vectorial SVG basado en las puntuaciones recibidas
   * @param {Object} scores - Objeto con notas { ats, recruiter, grammar, technical, linkedin, career }
   */
  render(scores = {}) {
    if (!this.container) return;

    // 1. Estructuración de datos para los 6 ejes del radar
    const axesData = [
      { label: 'ATS', value: scores.ats || 0 },
      { label: 'Recruiter', value: scores.recruiter || 0 },
      { label: 'Grammar', value: scores.grammar || 0 },
      { label: 'Technical', value: scores.technical || 0 },
      { label: 'LinkedIn', value: scores.linkedin || 0 },
      { label: 'Coach', value: scores.career || 0 }
    ];

    // Constantes de dimensiones geométricas del lienzo SVG
    const svgSize = 340;
    const centerPoint = svgSize / 2;
    const maxRadius = 110;
    const totalAxes = axesData.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    /**
     * Helper interno para calcular coordenadas cartesianas (X, Y)
     * a partir de un valor de puntuación (0 a 100) y el índice del eje.
     */
    const calculatePoint = (scoreValue, axisIndex) => {
      const currentRadius = (scoreValue / 100) * maxRadius;
      const angle = axisIndex * angleStep - Math.PI / 2; // -90º para empezar arriba
      return {
        x: centerPoint + currentRadius * Math.cos(angle),
        y: centerPoint + currentRadius * Math.sin(angle)
      };
    };

    // 2. Generar telaraña poligonal de fondo (Guías al 25%, 50%, 75% y 100%)
    let backgroundWebHtml = '';
    [0.25, 0.5, 0.75, 1.0].forEach(levelRatio => {
      const polygonPoints = axesData.map((_, i) => {
        const coords = calculatePoint(levelRatio * 100, i);
        return `${coords.x},${coords.y}`;
      }).join(' ');

      backgroundWebHtml += `
        <polygon points="${polygonPoints}" 
                 fill="none" 
                 stroke="var(--border-color, #334155)" 
                 stroke-width="1" 
                 stroke-dasharray="${levelRatio === 1 ? '0' : '3,3'}" />
      `;
    });

    // 3. Generar líneas de ejes radiales y textos de etiquetas
    let radialLinesHtml = '';
    let textLabelsHtml = '';
    axesData.forEach((axis, i) => {
      const outerLimit = calculatePoint(100, i);
      const labelPos = calculatePoint(125, i);

      // Línea desde el centro hasta el borde
      radialLinesHtml += `
        <line x1="${centerPoint}" y1="${centerPoint}" 
              x2="${outerLimit.x}" y2="${outerLimit.y}" 
              stroke="var(--border-color, #334155)" stroke-width="1" />
      `;

      // Texto de la métrica
      textLabelsHtml += `
        <text x="${labelPos.x}" y="${labelPos.y}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="var(--text-main, #f8fafc)" font-size="12px" font-weight="600">
          ${axis.label} (${axis.value}/100)
        </text>
      `;
    });

    // 4. Generar la figura semitransparente del candidato
    const candidatePolygonPoints = axesData.map((axis, i) => {
      const coords = calculatePoint(axis.value, i);
      return `${coords.x},${coords.y}`;
    }).join(' ');

    // Puntos/Vértices sobre las esquinas
    const vertexCirclesHtml = axesData.map((axis, i) => {
      const coords = calculatePoint(axis.value, i);
      return `<circle cx="${coords.x}" cy="${coords.y}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="2" />`;
    }).join('');

    // 5. Ensamblado final de la plantilla SVG
    this.container.innerHTML = `
      <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" style="max-width: 100%; height: auto; overflow: visible;">
        <!-- Telaraña de niveles -->
        ${backgroundWebHtml}
        <!-- Ejes -->
        ${radialLinesHtml}
        <!-- Polígono del Candidato con degradado suave -->
        <polygon points="${candidatePolygonPoints}" 
                 fill="rgba(37, 99, 235, 0.35)" 
                 stroke="#2563eb" 
                 stroke-width="2.5" 
                 stroke-linejoin="round"
                 style="transition: all 0.5s ease-in-out;" />
        <!-- Vértices -->
        ${vertexCirclesHtml}
        <!-- Etiquetas de nombres y valores -->
        ${textLabelsHtml}
      </svg>
    `;
  }

  /**
   * Restablecer el componente a su estado inicial sin datos
   */
  reset() {
    if (this.container) {
      this.container.innerHTML = `
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          🚀 Ejecuta la orquestación multi-agente para generar la huella gráfica de habilidades.
        </p>
      `;
    }
  }
}