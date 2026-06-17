import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Renders a DOM element to a multi-page A4 PDF document. */
async function buildPdf(element: HTMLElement, opts: { scale?: number; quality?: number } = {}): Promise<jsPDF> {
  const scale = opts.scale ?? 2;
  const quality = opts.quality ?? 1.0;
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const useJpeg = quality < 1.0;
  const imgData = useJpeg
    ? canvas.toDataURL('image/jpeg', quality)
    : canvas.toDataURL('image/png');
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

/** Renders the element to a PDF and returns the raw base64 (no data-URI prefix).
 *  Uses lower scale + JPEG compression to keep email attachment size small. */
export async function elementToPdfBase64(element: HTMLElement): Promise<string> {
  const pdf = await buildPdf(element, { scale: 1, quality: 0.7 });
  const dataUri = pdf.output('datauristring'); // data:application/pdf;filename=...;base64,XXXX
  const base64 = dataUri.substring(dataUri.indexOf('base64,') + 'base64,'.length);
  return base64;
}
