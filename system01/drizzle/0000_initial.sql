CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "public"."status_cliente" AS ENUM('ativo', 'inativo', 'prospecto');
CREATE TYPE "public"."status_processo" AS ENUM('aberto', 'em_andamento', 'aguardando', 'encerrado');

CREATE TABLE "clientes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" varchar(160) NOT NULL,
  "email" varchar(160),
  "telefone" varchar(30),
  "cpf_cnpj" varchar(18),
  "status" "status_cliente" DEFAULT 'ativo' NOT NULL,
  "observacao" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "processos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cliente_id" uuid NOT NULL,
  "numero" varchar(80) NOT NULL,
  "titulo" varchar(200) NOT NULL,
  "area" varchar(100),
  "status" "status_processo" DEFAULT 'aberto' NOT NULL,
  "prazo" timestamp with time zone,
  "observacao" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "processos_cliente_id_clientes_id_fk"
    FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "documentos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cliente_id" uuid NOT NULL,
  "processo_id" uuid,
  "nome_arquivo" varchar(255) NOT NULL,
  "mime_type" varchar(120) NOT NULL,
  "tamanho_bytes" integer NOT NULL,
  "conteudo_base64" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "documentos_cliente_id_clientes_id_fk"
    FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "documentos_processo_id_processos_id_fk"
    FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE set null ON UPDATE no action
);

CREATE INDEX "clientes_status_idx" ON "clientes" USING btree ("status");
CREATE INDEX "clientes_nome_idx" ON "clientes" USING btree ("nome");
CREATE INDEX "processos_cliente_idx" ON "processos" USING btree ("cliente_id");
CREATE INDEX "processos_status_idx" ON "processos" USING btree ("status");
CREATE INDEX "processos_prazo_idx" ON "processos" USING btree ("prazo");
CREATE INDEX "documentos_cliente_idx" ON "documentos" USING btree ("cliente_id");
CREATE INDEX "documentos_processo_idx" ON "documentos" USING btree ("processo_id");
CREATE INDEX "documentos_created_at_idx" ON "documentos" USING btree ("created_at");
