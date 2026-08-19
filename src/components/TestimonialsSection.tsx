import React, { useEffect, useRef, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation, Language } from '../i18n';

interface Testimonial {
  text: string;
  name: string;
  role: string;
  org: string;
}

const TESTIMONIALS: Record<Language, Testimonial[]> = {
  mn: [
    { text: 'Үзэсгэлэн жил бүр уламжлал болон зохион байгуулагддаг учраас яг энэ цаг үед хэрэглэгчид үзэсгэлэнгээ өөрт хэрэгтэй барааны бэлтгэн нийлүүлэгчийг хайж эхэлдэг болсон байгаа нь оролцож байгаа компаниудад олон давуу талыг олгож байна. Тиймээс бид 2008 оноос хойш оролцож байна.',
      name: 'О. Нарангэрэл', role: 'Борлуулалтын албаны дарга', org: 'Акватерм ХХК' },
    { text: 'Барилгын хог хаягдлын менежмент, дахин боловсруулалтын чиглэлээр төсөл хэрэгжүүлдэг бидний хувьд энэхүү үзэсгэлэнд оролцох нь зөвхөн олон нийтэд байгууллагын болон төслийн үйл ажиллагаагаа таниулаад зогсохгүй, барилгын салбарын байгууллага, ЖДҮ эрхлэгч, хувь хүмүүстэй холбогдож, тэдний санал бодлыг сонсох, өөрсдийн үйл ажиллагаандаа оролцуулах боломжийг олгодог юм.',
      name: 'Н. Үүрийнцолмон', role: 'Төслийн менежер', org: 'Каритас чех репаблик ТББ' },
    { text: 'Бид “BARILGA EXPO” үзэсгэлэнд тасралтгүй 10 орчим жил оролцож байна. Манай компани үзэсгэлэнд оролцох болгондоо бидний тухай мэдэхгүй шинэ харилцагчаа нэмэгдүүлж, борлуулалтаа өсгөсөөр байна.',
      name: 'Э. Лхагвасүрэн', role: 'Маркетинг борлуулалтын захирал', org: 'Puzzlehaus ХХК' },
    { text: '“BARILGA EXPO” үзэсгэлэн нь хаврийн улиралд цаг хугацааны хувьд тохиромжтой, орон сууц материал гэж тусдаа ангилалтай байдаг нь тааламжтай байдаг. Barilga.mn компанийхан олон жилийн турш зохион байгуулалттай хийдэг тул манайх эргэлзээгүй оролцдог.',
      name: 'Д. Атарбаясгалан', role: 'Ерөнхий захирал', org: 'Бульдорс Мон ХХК' },
    { text: '“BARILGA EXPO” үзэсгэлэн нь барилгын материалын үйлдвэрлэгч, нийлүүлэгч биднийг зорилтот хэрэглэгчидтэй холбож өгдөг жилийн хамгийн том арга хэмжээнүүдийн нэг билээ. Өндөр чанарын бараа материал үйлдвэрлэх, нийлүүлэх зорилготой манай байгууллагын хувьд хэрэглэгчдэд бараа материалыг гарт нь бариулж ялгааг мэдрүүлэх нь их чухал байдаг тул тус үзэсгэлэн нь бидний чухалчлан оролцдог арга хэмжээ билээ.',
      name: 'С. Билэгт', role: 'Борлуулалтын менежер', org: 'ЭМ ПИ АЙ КОНСАЛТАНТС ХХК' },
  ],
  en: [
    { text: 'Because the fair is held every year as a tradition, buyers now start looking for the suppliers they need at exactly this time of year, which gives the participating companies a real advantage. That is why we have taken part since 2008.',
      name: 'O. Narangerel', role: 'Head of Sales', org: 'Aquaterm LLC' },
    { text: 'For us, running projects in construction waste management and recycling, taking part in this fair is not only about presenting our organisation and projects to the public. It also lets us connect with construction companies, SMEs and individuals, hear their views and involve them in our work.',
      name: 'N. Uuriintsolmon', role: 'Project Manager', org: 'Caritas Czech Republic NGO' },
    { text: 'We have taken part in “BARILGA EXPO” for about ten years without a break. Every time we exhibit, we gain new customers who had never heard of us before, and our sales keep growing.',
      name: 'E. Lkhagvasuren', role: 'Marketing and Sales Director', org: 'Puzzlehaus LLC' },
    { text: '“BARILGA EXPO” falls at a convenient time in spring, and we like that housing materials have their own separate category. The Barilga.mn team has organised it well for many years, so we take part without hesitation.',
      name: 'D. Atarbayasgalan', role: 'General Director', org: 'Buldors Mon LLC' },
    { text: '“BARILGA EXPO” is one of the biggest events of the year, connecting us — manufacturers and suppliers of building materials — with our target customers. For a company committed to producing and supplying high-quality materials, letting customers hold the product and feel the difference matters greatly, which is why this fair is so important to us.',
      name: 'S. Bilegt', role: 'Sales Manager', org: 'MPI Consultants LLC' },
  ],
  zh: [
    { text: '展会每年如期举办已成惯例，客户如今正是在这个时候开始寻找所需产品的供应商，这为参展企业带来了诸多优势。因此我们自2008年以来一直参展。',
      name: 'O. Narangerel', role: '销售部经理', org: 'Aquaterm 有限公司' },
    { text: '我们从事建筑垃圾管理与再利用项目。参加本次展会不仅能向公众介绍我们机构和项目的工作，还能与建筑行业企业、中小企业主和个人建立联系，听取他们的意见，并让他们参与到我们的工作中来。',
      name: 'N. Uuriintsolmon', role: '项目经理', org: '捷克明爱组织' },
    { text: '我们已连续参加“BARILGA EXPO”约十年。每次参展都能结识此前并不了解我们的新客户，销售额也持续增长。',
      name: 'E. Lkhagvasuren', role: '市场销售总监', org: 'Puzzlehaus 有限公司' },
    { text: '“BARILGA EXPO”在春季举办，时间十分合适，住宅材料设有独立展区也令人满意。Barilga.mn 团队多年来组织有序，因此我们毫不犹豫地参展。',
      name: 'D. Atarbayasgalan', role: '总经理', org: 'Buldors Mon 有限公司' },
    { text: '对我们这些建筑材料生产商和供应商而言，“BARILGA EXPO”是全年最重要的活动之一，它把我们与目标客户联系起来。我们致力于生产和供应优质材料，让客户亲手触摸产品、感受差别十分重要，因此我们非常重视参加这一展会。',
      name: 'S. Bilegt', role: '销售经理', org: 'MPI Consultants 有限公司' },
  ],
  ru: [
    { text: 'Выставка традиционно проводится каждый год, и покупатели именно в это время начинают искать поставщиков нужных им товаров — это даёт участникам большое преимущество. Поэтому мы участвуем с 2008 года.',
      name: 'О. Нарангэрэл', role: 'Начальник отдела продаж', org: 'Акватерм ХХК' },
    { text: 'Мы реализуем проекты в области управления строительными отходами и переработки. Участие в этой выставке позволяет не только рассказать о нашей организации и проектах, но и наладить связи со строительными компаниями, малым и средним бизнесом и частными лицами, услышать их мнение и вовлечь их в нашу работу.',
      name: 'Н. Үүрийнцолмон', role: 'Менеджер проекта', org: 'НПО «Каритас Чешская Республика»' },
    { text: 'Мы участвуем в «BARILGA EXPO» без перерыва уже около десяти лет. Каждый раз мы получаем новых клиентов, которые раньше о нас не знали, и продажи продолжают расти.',
      name: 'Э. Лхагвасүрэн', role: 'Директор по маркетингу и продажам', org: 'Puzzlehaus ХХК' },
    { text: '«BARILGA EXPO» проходит весной — в удобное время, и нам нравится, что материалы для жилья выделены в отдельную категорию. Команда Barilga.mn много лет организует выставку на высоком уровне, поэтому мы участвуем без колебаний.',
      name: 'Д. Атарбаясгалан', role: 'Генеральный директор', org: 'Бульдорс Мон ХХК' },
    { text: '«BARILGA EXPO» — одно из крупнейших событий года, которое связывает нас, производителей и поставщиков строительных материалов, с целевыми клиентами. Для компании, стремящейся выпускать и поставлять качественные материалы, очень важно дать клиенту подержать товар в руках и почувствовать разницу, поэтому мы придаём этой выставке особое значение.',
      name: 'С. Билэгт', role: 'Менеджер по продажам', org: 'ЭМ ПИ АЙ КОНСАЛТАНТС ХХК' },
  ],
  ko: [
    { text: '박람회가 해마다 전통처럼 열리다 보니 고객들이 바로 이 시기에 필요한 제품의 공급업체를 찾기 시작합니다. 이는 참가 기업에 큰 이점이 됩니다. 그래서 저희는 2008년부터 계속 참가하고 있습니다.',
      name: 'O. 나랑게렐', role: '영업부장', org: 'Aquaterm LLC' },
    { text: '건설 폐기물 관리와 재활용 분야의 사업을 진행하는 저희에게 이 박람회 참가는 단순히 기관과 사업을 알리는 자리에 그치지 않습니다. 건설업체와 중소기업, 개인과 연결되어 그들의 의견을 듣고 저희 활동에 참여시킬 수 있는 기회가 됩니다.',
      name: 'N. 우린촐몬', role: '프로젝트 매니저', org: '카리타스 체코 공화국 NGO' },
    { text: '저희는 “BARILGA EXPO”에 약 10년간 빠짐없이 참가해 왔습니다. 참가할 때마다 저희를 몰랐던 새로운 고객이 늘고 매출도 꾸준히 성장하고 있습니다.',
      name: 'E. 락와수렌', role: '마케팅 영업 이사', org: 'Puzzlehaus LLC' },
    { text: '“BARILGA EXPO”는 봄철에 열려 시기가 적절하고, 주택 자재가 별도 분류로 구성되어 있는 점이 좋습니다. Barilga.mn 팀이 오랫동안 체계적으로 운영해 왔기에 저희는 망설임 없이 참가합니다.',
      name: 'D. 아타르바야스갈랑', role: '대표이사', org: 'Buldors Mon LLC' },
    { text: '“BARILGA EXPO”는 건축자재 제조사이자 공급사인 저희를 목표 고객과 이어 주는 한 해 최대 행사 중 하나입니다. 고품질 자재를 생산·공급하려는 저희에게는 고객이 직접 제품을 만져 보고 차이를 느끼도록 하는 것이 매우 중요하기에, 이 박람회를 특히 중요하게 여깁니다.',
      name: 'S. 빌레그트', role: '영업 매니저', org: 'MPI Consultants LLC' },
  ],
};

