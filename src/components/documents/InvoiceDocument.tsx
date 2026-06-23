import React from 'react';
import { DocumentFields } from './types';

const fill = (value: string | undefined, placeholder = '') => (value && value.trim() ? value : placeholder);

const fmtInvoiceDate = (iso: string | undefined) => {
  if (!iso) return { year: '2026', month: '', day: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { year: '2026', month: '', day: '' };
  return { year: String(d.getFullYear()), month: String(d.getMonth() + 1), day: String(d.getDate()) };
};

interface Props { fields: DocumentFields }

const border = '1px solid #222';
const cellBase: React.CSSProperties = { border, padding: '5px 8px', verticalAlign: 'middle', fontSize: '11px' };
const italic: React.CSSProperties = { ...cellBase, fontStyle: 'italic' };

export const InvoiceDocument = React.forwardRef<HTMLDivElement, Props>(({ fields: f }, ref) => {
  const invDate = fmtInvoiceDate(f.invoiceDate);
  const payDate = fmtInvoiceDate(f.invoiceDate); // same as invoice date

  const totalMnt = fill(f.totalPriceMnt);
  const totalUsd = fill(f.totalPriceUsd);
  const totalDisplay = totalMnt || (totalUsd ? `$${totalUsd}` : '');
  const unitDisplay = fill(f.pricePerM2) || totalDisplay;
  const qtyDisplay = fill(f.boothArea);

  // Line items
  const rows: { name: string; qty: string; unit: string; total: string }[] = [];
  rows.push({
    name: `40th BARILGA EXPO ${fill(f.boothIds, '......')}`,
    qty: qtyDisplay,
    unit: unitDisplay,
    total: totalDisplay,
  });
  if (f.needsStandWall) rows.push({ name: 'Стенд (хана) угсралт', qty: '1', unit: '', total: '' });
  if (f.needsSignage) rows.push({ name: `Нэрийн самбар (${fill(f.signageName, '...')})`, qty: '1', unit: '', total: '' });
  if (f.needsStageProgram) rows.push({ name: 'Тайзны хөтөлбөр / семинар', qty: '1', unit: '', total: '' });
  if (f.needsVipRoom) rows.push({ name: 'VIP өрөө', qty: '1', unit: '', total: '' });
  if (f.additionalFee) rows.push({ name: 'Нэмэлт төлбөр', qty: '1', unit: f.additionalFee, total: f.additionalFee });

  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 14mm',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        color: '#111',
        fontFamily: "'Times New Roman', serif",
        fontSize: '11px',
        lineHeight: 1.5,
      }}
    >
      {/* Title */}
      <p style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
        НЭХЭМЖЛЭХ № {fill(f.invoiceNo, '24/05')}
      </p>

      {/* Company info table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
        <tbody>
          {/* Header row */}
          <tr>
            <td style={{ ...cellBase, fontWeight: 700, textAlign: 'center', width: '50%' }}>"БАРИЛГА МН" ХХК</td>
            <td style={{ ...cellBase, textAlign: 'center' }}>{fill(f.companyName)}</td>
          </tr>
          <tr>
            <td style={{ ...cellBase, fontStyle: 'italic', textAlign: 'center' }}>/нэхэмжлэгч байгууллага/</td>
            <td style={{ ...cellBase, fontStyle: 'italic', textAlign: 'center' }}>/төлөгч байгууллага/</td>
          </tr>
          {/* РД */}
          <tr>
            <td style={italic}><span style={{ fontStyle: 'italic' }}>Байгууллагын РД:</span>&nbsp;&nbsp;<strong>6030548</strong></td>
            <td style={italic}><span style={{ fontStyle: 'italic' }}>Байгууллагын РД:</span>&nbsp;&nbsp;<strong>{fill(f.registerNumber)}</strong></td>
          </tr>
          {/* Хаяг */}
          <tr>
            <td style={{ ...italic, verticalAlign: 'top' }}>
              <span style={{ fontStyle: 'italic' }}>Байгууллагын хаяг:</span>&nbsp;&nbsp;
              <strong>БЗД, 6-р хороо, BARILGAMN оффис,</strong>
            </td>
            <td style={{ ...italic, verticalAlign: 'top' }}>
              <span style={{ fontStyle: 'italic' }}>Байгууллагын хаяг:</span>&nbsp;&nbsp;
              <strong>{fill(f.companyAddress || '')}</strong>
            </td>
          </tr>
          {/* Утас */}
          <tr>
            <td style={italic}><strong>Харилцах утас:</strong>&nbsp;&nbsp;<strong>99907816</strong></td>
            <td style={italic}><span style={{ fontStyle: 'italic' }}>Харилцах утас:</span>&nbsp;&nbsp;<strong>{fill(f.phone)}</strong></td>
          </tr>
          {/* Данс / Гэрээний дугаар */}
          <tr>
            <td style={{ ...cellBase, padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td rowSpan={2} style={{ ...italic, width: '40%', borderRight: border }}>Байгууллагын данс:</td>
                    <td style={{ ...italic, borderBottom: border }}><strong>Хаан банк</strong></td>
                  </tr>
                  <tr>
                    <td style={italic}><strong>Iban 67000500</strong><br /><strong>5175011074</strong></td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={italic}><span style={{ fontStyle: 'italic' }}>Гэрээний дугаар:</span>&nbsp;&nbsp;<strong>{fill(f.contractNo)}</strong></td>
          </tr>
          {/* Огноо */}
          <tr>
            <td style={italic}>
              <span style={{ fontStyle: 'italic' }}>Нэхэмжлэлийн огноо:</span>&nbsp;&nbsp;
              <strong>{invDate.year}. {invDate.month}</strong>&nbsp;&nbsp;<strong>{invDate.day}</strong>
            </td>
            <td style={italic}>
              <span style={{ fontStyle: 'italic' }}>Төлбөр хийх огноо:</span>&nbsp;&nbsp;
              <strong>{payDate.year}. {payDate.month}</strong>&nbsp;&nbsp;<strong>{payDate.day}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Line items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <thead>
          <tr>
            <th style={{ ...cellBase, fontWeight: 700, textAlign: 'center', width: '6%' }}>№</th>
            <th style={{ ...cellBase, fontWeight: 700, textAlign: 'center' }}>Гүйлгээний утга</th>
            <th style={{ ...cellBase, fontWeight: 700, textAlign: 'center', width: '10%' }}>Тоо</th>
            <th style={{ ...cellBase, fontWeight: 700, textAlign: 'center', width: '18%' }}>Нэгж үнэ</th>
            <th style={{ ...cellBase, fontWeight: 700, textAlign: 'center', width: '18%' }}>Нийт үнэ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, idx) => (
            <tr key={idx}>
              <td style={{ ...cellBase, textAlign: 'center' }}>{idx + 1}</td>
              <td style={cellBase}>{item.name}</td>
              <td style={{ ...cellBase, textAlign: 'center' }}>{item.qty}</td>
              <td style={{ ...cellBase, textAlign: 'center' }}>{item.unit || ''}</td>
              <td style={{ ...cellBase, textAlign: 'center' }}>{item.total || ''}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} style={{ ...cellBase, fontWeight: 800, textAlign: 'center', textTransform: 'uppercase' }}>НИЙТ ТӨЛӨХ ДҮН</td>
            <td style={{ ...cellBase, fontWeight: 800, textAlign: 'center' }}>{totalDisplay}</td>
          </tr>
        </tbody>
      </table>

      {/* Red note */}
      <p style={{ color: '#c00', fontStyle: 'italic', fontSize: '10.5px', marginBottom: 20 }}>
        Гүйлгээний утга нь &nbsp;дээр байгууллагын нэр, регистер, болон утасны дугаараа бичнэ үү !!!
      </p>

      {/* Signature */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginTop: 12 }}>
        <div>
          <p style={{ fontStyle: 'italic', fontWeight: 700, marginBottom: 6 }}>Нэхэмжлэгч байгууллага:</p>
          <p style={{ marginBottom: 2 }}>&nbsp;&nbsp;&nbsp;"БАРИЛГА МН" &nbsp;ХХК</p>
          <p style={{ marginBottom: 24 }}>&nbsp;&nbsp;&nbsp;Нягтлан бодогч</p>
          <p>/Б.Адьяасүрэн/</p>
        </div>
        <div style={{
          width: 90, height: 90,
          border: '2px dashed #bbb', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', fontSize: '9px', color: '#999', flexShrink: 0,
        }}>
          Тамга,<br />тэмдэг
        </div>
      </div>
    </div>
  );
});

InvoiceDocument.displayName = 'InvoiceDocument';
