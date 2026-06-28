import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { excluirDocumento } from "@/app/actions/documentos";
import { excluirProcesso } from "@/app/actions/processos";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { agendaEventos, clientes, documentos, processos } from "@/lib/db/schema";
import { classificarPrazo, formatarData, formatarDataHora, formatarTamanho } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });

  if (!cliente) {
    return (
      <section className="app-panel mx-auto max-w-xl p-10 text-center">
        <h2 className="page-title text-2xl">Cliente não encontrado</h2>
        <p className="mt-3 text-sm leading-6 text-[#756e63]">Este cadastro não existe ou foi removido da base.</p>
        <Link href="/clientes" className="button button-secondary mt-6">
          <AppIcon name="arrow-left" className="h-4 w-4" />
          Voltar para clientes
        </Link>
      </section>
    );
  }

  const [listaProcessos, listaDocumentos, listaAgenda] = await Promise.all([
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
      .leftJoin(processos, eq(documentos.processoId, processos.id))
      .where(eq(documentos.clienteId, id))
      .orderBy(desc(documentos.createdAt)),
    db
      .select({
        id: agendaEventos.id,
        titulo: agendaEventos.titulo,
        dataHora: agendaEventos.dataHora,
        tipo: agendaEventos.tipo,
        status: agendaEventos.status,
        processoNumero: processos.numero,
      })
      .from(agendaEventos)
      .leftJoin(processos, eq(agendaEventos.processoId, processos.id))
      .where(eq(agendaEventos.clienteId, id))
      .orderBy(asc(agendaEventos.dataHora))
      .limit(6),
  ]);

  return (
    <div className="space-y-8">
      <Link href="/clientes" className="text-link">
        <AppIcon name="arrow-left" className="h-3.5 w-3.5" />
        Voltar para clientes
      </Link>

      <PageHeader
        eyebrow="Ficha de cliente"
        title={cliente.nome}
        description={`Cadastro realizado em ${formatarData(cliente.createdAt)}.`}
        actions={
          <>
            <StatusBadge status={cliente.status} kind="cliente" />
            <Link href={`/historico?entidade=cliente&entidadeId=${id}`} className="button button-secondary">
              <AppIcon name="history" className="h-4 w-4" />
              Histórico
            </Link>
            <Link href={`/clientes/${id}/editar`} className="button button-secondary">
              <AppIcon name="edit" className="h-4 w-4" />
              Editar
            </Link>
            <Link href={`/documentos/novo?clienteId=${id}`} className="button button-primary">
              <AppIcon name="plus" className="h-4 w-4" />
              Documento
            </Link>
          </>
        }
      />

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Dados de contato</h3>
            <p className="panel-description">Informações cadastradas para este atendimento.</p>
          </div>
        </div>
        <dl className="grid gap-x-6 gap-y-6 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-[#8c8579] uppercase">E-mail</dt>
            <dd className="mt-2 break-words font-semibold text-[#39352f]">{cliente.email || "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-[#8c8579] uppercase">Telefone</dt>
            <dd className="mt-2 font-semibold text-[#39352f]">{cliente.telefone || "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-[#8c8579] uppercase">CPF ou CNPJ</dt>
            <dd className="mt-2 font-semibold text-[#39352f]">{cliente.cpfCnpj || "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-[#8c8579] uppercase">Situação</dt>
            <dd className="mt-2"><StatusBadge status={cliente.status} kind="cliente" /></dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-[#8c8579] uppercase">Observações</dt>
            <dd className="mt-2 max-w-4xl whitespace-pre-wrap leading-6 text-[#575149]">{cliente.observacao || "Nenhuma observação cadastrada."}</dd>
          </div>
        </dl>
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Processos vinculados</h3>
            <p className="panel-description">
              {listaProcessos.length} {listaProcessos.length === 1 ? "processo relacionado" : "processos relacionados"} a este cliente.
            </p>
          </div>
          <Link href={`/processos?clienteId=${id}`} className="text-link">
            <AppIcon name="plus" className="h-3.5 w-3.5" />
            Novo processo
          </Link>
        </div>

        {listaProcessos.length === 0 ? (
          <p className="empty-state">Nenhum processo vinculado a este cliente.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table min-w-[54rem]" aria-label="Processos do cliente">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Título</th>
                  <th>Área</th>
                  <th>Status</th>
                  <th>Prazo</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {listaProcessos.map((processo) => {
                  const prazo = processo.prazo ? classificarPrazo(processo.prazo) : null;
                  return (
                    <tr key={processo.id}>
                      <td className="whitespace-nowrap font-semibold text-[#2c2823]">{processo.numero}</td>
                      <td className="max-w-[17rem] truncate text-[#514d46]">{processo.titulo}</td>
                      <td className="text-[#69635a]">{processo.area || "—"}</td>
                      <td><StatusBadge status={processo.status} kind="processo" /></td>
                      <td className="whitespace-nowrap text-[#69635a]">
                        <p>{formatarData(processo.prazo)}</p>
                        {prazo && prazo.codigo !== "futuro" && <span className={`deadline-label deadline-label-${prazo.codigo} mt-1`}>{prazo.texto}</span>}
                      </td>
                      <td>
                        <div className="flex justify-end gap-3">
                          <Link href={`/processos/${processo.id}/editar`} className="text-link">Editar</Link>
                          <form action={excluirProcesso}>
                            <input type="hidden" name="id" value={processo.id} />
                            <input type="hidden" name="clienteId" value={id} />
                            <button className="destructive-link" type="submit">Excluir</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Agenda deste cliente</h3>
            <p className="panel-description">Próximos compromissos relacionados ao atendimento.</p>
          </div>
          <Link href="/agenda" className="text-link">
            <AppIcon name="calendar" className="h-3.5 w-3.5" />
            Abrir agenda
          </Link>
        </div>

        {listaAgenda.length === 0 ? (
          <p className="empty-state">Nenhum compromisso relacionado a este cliente.</p>
        ) : (
          <ul className="divide-y divide-[#eee9e1]">
            {listaAgenda.map((evento) => (
              <li key={evento.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <Link href={`/agenda/${evento.id}/editar`} className="font-semibold text-[#2c2823] transition-colors hover:text-[#715a31]">{evento.titulo}</Link>
                  <p className="mt-1 text-xs text-[#837c71]">{evento.tipo} · {evento.processoNumero || "Sem processo vinculado"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={evento.status} kind="agenda" />
                  <span className="text-xs font-semibold text-[#756e63]">{formatarDataHora(evento.dataHora)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Documentos vinculados</h3>
            <p className="panel-description">Arquivos organizados dentro deste cadastro.</p>
          </div>
          <Link href={`/documentos/novo?clienteId=${id}`} className="text-link">
            <AppIcon name="plus" className="h-3.5 w-3.5" />
            Enviar documento
          </Link>
        </div>

        {listaDocumentos.length === 0 ? (
          <p className="empty-state">Nenhum documento enviado para este cliente.</p>
        ) : (
          <ul className="divide-y divide-[#eee9e1]">
            {listaDocumentos.map((documento) => (
              <li key={documento.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <Link href={`/documentos/${documento.id}/download`} className="flex items-center gap-2 font-semibold text-[#2c2823] transition-colors hover:text-[#715a31]">
                    <AppIcon name="file" className="h-4 w-4 shrink-0 text-[#8a7040]" />
                    <span className="truncate">{documento.nomeArquivo}</span>
                  </Link>
                  <p className="mt-1 text-xs text-[#837c71]">
                    {documento.processoTitulo || "Sem processo vinculado"} · {formatarData(documento.createdAt)} · {formatarTamanho(documento.tamanhoBytes)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link href={`/documentos/${documento.id}/download`} className="text-link">
                    <AppIcon name="download" className="h-3.5 w-3.5" />
                    Baixar
                  </Link>
                  <form action={excluirDocumento}>
                    <input type="hidden" name="id" value={documento.id} />
                    <input type="hidden" name="clienteId" value={id} />
                    <button className="destructive-link" type="submit">Excluir</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
