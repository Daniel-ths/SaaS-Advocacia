import { asc, desc, eq, isNotNull, sql } from "drizzle-orm";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import PrintReportButton from "@/components/print-report-button";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { agendaEventos, clientes, documentos, historicoAlteracoes, processos } from "@/lib/db/schema";
import { classificarPrazo, formatarData, formatarDataHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  aguardando: "Aguardando",
  encerrado: "Encerrado",
};

const acaoLabels: Record<string, string> = {
  criado: "Inclusão",
  atualizado: "Alteração",
  excluido: "Exclusão",
  concluido: "Conclusão",
  cancelado: "Cancelamento",
};

export default async function RelatoriosPage() {
  const db = getDb();
  const [
    totalClientes,
    totalProcessos,
    totalDocumentos,
    totalAgenda,
    processosPorStatus,
    processosPorArea,
    proximosEventos,
    ultimasAlteracoes,
  ] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(clientes),
    db.select({ total: sql<number>`count(*)::int` }).from(processos),
    db.select({ total: sql<number>`count(*)::int` }).from(documentos),
    db.select({ total: sql<number>`count(*)::int` }).from(agendaEventos),
    db
      .select({ status: processos.status, total: sql<number>`count(*)::int` })
      .from(processos)
      .groupBy(processos.status)
      .orderBy(asc(processos.status)),
    db
      .select({ area: processos.area, total: sql<number>`count(*)::int` })
      .from(processos)
      .where(isNotNull(processos.area))
      .groupBy(processos.area)
      .orderBy(desc(sql<number>`count(*)::int`))
      .limit(6),
    db
      .select({
        id: agendaEventos.id,
        titulo: agendaEventos.titulo,
        tipo: agendaEventos.tipo,
        dataHora: agendaEventos.dataHora,
        status: agendaEventos.status,
        clienteNome: clientes.nome,
      })
      .from(agendaEventos)
      .leftJoin(clientes, eq(agendaEventos.clienteId, clientes.id))
      .where(eq(agendaEventos.status, "pendente"))
      .orderBy(asc(agendaEventos.dataHora))
      .limit(8),
    db.select().from(historicoAlteracoes).orderBy(desc(historicoAlteracoes.createdAt)).limit(8),
  ]);

  const metricas = [
    { label: "Clientes", value: Number(totalClientes[0]?.total ?? 0), icon: "clients" as const },
    { label: "Processos", value: Number(totalProcessos[0]?.total ?? 0), icon: "processes" as const },
    { label: "Agenda", value: Number(totalAgenda[0]?.total ?? 0), icon: "agenda" as const },
    { label: "Documentos", value: Number(totalDocumentos[0]?.total ?? 0), icon: "documents" as const },
  ];

  const totalProcessosNumero = Math.max(Number(totalProcessos[0]?.total ?? 0), 1);
  const dataEmissao = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <div className="space-y-8" id="report-print-area">
      <PageHeader
        eyebrow="Consolidação gerencial"
        title="Relatórios gerais"
        description="Visão consolidada da operação para acompanhamento interno e emissão em PDF."
        actions={<div className="no-print"><PrintReportButton /></div>}
      />

      <div className="report-identity print-only">
        <p className="eyebrow">WY Advocacia</p>
        <h2>Relatório geral do escritório</h2>
        <p>Emitido em {dataEmissao}.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map((metrica) => (
          <div key={metrica.label} className="metric-card">
            <div className="flex items-start justify-between gap-3">
              <p className="metric-label">{metrica.label}</p>
              <AppIcon name={metrica.icon} className="h-4 w-4 text-[#8a7040]" />
            </div>
            <p className="metric-value">{metrica.value}</p>
            <p className="metric-caption">Total registrado no sistema</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="app-panel report-section">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Processos por situação</h3>
              <p className="panel-description">Distribuição atual da carteira processual.</p>
            </div>
          </div>
          {processosPorStatus.length === 0 ? (
            <p className="empty-state">Nenhum processo disponível para consolidação.</p>
          ) : (
            <div className="space-y-5 p-5">
              {processosPorStatus.map((item) => {
                const total = Number(item.total);
                const percentual = Math.round((total / totalProcessosNumero) * 100);
                return (
                  <div key={item.status}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} kind="processo" />
                        <span className="text-sm text-[#6f685e]">{statusLabels[item.status]}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#2c2823]">{total}</span>
                    </div>
                    <div className="report-bar-track"><span className="report-bar-fill" style={{ width: `${percentual}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="app-panel report-section">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Áreas mais acompanhadas</h3>
              <p className="panel-description">Agrupamento dos processos conforme a área jurídica cadastrada.</p>
            </div>
          </div>
          {processosPorArea.length === 0 ? (
            <p className="empty-state">As áreas jurídicas ainda não foram preenchidas nos processos.</p>
          ) : (
            <ul className="divide-y divide-[#eee9e1]">
              {processosPorArea.map((item) => (
                <li key={item.area} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="font-semibold text-[#39352f]">{item.area}</span>
                  <span className="count-chip">{item.total} {Number(item.total) === 1 ? "processo" : "processos"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="app-panel report-section">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Próximos compromissos pendentes</h3>
              <p className="panel-description">Agenda ordenada pela data e horário do compromisso.</p>
            </div>
          </div>
          {proximosEventos.length === 0 ? (
            <p className="empty-state">Não há compromissos pendentes na agenda.</p>
          ) : (
            <ul className="divide-y divide-[#eee9e1]">
              {proximosEventos.map((evento) => {
                const prazo = classificarPrazo(evento.dataHora);
                return (
                  <li key={evento.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#2c2823]">{evento.titulo}</p>
                      <p className="mt-1 text-xs text-[#837c71]">{evento.clienteNome || "Agenda interna"} · {evento.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#4f4a42]">{formatarDataHora(evento.dataHora)}</p>
                      <span className={`deadline-label deadline-label-${prazo.codigo} mt-1`}>{prazo.texto}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="app-panel report-section">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Atividade recente</h3>
              <p className="panel-description">Últimas alterações registradas no sistema.</p>
            </div>
          </div>
          {ultimasAlteracoes.length === 0 ? (
            <p className="empty-state">Nenhuma alteração foi registrada ainda.</p>
          ) : (
            <ul className="divide-y divide-[#eee9e1]">
              {ultimasAlteracoes.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <p className="text-sm font-semibold text-[#39352f]">{item.descricao}</p>
                  <p className="mt-1 text-xs text-[#837c71]">
                    {acaoLabels[item.acao] || item.acao} · {item.usuarioNome} · {formatarData(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="report-footer">Relatório emitido em {dataEmissao}. Dados extraídos do ambiente interno WY Advocacia.</p>
    </div>
  );
}
