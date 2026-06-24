/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Wrench, Truck, Calendar, MapPin, Phone, Menu, X, ArrowRight, CheckCircle2, Timer, User, Mail, ArrowUp, ChevronDown } from 'lucide-react';
import { useTranslation, Language } from './i18n';
import { useAdmin } from './context/AdminContext';
import { supabase } from './supabase';
import { ChatWidget } from './components/ChatWidget';
import { VideoBackground } from './components/VideoBackground';
import { trackVisit } from './utils/analytics';

// Optimize bundle size & performance via dynamic code-splitting
const StatsSection = lazy(() => import('./components/StatsSection').then(m => ({ default: m.StatsSection })));
const NewsSection = lazy(() => import('./components/NewsSection').then(m => ({ default: m.NewsSection })));
const ProgramSection = lazy(() => import('./components/ProgramSection').then(m => ({ default: m.ProgramSection })));
const GallerySection = lazy(() => import('./components/GallerySection').then(m => ({ default: m.GallerySection })));
const GuidePage = lazy(() => import('./components/GuidePage').then(m => ({ default: m.GuidePage })));
const BoothBooking = lazy(() => import('./components/BoothBooking').then(m => ({ default: m.BoothBooking })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AuthCallback = lazy(() => import('./components/AuthCallback').then(m => ({ default: m.AuthCallback })));

// Loading placeholder component for clean layout transition
function LoadingPlaceHolder() {
  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse bg-gray-50/50">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="h-3 w-36 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function App() {
  const { data } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth');

  // Сайтын хандалтын тоог бүртгэх (админ хуудсыг тооцохгүй)
  useEffect(() => {
    if (!isAdminRoute) {
      trackVisit(location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { lang, setLang, t } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regType, setRegType] = useState<'visitor' | 'exhibitor' | null>(null);
  const [isRegSuccess, setIsRegSuccess] = useState(false);

  // Registration form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formReq, setFormReq] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const registrationId = 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

    try {
      const payload: any = {
        id: registrationId,
        type: regType,
        name: formName,
        phone: formPhone,
      };

      if (regType === 'visitor') {
        payload.email = formEmail || null;
      } else if (regType === 'exhibitor') {
        payload.org = formOrg || null;
        payload.area = formArea || null;
        payload.req = formReq || null;
      }

      const { error } = await supabase.from('registrations').insert(payload);
      if (error) throw new Error(error.message);

      setIsRegSuccess(true);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormOrg('');
      setFormArea('');
      setFormReq('');
    } catch (error) {
      alert("Бүртгэл хадгалахад алдаа гарлаа: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClick = (path: string, e: React.MouseEvent) => {
    const isHashPath = path.includes('#');
    if (isHashPath) {
      const [pathname, hash] = path.split('#');
      const isCurrentPage = pathname === '' || pathname === '/'
        ? (location.pathname === '/' || location.pathname === '')
        : location.pathname === pathname;
        
      if (isCurrentPage && hash) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          const navbarOffset = 85;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - navbarOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          window.history.pushState(null, '', path);
        }
      }
    } else {
      if (location.pathname === path) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    if (location.hash) {
      const hashId = location.hash.replace('#', '');
      let attempts = 0;
      
      const tryScroll = () => {
        const element = document.getElementById(hashId);
        if (element) {
          const navbarOffset = 85;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - navbarOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      };

      if (!tryScroll()) {
        const interval = setInterval(() => {
          attempts++;
          if (tryScroll() || attempts >= 20) {
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const targetDate = new Date('2026-09-11T00:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Navbar segment */}
      {!isAdminRoute && (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-blue-900/40 backdrop-blur-md shadow-lg border-b border-white/10 py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center min-w-0">
              <Link to="/" onClick={(e) => handleMenuClick('/', e)} className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img
                  src={data.logoUrl}
                  alt="Barilga Expo Logo"
                  referrerPolicy="no-referrer"
                  className="h-8 sm:h-10 md:h-16 object-contain brightness-0 invert transition-all shrink-0"
                />
                <div className="w-px h-6 sm:h-8 md:h-10 bg-white/30 shrink-0"></div>
                <img
                  src="https://mcud.gov.mn/resource/mcud/image/2026/03/02/2eepuf1io6kp37z3/100%20logo_01.png"
                  alt="Их Барилга 100"
                  referrerPolicy="no-referrer"
                  className="h-6 sm:h-8 md:h-12 object-contain brightness-0 invert transition-all pb-1 shrink-0"
                />
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-end">
              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center space-x-6 mr-6">
                {data.menus.map(menu => (
                  menu.path.startsWith('/') ? (
                    <Link key={menu.id} to={menu.path} onClick={(e) => handleMenuClick(menu.path, e)} className="text-sm font-medium text-white/90 hover:text-white transition-colors uppercase">
                      {lang === 'mn' ? menu.labelMn : menu.labelEn}
                    </Link>
                  ) : (
                    <a key={menu.id} href={menu.path} onClick={(e) => handleMenuClick(menu.path, e)} className="text-sm font-medium text-white/90 hover:text-white transition-colors uppercase">
                      {lang === 'mn' ? menu.labelMn : menu.labelEn}
                    </a>
                  )
                ))}
                <button onClick={() => setIsRegModalOpen(true)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-red-500/20 active:scale-95">
                  {t('nav_register')}
                </button>
              </div>

              <div className="flex items-center gap-2 relative">
                <div className="relative">
                  <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1.5 rounded-lg backdrop-blur-sm transition-all"
                  >
                    <span className="text-xl leading-none">
                      {lang === 'mn' ? '🇲🇳' : lang === 'en' ? '🇬🇧' : lang === 'zh' ? '🇨🇳' : lang === 'ru' ? '🇷🇺' : '🇰🇷'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isLangMenuOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl overflow-hidden py-1 z-50 border border-gray-100">
                      {[
                        { code: 'mn', flag: '🇲🇳', name: 'Монгол' },
                        { code: 'en', flag: '🇬🇧', name: 'English' },
                        { code: 'zh', flag: '🇨🇳', name: '中文' },
                        { code: 'ru', flag: '🇷🇺', name: 'Русский' },
                        { code: 'ko', flag: '🇰🇷', name: '한국어' },
                      ].map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code as any); setIsLangMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${lang === l.code ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700'}`}
                        >
                          <span className="text-xl">{l.flag}</span>
                          <span className="text-sm">{l.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Mobile menu button */}
                <div className="lg:hidden flex items-center">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white hover:text-red-400 p-2"
                  >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-blue-900/80 backdrop-blur-md border-t border-white/10 px-4 pt-2 pb-6 space-y-1 shadow-xl">
            {data.menus.map(menu => (
              menu.path.startsWith('/') ? (
                <Link key={menu.id} to={menu.path} onClick={(e) => { setIsMenuOpen(false); handleMenuClick(menu.path, e); }} className="block px-3 py-3 text-base font-medium text-white hover:bg-white/10 rounded-md uppercase">
                  {lang === 'mn' ? menu.labelMn : menu.labelEn}
                </Link>
              ) : (
                <a key={menu.id} href={menu.path} onClick={(e) => { setIsMenuOpen(false); handleMenuClick(menu.path, e); }} className="block px-3 py-3 text-base font-medium text-white hover:bg-white/10 rounded-md uppercase">
                  {lang === 'mn' ? menu.labelMn : menu.labelEn}
                </a>
              )
            ))}
            <button onClick={() => {setIsRegModalOpen(true); setIsMenuOpen(false);}} className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-base font-semibold transition-colors">
              {t('nav_register')}
            </button>
          </div>
        )}
      </nav>
      )}

      <Routes>
        <Route path="/admin" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <AdminPanel />
          </Suspense>
        } />
        <Route path="/auth/callback" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <AuthCallback />
          </Suspense>
        } />
        <Route path="/" element={
          <>
            {/* Hero Section */}
            <section id="home" className="relative pt-28 pb-12 md:pb-0 md:pt-20 min-h-[100svh] md:min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-blue-950">
          <div className="absolute inset-0 bg-blueprint z-10 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-blue-900/35 to-blue-900/10 mix-blend-multiply z-10" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-blue-950/80 to-transparent z-10" />
          {/* Дэвсгэр видео — удаашруулж, дуугүй, давталттай тоглоно */}
          <VideoBackground
            src="/hero-timelapse.mp4"
            rate={0.15}
            className="w-full h-full scale-105 opacity-90"
          />
          {/* Текст уншигдахуйц байхын тулд зүүн талд харанхуй давхарга (баруун тал ил тод) */}
          <div className="absolute inset-0 z-[15] bg-gradient-to-r from-blue-950/85 via-blue-950/40 to-transparent" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 xl:col-span-8 relative">
              {/* Construction Accent Line */}
              <div className="absolute -left-6 md:-left-10 top-2 bottom-4 w-1 bg-gradient-to-b from-red-500 rounded-full via-red-400 to-transparent hidden md:block"></div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-xs uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                The 40th International Exhibition
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] mb-4 drop-shadow-2xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">{t('hero_title')}</span>
              </h1>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl text-red-400 font-bold tracking-wide mb-6 flex items-center gap-3">
                {t('hero_subtitle')}
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl text-blue-100/80 leading-relaxed mb-8 md:mb-10 max-w-2xl font-light">
                {t('hero_desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="glow-card flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full sm:w-auto">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/30">
                    <Calendar className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-200/60 uppercase tracking-widest font-semibold">{t('when')}</div>
                    <div className="font-bold text-white text-lg">{t('when_date')}</div>
                  </div>
                </div>
                
                <div className="glow-card flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full sm:w-auto">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/30">
                    <MapPin className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-200/60 uppercase tracking-widest font-semibold">{t('where')}</div>
                    <div className="font-bold text-white text-lg">{t('where_loc')}</div>
                  </div>
                </div>
              </div>

              {/* Картын хүрээг тойрон эргэлддэг гэрэлтэх анимэйшн */}
              <style>{`
                @property --glow-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
                .glow-card { position: relative; isolation: isolate; }
                .glow-card::before {
                  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
                  background: conic-gradient(from var(--glow-angle),
                    transparent 0deg, transparent 250deg,
                    #f87171 300deg, #fca5a5 330deg, #fca5a5 345deg, transparent 360deg);
                  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                  -webkit-mask-composite: xor; mask-composite: exclude;
                  pointer-events: none;
                  animation: glowSpin 5s linear infinite;
                }
                @keyframes glowSpin { to { --glow-angle: 360deg; } }
                @media (prefers-reduced-motion: reduce) { .glow-card::before { animation: none; } }
              `}</style>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0 relative z-30">


              <div className="bg-blue-900/40 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-blueprint z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                
                <h3 className="text-red-400 font-bold mb-6 flex items-center gap-2 relative z-10 text-sm tracking-widest uppercase">
                  <Timer className="h-5 w-5" />
                  {t('starts_in')}
                </h3>
                
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center relative z-10">
                  <div className="bg-blue-950/60 rounded-xl p-3 border border-blue-400/20 backdrop-blur-sm shadow-inner group-hover:border-red-500/30 transition-colors duration-500">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono mb-1">{timeLeft.days}</div>
                    <div className="text-[8px] sm:text-[10px] text-blue-200/60 uppercase tracking-wider font-semibold">{t('days')}</div>
                  </div>
                  <div className="bg-blue-950/60 rounded-xl p-3 border border-blue-400/20 backdrop-blur-sm shadow-inner group-hover:border-red-500/30 transition-colors duration-500">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono mb-1">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-[8px] sm:text-[10px] text-blue-200/60 uppercase tracking-wider font-semibold">{t('hours')}</div>
                  </div>
                  <div className="bg-blue-950/60 rounded-xl p-3 border border-blue-400/20 backdrop-blur-sm shadow-inner group-hover:border-red-500/30 transition-colors duration-500">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono mb-1">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-[8px] sm:text-[10px] text-blue-200/60 uppercase tracking-wider font-semibold">{t('minutes')}</div>
                  </div>
                  <div className="bg-blue-950/60 rounded-xl p-3 border border-blue-400/20 backdrop-blur-sm shadow-inner group-hover:border-red-500/30 transition-colors duration-500">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono mb-1">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-[8px] sm:text-[10px] text-blue-200/60 uppercase tracking-wider font-semibold">{t('seconds')}</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-blue-400/20 text-center relative z-10">
                  <p className="text-sm text-blue-200/80 font-medium mb-4">
                    {t('space_open')}
                  </p>
                  <Link to="/booking" className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-95 flex items-center justify-center gap-2 group border-b-4 border-red-700 active:border-b-0 active:translate-y-[4px] w-full">
                    {t('book_booth')}
                    <CheckCircle2 className="h-5 w-5 opacity-80" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counters Section */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <StatsSection />
      </Suspense>

      {/* Organizers Section */}
      <section className="bg-white pt-16 pb-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-100 lg:flex lg:justify-between lg:items-center gap-8 shadow-sm">
            <div className="mb-8 lg:mb-0 lg:w-1/3 flex flex-col items-center text-center">
              <div className="text-red-600 font-bold text-sm uppercase tracking-wider mb-6 text-center">{t('org_main')}</div>
              <a href="https://barilga.mn" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity" title="BARILGA.MN">
                <img src="/barilga-mn-logo.png" alt="BARILGA.MN" loading="lazy" className="h-12 w-auto object-contain" />
              </a>
            </div>

            <div className="w-full h-px lg:w-px lg:h-24 bg-gray-200 my-8 lg:my-0"></div>

            <div className="lg:w-2/3 flex flex-col items-center">
              <div className="text-red-600 font-bold text-sm uppercase tracking-wider mb-6 text-center">{t('org_co')}</div>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 items-start">
                {data.organizers.map(org => {
                  const resolveOrgUrl = (o: typeof org): string | undefined => {
                    if (o.url) return o.url;
                    const n = (o.name || '').toLowerCase();
                    if (n.includes('яам')) return 'https://mcud.gov.mn';
                    if (n.includes('нийслэл') || n.includes('засаг')) return 'https://www.ulaanbaatar.mn';
                    if (n.includes('хөгж')) return 'https://barilga.gov.mn';
                    return undefined;
                  };
                  const url = resolveOrgUrl(org);
                  return (
                    <a
                      key={org.id}
                      href={url || '#'}
                      {...(url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity w-36 text-center group"
                      title={org.name}
                    >
                      <div className="h-16 w-16 lg:h-20 lg:w-20 flex items-center justify-center">
                        <img src={org.logo} alt={org.name} loading="lazy" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-[11px] text-gray-700 uppercase leading-snug font-semibold">{org.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      {data.sponsors && data.sponsors.length > 0 && (
        <section className="bg-white pb-16 pt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {([
              { type: 'main' as const, label: t('spon_main'), size: 'h-20 lg:h-24' },
              { type: 'sponsor' as const, label: t('spon_sponsor'), size: 'h-16 lg:h-20' },
              { type: 'supporter' as const, label: t('spon_supporter'), size: 'h-20 lg:h-24' },
            ]).map(group => {
              const items = data.sponsors.filter(s => s.type === group.type && s.logo);
              if (items.length === 0) return null;
              return (
                <div key={group.type} className="flex flex-col items-center">
                  <div className="text-red-600 font-bold text-sm uppercase tracking-wider mb-6 text-center">{group.label}</div>
                  <div className="flex flex-wrap justify-center gap-8 sm:gap-12 items-center">
                    {items.map(s => {
                      const Tag: any = s.url ? 'a' : 'div';
                      const linkProps = s.url ? { href: s.url, target: '_blank', rel: 'noopener noreferrer' } : {};
                      return (
                        <Tag key={s.id} {...linkProps} className={`flex flex-col items-center gap-3 w-36 text-center group ${s.url ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''}`} title={s.name}>
                          <div className={`${group.size} flex items-center justify-center`}>
                            <img src={s.logo} alt={s.name} loading="lazy" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                          </div>
                          <span className="text-[11px] text-gray-700 leading-snug font-semibold">{s.name}</span>
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories */}
      <section id="categories" className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-blueprint-dark opacity-40 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 z-10 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 px-4">
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 mb-3">
              <span className="w-8 h-px bg-red-500"></span>
              {t('cat_pre')}
              <span className="w-8 h-px bg-red-500"></span>
            </h3>
            <h2 className="font-heading text-3xl md:text-5xl font-black text-blue-950 mb-6 tracking-tight">
              {t('cat_title')}
            </h2>
            <div className="w-16 h-1.5 bg-blue-900 mx-auto rounded-none group">
              <div className="w-8 h-full bg-red-500 rounded-none group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="group bg-white p-8 rounded-none shadow-[4px_4px_0px_rgba(59,130,246,0.1)] border-2 border-transparent hover:border-blue-900 transition-all duration-300 relative">
              <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center">
                <div className="w-3 h-3 border-t-2 border-r-2 border-gray-250 group-hover:border-red-500 absolute top-0 right-0 transition-colors duration-300"></div>
              </div>
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-none flex items-center justify-center mb-8 border border-blue-100 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-black text-gray-900 mb-6 h-14 tracking-tight group-hover:text-red-500 transition-colors">
                {t('cat1_title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat1_1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat1_2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat1_3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat1_4')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat1_5')}</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="group bg-white p-8 rounded-none shadow-[4px_4px_0px_rgba(59,130,246,0.1)] border-2 border-transparent hover:border-blue-900 transition-all duration-300 relative">
              <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center">
                <div className="w-3 h-3 border-t-2 border-r-2 border-gray-250 group-hover:border-red-500 absolute top-0 right-0 transition-colors duration-300"></div>
              </div>
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-none flex items-center justify-center mb-8 border border-blue-100 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-black text-gray-900 mb-6 h-14 tracking-tight group-hover:text-red-500 transition-colors">
                {t('cat2_title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat2_1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat2_2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat2_3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat2_4')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat2_5')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat2_6')}</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-8 rounded-none shadow-[4px_4px_0px_rgba(59,130,246,0.1)] border-2 border-transparent hover:border-blue-900 transition-all duration-300 relative">
              <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center">
                <div className="w-3 h-3 border-t-2 border-r-2 border-gray-250 group-hover:border-red-500 absolute top-0 right-0 transition-colors duration-300"></div>
              </div>
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-none flex items-center justify-center mb-8 border border-blue-100 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-black text-gray-900 mb-6 h-14 tracking-tight group-hover:text-red-500 transition-colors">
                {t('cat3_title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat3_1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat3_2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat3_3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat3_4')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{t('cat3_5')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <NewsSection />
      </Suspense>

      {/* Gallery Section */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <GallerySection />
      </Suspense>

      {/* Program Section */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <ProgramSection />
      </Suspense>
          </>
        } />
        <Route path="/guide" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <GuidePage />
          </Suspense>
        } />
        <Route path="/booking" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <BoothBooking />
          </Suspense>
        } />
      </Routes>

      {/* Footer & Contact */}
      {!isAdminRoute && (
        <footer id="contact" className="bg-blue-900 text-white pt-16 pb-10 border-t-4 border-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={data.logoUrl}
                    alt="Barilga Expo Logo"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-10 object-contain brightness-0 invert"
                  />
                  <div className="w-px h-8 bg-white/30"></div>
                  <img
                    src="https://mcud.gov.mn/resource/mcud/image/2026/03/02/2eepuf1io6kp37z3/100%20logo_01.png"
                    alt="Их Барилга 100"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-8 object-contain brightness-0 invert pb-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                  <p className="text-blue-100 text-sm">
                    {data.contact.address}
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                  <div className="text-blue-100 text-sm">
                    <p>{t('contact_hours')}</p>
                    <p>{t('contact_days')}</p>
                    <p>{t('contact_time')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-400 shrink-0" />
                  <a href={`mailto:${data.contact.email}`} className="text-blue-100 text-sm hover:text-white transition-colors">
                    {data.contact.email}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                  <div className="text-blue-100 text-sm space-y-0.5">
                    <p>{t('contact_phone')}</p>
                    <a href={`tel:${data.contact.phone1}`} className="block hover:text-white transition-colors">{data.contact.phone1}</a>
                    <a href={`tel:${data.contact.phone2}`} className="block hover:text-white transition-colors">{data.contact.phone2}</a>
                    <a href={`tel:${data.contact.phone3}`} className="block hover:text-white transition-colors">{data.contact.phone3}</a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <a href={data.contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href={data.contact.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href={data.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Google Maps Location */}
            <div className="lg:col-span-2 h-64 md:h-full min-h-[300px] rounded-xl overflow-hidden shadow-lg border border-white/10">
              <iframe 
                src="https://maps.google.com/maps?q=Barilga%20MN%20%D0%91%D0%B0%D1%80%D0%B8%D0%BB%D0%B3%D0%B0%20%D0%9C%D0%9D&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-400 pt-6 border-t border-white/10">
            <div>&copy; {new Date().getFullYear()} {t('copyright')}</div>
          </div>
        </div>
      </footer>
      )}

      {/* Registration Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm" onClick={() => {setIsRegModalOpen(false); setRegType(null); setIsRegSuccess(false);}}></div>
          {isRegSuccess ? (
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 z-10">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">{t('mod_succ')}</h3>
              <p className="text-gray-600 mb-6">{t('mod_succ_desc')}</p>
              <button
                onClick={() => {setIsRegModalOpen(false); setRegType(null); setIsRegSuccess(false);}}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                {t('btn_close')}
              </button>
            </div>
          ) : (
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-heading text-2xl font-bold text-blue-900">{t('mod_title')}</h3>
              <button onClick={() => {setIsRegModalOpen(false); setRegType(null);}} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {!regType ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setRegType('visitor')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 py-10 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-500 group-hover:text-white transition-colors">
                       <User className="h-8 w-8" />
                    </div>
                    <span className="font-heading font-bold text-lg text-gray-900">{t('mod_vis')}</span>
                    <span className="text-sm text-gray-500 text-center mt-2 leading-relaxed">{t('mod_vis_desc')}</span>
                  </button>
                  
                  <button
                    onClick={() => { setIsRegModalOpen(false); setRegType(null); navigate('/booking'); window.scrollTo({ top: 0 }); }}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 py-10 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-500 group-hover:text-white transition-colors">
                       <Building2 className="h-8 w-8" />
                    </div>
                    <span className="font-heading font-bold text-lg text-gray-900">{t('mod_exh')}</span>
                    <span className="text-sm text-gray-500 text-center mt-2 leading-relaxed">{t('mod_exh_desc')}</span>
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('mod_name')}</label>
                    <input 
                      type="text" 
                      required 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('mod_ph')}</label>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{8}"
                      maxLength={8}
                      placeholder="99112233"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all"
                    />
                  </div>
                  {regType === 'visitor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('mod_email')}</label>
                      <input 
                        type="email" 
                        required 
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" 
                      />
                    </div>
                  )}
                  {regType === 'exhibitor' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('mod_org')}</label>
                        <input 
                          type="text" 
                          required 
                          value={formOrg}
                          onChange={(e) => setFormOrg(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('mod_area')}</label>
                        <select 
                          required 
                          value={formArea}
                          onChange={(e) => setFormArea(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all bg-white"
                        >
                          <option value="" disabled>{t('mod_sel')}</option>
                          <option value="6">6 м²</option>
                          <option value="9">9 м²</option>
                          <option value="12">12 м²</option>
                          <option value="18">18 м²</option>
                          <option value="24">24 м²</option>
                          <option value="32">32 м²</option>
                          <option value="36">36 м²</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('mod_req')}</label>
                        <textarea 
                          value={formReq}
                          onChange={(e) => setFormReq(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all resize-none" 
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setRegType(null)} 
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                    >
                      {t('btn_back')}
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-[2] bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? t('bb_submitting') : t('btn_send')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* Scroll to top button */}
      {!isAdminRoute && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed right-6 bottom-24 z-50 p-3 rounded-full bg-blue-900/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-blue-900/60 transition-all duration-300 shadow-lg ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Дээш гүйлгэх"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* AI Chat Widget */}
      {!isAdminRoute && <ChatWidget />}
    </div>
  );
}
