# Sistema de Orçamentos · Oriente Móveis

Sistema web para criação e gestão de orçamentos de móveis planejados e marcenaria, seguindo a
identidade visual da Oriente Móveis (vermelho #C1121F, cinza escuro #3F3F3F, branco, fontes Afacad
e Josefin Sans).

Feito com **Next.js 14** (App Router) + **Supabase** (banco de dados e storage).

---

## 1. O que o sistema faz

- **Novo Orçamento**: cadastra o cliente, escolhe a região (Araçatuba ou São Paulo) e organiza tudo
  em ambientes com itens editáveis.
- **Cálculo automático**: aplica a regra "altura < 1m → metro linear, altura ≥ 1m → metro quadrado",
  busca o valor na tabela de preços da região selecionada e soma os adicionais (portas de espelho,
  LED, tapeçaria, serralheria).
- **Abrir Orçamento**: busca orçamentos salvos por nome do cliente ou número, permite reabrir e editar.
- **Salvar e Exportar PDF**: grava no Supabase e gera um PDF em A4 com o logotipo, dados do cliente,
  itens por ambiente, subtotais, total e rodapé com contato — tudo com as cores da marca.

## 2. Pré-requisitos

- Node.js 18 ou superior
- Uma conta gratuita no [Supabase](https://supabase.com)

## 3. Configurando o Supabase

1. Crie um novo projeto em supabase.com.
2. Vá em **SQL Editor** e execute todo o conteúdo do arquivo `supabase/schema.sql` deste projeto.
   Isso cria as tabelas (`clientes`, `orcamentos`, `ambientes`, `itens`), os índices e as políticas de
   segurança (RLS).
3. Em **Project Settings → API**, copie:
   - `Project URL` → vai em `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → vai em `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha esta chave no navegador)
4. As políticas de segurança criadas exigem usuário autenticado. Se você ainda não tiver login
   configurado, ative **Authentication → Providers → Email** e crie um usuário para a equipe usar,
   ou simplifique as políticas em `schema.sql` conforme sua necessidade (ex: liberar por enquanto).

## 4. Rodando localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 — a aplicação abre direto na aba "Novo Orçamento".

## 5. Publicando (deploy)

O jeito mais simples é publicar na [Vercel](https://vercel.com) (criadora do Next.js):

1. Suba este projeto para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Configure as mesmas variáveis de ambiente do `.env.local` no painel da Vercel.
4. Publique. A Vercel cuida de build e hospedagem automaticamente.

## 6. Estrutura do projeto

```
src/
  app/
    layout.tsx              → layout raiz, fontes da marca e cabeçalho
    novo-orcamento/          → aba "Novo Orçamento"
    abrir-orcamento/         → aba "Abrir Orçamento" (busca + edição)
  components/
    Header.tsx               → navegação principal
    ClienteForm.tsx           → dados do cliente
    RegiaoSelector.tsx        → escolha de região (Araçatuba / São Paulo)
    AmbienteCard.tsx          → um ambiente com sua lista de itens
    ItemRow.tsx                → edição de um item (medidas, acabamento, adicionais)
    ResumoOrcamento.tsx        → totais, desconto, salvar/exportar
    OrcamentoForm.tsx           → tela completa (usada em Novo e em Editar)
    OrcamentoPDF.tsx             → modelo do PDF exportado
  lib/
    types.ts                  → tipos compartilhados
    pricing.ts                 → TODAS as regras de negócio e tabelas de preço
    orcamentosApi.ts            → salvar/buscar/carregar no Supabase
    supabaseClient.ts / supabaseServer.ts
    pdfExport.ts                → geração e download do PDF
supabase/
  schema.sql                   → schema completo do banco de dados
```

## 7. Ajustando preços no futuro

Toda a tabela de preços e as regras de adicionais estão centralizadas em **`src/lib/pricing.ts`**
(`TABELA_PRECOS` e `ADICIONAIS`). Para reajustar valores, altere apenas esse arquivo — nenhuma outra
parte do sistema precisa mudar.

## 8. Próximos passos sugeridos

- Adicionar autenticação de usuários (login da equipe de vendas) usando o Supabase Auth.
- Permitir editar o logotipo/rodapé do PDF direto pela interface, sem mexer no código.
- Adicionar campo de status (rascunho / finalizado / cancelado) visível na tela "Abrir Orçamento".
- Guardar um histórico de versões de cada orçamento, caso o cliente peça alterações.
