import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function buildPdf(element: HTMLElement, opts: { scale?: number; quality?: number } = {}): Promise<jsPDF> {
  const scale = opts.scale ?? 2;
  const quality = opts.quality ?? 1.0;
  const canvas = await html2canvas(element, { scale, useCORS: true, backgroundColor: '#ffffff' });

  const useJpeg = quality < 1.0;
  const imgData = useJpeg ? canvas.toDataURL('image/jpeg', quality) : canvas.toDataURL('image/png');
  const imgFormat = useJpeg ? 'JPEG' : 'PNG';
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, imgFormat, 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, imgFormat, 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  return pdf;
}

/** Renders the element to a PDF and triggers a browser download. */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const pdf = await buildPdf(element, { scale: 2, quality: 1.0 });
  pdf.save(filename);
}

/**
 * Renders element to JPEG and returns { jpegBase64, widthPx, heightPx }.
 * Server uses this to build a PDF — keeps request payload tiny (~20–50 KB each).
 */
export async function elementToJpegBase64(
  element: HTMLElement
): Promise<{ jpegBase64: string; widthPx: number; heightPx: number }> {
  const canvas = await html2canvas(element, { scale: 0.75, useCORS: true, backgroundColor: '#ffffff' });
  const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
  const jpegBase64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
  return { jpegBase64, widthPx: canvas.width, heightPx: canvas.height };
}
