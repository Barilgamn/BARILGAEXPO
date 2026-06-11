import React, { createContext, useContext, useState, useEffect } from 'react';
import { newsItems as initialNews } from '../data/newsItems';
import { supabase } from '../supabase';

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
}

export interface ProgramEvent {
  time: string;
  title: string;
  desc: string;
  loc: string;
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
  email: string;
  address: string;
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
}

const defaultContact = {
  phone1: '+976 7711 3333',
  phone2: '+976 9990 7816',
  email: 'expo@barilga.mn',
  address: 'Улаанбаатар 13373, Баянзүрх дүүрэг, 6-р хороо, "BARILGA.MN" оффис',
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

const defaultProgram: ProgramDay[] = [];

const defaultData: SiteData = {
  logoUrl: 'https://www.barilgaexpo.mn/expo-logo.png',
  contact: defaultContact,
  menus: [
    { id: '1', labelMn: 'НҮҮР', labelEn: 'HOME', path: '/' },
    { id: '2', labelMn: 'МЭДЭЭ', labelEn: 'NEWS', path: '/#news' },
    { id: '3', labelMn: 'УДИРДАМЖ', labelEn: 'GUIDE', path: '/guide' },
    { id: '4', labelMn: 'ХӨТӨЛБӨР', labelEn: 'PROGRAM', path: '/#program' },
    { id: '5', labelMn: 'ХОЛБОО БАРИХ', labelEn: 'CONTACT', path: '/#contact' },
  ],
  organizers: defaultOrganizers,
  sponsors: [],
  gallery: defaultGallery,
  program: defaultProgram,
  news: initialNews,
};

interface AdminContextType {
  data: SiteData;
  updateData: (partial: Partial<SiteData> | ((prev: SiteData) => Partial<SiteData>)) => void;
  saveDataToDb: (customData?: SiteData) => Promise<void>;
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  data: defaultData,
  updateData: () => {},
  saveDataToDb: async () => {},
  isAuthenticated: false,
  userEmail: null,
  login: async () => {},
  logout: async () => {},
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<SiteData>(() => {
    try {
      const stored = localStorage.getItem('barilga_admin_data');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return defaultData;
  });

  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; userEmail: string | null }>(() => {
    try {
      const stored = localStorage.getItem('barilga_admin_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.userEmail === 'info@barilga.mn') {
          return parsed;
        }
      }
    } catch (e) {}
    return { isAuthenticated: false, userEmail: null };
  });

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
        setData(cloudData);
        try {
          localStorage.setItem('barilga_admin_data', JSON.stringify(cloudData));
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
            setData(newRow.data);
            try {
              localStorage.setItem('barilga_admin_data', JSON.stringify(newRow.data));
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
      if (session?.user?.email === 'info@barilga.mn') {
        const freshAuth = { isAuthenticated: true, userEmail: session.user.email };
        setAuthState(freshAuth);
        try {
          localStorage.setItem('barilga_admin_auth', JSON.stringify(freshAuth));
        } catch (e) {}
      } else if (!session) {
        // localStorage-д хадгалсан auth байвал хэвээр үлдээх
        const localAuthStr = localStorage.getItem('barilga_admin_auth');
        if (localAuthStr) {
          try {
            const parsed = JSON.parse(localAuthStr);
            if (parsed.isAuthenticated && parsed.userEmail === 'info@barilga.mn') {
              return;
            }
          } catch (e) {}
        }
        setAuthState({ isAuthenticated: false, userEmail: null });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (authData.user?.email !== 'info@barilga.mn') {
      await supabase.auth.signOut();
      throw new Error(`Хандах эрхгүй байна! Зөвхөн "info@barilga.mn" имэйлээр нэвтрэх боломжтой.`);
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
    <AdminContext.Provider value={{ data, updateData, saveDataToDb, isAuthenticated: authState.isAuthenticated, userEmail: authState.userEmail, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
