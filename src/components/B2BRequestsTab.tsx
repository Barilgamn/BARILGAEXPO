import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Trash2, Download, Handshake } from 'lucide-react';
import { supabase } from '../supabase';

type Row = {
  id: number;
  org_name: string;
  org_field: string | null;
  org_field_other: string | null;
  rep_name: string;
  rep_position: string | null;
  phone: string;
  email: string | null;
  has_booth: boolean;
  booth_number: string | null;
  goals: string[] | null;
  goal_other: string | null;
  partner_wanted: string | null;
  created_at: string;
};

export const B2BRequestsTab: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const fetchRows = async () => {
    setLoading(true); setError('');
    try {
      const { data, error: err } = await supabase
        .from('b2b_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setRows(data || []);
    } catch (e: any) {
      setError(e?.message || 'Уншихад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const remove = async (id: number) => {
    if (!confirm('Энэ бүртгэлийг устгах уу?')) return;
    const { error: err } = await supabase.from('b2b_registrations').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  /** Excel дээр нээхэд монгол үсэг эвдрэхгүйн тулд BOM нэмнэ. */
  const exportCsv = () => {
    const head = ['Огноо','Байгууллага','Чиглэл','Төлөөлөгч','Албан тушаал','Утас','Имэйл','Booth','Booth дугаар','Зорилго','Хайж буй түнш'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map(r => [
      new Date(r.created_at).toLocaleString('mn-MN'),
      r.org_name,
      r.org_field === 'Бусад' ? r.org_field_other : r.org_field,
      r.rep_name, r.rep_position, r.phone, r.email,
      r.has_booth ? 'Тийм' : 'Үгүй', r.booth_number,
      [...(r.goals || []).filter(g => g !== 'Бусад'), r.goal_other].filter(Boolean).join('; '),
      r.partner_wanted,
    ].map(esc).join(','));
    const blob = new Blob(['﻿' + [head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `b2b-registrations-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const withBooth = rows.filter(r => r.has_booth).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Ачаалж байна...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Handshake size={18} className="text-red-500" /> “INTERNATIONAL BUSINESS MEETING” бүртгэл
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchRows} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700">
            <RefreshCw size={14} /> Шинэчлэх
          </button>
          <button onClick={exportCsv} disabled={!rows.length}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-xs font-semibold text-white">
            <Download size={14} /> Excel-рүү (CSV)
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        /b2b хуудсаар ирсэн бүртгэлүүд. Нийт <b>{rows.length}</b> —
        Booth-тэй <b>{withBooth}</b>, Booth-гүй <b>{rows.length - withBooth}</b> (хураамжтай).
      </p>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4 mb-4">
          Алдаа: {error}. "supabase-b2b.sql" скриптийг Supabase дээр ажиллуулсан эсэхээ шалгаарай.
        </div>
      )}

      {!rows.length ? (
        <p className="text-sm text-gray-400">Одоогоор бүртгэл ирээгүй байна.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {['Огноо','Байгууллага','Төлөөлөгч','Холбоо барих','Booth',''].map(h => (
                  <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <React.Fragment key={r.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('mn-MN')}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.org_name}</td>
                    <td className="px-4 py-3">{r.rep_name}{r.rep_position ? <span className="text-gray-400"> · {r.rep_position}</span> : null}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.phone}{r.email ? <div className="text-gray-400 text-xs">{r.email}</div> : null}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.has_booth
                        ? <span className="text-green-700 font-semibold">{r.booth_number || 'Тийм'}</span>
                        : <span className="text-red-600 font-semibold">Хураамжтай</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={e => { e.stopPropagation(); remove(r.id); }}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                  {openId === r.id && (
                    <tr className="bg-blue-50/40">
                      <td colSpan={6} className="px-4 py-4">
                        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                          <div>
                            <dt className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Үйл ажиллагааны чиглэл</dt>
                            <dd>{r.org_field === 'Бусад' ? r.org_field_other || '—' : r.org_field || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Уулзалтын зорилго</dt>
                            <dd>
                              {(r.goals || []).length ? (
                                <ul className="list-disc list-inside space-y-0.5">
                                  {(r.goals || []).map(g => <li key={g}>{g === 'Бусад' ? r.goal_other || 'Бусад' : g}</li>)}
                                </ul>
                              ) : '—'}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Хайж буй түнш</dt>
                            <dd className="whitespace-pre-wrap">{r.partner_wanted || '—'}</dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
