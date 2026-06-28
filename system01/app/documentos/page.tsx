import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { excluirDocumento } from "@/app/actions/documentos";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import { getDb } from "@/lib/db/client";
import { clientes, documentos, processos } from "@/lib/db/schema";
import { formatarData, formatarTamanho } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  const db = getDb();
  const lista = await db
    .select({
      id: documentos.id,
      clienteId: documentos.clienteId,
      nomeArquivo: documentos.nomeArquivo,
      mimeType: documentos.mimeType,
      tamanhoBytes: documentos.tamanhoBytes,
      createdAt: documentos.createdAt,
      clienteNome: clientes.nome,
      processoTitulo: processos.titulo,
    })
    .from(documentos)
    .innerJoin(clientes, sql`${documentos.clienteId} = ${clientes.id}`)
    .leftJoin(processos, sql`${documentos.processoId} = ${processos.id}`)
    .orderBy(desc(documentos.createdAt));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Arquivo do escritório"
        title="Documentos"
        description="Centralize os arquivos enviados e mantenha o vínculo com o cliente e o processo correspondente."
        actions={
          <Link href="/documentos/novo" className="button button-primary">
            <AppIcon name="plus" className="h-4 w-4" />
            Enviar documento
          </Link>
        }
      />

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Arquivos registrados</h3>
            <p className="panel-description">
              {lista.length} {lista.length === 1 ? "documento disponível" : "documentos disponíveis"} para consulta.
            </p>
          </div>
        </div>

        {lista.length === 0 ? (
          <p className="empty-state">Nenhum documento enviado até o momento.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table min-w-[58rem]" aria-label="Lista de documentos">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Cliente</th>
                  <th>Processo</th>
                  <th>Tamanho</th>
                  <th>Envio</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((documento) => (
                  <tr key={documento.id}>
                    <td>
                      <Link
                        href={`/documentos/${documento.id}/download`}
                        className="flex max-w-[19rem] items-center gap-2 font-semibold text-[#2c2823] transition-colors hover:text-[#715a31]"
                      >
                        <AppIcon name="file" className="h-4 w-4 shrink-0 text-[#8a7040]" />
                        <span className="truncate">{documento.nomeArquivo}</span>
                      </Link>
                      <p className="mt-1 text-xs text-[#837c71]">{documento.mimeType}</p>
                    </td>
                    <td>
                      <Link href={`/clientes/${documento.clienteId}`} className="font-semibold text-[#504a41] transition-colors hover:text-[#715a31]">
                        {documento.clienteNome}
                      </Link>
                    </td>
                    <td className="max-w-[13rem] truncate text-[#69635a]">{documento.processoTitulo || "—"}</td>
                    <td className="whitespace-nowrap text-[#69635a]">{formatarTamanho(documento.tamanhoBytes)}</td>
                    <td className="whitespace-nowrap text-[#69635a]">{formatarData(documento.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/documentos/${documento.id}/download`} className="text-link">
                          <AppIcon name="download" className="h-3.5 w-3.5" />
                          Baixar
                        </Link>
                        <form action={excluirDocumento}>
                          <input type="hidden" name="id" value={documento.id} />
                          <input type="hidden" name="clienteId" value={documento.clienteId} />
                          <button className="destructive-link" type="submit">Excluir</button>
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
