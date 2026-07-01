import { ItemOrcamento, Regiao, TipoAcabamento, Ambiente } from "./types";

// =========================================================
// TABELA DE PREÇOS — regra de negócio oficial da Oriente Móveis
// Valores em Reais (R$). Onde há faixa (min/max), o sistema usa o
// mínimo como padrão e permite edição manual pelo usuário.
// =========================================================

interface FaixaPreco {
  label: string;
  valorMin: number;
  valorMax: number;
  editavel?: boolean; // true = usuário pode digitar livremente (ex: "a partir de")
}

type TabelaPrecos = Record<TipoAcabamento, FaixaPreco>;

export const TABELA_PRECOS: Record<Regiao, TabelaPrecos> = {
  aracatuba: {
    colorido_branco_telescopica: {
      label: "Externo MDF colorido, interno MDF branco, corrediça telescópica",
      valorMin: 1200,
      valorMax: 1200
    },
    branco_branco_telescopica: {
      label: "Externo MDF branco, interno MDF branco, corrediça telescópica",
      valorMin: 1000,
      valorMax: 1000
    },
    colorido_branco_oculta: {
      label: "Externo MDF colorido, interno MDF branco, corrediça oculta",
      valorMin: 1500,
      valorMax: 1500
    },
    branco_branco_oculta: {
      label: "Externo MDF branco, interno MDF branco, corrediça oculta",
      valorMin: 1200,
      valorMax: 1200
    },
    colorido_colorido_oculta: {
      label: "Externo MDF colorido, interno MDF colorido, corrediça oculta",
      valorMin: 2000,
      valorMax: 2000
    },
    laqueado: {
      label: "Móvel laqueado",
      valorMin: 1800,
      valorMax: 1800
    },
    cabeceira_mdf: {
      label: "Cabeceira em MDF padrão",
      valorMin: 2000,
      valorMax: 3000
    }
  },
  sao_paulo: {
    colorido_branco_telescopica: {
      label: "Externo MDF colorido, interno MDF branco, corrediça telescópica",
      valorMin: 1500,
      valorMax: 1500
    },
    branco_branco_telescopica: {
      label: "Externo MDF branco, interno MDF branco, corrediça telescópica",
      valorMin: 1300,
      valorMax: 1300
    },
    colorido_branco_oculta: {
      label: "Externo MDF colorido, interno MDF branco, corrediça oculta",
      valorMin: 1800,
      valorMax: 1800
    },
    branco_branco_oculta: {
      label: "Externo MDF branco, interno MDF branco, corrediça oculta",
      valorMin: 1500,
      valorMax: 1500
    },
    colorido_colorido_oculta: {
      label: "Externo MDF colorido, interno MDF colorido, corrediça oculta",
      valorMin: 2500,
      valorMax: 2500
    },
    laqueado: {
      label: "Móvel laqueado",
      valorMin: 2500,
      valorMax: 3000
    },
    cabeceira_mdf: {
      label: "Cabeceira em MDF padrão (a partir de)",
      valorMin: 4000,
      valorMax: 4000,
      editavel: true
    }
  }
};

// =========================================================
// ADICIONAIS por região
// =========================================================

interface AdicionaisConfig {
  portaEspelhoUnidade: number; // valor por porta
  ledPorMetro: number;
  tapecariaFixa: number | null; // null = valor 100% editável (sem base fixa)
  serralheriaEditavel: true; // sempre editável em ambas regiões
}

export const ADICIONAIS: Record<Regiao, AdicionaisConfig> = {
  aracatuba: {
    portaEspelhoUnidade: 700,
    ledPorMetro: 350,
    tapecariaFixa: null, // valor editável, sem base fixa
    serralheriaEditavel: true
  },
  sao_paulo: {
    portaEspelhoUnidade: 1000,
    ledPorMetro: 450,
    tapecariaFixa: null, // valor editável, sem base fixa em SP
    serralheriaEditavel: true
  }
};

export const REGIAO_LABEL: Record<Regiao, string> = {
  aracatuba: "Araçatuba e Região",
  sao_paulo: "São Paulo e Região"
};

export const PRAZO_ENTREGA_OPCOES: string[] = [
  "20 dias corridos",
  "30 dias corridos",
  "40 dias corridos",
  "45 dias corridos",
  "60 dias corridos",
  "90 dias corridos",
  "120 dias corridos"
];

export const PRAZO_ENTREGA_PADRAO = "30 dias corridos";

export interface OpcaoComissaoRT {
  value: number;
  label: string;
}

export const COMISSAO_RT_OPCOES: OpcaoComissaoRT[] = [
  { value: 0, label: "Sem comissão" },
  { value: 3, label: "3%" },
  { value: 10, label: "10%" },
  { value: 13, label: "13%" }
];

export const TIPO_ACABAMENTO_OPCOES: { value: TipoAcabamento; label: string }[] = [
  { value: "colorido_branco_telescopica", label: "Externo colorido / interno branco / corrediça telescópica" },
  { value: "branco_branco_telescopica", label: "Externo branco / interno branco / corrediça telescópica" },
  { value: "colorido_branco_oculta", label: "Externo colorido / interno branco / corrediça oculta" },
  { value: "branco_branco_oculta", label: "Externo branco / interno branco / corrediça oculta" },
  { value: "colorido_colorido_oculta", label: "Externo colorido / interno colorido / corrediça oculta" },
  { value: "laqueado", label: "Móvel laqueado" },
  { value: "cabeceira_mdf", label: "Cabeceira em MDF padrão" }
];

