import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";
import { AppIcon, type AppIconName } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { agendaEventos, clientes, documentos, processos } from "@/lib/db/schema";
import { classificarPrazo, formatarData, formatarDataHora, formatarTamanho } from "@/lib/format";

export const dynamic = "force-dynamic";

type Alerta = {
  id: string;
  data: Date;
  titulo: string;
  descricao: string;
  href: string;
  origem: "processo" | "agenda";
};

export default async function DashboardPage() {
  const db = getDb();
  const [
    contagemClientes,
    contagemProcessos,
    contagemAgenda,
    contagemDocumentos,
    ultimosClientes,
    ultimosDocumentos,
    processosComPrazo,
    eventosPendentes,
  ] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(clientes),
    db.select({ total: sql<number>`count(*)::int` }).from(processos),
    db.select({ total: sql<number>`count(*)::int` }).from(agendaEventos),
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
      .innerJoin(clientes, eq(documentos.clienteId, clientes.id))
      .orderBy(desc(documentos.createdAt))
      .limit(5),
    db
      .select({
        id: processos.id,
        numero: processos.numero,
        titulo: processos.titulo,
        prazo: processos.prazo,
        status: processos.status,
        clienteNome: clientes.nome,
      })
      .from(processos)
      .innerJoin(clientes, eq(processos.clienteId, clientes.id))
      .orderBy(asc(processos.prazo)),
    db
      .select({
        id: agendaEventos.id,
        titulo: agendaEventos.titulo,
        dataHora: agendaEventos.dataHora,
        tipo: agendaEventos.tipo,
        status: agendaEventos.status,
        clienteNome: clientes.nome,
        processoNumero: processos.numero,
      })
      .from(agendaEventos)
      .leftJoin(clientes, eq(agendaEventos.clienteId, clientes.id))
      .leftJoin(processos, eq(agendaEventos.processoId, processos.id))
      .orderBy(asc(agendaEventos.dataHora)),
  ]);

  const limiteAlerta = new Date();
  limiteAlerta.setDate(limiteAlerta.getDate() + 7);

  const alertas: Alerta[] = [
    ...processosComPrazo
      .filter((processo) => processo.prazo && processo.status !== "encerrado" && processo.prazo <= limiteAlerta)
      .map((processo) => ({
        id: processo.id,
        data: processo.prazo as Date,
        titulo: processo.numero,
        descricao: `${processo.titulo} · ${processo.clienteNome}`,
        href: `/processos/${processo.id}/editar`,
        origem: "processo" as const,
      })),
    ...eventosPendentes
      .filter((evento) => evento.status === "pendente" && evento.dataHora <= limiteAlerta)
      .map((evento) => ({
        id: evento.id,
        data: evento.dataHora,
        titulo: evento.titulo,
        descricao: `${evento.tipo.replaceAll("_", " ")} · ${evento.clienteNome || evento.processoNumero || "Agenda interna"}`,
        href: `/agenda/${evento.id}/editar`,
        origem: "agenda" as const,
      })),
  ]
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(0, 6);

  const cards: { label: string; value: number; href: string; caption: string; icon: AppIconName }[] = [
    {
      label: "Clientes",
      value: Number(contagemClientes[0]?.total ?? 0),
      href: "/clientes",
      caption: "Base de atendimentos",
      icon: "clients",
    },
    {
      label: "Processos",
      value: Number(contagemProcessos[0]?.total ?? 0),
      href: "/processos",
      caption: "Registros acompanhados",
      icon: "processes",
    },
    {
      label: "Agenda",
      value: Number(contagemAgenda[0]?.total ?? 0),
      href: "/agenda",
      caption: "Compromissos registrados",
      icon: "agenda",
    },
    {
      label: "Documentos",
      value: Number(contagemDocumentos[0]?.total ?? 0),
      href: "/documentos",
      caption: "Arquivos organizados",
      icon: "documents",
    },
  ];

  const dataAtual = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Painel do escritório"
        title="Visão geral"
        description="Um panorama objetivo dos clientes, processos, compromissos e documentos em acompanhamento."
        actions={
          <div className="hidden items-center gap-2 border-l border-[#d7d0c6] pl-4 text-xs font-semibold text-[#756e63] md:flex">
            <AppIcon name="calendar" className="h-4 w-4 text-[#8a7040]" />
            {dataAtual}
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="metric-card group">
            <div className="flex items-start justify-between gap-3">
              <p className="metric-label">{card.label}</p>
              <AppIcon name={card.icon} className="h-4 w-4 text-[#9a9287] transition-colors group-hover:text-[#5f4e2d]" />
            </div>
            <p className="metric-value">{card.value}</p>
            <p className="metric-caption">{card.caption}</p>
          </Link>
        ))}
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Alertas de prazo</h3>
            <p className="panel-description">Itens vencidos, para hoje ou previstos para os próximos sete dias.</p>
          </div>
          <Link href="/agenda" className="text-link">
            Abrir agenda <AppIcon name="arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </div>

        {alertas.length === 0 ? (
          <div className="empty-state">
            <AppIcon name="check" className="mx-auto mb-2 h-5 w-5 text-[#5f7b5f]" />
            Nenhum prazo ou compromisso pendente nos próximos sete dias.
          </div>
        ) : (
          <ul className="divide-y divide-[#eee9e1]">
            {alertas.map((alerta) => {
              const prazo = classificarPrazo(alerta.data);
              return (
                <li key={`${alerta.origem}-${alerta.id}`} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`alert-indicator alert-indicator-${prazo.codigo}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <Link href={alerta.href} className="font-semibold text-[#2c2823] transition-colors hover:text-[#715a31]">
                        {alerta.titulo}
                      </Link>
                      <p className="mt-1 truncate text-xs text-[#837c71]">{alerta.descricao}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-right">
                    <span className={`deadline-label deadline-label-${prazo.codigo}`}>{prazo.texto}</span>
                    <span className="hidden text-xs text-[#777168] sm:inline">{formatarDataHora(alerta.data)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
        <div className="app-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Clientes recentes</h3>
              <p className="panel-description">Últimos cadastros registrados no escritório.</p>
            </div>
            <Link href="/clientes" className="text-link">
              Ver clientes <AppIcon name="arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </div>

          {ultimosClientes.length === 0 ? (
            <p className="empty-state">Nenhum cliente cadastrado até o momento.</p>
          ) : (
            <ul className="divide-y divide-[#eee9e1]">
              {ultimosClientes.map((cliente) => (
                <li key={cliente.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="truncate font-semibold text-[#27241f] transition-colors hover:text-[#715a31]"
                    >
                      {cliente.nome}
                    </Link>
                    <p className="mt-1 text-xs text-[#837c71]">Cadastro em {formatarData(cliente.createdAt)}</p>
                  </div>
                  <StatusBadge status={cliente.status} kind="cliente" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="app-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Documentos recentes</h3>
              <p className="panel-description">Arquivos enviados mais recentemente.</p>
            </div>
            <Link href="/documentos" className="text-link">
              Ver documentos <AppIcon name="arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </div>

          {ultimosDocumentos.length === 0 ? (
            <p className="empty-state">Nenhum documento enviado até o momento.</p>
          ) : (
            <ul className="divide-y divide-[#eee9e1]">
              {ultimosDocumentos.map((documento) => (
                <li key={documento.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <Link
                      href={`/documentos/${documento.id}/download`}
                      className="block truncate font-semibold text-[#27241f] transition-colors hover:text-[#715a31]"
                    >
                      {documento.nomeArquivo}
                    </Link>
                    <p className="mt-1 truncate text-xs text-[#837c71]">
                      {documento.clienteNome} · {formatarData(documento.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#817a70]">{formatarTamanho(documento.tamanhoBytes)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
