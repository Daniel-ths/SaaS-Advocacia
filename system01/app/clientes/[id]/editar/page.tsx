import Link from "next/link";
import { eq } from "drizzle-orm";
import { atualizarCliente } from "@/app/actions/clientes";
import { getDb } from "@/lib/db/client";
import { clientes } from "@/lib/db/schema";

const campo = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export const dynamic = "force-dynamic";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });

  if (!cliente) return <div className="rounded-xl bg-white p-6 text-sm text-slate-600">Cliente não encontrado.</div>;

  const salvar = atualizarCliente.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between"><div><Link href={`/clientes/${id}`} className="text-sm font-medium text-slate-600 hover:text-indigo-700">← Voltar</Link><h2 className="mt-2 text-xl font-semibold text-slate-950">Editar cliente</h2></div></div>
      <form action={salvar} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Nome<input name="nome" defaultValue={cliente.nome} required className={`${campo} mt-1.5`} /></label><label className="text-sm font-medium text-slate-700">E-mail<input name="email" type="email" defaultValue={cliente.email || ""} className={`${campo} mt-1.5`} /></label><label className="text-sm font-medium text-slate-700">Telefone<input name="telefone" defaultValue={cliente.telefone || ""} className={`${campo} mt-1.5`} /></label><label className="text-sm font-medium text-slate-700">CPF ou CNPJ<input name="cpfCnpj" defaultValue={cliente.cpfCnpj || ""} className={`${campo} mt-1.5`} /></label><label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={cliente.status} className={`${campo} mt-1.5`}><option value="ativo">Ativo</option><option value="prospecto">Prospecto</option><option value="inativo">Inativo</option></select></label></div>
        <label className="block text-sm font-medium text-slate-700">Observações<textarea name="observacao" defaultValue={cliente.observacao || ""} rows={4} className={`${campo} mt-1.5`} /></label>
        <div className="flex justify-end gap-3"><Link href={`/clientes/${id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</Link><button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Salvar alterações</button></div>
      </form>
    </div>
  );
}
