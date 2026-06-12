import { supabase } from '../supabase';

const getOrCreateId = (key: string) => {
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = (crypto as any)?.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const today = () => new Date().toISOString().slice(0, 10);

// Өдөрт нэг удаа (session тус бүрээр) хандалт бүртгэнэ
export const trackVisit = async (path: string) => {
  try {
    const lastKey = 'barilga_visit_last';
    const t = today();
    if (localStorage.getItem(lastKey) === t) return;
    const sessionId = getOrCreateId('barilga_session_id');
    await supabase.from('site_visits').insert({ session_id: sessionId, path });
    localStorage.setItem(lastKey, t);
  } catch {
    /* статистик бүртгэл амжилтгүй болсон ч сайт хэвийн ажиллана */
  }
};

// Өдөрт нэг удаа (session тус бүрээр) AI чат хэрэглэсэн хэрэглэгчийг бүртгэнэ
export const trackChatUsage = async () => {
  try {
    const lastKey = 'barilga_chat_last';
    const t = today();
    if (localStorage.getItem(lastKey) === t) return;
    const sessionId = getOrCreateId('barilga_session_id');
    await supabase.from('chat_sessions').insert({ session_id: sessionId });
    localStorage.setItem(lastKey, t);
  } catch {
    /* статистик бүртгэл амжилтгүй болсон ч чат хэвийн ажиллана */
  }
};
