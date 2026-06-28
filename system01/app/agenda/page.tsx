import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { concluirEventoAgenda, criarEventoAgenda, excluirEventoAgenda } from "@/app/actions/agenda";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { agendaEventos, clientes, processos } from "@/lib/db/schema";
import { classificarPrazo, formatarDataHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const tiposAgenda: Record<string, string> = {
  prazo: "Prazo",
  audiencia: "Audiência",
  reuniao: "Reunião",
  diligencia: "Diligência",
  outro: "Outro",
};

export default async function AgendaPage() {
  const db = getDb();
  const [listaClientes, listaProcessos, listaEventos] = await Promise.all([
    db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).orderBy(asc(clientes.nome)),
    db
      .select({
        id: processos.id,
        clienteId: processos.clienteId,
        numero: processos.numero,
        titulo: processos.titulo,
        clienteNome: clientes.nome,
      })
      .from(processos)
      .innerJoin(clientes, eq(processos.clienteId, clientes.id))
      .orderBy(asc(processos.titulo)),
    db
      .select({
        id: agendaEventos.id,
        titulo: agendaEventos.titulo,
        tipo: agendaEventos.tipo,
        dataHora: agendaEventos.dataHora,
        lembreteDias: agendaEventos.lembreteDias,
        status: agendaEventos.status,
        descricao: agendaEventos.descricao,
        clienteId: agendaEventos.clienteId,
        processoId: agendaEventos.processoId,
        clienteNome: clientes.nome,
        processoNumero: processos.numero,
        processoTitulo: processos.titulo,
      })
      .from(agendaEventos)
      .leftJoin(clientes, eq(agendaEventos.clienteId, clientes.id))
      .leftJoin(processos, eq(agendaEventos.processoId, processos.id))
      .orderBy(asc(agendaEventos.dataHora)),
  ]);

  const limite = new Date();
  limite.setDate(limite.getDate() + 7);
  const alertas = listaEventos.filter((evento) => evento.status === "pendente" && evento.dataHora <= limite);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Controle de compromissos"
        title="Agenda jurídica"
        description="Organize prazos, audiências, diligências e reuniões em uma única visão do escritório."
      />

      <section className="app-panel" id="novo-compromisso">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Novo compromisso</h3>
            <p className="panel-description">O horário informado é registrado no fuso de Brasília.</p>
          </div>
        </div>

        <form action={criarEventoAgenda} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          <label className="input-label xl:col-span-2">
            Título
            <input name="titulo" required placeholder="Ex.: Prazo para juntada de documentos" className="input-field" />
          </label>
          <label className="input-label">
            Tipo
            <select name="tipo" defaultValue="prazo" className="input-field">
              <option value="prazo">Prazo</option>
              <option value="audiencia">Audiência</option>
              <option value="reuniao">Reunião</option>
              <option value="diligencia">Diligência</option>
              <option value="outro">Outro</option>
            </select>
          </label>
          <label className="input-label">
            Data e horário
            <input name="dataHora" required type="datetime-local" className="input-field" />
          </label>
          <label className="input-label">
            Avisar com antecedência de
            <input name="lembreteDias" type="number" min="0" max="60" defaultValue="3" className="input-field" />
          </label>
          <label className="input-label">
            Situação inicial
            <select name="status" defaultValue="pendente" className="input-field">
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>
          <label className="input-label">
            Cliente relacionado
            <select name="clienteId" defaultValue="" className="input-field">
              <option value="">Sem cliente vinculado</option>
              {listaClientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </label>
          <label className="input-label xl:col-span-2">
            Processo relacionado
            <select name="processoId" defaultValue="" className="input-field">
              <option value="">Sem processo vinculado</option>
              {listaProcessos.map((processo) => (
                <option key={processo.id} value={processo.id}>
                  {processo.clienteNome} · {processo.numero} — {processo.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="input-label md:col-span-2 xl:col-span-3">
            Descrição ou observações
            <textarea name="descricao" rows={3} placeholder="Informações complementares, pauta ou providência necessária." className="input-field" />
          </label>
          <div className="flex justify-end md:col-span-2 xl:col-span-3">
            <button className="button button-primary" type="submit">
              <AppIcon name="plus" className="h-4 w-4" />
              Adicionar à agenda
            </button>
          </div>
        </form>
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Alertas de prazo</h3>
            <p className="panel-description">Pendências vencidas, para hoje ou previstas para os próximos sete dias.</p>
          </div>
          <span className="count-chip">{alertas.length} {alertas.length === 1 ? "alerta" : "alertas"}</span>
        </div>

        {alertas.length === 0 ? (
          <div className="empty-state">
            <AppIcon name="check" className="mx-auto mb-2 h-5 w-5 text-[#5f7b5f]" />
            Não há alertas pendentes no período.
          </div>
        ) : (
          <ul className="divide-y divide-[#eee9e1]">
            {alertas.map((evento) => {
              const prazo = classificarPrazo(evento.dataHora);
              return (
                <li key={evento.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`alert-indicator alert-indicator-${prazo.codigo}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <Link href={`/agenda/${evento.id}/editar`} className="font-semibold text-[#2c2823] transition-colors hover:text-[#715a31]">
                        {evento.titulo}
                      </Link>
                      <p className="mt-1 truncate text-xs text-[#837c71]">
                        {tiposAgenda[evento.tipo]} · {evento.clienteNome || evento.processoNumero || "Agenda interna"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`deadline-label deadline-label-${prazo.codigo}`}>{prazo.texto}</span>
                    <span className="hidden text-xs text-[#777168] sm:inline">{formatarDataHora(evento.dataHora)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Compromissos registrados</h3>
            <p className="panel-description">
              {listaEventos.length} {listaEventos.length === 1 ? "compromisso cadastrado" : "compromissos cadastrados"}.
            </p>
          </div>
        </div>

        {listaEventos.length === 0 ? (
          <p className="empty-state">Nenhum compromisso cadastrado até o momento.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table min-w-[70rem]" aria-label="Agenda jurídica">
              <thead>
                <tr>
                  <th>Data e horário</th>
                  <th>Compromisso</th>
                  <th>Vínculo</th>
                  <th>Lembrete</th>
                  <th>Situação</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaEventos.map((evento) => (
                  <tr key={evento.id}>
                    <td className="whitespace-nowrap text-[#4f4a42]">
                      <p className="font-semibold">{formatarDataHora(evento.dataHora)}</p>
                      {evento.status === "pendente" && <p className="mt-1 text-xs text-[#837c71]">{classificarPrazo(evento.dataHora).texto}</p>}
                    </td>
                    <td>
                      <p className="font-semibold text-[#2c2823]">{evento.titulo}</p>
                      <p className="mt-1 text-xs text-[#837c71]">{tiposAgenda[evento.tipo]}</p>
                    </td>
                    <td className="max-w-[16rem] text-[#69635a]">
                      <p className="truncate">{evento.clienteNome || "Agenda interna"}</p>
                      <p className="mt-1 truncate text-xs text-[#837c71]">
                        {evento.processoNumero ? `${evento.processoNumero} — ${evento.processoTitulo}` : "Sem processo vinculado"}
                      </p>
                    </td>
                    <td className="text-[#69635a]">{evento.lembreteDias === 0 ? "No mesmo dia" : `${evento.lembreteDias} dias antes`}</td>
                    <td><StatusBadge status={evento.status} kind="agenda" /></td>
                    <td>
                      <div className="flex justify-end gap-3">
                        <Link href={`/agenda/${evento.id}/editar`} className="text-link">Editar</Link>
                        <Link href={`/historico?entidade=agenda&entidadeId=${evento.id}`} className="text-link">Histórico</Link>
                        {evento.status === "pendente" && (
                          <form action={concluirEventoAgenda}>
                            <input type="hidden" name="id" value={evento.id} />
                            <button className="text-link" type="submit">Concluir</button>
                          </form>
                        )}
                        <form action={excluirEventoAgenda}>
                          <input type="hidden" name="id" value={evento.id} />
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
