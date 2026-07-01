"use client";

import { COMISSAO_RT_OPCOES } from "@/lib/pricing";

interface Props {
  possuiArquiteto: boolean;
  nomeArquiteto: string;
  telefoneArquiteto: string;
  comissaoRT: number;
  onChangePossui: (valor: boolean) => void;
  onChangeNome: (valor: string) => void;
  onChangeTelefone: (valor: string) => void;
  onChangeComissaoRT: (valor: number) => void;
}

export default function ArquitetoForm({
  possuiArquiteto,
  nomeArquiteto,
  telefoneArquiteto,
  comissaoRT,
  onChangePossui,
  onChangeNome,
  onChangeTelefone,
  onChangeComissaoRT
}: Props) {
  function selecionarPossui(valor: boolean) {
    onChangePossui(valor);
    if (!valor) {
      // Sem arquiteto, não faz sentido manter uma comissão selecionada
      onChangeComissaoRT(0);
    }
  }

  return (
    <section className="card">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-1">Arquiteto(a) responsável</h2>
      <p className="text-sm text-oriente-gray-light mb-4">
        O cliente possui um arquiteto(a) acompanhando o projeto?
      </p>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => selecionarPossui(true)}
          className={`rounded-full px-5 py-2 text-sm font-medium border-2 transition-colors ${
            possuiArquiteto
              ? "border-oriente-red bg-oriente-red text-white"
              : "border-neutral-200 text-oriente-gray hover:border-neutral-300"
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => selecionarPossui(false)}
          className={`rounded-full px-5 py-2 text-sm font-medium border-2 transition-colors ${
            !possuiArquiteto
              ? "border-oriente-red bg-oriente-red text-white"
              : "border-neutral-200 text-oriente-gray hover:border-neutral-300"
          }`}
        >
          Não
        </button>
      </div>

      {possuiArquiteto && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-oriente-gray-light">Nome do arquiteto(a)</span>
              <input
                className="input"
                value={nomeArquiteto}
                onChange={(e) => onChangeNome(e.target.value)}
                placeholder="Ex: Ana Souza"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-oriente-gray-light">Telefone do arquiteto(a)</span>
              <input
                className="input"
                value={telefoneArquiteto}
                onChange={(e) => onChangeTelefone(e.target.value)}
                placeholder="(18) 99999-9999"
              />
            </label>
          </div>

          <div>
            <span className="text-sm text-oriente-gray-light block mb-2">
              Comissão (RT · Reserva Técnica)
            </span>
            <div className="flex flex-wrap gap-2">
              {COMISSAO_RT_OPCOES.map((opcao) => {
                const ativo = comissaoRT === opcao.value;
                return (
                  <button
                    key={opcao.value}
                    type="button"
                    onClick={() => onChangeComissaoRT(opcao.value)}
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
              Esse percentual é embutido no valor dos itens e no total do orçamento — não aparece
              como uma linha separada no PDF enviado ao cliente.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
