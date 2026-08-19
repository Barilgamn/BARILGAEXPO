import React, { useEffect, useState } from 'react';
import { Loader2, Users, MessageCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '../supabase';

type Row = { created_at: string };

const MN_MONTHS = [
  '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
];

// Эхлэлийн огноо (энэ сарын 1-ний өдөр, цаг тэглэгдсэн)
const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Энэ сарын эхнээс өнөөдөр хүртэлх өдрүүдийн (YYYY-MM-DD) жагсаалт
const daysSinceMonthStart = () => {
  const days: string[] = [];
  const start = monthStart();
  const now = new Date();
  const d = new Date(start);
  while (d <= now) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
};

// Сүүлийн N сарын (YYYY-MM) жагсаалт — хуучнаас шинэ рүү
const lastNMonths = (n = 6) => {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

// N сарын өмнөөс эхлэх огноо
const nMonthsAgoStart = (n = 6) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n + 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDayLabel = (day: string) => {
  const [, m, d] = day.split('-');
  return `${d}/${m}`;
};

const formatMonthLabel = (month: string) => {
  const [y, m] = month.split('-');
  return `${MN_MONTHS[parseInt(m, 10) - 1]} ${y}`;
};

const aggregate = (rows: Row[], keys: string[], keyFn: (iso: string) => string) => {
  const counts: Record<string, number> = {};
  keys.forEach(k => (counts[k] = 0));
  rows.forEach(r => {
    const k = keyFn(r.created_at);
    if (k in counts) counts[k] += 1;
  });
  return counts;
};

const BarList: React.FC<{ counts: Record<string, number>; labels: (k: string) => string }> = ({ counts, labels }) => {
  const entries = Object.entries(counts);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="space-y-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-3 text-xs">
          <span className="w-16 shrink-0 text-gray-500 font-medium text-right">{labels(k)}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(v / max) * 100}%`, minWidth: v > 0 ? '6px' : 0 }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-bold text-gray-800">{v}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  rows: Row[];
  colorClass: string;
}> = ({ icon, title, rows, colorClass }) => {
  const [period, setPeriod] = useState<'day' | 'month'>('day');

  const days = daysSinceMonthStart();
  const months = lastNMonths(6);

  const dayCounts = aggregate(rows, days, (iso) => iso.slice(0, 10));
  const monthCounts = aggregate(rows, months, (iso) => iso.slice(0, 7));

  const todayTotal = dayCounts[days[days.length - 1]] || 0;
  const monthTotal = monthCounts[months[months.length - 1]] || 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
            {icon}
          </div>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 text-xs font-semibold">
          <button
            onClick={() => setPeriod('day')}
            className={`px-3 py-1 rounded-md transition-colors ${period === 'day' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'}`}
          >
            Өдрөөр
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-md transition-colors ${period === 'month' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'}`}
          >
            Сараар
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-gray-900">{todayTotal}</p>
          <p className="text-[11px] text-gray-500 mt-1">Өнөөдөр</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-gray-900">{monthTotal}</p>
          <p className="text-[11px] text-gray-500 mt-1">Энэ сар</p>
        </div>
      </div>

      {period === 'day' ? (
        <BarList counts={dayCounts} labels={formatDayLabel} />
      ) : (
        <BarList counts={monthCounts} labels={formatMonthLabel} />
      )}
    </div>
  );
};

export const AnalyticsTab: React.FC = () => {
  const [visits, setVisits] = useState<Row[]>([]);
  const [chats, setChats] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const since = nMonthsAgoStart(6).toISOString();
      const [{ data: v, error: ev }, { data: c, error: ec }] = await Promise.all([
        supabase.from('site_visits').select('created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
        supabase.from('chat_sessions').select('created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
      ]);
      if (ev || ec) {
        setErrorMsg((ev || ec)?.message || 'Алдаа гарлаа');
      }
      setVisits(v || []);
      setChats(c || []);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Ачаалж байна...
      </div>
    );
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayVisits = visits.filter(r => r.created_at.slice(0, 10) === todayKey).length;
  const todayChats = chats.filter(r => r.created_at.slice(0, 10) === todayKey).length;
  const todayLabel = new Date().toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Өнөөдрийн хандалт — онцлох хэсэг */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-300" />
            <span className="font-bold text-sm text-blue-200 uppercase tracking-wide">Өнөөдрийн хандалт</span>
          </div>
          <span className="text-xs text-blue-300">{todayLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-4xl font-black">{todayVisits}</p>
            <p className="text-sm text-blue-200 mt-1 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5" /> Сайтын хандалт
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-4xl font-black">{todayChats}</p>
            <p className="text-sm text-blue-200 mt-1 flex items-center justify-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> AI чат хэрэглэгч
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Сүүлийн 6 сарын мэдээлэл: сайтад хандсан хэрэглэгчийн тоо (session тус бүрт өдөрт 1 удаа тоологдоно) ба AI чат ашигласан хэрэглэгчийн тоо.
        </p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Шинэчлэх
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4">
          Алдаа: {errorMsg}. "supabase-analytics.sql" скриптийг Supabase дээр ажиллуулсан эсэхээ шалгаарай.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          title="Сайтын хандалт"
          rows={visits}
          colorClass="bg-blue-50"
        />
        <StatCard
          icon={<MessageCircle className="w-5 h-5 text-red-600" />}
          title="AI чат хэрэглэгчид"
          rows={chats}
          colorClass="bg-red-50"
        />
      </div>
    </div>
  );
};
