// Inicializar Worker Global de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export class PDFService {
  static async extractText(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- PÁGINA ${i} ---\n` + pageText + '\n\n';
      }

      if (!fullText.trim()) {
        throw new Error('El PDF no contiene texto extraíble (puede tratarse de una imagen escaneada).');
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDFService Error:', error);
      throw error;
    }
  }
}