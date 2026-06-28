import Link from "next/link";
import { eq } from "drizzle-orm";
import { atualizarCliente } from "@/app/actions/clientes";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import { getDb } from "@/lib/db/client";
import { clientes } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });

  if (!cliente) {
    return (
      <section className="app-panel mx-auto max-w-xl p-10 text-center">
        <h2 className="page-title text-2xl">Cliente não encontrado</h2>
        <Link href="/clientes" className="button button-secondary mt-6">Voltar para clientes</Link>
      </section>
    );
  }

  const salvar = atualizarCliente.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link href={`/clientes/${id}`} className="text-link">
        <AppIcon name="arrow-left" className="h-3.5 w-3.5" />
        Voltar para o cadastro
      </Link>

      <PageHeader
        eyebrow="Atualização cadastral"
        title="Editar cliente"
        description={`Revise os dados de ${cliente.nome} e salve as alterações necessárias.`}
      />

      <form action={salvar} className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Dados do cliente</h3>
            <p className="panel-description">Campos marcados como obrigatórios precisam ser mantidos no cadastro.</p>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="input-label sm:col-span-2">
            Nome completo ou razão social
            <input name="nome" defaultValue={cliente.nome} required className="input-field" />
          </label>
          <label className="input-label">
            E-mail
            <input name="email" type="email" defaultValue={cliente.email || ""} className="input-field" />
          </label>
          <label className="input-label">
            Telefone
            <input name="telefone" defaultValue={cliente.telefone || ""} className="input-field" />
          </label>
          <label className="input-label">
            CPF ou CNPJ
            <input name="cpfCnpj" defaultValue={cliente.cpfCnpj || ""} className="input-field" />
          </label>
          <label className="input-label">
            Status
            <select name="status" defaultValue={cliente.status} className="input-field">
              <option value="ativo">Ativo</option>
              <option value="prospecto">Prospecto</option>
              <option value="inativo">Inativo</option>
            </select>
          </label>
          <label className="input-label sm:col-span-2">
            Observações
            <textarea name="observacao" defaultValue={cliente.observacao || ""} rows={5} className="input-field" />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#ebe7df] px-5 py-4">
          <Link href={`/clientes/${id}`} className="button button-secondary">Cancelar</Link>
          <button className="button button-primary" type="submit">Salvar alterações</button>
        </div>
      </form>
    </div>
  );
}
