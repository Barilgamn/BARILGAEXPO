/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Building2, Wrench, Truck, Calendar, MapPin, Phone, Menu, X, ArrowRight, CheckCircle2, Timer, User } from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regType, setRegType] = useState<'visitor' | 'exhibitor' | null>(null);
  const [isRegSuccess, setIsRegSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-blue-900/95 backdrop-blur-md shadow-lg border-b border-white/10 py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="#" className="flex items-center gap-3">
                <img
                  src="https://i0.wp.com/barilgaexpo.mn/wp-content/uploads/2024/06/EXPO-LOGO.png?resize=768%2C348&ssl=1"
                  alt="Barilga Expo Logo"
                  className="h-14 md:h-16 object-contain brightness-0 invert transition-all"
                />
                <div className="w-px h-10 bg-white/30 hidden sm:block"></div>
                <img
                  src="https://mcud.gov.mn/resource/mcud/image/2026/03/02/2eepuf1io6kp37z3/100%20logo_01.png"
                  alt="Их Барилга 100"
                  className="h-10 md:h-12 object-contain brightness-0 invert transition-all hidden sm:block pb-1"
                />
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Нүүр</a>
              <a href="#about" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Бидний тухай</a>
              <a href="#categories" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Үндсэн чиглэл</a>
              <a href="#program" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Хөтөлбөр</a>
              <a href="#contact" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Холбоо барих</a>
              <button onClick={() => setIsRegModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95">
                Бүртгүүлэх
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-red-500 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-1 shadow-xl">
            <a href="#home" className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Нүүр</a>
            <a href="#about" className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Бидний тухай</a>
            <a href="#categories" className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Үндсэн чиглэл</a>
            <a href="#program" className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Хөтөлбөр</a>
            <a href="#contact" className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Холбоо барих</a>
            <button onClick={() => {setIsRegModalOpen(true); setIsMenuOpen(false);}} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg text-base font-semibold transition-colors">
              Бүртгүүлэх
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 h-[85vh] min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/80 to-blue-900/40 mix-blend-multiply z-10" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-blue-950 to-transparent z-10" />
          <img
            src="https://greatergo.org/uploads/article/63ab00ab-f707-4b23-b389-96b04b22552a.jpg"
            alt="Ulaanbaatar city background"
            className="w-full h-full object-cover blur-[3px]"
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 xl:col-span-8">
              <h1 className="font-heading text-5xl md:text-7xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                BARILGA EXPO
              </h1>
              
              <h2 className="text-2xl md:text-3xl text-gray-200 font-medium tracking-wide mb-6">
                Олон улсын барилгын үзэсгэлэн яармаг
              </h2>
              
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl font-light text-justify">
                Барилга, дэд бүтэц, үл хөдлөх хөрөнгийн зах зээл идэвхжиж, орон сууцны эрэлт хэрэгцээ нэмэгддэг намрын улиралд зохион байгуулагддаг “BARILGA EXPO” олон улсын барилгын үзэсгэлэн яармаг 2026 оны 9 дүгээр сарын 11-13-ны өдрүүдэд “Буянт-Ухаа” ордонд 40 дэх удаагаа зохион байгуулагдана
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <Calendar className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Хэзээ</div>
                    <div className="font-semibold text-lg">2026 оны 9-р сарын 11-13</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-white">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <MapPin className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Хаана</div>
                    <div className="font-semibold text-lg">“Буянт-Ухаа” ордон</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setIsRegModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 group">
                  Бүртгүүлэх
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="text-emerald-400 font-semibold mb-6 flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Үзэсгэлэн эхлэхэд:
                </h3>
                
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <div className="text-3xl font-black text-white font-heading mb-1">{timeLeft.days}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider">Өдөр</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <div className="text-3xl font-black text-white font-heading mb-1">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider">Цаг</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <div className="text-3xl font-black text-white font-heading mb-1">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider">Минут</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <div className="text-3xl font-black text-white font-heading mb-1">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider">Секунд</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm text-gray-300">
                    Бүртгэл дуусахад цөөхөн талбай үлдлээ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-emerald-600 font-bold uppercase tracking-wider text-sm mb-3">Бидний тухай</h3>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-blue-900 leading-tight mb-6">
                Шинэ зууны стратегийг тодорхойлох түүхэн мөч
              </h2>
              <div className="w-20 h-1.5 bg-red-600 mb-8 rounded-full"></div>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Уг арга хэмжээ нь өнгөрсөн зууны ололт амжилтыг дүгнээд зогсохгүй уур амьсгалын өөрчлөлт, хотжилттой зэрэгцэн ирж буй ирээдүйн 100 жилийн хөгжлийн концепц, шинэ зууны стратегийг тодорхойлох түүхэн мөч болж байна.
              </p>
              
              <div className="grid grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <div className="text-5xl font-black font-heading text-blue-900 mb-2">100<span className="text-red-600">+</span></div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Олон улсын компаниуд</div>
                  <div className="text-xs text-gray-400 mt-2">ОХУ, БНХАУ, БНСУ, Япон, Герман</div>
                </div>
                <div>
                  <div className="text-5xl font-black font-heading text-blue-900 mb-2">400<span className="text-red-600">+</span></div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Үндэсний ААН</div>
                  <div className="text-xs text-gray-400 mt-2">Барилгын салбарын шилдгүүд</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-900 rounded-[2rem] transform translate-x-4 translate-y-4"></div>
              <img 
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80" 
                alt="Architecture concept" 
                className="relative z-10 w-full h-[500px] object-cover rounded-[2rem] shadow-xl"
              />
              
              <div className="absolute bottom-10 -left-10 z-20 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce hover:animate-none transition-all">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <div className="font-heading font-bold text-gray-900">Батлагдсан чанар</div>
                  <div className="text-sm text-gray-500">40 дэх удаагийн сонголт</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-emerald-600 font-bold uppercase tracking-wider text-sm mb-3">Үндсэн чиглэл</h3>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-blue-900 mb-6">
              Үзэсгэлэнгийн салбарууд
            </h2>
            <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-emerald-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-4 h-14 group-hover:text-blue-900 transition-colors">
                Шинэ орон сууц, үл хөдлөх хөрөнгө
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Тансаг болон стандарт орон сууц</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Хаус дизайн</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Үл хөдлөх хөрөнгийн зуучлал</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-emerald-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-4 h-14 group-hover:text-blue-900 transition-colors">
                Барилгын материал, дэвшилтэт технологи
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Барилгын материал</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Засал чимэглэл</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Цахилгаан, сантехник, Интерьер</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-emerald-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-4 h-14 group-hover:text-blue-900 transition-colors">
                Гадаа талбай
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Хүнд машин механизм</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Багаж төхөөрөмж</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-600">Зөөврийн сууц, Амины орон сууцны загварууд</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Organizers Section */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-100 lg:flex lg:justify-between lg:items-center gap-8 shadow-sm">
            <div className="mb-8 lg:mb-0 lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="text-red-600 font-bold text-sm uppercase tracking-wider mb-6">Ерөнхий зохион байгуулагч</div>
              <a href="https://barilga.mn" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity" title="BARILGA.MN">
                <img src="https://barilgaexpo.mn/wp-content/uploads/2024/06/Barilga.mn-shuud-ashiglah-logo-Copy-Copy-2-1.png" alt="BARILGA.MN" className="h-10 md:h-12 object-contain" />
              </a>
            </div>
            
            <div className="w-full h-px lg:w-px lg:h-24 bg-gray-200 my-8 lg:my-0"></div>
            
            <div className="lg:w-2/3 flex flex-col items-center lg:items-start">
              <div className="text-red-600 font-bold text-sm uppercase tracking-wider mb-6 text-center lg:text-left">Хамтран зохион байгуулагч</div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-10 items-start">
                <a href="https://mcud.gov.mn" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity w-36 text-center group" title="Хот Байгуулалт, Барилга, Орон Сууцжуулалтын Яам">
                  <div className="h-16 w-16 lg:h-20 lg:w-20 flex items-center justify-center">
                    <img src="https://i0.wp.com/barilgaexpo.mn/wp-content/uploads/2025/10/unnamed-3.webp?w=913&ssl=1" alt="Хот Байгуулалт, Барилга, Орон Сууцжуулалтын Яам" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[11px] text-gray-700 uppercase leading-snug font-semibold">Хот байгуулалт, барилга,<br/>орон сууцжуулалтын яам</span>
                </a>
                <a href="https://ulaanbaatar.mn" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity w-36 text-center group" title="Нийслэлийн Засаг Даргын Тамгын газар">
                  <div className="h-16 w-16 lg:h-20 lg:w-20 flex items-center justify-center">
                    <img src="https://i0.wp.com/barilgaexpo.mn/wp-content/uploads/2025/10/unnamed.png?w=869&ssl=1" alt="Нийслэлийн Засаг Даргын Тамгын газар" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[11px] text-gray-700 uppercase leading-snug font-semibold">Нийслэлийн Засаг даргын<br/>Тамгын газар</span>
                </a>
                <a href="https://barilga.gov.mn" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity w-36 text-center group" title="Барилгын Хөгжлийн Төв">
                  <div className="h-16 w-16 lg:h-20 lg:w-20 flex items-center justify-center">
                    <img src="https://i0.wp.com/barilgaexpo.mn/wp-content/uploads/2025/10/Untitled-1.png?w=800&ssl=1" alt="Барилгын Хөгжлийн Төв" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[11px] text-gray-700 uppercase leading-snug font-semibold">Барилгын хөгжлийн<br/>төв</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Contact */}
      <footer id="contact" className="bg-blue-900 text-white pt-12 pb-10 border-t-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src="https://i0.wp.com/barilgaexpo.mn/wp-content/uploads/2024/06/EXPO-LOGO.png?resize=768%2C348&ssl=1"
                alt="Barilga Expo Logo"
                className="h-14 object-contain brightness-0 invert"
              />
              <div className="w-px h-10 bg-white/30"></div>
              <img
                src="https://mcud.gov.mn/resource/mcud/image/2026/03/02/2eepuf1io6kp37z3/100%20logo_01.png"
                alt="Их Барилга 100"
                className="h-12 object-contain brightness-0 invert pb-1"
              />
            </div>
            
            <div className="flex items-center gap-6 bg-white/5 rounded-full px-6 py-3 border border-white/10">
              <Phone className="h-5 w-5 text-emerald-400" />
              <a href="tel:99907816" className="text-lg font-bold font-heading hover:text-emerald-300 transition-colors">9990 7816</a>
            </div>
          </div>
          
          <div className="mt-12 text-center text-sm text-gray-400 pt-6 border-t border-white/10">
            &copy; {new Date().getFullYear()} BARILGA EXPO. Зохиогчийн эрх хуулиар хамгаалагдсан.
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm" onClick={() => {setIsRegModalOpen(false); setRegType(null); setIsRegSuccess(false);}}></div>
          {isRegSuccess ? (
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 z-10">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">Амжилттай</h3>
              <p className="text-gray-600 mb-6">Таны бүртгэлийг амжилттай хүлээн авлаа. Бид тун удахгүй тантай холбогдох болно.</p>
              <button 
                onClick={() => {setIsRegModalOpen(false); setRegType(null); setIsRegSuccess(false);}}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Хаах
              </button>
            </div>
          ) : (
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-heading text-2xl font-bold text-blue-900">Бүртгүүлэх</h3>
              <button onClick={() => {setIsRegModalOpen(false); setRegType(null);}} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {!regType ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setRegType('visitor')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 py-10 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                       <User className="h-8 w-8" />
                    </div>
                    <span className="font-heading font-bold text-lg text-gray-900">Үзэгч</span>
                    <span className="text-sm text-gray-500 text-center mt-2 leading-relaxed">Үзэсгэлэн үзэх, сонирхох</span>
                  </button>
                  
                  <button 
                    onClick={() => setRegType('exhibitor')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 py-10 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                       <Building2 className="h-8 w-8" />
                    </div>
                    <span className="font-heading font-bold text-lg text-gray-900">Оролцогч</span>
                    <span className="text-sm text-gray-500 text-center mt-2 leading-relaxed">Талбай захиалах, бүтээгдэхүүнээ танилцуулах</span>
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsRegSuccess(true); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                    <input type="text" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" placeholder="Таны нэр" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар</label>
                    <input type="tel" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" placeholder="Утасны дугаар" />
                  </div>
                  {regType === 'exhibitor' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Байгууллагын нэр</label>
                        <input type="text" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all" placeholder="Байгууллагын нэр" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Үзэсгэлэнд оролцох ДОТОР ТАЛБАЙН сонголт</label>
                        <select required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all bg-white" defaultValue="">
                          <option value="" disabled>Сонгох</option>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Хүсэлт / Тайлбар</label>
                        <textarea className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all resize-none" rows={3} placeholder="Талбайн хэмжээ болон бусад хүсэлтээ энд бичнэ үү..."></textarea>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setRegType(null)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors">
                      Буцах
                    </button>
                    <button type="submit" className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                      Илгээх
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
