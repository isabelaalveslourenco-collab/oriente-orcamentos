"use client";

import { useRef, useState } from "react";
import { AnaliseIAResultado } from "@/lib/types";

interface Props {
  onAnalise: (resultado: AnaliseIAResultado) => void;
  onArquivoSelecionado: (file: File | null) => void;
}

export default function UploadProjeto({ onAnalise, onArquivoSelecionado }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function selecionarArquivo(file: File | null) {
    setArquivo(file);
    setErro(null);
    onArquivoSelecionado(file);
  }

  async function analisarComIA() {
    if (!arquivo) return;
    setAnalisando(true);
    setErro(null);

    try {
      const formData = new FormData();
      formData.append("file", arquivo);

      const resp = await fetch("/api/analyze-project", { method: "POST", body: formData });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Falha ao analisar o projeto.");
      }

      onAnalise(data.resultado as AnaliseIAResultado);
    } catch (e: any) {
      setErro(e.message || "Não foi possível analisar o projeto. Preencha os itens manualmente.");
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <section className="card">
      <h2 className="font-secundaria text-lg text-oriente-gray mb-1">Projeto do cliente</h2>
      <p className="text-sm text-oriente-gray-light mb-4">
        Anexe o projeto arquitetônico ou de marcenaria (PDF ou imagem). A IA lê os ambientes, móveis e
        medidas e monta os itens automaticamente — você revisa e ajusta depois.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => selecionarArquivo(e.target.files?.[0] || null)}
      />

      {!arquivo ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-neutral-300 py-10 text-center hover:border-oriente-red/50 hover:bg-oriente-red/5 transition-colors"
        >
          <UploadIcon className="mx-auto mb-2 h-7 w-7 text-oriente-gray-light" />
          <span className="block text-sm font-medium text-oriente-gray">
            Clique para anexar o projeto
          </span>
          <span className="block text-xs text-oriente-gray-light mt-1">PDF, JPG ou PNG</span>
        </button>
      ) : (
        <div className="rounded-xl border border-neutral-200 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileIcon className="h-8 w-8 text-oriente-red flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-oriente-gray truncate">{arquivo.name}</div>
              <div className="text-xs text-oriente-gray-light">
                {(arquivo.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
          <button
            type="button"
            className="text-sm text-oriente-gray-light hover:text-oriente-red flex-shrink-0"
            onClick={() => selecionarArquivo(null)}
          >
            Remover
          </button>
        </div>
      )}

      {arquivo && (
        <button
          type="button"
          onClick={analisarComIA}
          disabled={analisando}
          className="btn-primary mt-4 w-full"
        >
          {analisando ? (
            <>
              <Spinner /> Analisando projeto com IA…
            </>
          ) : (
            "Analisar com IA e preencher itens"
          )}
        </button>
      )}

      {erro && (
        <p className="mt-3 text-sm text-oriente-red bg-oriente-red/5 rounded-lg px-3 py-2">{erro}</p>
      )}
    </section>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 2h9l5 5v15H6V2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
