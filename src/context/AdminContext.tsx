import React, { createContext, useContext, useState, useEffect } from 'react';
import { newsItems as initialNews } from '../data/newsItems';
import { supabase, createIsolatedSupabaseClient } from '../supabase';
import { defaultTestimonials, Testimonial } from '../data/testimonials';
export type { Testimonial };

export interface Organizer {
  id: string;
  name: string;
  logo: string;
  url?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: 'main' | 'sponsor' | 'supporter';
  url?: string;
}

/** Facebook reel бичлэг — нүүрэнд босоо карт болж харагдана.
 *  Нүүр зургийг Facebook-ийн plugin өөрөө өгдөг тул тусад нь хадгалахгүй. */
export interface Reel {
  id: string;
  url: string;   // Facebook reel-ийн холбоос
  title: string; // Карт дээр харагдах богино нэр (заавал биш)
  poster?: string; // Нүүр кадрын зураг. Байхгүй бол карт нь бичлэгийг өөрийг нь
                   // татаж кадр гаргадаг тул egress их иддэг.
}

export interface ProgramEvent {
  time: string;
  title: string;
  desc: string;
  loc: string;
  /** Илтгэлийн зурагт хуудас (public/seminars/ доторх файл). */
  img?: string;
}

export interface ProgramDay {
  id: string;
  day: string;
  date: string;
  events: ProgramEvent[];
}

export interface Menu {
  id: string;
  labelMn: string;
  labelEn: string;
  path: string;
}

export interface ContactInfo {
  phone1: string;
  phone2: string;
  phone3: string;
  email: string;
  address: string;        // Оффисын хаяг
  venueAddress?: string;  // Үзэсгэлэн болох газрын хаяг
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  content: string;
  date: string;
  image: string;
  link: string;
  images?: string[];
  imagePosition?: string; // object-position утга, ж: "50% 30%"
  // Админаас үүсгэсэн орчуулга. Байхгүй бол newsTranslations.ts-ийн бэлэн орчуулга,
  // тэр ч байхгүй бол монгол эх хувилбар харагдана.
  i18n?: Partial<Record<'en' | 'zh' | 'ru' | 'ko', { title: string; description: string; content: string }>>;
}

export interface SiteData {
  logoUrl: string;
  contact: ContactInfo;
  menus: Menu[];
  organizers: Organizer[];
  sponsors: Sponsor[];
  gallery: string[];
  program: ProgramDay[];
  news: NewsItem[];
  boothBookedPercent?: number; // Талбайн захиалгын дүүргэлтийн хувь (0-100)
  showFloorPlan?: boolean;     // "Талбайн сонголт" хэсгийг нүүрэнд харуулах эсэх
  reels?: Reel[];              // Нүүрэнд story маягаар харагдах Facebook reel-үүд
  testimonials?: Testimonial[]; // Оролцогчдын сэтгэгдэл
  participants?: string[];      // Оролцогч байгууллагуудын лого (зөвхөн зураг)
}

const defaultContact = {
  phone1: '77113333',
  phone2: '99907814',
  phone3: '99907816',
  email: 'expo@barilga.mn',
  address: 'Улаанбаатар 13373, Баянзүрх дүүрэг, 6-р хороо, "BARILGA.MN" оффис',
  venueAddress: 'Монгол улс, Улаанбаатар хот, Хан-Уул дүүрэг, 21-р хороо, "Буянт-Ухаа" ордон',
  facebookUrl: 'https://facebook.com/barilga.mn',
  instagramUrl: 'https://instagram.com/barilga.mn',
  youtubeUrl: 'https://www.youtube.com/barilgamn'
};

const defaultOrganizers: Organizer[] = [
  { id: '1', name: 'Хот Байгуулалт, Барилга, Орон Сууцжуулалтын Яам', logo: 'https://www.barilgaexpo.mn/organizer-1.jpg', url: 'https://mcud.gov.mn' },
  { id: '2', name: 'Нийслэлийн Засаг Даргын Тамгын газар', logo: 'https://www.barilgaexpo.mn/organizer-2.png', url: 'https://www.ulaanbaatar.mn' },
  { id: '3', name: 'Барилгын Хөгжлийн Төв', logo: 'https://www.barilgaexpo.mn/organizer-3.png', url: 'https://barilga.gov.mn' },
];

