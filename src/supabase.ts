import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Шинэ хэрэглэгч (admin) бүртгэхэд ашиглах тусдаа клиент.
// Энэ нь supabase.auth.signUp дуудахад одоо нэвтэрсэн админы session-ийг
// орлуулахаас сэргийлнэ (session-ийг localStorage/cookie-д хадгалахгүй).
export const createIsolatedSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
