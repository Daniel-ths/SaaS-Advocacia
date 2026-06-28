"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import BrandMark from "@/components/brand-mark";

const menuItems: { name: string; href: string; icon: AppIconName }[] = [
  { name: "Visão geral", href: "/", icon: "overview" },
  { name: "Clientes", href: "/clientes", icon: "clients" },
  { name: "Processos", href: "/processos", icon: "processes" },
  { name: "Agenda jurídica", href: "/agenda", icon: "agenda" },
  { name: "Documentos", href: "/documentos", icon: "documents" },
  { name: "Relatórios", href: "/relatorios", icon: "reports" },
  { name: "Histórico", href: "/historico", icon: "history" },
];

function getActiveItem(pathname: string) {
  if (pathname === "/") return menuItems[0];
  return menuItems.find((item) => item.href !== "/" && pathname.startsWith(item.href)) ?? menuItems[0];
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();
  const itemAtual = getActiveItem(pathname);

  return (
    <div className="min-h-screen bg-[#f5f2ec] text-[#1f1d1a] md:flex">
      <aside
        className={`sidebar fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col bg-[#211f1b] transition-transform duration-200 md:static md:min-h-screen md:translate-x-0 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" aria-label="Abrir visão geral" onClick={() => setMenuAberto(false)}>
              <BrandMark />
            </Link>
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="icon-button md:hidden"
              aria-label="Fechar menu"
            >
              <AppIcon name="close" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <p className="px-3 text-[0.65rem] font-bold tracking-[0.14em] text-[#a89f92] uppercase">Painel interno</p>
          <nav className="mt-3 space-y-1" aria-label="Navegação principal">
            {menuItems.map((item) => {
              const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    ativo
                      ? "border-[#c7a76b] bg-white/[0.09] text-[#fffdf9]"
                      : "border-transparent text-[#c9c1b5] hover:bg-white/[0.055] hover:text-white"
                  }`}
                >
                  <AppIcon name={item.icon} className="h-[1.05rem] w-[1.05rem]" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 px-5 py-5">
          <div className="border-l-2 border-[#a8874e] pl-3 text-xs leading-5 text-[#c9c1b5]">
            <span className="mb-1 block text-[0.66rem] font-bold tracking-[0.11em] text-[#e6d5b2] uppercase">Ambiente de desenvolvimento</span>
            A autenticação permanece desativada até a conclusão do sistema.
          </div>
        </div>
      </aside>

      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/35 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <div className="min-w-0 flex-1">
        <header className="app-topbar sticky top-0 z-20 flex h-[4.5rem] items-center justify-between border-b border-[#ded8cf] bg-[#f5f2ec]/95 px-4 backdrop-blur md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              className="inline-grid h-9 w-9 place-items-center rounded-md border border-[#d8d1c7] bg-[#fffdf9] text-[#36322d] md:hidden"
              aria-label="Abrir menu"
            >
              <AppIcon name="menu" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[0.65rem] font-bold tracking-[0.12em] text-[#857e73] uppercase sm:block">WY Advocacia</p>
              <h1 className="truncate font-serif text-lg font-semibold tracking-[-0.025em] text-[#1f1d1a]">{itemAtual.name}</h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-[#706a60] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9b7d47]" />
            Ambiente interno
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 md:py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
