"use client";

import { useEffect, useState } from "react";
import OrcamentoForm from "@/components/OrcamentoForm";
import { OrcamentoResumo, buscarOrcamentos, carregarOrcamento, excluirOrcamento } from "@/lib/orcamentosApi";
import { REGIAO_LABEL, formatarMoeda } from "@/lib/pricing";
import { Orcamento, Regiao } from "@/lib/types";

export default function AbrirOrcamentoPage() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<OrcamentoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);
  const [carregandoOrcamento, setCarregandoOrcamento] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  async function buscar(termoAtual: string) {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await buscarOrcamentos(termoAtual);
      setResultados(dados);
    } catch (e: any) {
      setErro(e.message || "Não foi possível carregar os orçamentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscar("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrir(id: string) {
    setCarregandoOrcamento(true);
    setErro(null);
    try {
      const orcamento = await carregarOrcamento(id);
      setOrcamentoSelecionado(orcamento);
    } catch (e: any) {
      setErro(e.message || "Não foi possível abrir este orçamento.");
    } finally {
      setCarregandoOrcamento(false);
    }
  }

  async function handleExcluir(id: string) {
    setExcluindoId(id);
    try {
      await excluirOrcamento(id);
      setResultados((prev) => prev.filter((r) => r.id !== id));
      setConfirmandoId(null);
    } catch (e: any) {
      setErro(e.message || "Não foi possível excluir este orçamento.");
    } finally {
      setExcluindoId(null);
    }
  }

  if (orcamentoSelecionado) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOrcamentoSelecionado(null)}
          className="btn-ghost mb-4 -ml-2"
        >
          ← Voltar para a busca
        </button>
        <OrcamentoForm
          orcamentoInicial={orcamentoSelecionado}
          titulo="Editar orçamento"
          subtitulo="Ajuste os dados, itens ou valores e salve novamente ou exporte o PDF atualizado."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-secundaria text-2xl md:text-3xl text-oriente-gray mb-1">Abrir orçamento</h1>
        <p className="text-sm text-oriente-gray-light">
          Busque por nome do cliente ou número do orçamento para visualizar ou editar.
        </p>
      </div>

      <div className="card">
        <input
          className="input"
          placeholder="Buscar por nome do cliente ou número (ex: Maria, 0012)"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            buscar(e.target.value);
          }}
        />
      </div>

      {erro && (
        <div className="rounded-xl px-4 py-3 text-sm bg-oriente-red/5 text-oriente-red border border-oriente-red/20">
          {erro}
        </div>
      )}

      {carregando || carregandoOrcamento ? (
        <div className="card text-center py-10 text-sm text-oriente-gray-light">Carregando…</div>
      ) : resultados.length === 0 ? (
        <div className="card text-center py-10 text-sm text-oriente-gray-light">
          Nenhum orçamento encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {resultados.map((orc) => (
            <div
              key={orc.id}
              className="card flex items-center justify-between gap-3 hover:shadow-card-hover transition-shadow"
            >
              <button
                type="button"
                onClick={() => abrir(orc.id)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="font-medium text-oriente-gray">
                  #{String(orc.numero).padStart(4, "0")} · {orc.clienteNome} {orc.clienteSobrenome}
                </div>
                <div className="text-xs text-oriente-gray-light mt-0.5">
                  {REGIAO_LABEL[orc.regiao as Regiao]} · {new Date(orc.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                  <StatusBadge status={orc.status} />
                </div>
              </button>

              <span className="text-oriente-red font-semibold flex-shrink-0">
                {formatarMoeda(orc.valorTotal)}
              </span>

              {confirmandoId === orc.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-oriente-gray-light">Excluir?</span>
                  <button
                    type="button"
                    onClick={() => handleExcluir(orc.id)}
                    disabled={excluindoId === orc.id}
                    className="text-xs font-medium text-white bg-oriente-red rounded-full px-3 py-1.5 hover:bg-oriente-red-dark disabled:opacity-50"
                  >
                    {excluindoId === orc.id ? "Excluindo…" : "Sim"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoId(null)}
                    className="text-xs font-medium text-oriente-gray rounded-full px-3 py-1.5 hover:bg-neutral-100"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoId(orc.id)}
                  className="flex-shrink-0 text-oriente-gray-light hover:text-oriente-red p-1.5 rounded-full hover:bg-oriente-red/10 transition-colors"
                  title="Excluir orçamento"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6h14z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    rascunho: "Rascunho",
    finalizado: "Finalizado",
    cancelado: "Cancelado"
  };
  return <span>{labels[status] || status}</span>;
}
