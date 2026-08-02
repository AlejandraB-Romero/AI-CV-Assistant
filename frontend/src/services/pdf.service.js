/**
 * PDFService.js
 * Servicio para extracción de texto desde archivos PDF usando PDF.js
 */
export class PDFService {
  static async extractText(file) {
    if (!file) {
      throw new Error('No se ha proporcionado ningún archivo.');
    }

    // Detección segura de la librería global cargada vía CDN
    const pdfjs = window.pdfjsLib || window['pdfjs-dist/build/pdf'];

    if (!pdfjs) {
      throw new Error('La librería PDF.js no está cargada en el DOM. Revisa el CDN en index.html.');
    }

    // Asignación segura del Worker únicamente cuando la librería ya existe en memoria
    if (!pdfjs.GlobalWorkerOptions?.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      return fullText.trim();
    } catch (err) {
      console.error('Error procesando el documento PDF:', err);
      throw new Error(`Error al leer el archivo PDF: ${err.message}`);
    }
  }
}