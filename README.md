# Sistema de Orçamentos · Oriente Móveis

Sistema web para criação e gestão de orçamentos de móveis planejados e marcenaria, seguindo a
identidade visual da Oriente Móveis (vermelho #C1121F, cinza escuro #3F3F3F, branco, fontes Afacad
e Josefin Sans).

Feito com **Next.js 14** (App Router) + **Supabase** (banco de dados e storage) + **IA (Claude/OpenAI)**
para leitura automática de projetos anexados.

---

## 1. O que o sistema faz

- **Novo Orçamento**: cadastra o cliente, escolhe a região (Araçatuba ou São Paulo), permite anexar
  um projeto (PDF/imagem) que a IA lê automaticamente para sugerir ambientes, móveis e medidas, e
  organiza tudo em ambientes com itens editáveis.
- **Cálculo automático**: aplica a regra "altura < 1m → metro linear, altura ≥ 1m → metro quadrado",
  busca o valor na tabela de preços da região selecionada e soma os adicionais (portas de espelho,
  LED, tapeçaria, serralheria).
- **Abrir Orçamento**: busca orçamentos salvos por nome do cliente ou número, permite reabrir e editar.
- **Salvar e Exportar PDF**: grava no Supabase e gera um PDF em A4 com o logotipo, dados do cliente,
  itens por ambiente, subtotais, total e rodapé com contato — tudo com as cores da marca.

## 2. Pré-requisitos

- Node.js 18 ou superior
- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma chave de API da [Anthropic](https://console.anthropic.com) (recomendado) ou da OpenAI

## 3. Configurando o Supabase

1. Crie um novo projeto em supabase.com.
2. Vá em **SQL Editor** e execute todo o conteúdo do arquivo `supabase/schema.sql` deste projeto.
   Isso cria as tabelas (`clientes`, `orcamentos`, `ambientes`, `itens`), os índices, as políticas de
   segurança (RLS) e o bucket de armazenamento `projetos` para os arquivos anexados.
3. Em **Project Settings → API**, copie:
   - `Project URL` → vai em `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → vai em `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha esta chave no navegador)
4. As políticas de segurança criadas exigem usuário autenticado. Se você ainda não tiver login
   configurado, ative **Authentication → Providers → Email** e crie um usuário para a equipe usar,
   ou simplifique as políticas em `schema.sql` conforme sua necessidade (ex: liberar por enquanto).

## 4. Configurando a IA (leitura automática de projetos)

1. Copie `.env.local.example` para `.env.local`.
2. Defina `AI_PROVIDER=anthropic` (padrão, recomendado por ler PDFs nativamente) e preencha
   `ANTHROPIC_API_KEY`. Se preferir usar a OpenAI, defina `AI_PROVIDER=openai` e preencha
   `OPENAI_API_KEY` (nesse caso, use preferencialmente imagens — PDFs podem exigir conversão prévia).
3. Essa etapa é opcional: sem uma chave configurada, o botão "Analisar com IA" mostra um aviso e o
   usuário pode preencher os itens manualmente, sem travar o uso do sistema.

## 5. Rodando localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 — a aplicação abre direto na aba "Novo Orçamento".

## 6. Publicando (deploy)

O jeito mais simples é publicar na [Vercel](https://vercel.com) (criadora do Next.js):

1. Suba este projeto para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Configure as mesmas variáveis de ambiente do `.env.local` no painel da Vercel.
4. Publique. A Vercel cuida de build e hospedagem automaticamente.

## 7. Estrutura do projeto

```
src/
  app/
    layout.tsx              → layout raiz, fontes da marca e cabeçalho
    novo-orcamento/          → aba "Novo Orçamento"
    abrir-orcamento/         → aba "Abrir Orçamento" (busca + edição)
    api/analyze-project/     → rota que envia o projeto anexado para a IA
  components/
    Header.tsx               → navegação principal
    ClienteForm.tsx           → dados do cliente
    RegiaoSelector.tsx        → escolha de região (Araçatuba / São Paulo)
    UploadProjeto.tsx         → upload + análise por IA
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

## 8. Ajustando preços no futuro

Toda a tabela de preços e as regras de adicionais estão centralizadas em **`src/lib/pricing.ts`**
(`TABELA_PRECOS` e `ADICIONAIS`). Para reajustar valores, altere apenas esse arquivo — nenhuma outra
parte do sistema precisa mudar.

## 9. Observação sobre o build neste ambiente

Ao gerar este projeto, o build de produção (`next build`) não pôde ser concluído neste ambiente
porque o download das fontes Afacad/Josefin Sans do Google Fonts foi bloqueado pela rede sandbox
(sem acesso a `fonts.googleapis.com`). O código foi validado com `tsc --noEmit` sem nenhum erro de
tipo. Ao rodar `npm install && npm run dev` (ou `next build`) em um ambiente com acesso normal à
internet — sua máquina, ou a Vercel — as fontes serão baixadas normalmente e tudo funcionará sem
ajustes adicionais.

## 10. Próximos passos sugeridos

- Adicionar autenticação de usuários (login da equipe de vendas) usando o Supabase Auth.
- Permitir editar o logotipo/rodapé do PDF direto pela interface, sem mexer no código.
- Adicionar campo de status (rascunho / finalizado / cancelado) visível na tela "Abrir Orçamento".
- Guardar um histórico de versões de cada orçamento, caso o cliente peça alterações.
