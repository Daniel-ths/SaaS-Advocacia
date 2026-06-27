import type { Metadata } from "next";
import "./globals.css";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "SisAdvocacia",
  description: "Gestão de clientes, processos e documentos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
