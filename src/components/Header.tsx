"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/novo-orcamento", label: "Novo Orçamento" },
  { href: "/abrir-orcamento", label: "Abrir Orçamento" }
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/novo-orcamento" className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8" />
            <div className="leading-tight">
              <div className="font-secundaria text-lg tracking-wide text-oriente-gray">ORIENTE</div>
              <div className="text-[10px] tracking-[0.25em] text-oriente-gray-light -mt-1">MÓVEIS</div>
            </div>
          </Link>

          <nav className="flex gap-1">
            {ABAS.map((aba) => {
              const ativo = pathname?.startsWith(aba.href);
              return (
                <Link
                  key={aba.href}
                  href={aba.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    ativo
                      ? "bg-oriente-red text-white shadow-card"
                      : "text-oriente-gray hover:bg-neutral-100"
                  }`}
                >
                  {aba.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return <img src="/logo-oriente-icon.png" alt="Oriente Móveis" className={className} />;
}

