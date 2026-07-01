import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import OrcamentoPDF from "@/components/OrcamentoPDF";
import { Orcamento } from "./types";

export async function exportarOrcamentoPdf(orcamento: Orcamento): Promise<void> {
  const blob = await pdf(createElement(OrcamentoPDF, { orcamento }) as any).toBlob();

  const nomeArquivo = `Orcamento-OrienteMoveis-${String(orcamento.numero || 0).padStart(4, "0")}-${orcamento.cliente.sobrenome || "cliente"}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
