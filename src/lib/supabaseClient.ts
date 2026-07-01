import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Em desenvolvimento isso ajuda a identificar rapidamente um .env.local ausente.
  console.warn(
    "[supabaseClient] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não definidos. " +
      "Copie .env.local.example para .env.local e preencha com os dados do seu projeto Supabase."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
