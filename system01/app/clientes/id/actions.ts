"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProcesso(formData: FormData) {
  const supabase = await createClient();

  const cliente_id = formData.get("cliente_id") as string;
  const numero = formData.get("numero") as string;
  const titulo = formData.get("titulo") as string;
  const status = formData.get("status") as string;

  if (!cliente_id || !numero || !titulo) {
    throw new Error("Campos obrigatórios ausentes.");
  }

  const { error } = await supabase.from("processos").insert([
    {
      cliente_id,
      numero,
      titulo,
      status,
    },
  ]);

  if (error) {
    console.error("Erro ao inserir processo:", error.message);
    throw new Error("Não foi possível salvar o processo.");
  }


  revalidatePath(`/clientes/${cliente_id}`);
}