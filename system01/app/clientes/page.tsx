import Link from "next/link";
import { asc, desc, ilike, or } from "drizzle-orm";
import { criarCliente, excluirCliente } from "@/app/actions/clientes";
import { getDb } from "@/lib/db/client";
import { clientes } from "@/lib/db/schema";
import { formatarData, formatarStatus } from "@/lib/format";

const campo = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const db = getDb();
  const { q = "" } = await searchParams;
  const busca = q.trim();
  const lista = busca
    ? await db
        .select()
        .from(clientes)
        .where(or(ilike(clientes.nome, `%${busca}%`), ilike(clientes.email, `%${busca}%`), ilike(clientes.cpfCnpj, `%${busca}%`)))
        .orderBy(asc(clientes.nome))
    : await db.select().from(clientes).orderBy(desc(clientes.createdAt));

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Cadastro de cliente</h2>
            <p className="mt-1 text-sm text-slate-500">Inclua os dados básicos para iniciar o atendimento.</p>
          </div>
        </div>

        <form action={criarCliente} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input name="nome" required placeholder="Nome completo ou razão social" className={campo} />
          <input name="email" type="email" placeholder="E-mail" className={campo} />
          <input name="telefone" placeholder="Telefone" className={campo} />
          <input name="cpfCnpj" placeholder="CPF ou CNPJ" className={campo} />
          <select name="status" defaultValue="ativo" className={campo}>
            <option value="ativo">Ativo</option>
            <option value="prospecto">Prospecto</option>
            <option value="inativo">Inativo</option>
          </select>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
            Cadastrar cliente
          </button>
          <textarea name="observacao" placeholder="Observações (opcional)" className={`${campo} md:col-span-2 xl:col-span-3`} rows={2} />
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center">
          <div>
            <h2 className="font-semibold text-slate-950">Clientes</h2>
            <p className="mt-1 text-sm text-slate-500">{lista.length} registro(s) encontrado(s).</p>
          </div>
          <form className="flex gap-2" action="/clientes">
            <input defaultValue={busca} name="q" placeholder="Buscar por nome, e-mail ou CPF" className={`${campo} w-full sm:w-72`} />
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Buscar</button>
          </form>
        </div>

        {lista.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">Nenhum cliente encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[47.5rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Cliente</th>
                  <th className="px-5 py-3 font-semibold">Contato</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Cadastro</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <Link href={`/clientes/${cliente.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">
                        {cliente.nome}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">{cliente.cpfCnpj || "CPF/CNPJ não informado"}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{cliente.email || "—"}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{cliente.telefone || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{formatarStatus(cliente.status)}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatarData(cliente.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <Link href={`/clientes/${cliente.id}`} className="font-medium text-indigo-700 hover:text-indigo-900">Abrir</Link>
                        <form action={excluirCliente}>
                          <input type="hidden" name="id" value={cliente.id} />
                          <button className="font-medium text-rose-700 hover:text-rose-900">Excluir</button>
                        </form>
                      </div>
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
