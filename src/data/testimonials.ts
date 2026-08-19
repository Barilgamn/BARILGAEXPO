import type { Language } from '../i18n';

/** Оролцогчийн сэтгэгдэл. Үндсэн талбарууд монголоор; i18n нь бусад хэлний хувилбар. */
export interface Testimonial {
  id: string;
  text: string;
  name: string;
  role: string;
  org: string;
  i18n?: Partial<Record<Exclude<Language, 'mn'>, { text: string; name: string; role: string; org: string }>>;
}

/** Админ дээр өөрчлөөгүй үед ашиглах анхны жагсаалт */
export const defaultTestimonials: Testimonial[] = [
  {
    id: 't1',
    text: 'Үзэсгэлэн жил бүр уламжлал болон зохион байгуулагддаг учраас яг энэ цаг үед хэрэглэгчид үзэсгэлэнгээ өөрт хэрэгтэй барааны бэлтгэн нийлүүлэгчийг хайж эхэлдэг болсон байгаа нь оролцож байгаа компаниудад олон давуу талыг олгож байна. Тиймээс бид 2008 оноос хойш оролцож байна.',
    name: 'О. Нарангэрэл',
    role: 'Борлуулалтын албаны дарга',
    org: 'Акватерм ХХК',
    i18n: {
      en: { text: 'Because the fair is held every year as a tradition, buyers now start looking for the suppliers they need at exactly this time of year, which gives the participating companies a real advantage. That is why we have taken part since 2008.', name: 'O. Narangerel', role: 'Head of Sales', org: 'Aquaterm LLC' },
      zh: { text: '展会每年如期举办已成惯例，客户如今正是在这个时候开始寻找所需产品的供应商，这为参展企业带来了诸多优势。因此我们自2008年以来一直参展。', name: 'O. Narangerel', role: '销售部经理', org: 'Aquaterm 有限公司' },
      ru: { text: 'Выставка традиционно проводится каждый год, и покупатели именно в это время начинают искать поставщиков нужных им товаров — это даёт участникам большое преимущество. Поэтому мы участвуем с 2008 года.', name: 'О. Нарангэрэл', role: 'Начальник отдела продаж', org: 'Акватерм ХХК' },
      ko: { text: '박람회가 해마다 전통처럼 열리다 보니 고객들이 바로 이 시기에 필요한 제품의 공급업체를 찾기 시작합니다. 이는 참가 기업에 큰 이점이 됩니다. 그래서 저희는 2008년부터 계속 참가하고 있습니다.', name: 'O. 나랑게렐', role: '영업부장', org: 'Aquaterm LLC' },
    },
  },
  {
    id: 't2',
    text: 'Барилгын хог хаягдлын менежмент, дахин боловсруулалтын чиглэлээр төсөл хэрэгжүүлдэг бидний хувьд энэхүү үзэсгэлэнд оролцох нь зөвхөн олон нийтэд байгууллагын болон төслийн үйл ажиллагаагаа таниулаад зогсохгүй, барилгын салбарын байгууллага, ЖДҮ эрхлэгч, хувь хүмүүстэй холбогдож, тэдний санал бодлыг сонсох, өөрсдийн үйл ажиллагаандаа оролцуулах боломжийг олгодог юм.',
    name: 'Н. Үүрийнцолмон',
    role: 'Төслийн менежер',
    org: 'Каритас чех репаблик ТББ',
    i18n: {
      en: { text: 'For us, running projects in construction waste management and recycling, taking part in this fair is not only about presenting our organisation and projects to the public. It also lets us connect with construction companies, SMEs and individuals, hear their views and involve them in our work.', name: 'N. Uuriintsolmon', role: 'Project Manager', org: 'Caritas Czech Republic NGO' },
      zh: { text: '我们从事建筑垃圾管理与再利用项目。参加本次展会不仅能向公众介绍我们机构和项目的工作，还能与建筑行业企业、中小企业主和个人建立联系，听取他们的意见，并让他们参与到我们的工作中来。', name: 'N. Uuriintsolmon', role: '项目经理', org: '捷克明爱组织' },
      ru: { text: 'Мы реализуем проекты в области управления строительными отходами и переработки. Участие в этой выставке позволяет не только рассказать о нашей организации и проектах, но и наладить связи со строительными компаниями, малым и средним бизнесом и частными лицами, услышать их мнение и вовлечь их в нашу работу.', name: 'Н. Үүрийнцолмон', role: 'Менеджер проекта', org: 'НПО «Каритас Чешская Республика»' },
      ko: { text: '건설 폐기물 관리와 재활용 분야의 사업을 진행하는 저희에게 이 박람회 참가는 단순히 기관과 사업을 알리는 자리에 그치지 않습니다. 건설업체와 중소기업, 개인과 연결되어 그들의 의견을 듣고 저희 활동에 참여시킬 수 있는 기회가 됩니다.', name: 'N. 우린촐몬', role: '프로젝트 매니저', org: '카리타스 체코 공화국 NGO' },
    },
  },
  {
    id: 't3',
    text: 'Бид “BARILGA EXPO” үзэсгэлэнд тасралтгүй 10 орчим жил оролцож байна. Манай компани үзэсгэлэнд оролцох болгондоо бидний тухай мэдэхгүй шинэ харилцагчаа нэмэгдүүлж, борлуулалтаа өсгөсөөр байна.',
    name: 'Э. Лхагвасүрэн',
    role: 'Маркетинг борлуулалтын захирал',
    org: 'Puzzlehaus ХХК',
    i18n: {
      en: { text: 'We have taken part in “BARILGA EXPO” for about ten years without a break. Every time we exhibit, we gain new customers who had never heard of us before, and our sales keep growing.', name: 'E. Lkhagvasuren', role: 'Marketing and Sales Director', org: 'Puzzlehaus LLC' },
      zh: { text: '我们已连续参加“BARILGA EXPO”约十年。每次参展都能结识此前并不了解我们的新客户，销售额也持续增长。', name: 'E. Lkhagvasuren', role: '市场销售总监', org: 'Puzzlehaus 有限公司' },
      ru: { text: 'Мы участвуем в «BARILGA EXPO» без перерыва уже около десяти лет. Каждый раз мы получаем новых клиентов, которые раньше о нас не знали, и продажи продолжают расти.', name: 'Э. Лхагвасүрэн', role: 'Директор по маркетингу и продажам', org: 'Puzzlehaus ХХК' },
      ko: { text: '저희는 “BARILGA EXPO”에 약 10년간 빠짐없이 참가해 왔습니다. 참가할 때마다 저희를 몰랐던 새로운 고객이 늘고 매출도 꾸준히 성장하고 있습니다.', name: 'E. 락와수렌', role: '마케팅 영업 이사', org: 'Puzzlehaus LLC' },
    },
  },
  {
    id: 't4',
    text: '“BARILGA EXPO” үзэсгэлэн нь хаврийн улиралд цаг хугацааны хувьд тохиромжтой, орон сууц материал гэж тусдаа ангилалтай байдаг нь тааламжтай байдаг. Barilga.mn компанийхан олон жилийн турш зохион байгуулалттай хийдэг тул манайх эргэлзээгүй оролцдог.',
    name: 'Д. Атарбаясгалан',
    role: 'Ерөнхий захирал',
    org: 'Бульдорс Мон ХХК',
    i18n: {
      en: { text: '“BARILGA EXPO” falls at a convenient time in spring, and we like that housing materials have their own separate category. The Barilga.mn team has organised it well for many years, so we take part without hesitation.', name: 'D. Atarbayasgalan', role: 'General Director', org: 'Buldors Mon LLC' },
      zh: { text: '“BARILGA EXPO”在春季举办，时间十分合适，住宅材料设有独立展区也令人满意。Barilga.mn 团队多年来组织有序，因此我们毫不犹豫地参展。', name: 'D. Atarbayasgalan', role: '总经理', org: 'Buldors Mon 有限公司' },
      ru: { text: '«BARILGA EXPO» проходит весной — в удобное время, и нам нравится, что материалы для жилья выделены в отдельную категорию. Команда Barilga.mn много лет организует выставку на высоком уровне, поэтому мы участвуем без колебаний.', name: 'Д. Атарбаясгалан', role: 'Генеральный директор', org: 'Бульдорс Мон ХХК' },
      ko: { text: '“BARILGA EXPO”는 봄철에 열려 시기가 적절하고, 주택 자재가 별도 분류로 구성되어 있는 점이 좋습니다. Barilga.mn 팀이 오랫동안 체계적으로 운영해 왔기에 저희는 망설임 없이 참가합니다.', name: 'D. 아타르바야스갈랑', role: '대표이사', org: 'Buldors Mon LLC' },
    },
  },
  {
    id: 't5',
    text: '“BARILGA EXPO” үзэсгэлэн нь барилгын материалын үйлдвэрлэгч, нийлүүлэгч биднийг зорилтот хэрэглэгчидтэй холбож өгдөг жилийн хамгийн том арга хэмжээнүүдийн нэг билээ. Өндөр чанарын бараа материал үйлдвэрлэх, нийлүүлэх зорилготой манай байгууллагын хувьд хэрэглэгчдэд бараа материалыг гарт нь бариулж ялгааг мэдрүүлэх нь их чухал байдаг тул тус үзэсгэлэн нь бидний чухалчлан оролцдог арга хэмжээ билээ.',
    name: 'С. Билэгт',
    role: 'Борлуулалтын менежер',
    org: 'ЭМ ПИ АЙ КОНСАЛТАНТС ХХК',
    i18n: {
      en: { text: '“BARILGA EXPO” is one of the biggest events of the year, connecting us — manufacturers and suppliers of building materials — with our target customers. For a company committed to producing and supplying high-quality materials, letting customers hold the product and feel the difference matters greatly, which is why this fair is so important to us.', name: 'S. Bilegt', role: 'Sales Manager', org: 'MPI Consultants LLC' },
      zh: { text: '对我们这些建筑材料生产商和供应商而言，“BARILGA EXPO”是全年最重要的活动之一，它把我们与目标客户联系起来。我们致力于生产和供应优质材料，让客户亲手触摸产品、感受差别十分重要，因此我们非常重视参加这一展会。', name: 'S. Bilegt', role: '销售经理', org: 'MPI Consultants 有限公司' },
      ru: { text: '«BARILGA EXPO» — одно из крупнейших событий года, которое связывает нас, производителей и поставщиков строительных материалов, с целевыми клиентами. Для компании, стремящейся выпускать и поставлять качественные материалы, очень важно дать клиенту подержать товар в руках и почувствовать разницу, поэтому мы придаём этой выставке особое значение.', name: 'С. Билэгт', role: 'Менеджер по продажам', org: 'ЭМ ПИ АЙ КОНСАЛТАНТС ХХК' },
      ko: { text: '“BARILGA EXPO”는 건축자재 제조사이자 공급사인 저희를 목표 고객과 이어 주는 한 해 최대 행사 중 하나입니다. 고품질 자재를 생산·공급하려는 저희에게는 고객이 직접 제품을 만져 보고 차이를 느끼도록 하는 것이 매우 중요하기에, 이 박람회를 특히 중요하게 여깁니다.', name: 'S. 빌레그트', role: '영업 매니저', org: 'MPI Consultants LLC' },
    },
  },
  {
    id: 't6',
    text: 'Barilga expo барилгын үзэсгэлэн жилээс жилд зохион байгуулалт өндөр болж, оролцогч компаниуд өргөжин олон нийтэд танигдах компанит ажилд дэмжлэг үзүүлдэг учраас үзэсгэлэнд оролцох дуртай байдаг.',
    name: '',
    role: '',
    org: 'Amgalan Residence',
    i18n: {
      en: { text: 'The Barilga Expo is better organised year after year, and it supports the campaigns that help participating companies grow and become known to the wider public — which is why we enjoy taking part.', name: '', role: '', org: 'Amgalan Residence' },
      zh: { text: 'Barilga Expo 的组织水平逐年提升，并为参展企业扩大规模、提升公众知名度的推广活动提供支持，因此我们很乐意参展。', name: '', role: '', org: 'Amgalan Residence' },
      ru: { text: 'Организация выставки Barilga Expo с каждым годом становится лучше, и она поддерживает кампании, которые помогают компаниям-участникам расти и становиться известными широкой публике, — поэтому мы с удовольствием участвуем.', name: '', role: '', org: 'Amgalan Residence' },
      ko: { text: 'Barilga Expo는 해마다 운영이 좋아지고 있으며, 참가 기업이 성장하고 대중에게 알려지도록 돕는 캠페인을 지원해 주기에 저희는 참가를 즐깁니다.', name: '', role: '', org: 'Amgalan Residence' },
    },
  },
  {
    id: 't7',
    text: 'Үзэсгэлэнд оролцсоноор монголын барилгын салбар, стандартууд улам бүр хөгжиж байгааг биечлэн мэдрэхээс гадна манай үйлдвэртэй хамтран ажиллах компаниудын тоо ч нэмэгдсээр байна. Barilga expo үзэсгэлэнг Хятадын үзэсгэлэнтэй харьцуулахад зохион байгуулалт нь илүү цэгцтэй, үр дүнтэй байлаа.',
    name: '',
    role: '',
    org: 'Peace Aluminum LLC',
    i18n: {
      en: { text: 'Taking part lets us see for ourselves how Mongolia’s construction sector and its standards keep developing, and the number of companies working with our plant keeps growing. Compared with fairs in China, Barilga Expo was more orderly and more effective.', name: '', role: '', org: 'Peace Aluminum LLC' },
      zh: { text: '参展让我们亲身感受到蒙古建筑行业及其标准的持续发展，与我们工厂合作的企业也不断增加。与中国的展会相比，Barilga Expo 的组织更有条理，也更有成效。', name: '', role: '', org: 'Peace Aluminum LLC' },
      ru: { text: 'Участие позволяет нам лично увидеть, как развиваются строительная отрасль Монголии и её стандарты, а число компаний, сотрудничающих с нашим заводом, продолжает расти. По сравнению с выставками в Китае Barilga Expo была организована более чётко и результативно.', name: '', role: '', org: 'Peace Aluminum LLC' },
      ko: { text: '참가를 통해 몽골 건설 산업과 기준이 꾸준히 발전하고 있음을 직접 확인할 수 있었고, 저희 공장과 협력하는 기업 수도 계속 늘고 있습니다. 중국의 박람회와 비교했을 때 Barilga Expo가 더 체계적이고 효과적이었습니다.', name: '', role: '', org: 'Peace Aluminum LLC' },
    },
  },
  {
    id: 't8',
    text: 'BARILGA EXPO-д оролцсоноор манай компани өөрсдийн бүтээгдэхүүн, брэндийг Монголын зах зээлд таниулах, бизнесийн хүрээллээ тэлэх томоохон боломж бүрдэн олон шинэ харилцагч, түншүүдтэй болж байна. Энэ удаагийн үзэсгэлэн өмнөх жилүүдээс илүү сайн зохион байгуулалттай, чанартай болсон нь оролцогч бидэнд өндөр сэтгэл ханамж өглөө.',
    name: '',
    role: '',
    org: 'Shenyang Modernbond Decorative Materials Co., Ltd.',
    i18n: {
      en: { text: 'Taking part in BARILGA EXPO has given our company a major opportunity to introduce our products and brand to the Mongolian market and widen our business network, bringing us many new customers and partners. This year’s fair was better organised and of higher quality than in previous years, which left us as exhibitors very satisfied.', name: '', role: '', org: 'Shenyang Modernbond Decorative Materials Co., Ltd.' },
      zh: { text: '参加 BARILGA EXPO 为我们公司提供了向蒙古市场推介产品与品牌、拓展业务网络的重要机会，也带来了许多新客户与合作伙伴。本届展会比往年组织得更好、质量更高，令我们参展商十分满意。', name: '', role: '', org: 'Shenyang Modernbond Decorative Materials Co., Ltd.' },
      ru: { text: 'Участие в BARILGA EXPO дало нашей компании серьёзную возможность представить продукцию и бренд на монгольском рынке и расширить деловые связи, принеся много новых клиентов и партнёров. В этом году выставка была организована лучше и качественнее, чем в прошлые годы, что оставило нас, участников, очень довольными.', name: '', role: '', org: 'Shenyang Modernbond Decorative Materials Co., Ltd.' },
      ko: { text: 'BARILGA EXPO 참가는 저희 회사가 제품과 브랜드를 몽골 시장에 알리고 사업 네트워크를 넓히는 큰 기회가 되었으며, 많은 신규 고객과 파트너를 만났습니다. 올해 박람회는 예년보다 운영과 품질이 좋아져 참가자로서 매우 만족했습니다.', name: '', role: '', org: 'Shenyang Modernbond Decorative Materials Co., Ltd.' },
    },
  },
];