const defaultGallery = [
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-2436.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-1983.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0371.jpg',
  'https://www.barilgaexpo.mn/gallery/10-1.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0383.jpg',
  'https://www.barilgaexpo.mn/gallery/2-2.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0421.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0360.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0555.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0523.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0627.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0569.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0411.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0612.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0798.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0709.jpg',
  'https://www.barilgaexpo.mn/gallery/MPA-PHOTO-2026-4-0687.jpg',
  'https://www.barilgaexpo.mn/gallery/677267349_1291051353159299_1013812053009267747_n.jpg',
  'https://www.barilgaexpo.mn/gallery/SJP_4965.jpg'
];

const LOC = 'Буянт-Ухаа ордон /төв тайз/';

/** Үзэсгэлэнгийн илтгэл, семинарын хөтөлбөр (2026.09.11–13).
 *  Админаас оруулсан өдрийн хөтөлбөрийн доор нэмэлт блок болж харагдана. */
export const seminarProgram: ProgramDay[] = [
  {
    id: 'd1',
    date: '2026-09-11',
    day: 'Баасан гараг',
    events: [
      { time: '14:00', title: 'Барилгын чанар, аюулгүй байдал, баталгаажуулалтын үйл ажиллагаа', desc: 'Э.Энхжин — Барилгын материалын үйлдвэрлэлийн технологийн заавар хариуцсан мэргэжилтэн', loc: LOC, img: '/seminars/enkhjin.jpg' },
      { time: '14:25', title: 'Барилга, байгууламжийн норм дүрмийг өгөгдөл болгон хувиргаж, ашиглах нь', desc: 'Э.Мягмар-Өлзий — Цахим хөгжил, мэдээллийн технологийн хэлтсийн дарга', loc: LOC, img: '/seminars/myagmar-ulzii.jpg' },
      { time: '14:50', title: 'Нийслэл Улаанбаатар хотод хэрэгжиж буй томоохон төслүүд', desc: 'Д.Төгөлдөр — "Нэгдсэн төслийн удирдлагын газар" ОНӨТҮГ, ахлах инженер', loc: LOC, img: '/seminars/tuguldur.jpg' },
      { time: '15:10', title: 'Дахин төлөвлөлт ба Улаанбаатар хотын шинэ өнгө төрх', desc: 'Б.Пүрэвсүрэн — "Улаанбаатар орон сууцжуулалт" ХХК-ийн Захиргаа, санхүүгийн газрын дарга', loc: LOC, img: '/seminars/purevsuren.jpg' },
      { time: '', title: 'Барилгын төсөлд эрсдэлийг хэрхэн урьдчилан тооцох вэ?', desc: '', loc: LOC },
      { time: '', title: 'Орон сууцны зах зээл — Хэрэглэгч юу хүсэж байна вэ?', desc: '', loc: LOC },
    ],
  },
  {
    id: 'd2',
    date: '2026-09-12',
    day: 'Бямба гараг',
    events: [
      { time: '11:50', title: 'Хариуцлага, хяналт ба өдөр тутмын аюулгүй ажиллагаа', desc: 'Ч.Чинзориг — ХАБЭА-ын сургагч багш, Монгол Улсын зөвлөх инженер', loc: LOC, img: '/seminars/chinzorig.jpg' },
      { time: '12:15', title: 'Амины орон сууцны зөв төлөвлөлт: Газрын сонголтоос барилгын гүйцэтгэл хүртэл', desc: 'Б.Нандинцэцэг — Сэтгүүл захиалгын менежер', loc: LOC, img: '/seminars/nandintsetseg.jpg' },
      { time: '13:30', title: 'Хиймэл оюун ухааныг үр дүнтэй ашиглах нь', desc: 'С.Эрдэнэбат — Стартап Монгол, Айтрип үүсгэн байгуулагч', loc: LOC, img: '/seminars/erdenebat.jpg' },
      { time: '', title: 'BARILGA.MN-д хиймэл оюун ухаан нэвтрүүлэх нь', desc: '', loc: LOC },
      { time: '14:45', title: 'Ногоон барилгын дараагийн үе: BIPV технологи ба эрчим хүчний үр ашиг', desc: 'С.Болорбайгаль — BIPV Glass технологийн сургагч багш', loc: LOC, img: '/seminars/bolorbaigal.jpg' },
      { time: '15:05', title: 'Барилгачин худалдааны төвийн танилцуулга', desc: 'С.Түвшинбаяр — Барилгачин групп ХХК, ерөнхий менежер', loc: LOC, img: '/seminars/tuvshinbayar.jpg' },
    ],
  },
  {
    id: 'd3',
    date: '2026-09-13',
    day: 'Ням гараг',
    events: [
      { time: '11:00', title: 'Барилгын салбарын мэргэжилтнүүдэд зориулсан номын танилцуулга', desc: 'М.Гандорж — Массбетон Барилгын Чанарын Холбооны гүйцэтгэх захирал', loc: LOC, img: '/seminars/gandorj.jpg' },
      { time: '11:25', title: 'Ногоон барилгын шийдэл: Эрчим хүчний үр ашиг ба барилгын ашиглалтын зардал', desc: 'Ц.Батгэрэл — Ногоон барилгын хүрээлэнгийн гүйцэтгэх захирал', loc: LOC, img: '/seminars/batgerel.jpg' },
      { time: '', title: 'BARILGA.MN-д хиймэл оюун ухаан нэвтрүүлэх нь', desc: '', loc: LOC },
      { time: '13:55', title: 'Нарны эрчим хүч ба барилга: Өөрийн хэрэглээний эрчим хүчээ үйлдвэрлэх боломж', desc: 'Г.Бат-Эрдэнэ — "Монкабель системс" ХХК-ийн Барилгын технологийн хэлтсийн захирал', loc: LOC, img: '/seminars/bat-erdene.jpg' },
      { time: '14:20', title: 'Халаалтын зардлыг тэглэх боломжтой юу? Өөрийн эрчим хүчээр дулаанаа шийдэх нь', desc: 'Б.Мөнхбаяр — ШУТИС-ийн Барилгын эрчим хүч хэмнэлтийн төвийн захирал', loc: LOC, img: '/seminars/munkhbayar.jpg' },
      { time: '', title: 'Барилгын материалын худалдаа, нийлүүлэлтийн шинэ үе', desc: '', loc: LOC },
    ],
  },
];

