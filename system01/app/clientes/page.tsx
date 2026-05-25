import { createClient } from "@/lib/supabase/server";
import { createCliente, deleteCliente } from "./actions";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: string;
  observacao: string | null;
  created_at: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    lead: "Lead",
    atendimento: "Em atendimento",
    cliente: "Cliente",
    arquivado: "Arquivado",
  };

  return labels[status] || status;
}

function getStatusStyle(status: string) {
  const styles: Record<string, string> = {
    lead: "bg-blue-50 text-blue-700 border-blue-200",
    atendimento: "bg-amber-50 text-amber-700 border-amber-200",
    cliente: "bg-emerald-50 text-emerald-700 border-emerald-200",
    arquivado: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

export default async function ClientesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, telefone, email, status, observacao, created_at")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const clientes = (data || []) as Cliente[];

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-2">
              Gestão de clientes
            </p>

            <h2 className="text-2xl font-semibold text-slate-950">
              Clientes e leads do escritório
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Cadastre contatos, acompanhe o status de atendimento e mantenha a
              base separada por usuário logado.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 min-w-[180px]">
            <p className="text-sm text-slate-500">Total cadastrado</p>
            <p className="text-3xl font-semibold text-slate-950 mt-1">
              {clientes.length}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 h-fit">
          <h3 className="text-lg font-semibold text-slate-950">
            Novo cliente
          </h3>

          <p className="text-sm text-slate-500 mt-1 mb-5">
            Preencha os dados principais para criar um registro.
          </p>

          <form action={createCliente} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome completo
              </label>

              <input
                name="nome"
                required
                placeholder="Ex: Maria Oliveira"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telefone
              </label>

              <input
                name="telefone"
                placeholder="Ex: (91) 99999-9999"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail
              </label>

              <input
                name="email"
                type="email"
                placeholder="cliente@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>

              <select
                name="status"
                defaultValue="lead"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
              >
                <option value="lead">Lead</option>
                <option value="atendimento">Em atendimento</option>
                <option value="cliente">Cliente</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Observação
              </label>

              <textarea
                name="observacao"
                rows={4}
                placeholder="Ex: Cliente veio pelo WhatsApp, deseja atendimento trabalhista..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-3 transition-colors"
            >
              Cadastrar cliente
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-950">
              Lista de clientes
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Registros salvos no Supabase.
            </p>
          </div>

          {error ? (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Erro ao carregar clientes: {error.message}
              </div>
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-8 sm:p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
                👤
              </div>

              <p className="font-medium text-slate-800">
                Nenhum cliente cadastrado ainda
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Use o formulário ao lado para criar o primeiro registro.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="p-5 sm:p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-950">
                          {cliente.nome}
                        </h4>

                        <span
                          className={`text-xs font-medium border rounded-full px-2.5 py-1 ${getStatusStyle(
                            cliente.status
                          )}`}
                        >
                          {getStatusLabel(cliente.status)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-500">
                        <p>
                          <span className="font-medium text-slate-700">
                            Telefone:
                          </span>{" "}
                          {cliente.telefone || "-"}
                        </p>

                        <p>
                          <span className="font-medium text-slate-700">
                            E-mail:
                          </span>{" "}
                          {cliente.email || "-"}
                        </p>

                        <p>
                          <span className="font-medium text-slate-700">
                            Cadastro:
                          </span>{" "}
                          {formatDate(cliente.created_at)}
                        </p>
                      </div>

                      {cliente.observacao && (
                        <p className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                          {cliente.observacao}
                        </p>
                      )}
                    </div>

                    <form action={deleteCliente}>
                      <input type="hidden" name="id" value={cliente.id} />

                      <button
                        type="submit"
                        className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-xl transition-colors"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}