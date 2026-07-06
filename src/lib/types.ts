// =========================================================
// Tipos compartilhados do sistema de orçamentos
// =========================================================

export type Regiao = "aracatuba" | "sao_paulo";

export type TipoAcabamento =
  | "colorido_branco_telescopica"
  | "branco_branco_telescopica"
  | "colorido_branco_oculta"
  | "branco_branco_oculta"
  | "colorido_colorido_oculta"
  | "laqueado"
  | "cabeceira_mdf";

export interface Cliente {
  id?: string;
  nome: string;
  sobrenome: string;
  endereco: string;
  telefone: string;
}

export interface ItemOrcamento {
  id: string; // id local (uuid gerado no client) até salvar
  ambienteNome: string; // usado apenas para agrupamento visual ao criar
  descricao: string;
  tipoAcabamento: TipoAcabamento;
  larguraM: number;
  alturaM: number;
  unidadeCalculo: "linear" | "quadrado"; // derivado da altura, mas editável manualmente se preciso
  medidaCalculada: number; // metro linear (largura) ou m² (largura*altura)
  valorUnitario: number; // R$ por metro linear ou por m², já considerando região e faixa (se aplicável)
  valorBase: number; // medidaCalculada * valorUnitario

  // Adicionais
  portasEspelhoQtd: number;
  portasEspelhoValor: number;
  ledMetros: number;
  ledValor: number;
  tapecaria: boolean;
  tapecariaValor: number;
  serralheriaValor: number;
  palhaSinteticaValor: number;
  palhaNaturalValor: number;

  valorTotal: number; // valorBase + adicionais
}

export interface Ambiente {
  id: string;
  nome: string;
  itens: ItemOrcamento[];
}

export interface Orcamento {
  id?: string;
  numero?: number;
  cliente: Cliente;
  regiao: Regiao;
  status: "rascunho" | "finalizado" | "cancelado";
  observacoes?: string;
  desconto: number;
  prazoEntrega: string;
  possuiArquiteto: boolean;
  nomeArquiteto?: string;
  telefoneArquiteto?: string;
  comissaoRT: number; // percentual de RT (0, 3, 10 ou 13). Só relevante se possuiArquiteto = true.
  ambientes: Ambiente[];
  arquivoProjetoUrl?: string;
  valorTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

// Estrutura que a IA deve retornar ao analisar um projeto anexado
export interface AnaliseIAResultado {
  ambientes: {
    nome: string;
    itens: {
      descricao: string;
      tipoAcabamentoSugerido: TipoAcabamento;
      larguraM: number;
      alturaM: number;
      observacao?: string;
    }[];
  }[];
  resumo: string;
}
