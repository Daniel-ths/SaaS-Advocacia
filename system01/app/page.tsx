export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total de Clientes</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Documentos Armazenados</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">8,412</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Espaço Utilizado</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">42.8 GB</p>
        </div>
      </div>

      {/* Tabela de exemplo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Atividades Recentes</h2>
        </div>
        <div className="p-5 text-sm text-slate-500">
          Nenhuma atividade suspeita nas últimas 24 horas.
        </div>
      </div>
    </div>
  );
}
