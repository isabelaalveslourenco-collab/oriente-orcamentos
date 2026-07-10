"use client";

import { Ambiente } from "@/lib/types";
import { calcularSubtotalAmbiente, calcularTotalOrcamento, formatarMoeda } from "@/lib/pricing";

interface Props {
  ambientes: Ambiente[];
  desconto: number;
  onDescontoChange: (valor: number) => void;
  observacoes: string;
  onObservacoesChange: (valor: string) => void;
  salvando: boolean;
  exportando: boolean;
  onSalvar: () => void;
  onExportarPdf: () => void;
}

export default function ResumoOrcamento({
  ambientes,
  desconto,
  onDescontoChange,
  observacoes,
  onObservacoesChange,
  salvando,
  exportando,
  onSalvar,
  onExportarPdf
}: Props) {
  const totalItens = ambientes.reduce((soma, a) => soma + a.itens.length, 0);
  const total = calcularTotalOrcamento(ambientes, desconto);

  return (
    <aside className="card lg:sticky lg:top-24 h-fit">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-4">Resumo do orçamento</h2>

      <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
        {ambientes.length === 0 && (
          <p className="text-sm text-oriente-gray-light">Nenhum ambiente adicionado ainda.</p>
        )}
        {ambientes.map((amb) => (
          <div key={amb.id} className="flex justify-between text-sm">
            <span className="text-oriente-gray-light truncate pr-2">
              {amb.nome || "Ambiente sem nome"} ({amb.itens.length})
            </span>
            <span className="text-oriente-gray font-medium flex-shrink-0">
              {formatarMoeda(calcularSubtotalAmbiente(amb))}
            </span>
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 mb-3">
        <span className="text-xs text-oriente-gray-light">Desconto (R$)</span>
        <input
          type="number"
          min={0}
          className="input"
          value={desconto}
          onChange={(e) => onDescontoChange(parseFloat(e.target.value) || 0)}
        />
      </label>

      <label className="flex flex-col gap-1.5 mb-4">
        <span className="text-xs text-oriente-gray-light">Observações (aparecem no PDF)</span>
        <textarea
          className="input min-h-[72px] resize-none"
          value={observacoes}
          onChange={(e) => onObservacoesChange(e.target.value)}
          placeholder="Condições de pagamento, prazo de entrega, etc."
          spellCheck
          lang="pt-BR"
        />
      </label>

      <div className="border-t border-neutral-200 pt-4 mb-5">
        <div className="flex justify-between text-sm text-oriente-gray-light mb-1">
          <span>{totalItens} item(ns) em {ambientes.length} ambiente(s)</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-oriente-gray-light">Valor total</span>
          <span className="font-secundaria text-2xl text-oriente-red font-semibold">
            {formatarMoeda(total)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button type="button" onClick={onSalvar} disabled={salvando} className="btn-secondary w-full">
          {salvando ? "Salvando…" : "Salvar orçamento"}
        </button>
        <button
          type="button"
          onClick={onExportarPdf}
          disabled={exportando || ambientes.length === 0}
          className="btn-primary w-full"
        >
          {exportando ? "Gerando PDF…" : "Salvar e exportar PDF"}
        </button>
      </div>
    </aside>
  );
}
