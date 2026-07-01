"use client";

import OrcamentoForm from "@/components/OrcamentoForm";

export default function NovoOrcamentoPage() {
  return (
    <OrcamentoForm
      titulo="Novo orçamento"
      subtitulo="Preencha os dados do cliente, anexe o projeto (opcional) e monte os itens por ambiente."
    />
  );
}
