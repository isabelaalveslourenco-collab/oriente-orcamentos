import { supabase } from "./supabaseClient";
import { Ambiente, Cliente, ItemOrcamento, Orcamento, Regiao } from "./types";
import { PRAZO_ENTREGA_PADRAO, FORMA_PAGAMENTO_PADRAO, calcularTotalOrcamento } from "./pricing";

// =========================================================
// Salvar (criar ou atualizar) um orçamento completo, incluindo
// cliente, ambientes e itens. Feito em etapas simples para
// manter o código fácil de entender e depurar.
// =========================================================

export async function salvarOrcamento(orcamento: Orcamento): Promise<{ id: string; numero: number }> {
  // 1) Cliente: cria um novo registro sempre que não houver id
  //    (evita sobrescrever clientes existentes por engano).
  let clienteId = orcamento.cliente.id;
  if (!clienteId) {
    const { data: clienteData, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        nome: orcamento.cliente.nome,
        sobrenome: orcamento.cliente.sobrenome,
        endereco: orcamento.cliente.endereco,
        telefone: orcamento.cliente.telefone
      })
      .select("id")
      .single();

    if (clienteError) throw clienteError;
    clienteId = clienteData.id;
  } else {
    const { error: updateError } = await supabase
      .from("clientes")
      .update({
        nome: orcamento.cliente.nome,
        sobrenome: orcamento.cliente.sobrenome,
        endereco: orcamento.cliente.endereco,
        telefone: orcamento.cliente.telefone
      })
      .eq("id", clienteId);
    if (updateError) throw updateError;
  }

  const valorTotal = calcularTotalOrcamento(orcamento.ambientes, orcamento.desconto);

  // 2) Orçamento (cria se não existir, atualiza se já existir)
  let orcamentoId = orcamento.id;
  if (!orcamentoId) {
    const { data: orcData, error: orcError } = await supabase
      .from("orcamentos")
      .insert({
        cliente_id: clienteId,
        regiao: orcamento.regiao,
        status: orcamento.status,
        observacoes: orcamento.observacoes || null,
        desconto: orcamento.desconto || 0,
       prazo_entrega: orcamento.prazoEntrega,
        forma_pagamento: orcamento.formaPagamento,
      possui_arquiteto: orcamento.possuiArquiteto,
        nome_arquiteto: orcamento.nomeArquiteto || null,
        telefone_arquiteto: orcamento.telefoneArquiteto || null,
        comissao_rt: orcamento.comissaoRT || 0,
        nome_indicacao: orcamento.nomeIndicacao || null,
        comissao_indicacao: orcamento.comissaoIndicacao || 0,
        valor_total: valorTotal,
        arquivo_projeto_url: orcamento.arquivoProjetoUrl || null
      })
      .select("id, numero")
      .single();

    if (orcError) throw orcError;
    orcamentoId = orcData.id;
  } else {
    const { error: orcUpdateError } = await supabase
      .from("orcamentos")
      .update({
        cliente_id: clienteId,
        regiao: orcamento.regiao,
        status: orcamento.status,
        observacoes: orcamento.observacoes || null,
        desconto: orcamento.desconto || 0,
        prazo_entrega: orcamento.prazoEntrega,
       possui_arquiteto: orcamento.possuiArquiteto,
        nome_arquiteto: orcamento.nomeArquiteto || null,
        telefone_arquiteto: orcamento.telefoneArquiteto || null,
        comissao_rt: orcamento.comissaoRT || 0,
        nome_indicacao: orcamento.nomeIndicacao || null,
        comissao_indicacao: orcamento.comissaoIndicacao || 0,
        valor_total: valorTotal,
        arquivo_projeto_url: orcamento.arquivoProjetoUrl || null
      })
      .eq("id", orcamentoId);
    if (orcUpdateError) throw orcUpdateError;

    // Remove ambientes/itens antigos para regravar do zero (mais simples e seguro
    // do que tentar sincronizar item a item nesta primeira versão do sistema).
    const { data: ambientesAntigos } = await supabase
      .from("ambientes")
      .select("id")
      .eq("orcamento_id", orcamentoId);

    if (ambientesAntigos && ambientesAntigos.length > 0) {
      const idsAntigos = ambientesAntigos.map((a) => a.id);
      await supabase.from("itens").delete().in("ambiente_id", idsAntigos);
      await supabase.from("ambientes").delete().eq("orcamento_id", orcamentoId);
    }
  }

  // 3) Ambientes + itens
  for (let i = 0; i < orcamento.ambientes.length; i++) {
    const ambiente = orcamento.ambientes[i];
    const { data: ambienteData, error: ambienteError } = await supabase
      .from("ambientes")
      .insert({
        orcamento_id: orcamentoId,
        nome: ambiente.nome,
        ordem: i
      })
      .select("id")
      .single();

    if (ambienteError) throw ambienteError;

    if (ambiente.itens.length > 0) {
      const itensParaInserir = ambiente.itens.map((item, ordem) => ({
        ambiente_id: ambienteData.id,
        descricao: item.descricao,
        tipo_acabamento: item.tipoAcabamento,
        largura_m: item.larguraM,
        altura_m: item.alturaM,
        unidade_calculo: item.unidadeCalculo,
        medida_calculada: item.medidaCalculada,
        valor_unitario: item.valorUnitario,
        valor_base: item.valorBase,
        portas_espelho_qtd: item.portasEspelhoQtd,
        portas_espelho_valor: item.portasEspelhoValor,
        led_metros: item.ledMetros,
        led_valor: item.ledValor,
        tapecaria: item.tapecaria,
        tapecaria_valor: item.tapecariaValor,
       serralheria_valor: item.serralheriaValor,
        palha_sintetica_valor: item.palhaSinteticaValor,
        palha_natural_valor: item.palhaNaturalValor,
        valor_total: item.valorTotal,
        ordem
      }));

      const { error: itensError } = await supabase.from("itens").insert(itensParaInserir);
      if (itensError) throw itensError;
    }
  }

  const { data: numeroData } = await supabase
    .from("orcamentos")
    .select("numero")
    .eq("id", orcamentoId)
    .single();

  return { id: orcamentoId as string, numero: numeroData?.numero ?? 0 };
}

