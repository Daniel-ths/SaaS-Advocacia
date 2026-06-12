// app/documentos/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function vincularCliente(formData: FormData) {
  const documento_id = formData.get("documento_id") as string;
  const cliente_id = formData.get("cliente_id") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("documentos")
    .update({ cliente_id: cliente_id })
    .eq("id", documento_id);

  if (error) throw new Error("Erro ao vincular cliente");

  revalidatePath("/documentos");
}