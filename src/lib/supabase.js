import { createClient } from "@supabase/supabase-js";

// Configuração hardcoded para deploy no Vercel
const supabaseUrl = "https://gmpavmyhfjfbqnggyrds.supabase.co";
const supabaseAnonKey = "sb_publishable_wHRO9mHnwiWExgVtBZKQIQ_5G19Zpw0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper para hash de senha (simples - em produção use bcrypt no backend)
export const hashPassword = (password) => {
  return btoa(password); // Base64 simples para demonstração
};

export const verifyPassword = (password, hash) => {
  return btoa(password) === hash;
};
