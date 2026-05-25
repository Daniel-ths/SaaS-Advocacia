export default function DocumentosPage() {
  const docs = [
    "Contrato de Honorários.pdf",
    "Procuração Modelo.pdf",
    "Relatório Processual.pdf",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-950">Documentos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Área inicial para organizar contratos, procurações e arquivos dos
          clientes.
        </p>
      </div>

      <div className="space-y-2">
        {docs.map((doc) => (
          <div
            key={doc}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-sm transition-colors"
          >
            <span className="font-medium text-slate-700">{doc}</span>
            <button className="text-indigo-600 hover:text-indigo-800 font-medium">
              Visualizar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}