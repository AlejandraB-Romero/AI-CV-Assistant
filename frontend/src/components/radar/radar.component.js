/**
 * radar.component.js
 * Componente encargado de renderizar el gráfico vectorial Radar 360°.
 */
export class RadarComponent {
  constructor(containerId = 'radarSvgWrapper') {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
  }

  initDOM(containerId = this.containerId) {
    this.container = document.getElementById(containerId);
  }

  render(scores = {}) {
    this.initDOM();
    if (!this.container) return;

    const axesData = [
      { label: 'ATS', value: scores.ats || 0 },
      { label: 'Recruiter', value: scores.recruiter || 0 },
      { label: 'Grammar', value: scores.grammar || 0 },
      { label: 'Technical', value: scores.technical || 0 },
      { label: 'LinkedIn', value: scores.linkedin || 0 },
      { label: 'Coach', value: scores.career || 0 }
    ];

    const svgSize = 340;
    const centerPoint = svgSize / 2;
    const maxRadius = 110;
    const totalAxes = axesData.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    const calculatePoint = (scoreValue, axisIndex) => {
      const currentRadius = (scoreValue / 100) * maxRadius;
      const angle = axisIndex * angleStep - Math.PI / 2;
      return {
        x: centerPoint + currentRadius * Math.cos(angle),
        y: centerPoint + currentRadius * Math.sin(angle)
      };
    };

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

    let radialLinesHtml = '';
    let textLabelsHtml = '';
    axesData.forEach((axis, i) => {
      const outerLimit = calculatePoint(100, i);
      const labelPos = calculatePoint(125, i);

      radialLinesHtml += `
        <line x1="${centerPoint}" y1="${centerPoint}" 
              x2="${outerLimit.x}" y2="${outerLimit.y}" 
              stroke="var(--border-color, #334155)" stroke-width="1" />
      `;

      textLabelsHtml += `
        <text x="${labelPos.x}" y="${labelPos.y}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="var(--text-main, #f8fafc)" font-size="12px" font-weight="600">
          ${axis.label} (${axis.value}/100)
        </text>
      `;
    });

    const candidatePolygonPoints = axesData.map((axis, i) => {
      const coords = calculatePoint(axis.value, i);
      return `${coords.x},${coords.y}`;
    }).join(' ');

    const vertexCirclesHtml = axesData.map((axis, i) => {
      const coords = calculatePoint(axis.value, i);
      return `<circle cx="${coords.x}" cy="${coords.y}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="2" />`;
    }).join('');

    this.container.innerHTML = `
      <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" style="max-width: 100%; height: auto; overflow: visible;">
        ${backgroundWebHtml}
        ${radialLinesHtml}
        <polygon points="${candidatePolygonPoints}" 
                 fill="rgba(37, 99, 235, 0.35)" 
                 stroke="#2563eb" 
                 stroke-width="2.5" 
                 stroke-linejoin="round"
                 style="transition: all 0.5s ease-in-out;" />
        ${vertexCirclesHtml}
        ${textLabelsHtml}
      </svg>
    `;
  }

  reset() {
    this.initDOM();
    if (this.container) {
      this.container.innerHTML = `
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          🚀 Ejecuta la orquestación multi-agente para generar la huella gráfica de habilidades.
        </p>
      `;
    }
  }
}