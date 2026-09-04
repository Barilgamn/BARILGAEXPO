import React, { useState } from 'react';
import {
  Building2, User, Phone, Mail, CheckCircle2, Loader2,
  AlertTriangle, CreditCard, Search,
} from 'lucide-react';
import { supabase } from '../supabase';
import { useTranslation } from '../i18n';

const ORG_FIELDS = [
  'Үйлдвэрлэл',
  'Худалдаа',
  'Загвар / Зураг төсөл',
  'Барилга угсралт',
  'Санхүү / Хөрөнгө оруулалт',
  'Олон улсын худалдаа / Дистрибьютер',
  'Бусад',
];

const GOALS = [
  'Гадаадын компанитай хамтран ажиллах',
  'Хөрөнгө оруулалт татах',
  'Шинэ бүтээгдэхүүн, технологи нэвтрүүлэх',
  'Гадаадын брэндийн албан ёсны төлөөлөгч, дистрибьютор болох',
  'Бүтээгдэхүүн, үйлчилгээгээ гадаадын зах зээлд гаргах',
  'Шинэ бизнесийн түнш',
  'Бусад',
];

const EVENT = 'INTERNATIONAL BUSINESS MEETING';
const FEE = '50,000₮';
/* Төлбөрийн данс — өөрчлөх бол зөвхөн энэ хэсгийг засна. */
const BANK = { name: 'ХААН банк', account: '910005005175009575', holder: 'БЗМТ' };

const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-sm font-semibold text-gray-800 mb-2">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const input =
  'w-full border border-gray-300 rounded-xl px-4 py-3 text-[15px] ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow';

