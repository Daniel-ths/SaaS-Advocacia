import Link from "next/link";
import { asc } from "drizzle-orm";
import { enviarDocumento } from "@/app/actions/documentos";
import { AppIcon } from "@/components/app-icon";
import PageHeader from "@/components/page-header";
import { getDb } from "@/lib/db/client";
import { clientes, processos } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function NovoDocumentoPage({ searchParams }: { searchParams: Promise<{ clienteId?: string }> }) {
  const db = getDb();
  const { clienteId = "" } = await searchParams;
  const [listaClientes, listaProcessos] = await Promise.all([
    db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).orderBy(asc(clientes.nome)),
    db
      .select({ id: processos.id, clienteId: processos.clienteId, numero: processos.numero, titulo: processos.titulo })
      .from(processos)
      .orderBy(asc(processos.titulo)),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link href="/documentos" className="text-link">
        <AppIcon name="arrow-left" className="h-3.5 w-3.5" />
        Voltar para documentos
      </Link>

      <PageHeader
        eyebrow="Inclusão de arquivo"
        title="Enviar documento"
        description="Vincule o arquivo ao cliente e, quando necessário, ao processo correspondente."
      />

      <section className="app-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Dados do arquivo</h3>
            <p className="panel-description">O limite temporário de envio nesta etapa é de 4,5 MB por arquivo.</p>
          </div>
        </div>

        {listaClientes.length === 0 ? (
          <div className="p-5">
            <p className="notice">
              Cadastre um cliente antes de enviar documentos. {" "}
              <Link href="/clientes" className="font-bold underline underline-offset-2">Ir para clientes</Link>
            </p>
          </div>
        ) : (
          <form action={enviarDocumento} className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
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
                Processo vinculado
                <select name="processoId" defaultValue="" className="input-field">
                  <option value="">Sem processo vinculado</option>
                  {listaProcessos.map((processo) => (
                    <option key={processo.id} value={processo.id}>{processo.numero} — {processo.titulo}</option>
                  ))}
                </select>
              </label>
              <label className="input-label sm:col-span-2">
                Arquivo
                <input name="arquivo" type="file" required className="input-field file-field" />
              </label>
            </div>
            <p className="notice">
              Nesta fase de desenvolvimento, os arquivos são armazenados diretamente no PostgreSQL. Para produção, a recomendação é migrar o armazenamento para um bucket dedicado.
            </p>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#ebe7df] pt-5">
              <Link href="/documentos" className="button button-secondary">Cancelar</Link>
              <button className="button button-primary" type="submit">
                <AppIcon name="plus" className="h-4 w-4" />
                Enviar arquivo
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
