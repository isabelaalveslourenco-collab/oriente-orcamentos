import { createClient } from "@supabase/supabase-js";

// Cliente com chave de serviço — usar SOMENTE em rotas de servidor (API routes).
// Nunca importar este arquivo em componentes de cliente ("use client").
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuração do Supabase ausente no servidor. Verifique SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}
