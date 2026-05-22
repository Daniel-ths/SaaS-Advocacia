export default function DocumentosPage() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <p className="text-slate-600 mb-4">Lista de relatórios e arquivos homologados.</p>
      <div className="space-y-2">
        {["Relatorio_Financeiro_Maio.pdf", "Contrato_Social_Assinado.pdf", "Planilha_Metas_2026.xlsx"].map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-sm transition-colors">
            <span className="font-medium text-slate-700">{doc}</span>
            <button className="text-indigo-600 hover:text-indigo-800 font-medium">Visualizar</button>
          </div>
        ))}
      </div>
    </div>
  );
}