import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { excluirDocumento } from "@/app/actions/documentos";
import { excluirProcesso } from "@/app/actions/processos";
import { getDb } from "@/lib/db/client";
import { clientes, documentos, processos } from "@/lib/db/schema";
import { formatarData, formatarStatus, formatarTamanho } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });

  if (!cliente) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Cliente não encontrado</h2>
        <Link href="/clientes" className="mt-3 inline-block text-sm font-medium text-indigo-700">Voltar para clientes</Link>
      </div>
    );
  }

  const [listaProcessos, listaDocumentos] = await Promise.all([
    db.select().from(processos).where(eq(processos.clienteId, id)).orderBy(desc(processos.createdAt)),
    db
      .select({
        id: documentos.id,
        nomeArquivo: documentos.nomeArquivo,
        tamanhoBytes: documentos.tamanhoBytes,
        createdAt: documentos.createdAt,
        processoTitulo: processos.titulo,
      })
      .from(documentos)
      .leftJoin(processos, sql`${documentos.processoId} = ${processos.id}`)
      .where(eq(documentos.clienteId, id))
      .orderBy(desc(documentos.createdAt)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/clientes" className="text-sm font-medium text-slate-600 hover:text-indigo-700">← Clientes</Link>
        <div className="flex gap-2">
          <Link href={`/clientes/${id}/editar`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Editar cliente</Link>
          <Link href={`/documentos/novo?clienteId=${id}`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Enviar documento</Link>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{cliente.nome}</h2>
            <p className="mt-1 text-sm text-slate-500">Cliente desde {formatarData(cliente.createdAt)}</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">{formatarStatus(cliente.status)}</span>
        </div>
        <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-slate-500">E-mail</dt><dd className="mt-1 font-medium text-slate-900">{cliente.email || "Não informado"}</dd></div>
          <div><dt className="text-slate-500">Telefone</dt><dd className="mt-1 font-medium text-slate-900">{cliente.telefone || "Não informado"}</dd></div>
          <div><dt className="text-slate-500">CPF/CNPJ</dt><dd className="mt-1 font-medium text-slate-900">{cliente.cpfCnpj || "Não informado"}</dd></div>
          <div><dt className="text-slate-500">Observações</dt><dd className="mt-1 font-medium text-slate-900">{cliente.observacao || "Nenhuma"}</dd></div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div><h3 className="font-semibold text-slate-950">Processos</h3><p className="mt-1 text-sm text-slate-500">{listaProcessos.length} processo(s) relacionado(s).</p></div>
          <Link href={`/processos?clienteId=${id}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">Novo processo</Link>
        </div>
        {listaProcessos.length === 0 ? <p className="p-5 text-sm text-slate-500">Nenhum processo cadastrado.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[43.75rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Número</th><th className="px-5 py-3">Título</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Prazo</th><th className="px-5 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{listaProcessos.map((processo) => <tr key={processo.id}><td className="px-5 py-4 font-medium text-slate-900">{processo.numero}</td><td className="px-5 py-4 text-slate-600">{processo.titulo}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{formatarStatus(processo.status)}</span></td><td className="px-5 py-4 text-slate-600">{formatarData(processo.prazo)}</td><td className="px-5 py-4 text-right"><form action={excluirProcesso}><input type="hidden" name="id" value={processo.id} /><input type="hidden" name="clienteId" value={id} /><button className="font-medium text-rose-700 hover:text-rose-900">Excluir</button></form></td></tr>)}</tbody></table></div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h3 className="font-semibold text-slate-950">Documentos</h3><p className="mt-1 text-sm text-slate-500">Arquivos vinculados a este cliente.</p></div><Link href={`/documentos/novo?clienteId=${id}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">Enviar documento</Link></div>
        {listaDocumentos.length === 0 ? <p className="p-5 text-sm text-slate-500">Nenhum documento enviado.</p> : <ul className="divide-y divide-slate-100">{listaDocumentos.map((documento) => <li key={documento.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><Link href={`/documentos/${documento.id}/download`} className="font-medium text-slate-900 hover:text-indigo-700">{documento.nomeArquivo}</Link><p className="mt-1 text-xs text-slate-500">{documento.processoTitulo || "Sem processo"} · {formatarData(documento.createdAt)} · {formatarTamanho(documento.tamanhoBytes)}</p></div><form action={excluirDocumento}><input type="hidden" name="id" value={documento.id} /><input type="hidden" name="clienteId" value={id} /><button className="text-sm font-medium text-rose-700 hover:text-rose-900">Excluir</button></form></li>)}</ul>}
      </section>
    </div>
  );
}
