import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { criarProcesso, excluirProcesso } from "@/app/actions/processos";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { getDb } from "@/lib/db/client";
import { clientes, processos } from "@/lib/db/schema";
import { classificarPrazo, formatarData } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProcessosPage({ searchParams }: { searchParams: Promise<{ clienteId?: string }> }) {
  const db = getDb();
  const { clienteId = "" } = await searchParams;
  const [listaClientes, listaProcessos] = await Promise.all([
    db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).orderBy(asc(clientes.nome)),
    db
      .select({
        id: processos.id,
        clienteId: processos.clienteId,
        numero: processos.numero,
        titulo: processos.titulo,
        area: processos.area,
        status: processos.status,
        prazo: processos.prazo,
        createdAt: processos.createdAt,
        clienteNome: clientes.nome,
      })
      .from(processos)
      .innerJoin(clientes, eq(processos.clienteId, clientes.id))
      .orderBy(desc(processos.createdAt)),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Controle jurídico"
        title="Processos"
        description="Registre o andamento, os dados essenciais e os próximos prazos de cada demanda."
      />

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Novo processo</h3>
            <p className="panel-description">Associe a demanda ao cliente antes de concluir o cadastro.</p>
          </div>
        </div>

        {listaClientes.length === 0 ? (
          <div className="p-5">
            <p className="notice">
              Cadastre pelo menos um cliente antes de abrir um processo. {" "}
              <Link href="/clientes" className="font-bold underline underline-offset-2">Ir para clientes</Link>
            </p>
          </div>
        ) : (
          <form action={criarProcesso} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <label className="input-label">
              Cliente
              <select name="clienteId" defaultValue={clienteId} required className="input-field">
                <option value="" disabled>Selecione o cliente</option>
                {listaClientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </label>
            <label className="input-label">
              Número do processo
              <input name="numero" required placeholder="Ex.: 0000000-00.0000.0.00.0000" className="input-field" />
            </label>
            <label className="input-label">
              Título ou assunto
              <input name="titulo" required placeholder="Ex.: Ação previdenciária" className="input-field" />
            </label>
            <label className="input-label">
              Área jurídica
              <input name="area" placeholder="Ex.: Previdenciário" className="input-field" />
            </label>
            <label className="input-label">
              Situação
              <select name="status" defaultValue="aberto" className="input-field">
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em andamento</option>
                <option value="aguardando">Aguardando</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </label>
            <label className="input-label">
              Próximo prazo
              <input name="prazo" type="date" className="input-field" />
            </label>
            <label className="input-label md:col-span-2 xl:col-span-3">
              Observações
              <textarea name="observacao" placeholder="Anotações de contexto ou próximos passos." rows={3} className="input-field" />
            </label>
            <div className="flex justify-end md:col-span-2 xl:col-span-3">
              <button className="button button-primary" type="submit">
                <AppIcon name="plus" className="h-4 w-4" />
                Cadastrar processo
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Processos cadastrados</h3>
            <p className="panel-description">
              {listaProcessos.length} {listaProcessos.length === 1 ? "processo registrado" : "processos registrados"}.
            </p>
          </div>
        </div>

        {listaProcessos.length === 0 ? (
          <p className="empty-state">Nenhum processo cadastrado até o momento.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table min-w-[62rem]" aria-label="Lista de processos">
              <thead>
                <tr>
                  <th>Processo</th>
                  <th>Cliente</th>
                  <th>Área</th>
                  <th>Status</th>
                  <th>Prazo</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaProcessos.map((processo) => {
                  const prazo = processo.prazo ? classificarPrazo(processo.prazo) : null;
                  return (
                    <tr key={processo.id}>
                      <td>
                        <p className="font-semibold text-[#2c2823]">{processo.numero}</p>
                        <p className="mt-1 max-w-[20rem] truncate text-xs text-[#837c71]">{processo.titulo}</p>
                      </td>
                      <td>
                        <Link href={`/clientes/${processo.clienteId}`} className="font-semibold text-[#504a41] transition-colors hover:text-[#715a31]">
                          {processo.clienteNome}
                        </Link>
                      </td>
                      <td className="text-[#69635a]">{processo.area || "—"}</td>
                      <td>
                        <StatusBadge status={processo.status} kind="processo" />
                      </td>
                      <td className="whitespace-nowrap text-[#69635a]">
                        <p>{formatarData(processo.prazo)}</p>
                        {prazo && prazo.codigo !== "futuro" && (
                          <span className={`deadline-label deadline-label-${prazo.codigo} mt-1`}>{prazo.texto}</span>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-3">
                          <Link href={`/processos/${processo.id}/editar`} className="text-link">Editar</Link>
                          <Link href={`/historico?entidade=processo&entidadeId=${processo.id}`} className="text-link">Histórico</Link>
                          <form action={excluirProcesso}>
                            <input type="hidden" name="id" value={processo.id} />
                            <input type="hidden" name="clienteId" value={processo.clienteId} />
                            <button className="destructive-link" type="submit">Excluir</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
