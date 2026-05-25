"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCarregando(true);
    setErro("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setCarregando(false);
      setErro("E-mail ou senha incorretos.");
      return;
    }

    if (!data.session) {
      setCarregando(false);
      setErro(
        "Login aceito, mas a sessão não foi criada. Verifique se o usuário está confirmado no Supabase."
      );
      return;
    }

    window.location.href = redirectTo;
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          E-mail
        </label>

        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-700"
          placeholder="Digite seu e-mail"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Senha
        </label>

        <input
          type="password"
          required
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-700"
          placeholder="Digite sua senha"
        />
      </div>

      {erro && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">
           Sistema de Login   
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Entre para acessar o sistema.
            </p>
          </div>

          <Suspense fallback={<div className="text-sm text-slate-500">Carregando...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Acesso legado para demonstração. Use as credenciais do Supabase para login.
        </p>
      </div>
    </main>
  );
}