import Link from "next/link";
import { asc } from "drizzle-orm";
import { enviarDocumento } from "@/app/actions/documentos";
import { getDb } from "@/lib/db/client";
import { clientes, processos } from "@/lib/db/schema";

const campo = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export const dynamic = "force-dynamic";

export default async function NovoDocumentoPage({ searchParams }: { searchParams: Promise<{ clienteId?: string }> }) {
  const db = getDb();
  const { clienteId = "" } = await searchParams;
  const [listaClientes, listaProcessos] = await Promise.all([
    db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).orderBy(asc(clientes.nome)),
    db.select({ id: processos.id, clienteId: processos.clienteId, numero: processos.numero, titulo: processos.titulo }).from(processos).orderBy(asc(processos.titulo)),
  ]);

  return (
    <div className="mx-auto max-w-3xl"><Link href="/documentos" className="text-sm font-medium text-slate-600 hover:text-indigo-700">← Documentos</Link><div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-950">Enviar documento</h2><p className="mt-1 text-sm leading-6 text-slate-500">Nesta fase, o arquivo é salvo no PostgreSQL. Limite temporário: 4,5 MB.</p>{listaClientes.length === 0 ? <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Cadastre um cliente antes de enviar documentos. <Link href="/clientes" className="font-semibold underline">Ir para clientes</Link></p> : <form action={enviarDocumento} className="mt-6 space-y-4"><label className="block text-sm font-medium text-slate-700">Cliente<select name="clienteId" defaultValue={clienteId} required className={`${campo} mt-1.5`}><option value="" disabled>Selecione o cliente</option>{listaClientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Processo (opcional)<select name="processoId" defaultValue="" className={`${campo} mt-1.5`}><option value="">Sem processo vinculado</option>{listaProcessos.map((processo) => <option key={processo.id} value={processo.id}>{processo.numero} — {processo.titulo}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Arquivo<input name="arquivo" type="file" required className={`${campo} mt-1.5 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700`} /></label><div className="flex justify-end gap-3"><Link href="/documentos" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</Link><button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Enviar arquivo</button></div></form>}</div></div>
  );
}
