"use client";

import { FormaPagamento } from "@/lib/types";
import { FORMA_PAGAMENTO_OPCOES } from "@/lib/pricing";

interface Props {
  formaPagamento: FormaPagamento;
  onChange: (valor: FormaPagamento) => void;
}

export default function FormaPagamentoSelector({ formaPagamento, onChange }: Props) {
  return (
    <section className="card">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-1">Forma de pagamento</h2>
      <p className="text-sm text-oriente-gray-light mb-4">
        Essa condição aparece no PDF do orçamento para o cliente.
      </p>
      <div className="flex flex-wrap gap-2">
        {FORMA_PAGAMENTO_OPCOES.map((opcao) => {
          const ativo = formaPagamento === opcao.value;
          return (
            <button
              key={opcao.value}
              type="button"
              onClick={() => onChange(opcao.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-colors ${
                ativo
                  ? "border-oriente-red bg-oriente-red text-white"
                  : "border-neutral-200 text-oriente-gray hover:border-neutral-300"
              }`}
            >
              {opcao.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