/** Нэрний эхний үсгээр аватар үүсгэнэ (О. Нарангэрэл -> Н) */
const initial = (name: string) => {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[parts.length - 1] || name).charAt(0).toUpperCase();
};

export const TestimonialsSection: React.FC = () => {
  const { t, lang } = useTranslation();
  const items = TESTIMONIALS[lang] ?? TESTIMONIALS.mn;
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
              {t('testi_title')}
            </h2>
          </div>

          {/* Гүйлгэх товч — зөвхөн дэлгэц том үед */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              aria-label={t('testi_prev')}
              className={`${navBtn} ${atStart ? 'border-gray-200 text-gray-300' : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              aria-label={t('testi_next')}
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
        {items.map((item, i) => (
          <article
            key={i}
            className="snap-start shrink-0 w-[85vw] sm:w-[420px] bg-white rounded-2xl border border-gray-100
                       shadow-sm p-7 flex flex-col"
          >
            <Quote className="w-8 h-8 text-red-500/70 mb-4 shrink-0" />
            <p className="text-gray-600 leading-relaxed text-[15px] flex-1">{item.text}</p>
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
              <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center font-black shrink-0">
                {initial(item.name)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-blue-950 leading-tight">{item.name}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{item.role}</p>
                <p className="text-xs font-semibold text-red-600 leading-snug">{item.org}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
