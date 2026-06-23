import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabase';

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
 * Renders element to PDF, uploads to Supabase Storage, returns public URL.
 * Bucket "documents" must exist and be public in Supabase.
 */
export async function uploadPdfAndGetUrl(element: HTMLElement, filename: string): Promise<string> {
  const pdf = await buildPdf(element, { scale: 1.5, quality: 0.85 });
  const pdfBlob = pdf.output('blob');

  const path = `booth-docs/${Date.now()}_${filename}`;
  const { error } = await supabase.storage.from('documents').upload(path, pdfBlob, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (error) throw new Error('PDF upload алдаа: ' + error.message);

  const { data } = supabase.storage.from('documents').getPublicUrl(path);
  return data.publicUrl;
}
