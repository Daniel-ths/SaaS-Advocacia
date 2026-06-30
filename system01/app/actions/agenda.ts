"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dadosParaHistorico, registrarHistorico } from "@/lib/audit";
import { getDb } from "@/lib/db/client";
import { agendaEventos, processos } from "@/lib/db/schema";
import { parseDataHoraDoFormulario } from "@/lib/format";

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function inteiro(formData: FormData, campo: string, padrao: number) {
  const valor = Number(texto(formData, campo));
  if (!Number.isFinite(valor)) return padrao;
  return Math.min(Math.max(Math.trunc(valor), 0), 60);
}

function tipoAgenda(valor: string) {
  if (valor === "audiencia" || valor === "reuniao" || valor === "diligencia" || valor === "outro") return valor;
  return "prazo";
}

function statusAgenda(valor: string) {
  if (valor === "concluido" || valor === "cancelado") return valor;
  return "pendente";
}

function dadosEvento(evento: typeof agendaEventos.$inferSelect) {
  return dadosParaHistorico({
    titulo: evento.titulo,
    tipo: evento.tipo,
    dataHora: evento.dataHora,
    clienteId: evento.clienteId,
    processoId: evento.processoId,
    lembreteDias: evento.lembreteDias,
    status: evento.status,
    descricao: evento.descricao,
  });
}

function revalidarAgenda(clienteId?: string | null, eventoId?: string) {
  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/processos");
  revalidatePath("/relatorios");
  revalidatePath("/historico");
  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
  if (eventoId) revalidatePath(`/agenda/${eventoId}/editar`);
}

async function resolverVinculos(db: ReturnType<typeof getDb>, clienteIdInformado: string, processoId: string) {
  if (!processoId) return { clienteId: clienteIdInformado || null, processoId: null };

  const processo = await db.query.processos.findFirst({ where: eq(processos.id, processoId) });
  if (!processo) throw new Error("O processo selecionado não foi encontrado.");
  if (clienteIdInformado && clienteIdInformado !== processo.clienteId) {
    throw new Error("O processo escolhido não pertence ao cliente informado.");
  }

  return { clienteId: processo.clienteId, processoId: processo.id };
}

export async function criarEventoAgenda(formData: FormData) {
  const db = getDb();
  const titulo = texto(formData, "titulo");
  const dataHora = parseDataHoraDoFormulario(texto(formData, "dataHora"));

  if (!titulo || !dataHora) {
    throw new Error("Informe o título e a data do compromisso.");
  }

  const vinculos = await resolverVinculos(db, texto(formData, "clienteId"), texto(formData, "processoId"));

  const [novoEvento] = await db
    .insert(agendaEventos)
    .values({
      titulo,
      tipo: tipoAgenda(texto(formData, "tipo")),
      dataHora,
      clienteId: vinculos.clienteId,
      processoId: vinculos.processoId,
      lembreteDias: inteiro(formData, "lembreteDias", 3),
      status: statusAgenda(texto(formData, "status")),
      descricao: texto(formData, "descricao") || null,
    })
    .returning();

  if (!novoEvento) throw new Error("Não foi possível incluir o compromisso.");

  await registrarHistorico(db, {
    entidade: "agenda",
    entidadeId: novoEvento.id,
    acao: "criado",
    descricao: `Compromisso “${novoEvento.titulo}” incluído na agenda.`,
    dadosNovos: dadosEvento(novoEvento),
  });

revalidarAgenda(novoEvento.clienteId ?? undefined, novoEvento.id);
  redirect("/agenda");
}

export async function atualizarEventoAgenda(id: string, formData: FormData) {
  const db = getDb();
  const titulo = texto(formData, "titulo");
  const dataHora = parseDataHoraDoFormulario(texto(formData, "dataHora"));

  if (!titulo || !dataHora) {
    throw new Error("Informe o título e a data do compromisso.");
  }

  const eventoAnterior = await db.query.agendaEventos.findFirst({ where: eq(agendaEventos.id, id) });
  if (!eventoAnterior) throw new Error("Compromisso não encontrado.");

  const vinculos = await resolverVinculos(db, texto(formData, "clienteId"), texto(formData, "processoId"));

  const [eventoAtualizado] = await db
    .update(agendaEventos)
    .set({
      titulo,
      tipo: tipoAgenda(texto(formData, "tipo")),
      dataHora,
      clienteId: vinculos.clienteId,
      processoId: vinculos.processoId,
      lembreteDias: inteiro(formData, "lembreteDias", 3),
      status: statusAgenda(texto(formData, "status")),
      descricao: texto(formData, "descricao") || null,
      updatedAt: new Date(),
    })
    .where(eq(agendaEventos.id, id))
    .returning();

  if (!eventoAtualizado) throw new Error("Não foi possível atualizar o compromisso.");

  await registrarHistorico(db, {
    entidade: "agenda",
    entidadeId: id,
    acao: "atualizado",
    descricao: `Compromisso “${eventoAtualizado.titulo}” atualizado.`,
    dadosAnteriores: dadosEvento(eventoAnterior),
    dadosNovos: dadosEvento(eventoAtualizado),
  });

revalidarAgenda(eventoAnterior.clienteId, id);
if (eventoAtualizado.clienteId !== eventoAnterior.clienteId) {
  revalidarAgenda(eventoAtualizado.clienteId, id);
}
  redirect("/agenda");
}

export async function concluirEventoAgenda(formData: FormData) {
  const db = getDb();
  const id = texto(formData, "id");
  if (!id) throw new Error("Compromisso inválido.");

  const evento = await db.query.agendaEventos.findFirst({ where: eq(agendaEventos.id, id) });
  if (!evento) throw new Error("Compromisso não encontrado.");

  const [eventoConcluido] = await db
    .update(agendaEventos)
    .set({ status: "concluido", updatedAt: new Date() })
    .where(eq(agendaEventos.id, id))
    .returning();

  if (!eventoConcluido) throw new Error("Não foi possível concluir o compromisso.");

  await registrarHistorico(db, {
    entidade: "agenda",
    entidadeId: id,
    acao: "concluido",
    descricao: `Compromisso “${eventoConcluido.titulo}” marcado como concluído.`,
    dadosAnteriores: dadosEvento(evento),
    dadosNovos: dadosEvento(eventoConcluido),
  });

  revalidarAgenda(eventoConcluido.clienteId, id);
}

export async function excluirEventoAgenda(formData: FormData) {
  const db = getDb();
  const id = texto(formData, "id");
  if (!id) throw new Error("Compromisso inválido.");

  const evento = await db.query.agendaEventos.findFirst({ where: eq(agendaEventos.id, id) });
  if (!evento) throw new Error("Compromisso não encontrado.");

  await db.delete(agendaEventos).where(eq(agendaEventos.id, id));

  await registrarHistorico(db, {
    entidade: "agenda",
    entidadeId: id,
    acao: "excluido",
    descricao: `Compromisso “${evento.titulo}” removido da agenda.`,
    dadosAnteriores: dadosEvento(evento),
  });

  revalidarAgenda(evento.clienteId);
}
