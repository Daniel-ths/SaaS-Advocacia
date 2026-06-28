import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: {
    default: "WY Advocacia | Gestão interna",
    template: "%s | WY Advocacia",
  },
  description: "Gestão interna de clientes, processos e documentos da WY Advocacia.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
