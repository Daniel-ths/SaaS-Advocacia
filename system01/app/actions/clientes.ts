"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { clientes } from "@/lib/db/schema";

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function statusCliente(valor: string) {
  return valor === "inativo" || valor === "prospecto" ? valor : "ativo";
}

export async function criarCliente(formData: FormData) {
  const db = getDb();
  const nome = texto(formData, "nome");
  if (!nome) throw new Error("Informe o nome do cliente.");

  await db.insert(clientes).values({
    nome,
    email: texto(formData, "email") || null,
    telefone: texto(formData, "telefone") || null,
    cpfCnpj: texto(formData, "cpfCnpj") || null,
    status: statusCliente(texto(formData, "status")),
    observacao: texto(formData, "observacao") || null,
  });

  revalidatePath("/");
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function atualizarCliente(id: string, formData: FormData) {
  const db = getDb();
  const nome = texto(formData, "nome");
  if (!nome) throw new Error("Informe o nome do cliente.");

  await db
    .update(clientes)
    .set({
      nome,
      email: texto(formData, "email") || null,
      telefone: texto(formData, "telefone") || null,
      cpfCnpj: texto(formData, "cpfCnpj") || null,
      status: statusCliente(texto(formData, "status")),
      observacao: texto(formData, "observacao") || null,
      updatedAt: new Date(),
    })
    .where(eq(clientes.id, id));

  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function excluirCliente(formData: FormData) {
  const db = getDb();
  const id = texto(formData, "id");
  if (!id) throw new Error("Cliente inválido.");

  await db.delete(clientes).where(eq(clientes.id, id));
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/processos");
  revalidatePath("/documentos");
}
