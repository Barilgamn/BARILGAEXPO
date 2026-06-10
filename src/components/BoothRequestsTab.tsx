import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, Trash2, FileSignature, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { supabase } from '../supabase';
import { DocumentModal } from './documents/DocumentModal';

const STATUS_LABELS: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  pending: { label: 'Хүлээгдэж буй', classes: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock size={12} /> },
  approved: { label: 'Зөвшөөрсөн', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 size={12} /> },
  rejected: { label: 'Татгалзсан', classes: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle size={12} /> },
};

export const BoothRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchRequests = async () => {
    setIsLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('booth_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setRequests(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('booth_requests_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booth_requests' }, () => fetchRequests())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (req: any, status: 'pending' | 'approved' | 'rejected') => {
    const { error } = await supabase.from('booth_requests').update({ status }).eq('id', req.id);
    if (error) {
      alert('Статус шинэчлэхэд алдаа гарлаа: ' + error.message);
      return;
    }
    if (status === 'approved' && Array.isArray(req.booth_ids)) {
      for (const boothId of req.booth_ids) {
        await supabase.from('booth_status').upsert({ id: boothId, is_reserved: true, updated_at: new Date().toISOString() });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Энэ хүсэлтийг устгах уу?')) return;
    const { error } = await supabase.from('booth_requests').delete().eq('id', id);
    if (error) alert('Устгахад алдаа гарлаа: ' + error.message);
  };

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-blue-700 uppercase tracking-widest font-bold">Нийт хүсэлт</span>
          <span className="text-3xl font-black text-blue-900 mt-2">{requests.length}</span>
        </div>
        <div className="bg-amber-50 border border-amber-100/50 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-amber-700 uppercase tracking-widest font-bold">Хүлээгдэж буй</span>
          <span className="text-3xl font-black text-amber-900 mt-2">{requests.filter(r => r.status === 'pending').length}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-100/50 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-emerald-700 uppercase tracking-widest font-bold">Зөвшөөрсөн</span>
          <span className="text-3xl font-black text-emerald-900 mt-2">{requests.filter(r => r.status === 'approved').length}</span>
        </div>
        <div className="bg-red-50 border border-red-100/50 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-red-700 uppercase tracking-widest font-bold">Татгалзсан</span>
          <span className="text-3xl font-black text-red-900 mt-2">{requests.filter(r => r.status === 'rejected').length}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {f === 'all' ? `Бүгд (${requests.length})` : STATUS_LABELS[f].label + ` (${requests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-800 p-6 rounded-2xl text-center">
          <p className="text-sm">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center py-10">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <span className="text-sm text-gray-500">Уншиж байна...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
          <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 font-medium">Талбай захиалгын хүсэлт одоогоор байхгүй байна.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => {
            const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.pending;
            const dateStr = req.created_at ? new Date(req.created_at).toLocaleString('mn-MN') : '';
            return (
              <div key={req.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all shadow-sm bg-white">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border flex items-center gap-1 ${statusInfo.classes}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <span className="text-gray-400 font-mono text-[10px]">{dateStr}</span>
                    </div>
                    <h3 className="text-md font-bold text-gray-900">{req.company_name}</h3>
                    <p className="text-sm text-gray-600 font-mono">Утас: {req.phone} {req.email && `· ${req.email}`}</p>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-700 space-y-1 mt-2">
                      <p><strong className="text-gray-900">Сонгосон талбай:</strong> {Array.isArray(req.booth_ids) ? req.booth_ids.join(', ') : ''}</p>
                      <p><strong className="text-gray-900">Нийт төлбөр:</strong> ${Number(req.total_price_usd || 0).toLocaleString()}</p>
                      {req.product_description && <p><strong className="text-gray-900">Бүтээгдэхүүн:</strong> {req.product_description}</p>}
                      {req.contact_person && <p><strong className="text-gray-900">Холбогдох ажилтан:</strong> {req.contact_person} {req.contact_position && `(${req.contact_position})`}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-stretch md:items-end shrink-0 md:w-56">
                    <button
                      onClick={() => setActiveRequest(req)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      <FileSignature size={16} /> Гэрээ/Нэхэмжлэх
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(req, 'approved')}
                        disabled={req.status === 'approved'}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Зөвшөөрөх
                      </button>
                      <button
                        onClick={() => updateStatus(req, 'rejected')}
                        disabled={req.status === 'rejected'}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} /> Татгалзах
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={14} /> Устгах
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeRequest && (
        <DocumentModal request={activeRequest} onClose={() => setActiveRequest(null)} />
      )}
    </div>
  );
};
