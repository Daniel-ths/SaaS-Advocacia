export default function UploadPage() {
  return (
    <div className="max-w-xl bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <p className="text-slate-600 mb-6">Envie novos arquivos diretamente para o servidor.</p>
      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-8 text-center bg-slate-50 cursor-pointer transition-colors">
        <p className="text-sm text-slate-600">Arraste e solte seus arquivos aqui, ou <span className="text-indigo-600 font-medium">procure no computador</span></p>
        <p className="text-xs text-slate-400 mt-2">Formatos aceitos: PDF, PNG, JPG (Até 10MB)</p>
      </div>
    </div>
  );
}