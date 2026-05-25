"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCliente(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  const telefone = String(formData.get("telefone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const status = String(formData.get("status") || "lead").trim();
  const observacao = String(formData.get("observacao") || "").trim();

  if (!nome) {
    throw new Error("O nome do cliente é obrigatório.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase.from("clientes").insert({
    user_id: user.id,
    nome,
    telefone: telefone || null,
    email: email || null,
    status: status || "lead",
    observacao: observacao || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clientes");
}

export async function deleteCliente(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Cliente inválido.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clientes");
}