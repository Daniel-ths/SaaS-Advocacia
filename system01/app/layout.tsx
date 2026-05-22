"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  
  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Clientes", href: "/clientes" },
    { name: "Documentos", href: "/documentos" },
    { name: "Upload", href: "/upload" },
  ];

  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col md:flex-row">
        
       
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white p-5 flex flex-col justify-between
          transform transition-transform duration-200 ease-in-out
          md:translate-x-0 md:static md:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-wider text-indigo-400">SisAdvocacia</span>
              
              <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
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

         
          <button 
            onClick={() => alert("Saindo do sistema...")}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-slate-300 hover:bg-red-900/50 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-700/50"
          >
            Sair do Sistema
          </button>
        </aside>

        
        {isOpen && (
          <div 
            onClick={() => setIsOpen(false)} 
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        )}

        
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          
          
          <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              
              <button 
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ☰
              </button>
              <h1 className="text-lg font-semibold text-slate-900">
                {menuItems.find(item => item.href === pathname)?.name || "Sistema"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 hidden sm:inline">Pedro César</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                PC
              </div>
            </div>
          </header>

          
          <main className="p-6 max-w-7xl w-full mx-auto flex-1">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}