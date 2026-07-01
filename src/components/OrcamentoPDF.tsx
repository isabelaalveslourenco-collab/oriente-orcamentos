import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Orcamento } from "@/lib/types";
import { TABELA_PRECOS } from "@/lib/pricing";
import { calcularSubtotalAmbiente, calcularTotalOrcamento, formatarMoeda } from "@/lib/pricing";

const CORES = {
  vermelho: "#C1121F",
  cinza: "#3F3F3F",
  cinzaClaro: "#8A8A8A",
  branco: "#FFFFFF",
  fundo: "#F7F7F7",
  borda: "#E5E5E5"
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9.5,
    color: CORES.cinza,
    fontFamily: "Helvetica"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: CORES.vermelho,
    paddingBottom: 12,
    marginBottom: 16
  },
  logoImagem: { width: 130, height: undefined },
  numeroOrcamento: { fontSize: 10, color: CORES.cinzaClaro, textAlign: "right" },
  numeroOrcamentoValor: { fontSize: 13, color: CORES.vermelho, fontWeight: 700, textAlign: "right" },

  clienteBox: {
    backgroundColor: CORES.fundo,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  clienteCol: { flexDirection: "column", gap: 2 },
  label: { fontSize: 7.5, color: CORES.cinzaClaro, textTransform: "uppercase", letterSpacing: 0.5 },
  valor: { fontSize: 10, color: CORES.cinza, marginBottom: 4 },

  ambienteTitulo: {
    backgroundColor: CORES.cinza,
    color: CORES.branco,
    fontSize: 10,
    fontWeight: 700,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 10,
    borderRadius: 4
  },
  tabelaHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4
  },
  tabelaRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: CORES.borda,
    paddingVertical: 5,
    paddingHorizontal: 8
  },
  colDescricao: { width: "52%" },
  colAdicionais: { width: "26%" },
  colValor: { width: "22%", textAlign: "right" },
  headerCell: { fontSize: 7.5, color: CORES.cinzaClaro, textTransform: "uppercase" },
  itemDescricao: { fontSize: 9, color: CORES.cinza, fontWeight: 700 },
  itemDetalhe: { fontSize: 7.5, color: CORES.cinzaClaro, marginTop: 1 },

  subtotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  subtotalTexto: { fontSize: 8.5, color: CORES.cinzaClaro },
  subtotalValor: { fontSize: 9.5, color: CORES.cinza, fontWeight: 700, marginLeft: 6 },

  totalBox: {
    marginTop: 18,
    backgroundColor: CORES.vermelho,
    borderRadius: 6,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  totalLabel: { fontSize: 10, color: CORES.branco },
  totalValor: { fontSize: 18, color: CORES.branco, fontWeight: 700 },

  condicoesBox: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },
  condicaoCard: {
    flex: 1,
    backgroundColor: CORES.fundo,
    borderRadius: 6,
    padding: 10
  },
  condicaoTitulo: {
    fontSize: 8,
    color: CORES.cinzaClaro,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3
  },
  condicaoTexto: { fontSize: 9.5, color: CORES.cinza, lineHeight: 1.4 },

  observacoes: {
    marginTop: 14,
    fontSize: 8.5,
    color: CORES.cinzaClaro,
    lineHeight: 1.4
  },

  especificacaoTecnica: {
    marginTop: 12,
    fontSize: 8,
    color: CORES.cinzaClaro,
    fontStyle: "italic"
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  footerText: { fontSize: 7.5, color: CORES.cinzaClaro }
});

function descricaoAdicionais(item: Orcamento["ambientes"][number]["itens"][number]): string {
  const partes: string[] = [];
  if (item.portasEspelhoQtd > 0) partes.push(`${item.portasEspelhoQtd}x porta espelho`);
  if (item.ledMetros > 0) partes.push(`LED ${item.ledMetros}m`);
  if (item.tapecaria) partes.push("Tapeçaria");
  if (item.serralheriaValor > 0) partes.push("Serralheria");
  return partes.length > 0 ? partes.join(" · ") : "—";
}

