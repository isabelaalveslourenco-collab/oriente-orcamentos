"use client";

import { COMISSAO_RT_OPCOES } from "@/lib/pricing";

interface Props {
  nomeIndicacao: string;
  comissaoIndicacao: number;
  onChangeNome: (valor: string) => void;
  onChangeComissao: (valor: number) => void;
}

export default function IndicacaoForm({
  nomeIndicacao,
  comissaoIndicacao,
  onChangeNome,
  onChangeComissao
}: Props) {
  return (
    <section className="card">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-1">Indicação (uso interno)</h2>
      <p className="text-sm text-oriente-gray-light mb-4">
        Se alguém indicou esse cliente/projeto e recebe comissão por isso, preencha aqui.
        Esse nome e percentual são só para controle interno — nunca aparecem no PDF do cliente.
      </p>

      <div className="space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-oriente-gray-light">Nome de quem indicou</span>
          <input
            className="input"
            value={nomeIndicacao}
            onChange={(e) => onChangeNome(e.target.value)}
            placeholder="Ex: João Silva"
          />
        </label>

        <div>
          <span className="text-sm text-oriente-gray-light block mb-2">Comissão da indicação</span>
          <div className="flex flex-wrap gap-2">
            {COMISSAO_RT_OPCOES.map((opcao) => {
              const ativo = comissaoIndicacao === opcao.value;
              return (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => onChangeComissao(opcao.value)}
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
          <p className="text-xs text-oriente-gray-light mt-2">
            Esse percentual é embutido no valor dos itens, igual ao RT — mas o nome e o
            percentual nunca aparecem no PDF enviado ao cliente, em nenhuma hipótese.
          </p>
        </div>
      </div>
    </section>
  );
}
