import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { atualizarEventoAgenda } from "@/app/actions/agenda";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { agendaEventos, clientes, processos } from "@/lib/db/schema";
import { formatarDataHoraParaInput } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditarAgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const [evento, listaClientes, listaProcessos] = await Promise.all([
    db.query.agendaEventos.findFirst({ where: eq(agendaEventos.id, id) }),
    db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).orderBy(asc(clientes.nome)),
    db
      .select({
        id: processos.id,
        numero: processos.numero,
        titulo: processos.titulo,
        clienteNome: clientes.nome,
      })
      .from(processos)
      .innerJoin(clientes, eq(processos.clienteId, clientes.id))
      .orderBy(asc(processos.titulo)),
  ]);

  if (!evento) {
    return (
      <section className="app-panel mx-auto max-w-xl p-10 text-center">
        <h2 className="page-title text-2xl">Compromisso não encontrado</h2>
        <p className="mt-3 text-sm leading-6 text-[#756e63]">Este registro não existe ou já foi removido da agenda.</p>
        <Link href="/agenda" className="button button-secondary mt-6">Voltar para agenda</Link>
      </section>
    );
  }

  const salvar = atualizarEventoAgenda.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link href="/agenda" className="text-link">
        <AppIcon name="arrow-left" className="h-3.5 w-3.5" />
        Voltar para agenda
      </Link>

      <PageHeader
        eyebrow="Atualização de compromisso"
        title="Editar compromisso"
        description="Atualize a data, os vínculos e a situação para manter os alertas corretos."
        actions={
          <>
            <StatusBadge status={evento.status} kind="agenda" />
            <Link href={`/historico?entidade=agenda&entidadeId=${evento.id}`} className="button button-secondary">
              <AppIcon name="history" className="h-4 w-4" />
              Histórico
            </Link>
          </>
        }
      />

      <form action={salvar} className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Dados do compromisso</h3>
            <p className="panel-description">O horário informado é registrado no fuso de Brasília.</p>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="input-label sm:col-span-2">
            Título
            <input name="titulo" required defaultValue={evento.titulo} className="input-field" />
          </label>
          <label className="input-label">
            Tipo
            <select name="tipo" defaultValue={evento.tipo} className="input-field">
              <option value="prazo">Prazo</option>
              <option value="audiencia">Audiência</option>
              <option value="reuniao">Reunião</option>
              <option value="diligencia">Diligência</option>
              <option value="outro">Outro</option>
            </select>
          </label>
          <label className="input-label">
            Data e horário
            <input name="dataHora" required type="datetime-local" defaultValue={formatarDataHoraParaInput(evento.dataHora)} className="input-field" />
          </label>
          <label className="input-label">
            Avisar com antecedência de
            <input name="lembreteDias" type="number" min="0" max="60" defaultValue={evento.lembreteDias} className="input-field" />
          </label>
          <label className="input-label">
            Situação
            <select name="status" defaultValue={evento.status} className="input-field">
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>
          <label className="input-label">
            Cliente relacionado
            <select name="clienteId" defaultValue={evento.clienteId || ""} className="input-field">
              <option value="">Sem cliente vinculado</option>
              {listaClientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </label>
          <label className="input-label">
            Processo relacionado
            <select name="processoId" defaultValue={evento.processoId || ""} className="input-field">
              <option value="">Sem processo vinculado</option>
              {listaProcessos.map((processo) => (
                <option key={processo.id} value={processo.id}>
                  {processo.clienteNome} · {processo.numero} — {processo.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="input-label sm:col-span-2">
            Descrição ou observações
            <textarea name="descricao" rows={5} defaultValue={evento.descricao || ""} className="input-field" />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#ebe7df] px-5 py-4">
          <Link href="/agenda" className="button button-secondary">Cancelar</Link>
          <button className="button button-primary" type="submit">Salvar alterações</button>
        </div>
      </form>
    </div>
  );
}
