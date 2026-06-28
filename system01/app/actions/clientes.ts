"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dadosParaHistorico, registrarHistorico } from "@/lib/audit";
import { getDb } from "@/lib/db/client";
import { clientes } from "@/lib/db/schema";

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function statusCliente(valor: string) {
  return valor === "inativo" || valor === "prospecto" ? valor : "ativo";
}

function dadosCliente(cliente: typeof clientes.$inferSelect) {
  return dadosParaHistorico({
    nome: cliente.nome,
    email: cliente.email,
    telefone: cliente.telefone,
    cpfCnpj: cliente.cpfCnpj,
    status: cliente.status,
    observacao: cliente.observacao,
  });
}

function revalidarClientes(id?: string) {
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/processos");
  revalidatePath("/agenda");
  revalidatePath("/relatorios");
  revalidatePath("/historico");
  if (id) revalidatePath(`/clientes/${id}`);
}

export async function criarCliente(formData: FormData) {
  const db = getDb();
  const nome = texto(formData, "nome");
  if (!nome) throw new Error("Informe o nome do cliente.");

  const [novoCliente] = await db
    .insert(clientes)
    .values({
      nome,
      email: texto(formData, "email") || null,
      telefone: texto(formData, "telefone") || null,
      cpfCnpj: texto(formData, "cpfCnpj") || null,
      status: statusCliente(texto(formData, "status")),
      observacao: texto(formData, "observacao") || null,
    })
    .returning();

  if (!novoCliente) throw new Error("Não foi possível criar o cliente.");

  await registrarHistorico(db, {
    entidade: "cliente",
    entidadeId: novoCliente.id,
    acao: "criado",
    descricao: `Cliente “${novoCliente.nome}” cadastrado.`,
    dadosNovos: dadosCliente(novoCliente),
  });

  revalidarClientes(novoCliente.id);
  redirect("/clientes");
}

export async function atualizarCliente(id: string, formData: FormData) {
  const db = getDb();
  const nome = texto(formData, "nome");
  if (!nome) throw new Error("Informe o nome do cliente.");

  const clienteAnterior = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });
  if (!clienteAnterior) throw new Error("Cliente não encontrado.");

  const [clienteAtualizado] = await db
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
    .where(eq(clientes.id, id))
    .returning();

  if (!clienteAtualizado) throw new Error("Não foi possível atualizar o cliente.");

  await registrarHistorico(db, {
    entidade: "cliente",
    entidadeId: id,
    acao: "atualizado",
    descricao: `Dados do cliente “${clienteAtualizado.nome}” atualizados.`,
    dadosAnteriores: dadosCliente(clienteAnterior),
    dadosNovos: dadosCliente(clienteAtualizado),
  });

  revalidarClientes(id);
  redirect(`/clientes/${id}`);
}

export async function excluirCliente(formData: FormData) {
  const db = getDb();
  const id = texto(formData, "id");
  if (!id) throw new Error("Cliente inválido.");

  const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });
  if (!cliente) throw new Error("Cliente não encontrado.");

  await db.delete(clientes).where(eq(clientes.id, id));

  await registrarHistorico(db, {
    entidade: "cliente",
    entidadeId: id,
    acao: "excluido",
    descricao: `Cliente “${cliente.nome}” removido do sistema.`,
    dadosAnteriores: dadosCliente(cliente),
  });

  revalidarClientes();
}