// =========================================================
// REGRA DE MEDIDA
// Altura < 1m  -> cobra por Metro Linear (usa a largura como medida)
// Altura >= 1m -> cobra por Metro Quadrado (largura x altura)
// =========================================================

export function definirUnidadeCalculo(alturaM: number): "linear" | "quadrado" {
  return alturaM < 1 ? "linear" : "quadrado";
}

export function calcularMedida(
  unidade: "linear" | "quadrado",
  larguraM: number,
  alturaM: number
): number {
  if (unidade === "linear") return Number(larguraM) || 0;
  return (Number(larguraM) || 0) * (Number(alturaM) || 0);
}

export function valorBasePorTipo(
  regiao: Regiao,
  tipo: TipoAcabamento,
  valorPersonalizado?: number
): number {
  const faixa = TABELA_PRECOS[regiao][tipo];
  if (valorPersonalizado !== undefined && valorPersonalizado !== null) return valorPersonalizado;
  return faixa.valorMin; // padrão: menor valor da faixa (usuário pode ajustar na tela)
}

// =========================================================
// CÁLCULO COMPLETO DE UM ITEM
// Recebe os dados de entrada (medidas, acabamento, adicionais) e
// devolve o item já com todos os valores calculados.
// =========================================================

export interface EntradaCalculoItem {
  id: string;
  ambienteNome: string;
  descricao: string;
  tipoAcabamento: TipoAcabamento;
  larguraM: number;
  alturaM: number;
  valorUnitarioPersonalizado?: number; // permite sobrescrever o valor da tabela (ex: laqueado/cabeceira)
  portasEspelhoQtd?: number;
  ledMetros?: number;
  tapecaria?: boolean;
  tapecariaValorPersonalizado?: number; // obrigatório em SP (editável)
  serralheriaValor?: number;
  palhaSinteticaValor?: number;
  palhaNaturalValor?: number;
}

export function calcularItem(
  entrada: EntradaCalculoItem,
  regiao: Regiao,
  percentualRT: number = 0
): ItemOrcamento {
  const unidadeCalculo = definirUnidadeCalculo(entrada.alturaM);
  const medidaCalculada = calcularMedida(unidadeCalculo, entrada.larguraM, entrada.alturaM);
  const valorUnitario = valorBasePorTipo(regiao, entrada.tipoAcabamento, entrada.valorUnitarioPersonalizado);
  const valorBase = Number((medidaCalculada * valorUnitario).toFixed(2));

  const adicionais = ADICIONAIS[regiao];

  const portasEspelhoQtd = entrada.portasEspelhoQtd || 0;
  const portasEspelhoValor = Number((portasEspelhoQtd * adicionais.portaEspelhoUnidade).toFixed(2));

  const ledMetros = entrada.ledMetros || 0;
  const ledValor = Number((ledMetros * adicionais.ledPorMetro).toFixed(2));

  const tapecaria = !!entrada.tapecaria;
  const tapecariaValor = tapecaria
    ? Number(
        (adicionais.tapecariaFixa !== null
          ? adicionais.tapecariaFixa
          : entrada.tapecariaValorPersonalizado || 0
        ).toFixed(2)
      )
    : 0;

  const serralheriaValor = Number((entrada.serralheriaValor || 0).toFixed(2));

  const palhaSinteticaValor = Number((entrada.palhaSinteticaValor || 0).toFixed(2));
  const palhaNaturalValor = Number((entrada.palhaNaturalValor || 0).toFixed(2));

  const subtotalSemComissao =
    valorBase + portasEspelhoValor + ledValor + tapecariaValor + serralheriaValor +
    palhaSinteticaValor + palhaNaturalValor;

  // A comissão de RT (reserva técnica do arquiteto) é distribuída proporcionalmente
  // dentro do próprio valor do item — não aparece como uma linha separada em lugar
  // nenhum, apenas eleva o valor final do item (e, por consequência, do orçamento).
  const multiplicadorRT = 1 + (percentualRT || 0) / 100;
  const valorTotal = Number((subtotalSemComissao * multiplicadorRT).toFixed(2));

  return {
    id: entrada.id,
    ambienteNome: entrada.ambienteNome,
    descricao: entrada.descricao,
    tipoAcabamento: entrada.tipoAcabamento,
    larguraM: entrada.larguraM,
    alturaM: entrada.alturaM,
    unidadeCalculo,
    medidaCalculada: Number(medidaCalculada.toFixed(3)),
    valorUnitario,
    valorBase,
    portasEspelhoQtd,
    portasEspelhoValor,
    ledMetros,
    ledValor,
    tapecaria,
    tapecariaValor,
    serralheriaValor,
    palhaSinteticaValor,
    palhaNaturalValor,
    valorTotal
  };
}

// =========================================================
// TOTAIS DO ORÇAMENTO
// =========================================================

export function calcularSubtotalAmbiente(ambiente: Ambiente): number {
  return Number(ambiente.itens.reduce((soma, item) => soma + item.valorTotal, 0).toFixed(2));
}

export function calcularTotalOrcamento(ambientes: Ambiente[], desconto: number = 0): number {
  const bruto = ambientes.reduce((soma, amb) => soma + calcularSubtotalAmbiente(amb), 0);
  return Number((bruto - (desconto || 0)).toFixed(2));
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
