import React, { useRef, useState } from 'react';
import { X, Download, Loader2, FileText, Receipt, Mail } from 'lucide-react';
import { DocumentFields, buildDefaultFields } from './types';
import { ContractDocument } from './ContractDocument';
import { InvoiceDocument } from './InvoiceDocument';
import { downloadElementAsPdf, elementToJpegBase64 } from '../../utils/pdf';

interface Props {
  request: any;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  companyName: 'Байгууллагын нэр',
  registerNumber: 'Регистрийн дугаар (РД)',
  phone: 'Утас',
  email: 'И-мэйл',
  bankName: 'Банкны нэр',
  bankAccount: 'Дансны дугаар',
  contactPerson: 'Холбогдох ажилтан',
  contactPosition: 'Албан тушаал',
  productDescription: 'Бүтээгдэхүүн / үйлчилгээ',
  boothIds: 'Талбайн дугаар(ууд)',
  boothArea: 'Талбайн хэмжээ (м²)',
  pricePerM2: '1м²-ын төлбөр',
  additionalFee: 'Нэмэлт төлбөр',
  totalPriceUsd: 'Нийт төлбөр (USD)',
  totalPriceMnt: 'Нийт төлбөр (MNT)',
  signageName: 'Нэрийн самбарын бичиг',
  contractNo: 'Гэрээний дугаар',
  contractDate: 'Гэрээний огноо',
  invoiceNo: 'Нэхэмжлэхийн дугаар',
  invoiceDate: 'Нэхэмжлэхийн огноо',
};

export const DocumentModal: React.FC<Props> = ({ request, onClose }) => {
  const [fields, setFields] = useState<DocumentFields>(() => buildDefaultFields(request));
  const [activeDoc, setActiveDoc] = useState<'contract' | 'invoice'>('contract');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const contractRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const setField = (key: keyof DocumentFields, value: string | boolean) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      if (activeDoc === 'contract' && contractRef.current) {
        await downloadElementAsPdf(contractRef.current, `${fields.companyName || 'gэрээ'}_gэрээ.pdf`);
      } else if (activeDoc === 'invoice' && invoiceRef.current) {
        await downloadElementAsPdf(invoiceRef.current, `${fields.companyName || 'нэхэмжлэх'}_нэхэмжлэх.pdf`);
      }
    } catch (e) {
      alert('PDF үүсгэхэд алдаа гарлаа: ' + String(e));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (isSending || isGenerating) return;
    const to = (fields.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      alert('Тухайн байгууллагын и-мэйл хаяг (И-мэйл талбар) зөв оруулагдаагүй байна.');
      return;
    }
    if (!confirm(`Гэрээ болон нэхэмжлэхийг ${to} хаяг руу илгээх үү?`)) return;

    setIsSending(true);
    try {
      const safe = (fields.companyName || 'document').replace(/[^\p{L}\p{N}_-]+/gu, '_');
      const pageImages: { filename: string; jpegBase64: string; widthPx: number; heightPx: number }[] = [];
      if (contractRef.current) {
        const img = await elementToJpegBase64(contractRef.current);
        pageImages.push({ filename: `${safe}_geree.pdf`, ...img });
      }
      if (invoiceRef.current) {
        const img = await elementToJpegBase64(invoiceRef.current);
        pageImages.push({ filename: `${safe}_nehemjleh.pdf`, ...img });
      }

      const res = await fetch('/api/send-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: `BARILGA EXPO — Гэрээ ба нэхэмжлэх (${fields.companyName || ''})`,
          fields,
          pageImages,
        }),
      });
      const raw = await res.text();
      let data: any = null;
      try { data = JSON.parse(raw); } catch { /* JSON бус хариу */ }
      if (!res.ok) throw new Error(data?.error || `Сервер алдаа (${res.status}): ${raw.slice(0, 120)}`);
      alert(`Амжилттай илгээгдлээ → ${to}`);
    } catch (e) {
      alert('И-мэйл илгээхэд алдаа гарлаа: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSending(false);
    }
  };

  const textFieldKeys: (keyof DocumentFields)[] = [
    'companyName', 'registerNumber', 'phone', 'email',
    'bankName', 'bankAccount', 'contactPerson', 'contactPosition',
    'boothIds', 'boothArea', 'pricePerM2', 'additionalFee', 'totalPriceUsd', 'totalPriceMnt',
    'contractNo', 'contractDate', 'invoiceNo', 'invoiceDate', 'signageName',
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-heading text-xl font-bold text-blue-900">Гэрээ / Нэхэмжлэх үүсгэх</h3>
            <p className="text-xs text-gray-500 mt-1">{fields.companyName || 'Байгууллагын нэр оруулаагүй'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Editable fields */}
          <div className="w-full lg:w-1/3 border-r border-gray-100 overflow-y-auto p-5 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Мэдээлэл засах</p>
            {textFieldKeys.map(key => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{FIELD_LABELS[key]}</label>
                <input
                  type={key === 'contractDate' || key === 'invoiceDate' ? 'date' : 'text'}
                  value={fields[key] as string}
                  onChange={(e) => setField(key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all"
                />
              </div>
            ))}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">Нэмэлт үйлчилгээ</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={fields.needsStandWall} onChange={(e) => setField('needsStandWall', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  Стенд (хана) угсралт
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={fields.needsSignage} onChange={(e) => setField('needsSignage', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  Нэрийн самбар
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={fields.needsStageProgram} onChange={(e) => setField('needsStageProgram', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  Тайз/семинар
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={fields.needsVipRoom} onChange={(e) => setField('needsVipRoom', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  VIP өрөө
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 mt-2">{FIELD_LABELS.productDescription}</label>
              <textarea
                value={fields.productDescription}
                onChange={(e) => setField('productDescription', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col">
            <div className="flex items-center gap-2 p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
              <button
                onClick={() => setActiveDoc('contract')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeDoc === 'contract' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <FileText size={16} /> Гэрээ
              </button>
              <button
                onClick={() => setActiveDoc('invoice')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeDoc === 'invoice' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Receipt size={16} /> Нэхэмжлэх
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSendEmail}
                disabled={isSending || isGenerating}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow disabled:opacity-50"
                title="Гэрээ ба нэхэмжлэхийг байгууллагын и-мэйл рүү илгээх"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {isSending ? 'Илгээж байна...' : 'И-мэйлээр илгээх'}
              </button>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors shadow disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isGenerating ? 'Үүсгэж байна...' : 'PDF татах'}
              </button>
            </div>

            <div className="p-6 flex justify-center overflow-x-auto">
              <div className="shadow-lg" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                {activeDoc === 'contract' ? (
                  <ContractDocument ref={contractRef} fields={fields} />
                ) : (
                  <InvoiceDocument ref={invoiceRef} fields={fields} />
                )}
              </div>
            </div>

            {/* Hidden full-scale renderers used for PDF export (off-screen) */}
            <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1 }}>
              {activeDoc !== 'contract' && <ContractDocument ref={contractRef} fields={fields} />}
              {activeDoc !== 'invoice' && <InvoiceDocument ref={invoiceRef} fields={fields} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
