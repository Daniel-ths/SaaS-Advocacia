import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { excluirDocumento } from "@/app/actions/documentos";
import { getDb } from "@/lib/db/client";
import { clientes, documentos, processos } from "@/lib/db/schema";
import { formatarData, formatarTamanho } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  const db = getDb();
  const lista = await db.select({ id: documentos.id, clienteId: documentos.clienteId, nomeArquivo: documentos.nomeArquivo, mimeType: documentos.mimeType, tamanhoBytes: documentos.tamanhoBytes, createdAt: documentos.createdAt, clienteNome: clientes.nome, processoTitulo: processos.titulo }).from(documentos).innerJoin(clientes, sql`${documentos.clienteId} = ${clientes.id}`).leftJoin(processos, sql`${documentos.processoId} = ${processos.id}`).orderBy(desc(documentos.createdAt));

  return (
    <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-950">Documentos</h2><p className="mt-1 text-sm text-slate-500">Arquivos enviados nesta etapa ficam armazenados no PostgreSQL.</p></div><Link href="/documentos/novo" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Enviar documento</Link></div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{lista.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">Nenhum documento enviado.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[56.25rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Arquivo</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Processo</th><th className="px-5 py-3">Tamanho</th><th className="px-5 py-3">Envio</th><th className="px-5 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{lista.map((documento) => <tr key={documento.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><Link href={`/documentos/${documento.id}/download`} className="font-semibold text-slate-900 hover:text-indigo-700">{documento.nomeArquivo}</Link><p className="mt-0.5 text-xs text-slate-500">{documento.mimeType}</p></td><td className="px-5 py-4"><Link href={`/clientes/${documento.clienteId}`} className="font-medium text-slate-700 hover:text-indigo-700">{documento.clienteNome}</Link></td><td className="px-5 py-4 text-slate-600">{documento.processoTitulo || "—"}</td><td className="px-5 py-4 text-slate-600">{formatarTamanho(documento.tamanhoBytes)}</td><td className="px-5 py-4 text-slate-600">{formatarData(documento.createdAt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-3"><Link href={`/documentos/${documento.id}/download`} className="font-medium text-indigo-700 hover:text-indigo-900">Baixar</Link><form action={excluirDocumento}><input type="hidden" name="id" value={documento.id} /><input type="hidden" name="clienteId" value={documento.clienteId} /><button className="font-medium text-rose-700 hover:text-rose-900">Excluir</button></form></div></td></tr>)}</tbody></table></div>}</section></div>
  );
}
