import React, { useMemo } from 'react';
import { DocumentFields } from './types';

const fmtDate = (iso: string) => {
  if (!iso) return '20__ оны __ сарын __';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()} оны ${d.getMonth() + 1} сарын ${d.getDate()}`;
};

const fill = (value: string, placeholder = '......................') => (value && value.trim() ? value : placeholder);

interface LineItem {
  name: string;
  qty: string;
  unitPrice: string;
  total: string;
}

interface Props {
  fields: DocumentFields;
}

export const InvoiceDocument = React.forwardRef<HTMLDivElement, Props>(({ fields: f }, ref) => {
  const items: LineItem[] = useMemo(() => {
    const rows: LineItem[] = [];
    const areaText = f.boothArea ? `${f.boothArea} м²` : '';
    rows.push({
      name: `"40 дэх удаагийн BARILGA EXPO" үзэсгэлэнгийн ${fill(f.boothIds, '....')} тоот талбайн түрээс${areaText ? ` (${areaText})` : ''}`,
      qty: '1',
      unitPrice: f.totalPriceMnt || (f.totalPriceUsd ? `$${f.totalPriceUsd}` : ''),
      total: f.totalPriceMnt || (f.totalPriceUsd ? `$${f.totalPriceUsd}` : ''),
    });
    if (f.needsStandWall) {
      rows.push({ name: 'Стенд (хана) угсралтын үйлчилгээ', qty: '1', unitPrice: '', total: '' });
    }
    if (f.needsSignage) {
      rows.push({ name: `Стенд нэрийн самбар хийлгэх (${fill(f.signageName, '...')})`, qty: '1', unitPrice: '', total: '' });
    }
    if (f.needsStageProgram) {
      rows.push({ name: 'Тайзны хөтөлбөр / семинар, ЛЕД дэлгэцийн сурталчилгаа', qty: '1', unitPrice: '', total: '' });
    }
    if (f.needsVipRoom) {
      rows.push({ name: 'VIP уулзалтын өрөөний түрээс', qty: '1', unitPrice: '', total: '' });
    }
    if (f.additionalFee) {
      rows.push({ name: 'Нэмэлт төлбөр', qty: '1', unitPrice: f.additionalFee, total: f.additionalFee });
    }
    return rows;
  }, [f]);

  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        color: '#1a1a1a',
        fontFamily: "'Noto Sans', Arial, sans-serif",
        fontSize: '11px',
        lineHeight: 1.6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 4 }}>НЭХЭМЖЛЭХ</h1>
          <p>№ {fill(f.invoiceNo, '......')}</p>
          <p>Огноо: {fmtDate(f.invoiceDate)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 800, fontSize: '14px' }}>"БАРИЛГА МН" ХХК</p>
          <p>РД: 6030548</p>
          <p>Улаанбаатар 13373, Баянзүрх дүүрэг,</p>
          <p>6-р хороо, "BARILGA.MN" оффис</p>
          <p>Утас: 99907816, 77113333</p>
        </div>
      </div>

      <div style={{ border: '1px solid #999', borderRadius: 4, padding: '10px 14px', marginBottom: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 6 }}>Төлбөр төлөгчийн мэдээлэл:</p>
        <table style={{ width: '100%', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '2px 0', width: '50%' }}><strong>Байгууллагын нэр:</strong> {fill(f.companyName)}</td>
              <td style={{ padding: '2px 0' }}><strong>Регистрийн дугаар:</strong> {fill(f.registerNumber)}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0' }}><strong>Утас:</strong> {fill(f.phone)}</td>
              <td style={{ padding: '2px 0' }}><strong>И-мэйл:</strong> {fill(f.email)}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0' }}><strong>Гэрээний дугаар:</strong> {fill(f.contractNo, '......')}</td>
              <td style={{ padding: '2px 0' }}><strong>Холбогдох ажилтан:</strong> {fill(f.contactPerson)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: '11px' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e3a8a', color: '#fff' }}>
            <th style={thStyle}>№</th>
            <th style={thStyle}>Гүйлгээний утга</th>
            <th style={thStyle}>Тоо хэмжээ</th>
            <th style={thStyle}>Нэгж үнэ</th>
            <th style={thStyle}>Нийт үнэ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{item.name}</td>
              <td style={tdStyle}>{item.qty}</td>
              <td style={tdStyle}>{item.unitPrice || '—'}</td>
              <td style={tdStyle}>{item.total || '—'}</td>
            </tr>
          ))}
          <tr>
            <td style={tdStyle} colSpan={4}><strong>НИЙТ ДҮН</strong></td>
            <td style={{ ...tdStyle, fontWeight: 800 }}>
              {f.totalPriceMnt ? `${f.totalPriceMnt}₮` : (f.totalPriceUsd ? `$${f.totalPriceUsd}` : '—')}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ border: '1px solid #999', borderRadius: 4, padding: '10px 14px', marginBottom: 24 }}>
        <p style={{ fontWeight: 700, marginBottom: 6 }}>Төлбөр шилжүүлэх дансны мэдээлэл:</p>
        <p>Хаан банк</p>
        <p>Дансны дугаар (IBAN): 67000500</p>
        <p>Дансны нэр: "БАРИЛГА МН" ХХК</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 60 }}>
        <div>
          <p>Нэхэмжлэх бичсэн: ____________________</p>
          <p style={{ marginTop: 6 }}>С.Оргилцэцэг (Үзэсгэлэн хариуцсан менежер)</p>
        </div>
        <div style={{ width: 90, height: 90, border: '2px dashed #bbb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '9px', color: '#999' }}>
          Тамга, тэмдэг
        </div>
      </div>
    </div>
  );
});

InvoiceDocument.displayName = 'InvoiceDocument';

const thStyle: React.CSSProperties = {
  border: '1px solid #999',
  padding: '6px 8px',
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #999',
  padding: '6px 8px',
  textAlign: 'center',
};
