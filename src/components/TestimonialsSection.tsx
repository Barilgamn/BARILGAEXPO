import React, { useEffect, useRef, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  text: string;
  name: string;
  role: string;
  org: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: 'Үзэсгэлэн жил бүр уламжлал болон зохион байгуулагддаг учраас яг энэ цаг үед хэрэглэгчид үзэсгэлэнгээ өөрт хэрэгтэй барааны бэлтгэн нийлүүлэгчийг хайж эхэлдэг болсон байгаа нь оролцож байгаа компаниудад олон давуу талыг олгож байна. Тиймээс бид 2008 оноос хойш оролцож байна.',
    name: 'О. Нарангэрэл',
    role: 'Борлуулалтын албаны дарга',
    org: 'Акватерм ХХК',
  },
  {
    text: 'Барилгын хог хаягдлын менежмент, дахин боловсруулалтын чиглэлээр төсөл хэрэгжүүлдэг бидний хувьд энэхүү үзэсгэлэнд оролцох нь зөвхөн олон нийтэд байгууллагын болон төслийн үйл ажиллагаагаа таниулаад зогсохгүй, барилгын салбарын байгууллага, ЖДҮ эрхлэгч, хувь хүмүүстэй холбогдож, тэдний санал бодлыг сонсох, өөрсдийн үйл ажиллагаандаа оролцуулах боломжийг олгодог юм.',
    name: 'Н. Үүрийнцолмон',
    role: 'Төслийн менежер',
    org: 'Каритас чех репаблик ТББ',
  },
  {
    text: 'Бид “BARILGA EXPO” үзэсгэлэнд тасралтгүй 10 орчим жил оролцож байна. Манай компани үзэсгэлэнд оролцох болгондоо бидний тухай мэдэхгүй шинэ харилцагчаа нэмэгдүүлж, борлуулалтаа өсгөсөөр байна.',
    name: 'Э. Лхагвасүрэн',
    role: 'Маркетинг борлуулалтын захирал',
    org: 'Puzzlehaus ХХК',
  },
  {
    text: '“BARILGA EXPO” үзэсгэлэн нь хаврийн улиралд цаг хугацааны хувьд тохиромжтой, орон сууц материал гэж тусдаа ангилалтай байдаг нь тааламжтай байдаг. Barilga.mn компанийхан олон жилийн турш зохион байгуулалттай хийдэг тул манайх эргэлзээгүй оролцдог.',
    name: 'Д. Атарбаясгалан',
    role: 'Ерөнхий захирал',
    org: 'Бульдорс Мон ХХК',
  },
  {
    text: '“BARILGA EXPO” үзэсгэлэн нь барилгын материалын үйлдвэрлэгч, нийлүүлэгч биднийг зорилтот хэрэглэгчидтэй холбож өгдөг жилийн хамгийн том арга хэмжээнүүдийн нэг билээ. Өндөр чанарын бараа материал үйлдвэрлэх, нийлүүлэх зорилготой манай байгууллагын хувьд хэрэглэгчдэд бараа материалыг гарт нь бариулж ялгааг мэдрүүлэх нь их чухал байдаг тул тус үзэсгэлэн нь бидний чухалчлан оролцдог арга хэмжээ билээ.',
    name: 'С. Билэгт',
    role: 'Борлуулалтын менежер',
    org: 'ЭМ ПИ АЙ КОНСАЛТАНТС ХХК',
  },
];

/** Нэрний эхний үсгээр аватар үүсгэнэ (О. Нарангэрэл -> Н) */
const initial = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] || name).charAt(0).toUpperCase();
};

export const TestimonialsSection: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = trackRef.current;
    if (!el) return;
    /* Зурвасын хажуугийн дотоод зайнаас болж эхлэлийн байрлал 0 биш байдаг
       тул тэвчээртэй харьцуулна. */
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 40);
    setAtEnd(el.scrollLeft >= max - 8);
  };

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  /** Нэг картын өргөнөөр гүйлгэнэ */
  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('article');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const navBtn = 'w-11 h-11 rounded-full border flex items-center justify-center transition-colors';

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-red-500"></span>
              BARILGA EXPO
            </h3>
            <h2 className="font-heading text-3xl md:text-5xl font-black text-blue-950 tracking-tight">
              Оролцогчдын сэтгэгдэл
            </h2>
          </div>

          {/* Гүйлгэх товч — зөвхөн дэлгэц том үед */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              aria-label="Өмнөх сэтгэгдэл"
              className={`${navBtn} ${atStart ? 'border-gray-200 text-gray-300' : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label="Дараах сэтгэгдэл"
              className={`${navBtn} ${atEnd ? 'border-gray-200 text-gray-300' : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Хажуу тийш гүйлгэх зурвас */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4
                   px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((t, i) => (
          <article
            key={i}
            className="snap-start shrink-0 w-[85vw] sm:w-[420px] bg-white rounded-2xl border border-gray-100
                       shadow-sm p-7 flex flex-col"
          >
            <Quote className="w-8 h-8 text-red-500/70 mb-4 shrink-0" />
            <p className="text-gray-600 leading-relaxed text-[15px] flex-1">{t.text}</p>
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
              <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center font-black shrink-0">
                {initial(t.name)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-blue-950 leading-tight">{t.name}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{t.role}</p>
                <p className="text-xs font-semibold text-red-600 leading-snug">{t.org}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
