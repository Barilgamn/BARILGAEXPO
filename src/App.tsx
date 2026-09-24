/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Truck, Calendar, MapPin, Phone, Menu, X, ArrowRight, CheckCircle2, Timer, User, Mail, ArrowUp, ChevronDown,
  Building, House, HousePlus, DraftingCompass, KeyRound, HardHat, Blocks, PaintRoller, PlugZap, ShowerHead,
  Sofa, Trees, Tractor, Drill, Layers, Caravan, Car } from 'lucide-react';
import { useTranslation, Language } from './i18n';
import { useAdmin } from './context/AdminContext';
import { supabase } from './supabase';
import { ChatWidget } from './components/ChatWidget';
import { NewsPopup } from './components/NewsPopup';
import { BoothClosedNotice } from './components/BoothClosedNotice';
import { CityTimelapse } from './components/CityTimelapse';
import { trackVisit } from './utils/analytics';

// Optimize bundle size & performance via dynamic code-splitting
const VideoSection = lazy(() => import('./components/VideoSection').then(m => ({ default: m.VideoSection })));
const StatsSection = lazy(() => import('./components/StatsSection').then(m => ({ default: m.StatsSection })));
const ReelsSection = lazy(() => import('./components/ReelsSection').then(m => ({ default: m.ReelsSection })));
const WinnersSection = lazy(() => import('./components/WinnersSection').then(m => ({ default: m.WinnersSection })));
const ParticipantsSection = lazy(() => import('./components/ParticipantsSection').then(m => ({ default: m.ParticipantsSection })));
const NewsSection = lazy(() => import('./components/NewsSection').then(m => ({ default: m.NewsSection })));
const ProgramSection = lazy(() => import('./components/ProgramSection').then(m => ({ default: m.ProgramSection })));
const GallerySection = lazy(() => import('./components/GallerySection').then(m => ({ default: m.GallerySection })));
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const IsometricFloorPlan = lazy(() => import('./components/IsometricFloorPlan').then(m => ({ default: m.IsometricFloorPlan })));
const GuidePage = lazy(() => import('./components/GuidePage').then(m => ({ default: m.GuidePage })));
const BoothBooking = lazy(() => import('./components/BoothBooking').then(m => ({ default: m.BoothBooking })));
const PosterMaker = lazy(() => import('./components/PosterMaker').then(m => ({ default: m.PosterMaker })));
const B2BRegistration = lazy(() => import('./components/B2BRegistration').then(m => ({ default: m.B2BRegistration })));
const ProgramPage = lazy(() => import('./components/ProgramPage').then(m => ({ default: m.ProgramPage })));
const NewsPage = lazy(() => import('./components/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsArticlePage = lazy(() => import('./components/NewsArticlePage').then(m => ({ default: m.NewsArticlePage })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AuthCallback = lazy(() => import('./components/AuthCallback').then(m => ({ default: m.AuthCallback })));

// Loading placeholder component for clean layout transition
function LoadingPlaceHolder() {
  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
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

  // Meta Pixel — хуудас солигдох бүрт PageView дуудах
  useEffect(() => {
    if (!isAdminRoute && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView');
    }
  }, [location.pathname]);
  const { lang, setLang, t } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Гар утасны цэс нээлттэй үед арын хуудас гүйлгэгдэхгүй байхаар түгжинэ
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  // Үзэсгэлэн эхлэхээс өмнө / явагдаж байх / өндөрлөсөн гэсэн 3 төлөв
  const [phase, setPhase] = useState<'before' | 'live' | 'ended'>('before');
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

  // Цэсний лого, бичиг нь ЦАГААН тул зөвхөн бараан дэвсгэр дээр уншигдана.
  // Нүүр хуудсанд арын том зураг байдаг тул ил тод байж болно, харин дотоод
  // хуудсууд цайвар дэвсгэртэй — тэнд заавал бүтэн бараан дэвсгэр өгнө.
  const isHomePage = location.pathname === '/';
  const navStyle = !isHomePage
    ? 'bg-[#070707] border-b hairline py-2'
    : isScrolled
      ? 'bg-[#070707]/80 backdrop-blur-md border-b hairline py-2'
      : 'bg-transparent py-4';

  /** Хөтөлбөр, мэдээ хоёр одоо бие даасан хуудастай боллоо. Баазад хуучин
   *  "/#program", "/#news" гэж хадгалагдсан байж болзошгүй тул цэсний
   *  холбоосыг залруулж харуулна (админаас засах шаардлагагүй). */
  const PAGE_PATHS: Record<string, string> = {
    '/#program': '/program',
    '#program': '/program',
    '/#news': '/news',
    '#news': '/news',
  };
  const menus = data.menus.map(m =>
    PAGE_PATHS[m.path] ? { ...m, path: PAGE_PATHS[m.path] } : m,
  );

  /** 40 дэх удаагийн үзэсгэлэнгийн талбайн захиалга хаагдсан тул "Талбай
   *  захиалах" дээр дарахад эхлээд мэдэгдэл гарч, зөвшөөрвөл 41 дэх
   *  удаагийн захиалгын хүсэлтийн хуудас руу оруулна. */
  const [isBoothNoticeOpen, setIsBoothNoticeOpen] = useState(false);

  const askBeforeBooking = (e: React.MouseEvent) => {
    // Шинэ цонхонд нээх (cmd/ctrl+click) гэвэл саад болохгүй
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setIsBoothNoticeOpen(true);
  };

  const goToBooking = () => {
    setIsBoothNoticeOpen(false);
    navigate('/booking');
    window.scrollTo({ top: 0 });
  };

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
    // Улаанбаатарын цагаар (UTC+8) — эс бөгөөс зочны цагийн бүсээс хамаарч
    // тоолуур өөр өөр утга харуулна.
    // Хаалга нээгдэх/хаагдах яг мөч (Улаанбаатарын цагаар, UTC+8).
    const startDate = new Date('2026-09-11T09:00:00+08:00').getTime();
    const endDate   = new Date('2026-09-13T18:00:00+08:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = startDate - now;

      if (difference > 0) {
        setPhase('before');
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Тоолуур 0 болмогц хөлдөж үлдэхгүй — төлөвөө сольж мессеж харуулна
        setPhase(now < endDate ? 'live' : 'ended');
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="min-h-screen surface font-sans text-white">
      {/* Navbar segment */}
      {!isAdminRoute && (
        <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${navStyle}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center min-w-0">
              <Link to="/" onClick={(e) => handleMenuClick('/', e)} className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img
                  src={data.logoUrl}
                  alt="Barilga Expo Logo"
                  referrerPolicy="no-referrer"
                  className="h-11 sm:h-14 md:h-[4.5rem] object-contain brightness-0 invert transition-all shrink-0"
                />
                <div className="w-px h-7 sm:h-9 md:h-12 bg-white/30 shrink-0"></div>
                <img
                  src="https://mcud.gov.mn/resource/mcud/image/2026/03/02/2eepuf1io6kp37z3/100%20logo_01.png"
                  alt="Их Барилга 100"
                  referrerPolicy="no-referrer"
                  className="h-9 sm:h-12 md:h-16 object-contain brightness-0 invert transition-all pb-1 shrink-0"
                />
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-end">
              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center space-x-6 mr-6">
                {menus.map(menu => (
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
          <div className="lg:hidden absolute inset-x-0 top-full max-h-[calc(100svh-4.5rem)] bg-[#070707] overflow-y-auto border-t hairline px-4 pt-2 pb-6 space-y-1 shadow-xl">
            {menus.map(menu => (
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
            <section id="home" className="relative surface min-h-[100svh] flex flex-col justify-end overflow-hidden pt-28 pb-0">
        {/* Дэвсгэр: хотын зураг гүн харанхуй давхаргын доор */}
        <div className="absolute inset-0 w-full h-full">
          <CityTimelapse src="/hero-city.jpg" className="w-full h-full opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070707]/85 via-[#070707]/70 to-[#070707]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/45 to-transparent" />
        </div>

        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex-1 flex flex-col justify-center pt-10">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="eyebrow">The 40th International Exhibition</span>
            </div>

            <h1 className="display text-[2.6rem] sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6">
              {t('hero_title')}
            </h1>

            <p className="text-red-500 display text-lg sm:text-2xl md:text-3xl mb-7">
              {t('hero_subtitle')}
            </p>

            <p className="text-white/55 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mb-10">
              {t('hero_desc')}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/booking"
                onClick={askBeforeBooking}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-7 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-colors"
              >
                {t('book_booth')}
                <CheckCircle2 className="h-4 w-4 opacity-80" />
              </Link>
              <Link
                to="/program"
                className="inline-flex items-center gap-2 border hairline text-white/90 hover:text-white hover:bg-white/5 px-7 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-colors"
              >
                {t('link_program')}
              </Link>
            </div>
          </div>
        </div>

        {/* Доод мөр: хэзээ / хаана / countdown / талбайн дүүргэлт */}
        <div className="relative z-20 w-full border-t hairline bg-[#070707]/70 backdrop-blur-md">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="py-5 lg:py-7 lg:pr-8">
              <div className="eyebrow mb-2 flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {t('when')}</div>
              <div className="text-white font-bold text-sm sm:text-lg leading-snug">{t('when_date')}</div>
            </div>

            <div className="py-5 lg:py-7 lg:px-8">
              <div className="eyebrow mb-2 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {t('where')}</div>
              <div className="text-white font-bold text-sm sm:text-lg leading-snug">{t('where_loc')}</div>
            </div>

            <div className="py-5 lg:py-7 lg:px-8 border-t lg:border-t-0 hairline">
              <div className="eyebrow mb-2 flex items-center gap-1.5">
                {phase === 'live'
                  ? <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  : <Timer className="h-3 w-3" />}
                {phase === 'before' ? t('starts_in') : phase === 'live' ? t('expo_live') : t('expo_ended')}
              </div>
              {phase === 'before' ? (
                <div className="flex items-end gap-3 text-white tabular-nums">
                  {([[timeLeft.days, t('days')], [timeLeft.hours, t('hours')], [timeLeft.minutes, t('minutes')], [timeLeft.seconds, t('seconds')]] as const).map(([v, lab]) => (
                    <div key={lab}>
                      <div className="display text-2xl sm:text-3xl">{String(v).padStart(2, '0')}</div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{lab}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/70 text-sm">
                  {phase === 'live' ? t('expo_live_note') : t('expo_ended_note')}
                </div>
              )}
            </div>

            {(() => {
              const pct = Math.max(0, Math.min(100, Number(data.boothBookedPercent ?? 50)));
              return (
                <div className="py-5 lg:py-7 lg:pl-8 border-t lg:border-t-0 hairline">
                  <div className="eyebrow mb-2">{t('space_booked')}</div>
                  <div className="flex items-center gap-3">
                    <div className="display text-2xl sm:text-3xl text-white">{pct}%</div>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Үзэсгэлэнгийн шилдэг байгууллагууд */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <WinnersSection />
      </Suspense>

      {/* Reel бичлэгүүд — story маягаар */}
      <Suspense fallback={null}>
        <ReelsSection />
      </Suspense>

      {/* Categories */}
      <section id="categories" className="section-pad surface border-t hairline relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
          <div className="mb-12 md:mb-16">
            <div className="eyebrow mb-4">{t('cat_pre')}</div>
            <h2 className="display text-3xl sm:text-5xl md:text-6xl text-white max-w-3xl">
              {t('cat_title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {([
              {
                icon: Building2,
                titleKey: 'cat1_title',
                accent: 'from-blue-600 to-blue-900',
                ring: 'group-hover:ring-blue-500/30',
                items: [
                  { key: 'cat1_1', icon: Building2 },
                  { key: 'cat1_2', icon: DraftingCompass },
                  { key: 'cat1_3', icon: House },
                  { key: 'cat1_4', icon: KeyRound },
                  { key: 'cat1_5', icon: Building },
                ],
              },
              {
                icon: HardHat,
                titleKey: 'cat2_title',
                accent: 'from-red-500 to-rose-700',
                ring: 'group-hover:ring-red-500/30',
                items: [
                  { key: 'cat2_1', icon: Blocks },
                  { key: 'cat2_2', icon: PaintRoller },
                  { key: 'cat2_3', icon: PlugZap },
                  { key: 'cat2_4', icon: ShowerHead },
                  { key: 'cat2_5', icon: Sofa },
                  { key: 'cat2_6', icon: Trees },
                ],
              },
              {
                icon: Truck,
                titleKey: 'cat3_title',
                accent: 'from-emerald-500 to-teal-700',
                ring: 'group-hover:ring-emerald-500/30',
                items: [
                  { key: 'cat3_1', icon: Tractor },
                  { key: 'cat3_2', icon: Drill },
                  { key: 'cat3_3', icon: Layers },
                  { key: 'cat3_4', icon: Caravan },
                  { key: 'cat3_5', icon: HousePlus },
                ],
              },
            ] as const).map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={cat.titleKey}
                  className="group relative surface-card hover:border-white/25 transition-colors duration-300 overflow-hidden flex flex-col"
                >

                  <div className="p-7 lg:p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.accent} text-white flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                        <CatIcon className="h-7 w-7" strokeWidth={2} />
                      </div>
                      <h3 className="display text-lg lg:text-xl text-white leading-snug">
                        {t(cat.titleKey)}
                      </h3>
                    </div>

                    <ul className="space-y-1.5">
                      {cat.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <li
                            key={item.key}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                          >
                            <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.accent} bg-opacity-10 flex items-center justify-center shrink-0`}>
                              <ItemIcon className="h-4 w-4 text-white" strokeWidth={2.2} />
                            </span>
                            <span className="text-white/65 font-medium text-sm sm:text-[15px]">{t(item.key)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Үзэсгэлэнгийн танилцуулга бичлэг */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <VideoSection />
      </Suspense>

      {/* Stats Counters Section */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <StatsSection />
      </Suspense>

      {/* Organizers Section */}
      <section className="bg-white pt-16 pb-8 border-t hairline">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 lg:p-12 lg:flex lg:justify-between lg:items-center gap-8">
            <div className="mb-8 lg:mb-0 lg:w-1/3 flex flex-col items-center text-center">
              <div className="eyebrow mb-6 !text-gray-500">{t('org_main')}</div>
              <a href="https://barilga.mn" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity" title="BARILGA.MN">
                <img src="/barilga-mn-logo.png" alt="BARILGA.MN" loading="lazy" className="h-12 w-auto object-contain" />
              </a>
            </div>

            <div className="w-full h-px lg:w-px lg:h-24 bg-gray-200 my-8 lg:my-0"></div>

            <div className="lg:w-2/3 flex flex-col items-center">
              <div className="eyebrow mb-6 !text-gray-500">{t('org_co')}</div>
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
                      <span className="text-[11px] text-gray-600 uppercase leading-snug font-semibold">{org.name}</span>
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
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 space-y-10">
            {(() => {
              const groups = [
                { type: 'main' as const,      label: t('spon_main'),      size: 'h-28 lg:h-36', imgClass: 'w-44 lg:w-56', offset: '' },
                // Ерөнхий ивээн тэтгэгчийн хайрцаг өндөр тул зэрэгцүүлэхэд энэ нь
                // дээшээ суудаг. Зөрүүний хагасаар (24/32px) доошлуулж төвийг нь тааруулна.
                { type: 'sponsor' as const,   label: t('spon_sponsor'),   size: 'h-16 lg:h-20', imgClass: 'w-32 lg:w-40', offset: 'sm:mt-6 lg:mt-8' },
                { type: 'supporter' as const, label: t('spon_supporter'), size: 'h-14 lg:h-18', imgClass: 'w-28 lg:w-36', offset: '' },
              ];

              const renderGroup = (group: typeof groups[number]) => {
                const items = data.sponsors.filter(s => s.type === group.type && s.logo);
                if (items.length === 0) return null;
                return (
                  <div key={group.type} className="flex flex-col items-center">
                    <div className="eyebrow mb-6 text-center !text-gray-500">{group.label}</div>
                    <div className={`flex flex-wrap justify-center gap-8 sm:gap-12 items-center ${group.offset}`}>
                      {items.map(s => {
                        const Tag: any = s.url ? 'a' : 'div';
                        const linkProps = s.url ? { href: s.url, target: '_blank', rel: 'noopener noreferrer' } : {};
                        return (
                          <Tag key={s.id} {...linkProps} className={`flex flex-col items-center gap-3 ${group.imgClass} text-center group ${s.url ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''}`} title={s.name}>
                            <div className={`${group.size} w-full flex items-center justify-center`}>
                              <img src={s.logo} alt={s.name} loading="lazy" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                            </div>
                            <span className="text-[11px] text-gray-600 leading-snug font-semibold">{s.name}</span>
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                );
              };

              const main = renderGroup(groups[0]);
              const sponsor = renderGroup(groups[1]);
              const supporter = renderGroup(groups[2]);

              return (
                <>
                  {/* Ерөнхий ивээн тэтгэгч ба ивээн тэтгэгчийг зурагт хуудасны
                      адил зэрэгцүүлж, шошгуудыг нь нэг эгнээнд тавина.
                      Нарийн дэлгэцэд өөрөө доошоо эвхэгдэнэ. */}
                  {(main || sponsor) && (
                    <div className="flex flex-wrap justify-center items-start gap-y-10 gap-x-12 sm:gap-x-20 lg:gap-x-28">
                      {main}
                      {sponsor}
                    </div>
                  )}
                  {supporter}
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* Талбайн сонголт — изометрик зураглал */}
      {data.showFloorPlan && (
      <section id="floorplan" className="section-pad surface border-t hairline">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="mb-12">
            <div className="eyebrow mb-4">BARILGA EXPO 2026</div>
            <h2 className="display text-3xl sm:text-5xl md:text-6xl text-white mb-4 max-w-3xl">
              {t('plan_title')}
            </h2>
            <p className="text-white/50 text-sm md:text-base max-w-2xl">
              {t('plan_desc')}
            </p>
          </div>
        </div>

        {/* Зураглал — дэлгэцийн бүтэн өргөнд */}
        <Suspense fallback={<LoadingPlaceHolder />}>
          <IsometricFloorPlan />
        </Suspense>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mt-8">
            <Link
              to="/booking"
              onClick={askBeforeBooking}
              className="inline-block bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
            >
              {t('plan_cta')} →
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Оролцогч байгууллагуудын лого */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <ParticipantsSection />
      </Suspense>

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

      {/* Оролцогчдын сэтгэгдэл */}
      <Suspense fallback={<LoadingPlaceHolder />}>
        <TestimonialsSection />
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
        <Route path="/poster" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <PosterMaker />
          </Suspense>
        } />
        <Route path="/b2b" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <B2BRegistration />
          </Suspense>
        } />
        <Route path="/program" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <ProgramPage />
          </Suspense>
        } />
        <Route path="/news" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <NewsPage />
          </Suspense>
        } />
        <Route path="/news/:id" element={
          <Suspense fallback={<LoadingPlaceHolder />}>
            <NewsArticlePage />
          </Suspense>
        } />
      </Routes>

      {/* Footer & Contact */}
      {!isAdminRoute && (
        <footer id="contact" className="surface text-white pt-16 pb-10 border-t hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Venue Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 items-stretch">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10">
              <img
                src="/venue-hall.jpeg"
                alt={t('venue_title')}
                loading="lazy"
                className="w-full h-full object-cover min-h-[220px]"
              />
            </div>
            <div className="surface-card p-6 sm:p-8 flex flex-col justify-center gap-5">
              <div>
                <div className="eyebrow mb-2">{t('venue_title')}</div>
                <p className="display text-xl sm:text-3xl text-white leading-snug">
                  {t('venue_subtitle')}
                </p>
              </div>
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center">
                    <Calendar className="h-4.5 w-4.5 text-red-400" />
                  </span>
                  <div className="text-sm">
                    <p className="text-white font-semibold">{t('venue_dates')}</p>
                    <p className="text-white/45">{t('venue_hours')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center">
                    <MapPin className="h-4.5 w-4.5 text-red-400" />
                  </span>
                  <p className="text-sm text-white font-semibold">{t('venue_location')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center">
                    <Car className="h-4.5 w-4.5 text-red-400" />
                  </span>
                  <p className="text-sm text-white font-semibold">{t('venue_parking')}</p>
                </div>
              </div>
            </div>
          </div>

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
                  <div className="text-white/60 text-sm">
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">{t('contact_office_addr')}</p>
                    <p>{data.contact.address}</p>
                  </div>
                </div>

                {data.contact.venueAddress && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                    <div className="text-white/60 text-sm">
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">{t('contact_venue_addr')}</p>
                      <p>{data.contact.venueAddress}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                  <div className="text-white/60 text-sm">
                    <p>{t('contact_hours')}</p>
                    <p>{t('contact_days')}</p>
                    <p>{t('contact_time')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-400 shrink-0" />
                  <a href={`mailto:${data.contact.email}`} className="text-white/60 text-sm hover:text-white transition-colors">
                    {data.contact.email}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                  <div className="text-white/60 text-sm space-y-0.5">
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
                src="https://maps.google.com/maps?q=47.8543437,106.784328&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Хэрэгтэй холбоосууд */}
          <div className="mb-12">
            <h4 className="eyebrow text-white/80 mb-5">
              {t('links_title')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { to: '/program', label: t('link_program'), icon: Calendar },
                { to: '/guide',   label: t('link_guide'),   icon: CheckCircle2 },
                { to: '/b2b',     label: t('link_b2b'),     icon: User },
                { to: '/poster',  label: t('link_poster'),  icon: ArrowRight },
              ].map(l => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => window.scrollTo({ top: 0 })}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10
                               hover:border-red-400/40 rounded-xl px-4 py-3.5 transition-colors group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-red-400" />
                    </span>
                    <span className="text-sm text-white/60 group-hover:text-white font-medium">{l.label}</span>
                  </Link>
                );
              })}
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
                    onClick={() => { setIsRegModalOpen(false); setRegType(null); setIsBoothNoticeOpen(true); }}
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
          className={`fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-50 p-2.5 sm:p-3 rounded-full bg-blue-900/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-blue-900/60 transition-all duration-300 shadow-lg ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Дээш гүйлгэх"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* AI Chat Widget */}
      {!isAdminRoute && <ChatWidget />}

      {/* Сүүлийн мэдээний popup (нэг удаа) */}
      <BoothClosedNotice
        open={isBoothNoticeOpen}
        onClose={() => setIsBoothNoticeOpen(false)}
        onConfirm={goToBooking}
      />

      {/* Мэдээний хуудсанд байхад ижил мэдээг дахин санал болгох шаардлагагүй */}
      {!isAdminRoute && !location.pathname.startsWith('/news') && <NewsPopup />}
    </div>
  );
}
