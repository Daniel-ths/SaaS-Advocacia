import { historicoAlteracoes } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";

type AcaoHistorico = "criado" | "atualizado" | "excluido" | "concluido" | "cancelado";
type EntidadeHistorico = "cliente" | "processo" | "documento" | "agenda";

type RegistroHistorico = {
  entidade: EntidadeHistorico;
  entidadeId: string;
  acao: AcaoHistorico;
  descricao: string;
  dadosAnteriores?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
};

function nomeOperadorLocal() {
  const nome = process.env.OPERADOR_LOCAL?.trim();
  return nome ? nome.slice(0, 120) : "Equipe WY";
}

export async function registrarHistorico(
  db: ReturnType<typeof getDb>,
  registro: RegistroHistorico,
) {
  await db.insert(historicoAlteracoes).values({
    entidade: registro.entidade,
    entidadeId: registro.entidadeId,
    acao: registro.acao,
    descricao: registro.descricao,
    usuarioNome: nomeOperadorLocal(),
    dadosAnteriores: registro.dadosAnteriores ?? null,
    dadosNovos: registro.dadosNovos ?? null,
  });
}

export function dadosParaHistorico(dados: Record<string, unknown>) {
  return JSON.parse(
    JSON.stringify(dados, (_chave, valor: unknown) => (valor instanceof Date ? valor.toISOString() : valor)),
  ) as Record<string, unknown>;
}
