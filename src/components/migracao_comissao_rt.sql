-- Rode isto no SQL Editor do Supabase (uma única vez) para adicionar o
-- campo de comissão de RT (Reserva Técnica) do arquiteto(a).

alter table orcamentos
  add column if not exists comissao_rt numeric(5,2) not null default 0;