export const B2BRegistration: React.FC = () => {
  const { t } = useTranslation();
  const [orgName, setOrgName] = useState('');
  const [orgField, setOrgField] = useState('');
  const [orgFieldOther, setOrgFieldOther] = useState('');
  const [repName, setRepName] = useState('');
  const [repPosition, setRepPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hasBooth, setHasBooth] = useState<boolean | null>(null);
  const [boothNumber, setBoothNumber] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [goalOther, setGoalOther] = useState('');
  const [partnerWanted, setPartnerWanted] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const toggleGoal = (g: string) =>
    setGoals(prev => (prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (hasBooth === null) {
      setError(t('b2b_pick_booth'));
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('b2b_registrations').insert({
        org_name: orgName.trim(),
        org_field: orgField || null,
        org_field_other: orgField === 'Бусад' ? orgFieldOther.trim() || null : null,
        rep_name: repName.trim(),
        rep_position: repPosition.trim() || null,
        phone: phone.trim(),
        email: email.trim() || null,
        has_booth: hasBooth,
        booth_number: hasBooth ? boothNumber.trim() || null : null,
        goals,
        goal_other: goals.includes('Бусад') ? goalOther.trim() || null : null,
        partner_wanted: partnerWanted.trim() || null,
      });
      if (err) throw err;
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || t('b2b_send_err'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-heading text-2xl font-black text-blue-950 mb-3">{t('b2b_done')}</h1>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
            {t('b2b_done_text')}
          </p>
          {hasBooth === false && (
            <div className="text-left bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <CreditCard size={18} /> {t('b2b_pay_now')} — {FEE}
              </p>
              <ul className="text-sm text-amber-900/90 space-y-1">
                <li><b>{t('b2b_bank')}:</b> {BANK.name}</li>
                <li><b>{t('b2b_account')}:</b> {BANK.account}</li>
                <li><b>{t('b2b_holder')}:</b> {BANK.holder}</li>
                <li><b>{t('b2b_purpose')}:</b> {orgName.trim() || `[${t('b2b_org_name')}]`} - {EVENT}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      {/* Толгой нь зурагт хуудас шиг өргөн туузан хэлбэртэй тул маягтаас
          илүү өргөн контейнерт байрлана. */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Толгой — албан ёсны зурагт хуудасны загвараар:
            цагаан дэвсгэр, зүүн талд улаан BARILGA EXPO, баруун талд
            уулзалтын нэр, доор нь улаан/хөх огноо-байршлын хос. */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#C4161C] via-[#C4161C] to-[#1B3281]" />
          <div className="p-5 sm:p-10 text-center">

            <h1 className="font-heading font-black uppercase leading-[0.9] tracking-tight
                           text-[1.7rem] sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-[#1B3281]">International</span>
              <span className="block text-[#1B3281]">Business</span>
              <span className="block text-[#C4161C]">Meeting</span>
            </h1>

            {/* Болох газар, цаг — голлуулсан */}
            <div className="mt-7 flex flex-wrap items-stretch justify-center gap-y-2">
              <span className="bg-[#C4161C] text-white font-heading font-black
                               text-sm sm:text-lg px-4 sm:px-5 py-2.5 rounded-l-lg whitespace-nowrap">
                2026.09.11
              </span>
              <span className="bg-[#1B3281] text-white font-heading font-bold
                               text-sm sm:text-lg px-4 sm:px-5 py-2.5 whitespace-nowrap">
                BUYANT UKHAA PALACE
              </span>
              <span className="bg-gray-100 text-[#1B3281] font-heading font-bold border border-gray-200
                               text-sm sm:text-lg px-4 sm:px-5 py-2.5 rounded-r-lg whitespace-nowrap">
                16:00–18:00
              </span>
            </div>

            <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed mt-7 max-w-3xl mx-auto">
              {t('b2b_intro')}
            </p>
          </div>
        </div>

      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Санамж */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed">
            {t('b2b_note')}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">

          {/* ХЭСЭГ 1 */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="font-heading text-lg font-black text-blue-950 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-500" /> {t('b2b_s1')}
            </h2>
            <p className="text-xs text-gray-400 mb-6">{t('b2b_part')} 1</p>

            <div className="space-y-5">
              <div>
                <Label required>{t('b2b_org_name')}</Label>
                <input className={input} value={orgName} onChange={e => setOrgName(e.target.value)} required />
              </div>

              <div>
                <Label>{t('b2b_org_field')}</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ORG_FIELDS.map((f, fi) => (
                    <label key={f} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer text-sm transition-colors
                      ${orgField === f ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="orgField" className="accent-blue-600"
                        checked={orgField === f} onChange={() => setOrgField(f)} />
                      {t(`b2b_field_${fi + 1}` as any)}
                    </label>
                  ))}
                </div>
                {orgField === 'Бусад' && (
                  <input className={`${input} mt-2`} placeholder={t('b2b_other_ph')}
                    value={orgFieldOther} onChange={e => setOrgFieldOther(e.target.value)} />
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label required>{t('b2b_rep_name')}</Label>
                  <input className={input} value={repName} onChange={e => setRepName(e.target.value)} required />
                </div>
                <div>
                  <Label>{t('b2b_rep_pos')}</Label>
                  <input className={input} value={repPosition} onChange={e => setRepPosition(e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label required>{t('b2b_phone')}</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input className={`${input} pl-11`} type="tel" inputMode="tel"
                      value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label>{t('b2b_email')}</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input className={`${input} pl-11`} type="email"
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ХЭСЭГ 2 */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="font-heading text-lg font-black text-blue-950 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-red-500" /> {t('b2b_s2')}
            </h2>
            <p className="text-xs text-gray-400 mb-6">{t('b2b_part')} 2</p>

            <Label required>
              {t('b2b_booth_q')}
            </Label>
            <div className="space-y-2.5">
              {[
                { v: true,  main: t('b2b_yes'), sub: t('b2b_yes_sub') },
                { v: false, main: t('b2b_no'), sub: `${t('b2b_no_sub')} ${FEE}` },
              ].map(o => (
                <React.Fragment key={String(o.v)}>
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors
                    ${hasBooth === o.v ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="hasBooth" className="accent-blue-600 mt-1"
                      checked={hasBooth === o.v} onChange={() => setHasBooth(o.v)} />
                    <span>
                      <span className={`block text-[15px] ${hasBooth === o.v ? 'font-bold text-blue-900' : 'font-medium text-gray-800'}`}>
                        {o.main}
                      </span>
                      <span className={`block text-xs mt-0.5 ${o.v ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                        {o.sub}
                      </span>
                    </span>
                  </label>

                  {/* Booth дугаарыг сонгосон хариултынх нь ЯГ ДООР нь асууна */}
                  {o.v === true && hasBooth === true && (
                    <div className="ml-4 pl-5 border-l-2 border-blue-200 py-1">
                      <Label>{t('b2b_booth_no')}</Label>
                      <input className={input} placeholder={t('b2b_booth_ph')}
                        value={boothNumber} onChange={e => setBoothNumber(e.target.value)} autoFocus />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* ХЭСЭГ 3 */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="font-heading text-lg font-black text-blue-950 mb-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-red-500" /> {t('b2b_s3')}
            </h2>
            <p className="text-xs text-gray-400 mb-6">{t('b2b_part')} 3 — {t('b2b_s3_sub')}</p>

            <div className="space-y-5">
              <div>
                <Label>{t('b2b_goals_q')} <span className="font-normal text-gray-400">({t('b2b_multi')})</span></Label>
                <div className="space-y-2">
                  {GOALS.map((g, gi) => (
                    <label key={g} className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer text-sm transition-colors
                      ${goals.includes(g) ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" className="accent-blue-600 mt-0.5"
                        checked={goals.includes(g)} onChange={() => toggleGoal(g)} />
                      {t(`b2b_goal_${gi + 1}` as any)}
                    </label>
                  ))}
                </div>
                {goals.includes('Бусад') && (
                  <input className={`${input} mt-2`} placeholder={t('b2b_goal_other_ph')}
                    value={goalOther} onChange={e => setGoalOther(e.target.value)} />
                )}
              </div>

              <div>
                <Label>{t('b2b_partner_q')}</Label>
                <textarea
                  className={`${input} h-28 resize-y`}
                  placeholder={t('b2b_partner_ph')}
                  value={partnerWanted}
                  onChange={e => setPartnerWanted(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ХЭСЭГ 4 — зөвхөн Booth-гүй оролцогчид */}
          {hasBooth === false && (
            <section className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm p-6 sm:p-8">
              <h2 className="font-heading text-lg font-black text-blue-950 mb-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" /> {t('b2b_s4')}
              </h2>
              <p className="text-xs text-gray-400 mb-6">{t('b2b_part')} 4 — {t('b2b_s4_sub')}</p>

              <div className="bg-amber-50 rounded-xl p-5 space-y-2.5 text-[15px]">
                <div className="flex justify-between gap-4 pb-2.5 border-b border-amber-200">
                  <span className="text-gray-600">{t('b2b_fee')}</span>
                  <span className="font-black text-amber-900 text-lg">{FEE}</span>
                </div>
                <div className="flex justify-between gap-4"><span className="text-gray-600">{t('b2b_bank')}</span><span className="font-semibold">{BANK.name}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-600">{t('b2b_account')}</span><span className="font-semibold font-mono">{BANK.account}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-600">{t('b2b_holder')}</span><span className="font-semibold">{BANK.holder}</span></div>
                <div className="flex justify-between gap-4 pt-2.5 border-t border-amber-200">
                  <span className="text-gray-600 shrink-0">{t('b2b_purpose')}</span>
                  <span className="font-semibold text-right">{orgName.trim() || `[${t('b2b_org_name')}]`} - {EVENT}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {t('b2b_pay_note')}
              </p>
            </section>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60
                       text-white font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-sm
                       border-b-4 border-red-800 active:border-b-0 active:translate-y-[4px]"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {submitting ? t('b2b_submitting') : t('b2b_submit')}
          </button>
        </form>
      </div>
    </div>
  );
};
