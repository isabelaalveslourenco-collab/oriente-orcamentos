"use client";

import { Cliente } from "@/lib/types";

interface Props {
  cliente: Cliente;
  onChange: (cliente: Cliente) => void;
}

export default function ClienteForm({ cliente, onChange }: Props) {
  function atualizar(campo: keyof Cliente, valor: string) {
    onChange({ ...cliente, [campo]: valor });
  }

  return (
    <section className="bg-white rounded-2xl shadow-card p-5 md:p-6">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-4">Dados do cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Campo label="Nome" required>
          <input
            className="input"
            value={cliente.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Ex: Maria"
          />
        </Campo>
        <Campo label="Sobrenome" required>
          <input
            className="input"
            value={cliente.sobrenome}
            onChange={(e) => atualizar("sobrenome", e.target.value)}
            placeholder="Ex: Oliveira"
          />
        </Campo>
        <Campo label="Endereço">
          <input
            className="input"
            value={cliente.endereco}
            onChange={(e) => atualizar("endereco", e.target.value)}
            placeholder="Rua, número, bairro, cidade"
          />
        </Campo>
        <Campo label="Telefone">
          <input
            className="input"
            value={cliente.telefone}
            onChange={(e) => atualizar("telefone", e.target.value)}
            placeholder="(18) 99999-9999"
          />
        </Campo>
      </div>
    </section>
  );
}

function Campo({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-oriente-gray-light">
        {label} {required && <span className="text-oriente-red">*</span>}
      </span>
      {children}
    </label>
  );
}
