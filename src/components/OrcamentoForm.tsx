"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ClienteForm from "@/components/ClienteForm";
import RegiaoSelector from "@/components/RegiaoSelector";
import PrazoEntregaSelector from "@/components/PrazoEntregaSelector";
import FormaPagamentoSelector from "@/components/FormaPagamentoSelector";
import ArquitetoForm from "@/components/ArquitetoForm";
import IndicacaoForm from "@/components/IndicacaoForm";
import UploadProjeto from "@/components/UploadProjeto";
import AmbienteCard from "@/components/AmbienteCard";
import ResumoOrcamento from "@/components/ResumoOrcamento";
import { Ambiente, AnaliseIAResultado, Cliente, ItemOrcamento, Orcamento, Regiao } from "@/lib/types";
import { PRAZO_ENTREGA_PADRAO, FORMA_PAGAMENTO_PADRAO, calcularItem } from "@/lib/pricing";
import { enviarArquivoProjeto, salvarOrcamento } from "@/lib/orcamentosApi";
import { exportarOrcamentoPdf } from "@/lib/pdfExport";

const CLIENTE_VAZIO: Cliente = { nome: "", sobrenome: "", endereco: "", telefone: "" };

interface Props {
  orcamentoInicial?: Orcamento;
  titulo: string;
  subtitulo: string;
}

