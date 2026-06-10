export interface NewsTranslationEntry {
  title: string;
  description: string;
}

export type NewsTranslationLang = 'en' | 'zh' | 'ru' | 'ko';

// Мэдээний гарчиг, тайлбарыг (карт болон дэлгэрэнгүй цонхны толгой хэсэгт
// харагдах текст) бусад хэл рүү орчуулсан өгөгдөл. Бүрэн агуулга (content)
// эх сурвалжийн дагуу монгол хэл дээр үлдэнэ.
export const newsTranslations: Record<number, Record<NewsTranslationLang, NewsTranslationEntry>> = {
  1: {
    en: {
      title: 'The 39th "BARILGA EXPO" Names Its Award Winners',
      description: 'The 39th "BARILGA EXPO" international construction exhibition, bringing together new projects, advanced technology and innovation in the construction sector, was successfully held for 3 days at the Buyant-Ukhaa Palace. As tradition dictates, the winners were honored at an awards ceremony at the "Queen Chabi" reception hall of the Khubilai Hotel...',
    },
    zh: {
      title: '第39届"BARILGA EXPO"评选出优秀企业',
      description: '第39届"BARILGA EXPO"国际建筑展览会汇集了建筑行业的新项目、先进技术和创新成果，在拜扬特-乌哈宫成功举办了为期三天的展览。按照惯例，获奖企业在忽必烈酒店"Queen Chabi"接待厅举行的颁奖典礼上揭晓……',
    },
    ru: {
      title: 'На 39-й «BARILGA EXPO» определены победители',
      description: '39-я международная строительная выставка-ярмарка «BARILGA EXPO», объединяющая новые проекты, передовые технологии и инновации строительной отрасли, успешно прошла в течение 3 дней во дворце Буянт-Ухаа. По традиции победители были объявлены на церемонии награждения в зале приемов «Queen Chabi» отеля «Хубилай»...',
    },
    ko: {
      title: "제39회 'BARILGA EXPO' 우수업체 선정",
      description: "건설 분야의 신규 프로젝트, 첨단 기술 및 혁신을 한자리에 모으는 제39회 'BARILGA EXPO' 국제 건설 박람회가 부얀트-우하 궁전에서 3일간 성공적으로 개최되었습니다. 전통에 따라 수상업체는 후빌라이 호텔 'Queen Chabi' 리셉션홀에서 열린 시상식에서 발표되었습니다...",
    },
  },
  2: {
    en: {
      title: 'The 39th "BARILGA EXPO" International Construction Exhibition Opens Today',
      description: 'The 39th "BARILGA EXPO" international construction exhibition, bringing together new construction projects, advanced technologies, building materials, tools and equipment, and housing solutions, opened today at the Buyant-Ukhaa Palace. The opening ceremony was attended by the Minister of Construction and Urban Development E.Bat-Amgalan, Secretary of State M.Bayaraa, and the founder of BARILGA EXPO G.Batsukh, among other officials...',
    },
    zh: {
      title: '第39届"BARILGA EXPO"国际建筑展览会今日开幕',
      description: '第39届"BARILGA EXPO"国际建筑展览会今日在拜扬特-乌哈宫开幕，汇集了建筑新项目、先进技术、建筑材料、工具设备及住宅解决方案。城市建设、建筑与住房部部长E.Bat-Amgalan、国务秘书M.Bayaraa以及BARILGA EXPO创始人G.Batsukh等嘉宾出席了开幕式……',
    },
    ru: {
      title: '39-я международная строительная выставка-ярмарка «BARILGA EXPO» открылась сегодня',
      description: '39-я международная строительная выставка-ярмарка «BARILGA EXPO», объединяющая новые строительные проекты, передовые технологии, строительные материалы, инструменты и оборудование, а также жилищные решения, открылась сегодня во дворце Буянт-Ухаа. На церемонии открытия выступили министр строительства и градостроительства Э.Бат-Амгалан, госсекретарь М.Баяраа и основатель BARILGA EXPO Г.Батсух...',
    },
    ko: {
      title: "제39회 'BARILGA EXPO' 국제 건설 박람회 오늘 개막",
      description: "신규 건설 프로젝트, 첨단 기술, 건축 자재, 공구 및 장비, 주택 솔루션을 한자리에 모은 제39회 'BARILGA EXPO' 국제 건설 박람회가 오늘 부얀트-우하 궁전에서 개막했습니다. 개막식에는 도시건설・건설・주택부 장관 E.Bat-Amgalan, 국무장관 M.Bayaraa, BARILGA EXPO 설립자 G.Batsukh 등이 참석했습니다...",
    },
  },
  3: {
    en: {
      title: '39th BARILGA EXPO | Discounts and Promotions During the Exhibition',
      description: 'Only a few days remain until the 39th "BARILGA EXPO" international construction exhibition takes place at the Buyant-Ukhaa Palace on April 24-26, 2026. About 400 companies from over 20 countries including China, Korea, Japan, Germany, Poland, Italy, Turkey and Russia will take part as building material producers, suppliers, technology providers, investors and project developers...',
    },
    zh: {
      title: '第39届BARILGA EXPO | 展会期间的折扣与促销活动',
      description: '第39届"BARILGA EXPO"国际建筑展览会将于2026年4月24日至26日在拜扬特-乌哈宫举行，现已进入倒计时。来自中国、韩国、日本、德国、波兰、意大利、土耳其、俄罗斯等20多个国家的约400家建材生产商、供应商、技术提供商、投资者及项目开发商将参展……',
    },
    ru: {
      title: '39-я BARILGA EXPO | Скидки и акции во время выставки',
      description: 'До открытия 39-й международной строительной выставки-ярмарки «BARILGA EXPO», которая пройдет во дворце Буянт-Ухаа 24–26 апреля 2026 года, остались считанные дни. В выставке примут участие около 400 компаний из более чем 20 стран, включая Китай, Корею, Японию, Германию, Польшу, Италию, Турцию и Россию...',
    },
    ko: {
      title: '제39회 BARILGA EXPO | 전시 기간 할인 및 프로모션',
      description: "2026년 4월 24일~26일 부얀트-우하 궁전에서 열리는 제39회 'BARILGA EXPO' 국제 건설 박람회 개최가 며칠 앞으로 다가왔습니다. 중국, 한국, 일본, 독일, 폴란드, 이탈리아, 터키, 러시아 등 20여 개국의 건축자재 생산업체, 공급업체, 첨단 기술 도입업체, 투자자 및 프로젝트 개발업체 약 400개사가 참가할 예정입니다...",
    },
  },
  4: {
    en: {
      title: 'The 39th "BARILGA EXPO" International Exhibition Begins Accepting Orders for Outdoor Tents',
      description: 'The 39th "BARILGA EXPO" international construction exhibition will take place at the Buyant-Ukhaa Palace on April 24-26, 2026, and preparations are in full swing. Due to high demand from participating companies, organizers have begun taking orders for additional outdoor tents to accommodate more exhibitors...',
    },
    zh: {
      title: '第39届"BARILGA EXPO"国际展览会开始接受户外加建帐篷预订',
      description: '第39届"BARILGA EXPO"国际建筑展览会将于2026年4月24日至26日在拜扬特-乌哈宫举行，筹备工作正紧锣密鼓地进行。由于参展企业需求旺盛，主办方已开始接受户外加建帐篷的预订，以容纳更多参展商……',
    },
    ru: {
      title: '39-я международная выставка «BARILGA EXPO» начинает принимать заявки на дополнительные шатры на открытой площадке',
      description: '39-я международная строительная выставка-ярмарка «BARILGA EXPO» пройдет во дворце Буянт-Ухаа 24–26 апреля 2026 года, и подготовка идет полным ходом. Из-за высокого спроса со стороны участников организаторы начали принимать заявки на дополнительные шатры на открытой площадке...',
    },
    ko: {
      title: "제39회 'BARILGA EXPO' 국제 전시회, 야외 추가 천막 예약 접수 시작",
      description: "제39회 'BARILGA EXPO' 국제 건설 박람회가 2026년 4월 24일~26일 부얀트-우하 궁전에서 개최되며, 준비가 한창입니다. 참가업체들의 높은 수요로 인해 주최 측은 더 많은 참가업체를 수용하기 위해 야외 추가 천막 예약을 받기 시작했습니다...",
    },
  },
  5: {
    en: {
      title: 'The 39th "BARILGA EXPO" Booth Occupancy Reaches 80%',
      description: 'The 39th "BARILGA EXPO" international construction exhibition, to be held at the Buyant-Ukhaa Palace on April 24-26, 2026, has reached 80% booth occupancy. As space is limited, interested companies are advised to secure their location and confirm their booking early. In addition to Mongolia, around 400 companies from China, Korea, Japan, Germany and other countries will participate...',
    },
    zh: {
      title: '第39届"BARILGA EXPO"展位预订率达到80%',
      description: '将于2026年4月24日至26日在拜扬特-乌哈宫举行的第39届"BARILGA EXPO"国际建筑展览会展位预订率已达到80%。由于场地有限，建议有意参展的企业尽早选定位置并确认预订。除蒙古外，还将有来自中国、韩国、日本、德国等国家的约400家企业参展……',
    },
    ru: {
      title: 'Заполняемость стендов 39-й «BARILGA EXPO» достигла 80%',
      description: 'Заполняемость стендов 39-й международной строительной выставки-ярмарки «BARILGA EXPO», которая пройдет во дворце Буянт-Ухаа 24–26 апреля 2026 года, достигла 80%. Поскольку мест ограниченное количество, заинтересованным компаниям рекомендуется как можно раньше выбрать место и подтвердить бронирование. Помимо Монголии, участие примут около 400 компаний из Китая, Кореи, Японии, Германии и других стран...',
    },
    ko: {
      title: "제39회 'BARILGA EXPO' 부스 예약률 80% 달성",
      description: "2026년 4월 24일~26일 부얀트-우하 궁전에서 열리는 제39회 'BARILGA EXPO' 국제 건설 박람회의 부스 예약률이 80%에 도달했습니다. 공간이 제한적이므로 참가를 원하는 기업은 위치를 조기에 선정하고 예약을 확정할 것을 권장합니다. 몽골 외에도 중국, 한국, 일본, 독일 등에서 약 400개 기업이 참가할 예정입니다...",
    },
  },
  6: {
    en: {
      title: 'Dates Announced for the 39th "BARILGA EXPO" International Construction Exhibition',
      description: 'The 39th "BARILGA EXPO" international construction exhibition will be held at the Buyant-Ukhaa Palace on April 24-26, 2026. This is the construction sector\'s most influential and prestigious event, with around 400 domestic and international organizations and companies expected to participate, including from China, Korea, Japan, Germany, Poland, Italy, Turkey...',
    },
    zh: {
      title: '第39届"BARILGA EXPO"国际建筑展览会日期公布',
      description: '第39届"BARILGA EXPO"国际建筑展览会将于2026年4月24日至26日在拜扬特-乌哈宫举行。这是建筑行业最具影响力和声望的盛会，预计将有约400家国内外机构和企业参展，包括来自中国、韩国、日本、德国、波兰、意大利、土耳其等国的企业……',
    },
    ru: {
      title: 'Объявлены даты 39-й международной строительной выставки-ярмарки «BARILGA EXPO»',
      description: '39-я международная строительная выставка-ярмарка «BARILGA EXPO» пройдет во дворце Буянт-Ухаа 24–26 апреля 2026 года. Это самое влиятельное и престижное событие строительной отрасли, в котором примут участие около 400 отечественных и зарубежных организаций и компаний, в том числе из Китая, Кореи, Японии, Германии, Польши, Италии, Турции...',
    },
    ko: {
      title: "제39회 'BARILGA EXPO' 국제 건설 박람회 일정 발표",
      description: "제39회 'BARILGA EXPO' 국제 건설 박람회가 2026년 4월 24일~26일 부얀트-우하 궁전에서 개최됩니다. 이는 건설 분야에서 가장 영향력 있고 권위 있는 행사로, 중국, 한국, 일본, 독일, 폴란드, 이탈리아, 터키 등 국내외 약 400개 기관 및 기업이 참가할 예정입니다...",
    },
  },
  7: {
    en: {
      title: 'Winners of the 38th Barilga Expo International Construction Exhibition Announced',
      description: 'BARILGA EXPO, the international construction exhibition that brings together the sector\'s leading companies to showcase building materials, advanced technologies, new housing and house projects, was successfully held for the 38th time. Held at the Buyant-Ukhaa Palace on September 12-14, around 60 companies from over 20 countries including Russia, China, Korea, Japan and Germany, together with over 300 domestic companies, took part, and 8 of them were named winners...',
    },
    zh: {
      title: '第38届Barilga Expo国际建筑展览会优秀企业揭晓',
      description: '汇集行业领先企业，展示建筑材料、先进技术、新住宅及别墅项目的国际建筑展览会"BARILGA EXPO"成功举办第38届。本次展览于9月12日至14日在拜扬特-乌哈宫举行，来自俄罗斯、中国、韩国、日本、德国等20多个国家的约60家企业及300多家国内企业参展，其中8家企业被评为优秀企业……',
    },
    ru: {
      title: 'Объявлены победители 38-й международной строительной выставки-ярмарки Barilga Expo',
      description: 'Международная строительная выставка-ярмарка BARILGA EXPO, объединяющая ведущие компании отрасли для демонстрации строительных материалов, передовых технологий, новых жилых и дачных проектов, успешно прошла в 38-й раз. Выставка состоялась во дворце Буянт-Ухаа 12–14 сентября, в ней приняли участие около 60 компаний из более чем 20 стран, включая Россию, Китай, Корею, Японию, Германию, а также более 300 отечественных компаний, 8 из которых были признаны лучшими...',
    },
    ko: {
      title: '제38회 Barilga Expo 국제 건설 박람회 우수업체 발표',
      description: '건설 자재, 첨단 기술, 신규 주택 및 하우스 프로젝트를 선보이는 업계 선도 기업들이 한자리에 모이는 국제 건설 박람회 BARILGA EXPO가 제38회를 성공적으로 개최했습니다. 9월 12일~14일 부얀트-우하 궁전에서 열린 이번 박람회에는 러시아, 중국, 한국, 일본, 독일 등 20여 개국 약 60개 기업과 국내 300여 개 기업이 참가했으며, 이 중 8개 기업이 우수업체로 선정되었습니다...',
    },
  },
  8: {
    en: {
      title: '10 Tips for Optimally Setting Up Your Exhibition Booth',
      description: 'Participating in exhibitions and trade fairs is one of the few highly effective channels for reaching customers directly. Although learning how to set up and organize your booth for an exhibition can be a complex task, it allows you to make the most of your finances and time. After reading this article, you will understand the importance of properly organizing your exhibition booth...',
    },
    zh: {
      title: '优化展位布置的10条建议',
      description: '参加展览会和交易会是直接接触客户为数不多的高效渠道之一。虽然学习如何布置和组织展位是一项复杂的工作，但它能让您更有效地利用资金和时间。阅读本文后，您将了解合理布置展位的重要性……',
    },
    ru: {
      title: '10 советов по оптимальному оформлению выставочного стенда',
      description: 'Участие в выставках и ярмарках — один из немногих эффективных каналов прямого взаимодействия с клиентами. Хотя изучение того, как оформить и организовать свой стенд для выставки, может быть непростой задачей, это позволяет максимально эффективно использовать ваши финансы и время. Прочитав эту статью, вы поймете, насколько важно правильно организовать свой выставочный стенд...',
    },
    ko: {
      title: '전시 부스를 효과적으로 꾸미는 10가지 팁',
      description: "전시회와 박람회 참가는 고객에게 직접 다가갈 수 있는 몇 안 되는 효과적인 채널 중 하나입니다. 전시를 위해 부스를 어떻게 꾸미고 구성할지 배우는 것은 까다로운 작업일 수 있지만, 이를 통해 자금과 시간을 효율적으로 활용할 수 있습니다. 이 글을 읽고 나면 전시 부스를 제대로 구성하는 것이 얼마나 중요한지 알게 될 것입니다...",
    },
  },
};
