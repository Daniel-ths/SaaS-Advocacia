"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { processos } from "@/lib/db/schema";

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function statusProcesso(valor: string) {
  if (valor === "em_andamento" || valor === "aguardando" || valor === "encerrado") return valor;
  return "aberto";
}

export async function criarProcesso(formData: FormData) {
  const db = getDb();
  const clienteId = texto(formData, "clienteId");
  const numero = texto(formData, "numero");
  const titulo = texto(formData, "titulo");
  const prazo = texto(formData, "prazo");

  if (!clienteId || !numero || !titulo) {
    throw new Error("Cliente, número e título do processo são obrigatórios.");
  }

  await db.insert(processos).values({
    clienteId,
    numero,
    titulo,
    area: texto(formData, "area") || null,
    status: statusProcesso(texto(formData, "status")),
    prazo: prazo ? new Date(`${prazo}T12:00:00`) : null,
    observacao: texto(formData, "observacao") || null,
  });

  revalidatePath("/");
  revalidatePath("/processos");
  revalidatePath(`/clientes/${clienteId}`);
  redirect("/processos");
}

export async function excluirProcesso(formData: FormData) {
  const db = getDb();
  const id = texto(formData, "id");
  const clienteId = texto(formData, "clienteId");
  if (!id) throw new Error("Processo inválido.");

  await db.delete(processos).where(eq(processos.id, id));
  revalidatePath("/");
  revalidatePath("/processos");
  revalidatePath("/documentos");
  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
}
