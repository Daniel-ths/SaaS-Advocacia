import Link from "next/link";
import { asc, desc, sql } from "drizzle-orm";
import { criarProcesso, excluirProcesso } from "@/app/actions/processos";
import { getDb } from "@/lib/db/client";
import { clientes, processos } from "@/lib/db/schema";
import { formatarData, formatarStatus } from "@/lib/format";

const campo = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export const dynamic = "force-dynamic";

export default async function ProcessosPage({ searchParams }: { searchParams: Promise<{ clienteId?: string }> }) {
  const db = getDb();
  const { clienteId = "" } = await searchParams;
  const [listaClientes, listaProcessos] = await Promise.all([
    db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).orderBy(asc(clientes.nome)),
    db.select({ id: processos.id, clienteId: processos.clienteId, numero: processos.numero, titulo: processos.titulo, area: processos.area, status: processos.status, prazo: processos.prazo, createdAt: processos.createdAt, clienteNome: clientes.nome }).from(processos).innerJoin(clientes, sql`${processos.clienteId} = ${clientes.id}`).orderBy(desc(processos.createdAt)),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Novo processo</h2><p className="mt-1 text-sm text-slate-500">Vincule cada processo ao respectivo cliente.</p>
        {listaClientes.length === 0 ? <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Cadastre um cliente antes de criar processos. <Link href="/clientes" className="font-semibold underline">Ir para clientes</Link></p> : (
          <form action={criarProcesso} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <select name="clienteId" defaultValue={clienteId} required className={campo}><option value="" disabled>Selecione o cliente</option>{listaClientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}</select>
            <input name="numero" required placeholder="Número do processo" className={campo} /><input name="titulo" required placeholder="Título / assunto" className={campo} /><input name="area" placeholder="Área jurídica" className={campo} /><select name="status" defaultValue="aberto" className={campo}><option value="aberto">Aberto</option><option value="em_andamento">Em andamento</option><option value="aguardando">Aguardando</option><option value="encerrado">Encerrado</option></select><input name="prazo" type="date" className={campo} /><textarea name="observacao" placeholder="Observações (opcional)" rows={2} className={`${campo} md:col-span-2`} /><button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Cadastrar processo</button>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="font-semibold text-slate-950">Processos cadastrados</h2><p className="mt-1 text-sm text-slate-500">{listaProcessos.length} registro(s).</p></div>{listaProcessos.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">Nenhum processo cadastrado.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[56.25rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Processo</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Área</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Prazo</th><th className="px-5 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{listaProcessos.map((processo) => <tr key={processo.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{processo.numero}</p><p className="mt-0.5 text-xs text-slate-500">{processo.titulo}</p></td><td className="px-5 py-4"><Link href={`/clientes/${processo.clienteId}`} className="font-medium text-slate-700 hover:text-indigo-700">{processo.clienteNome}</Link></td><td className="px-5 py-4 text-slate-600">{processo.area || "—"}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{formatarStatus(processo.status)}</span></td><td className="px-5 py-4 text-slate-600">{formatarData(processo.prazo)}</td><td className="px-5 py-4 text-right"><form action={excluirProcesso}><input type="hidden" name="id" value={processo.id} /><input type="hidden" name="clienteId" value={processo.clienteId} /><button className="font-medium text-rose-700 hover:text-rose-900">Excluir</button></form></td></tr>)}</tbody></table></div>}</section>
    </div>
  );
}
