import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const statusClienteEnum = pgEnum("status_cliente", [
  "ativo",
  "inativo",
  "prospecto",
]);

export const statusProcessoEnum = pgEnum("status_processo", [
  "aberto",
  "em_andamento",
  "aguardando",
  "encerrado",
]);

export const tipoAgendaEnum = pgEnum("tipo_agenda", [
  "prazo",
  "audiencia",
  "reuniao",
  "diligencia",
  "outro",
]);

export const statusAgendaEnum = pgEnum("status_agenda", [
  "pendente",
  "concluido",
  "cancelado",
]);

export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nome: varchar("nome", { length: 160 }).notNull(),
    email: varchar("email", { length: 160 }),
    telefone: varchar("telefone", { length: 30 }),
    cpfCnpj: varchar("cpf_cnpj", { length: 18 }),
    status: statusClienteEnum("status").default("ativo").notNull(),
    observacao: text("observacao"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("clientes_status_idx").on(table.status),
    index("clientes_nome_idx").on(table.nome),
  ],
);

export const processos = pgTable(
  "processos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    numero: varchar("numero", { length: 80 }).notNull(),
    titulo: varchar("titulo", { length: 200 }).notNull(),
    area: varchar("area", { length: 100 }),
    status: statusProcessoEnum("status").default("aberto").notNull(),
    prazo: timestamp("prazo", { withTimezone: true }),
    observacao: text("observacao"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("processos_cliente_idx").on(table.clienteId),
    index("processos_status_idx").on(table.status),
    index("processos_prazo_idx").on(table.prazo),
  ],
);

export const documentos = pgTable(
  "documentos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clienteId: uuid("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    processoId: uuid("processo_id").references(() => processos.id, {
      onDelete: "set null",
    }),
    nomeArquivo: varchar("nome_arquivo", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    tamanhoBytes: integer("tamanho_bytes").notNull(),
    conteudoBase64: text("conteudo_base64").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("documentos_cliente_idx").on(table.clienteId),
    index("documentos_processo_idx").on(table.processoId),
    index("documentos_created_at_idx").on(table.createdAt),
  ],
);

export const agendaEventos = pgTable(
  "agenda_eventos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    titulo: varchar("titulo", { length: 180 }).notNull(),
    tipo: tipoAgendaEnum("tipo").default("prazo").notNull(),
    dataHora: timestamp("data_hora", { withTimezone: true }).notNull(),
    clienteId: uuid("cliente_id").references(() => clientes.id, {
      onDelete: "set null",
    }),
    processoId: uuid("processo_id").references(() => processos.id, {
      onDelete: "set null",
    }),
    lembreteDias: integer("lembrete_dias").default(3).notNull(),
    status: statusAgendaEnum("status").default("pendente").notNull(),
    descricao: text("descricao"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("agenda_eventos_data_hora_idx").on(table.dataHora),
    index("agenda_eventos_status_idx").on(table.status),
    index("agenda_eventos_cliente_idx").on(table.clienteId),
    index("agenda_eventos_processo_idx").on(table.processoId),
  ],
);

export const historicoAlteracoes = pgTable(
  "historico_alteracoes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entidade: varchar("entidade", { length: 40 }).notNull(),
    entidadeId: uuid("entidade_id").notNull(),
    acao: varchar("acao", { length: 40 }).notNull(),
    descricao: text("descricao").notNull(),
    usuarioNome: varchar("usuario_nome", { length: 120 }).notNull(),
    dadosAnteriores: jsonb("dados_anteriores").$type<Record<string, unknown> | null>(),
    dadosNovos: jsonb("dados_novos").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("historico_entidade_id_idx").on(table.entidade, table.entidadeId),
    index("historico_created_at_idx").on(table.createdAt),
    index("historico_usuario_idx").on(table.usuarioNome),
  ],
);

export const clientesRelations = relations(clientes, ({ many }) => ({
  processos: many(processos),
  documentos: many(documentos),
  agendaEventos: many(agendaEventos),
}));

export const processosRelations = relations(processos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [processos.clienteId],
    references: [clientes.id],
  }),
  documentos: many(documentos),
  agendaEventos: many(agendaEventos),
}));

export const documentosRelations = relations(documentos, ({ one }) => ({
  cliente: one(clientes, {
    fields: [documentos.clienteId],
    references: [clientes.id],
  }),
  processo: one(processos, {
    fields: [documentos.processoId],
    references: [processos.id],
  }),
}));

export const agendaEventosRelations = relations(agendaEventos, ({ one }) => ({
  cliente: one(clientes, {
    fields: [agendaEventos.clienteId],
    references: [clientes.id],
  }),
  processo: one(processos, {
    fields: [agendaEventos.processoId],
    references: [processos.id],
  }),
}));
