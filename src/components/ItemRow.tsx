"use client";

import { useEffect, useState } from "react";
import { ItemOrcamento, Regiao, TipoAcabamento } from "@/lib/types";
import {
  ADICIONAIS,
  TABELA_PRECOS,
  TIPO_ACABAMENTO_OPCOES,
  calcularItem,
  formatarMoeda
} from "@/lib/pricing";

interface Props {
  item: ItemOrcamento;
  regiao: Regiao;
  comissaoRT: number;
  onChange: (item: ItemOrcamento) => void;
  onRemover: () => void;
}

export default function ItemRow({ item, regiao, comissaoRT, onChange, onRemover }: Props) {
  const [aberto, setAberto] = useState(false);
  const [serralheriaAtiva, setSerralheriaAtiva] = useState(item.serralheriaValor > 0);
  const [tapecariaAtiva, setTapecariaAtiva] = useState(item.tapecaria);
  const [palhaSinteticaAtiva, setPalhaSinteticaAtiva] = useState(item.palhaSinteticaValor > 0);
  const [palhaNaturalAtiva, setPalhaNaturalAtiva] = useState(item.palhaNaturalValor > 0);
  const faixa = TABELA_PRECOS[regiao][item.tipoAcabamento];
  const adicionaisRegiao = ADICIONAIS[regiao];
  const temPortaMimetizada = item.tipoAcabamento === "painel_revestimento_parede_porta_mimetizada";

  function recalcular(campos: Partial<{
    descricao: string;
    tipoAcabamento: TipoAcabamento;
    larguraM: number;
    alturaM: number;
    valorUnitarioPersonalizado: number;
    resetarValorUnitario: boolean;
    portasEspelhoQtd: number;
    ledMetros: number;
    tapecaria: boolean;
    tapecariaValorPersonalizado: number;
    serralheriaValor: number;
    palhaSinteticaValor: number;
    palhaNaturalValor: number;
    portasMimetizadasQtd: number;
    portasMimetizadasValorUnitario: number;
    mostrarAcabamentoPdf: boolean;
  }>) {
    const novoItem = calcularItem(
      {
        id: item.id,
        ambienteNome: item.ambienteNome,
        descricao: campos.descricao ?? item.descricao,
        tipoAcabamento: campos.tipoAcabamento ?? item.tipoAcabamento,
        larguraM: campos.larguraM ?? item.larguraM,
        alturaM: campos.alturaM ?? item.alturaM,
        valorUnitarioPersonalizado: campos.resetarValorUnitario
          ? undefined
          : campos.valorUnitarioPersonalizado ?? item.valorUnitario,
        portasEspelhoQtd: campos.portasEspelhoQtd ?? item.portasEspelhoQtd,
        ledMetros: campos.ledMetros ?? item.ledMetros,
        tapecaria: campos.tapecaria ?? item.tapecaria,
        tapecariaValorPersonalizado:
          campos.tapecariaValorPersonalizado ??
          (adicionaisRegiao.tapecariaFixa === null ? item.tapecariaValor : undefined),
        serralheriaValor: campos.serralheriaValor ?? item.serralheriaValor,
        palhaSinteticaValor: campos.palhaSinteticaValor ?? item.palhaSinteticaValor,
        palhaNaturalValor: campos.palhaNaturalValor ?? item.palhaNaturalValor,
        portasMimetizadasQtd: campos.portasMimetizadasQtd ?? item.portasMimetizadasQtd,
        portasMimetizadasValorUnitario:
          campos.portasMimetizadasValorUnitario ?? item.portasMimetizadasValorUnitario,
        mostrarAcabamentoPdf: campos.mostrarAcabamentoPdf ?? item.mostrarAcabamentoPdf
      },
      regiao,
      comissaoRT
    );
    onChange(novoItem);
  }

  // Recalcula automaticamente se a região ou a comissão de RT mudarem
  // (mantendo medidas e escolhas do usuário)
  useEffect(() => {
    recalcular({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regiao, comissaoRT]);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-oriente-gray truncate">
            {item.descricao || "Novo item"}
          </div>
          <div className="text-xs text-oriente-gray-light">
            {item.medidaCalculada.toFixed(2)} {item.unidadeCalculo === "linear" ? "m linear" : "m²"} ·{" "}
            {faixa.label}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-semibold text-oriente-red">{formatarMoeda(item.valorTotal)}</span>
          <ChevronIcon aberto={aberto} />
        </div>
      </button>

      {aberto && (
        <div className="p-4 space-y-4 border-t border-neutral-200">
          <Campo label="Descrição do móvel">
            <input
              className="input"
              value={item.descricao}
              onChange={(e) => recalcular({ descricao: e.target.value })}
              placeholder="Ex: Armário planejado do quarto"
              spellCheck
              lang="pt-BR"
            />
          </Campo>

          <Campo label="Tipo de acabamento">
            <select
              className="input"
              value={item.tipoAcabamento}
              onChange={(e) =>
                recalcular({
                  tipoAcabamento: e.target.value as TipoAcabamento,
                  resetarValorUnitario: true
                })
              }
            >
              {TIPO_ACABAMENTO_OPCOES.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </Campo>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.mostrarAcabamentoPdf}
              onChange={(e) => recalcular({ mostrarAcabamentoPdf: e.target.checked })}
              className="h-4 w-4 accent-oriente-red"
            />
            <span className="text-sm text-oriente-gray">Mostrar tipo de acabamento no PDF final</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Largura (m)">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input"
                value={item.larguraM}
                onChange={(e) => recalcular({ larguraM: parseFloat(e.target.value) || 0 })}
              />
            </Campo>
            <Campo label="Altura (m)">
              <input
                type="number"
                min={0}
                step={0.01}
                className="input"
                value={item.alturaM}
                onChange={(e) => recalcular({ alturaM: parseFloat(e.target.value) || 0 })}
              />
            </Campo>
          </div>

          <p className="text-xs text-oriente-gray-light bg-neutral-50 rounded-lg px-3 py-2">
            Regra automática: altura {"<"} 1m → cobrado por <strong>metro linear</strong> (usa a
            largura); altura ≥ 1m → cobrado por <strong>metro quadrado</strong> (largura × altura).
            Este item está sendo calculado por{" "}
            <strong>{item.unidadeCalculo === "linear" ? "metro linear" : "metro quadrado"}</strong>.
          </p>

          <Campo label={`Valor por ${item.unidadeCalculo === "linear" ? "metro linear" : "m²"} (R$)`}>
            <input
              type="number"
              min={0}
              step={10}
              className="input"
              value={item.valorUnitario}
              onChange={(e) => recalcular({ valorUnitarioPersonalizado: parseFloat(e.target.value) || 0 })}
            />
            {faixa.valorMin > 0 && (
              <span className="text-xs text-oriente-gray-light mt-1">
                Faixa sugerida: {formatarMoeda(faixa.valorMin)}
                {faixa.valorMax !== faixa.valorMin ? ` a ${formatarMoeda(faixa.valorMax)}` : ""}
              </span>
            )}
          </Campo>

          <div className="border-t border-dashed border-neutral-200 pt-4">
            <h4 className="text-sm font-medium text-oriente-gray mb-3">Adicionais</h4>

            <div className="grid grid-cols-2 gap-3">
              <Campo label={`Portas de espelho (${formatarMoeda(adicionaisRegiao.portaEspelhoUnidade)} cada)`}>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={item.portasEspelhoQtd}
                  onChange={(e) => recalcular({ portasEspelhoQtd: parseInt(e.target.value) || 0 })}
                />
              </Campo>

              <Campo label={`LED (${formatarMoeda(adicionaisRegiao.ledPorMetro)}/metro)`}>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="input"
                  value={item.ledMetros}
                  onChange={(e) => recalcular({ ledMetros: parseFloat(e.target.value) || 0 })}
                  placeholder="metros"
                />
              </Campo>
            </div>

            {temPortaMimetizada && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Campo label="Quantidade de portas mimetizadas">
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={item.portasMimetizadasQtd}
                    onChange={(e) => recalcular({ portasMimetizadasQtd: parseInt(e.target.value) || 0 })}
                  />
                </Campo>
                <Campo label="Valor por porta mimetizada (R$)">
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={item.portasMimetizadasValorUnitario}
                    onChange={(e) =>
                      recalcular({ portasMimetizadasValorUnitario: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0,00"
                  />
                </Campo>
              </div>
            )}

            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={tapecariaAtiva}
                onChange={(e) => {
                  const ativo = e.target.checked;
                  setTapecariaAtiva(ativo);
                  recalcular({ tapecaria: ativo, tapecariaValorPersonalizado: ativo ? item.tapecariaValor : 0 });
                }}
                className="h-4 w-4 accent-oriente-red"
              />
              <span className="text-sm text-oriente-gray">Tapeçaria</span>
            </label>

            {tapecariaAtiva && (
              <Campo label="Valor da tapeçaria (R$)">
                <input
                  type="number"
                  min={0}
                  className="input mt-2"
                  value={item.tapecariaValor}
                  onChange={(e) => recalcular({ tapecariaValorPersonalizado: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  autoFocus
                />
              </Campo>
            )}

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={serralheriaAtiva}
                onChange={(e) => {
                  const ativo = e.target.checked;
                  setSerralheriaAtiva(ativo);
                  if (!ativo) recalcular({ serralheriaValor: 0 });
                }}
                className="h-4 w-4 accent-oriente-red"
              />
              <span className="text-sm text-oriente-gray">Serralheria</span>
            </label>

            {serralheriaAtiva && (
              <Campo label="Valor da serralheria (R$)">
                <input
                  type="number"
                  min={0}
                  className="input mt-2"
                  value={item.serralheriaValor}
                  onChange={(e) => recalcular({ serralheriaValor: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  autoFocus
                />
              </Campo>
            )}

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={palhaSinteticaAtiva}
                onChange={(e) => {
                  const ativo = e.target.checked;
                  setPalhaSinteticaAtiva(ativo);
                  if (!ativo) recalcular({ palhaSinteticaValor: 0 });
                }}
                className="h-4 w-4 accent-oriente-red"
              />
              <span className="text-sm text-oriente-gray">Palha sintética</span>
            </label>

            {palhaSinteticaAtiva && (
              <Campo label="Valor da palha sintética (R$)">
                <input
                  type="number"
                  min={0}
                  className="input mt-2"
                  value={item.palhaSinteticaValor}
                  onChange={(e) => recalcular({ palhaSinteticaValor: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  autoFocus
                />
              </Campo>
            )}

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={palhaNaturalAtiva}
                onChange={(e) => {
                  const ativo = e.target.checked;
                  setPalhaNaturalAtiva(ativo);
                  if (!ativo) recalcular({ palhaNaturalValor: 0 });
                }}
                className="h-4 w-4 accent-oriente-red"
              />
              <span className="text-sm text-oriente-gray">Palha natural</span>
            </label>

            {palhaNaturalAtiva && (
              <Campo label="Valor da palha natural (R$)">
                <input
                  type="number"
                  min={0}
                  className="input mt-2"
                  value={item.palhaNaturalValor}
                  onChange={(e) => recalcular({ palhaNaturalValor: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  autoFocus
                />
              </Campo>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            <button type="button" onClick={onRemover} className="text-sm text-oriente-red hover:underline">
              Remover item
            </button>
            <span className="text-sm text-oriente-gray-light">
              Total do item: <strong className="text-oriente-gray">{formatarMoeda(item.valorTotal)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-oriente-gray-light">{label}</span>
      {children}
    </label>
  );
}

function ChevronIcon({ aberto }: { aberto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 text-oriente-gray-light transition-transform ${aberto ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
