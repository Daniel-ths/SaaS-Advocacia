import { createClient } from "@/lib/supabase/server";
import { vincularCliente } from "./actions"; 
import Link from "next/link";

type Cliente = {
  id: string;
  nome: string;
};

type Documento = {
  id: string;
  nome_arquivo: string;
  processo: string | null;
  status: string;
  created_at: string;
  cliente_id: string | null;
  clientes?: { nome: string } | null; 
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    em_analise: "Em análise",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
  };
  return labels[status] || status;
}

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    pendente: "bg-amber-50 text-amber-700 border-amber-200",
    em_analise: "bg-blue-50 text-blue-700 border-blue-200",
    aprovado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejeitado: "bg-red-50 text-red-700 border-red-200",
  };
  return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: { tab?: string; busca?: string; status?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

 
  const params = await searchParams; 
  const currentTab = params?.tab || "todos";
  const currentBusca = params?.busca || "";
  const currentStatus = params?.status || "";

  
  const { data: clientesData } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("user_id", user?.id)
    .order("nome");
  const clientes = (clientesData || []) as Cliente[];

 
  let query = supabase
    .from("documentos")
    .select(`
      id, 
      nome_arquivo, 
      processo, 
      status, 
      created_at, 
      cliente_id,
      clientes (nome)
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  if (currentTab === "pendentes") {
    query = query.is("cliente_id", null);
  }
  if (currentBusca) {
    query = query.ilike("nome_arquivo", `%${currentBusca}%`);
  }
  if (currentStatus) {
    query = query.eq("status", currentStatus);
  }

  const { data: docsData, error } = await query;
  const documentos = (docsData || []) as unknown as Documento[];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-2">
              Gestão de arquivos
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">
              Documentos
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Gerencie arquivos, acompanhe status e vincule documentos aos
              clientes do escritório.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 min-w-[140px]">
              <p className="text-sm text-amber-700">Sem vínculo</p>
              <p className="text-3xl font-semibold text-amber-900 mt-1">
                {documentos.filter(d => !d.cliente_id).length}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 min-w-[140px]">
              <p className="text-sm text-slate-500">Total listado</p>
              <p className="text-3xl font-semibold text-slate-950 mt-1">
                {documentos.length}
              </p>
            </div>
          </div>
        </div>
      </section>

    
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        
        <div className="flex border-b border-slate-200 px-5 sm:px-6">
          <Link
            href="/documentos?tab=todos"
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              currentTab === "todos"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Todos os Documentos
          </Link>
          <Link
            href="/documentos?tab=pendentes"
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
              currentTab === "pendentes"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Pendentes de Vínculo
          </Link>
        </div>

        
        <form method="GET" className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <input type="hidden" name="tab" value={currentTab} />
          
          <div className="flex-1">
            <input
              name="busca"
              defaultValue={currentBusca}
              placeholder="Buscar pelo nome do arquivo..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          
          <div className="sm:w-48">
            <select
              name="status"
              defaultValue={currentStatus}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_analise">Em análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2.5 transition-colors text-sm"
          >
            Filtrar
          </button>
        </form>

        
        {error ? (
          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Erro ao carregar documentos: {error.message}
            </div>
          </div>
        ) : documentos.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
              📄
            </div>
            <p className="font-medium text-slate-800">
              Nenhum documento encontrado
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Tente limpar os filtros ou alterar a aba de busca.
            </p>
            {(currentBusca || currentStatus) && (
              <Link href="/documentos" className="inline-block mt-4 text-sm text-indigo-600 font-medium hover:underline">
                Limpar filtros
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Arquivo</th>
                  <th className="px-6 py-4">Cliente vinculado</th>
                  <th className="px-6 py-4">Processo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Envio</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentos.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {doc.nome_arquivo}
                    </td>
                    <td className="px-6 py-4">
                      {doc.clientes?.nome ? (
                        <span className="text-slate-900">{doc.clientes.nome}</span>
                      ) : (
                        <form action={vincularCliente} className="flex items-center gap-2 max-w-[200px]">
                          <input type="hidden" name="documento_id" value={doc.id} />
                          <select
                            name="cliente_id"
                            required
                            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                          >
                            <option value="">Selecione...</option>
                            {clientes.map(c => (
                              <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            Salvar
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {doc.processo || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium border rounded-full px-2.5 py-1 ${getStatusStyle(doc.status)}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                    
                      <a
                        href={`/api/download/${doc.id}`} // Altere para a sua rota de download/storage
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}