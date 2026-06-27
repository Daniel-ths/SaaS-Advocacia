import { relations } from "drizzle-orm";
import {
  index,
  integer,
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

export const clientesRelations = relations(clientes, ({ many }) => ({
  processos: many(processos),
  documentos: many(documentos),
}));

export const processosRelations = relations(processos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [processos.clienteId],
    references: [clientes.id],
  }),
  documentos: many(documentos),
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