// =========================================================
// Buscar orçamentos (para a aba "Abrir Orçamento")
// =========================================================

export interface OrcamentoResumo {
  id: string;
  numero: number;
  clienteNome: string;
  clienteSobrenome: string;
  regiao: Regiao;
  status: string;
  valorTotal: number;
  createdAt: string;
}

export async function buscarOrcamentos(termo: string = ""): Promise<OrcamentoResumo[]> {
  let query = supabase
    .from("orcamentos")
    .select("id, numero, regiao, status, valor_total, created_at, clientes(nome, sobrenome)")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data, error } = await query;
  if (error) throw error;

  const resultados: OrcamentoResumo[] = (data || []).map((row: any) => ({
    id: row.id,
    numero: row.numero,
    clienteNome: row.clientes?.nome || "",
    clienteSobrenome: row.clientes?.sobrenome || "",
    regiao: row.regiao,
    status: row.status,
    valorTotal: Number(row.valor_total),
    createdAt: row.created_at
  }));

  if (!termo.trim()) return resultados;

  const termoBusca = termo.trim().toLowerCase();
  return resultados.filter(
    (r) =>
      r.clienteNome.toLowerCase().includes(termoBusca) ||
      r.clienteSobrenome.toLowerCase().includes(termoBusca) ||
      String(r.numero).includes(termoBusca)
  );
}

// =========================================================
// Carregar um orçamento completo por id (para edição/visualização)
// =========================================================

export async function carregarOrcamento(id: string): Promise<Orcamento> {
  const { data: orcData, error: orcError } = await supabase
    .from("orcamentos")
    .select("*, clientes(*)")
    .eq("id", id)
    .single();
  if (orcError) throw orcError;

  const { data: ambientesData, error: ambientesError } = await supabase
    .from("ambientes")
    .select("*, itens(*)")
    .eq("orcamento_id", id)
    .order("ordem", { ascending: true });
  if (ambientesError) throw ambientesError;

  const cliente: Cliente = {
    id: orcData.clientes.id,
    nome: orcData.clientes.nome,
    sobrenome: orcData.clientes.sobrenome,
    endereco: orcData.clientes.endereco,
    telefone: orcData.clientes.telefone
  };

  const ambientes: Ambiente[] = (ambientesData || []).map((amb: any) => ({
    id: amb.id,
    nome: amb.nome,
    itens: (amb.itens || [])
      .sort((a: any, b: any) => a.ordem - b.ordem)
      .map(
        (item: any): ItemOrcamento => ({
          id: item.id,
          ambienteNome: amb.nome,
          descricao: item.descricao,
          tipoAcabamento: item.tipo_acabamento,
          larguraM: Number(item.largura_m),
          alturaM: Number(item.altura_m),
          unidadeCalculo: item.unidade_calculo,
          medidaCalculada: Number(item.medida_calculada),
          valorUnitario: Number(item.valor_unitario),
          valorBase: Number(item.valor_base),
          portasEspelhoQtd: item.portas_espelho_qtd,
          portasEspelhoValor: Number(item.portas_espelho_valor),
          ledMetros: Number(item.led_metros),
          ledValor: Number(item.led_valor),
          tapecaria: item.tapecaria,
          tapecariaValor: Number(item.tapecaria_valor),
          serralheriaValor: Number(item.serralheria_valor),
          palhaSinteticaValor: Number(item.palha_sintetica_valor ?? 0),
          palhaNaturalValor: Number(item.palha_natural_valor ?? 0),
          valorTotal: Number(item.valor_total)
        })
      )
  }));

  return {
    id: orcData.id,
    numero: orcData.numero,
    cliente,
    regiao: orcData.regiao,
    status: orcData.status,
    observacoes: orcData.observacoes || "",
    desconto: Number(orcData.desconto),
   prazoEntrega: orcData.prazo_entrega || PRAZO_ENTREGA_PADRAO,
    formaPagamento: orcData.forma_pagamento || FORMA_PAGAMENTO_PADRAO,
    possuiArquiteto: !!orcData.possui_arquiteto,
    nomeArquiteto: orcData.nome_arquiteto || "",
    telefoneArquiteto: orcData.telefone_arquiteto || "",
     comissaoRT: Number(orcData.comissao_rt) || 0,
    nomeIndicacao: orcData.nome_indicacao || "",
    comissaoIndicacao: Number(orcData.comissao_indicacao) || 0,
    ambientes,
    arquivoProjetoUrl: orcData.arquivo_projeto_url || undefined,
    valorTotal: Number(orcData.valor_total),
    createdAt: orcData.created_at,
    updatedAt: orcData.updated_at
  };
}

// =========================================================
// Excluir um orçamento (e seus ambientes/itens, via cascade no banco)
// =========================================================

export async function excluirOrcamento(id: string): Promise<void> {
  const { error } = await supabase.from("orcamentos").delete().eq("id", id);
  if (error) throw error;
}

// =========================================================
// Upload do arquivo de projeto (PDF/imagem) para o Storage
// =========================================================

export async function enviarArquivoProjeto(file: File): Promise<string> {
  const nomeArquivo = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error } = await supabase.storage.from("projetos").upload(nomeArquivo, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;

  const { data } = supabase.storage.from("projetos").getPublicUrl(nomeArquivo);
  return data.publicUrl;
}
