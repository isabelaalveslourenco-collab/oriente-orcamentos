-- =========================================================
-- ORIENTE MÓVEIS · Sistema de Orçamentos
-- Schema do banco de dados (Supabase / Postgres)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------
create table if not exists clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  sobrenome text not null,
  endereco text,
  telefone text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Orçamentos
-- ---------------------------------------------------------
create table if not exists orcamentos (
  id uuid primary key default uuid_generate_v4(),
  numero serial,                                   -- número sequencial amigável (ex: #0001)
  cliente_id uuid not null references clientes(id) on delete cascade,
  regiao text not null check (regiao in ('aracatuba', 'sao_paulo')),
  status text not null default 'rascunho' check (status in ('rascunho', 'finalizado', 'cancelado')),
  observacoes text,
  desconto numeric(12,2) not null default 0,
  valor_total numeric(12,2) not null default 0,
  arquivo_projeto_url text,                        -- PDF/imagem do projeto anexado
  analise_ia jsonb,                                 -- resposta bruta da IA (auditoria)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Ambientes do orçamento (Cozinha, Quarto, Sala, etc.)
-- ---------------------------------------------------------
create table if not exists ambientes (
  id uuid primary key default uuid_generate_v4(),
  orcamento_id uuid not null references orcamentos(id) on delete cascade,
  nome text not null,
  ordem integer not null default 0
);

-- ---------------------------------------------------------
-- Itens de móveis dentro de cada ambiente
-- ---------------------------------------------------------
create table if not exists itens (
  id uuid primary key default uuid_generate_v4(),
  ambiente_id uuid not null references ambientes(id) on delete cascade,
  descricao text not null,                          -- ex: "Armário planejado"
  tipo_acabamento text not null,                     -- chave da tabela de preços (ver lib/pricing.ts)
  largura_m numeric(8,3) not null default 0,
  altura_m numeric(8,3) not null default 0,
  unidade_calculo text not null check (unidade_calculo in ('linear', 'quadrado')),
  medida_calculada numeric(8,3) not null default 0,  -- metro linear ou m² já calculado
  valor_unitario numeric(12,2) not null default 0,   -- valor da tabela por m ou m²
  valor_base numeric(12,2) not null default 0,        -- medida_calculada * valor_unitario

  -- Adicionais
  portas_espelho_qtd integer not null default 0,
  portas_espelho_valor numeric(12,2) not null default 0,
  led_metros numeric(8,3) not null default 0,
  led_valor numeric(12,2) not null default 0,
  tapecaria boolean not null default false,
  tapecaria_valor numeric(12,2) not null default 0,
  serralheria_valor numeric(12,2) not null default 0,
  palha_sintetica_valor numeric(12,2) not null default 0,
  palha_natural_valor numeric(12,2) not null default 0,

  valor_total numeric(12,2) not null default 0,       -- valor_base + adicionais
  ordem integer not null default 0
);

-- ---------------------------------------------------------
-- Índices úteis
-- ---------------------------------------------------------
create index if not exists idx_orcamentos_cliente on orcamentos(cliente_id);
create index if not exists idx_ambientes_orcamento on ambientes(orcamento_id);
create index if not exists idx_itens_ambiente on itens(ambiente_id);

-- ---------------------------------------------------------
-- Trigger para manter updated_at atualizado
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orcamentos_updated_at on orcamentos;
create trigger trg_orcamentos_updated_at
before update on orcamentos
for each row execute procedure set_updated_at();

-- ---------------------------------------------------------
-- RLS (ative e ajuste as policies de acordo com sua auth)
-- ---------------------------------------------------------
alter table clientes enable row level security;
alter table orcamentos enable row level security;
alter table ambientes enable row level security;
alter table itens enable row level security;

-- Exemplo simples: qualquer usuário autenticado pode ler/escrever.
-- Ajuste para regras mais restritas (ex: por vendedor) conforme necessário.
create policy "Usuarios autenticados podem tudo - clientes"
  on clientes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuarios autenticados podem tudo - orcamentos"
  on orcamentos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuarios autenticados podem tudo - ambientes"
  on ambientes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuarios autenticados podem tudo - itens"
  on itens for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Storage bucket para os projetos anexados (PDF/imagens)
-- Rode isso no SQL editor OU crie o bucket "projetos" pela UI do Supabase.
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('projetos', 'projetos', true)
on conflict (id) do nothing;