const defaultData: SiteData = {
  logoUrl: 'https://www.barilgaexpo.mn/expo-logo.png',
  contact: defaultContact,
  menus: [
    { id: '1', labelMn: 'НҮҮР', labelEn: 'HOME', path: '/' },
    { id: '2', labelMn: 'МЭДЭЭ', labelEn: 'NEWS', path: '/#news' },
    { id: '3', labelMn: 'УДИРДАМЖ', labelEn: 'GUIDE', path: '/guide' },
    { id: '4', labelMn: 'ХӨТӨЛБӨР', labelEn: 'PROGRAM', path: '/program' },
    { id: '5', labelMn: 'ХОЛБОО БАРИХ', labelEn: 'CONTACT', path: '/#contact' },
  ],
  organizers: defaultOrganizers,
  sponsors: [],
  gallery: defaultGallery,
  program: [],
  news: initialNews,
  boothBookedPercent: 50,
  showFloorPlan: false,
  reels: [],
  testimonials: defaultTestimonials,
  participants: [],
};

interface AdminContextType {
  data: SiteData;
  updateData: (partial: Partial<SiteData> | ((prev: SiteData) => Partial<SiteData>)) => void;
  saveDataToDb: (customData?: SiteData) => Promise<void>;
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  adminEmails: string[];
  fetchAdminEmails: () => Promise<void>;
  addAdminUser: (email: string, password: string) => Promise<void>;
  removeAdminUser: (email: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  data: defaultData,
  updateData: () => {},
  saveDataToDb: async () => {},
  isAuthenticated: false,
  userEmail: null,
  login: async () => {},
  logout: async () => {},
  adminEmails: [],
  fetchAdminEmails: async () => {},
  addAdminUser: async () => {},
  removeAdminUser: async () => {},
});

