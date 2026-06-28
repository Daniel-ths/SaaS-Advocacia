import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { atualizarProcesso } from "@/app/actions/processos";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { clientes, processos } from "@/lib/db/schema";
import { formatarDataParaInput } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditarProcessoPage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const [processo, listaClientes] = await Promise.all([
    db.query.processos.findFirst({ where: eq(processos.id, id) }),
    db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).orderBy(asc(clientes.nome)),
  ]);

  if (!processo) {
    return (
      <section className="app-panel mx-auto max-w-xl p-10 text-center">
        <h2 className="page-title text-2xl">Processo não encontrado</h2>
        <p className="mt-3 text-sm leading-6 text-[#756e63]">Este registro não existe ou já foi removido da base.</p>
        <Link href="/processos" className="button button-secondary mt-6">Voltar para processos</Link>
      </section>
    );
  }

  const salvar = atualizarProcesso.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link href="/processos" className="text-link">
        <AppIcon name="arrow-left" className="h-3.5 w-3.5" />
        Voltar para processos
      </Link>

      <PageHeader
        eyebrow="Atualização processual"
        title="Editar processo"
        description={`Revise os dados de “${processo.numero} — ${processo.titulo}”.`}
        actions={
          <>
            <StatusBadge status={processo.status} kind="processo" />
            <Link href={`/historico?entidade=processo&entidadeId=${processo.id}`} className="button button-secondary">
              <AppIcon name="history" className="h-4 w-4" />
              Histórico
            </Link>
          </>
        }
      />

      <form action={salvar} className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Dados do processo</h3>
            <p className="panel-description">Mantenha o próximo prazo atualizado para que os alertas funcionem corretamente.</p>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="input-label sm:col-span-2">
            Cliente
            <select name="clienteId" defaultValue={processo.clienteId} required className="input-field">
              {listaClientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </label>
          <label className="input-label">
            Número do processo
            <input name="numero" defaultValue={processo.numero} required className="input-field" />
          </label>
          <label className="input-label">
            Título ou assunto
            <input name="titulo" defaultValue={processo.titulo} required className="input-field" />
          </label>
          <label className="input-label">
            Área jurídica
            <input name="area" defaultValue={processo.area || ""} className="input-field" />
          </label>
          <label className="input-label">
            Situação
            <select name="status" defaultValue={processo.status} className="input-field">
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em andamento</option>
              <option value="aguardando">Aguardando</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </label>
          <label className="input-label">
            Próximo prazo
            <input name="prazo" type="date" defaultValue={formatarDataParaInput(processo.prazo)} className="input-field" />
          </label>
          <label className="input-label sm:col-span-2">
            Observações
            <textarea name="observacao" defaultValue={processo.observacao || ""} rows={5} className="input-field" />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#ebe7df] px-5 py-4">
          <Link href="/processos" className="button button-secondary">Cancelar</Link>
          <button className="button button-primary" type="submit">Salvar alterações</button>
        </div>
      </form>
    </div>
  );
}
