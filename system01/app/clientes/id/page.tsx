import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createProcesso } from "./actions"; 

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: string;
  observacao: string | null;
  created_at: string;
};

type Processo = {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  created_at: string;
};

type Documento = {
  id: string;
  nome: string;
  url: string;
  created_at: string;
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
    lead: "Lead",
    atendimento: "Em atendimento",
    cliente: "Cliente",
    arquivado: "Arquivado",
  };
  return labels[status] || status;
}

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    lead: "bg-blue-50 text-blue-700 border-blue-200",
    atendimento: "bg-amber-50 text-amber-700 border-amber-200",
    cliente: "bg-emerald-50 text-emerald-700 border-emerald-200",
    arquivado: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetalhesPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: clienteData } = await supabase
    .from("clientes")
    .select("id, nome, telefone, email, status, observacao, created_at")
    .eq("id", id)
    .single();

  if (!clienteData) {
    notFound();
  }

  const cliente = clienteData as Cliente;

  
  const { data: processosData } = await supabase
    .from("processos")
    .select("id, numero, titulo, status, created_at")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  const processos = (processosData || []) as Processo[];

 
  const { data: documentosData } = await supabase
    .from("documentos")
    .select("id, nome, url, created_at")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  const documentos = (documentosData || []) as Documento[];

  return (
    <div className="space-y-6">
     
      <div className="flex items-center gap-3">
        <Link
          href="/clientes"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors shadow-sm"
        >
          ← Voltar
        </Link>
      </div>

     
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-950">
                {cliente.nome}
              </h2>
              <span
                className={`text-xs font-medium border rounded-full px-2.5 py-1 ${getStatusStyle(
                  cliente.status
                )}`}
              >
                {getStatusLabel(cliente.status)}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Cliente desde: {formatDate(cliente.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-sm">
          <div>
            <p className="font-medium text-slate-400 uppercase tracking-wider text-xs">Contactos</p>
            <p className="mt-1 text-slate-900 font-medium">📧 {cliente.email || "Não informado"}</p>
            <p className="mt-1 text-slate-900 font-medium">📞 {cliente.telefone || "Não informado"}</p>
          </div>
          <div>
            <p className="font-medium text-slate-400 uppercase tracking-wider text-xs">Observações do Registro</p>
            <p className="mt-1 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-wrap">
              {cliente.observacao || "Nenhuma observação cadastrada."}
            </p>
          </div>
        </div>
      </section>

      
      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 h-fit">
          <h3 className="text-lg font-semibold text-slate-950">Novo Processo</h3>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            Abra um novo processo ou pasta jurídica para este cliente.
          </p>

          <form action={createProcesso} className="space-y-4">
           
            <input type="hidden" name="cliente_id" value={cliente.id} />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número do Processo (CNJ)
              </label>
              <input
                name="numero"
                required
                placeholder="0000000-00.0000.0.00.0000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Título / Objeto da Ação
              </label>
              <input
                name="titulo"
                required
                placeholder="Ex: Ação Trabalhista ou Divórcio Consensual"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status Inicial
              </label>
              <select
                name="status"
                defaultValue="distribuido"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
              >
                <option value="analise">Em Análise</option>
                <option value="distribuido">Distribuído / Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado definitivo</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-3 transition-colors"
            >
              Criar Processo
            </button>
          </form>
        </div>

       
        <div className="space-y-6">
          
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-950">Processos Vinculados</h3>
              <p className="text-sm text-slate-500 mt-1">
                Ações e procedimentos em andamento para este cliente.
              </p>
            </div>

            {processos.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhum processo vinculado a este cliente ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {processos.map((proc) => (
                  <div key={proc.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">{proc.titulo}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">Nº {proc.numero}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700">
                        {proc.status}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(proc.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-950">Documentos do Cliente</h3>
              <p className="text-sm text-slate-500 mt-1">
                Arquivos, RG, CPF, Procurações ou Contratos anexados.
              </p>
            </div>

            {documentos.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhum documento anexado para este cliente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {documentos.map((doc) => (
                  <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                        >
                          {doc.nome}
                        </a>
                        <p className="text-xs text-slate-400 mt-0.5">Enviado em: {formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}