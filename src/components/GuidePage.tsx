import React from 'react';
import { Calendar, MapPin, CheckCircle2, Navigation, Target, ArrowLeft, Download, Info, User } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useAdmin } from '../context/AdminContext';

export const GuidePage: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useAdmin();
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Header / Hero */}
      <div className="relative pt-24 pb-16 bg-blue-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-red-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-300 font-medium text-sm mb-6 border border-red-500/30">
            <Navigation className="w-4 h-4" />
            {t('gd_badge')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 tracking-tight drop-shadow-md">
            {t('gd_title')}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            {t('gd_desc1')}
            <br className="hidden sm:block" /> {t('gd_desc2')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Intro Highlight */}
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 md:p-12 mb-16 text-center transform hover:scale-[1.01] transition-transform shadow-sm">
          <p className="text-xl md:text-2xl text-red-900 font-medium leading-relaxed max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: t('gd_high') }}></p>
        </div>

        {/* Sectors Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4">{t('gd_sec')}</h2>
            <div className="w-16 h-1 bg-red-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 font-heading">{t('cat1_title')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c1_1')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c1_2')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c1_3')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c1_4')}</span>
                </li>
              </ul>
            </div>

            {/* Box 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 font-heading">{t('gd_c2_t')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c2_1')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c2_2')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c2_3')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c2_4')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c2_5')}</span>
                </li>
              </ul>
            </div>

            {/* Box 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 font-heading">{t('gd_c3_t')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c3_1')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c3_2')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c3_3')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{t('gd_c3_4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-blue-900 text-white rounded-3xl p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <User className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <h3 className="text-5xl font-black font-heading mb-4 text-red-400">40,000+</h3>
              <h4 className="text-2xl font-bold mb-3">{t('gd_v_t')}</h4>
              <p className="text-blue-100/80 leading-relaxed font-light">
                {t('gd_v_d')}
              </p>
            </div>
          </div>
          
          <div className="bg-red-600 text-white rounded-3xl p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Target className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <h3 className="text-5xl font-black font-heading mb-4 text-blue-900">100 {t('stat3_suf')}</h3>
              <h4 className="text-2xl font-bold mb-3">{t('gd_s_t')}</h4>
              <p className="text-red-50/90 leading-relaxed font-light">
                {t('gd_s_d')}
              </p>
            </div>
          </div>
        </div>

        {/* Long Text block */}
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6">{t('gd_int_t')}</h2>
              <div className="w-12 h-1 bg-red-500 rounded-full mb-6"></div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t('gd_int_d')}
              </p>
            </div>
            <div className="md:w-1/2 rounded-2xl overflow-hidden shadow-xl">
              <img src="https://5.imimg.com/data5/BW/OV/MY-622376/international-flags-500x500.jpg" alt="International Companies" loading="lazy" referrerPolicy="no-referrer" className="w-full h-80 object-cover" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-8 text-center">{t('gd_op_t')}</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  {t('gd_b2b_t')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('gd_b2b_d')}
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  {t('gd_vip_t')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('gd_vip_d')}
                </p>
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm font-bold text-red-800 flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4" /> {t('gd_warn_t')}
                  </p>
                  <p className="text-sm text-red-700">{t('gd_warn_d')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6">{t('gd_mark_t')}</h2>
              <div className="w-12 h-1 bg-blue-600 rounded-full mb-6"></div>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                {t('gd_mark_d1')}
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t('gd_mark_d2')}
              </p>
            </div>
            <div className="md:w-1/2 rounded-2xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop" alt="Marketing Results" loading="lazy" referrerPolicy="no-referrer" className="w-full h-80 object-cover" />
            </div>
          </div>

          <div className="bg-blue-900 text-white rounded-3xl p-8 md:p-12 mb-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
            <div className="absolute inset-0 bg-blue-900/90 rounded-3xl"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold font-heading mb-4 text-red-400">{t('gd_day_t')}</h3>
                <p className="text-blue-100 leading-relaxed mb-6">
                  {t('gd_day_d')}
                </p>
                <div className="p-5 bg-white/10 rounded-xl border border-white/20">
                  <h4 className="font-bold mb-2">{t('gd_ad_t')}</h4>
                  <p className="text-blue-100 text-sm">{t('gd_ad_d')}</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading mb-4 text-red-400">{t('gd_rule_t')}</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 p-5 rounded-xl border border-white/10">
                    <h4 className="font-bold text-white mb-2">{t('gd_rule1_t')}</h4>
                    <p className="text-blue-100 text-sm">{t('gd_rule1_d')}</p>
                  </div>
                  <p className="text-blue-100 italic text-sm mt-4">
                    {t('gd_rule_thanks')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl p-8 md:p-10 border border-gray-200 mt-12 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center font-heading">{t('gd_cnt_t')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="flex flex-col gap-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-xs">Менежерүүд / Утас</span>
                <a href={`tel:${data.contact.phone1}`} className="text-blue-600 hover:underline font-medium">{data.contact.phone1}</a>
                <a href={`tel:${data.contact.phone3}`} className="text-blue-600 hover:underline font-medium">{data.contact.phone3}</a>
              </div>
              <div className="flex flex-col gap-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-xs">Гадаад харилцаа (English)</span>
                <a href={`tel:${data.contact.phone2}`} className="text-blue-600 hover:underline font-medium">{data.contact.phone2}</a>
              </div>
              <div className="flex flex-col gap-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-xs">И-Мэйл хаяг</span>
                <a href={`mailto:${data.contact.email}`} className="text-blue-600 hover:underline font-medium break-all">{data.contact.email}</a>
              </div>
              <div className="flex flex-col gap-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-xs">Хаяг байршил</span>
                <span className="text-gray-600 font-normal leading-relaxed">{data.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
