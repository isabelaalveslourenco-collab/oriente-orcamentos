import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import OrcamentoPDF from "@/components/OrcamentoPDF";
import { Orcamento } from "./types";

// Suporte ao seletor de pasta nativo (Chrome/Edge). Em navegadores sem
// suporte (Firefox/Safari) cai automaticamente para o download tradicional.
interface FileSystemWritableStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}
interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableStream>;
}
declare global {
  interface Window {
    showSaveFilePicker?: (options: {
      suggestedName: string;
      types?: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<FileSystemFileHandle>;
  }
}

function sanitizarNomeArquivo(nome: string): string {
  return nome.replace(/[\\/:*?"<>|]/g, "").trim();
}

function montarNomeArquivo(orcamento: Orcamento): string {
  const dataBase = orcamento.createdAt ? new Date(orcamento.createdAt) : new Date();
  const dataFormatada = dataBase.toLocaleDateString("pt-BR").replace(/\//g, "-");
  const nomeCliente = `${orcamento.cliente.nome} ${orcamento.cliente.sobrenome}`.trim();
  return sanitizarNomeArquivo(
    `ORÇAMENTO Oriente Móveis - Cliente ${nomeCliente} - ${dataFormatada}.pdf`
  );
}

// Retorna false quando o usuário cancelou o seletor de pasta (não é um erro).
export async function exportarOrcamentoPdf(orcamento: Orcamento): Promise<boolean> {
  const blob = await pdf(createElement(OrcamentoPDF, { orcamento }) as any).toBlob();
  const nomeArquivo = montarNomeArquivo(orcamento);

  if (typeof window !== "undefined" && window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: nomeArquivo,
        types: [{ description: "Documento PDF", accept: { "application/pdf": [".pdf"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (e: any) {
      // Usuário cancelou o seletor de pasta: não é um erro, apenas não exporta.
      if (e?.name === "AbortError") return false;
      // Qualquer outro problema com a API nativa: cai para o download tradicional.
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