const DEFAULT_ADMIN_EMAIL = 'info@barilga.mn';

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<SiteData>(() => {
    try {
      const stored = localStorage.getItem('barilga_admin_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...parsed, contact: { ...defaultContact, ...parsed.contact } };
      }
    } catch (e) {}
    return defaultData;
  });

  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; userEmail: string | null }>(() => {
    try {
      const stored = localStorage.getItem('barilga_admin_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.userEmail) {
          return parsed;
        }
      }
    } catch (e) {}
    return { isAuthenticated: false, userEmail: null };
  });

  const [adminEmails, setAdminEmails] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('barilga_admin_emails');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return [DEFAULT_ADMIN_EMAIL];
  });

  const adminEmailsRef = React.useRef(adminEmails);
  useEffect(() => {
    adminEmailsRef.current = adminEmails;
  }, [adminEmails]);

  const isAllowedAdminEmail = (email?: string | null) => {
    if (!email) return false;
    const e = email.toLowerCase();
    if (e === DEFAULT_ADMIN_EMAIL) return true;
    return adminEmailsRef.current.some(a => a.toLowerCase() === e);
  };

  const fetchAdminEmails = async () => {
    try {
      const { data: rows, error } = await supabase.from('admin_users').select('email');
      if (!error && rows) {
        const emails = Array.from(new Set([DEFAULT_ADMIN_EMAIL, ...rows.map((r: any) => String(r.email).toLowerCase())]));
        setAdminEmails(emails);
        try {
          localStorage.setItem('barilga_admin_emails', JSON.stringify(emails));
        } catch (e) {}
      }
    } catch (e) {}
  };

  // 1. Эхлэлд Supabase-аас site_data унших
  useEffect(() => {
    const fetchSiteData = async () => {
      const { data: result, error } = await supabase
        .from('site_data')
        .select('data')
        .eq('id', 'config')
        .single();

      if (!error && result?.data) {
        const cloudData = result.data as SiteData;
        const merged = { ...cloudData, contact: { ...defaultContact, ...cloudData.contact } };
        setData(merged);
        try {
          localStorage.setItem('barilga_admin_data', JSON.stringify(merged));
        } catch (e) {}
      }
    };

    fetchSiteData();

    // 2. Realtime subscription — site_data өөрчлөгдөхөд шууд update
    const channel = supabase
      .channel('site_data_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_data', filter: 'id=eq.config' },
        (payload) => {
          const newRow = payload.new as { data: SiteData } | null;
          if (newRow?.data) {
            const merged = { ...newRow.data, contact: { ...defaultContact, ...newRow.data.contact } };
            setData(merged);
            try {
              localStorage.setItem('barilga_admin_data', JSON.stringify(merged));
            } catch (e) {}
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Supabase Auth state listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email && isAllowedAdminEmail(session.user.email)) {
        const freshAuth = { isAuthenticated: true, userEmail: session.user.email };
        setAuthState(freshAuth);
        try {
          localStorage.setItem('barilga_admin_auth', JSON.stringify(freshAuth));
        } catch (e) {}
      } else if (!session) {
        // Жинхэнэ Supabase session байхгүй бол нэвтрээгүйд тооцно.
        // Өмнө нь localStorage-ийн тэмдэглэгээг үнэмшиж "нэвтэрсэн" гэж
        // харуулдаг байсан. RLS ажиллаж эхэлсэн үед энэ нь хамгийн
        // төөрөгдүүлсэн эвдрэл болно: дэлгэц дээр админаар нэвтэрсэн
        // мөртлөө бүх хүсэлт зочны эрхээр явж, хүснэгт бүр хоосон харагдана.
        try { localStorage.removeItem('barilga_admin_auth'); } catch (e) {}
        setAuthState({ isAuthenticated: false, userEmail: null });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 4. Admин имэйлийн жагсаалтыг Supabase-аас унших
  useEffect(() => {
    fetchAdminEmails();
  }, []);

  const login = async (email: string, password: string) => {
    // ЭХЛЭЭД нэвтэрнэ. Админ жагсаалтыг зөвхөн үүний ДАРАА уншина —
    // эс бөгөөс admin_users хүснэгтийг нийтэд нээлттэй болгох шаардлагатай
    // болж, админуудын и-мэйл хаяг задардаг.
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await fetchAdminEmails();

    if (!authData.user?.email || !isAllowedAdminEmail(authData.user.email)) {
      await supabase.auth.signOut();
      throw new Error(`Хандах эрхгүй байна! Энэ имэйл админ хэрэглэгчийн жагсаалтад байхгүй байна.`);
    }

    const freshAuth = { isAuthenticated: true, userEmail: authData.user.email };
    setAuthState(freshAuth);
    try {
      localStorage.setItem('barilga_admin_auth', JSON.stringify(freshAuth));
    } catch (e) {}

    // Хэрэв site_data байхгүй бол шинэ эхлэл хийх
    const { data: existing } = await supabase
      .from('site_data')
      .select('id')
      .eq('id', 'config')
      .single();

    if (!existing) {
      await supabase.from('site_data').upsert({ id: 'config', data });
    }
  };

  // Шинэ админ хэрэглэгч нэмэх: Supabase Auth-д шинэ хэрэглэгч үүсгэж,
  // admin_users жагсаалтад имэйлийг бүртгэнэ. Тусдаа (session хадгалахгүй)
  // клиент ашигладаг тул одоо нэвтэрсэн админы session-д нөлөөлөхгүй.
  const addAdminUser = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      throw new Error('Имэйл болон нууц үг шаардлагатай.');
    }

    const isolated = createIsolatedSupabaseClient();
    const { error: signUpError } = await isolated.auth.signUp({ email: normalized, password });
    if (signUpError) throw signUpError;

    const { error: insertError } = await supabase.from('admin_users').upsert({ email: normalized });
    if (insertError) throw insertError;

    await fetchAdminEmails();
  };

  // Админ хэрэглэгчийг жагсаалтаас хасах (Supabase Auth-д байгаа бүртгэлийг устгахгүй,
  // зөвхөн админ панелд хандах эрхийг хасна)
  const removeAdminUser = async (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized === DEFAULT_ADMIN_EMAIL) {
      throw new Error(`"${DEFAULT_ADMIN_EMAIL}" имэйлийг хасах боломжгүй.`);
    }
    const { error } = await supabase.from('admin_users').delete().eq('email', normalized);
    if (error) throw error;
    await fetchAdminEmails();
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setAuthState({ isAuthenticated: false, userEmail: null });
    try {
      localStorage.removeItem('barilga_admin_auth');
    } catch (e) {}
  };

  const saveDataToDb = async (customData?: SiteData) => {
    const dataToSave = customData || data;
    const { error } = await supabase
      .from('site_data')
      .upsert({ id: 'config', data: dataToSave, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    try {
      localStorage.setItem('barilga_admin_data', JSON.stringify(dataToSave));
    } catch (e) {}
  };

  const updateData = (partial: Partial<SiteData> | ((prev: SiteData) => Partial<SiteData>)) => {
    setData(prev => {
      const resolvedPartial = typeof partial === 'function' ? partial(prev) : partial;
      const next = { ...prev, ...resolvedPartial };
      try {
        localStorage.setItem('barilga_admin_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <AdminContext.Provider value={{ data, updateData, saveDataToDb, isAuthenticated: authState.isAuthenticated, userEmail: authState.userEmail, login, logout, adminEmails, fetchAdminEmails, addAdminUser, removeAdminUser }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
