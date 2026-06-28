import Link from "next/link";
import { asc, desc, ilike, or } from "drizzle-orm";
import { criarCliente, excluirCliente } from "@/app/actions/clientes";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { clientes } from "@/lib/db/schema";
import { formatarData } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const db = getDb();
  const { q = "" } = await searchParams;
  const busca = q.trim();
  const lista = busca
    ? await db
        .select()
        .from(clientes)
        .where(
          or(
            ilike(clientes.nome, `%${busca}%`),
            ilike(clientes.email, `%${busca}%`),
            ilike(clientes.cpfCnpj, `%${busca}%`),
          ),
        )
        .orderBy(asc(clientes.nome))
    : await db.select().from(clientes).orderBy(desc(clientes.createdAt));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cadastro e acompanhamento"
        title="Clientes"
        description="Mantenha os dados essenciais organizados desde o primeiro contato até a conclusão do atendimento."
      />

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Novo cliente</h3>
            <p className="panel-description">Preencha os dados básicos para iniciar um novo registro.</p>
          </div>
        </div>

        <form action={criarCliente} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          <label className="input-label xl:col-span-2">
            Nome completo ou razão social
            <input name="nome" required placeholder="Ex.: Maria de Souza" className="input-field" />
          </label>
          <label className="input-label">
            Status do cadastro
            <select name="status" defaultValue="ativo" className="input-field">
              <option value="ativo">Ativo</option>
              <option value="prospecto">Prospecto</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
          <label className="input-label">
            E-mail
            <input name="email" type="email" placeholder="nome@exemplo.com" className="input-field" />
          </label>
          <label className="input-label">
            Telefone
            <input name="telefone" placeholder="(00) 00000-0000" className="input-field" />
          </label>
          <label className="input-label">
            CPF ou CNPJ
            <input name="cpfCnpj" placeholder="Somente números ou formatado" className="input-field" />
          </label>
          <label className="input-label md:col-span-2 xl:col-span-3">
            Observações
            <textarea name="observacao" placeholder="Informações importantes para o atendimento, se necessário." className="input-field" rows={3} />
          </label>
          <div className="flex justify-end md:col-span-2 xl:col-span-3">
            <button className="button button-primary" type="submit">
              <AppIcon name="plus" className="h-4 w-4" />
              Cadastrar cliente
            </button>
          </div>
        </form>
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Base de clientes</h3>
            <p className="panel-description">
              {lista.length} {lista.length === 1 ? "registro encontrado" : "registros encontrados"}.
            </p>
          </div>
          <form className="flex w-full gap-2 sm:w-auto" action="/clientes">
            <label className="relative min-w-0 flex-1 sm:w-80">
              <span className="sr-only">Buscar clientes</span>
              <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c8579]" />
              <input
                defaultValue={busca}
                name="q"
                placeholder="Nome, e-mail ou CPF"
                className="input-field pl-9"
              />
            </label>
            <button className="button button-secondary shrink-0" type="submit">Buscar</button>
          </form>
        </div>

        {lista.length === 0 ? (
          <p className="empty-state">Nenhum cliente corresponde à busca informada.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" aria-label="Lista de clientes">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <Link href={`/clientes/${cliente.id}`} className="font-semibold text-[#2c2823] transition-colors hover:text-[#715a31]">
                        {cliente.nome}
                      </Link>
                      <p className="mt-1 text-xs text-[#837c71]">{cliente.cpfCnpj || "CPF/CNPJ não informado"}</p>
                    </td>
                    <td>
                      <p>{cliente.email || "—"}</p>
                      <p className="mt-1 text-xs text-[#837c71]">{cliente.telefone || "—"}</p>
                    </td>
                    <td>
                      <StatusBadge status={cliente.status} kind="cliente" />
                    </td>
                    <td className="whitespace-nowrap text-[#69635a]">{formatarData(cliente.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/clientes/${cliente.id}`} className="text-link">
                          Abrir <AppIcon name="arrow-right" className="h-3.5 w-3.5" />
                        </Link>
                        <form action={excluirCliente}>
                          <input type="hidden" name="id" value={cliente.id} />
                          <button className="destructive-link" type="submit">Excluir</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