export default function OrcamentoPDF({ orcamento }: { orcamento: Orcamento }) {
  const total = calcularTotalOrcamento(orcamento.ambientes, orcamento.desconto);
  const hoje = new Date();
  const dataEmissao = hoje.toLocaleDateString("pt-BR");

  const dataValidade = new Date(hoje);
  dataValidade.setDate(dataValidade.getDate() + 15);
  const dataValidadeFormatada = dataValidade.toLocaleDateString("pt-BR");

  const valorEntrada = Number((total * 0.4).toFixed(2));
  const valorSaldo = Number((total - valorEntrada).toFixed(2));
  const valorParcela = Number((valorSaldo / 3).toFixed(2));

  return (
    <Document title={`Orcamento-OrienteMoveis-${orcamento.numero || ""}`}>
      <Page size="A4" style={styles.page} wrap>
        {/* Cabeçalho */}
        <View style={styles.headerRow}>
          <Image src="/logo-oriente-full.png" style={styles.logoImagem} />
          <View>
            <Text style={styles.numeroOrcamento}>Orçamento</Text>
            <Text style={styles.numeroOrcamentoValor}>
              #{String(orcamento.numero || 0).padStart(4, "0")}
            </Text>
            <Text style={styles.numeroOrcamento}>{dataEmissao}</Text>
          </View>
        </View>

        {/* Dados do cliente */}
        <View style={styles.clienteBox}>
          <View style={styles.clienteCol}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.valor}>
              {orcamento.cliente.nome} {orcamento.cliente.sobrenome}
            </Text>
            <Text style={styles.label}>Endereço</Text>
            <Text style={styles.valor}>{orcamento.cliente.endereco || "—"}</Text>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.valor}>{orcamento.cliente.telefone || "—"}</Text>
          </View>
          <View style={styles.clienteCol}>
            <Text style={styles.label}>Região</Text>
            <Text style={styles.valor}>
              {orcamento.regiao === "aracatuba" ? "Araçatuba e Região" : "São Paulo e Região"}
            </Text>
            <Text style={styles.label}>Arquiteto(a) responsável</Text>
            <Text style={styles.valor}>
              {orcamento.possuiArquiteto
                ? `${orcamento.nomeArquiteto || "—"}${orcamento.telefoneArquiteto ? " · " + orcamento.telefoneArquiteto : ""}`
                : "Não possui"}
            </Text>
          </View>
        </View>

        {/* Ambientes e itens */}
        {orcamento.ambientes.map((ambiente) => (
          <View key={ambiente.id} wrap={false}>
            <Text style={styles.ambienteTitulo}>{ambiente.nome || "Ambiente"}</Text>

            <View style={styles.tabelaHeader}>
              <Text style={[styles.headerCell, styles.colDescricao]}>Item</Text>
              <Text style={[styles.headerCell, styles.colAdicionais]}>Adicionais</Text>
              <Text style={[styles.headerCell, styles.colValor]}>Valor</Text>
            </View>

            {ambiente.itens.map((item) => (
              <View key={item.id} style={styles.tabelaRow}>
                <View style={styles.colDescricao}>
                  <Text style={styles.itemDescricao}>{item.descricao || "Item"}</Text>
                  <Text style={styles.itemDetalhe}>
                    {TABELA_PRECOS[orcamento.regiao][item.tipoAcabamento].label}
                  </Text>
                </View>
                <Text style={[styles.colAdicionais, { fontSize: 8 }]}>{descricaoAdicionais(item)}</Text>
                <Text style={[styles.colValor, { fontSize: 9, fontWeight: 700 }]}>
                  {formatarMoeda(item.valorTotal)}
                </Text>
              </View>
            ))}

            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalTexto}>Subtotal {ambiente.nome}</Text>
              <Text style={styles.subtotalValor}>
                {formatarMoeda(calcularSubtotalAmbiente(ambiente))}
              </Text>
            </View>
          </View>
        ))}

        {/* Desconto e total */}
        {orcamento.desconto > 0 && (
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalTexto}>Desconto</Text>
            <Text style={[styles.subtotalValor, { color: CORES.vermelho }]}>
              - {formatarMoeda(orcamento.desconto)}
            </Text>
          </View>
        )}

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Valor total do orçamento</Text>
          <Text style={styles.totalValor}>{formatarMoeda(total)}</Text>
        </View>

        {/* Condições de pagamento, prazo e validade */}
        <View style={styles.condicoesBox}>
          <View style={styles.condicaoCard}>
            <Text style={styles.condicaoTitulo}>Condições de pagamento</Text>
            <Text style={styles.condicaoTexto}>
              Entrada de 40% ({formatarMoeda(valorEntrada)}) + saldo em 3x de {formatarMoeda(valorParcela)}
            </Text>
          </View>
          <View style={styles.condicaoCard}>
            <Text style={styles.condicaoTitulo}>Entrega e instalação</Text>
            <Text style={styles.condicaoTexto}>{orcamento.prazoEntrega || "A combinar"}</Text>
          </View>
          <View style={styles.condicaoCard}>
            <Text style={styles.condicaoTitulo}>Validade do orçamento</Text>
            <Text style={styles.condicaoTexto}>
              15 dias — válido até {dataValidadeFormatada}
            </Text>
          </View>
        </View>

        <Text style={styles.especificacaoTecnica}>
          * Todas as dobradiças utilizadas nos móveis planejados são com amortecedor (fecho suave).
        </Text>

        {orcamento.observacoes ? (
          <View style={styles.observacoes}>
            <Text style={styles.label}>Observações</Text>
            <Text>{orcamento.observacoes}</Text>
          </View>
        ) : null}

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Oriente Móveis · Móveis planejados de alta qualidade · Há mais de 20 anos no mercado
          </Text>
          <Text style={styles.footerText}>(18) 3631-4705 · www.orientemoveis.com.br</Text>
        </View>
      </Page>
    </Document>
  );
}
