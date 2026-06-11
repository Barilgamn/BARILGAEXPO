import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Renders a DOM element to a multi-page A4 PDF document. */
async function buildPdf(element: HTMLElement): Promise<jsPDF> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
}

/** Renders the element to a PDF and triggers a browser download. */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const pdf = await buildPdf(element);
  pdf.save(filename);
}

/** Renders the element to a PDF and returns the raw base64 (no data-URI prefix). */
export async function elementToPdfBase64(element: HTMLElement): Promise<string> {
  const pdf = await buildPdf(element);
  const dataUri = pdf.output('datauristring'); // data:application/pdf;filename=...;base64,XXXX
  const base64 = dataUri.substring(dataUri.indexOf('base64,') + 'base64,'.length);
  return base64;
}
