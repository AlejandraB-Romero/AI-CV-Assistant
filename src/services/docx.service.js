export class DocxService {
  static async generateAndDownload(cvData, fileName = 'CV_Optimizado.docx') {
    const { docx } = window;
    if (!docx) throw new Error('La librería docx.js no está cargada.');

    const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

    // Sanitización adaptativa
    const safeData = {
      fullName: (cvData?.fullName || 'CANDIDATO').toUpperCase(),
      targetRole: (cvData?.targetRole || 'PERFIL PROFESIONAL').toUpperCase(),
      summaryProfile: cvData?.summaryProfile || 'Profesional comprometido y orientado a resultados, con sólida experiencia práctica y capacidad de adaptación a diversos entornos de trabajo. Destacado por su responsabilidad, eficacia en la resolución de tareas y trabajo en equipo.',
      experience: Array.isArray(cvData?.experience) ? cvData.experience : [],
      education: Array.isArray(cvData?.education) ? cvData.education : [],
      skills: Array.isArray(cvData?.skills) ? cvData.skills : []
    };

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1152, bottom: 1152, left: 1152, right: 1152 } } // Margen estándar de 2cm
        },
        children: [
          // ENCABEZADO PRINCIPAL (Nombre + Puesto)
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: safeData.fullName, bold: true, size: 32, font: 'Calibri', color: '0F172A' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: safeData.targetRole, bold: true, size: 20, font: 'Calibri', color: '2563EB' })
            ]
          }),

          // 1. PERFIL PROFESIONAL
          this.createSectionTitle(docx, 'PERFIL PROFESIONAL'),
          new Paragraph({
            spacing: { before: 80, after: 200 },
            children: [
              new TextRun({ text: safeData.summaryProfile, size: 20, font: 'Calibri', color: '334155' })
            ]
          }),

          // 2. EXPERIENCIA PROFESIONAL
          ...(safeData.experience.length ? [
            this.createSectionTitle(docx, 'EXPERIENCIA PROFESIONAL'),
            ...safeData.experience.flatMap(exp => [
              this.createDualRow(docx, `${exp.role || ''} ${exp.company ? '— ' + exp.company : ''}`, exp.period || ''),
              ...(Array.isArray(exp.achievements) ? exp.achievements : []).map(ach => new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [new TextRun({ text: ach, size: 19, font: 'Calibri', color: '334155' })]
              }))
            ])
          ] : []),

          // 3. FORMACIÓN Y EDUCACIÓN
          ...(safeData.education.length ? [
            new Paragraph({ spacing: { before: 120 } }),
            this.createSectionTitle(docx, 'EDUCACIÓN Y FORMACIÓN'),
            ...safeData.education.flatMap(edu => [
              this.createDualRow(docx, `${edu.degree || ''} ${edu.institution ? '| ' + edu.institution : ''}`, edu.period || ''),
              ...(Array.isArray(edu.details) ? edu.details : []).map(det => new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [new TextRun({ text: det, size: 19, font: 'Calibri', color: '334155' })]
              }))
            ])
          ] : []),

          // 4. COMPETENCIAS Y HABILIDADES
          ...(safeData.skills.length ? [
            new Paragraph({ spacing: { before: 120 } }),
            this.createSectionTitle(docx, 'COMPETENCIAS Y HABILIDADES'),
            new Paragraph({
              spacing: { before: 100, after: 200 },
              children: [
                new TextRun({ text: safeData.skills.join('  •  '), size: 20, font: 'Calibri', color: '1E293B' })
              ]
            })
          ] : [])
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static createDualRow(docx, leftText, rightText) {
    const { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle, AlignmentType } = docx;
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 100, after: 30 },
                  children: [new TextRun({ text: leftText, bold: true, size: 20, font: 'Calibri', color: '0F172A' })]
                })
              ]
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 100, after: 30 },
                  children: [new TextRun({ text: rightText, italic: true, size: 19, font: 'Calibri', color: '64748B' })]
                })
              ]
            })
          ]
        })
      ]
    });
  }

  static createSectionTitle(docx, title) {
    const { Paragraph, TextRun, BorderStyle } = docx;
    return new Paragraph({
      spacing: { before: 180, after: 60 },
      border: {
        bottom: { color: '2563EB', space: 4, style: BorderStyle.SINGLE, size: 10 }
      },
      children: [
        new TextRun({ text: title, bold: true, size: 21, font: 'Calibri', color: '0F172A' })
      ]
    });
  }
}