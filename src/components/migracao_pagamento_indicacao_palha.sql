-- Rode isto no SQL Editor do Supabase (uma única vez) para garantir que
-- todas as colunas de Forma de Pagamento, Indicação e Palha existam.
-- Seguro para rodar mesmo se alguma coluna já existir.

alter table orcamentos
  add column if not exists forma_pagamento text not null default 'entrada_40_3x';

alter table orcamentos
  add column if not exists nome_indicacao text;

alter table orcamentos
  add column if not exists comissao_indicacao numeric(5,2) not null default 0;

alter table itens
  add column if not exists palha_sintetica_valor numeric(12,2) not null default 0;

alter table itens
  add column if not exists palha_natural_valor numeric(12,2) not null default 0;
