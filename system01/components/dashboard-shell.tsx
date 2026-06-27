"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Clientes", href: "/clientes" },
  { name: "Processos", href: "/processos" },
  { name: "Documentos", href: "/documentos" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();
  const titulo = menuItems.find((item) => item.href === pathname)?.name ?? "SisAdvocacia";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between bg-slate-950 p-5 text-white shadow-xl transition-transform duration-200 md:static md:min-h-screen md:translate-x-0 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-9 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Sis<span className="text-indigo-400">Advocacia</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Fechar menu"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const ativo = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  className={`flex rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    ativo
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100">
          <strong className="block font-semibold">Acesso temporário</strong>
          A autenticação está desligada nesta etapa de desenvolvimento.
        </div>
      </aside>

      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Abrir menu"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-slate-900">{titulo}</h1>
          </div>

          <div className="hidden items-center gap-2 text-xs font-medium text-slate-600 sm:flex">
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
            Modo sem login
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
