-- Rode isto no SQL Editor do Supabase (uma única vez) para adicionar os
-- campos do adicional "Portas mimetizadas" (painel revestimento de parede
-- com porta mimetizada) e o controle de exibir/ocultar o acabamento no PDF.

alter table itens
  add column if not exists portas_mimetizadas_qtd integer not null default 0,
  add column if not exists portas_mimetizadas_valor_unitario numeric(12,2) not null default 0,
  add column if not exists portas_mimetizadas_valor numeric(12,2) not null default 0,
  add column if not exists mostrar_acabamento_pdf boolean not null default true;
