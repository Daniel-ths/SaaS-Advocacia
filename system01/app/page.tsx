import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { clientes, documentos, processos } from "@/lib/db/schema";
import { formatarData, formatarTamanho } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = getDb();
  const [contagemClientes, contagemProcessos, contagemDocumentos, ultimosClientes, ultimosDocumentos] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(clientes),
    db.select({ total: sql<number>`count(*)::int` }).from(processos),
    db.select({ total: sql<number>`count(*)::int` }).from(documentos),
    db.select().from(clientes).orderBy(desc(clientes.createdAt)).limit(5),
    db
      .select({
        id: documentos.id,
        nomeArquivo: documentos.nomeArquivo,
        tamanhoBytes: documentos.tamanhoBytes,
        createdAt: documentos.createdAt,
        clienteNome: clientes.nome,
      })
      .from(documentos)
      .innerJoin(clientes, sql`${documentos.clienteId} = ${clientes.id}`)
      .orderBy(desc(documentos.createdAt))
      .limit(5),
  ]);

  const cards = [
    { label: "Clientes cadastrados", value: Number(contagemClientes[0]?.total ?? 0), href: "/clientes" },
    { label: "Processos registrados", value: Number(contagemProcessos[0]?.total ?? 0), href: "/processos" },
    { label: "Documentos armazenados", value: Number(contagemDocumentos[0]?.total ?? 0), href: "/documentos" },
  ];

  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-indigo-700">Visão geral</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Gestão jurídica centralizada</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Cadastre clientes, acompanhe processos e mantenha os documentos reunidos em um único local.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Clientes recentes</h3>
            <Link href="/clientes" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
              Ver clientes
            </Link>
          </div>
          {ultimosClientes.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">Nenhum cliente cadastrado ainda.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ultimosClientes.map((cliente) => (
                <li key={cliente.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <Link href={`/clientes/${cliente.id}`} className="font-medium text-slate-900 hover:text-indigo-700">
                      {cliente.nome}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">Cadastrado em {formatarData(cliente.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{cliente.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Documentos recentes</h3>
            <Link href="/documentos" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
              Ver documentos
            </Link>
          </div>
          {ultimosDocumentos.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">Nenhum documento enviado ainda.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ultimosDocumentos.map((documento) => (
                <li key={documento.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <Link href={`/documentos/${documento.id}/download`} className="block truncate font-medium text-slate-900 hover:text-indigo-700">
                      {documento.nomeArquivo}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {documento.clienteNome} · {formatarData(documento.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{formatarTamanho(documento.tamanhoBytes)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
