import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { booths, getBoothPrice, CATEGORY_LABELS, Booth } from '../data/booths';

const PRICE_LEGEND: { category: Booth['category']; price: string; color: string }[] = [
  { category: 'standard', price: 'A павильон 1м² - 135 USD', color: '#FDE68A' },
  { category: 'supporting', price: 'A павильон 1м² - 145 USD (Дэмжигч байгууллага)', color: '#D8B4FE' },
  { category: 'sponsor', price: 'A павильон 1м² - 175 USD (Ивээн тэтгэгч)', color: '#A5F3FC' },
  { category: 'b', price: 'B павильон 1м² - 125 USD', color: '#86EFAC' },
];

export const BoothInfoPage: React.FC = () => {
  const [reserved, setReserved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    const { data } = await supabase.from('booth_status').select('id, is_reserved');
    const set = new Set<string>();
    (data || []).forEach((row: any) => {
      if (row.is_reserved) set.add(row.id);
    });
    setReserved(set);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    const channel = supabase
      .channel('booth_status_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booth_status' }, () => fetchStatus())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sectionA = booths.filter(b => b.section === 'A');
  const sectionB = booths.filter(b => b.section === 'B');
  const availableCount = booths.length - reserved.size;

  const renderTable = (list: Booth[], title: string) => (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Дугаар</th>
              <th className="px-4 py-3">Хэмжээ</th>
              <th className="px-4 py-3">Талбай (м²)</th>
              <th className="px-4 py-3">Төрөл</th>
              <th className="px-4 py-3">Үнэ (USD)</th>
              <th className="px-4 py-3">Төлөв</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map(b => {
              const isReserved = reserved.has(b.id);
              return (
                <tr key={b.id} className={isReserved ? 'bg-gray-50/60' : 'hover:bg-red-50/30'}>
                  <td className="px-4 py-2.5 font-bold text-gray-900">{b.id}</td>
                  <td className="px-4 py-2.5 text-gray-600 font-mono">{b.size}</td>
                  <td className="px-4 py-2.5 text-gray-600">{b.area}</td>
                  <td className="px-4 py-2.5 text-gray-600">{CATEGORY_LABELS[b.category]}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">${getBoothPrice(b).toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    {isReserved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                        <XCircle size={12} /> Захиалагдсан
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle2 size={12} /> Сул
                      </span>
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
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Header */}
      <div className="relative pt-24 pb-16 bg-blue-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-red-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-300 font-medium text-sm mb-6 border border-red-500/30">
            <MapPin className="w-4 h-4" />
            ТАЛБАЙН МЭДЭЭЛЭЛ
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 tracking-tight drop-shadow-md">
            Талбайн байршил, үнэ
          </h1>
          <p className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            Доорх төлбөртэй байршлын зураг, үнийн мэдээлэл, сул болон захиалагдсан талбайн
            байдлыг харна уу. Та өөрт тохирох талбайг сонгоод "Талбай захиалах" хэсгээр
            хүсэлт илгээж болно.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Floor plan image */}
        <div className="mb-10 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <img src="/floor-plan.jpg" alt="Талбайн байршлын зураг" className="w-full h-auto" loading="lazy" />
        </div>

        {/* Legend */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {PRICE_LEGEND.map(item => (
            <div key={item.category} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="w-6 h-6 rounded shrink-0 border border-gray-200" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-700 font-medium">{item.price}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-emerald-700">{loading ? '...' : availableCount}</div>
            <div className="text-xs uppercase tracking-widest text-emerald-700 font-bold mt-1">Сул талбай</div>
          </div>
          <div className="flex-1 bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-red-600">{loading ? '...' : reserved.size}</div>
            <div className="text-xs uppercase tracking-widest text-red-600 font-bold mt-1">Захиалагдсан</div>
          </div>
          <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-blue-900">{booths.length}</div>
            <div className="text-xs uppercase tracking-widest text-blue-900 font-bold mt-1">Нийт талбай</div>
          </div>
        </div>

        {renderTable(sectionA, 'A павильон')}
        {renderTable(sectionB, 'B павильон')}

        <div className="text-center pt-4">
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
          >
            Талбай захиалах хүсэлт илгээх
          </Link>
        </div>
      </div>
    </div>
  );
};
