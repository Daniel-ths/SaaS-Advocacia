CREATE TYPE "public"."tipo_agenda" AS ENUM('prazo', 'audiencia', 'reuniao', 'diligencia', 'outro');
CREATE TYPE "public"."status_agenda" AS ENUM('pendente', 'concluido', 'cancelado');

CREATE TABLE "agenda_eventos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "titulo" varchar(180) NOT NULL,
  "tipo" "tipo_agenda" DEFAULT 'prazo' NOT NULL,
  "data_hora" timestamp with time zone NOT NULL,
  "cliente_id" uuid,
  "processo_id" uuid,
  "lembrete_dias" integer DEFAULT 3 NOT NULL,
  "status" "status_agenda" DEFAULT 'pendente' NOT NULL,
  "descricao" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "agenda_eventos_cliente_id_clientes_id_fk"
    FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action,
  CONSTRAINT "agenda_eventos_processo_id_processos_id_fk"
    FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE set null ON UPDATE no action
);

CREATE TABLE "historico_alteracoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entidade" varchar(40) NOT NULL,
  "entidade_id" uuid NOT NULL,
  "acao" varchar(40) NOT NULL,
  "descricao" text NOT NULL,
  "usuario_nome" varchar(120) NOT NULL,
  "dados_anteriores" jsonb,
  "dados_novos" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "agenda_eventos_data_hora_idx" ON "agenda_eventos" USING btree ("data_hora");
CREATE INDEX "agenda_eventos_status_idx" ON "agenda_eventos" USING btree ("status");
CREATE INDEX "agenda_eventos_cliente_idx" ON "agenda_eventos" USING btree ("cliente_id");
CREATE INDEX "agenda_eventos_processo_idx" ON "agenda_eventos" USING btree ("processo_id");
CREATE INDEX "historico_entidade_id_idx" ON "historico_alteracoes" USING btree ("entidade", "entidade_id");
CREATE INDEX "historico_created_at_idx" ON "historico_alteracoes" USING btree ("created_at");
CREATE INDEX "historico_usuario_idx" ON "historico_alteracoes" USING btree ("usuario_nome");
