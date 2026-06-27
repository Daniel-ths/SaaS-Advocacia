"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { documentos } from "@/lib/db/schema";

const TAMANHO_MAXIMO = 4_500_000;

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export async function enviarDocumento(formData: FormData) {
  const db = getDb();
  const clienteId = texto(formData, "clienteId");
  const processoId = texto(formData, "processoId");
  const arquivo = formData.get("arquivo");

  if (!clienteId) throw new Error("Escolha o cliente do documento.");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    throw new Error("Escolha um arquivo válido.");
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new Error("O arquivo deve ter no máximo 4,5 MB nesta etapa temporária.");
  }

  const conteudoBase64 = Buffer.from(await arquivo.arrayBuffer()).toString("base64");

  await db.insert(documentos).values({
    clienteId,
    processoId: processoId || null,
    nomeArquivo: arquivo.name,
    mimeType: arquivo.type || "application/octet-stream",
    tamanhoBytes: arquivo.size,
    conteudoBase64,
  });

  revalidatePath("/");
  revalidatePath("/documentos");
  revalidatePath(`/clientes/${clienteId}`);
  redirect("/documentos");
}

export async function excluirDocumento(formData: FormData) {
  const db = getDb();
  const id = texto(formData, "id");
  const clienteId = texto(formData, "clienteId");
  if (!id) throw new Error("Documento inválido.");

  await db.delete(documentos).where(eq(documentos.id, id));
  revalidatePath("/");
  revalidatePath("/documentos");
  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
}
