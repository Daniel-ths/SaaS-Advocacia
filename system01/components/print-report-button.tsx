"use client";

import { AppIcon } from "@/components/app-icon";

export default function PrintReportButton() {
  return (
    <button className="button button-secondary" type="button" onClick={() => window.print()}>
      <AppIcon name="print" className="h-4 w-4" />
      Imprimir / salvar PDF
    </button>
  );
}
