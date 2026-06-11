import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Lock, Unlock } from 'lucide-react';
import { supabase } from '../supabase';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import {
  booths,
  getBoothPrice,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  Booth,
  BoothStatus,
} from '../data/booths';

const PRICE_LEGEND: { category: Booth['category']; label: string }[] = [
  { category: 'sponsor', label: 'А павильон (онцгой) 1м² — 510,000₮' },
  { category: 'supporting', label: 'А павильон (дунд) 1м² — 460,000₮' },
  { category: 'standard', label: 'А павильон (энгийн) 1м² — 420,000₮' },
  { category: 'b', label: 'B павильон 1м² — 360,000–420,000₮' },
  { category: 'g', label: 'Гадаа талбай — 40,000–50,000₮' },
];

type Override = { status?: BoothStatus | null };

export const BoothInfoContent: React.FC = () => {
  // Амьд override-ууд (booth_status хүснэгтээс). Байхгүй бол PDF-ийн анхны төлөв хэрэглэгдэнэ.
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchStatus = async () => {
    const { data } = await supabase.from('booth_status').select('id, status, is_reserved');
    const map: Record<string, Override> = {};
    (data || []).forEach((row: any) => {
      let st: BoothStatus | null = row.status ?? null;
      if (!st && row.is_reserved) st = 'occupied';
      if (st) map[row.id] = { status: st };
    });
    setOverrides(map);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    const channel = supabase
      .channel('booth_status_realtime_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booth_status' }, () => fetchStatus())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const effectiveStatus = (b: Booth): BoothStatus => overrides[b.id]?.status ?? b.status;

  const setStatus = async (b: Booth, status: BoothStatus) => {
    setBusyId(b.id);
    // Optimistic
    setOverrides(prev => ({ ...prev, [b.id]: { status } }));
    const { error } = await supabase.from('booth_status').upsert({
      id: b.id,
      status,
      is_reserved: status === 'occupied' || status === 'reserved',
      updated_at: new Date().toISOString(),
    });
    if (error) alert('Төлөв шинэчлэхэд алдаа гарлаа: ' + error.message);
    setBusyId(null);
  };

  const counts = useMemo(() => {
    const c = { available: 0, occupied: 0, reserved: 0 };
    booths.forEach(b => { c[effectiveStatus(b)]++; });
    return c;
  }, [overrides]);

  const sectionA = booths.filter(b => b.section === 'A');
  const sectionB = booths.filter(b => b.section === 'B');
  const sectionG = booths.filter(b => b.section === 'G');

  const statusBadge = (st: BoothStatus) => {
    if (st === 'available')
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={12} /> {STATUS_LABELS.available}
        </span>
      );
    if (st === 'reserved')
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
          <Lock size={12} /> {STATUS_LABELS.reserved}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
        <XCircle size={12} /> {STATUS_LABELS.occupied}
      </span>
    );
  };

  const renderTable = (list: Booth[], title: string) => (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Дугаар</th>
              <th className="px-4 py-3">Талбай (м²)</th>
              <th className="px-4 py-3">1м² үнэ</th>
              <th className="px-4 py-3">Нийт үнэ</th>
              <th className="px-4 py-3">Байгууллага</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map(b => {
              const st = effectiveStatus(b);
              return (
                <tr key={b.id} className={st === 'available' ? 'hover:bg-emerald-50/30' : 'bg-gray-50/40'}>
                  <td className="px-4 py-2.5 font-bold text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm border border-gray-200 shrink-0" style={{ backgroundColor: CATEGORY_COLORS[b.category] }} />
                      {b.id}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{b.area || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600">{b.pricePerM2.toLocaleString()}₮</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{getBoothPrice(b).toLocaleString()}₮</td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-[220px] truncate" title={b.company || ''}>{b.company || '—'}</td>
                  <td className="px-4 py-2.5">{statusBadge(st)}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {st === 'reserved' ? (
                      <button
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b, 'available')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                      >
                        <Unlock size={12} /> Нөөцөөс гаргах
                      </button>
                    ) : st === 'available' ? (
                      <button
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b, 'reserved')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors disabled:opacity-50"
                      >
                        <Lock size={12} /> Нөөцлөх
                      </button>
                    ) : (
                      <button
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b, 'available')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                      >
                        Сул болгох
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {/* Interactive floor plan */}
      <div className="mb-10">
        <InteractiveFloorPlan statusOf={effectiveStatus} />
      </div>

      {/* Legend */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {PRICE_LEGEND.map(item => (
          <div key={item.category} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="w-6 h-6 rounded shrink-0 border border-gray-200" style={{ backgroundColor: CATEGORY_COLORS[item.category] }} />
            <span className="text-sm text-gray-700 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        <Lock size={13} className="inline mb-0.5 mr-1 text-amber-500" />
        <strong>Нөөц</strong> талбайг зөвхөн админ "Нөөцөөс гаргах" товчоор сул болгосны дараа л захиалах боломжтой.
      </p>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-emerald-700">{loading ? '...' : counts.available}</div>
          <div className="text-xs uppercase tracking-widest text-emerald-700 font-bold mt-1">Сул</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-red-600">{loading ? '...' : counts.occupied}</div>
          <div className="text-xs uppercase tracking-widest text-red-600 font-bold mt-1">Захиалагдсан</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-amber-600">{loading ? '...' : counts.reserved}</div>
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mt-1">Нөөц</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-blue-900">{booths.length}</div>
          <div className="text-xs uppercase tracking-widest text-blue-900 font-bold mt-1">Нийт</div>
        </div>
      </div>

      {renderTable(sectionA, 'А павильон')}
      {renderTable(sectionB, 'B павильон')}
      {renderTable(sectionG, 'Гадаа талбай (G)')}
    </div>
  );
};
