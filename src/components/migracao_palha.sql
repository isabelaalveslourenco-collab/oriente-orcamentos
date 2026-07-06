-- Rode isto no SQL Editor do Supabase (uma única vez) para adicionar os
-- campos de adicional "Palha sintética" e "Palha natural" nos itens.

alter table itens
  add column if not exists palha_sintetica_valor numeric(12,2) not null default 0,
  add column if not exists palha_natural_valor numeric(12,2) not null default 0;
