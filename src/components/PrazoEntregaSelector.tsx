"use client";

import { PRAZO_ENTREGA_OPCOES } from "@/lib/pricing";

interface Props {
  prazoEntrega: string;
  onChange: (valor: string) => void;
}

export default function PrazoEntregaSelector({ prazoEntrega, onChange }: Props) {
  return (
    <section className="card">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-1">Prazo de entrega e instalação</h2>
      <p className="text-sm text-oriente-gray-light mb-4">
        Esse prazo aparece no PDF do orçamento para o cliente.
      </p>
      <div className="flex flex-wrap gap-2">
        {PRAZO_ENTREGA_OPCOES.map((opcao) => {
          const ativo = prazoEntrega === opcao;
          return (
            <button
              key={opcao}
              type="button"
              onClick={() => onChange(opcao)}
              className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-colors ${
                ativo
                  ? "border-oriente-red bg-oriente-red text-white"
                  : "border-neutral-200 text-oriente-gray hover:border-neutral-300"
              }`}
            >
              {opcao}
            </button>
          );
        })}
      </div>
    </section>
  );
}
