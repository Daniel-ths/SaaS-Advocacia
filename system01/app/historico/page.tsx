import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import { getDb } from "@/lib/db/client";
import { historicoAlteracoes } from "@/lib/db/schema";
import { formatarDataHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const entidadeLabels: Record<string, string> = {
  cliente: "Cliente",
  processo: "Processo",
  documento: "Documento",
  agenda: "Agenda",
};

const acaoLabels: Record<string, string> = {
  criado: "Inclusão",
  atualizado: "Alteração",
  excluido: "Exclusão",
  concluido: "Conclusão",
  cancelado: "Cancelamento",
};

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ entidade?: string; entidadeId?: string }>;
}) {
  const db = getDb();
  const { entidade = "", entidadeId = "" } = await searchParams;

  const lista = entidade && entidadeId
    ? await db
        .select()
        .from(historicoAlteracoes)
        .where(and(eq(historicoAlteracoes.entidade, entidade), eq(historicoAlteracoes.entidadeId, entidadeId)))
        .orderBy(desc(historicoAlteracoes.createdAt))
        .limit(150)
    : entidade
      ? await db
          .select()
          .from(historicoAlteracoes)
          .where(eq(historicoAlteracoes.entidade, entidade))
          .orderBy(desc(historicoAlteracoes.createdAt))
          .limit(150)
      : await db.select().from(historicoAlteracoes).orderBy(desc(historicoAlteracoes.createdAt)).limit(150);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Rastreabilidade operacional"
        title="Histórico de alterações"
        description="Consulte inclusões, atualizações, conclusões e exclusões feitas no sistema."
      />

      <section className="notice">
        Enquanto a autenticação não estiver ativa, os registros são identificados pelo nome definido em <code>OPERADOR_LOCAL</code> no arquivo <code>.env.local</code>. Após a implementação do login, este campo passará a registrar o usuário autenticado.
      </section>

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Eventos registrados</h3>
            <p className="panel-description">Exibindo até 150 eventos, do mais recente para o mais antigo.</p>
          </div>
          <form action="/historico" className="flex flex-wrap items-end gap-2">
            {entidadeId && <input type="hidden" name="entidadeId" value={entidadeId} />}
            <label className="input-label min-w-[11rem]">
              Filtrar por área
              <select name="entidade" defaultValue={entidade} className="input-field">
                <option value="">Todas as áreas</option>
                <option value="cliente">Clientes</option>
                <option value="processo">Processos</option>
                <option value="documento">Documentos</option>
                <option value="agenda">Agenda</option>
              </select>
            </label>
            <button className="button button-secondary" type="submit">
              <AppIcon name="filter" className="h-4 w-4" />
              Filtrar
            </button>
            {(entidade || entidadeId) && <Link href="/historico" className="button button-secondary">Limpar</Link>}
          </form>
        </div>

        {lista.length === 0 ? (
          <p className="empty-state">Nenhuma alteração corresponde aos filtros selecionados.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table min-w-[63rem]" aria-label="Histórico de alterações">
              <thead>
                <tr>
                  <th>Data e horário</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Área</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap text-[#69635a]">{formatarDataHora(item.createdAt)}</td>
                    <td className="font-semibold text-[#4f4a42]">{item.usuarioNome}</td>
                    <td><span className="count-chip">{acaoLabels[item.acao] || item.acao}</span></td>
                    <td className="text-[#69635a]">{entidadeLabels[item.entidade] || item.entidade}</td>
                    <td className="max-w-[32rem] text-[#514d46]">{item.descricao}</td>
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
