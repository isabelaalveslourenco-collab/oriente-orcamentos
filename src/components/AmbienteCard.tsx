"use client";

import { v4 as uuidv4 } from "uuid";
import { Ambiente, ItemOrcamento, Regiao } from "@/lib/types";
import { calcularItem, calcularSubtotalAmbiente, formatarMoeda } from "@/lib/pricing";
import ItemRow from "./ItemRow";

interface Props {
  ambiente: Ambiente;
  regiao: Regiao;
  comissaoRT: number;
  onChange: (ambiente: Ambiente) => void;
  onRemover: () => void;
}

export default function AmbienteCard({ ambiente, regiao, comissaoRT, onChange, onRemover }: Props) {
  function adicionarItem() {
    const novoItem: ItemOrcamento = calcularItem(
      {
        id: uuidv4(),
        ambienteNome: ambiente.nome,
        descricao: "",
        tipoAcabamento: "branco_branco_telescopica",
        larguraM: 1,
        alturaM: 0.7,
        portasEspelhoQtd: 0,
        ledMetros: 0,
        tapecaria: false,
        serralheriaValor: 0,
        palhaSinteticaValor: 0,
        palhaNaturalValor: 0
      },
      regiao,
      comissaoRT
    );
    onChange({ ...ambiente, itens: [...ambiente.itens, novoItem] });
  }

  function atualizarItem(itemAtualizado: ItemOrcamento) {
    onChange({
      ...ambiente,
      itens: ambiente.itens.map((i) => (i.id === itemAtualizado.id ? itemAtualizado : i))
    });
  }

  function removerItem(id: string) {
    onChange({ ...ambiente, itens: ambiente.itens.filter((i) => i.id !== id) });
  }

  const subtotal = calcularSubtotalAmbiente(ambiente);

  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3 mb-4">
        <input
          className="font-secundaria text-lg text-oriente-gray bg-transparent outline-none border-b border-transparent focus:border-oriente-red flex-1 min-w-0"
          value={ambiente.nome}
          onChange={(e) => onChange({ ...ambiente, nome: e.target.value })}
          placeholder="Nome do ambiente (ex: Cozinha)"
        />
        <button
          type="button"
          onClick={onRemover}
          className="text-xs text-oriente-gray-light hover:text-oriente-red flex-shrink-0"
        >
          Remover ambiente
        </button>
      </div>

      <div className="space-y-2">
        {ambiente.itens.length === 0 && (
          <p className="text-sm text-oriente-gray-light py-3">
            Nenhum item ainda. Adicione um móvel manualmente ou use a leitura por IA.
          </p>
        )}
        {ambiente.itens.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            regiao={regiao}
            comissaoRT={comissaoRT}
            onChange={atualizarItem}
            onRemover={() => removerItem(item.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
        <button type="button" onClick={adicionarItem} className="btn-ghost">
          + Adicionar móvel
        </button>
        <span className="text-sm text-oriente-gray-light">
          Subtotal: <strong className="text-oriente-gray">{formatarMoeda(subtotal)}</strong>
        </span>
      </div>
    </section>
  );
}
