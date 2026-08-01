export class ExportService {
  static exportToMarkdown(analysis) {
    let md = `# INFORME DE AUDITORÍA DE CV - CV AUDITOR ENTERPRISE\n`;
    md += `**Fecha:** ${analysis.formattedDate || new Date().toLocaleString()}\n`;
    md += `**Modelo utilizado:** ${analysis.model}\n`;
    md += `**Nota Global:** ${analysis.globalScore}/100\n`;
    md += `**Tiempo de procesamiento:** ${analysis.totalDuration}s\n\n`;
    md += `---\n\n`;

    md += `## 📋 PLAN ESTRATÉGICO CONSOLIDADO\n\n`;
    md += `${analysis.finalSummaryText}\n\n`;
    md += `---\n\n`;

    md += `## 📊 EVALUACIÓN DETALLADA POR AGENTES ESPECIALISTAS\n\n`;

    Object.entries(analysis.results || {}).forEach(([agentKey, data]) => {
      md += `### 🤖 Agente ${agentKey.toUpperCase()} (Nota: ${data.score}/100)\n`;
      md += `**Resumen:** ${data.summary}\n\n`;

      if (data.strengths && data.strengths.length) {
        md += `**Puntos Fuertes:**\n`;
        data.strengths.forEach(s => md += `- ${s}\n`);
        md += `\n`;
      }

      if (data.weaknesses && data.weaknesses.length) {
        md += `**A Mejorar:**\n`;
        data.weaknesses.forEach(w => md += `- ${w}\n`);
        md += `\n`;
      }

      if (data.recommendations && data.recommendations.length) {
        md += `**Recomendaciones:**\n`;
        data.recommendations.forEach(r => md += `- ${r}\n`);
        md += `\n`;
      }
      md += `---\n\n`;
    });

    this.downloadFile(md, `Auditoria_CV_${Date.now()}.md`, 'text/markdown');
  }

  static exportToJSON(analysis) {
    const jsonStr = JSON.stringify(analysis, null, 2);
    this.downloadFile(jsonStr, `Auditoria_CV_${Date.now()}.json`, 'application/json');
  }

  static downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}