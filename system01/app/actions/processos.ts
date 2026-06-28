"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dadosParaHistorico, registrarHistorico } from "@/lib/audit";
import { getDb } from "@/lib/db/client";
import { processos } from "@/lib/db/schema";
import { parseDataDoFormulario } from "@/lib/format";

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function statusProcesso(valor: string) {
  if (valor === "em_andamento" || valor === "aguardando" || valor === "encerrado") return valor;
  return "aberto";
}

function dadosProcesso(processo: typeof processos.$inferSelect) {
  return dadosParaHistorico({
    clienteId: processo.clienteId,
    numero: processo.numero,
    titulo: processo.titulo,
    area: processo.area,
    status: processo.status,
    prazo: processo.prazo,
    observacao: processo.observacao,
  });
}

function revalidarProcessos(clienteId?: string, processoId?: string) {
  revalidatePath("/");
  revalidatePath("/processos");
  revalidatePath("/agenda");
  revalidatePath("/relatorios");
  revalidatePath("/historico");
  revalidatePath("/documentos");
  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
  if (processoId) revalidatePath(`/processos/${processoId}/editar`);
}

export async function criarProcesso(formData: FormData) {
  const db = getDb();
  const clienteId = texto(formData, "clienteId");
  const numero = texto(formData, "numero");
  const titulo = texto(formData, "titulo");
  const prazo = parseDataDoFormulario(texto(formData, "prazo"));

  if (!clienteId || !numero || !titulo) {
    throw new Error("Cliente, número e título do processo são obrigatórios.");
  }

  const [novoProcesso] = await db
    .insert(processos)
    .values({
      clienteId,
      numero,
      titulo,
      area: texto(formData, "area") || null,
      status: statusProcesso(texto(formData, "status")),
      prazo,
      observacao: texto(formData, "observacao") || null,
    })
    .returning();

  if (!novoProcesso) throw new Error("Não foi possível criar o processo.");

  await registrarHistorico(db, {
    entidade: "processo",
    entidadeId: novoProcesso.id,
    acao: "criado",
    descricao: `Processo “${novoProcesso.numero} — ${novoProcesso.titulo}” cadastrado.`,
    dadosNovos: dadosProcesso(novoProcesso),
  });

  revalidarProcessos(clienteId, novoProcesso.id);
  redirect("/processos");
}

export async function atualizarProcesso(id: string, formData: FormData) {
  const db = getDb();
  const clienteId = texto(formData, "clienteId");
  const numero = texto(formData, "numero");
  const titulo = texto(formData, "titulo");
  const prazo = parseDataDoFormulario(texto(formData, "prazo"));

  if (!clienteId || !numero || !titulo) {
    throw new Error("Cliente, número e título do processo são obrigatórios.");
  }

  const processoAnterior = await db.query.processos.findFirst({ where: eq(processos.id, id) });
  if (!processoAnterior) throw new Error("Processo não encontrado.");

  const [processoAtualizado] = await db
    .update(processos)
    .set({
      clienteId,
      numero,
      titulo,
      area: texto(formData, "area") || null,
      status: statusProcesso(texto(formData, "status")),
      prazo,
      observacao: texto(formData, "observacao") || null,
      updatedAt: new Date(),
    })
    .where(eq(processos.id, id))
    .returning();

  if (!processoAtualizado) throw new Error("Não foi possível atualizar o processo.");

  await registrarHistorico(db, {
    entidade: "processo",
    entidadeId: id,
    acao: "atualizado",
    descricao: `Processo “${processoAtualizado.numero} — ${processoAtualizado.titulo}” atualizado.`,
    dadosAnteriores: dadosProcesso(processoAnterior),
    dadosNovos: dadosProcesso(processoAtualizado),
  });

  revalidarProcessos(processoAnterior.clienteId, id);
  if (processoAtualizado.clienteId !== processoAnterior.clienteId) {
    revalidarProcessos(processoAtualizado.clienteId, id);
  }
  redirect("/processos");
}

export async function excluirProcesso(formData: FormData) {
  const db = getDb();
  const id = texto(formData, "id");
  const clienteId = texto(formData, "clienteId");
  if (!id) throw new Error("Processo inválido.");

  const processo = await db.query.processos.findFirst({ where: eq(processos.id, id) });
  if (!processo) throw new Error("Processo não encontrado.");

  await db.delete(processos).where(eq(processos.id, id));

  await registrarHistorico(db, {
    entidade: "processo",
    entidadeId: id,
    acao: "excluido",
    descricao: `Processo “${processo.numero} — ${processo.titulo}” removido do sistema.`,
    dadosAnteriores: dadosProcesso(processo),
  });

  revalidarProcessos(clienteId || processo.clienteId);
}
