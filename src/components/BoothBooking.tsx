import React, { useState } from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '../supabase';
import { useTranslation } from '../i18n';

export const BoothBooking: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [requestedBoothInfo, setRequestedBoothInfo] = useState('');
  const [needsStandWall, setNeedsStandWall] = useState(false);
  const [needsStageProgram, setNeedsStageProgram] = useState(false);
  const [needsVipRoom, setNeedsVipRoom] = useState(false);

  const resetForm = () => {
    setCompanyName('');
    setRegisterNumber('');
    setPhone('');
    setEmail('');
    setContactPerson('');
    setContactPosition('');
    setProductDescription('');
    setRequestedBoothInfo('');
    setNeedsStandWall(false);
    setNeedsStageProgram(false);
    setNeedsVipRoom(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      const payload = {
        id: requestId,
        booth_ids: [],
        total_price_usd: 0,
        company_name: companyName,
        register_number: registerNumber || null,
        phone,
        email: email || null,
        contact_person: contactPerson || null,
        contact_position: contactPosition || null,
        product_description: productDescription || null,
        requested_booth_info: requestedBoothInfo || null,
        needs_stand_wall: needsStandWall,
        needs_stage_program: needsStageProgram,
        needs_vip_room: needsVipRoom,
        status: 'pending',
        is_paid: false,
      };

      const { error } = await supabase.from('booth_requests').insert(payload);
      if (error) throw new Error(error.message);

      setIsSuccess(true);
      resetForm();
    } catch (error) {
      alert(t('bb_error_prefix') + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
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
            {t('bb_badge')}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 tracking-tight drop-shadow-md">
            {t('bb_title')}
          </h1>
          <p className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            {t('bb_desc')}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isSuccess ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">{t('mod_succ')}</h3>
            <p className="text-gray-600 mb-6">{t('bb_success_desc')}</p>
            <button
              onClick={() => setIsSuccess(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {t('bb_resend')}
            </button>
          </div>
        ) : (
          <form className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_company_name')} *</label>
                <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_register_number')}</label>
                <input type="text" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_phone')} *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_contact_person')}</label>
                <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_contact_position')}</label>
                <input type="text" value={contactPosition} onChange={(e) => setContactPosition(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_booth_info_label')}</label>
                <textarea
                  value={requestedBoothInfo}
                  onChange={(e) => setRequestedBoothInfo(e.target.value)}
                  rows={2}
                  placeholder={t('bb_booth_info_placeholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bb_product_desc')}</label>
                <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all resize-none" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">{t('bb_extra_services')}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={needsStandWall} onChange={(e) => setNeedsStandWall(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  {t('bb_stand_wall')}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={needsStageProgram} onChange={(e) => setNeedsStageProgram(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  {t('bb_stage_program')}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={needsVipRoom} onChange={(e) => setNeedsVipRoom(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  {t('bb_vip_room')}
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? t('bb_submitting') : t('bb_submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
