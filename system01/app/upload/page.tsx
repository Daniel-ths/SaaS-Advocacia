export default function UploadPage() {
  return (
    <div className="max-w-xl bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-950">Upload</h2>
        <p className="text-sm text-slate-500 mt-1">
          Envie documentos do escritório e arquivos vinculados aos clientes.
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-8 text-center bg-slate-50 cursor-pointer transition-colors">
        <p className="text-sm text-slate-600">
          Arraste e solte seus arquivos aqui, ou{" "}
          <span className="text-indigo-600 font-medium">
            procure no computador
          </span>
        </p>

        <p className="text-xs text-slate-400 mt-2">
          Formatos aceitos: PDF, PNG, JPG até 10MB.
        </p>
      </div>
    </div>
  );
}