export default function OrcamentoForm({ orcamentoInicial, titulo, subtitulo }: Props) {
  const [orcamentoId, setOrcamentoId] = useState<string | undefined>(orcamentoInicial?.id);
  const [numero, setNumero] = useState<number | undefined>(orcamentoInicial?.numero);
  const [cliente, setCliente] = useState<Cliente>(orcamentoInicial?.cliente || CLIENTE_VAZIO);
  const [regiao, setRegiao] = useState<Regiao>(orcamentoInicial?.regiao || "aracatuba");
  const [ambientes, setAmbientes] = useState<Ambiente[]>(orcamentoInicial?.ambientes || []);
  const [desconto, setDesconto] = useState(orcamentoInicial?.desconto || 0);
 const [prazoEntrega, setPrazoEntrega] = useState(orcamentoInicial?.prazoEntrega || PRAZO_ENTREGA_PADRAO);
  const [formaPagamento, setFormaPagamento] = useState(
    orcamentoInicial?.formaPagamento || FORMA_PAGAMENTO_PADRAO
  );
  const [possuiArquiteto, setPossuiArquiteto] = useState(orcamentoInicial?.possuiArquiteto || false);
  const [nomeArquiteto, setNomeArquiteto] = useState(orcamentoInicial?.nomeArquiteto || "");
  const [telefoneArquiteto, setTelefoneArquiteto] = useState(orcamentoInicial?.telefoneArquiteto || "");
   const [comissaoRT, setComissaoRT] = useState(orcamentoInicial?.comissaoRT || 0);
  const [nomeIndicacao, setNomeIndicacao] = useState(orcamentoInicial?.nomeIndicacao || "");
  const [comissaoIndicacao, setComissaoIndicacao] = useState(orcamentoInicial?.comissaoIndicacao || 0);
  const [observacoes, setObservacoes] = useState(orcamentoInicial?.observacoes || "");
  const [arquivoProjeto, setArquivoProjeto] = useState<File | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  // Soma RT (arquiteto) + comissão de indicação — ambas embutidas no preço final,
  // mas só o nome do arquiteto aparece no PDF.
  const comissaoTotal = comissaoRT + comissaoIndicacao;

  function adicionarAmbiente() {
    setAmbientes((prev) => [...prev, { id: uuidv4(), nome: "Novo ambiente", itens: [] }]);
  }

  function atualizarAmbiente(atualizado: Ambiente) {
    setAmbientes((prev) => prev.map((a) => (a.id === atualizado.id ? atualizado : a)));
  }

  function removerAmbiente(id: string) {
    setAmbientes((prev) => prev.filter((a) => a.id !== id));
  }

  function aplicarAnaliseIA(resultado: AnaliseIAResultado) {
    const novosAmbientes: Ambiente[] = resultado.ambientes.map((amb) => ({
      id: uuidv4(),
      nome: amb.nome,
      itens: amb.itens.map((item): ItemOrcamento =>
        calcularItem(
          {
            id: uuidv4(),
            ambienteNome: amb.nome,
            descricao: item.descricao,
            tipoAcabamento: item.tipoAcabamentoSugerido,
            larguraM: item.larguraM,
            alturaM: item.alturaM,
            portasEspelhoQtd: 0,
            ledMetros: 0,
        tapecaria: false,
            serralheriaValor: 0,
            palhaSinteticaValor: 0,
            palhaNaturalValor: 0
          },
          regiao,
        comissaoTotal
        )
      )
    }));

    setAmbientes((prev) => [...prev, ...novosAmbientes]);
    setMensagem({
      tipo: "sucesso",
      texto: `IA identificou ${novosAmbientes.length} ambiente(s). Revise as medidas e acabamentos antes de finalizar.`
    });
  }

  function validarAntesDesalvar(): string | null {
    if (!cliente.nome.trim() || !cliente.sobrenome.trim()) {
      return "Preencha nome e sobrenome do cliente.";
    }
    if (ambientes.length === 0) {
      return "Adicione ao menos um ambiente com itens antes de salvar.";
    }
    return null;
  }

  function montarOrcamento(): Orcamento {
    return {
      id: orcamentoId,
      numero,
      cliente,
      regiao,
      status: "finalizado",
      observacoes,
      desconto,
   prazoEntrega,
      formaPagamento,
      possuiArquiteto,
      nomeArquiteto: possuiArquiteto ? nomeArquiteto : "",
      telefoneArquiteto: possuiArquiteto ? telefoneArquiteto : "",
    comissaoRT: possuiArquiteto ? comissaoRT : 0,
      nomeIndicacao,
      comissaoIndicacao,
      ambientes,
      valorTotal: 0
    };
  }

  async function salvarComArquivo(): Promise<Orcamento> {
    let arquivoProjetoUrl = orcamentoInicial?.arquivoProjetoUrl;
    if (arquivoProjeto) {
      arquivoProjetoUrl = await enviarArquivoProjeto(arquivoProjeto);
    }
    const orcamento = { ...montarOrcamento(), arquivoProjetoUrl };
    const resultado = await salvarOrcamento(orcamento);
    setOrcamentoId(resultado.id);
    setNumero(resultado.numero);
    return { ...orcamento, id: resultado.id, numero: resultado.numero };
  }

  async function handleSalvar() {
    const erro = validarAntesDesalvar();
    if (erro) {
      setMensagem({ tipo: "erro", texto: erro });
      return;
    }
    setSalvando(true);
    setMensagem(null);
    try {
      const salvo = await salvarComArquivo();
      setMensagem({ tipo: "sucesso", texto: `Orçamento #${salvo.numero} salvo com sucesso.` });
    } catch (e: any) {
      setMensagem({ tipo: "erro", texto: e.message || "Erro ao salvar o orçamento." });
    } finally {
      setSalvando(false);
    }
  }

  async function handleExportarPdf() {
    const erro = validarAntesDesalvar();
    if (erro) {
      setMensagem({ tipo: "erro", texto: erro });
      return;
    }
    setExportando(true);
    setMensagem(null);
    try {
      const salvo = await salvarComArquivo();
      await exportarOrcamentoPdf(salvo);
      setMensagem({ tipo: "sucesso", texto: `Orçamento #${salvo.numero} salvo e PDF exportado.` });
    } catch (e: any) {
      setMensagem({ tipo: "erro", texto: e.message || "Erro ao exportar o PDF." });
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="font-secundaria text-2xl md:text-3xl text-oriente-gray mb-1">
            {titulo}
            {numero ? (
              <span className="text-oriente-red"> · #{String(numero).padStart(4, "0")}</span>
            ) : null}
          </h1>
          <p className="text-sm text-oriente-gray-light">{subtitulo}</p>
        </div>

        {mensagem && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              mensagem.tipo === "sucesso"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-oriente-red/5 text-oriente-red border border-oriente-red/20"
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <ClienteForm cliente={cliente} onChange={setCliente} />
        <RegiaoSelector regiao={regiao} onChange={setRegiao} />
        <PrazoEntregaSelector prazoEntrega={prazoEntrega} onChange={setPrazoEntrega} />
        <FormaPagamentoSelector formaPagamento={formaPagamento} onChange={setFormaPagamento} />
        <ArquitetoForm
          possuiArquiteto={possuiArquiteto}
          nomeArquiteto={nomeArquiteto}
          telefoneArquiteto={telefoneArquiteto}
          comissaoRT={comissaoRT}
          onChangePossui={setPossuiArquiteto}
          onChangeNome={setNomeArquiteto}
          onChangeTelefone={setTelefoneArquiteto}
     onChangeComissaoRT={setComissaoRT}
        />
        <IndicacaoForm
          nomeIndicacao={nomeIndicacao}
          comissaoIndicacao={comissaoIndicacao}
          onChangeNome={setNomeIndicacao}
          onChangeComissao={setComissaoIndicacao}
        />
        <UploadProjeto onAnalise={aplicarAnaliseIA} onArquivoSelecionado={setArquivoProjeto} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-secundaria text-lg text-oriente-gray">Ambientes e itens</h2>
            <button type="button" onClick={adicionarAmbiente} className="btn-secondary">
              + Adicionar ambiente
            </button>
          </div>

          {ambientes.length === 0 && (
            <div className="card text-center py-10">
              <p className="text-sm text-oriente-gray-light">
                Nenhum ambiente ainda. Adicione manualmente ou anexe um projeto para a IA preencher
                automaticamente.
              </p>
            </div>
          )}

          {ambientes.map((ambiente) => (
            <AmbienteCard
              key={ambiente.id}
              ambiente={ambiente}
              regiao={regiao}
              comissaoRT={comissaoTotal}
              onChange={atualizarAmbiente}
              onRemover={() => removerAmbiente(ambiente.id)}
            />
          ))}
        </div>
      </div>

      <ResumoOrcamento
        ambientes={ambientes}
        desconto={desconto}
        onDescontoChange={setDesconto}
        observacoes={observacoes}
        onObservacoesChange={setObservacoes}
        salvando={salvando}
        exportando={exportando}
        onSalvar={handleSalvar}
        onExportarPdf={handleExportarPdf}
      />
    </div>
  );
}
