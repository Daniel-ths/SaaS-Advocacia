export default function ClientesPage() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Gerencie a base de dados dos seus clientes ativos.</p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Novo Cliente
        </button>
      </div>
      <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
        Nenhum cliente selecionado. Escolha uma opção ou crie um novo.
      </div>
    </div>
  );
}