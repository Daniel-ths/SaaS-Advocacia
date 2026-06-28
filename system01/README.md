# WY Advocacia — Gestão interna

Sistema interno para organização de clientes, processos, agenda jurídica, documentos, relatórios e histórico operacional.

## Requisitos

- Node.js 20.9 ou superior;
- Banco PostgreSQL no Neon;
- URL pooled do Neon configurada em `DATABASE_URL`.

## Configuração

Crie o arquivo `.env.local` a partir do exemplo:

```powershell
Copy-Item .env.example .env.local
```

Preencha a URL do banco e, opcionalmente, o nome temporário usado no histórico:

```env
DATABASE_URL="postgresql://..."
OPERADOR_LOCAL="Equipe WY"
```

## Instalação e execução

```powershell
npm install
npm run db:migrate
npm run dev
```

Acesse `http://localhost:3000`.

## Funcionalidades atuais

- Cadastro, edição, busca e exclusão de clientes;
- Cadastro, edição e exclusão de processos;
- Agenda jurídica com prazos, audiências, reuniões e diligências;
- Alertas visuais de itens vencidos, do dia e dos próximos sete dias;
- Upload, download e exclusão de documentos;
- Relatórios gerais imprimíveis ou salváveis em PDF;
- Histórico de alterações nas principais áreas do sistema.

## Atenção sobre o acesso

A autenticação ainda está desativada. Portanto, não publique o sistema aberto para clientes ou colaboradores externos nesta fase.

## Banco de dados

As migrations ficam em `drizzle/`. Sempre que atualizar o projeto e houver uma nova migration, execute:

```powershell
npm run db:migrate
```

Os documentos continuam armazenados temporariamente dentro do PostgreSQL. Para produção, o recomendado é usar um bucket dedicado, como Cloudflare R2, Amazon S3 ou Vercel Blob.
