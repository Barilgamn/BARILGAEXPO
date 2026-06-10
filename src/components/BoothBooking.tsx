import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, X, MapPin, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import {
  booths,
  Booth,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  getBoothPrice,
  getBoothSpan,
  PERIMETER_TOP,
  PERIMETER_RIGHT,
  PERIMETER_BOTTOM,
  PERIMETER_LEFT,
} from '../data/booths';

export const BoothBooking: React.FC = () => {
  const [reservedIds, setReservedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [stateRegisterNumber, setStateRegisterNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [needsStandWall, setNeedsStandWall] = useState(false);
  const [needsSignage, setNeedsSignage] = useState(false);
  const [signageName, setSignageName] = useState('');
  const [needsStageProgram, setNeedsStageProgram] = useState(false);
  const [needsVipRoom, setNeedsVipRoom] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('booth_status').select('id, is_reserved');
      if (!error && data) {
        setReservedIds(new Set(data.filter((r: any) => r.is_reserved).map((r: any) => r.id)));
      }
      setIsLoading(false);
    };
    fetchStatus();

    const channel = supabase
      .channel('booth_status_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booth_status' }, fetchStatus)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleBooth = (booth: Booth) => {
    if (reservedIds.has(booth.id)) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(booth.id)) next.delete(booth.id);
      else next.add(booth.id);
      return next;
    });
  };

  const boothMap = useMemo(() => new Map(booths.map(b => [b.id, b])), []);
  const centerBooths = useMemo(() => booths.filter(b => b.section === 'A'), []);

  const selectedBooths = useMemo(
    () => booths.filter(b => selected.has(b.id)),
    [selected]
  );

  const totalPrice = useMemo(
    () => selectedBooths.reduce((sum, b) => sum + getBoothPrice(b), 0),
    [selectedBooths]
  );

  const resetForm = () => {
    setCompanyName('');
    setRegisterNumber('');
    setStateRegisterNumber('');
    setCompanyAddress('');
    setPhone('');
    setEmail('');
    setBankName('');
    setBankAccount('');
    setContactPerson('');
    setContactPosition('');
    setProductDescription('');
    setNeedsStandWall(false);
    setNeedsSignage(false);
    setSignageName('');
    setNeedsStageProgram(false);
    setNeedsVipRoom(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (selectedBooths.length === 0) {
      alert('Талбайн зургаас дор хаяж нэг талбай сонгоно уу.');
      return;
    }
    setIsSubmitting(true);
    try {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      const payload = {
        id: requestId,
        booth_ids: selectedBooths.map(b => b.id),
        total_price_usd: totalPrice,
        company_name: companyName,
        register_number: registerNumber || null,
        state_register_number: stateRegisterNumber || null,
        company_address: companyAddress || null,
        phone,
        email: email || null,
        bank_name: bankName || null,
        bank_account: bankAccount || null,
        contact_person: contactPerson || null,
        contact_position: contactPosition || null,
        product_description: productDescription || null,
        needs_stand_wall: needsStandWall,
        needs_signage: needsSignage,
        signage_name: signageName || null,
        needs_stage_program: needsStageProgram,
        needs_vip_room: needsVipRoom,
        status: 'pending',
      };

      const { error } = await supabase.from('booth_requests').insert(payload);
      if (error) throw new Error(error.message);

      setIsSuccess(true);
      setSelected(new Set());
      resetForm();
    } catch (error) {
      alert('Хүсэлт илгээхэд алдаа гарлаа: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCell = (id: string, gridSpan?: { col: number; row: number }) => {
    const booth = boothMap.get(id);
    if (!booth) return <div key={id} />;
    const isReserved = reservedIds.has(booth.id);
    const isSelected = selected.has(booth.id);
    return (
      <button
        key={id}
        type="button"
        disabled={isReserved}
        onClick={() => toggleBooth(booth)}
        title={`${booth.id} — ${booth.size} (${booth.area}м²) — $${getBoothPrice(booth).toLocaleString()}`}
        style={{
          backgroundColor: isReserved ? '#e5e7eb' : isSelected ? '#2563eb' : CATEGORY_COLORS[booth.category],
          ...(gridSpan ? { gridColumn: `span ${gridSpan.col}`, gridRow: `span ${gridSpan.row}` } : { flex: '1 1 0%', minWidth: 0, height: 32 }),
        }}
        className={`relative rounded-[3px] border flex flex-col items-center justify-center text-[7px] sm:text-[8px] font-bold leading-tight transition-all overflow-hidden px-0.5 ${
          isReserved
            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
            : isSelected
            ? 'border-blue-700 text-white shadow scale-[1.05] z-10'
            : 'border-gray-300 text-gray-800 hover:scale-[1.08] hover:z-10 cursor-pointer'
        }`}
      >
        <span className="truncate w-full text-center">{booth.id}</span>
        {isReserved && <CheckCircle2 className="w-2 h-2 absolute top-0 right-0 text-green-600" />}
      </button>
    );
  };

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
            ТАЛБАЙН ЗАХИАЛГА
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 tracking-tight drop-shadow-md">
            Үзэсгэлэнгийн талбай захиалах
          </h1>
          <p className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            Доорх төлөвлөгөөнөөс захиаагүй (саарал бус) талбайг сонгож, мэдээллээ бөглөн хүсэлт илгээнэ үү.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Reference floor plan image */}
        <details className="mb-8 bg-gray-50 border border-gray-100 rounded-xl group" open>
          <summary className="cursor-pointer select-none px-4 py-3 font-semibold text-blue-950 flex items-center justify-between">
            <span>Талбайн ерөнхий зураг (лавлагаа)</span>
            <span className="text-xs text-gray-400">Хураах / Дэлгэх</span>
          </summary>
          <div className="p-4 pt-0">
            <img src="/floorplan.jpg" alt="40th BARILGA EXPO талбайн зураг" className="w-full rounded-lg border border-gray-200" />
          </div>
        </details>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-8 bg-gray-50 border border-gray-100 rounded-xl p-4">
          {(['standard', 'supporting', 'sponsor', 'b'] as const).map(cat => (
            <div key={cat} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-4 h-4 rounded inline-block border border-gray-300" style={{ backgroundColor: CATEGORY_COLORS[cat] }}></span>
              <span>{CATEGORY_LABELS[cat]}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="w-4 h-4 rounded inline-block bg-gray-300 border border-gray-400"></span>
            <span>Захиалагдсан</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="w-4 h-4 rounded inline-block bg-blue-600 border border-blue-700"></span>
            <span>Сонгосон</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="border-2 border-gray-200 rounded-2xl p-2 sm:p-4 bg-white overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Top perimeter (B32-B59) */}
              <div className="flex gap-1 mb-1 ml-12 mr-12">
                {PERIMETER_TOP.map(id => renderCell(id))}
              </div>

              <div className="flex gap-1">
                {/* Left perimeter (B31-B16) */}
                <div className="flex flex-col gap-1 w-10 shrink-0">
                  {PERIMETER_LEFT.map(id => renderCell(id))}
                </div>

                {/* Center: A booths + stage */}
                <div
                  className="flex-1 grid gap-1"
                  style={{ gridTemplateColumns: 'repeat(20, 1fr)', gridAutoRows: '32px', gridAutoFlow: 'row dense' }}
                >
                  <div
                    style={{ gridColumn: '9 / 13', gridRow: '6 / 9' }}
                    className="bg-red-600 text-white rounded-md flex flex-col items-center justify-center font-extrabold text-[10px] sm:text-xs tracking-wide"
                  >
                    <span>STAGE</span>
                    <span className="font-normal opacity-80 text-[8px] sm:text-[10px]">8x5</span>
                  </div>
                  {centerBooths.map(b => renderCell(b.id, getBoothSpan(b)))}
                </div>

                {/* Right perimeter (B60-B72) */}
                <div className="flex flex-col gap-1 w-10 shrink-0">
                  {PERIMETER_RIGHT.map(id => renderCell(id))}
                </div>
              </div>

              {/* Bottom perimeter (B73-B80, B1-B15) */}
              <div className="flex gap-1 mt-1 ml-12 mr-12">
                {PERIMETER_BOTTOM.map(id => renderCell(id))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating selection summary bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-900 shrink-0" />
              <div className="text-sm text-gray-700">
                <span className="font-bold text-blue-900">{selected.size}</span> талбай сонгосон:{' '}
                <span className="font-medium">{selectedBooths.map(b => b.id).join(', ')}</span>
              </div>
              <div className="text-sm font-bold text-red-600">
                Нийт: ${totalPrice.toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Цэвэрлэх
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                Захиалах хүсэлт илгээх
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm"
            onClick={() => { setIsFormOpen(false); setIsSuccess(false); }}
          ></div>

          {isSuccess ? (
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 z-10">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">Амжилттай</h3>
              <p className="text-gray-600 mb-6">Таны талбай захиалгын хүсэлтийг амжилттай хүлээн авлаа.</p>
              <button
                onClick={() => { setIsFormOpen(false); setIsSuccess(false); }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Хаах
              </button>
            </div>
          ) : (
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 z-10">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-blue-900">Захиалгын мэдээлэл</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Сонгосон талбай: <span className="font-semibold">{selectedBooths.map(b => b.id).join(', ')}</span> — Нийт: <span className="font-semibold text-red-600">${totalPrice.toLocaleString()}</span>
                  </p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Байгууллагын нэр *</label>
                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Улсын бүртгэлийн дугаар (РД)</label>
                    <input type="text" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Гэрчилгээний дугаар</label>
                    <input type="text" value={stateRegisterNumber} onChange={(e) => setStateRegisterNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Хаяг</label>
                    <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар *</label>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{8}"
                      maxLength={8}
                      placeholder="99112233"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Банкны нэр</label>
                    <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дансны дугаар</label>
                    <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Холбогдох ажилтан</label>
                    <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Албан тушаал</label>
                    <input type="text" value={contactPosition} onChange={(e) => setContactPosition(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Үзэсгэлэнд гаргах бүтээгдэхүүн / үйлчилгээ</label>
                    <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all resize-none" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Нэмэлт үйлчилгээ</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={needsStandWall} onChange={(e) => setNeedsStandWall(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      Стенд хийц угсралт хэрэгтэй
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={needsStageProgram} onChange={(e) => setNeedsStageProgram(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      Тайзны хөтөлбөр/семинар хэрэгтэй
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={needsVipRoom} onChange={(e) => setNeedsVipRoom(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      VIP өрөө хэрэгтэй
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={needsSignage} onChange={(e) => setNeedsSignage(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      Нэрийн самбар хэрэгтэй
                    </label>
                  </div>
                  {needsSignage && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Нэрийн самбарт бичих нэр</label>
                      <input type="text" value={signageName} onChange={(e) => setSignageName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50">
                    Цуцлах
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
