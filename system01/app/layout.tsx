"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./globals.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  const menuItems = [
    { name: "Início", href: "/" },
    { name: "Clientes", href: "/clientes" },
    { name: "Documentos", href: "/documentos" },
    { name: "Upload", href: "/upload" },
  ];

  function isRouteActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const currentPage =
    menuItems.find((item) => isRouteActive(item.href))?.name || "Painel";

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100 text-slate-800 antialiased">
        {isLoginPage ? (
          children
        ) : (
          <div className="min-h-screen flex">
            <aside
              className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4
                flex flex-col justify-between transform transition-transform duration-200
                md:translate-x-0 md:static md:h-screen
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-base font-semibold text-slate-900">
                      Sistema
                    </h1>
                    <p className="text-xs text-slate-500">
                      Painel administrativo
                    </p>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden text-slate-500 hover:text-slate-800"
                    type="button"
                  >
                    Fechar
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = isRouteActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                type="button"
              >
                Sair
              </button>
            </aside>

            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-30 bg-black/30 md:hidden"
                aria-label="Fechar menu"
                type="button"
              />
            )}

            <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
              <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-700"
                    type="button"
                  >
                    Menu
                  </button>

                  <h2 className="text-base font-medium text-slate-900">
                    {currentPage}
                  </h2>
                </div>

                <div className="text-sm text-slate-500">
                  Conta
                </div>
              </header>

              <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}