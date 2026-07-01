"use client";

import { Regiao } from "@/lib/types";
import { REGIAO_LABEL } from "@/lib/pricing";

interface Props {
  regiao: Regiao;
  onChange: (regiao: Regiao) => void;
}

const OPCOES: Regiao[] = ["aracatuba", "sao_paulo"];

export default function RegiaoSelector({ regiao, onChange }: Props) {
  return (
    <section className="card">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-1">Região de atendimento</h2>
      <p className="text-sm text-oriente-gray-light mb-4">
        A tabela de preços é ajustada automaticamente conforme a região selecionada.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPCOES.map((op) => {
          const ativo = regiao === op;
          return (
            <button
              key={op}
              type="button"
              onClick={() => onChange(op)}
              className={`text-left rounded-xl border-2 px-4 py-3.5 transition-colors ${
                ativo
                  ? "border-oriente-red bg-oriente-red/5"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                    ativo ? "border-oriente-red bg-oriente-red" : "border-neutral-300"
                  }`}
                />
                <span className="font-medium text-oriente-gray">{REGIAO_LABEL[op]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
