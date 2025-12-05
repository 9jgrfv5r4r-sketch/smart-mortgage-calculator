import { createClient } from '@supabase/supabase-js';

// Проверка, что переменные загружены
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key loaded:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Создаем клиент
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});