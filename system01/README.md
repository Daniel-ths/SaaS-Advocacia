# SisAdvocacia — Neon + Drizzle

Versão inicial do sistema usando **Neon PostgreSQL** e **Drizzle ORM**. Não há login nesta etapa; todos os dados ficam acessíveis a quem abrir a aplicação.

## O que está incluído

- Cadastro, edição, busca e exclusão de clientes.
- Cadastro e exclusão de processos vinculados a clientes.
- Envio, listagem, download e exclusão de documentos.
- Dashboard com dados reais do banco.
- Migration SQL versionada em `drizzle/0000_initial.sql`.

## Antes de iniciar

1. Crie um projeto no Neon.
2. No painel do Neon, clique em **Connect** e copie a URL **pooled** (a que tem `-pooler` no endereço).
3. Copie `.env.example` para `.env.local`.
4. Cole a URL em `DATABASE_URL`.

Exemplo:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@ep-exemplo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Requisitos

- Node.js **20.9 ou superior**. Verifique com `node -v`.
- npm 10 ou superior. Verifique com `npm -v`.

## Se o `npm install` travar ou repetir tentativas

No PowerShell, dentro da pasta `system01`, interrompa com `Ctrl + C` e execute:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install --registry=https://registry.npmjs.org/
```

O arquivo `.npmrc` deste projeto já aponta para o registro público do npm.

## Comandos

```bash
npm install
npm run db:migrate
npm run dev
```

Abra `http://localhost:3000`.

## Deploy na Vercel

Adicione `DATABASE_URL` nas variáveis de ambiente do projeto na Vercel. Use a URL **pooled** do Neon. Rode `npm run db:migrate` uma vez na sua máquina depois de configurar o banco, antes de publicar.

## Limitações temporárias importantes

- **Não publique em produção enquanto não colocarmos login e permissões.** Nesta versão qualquer visitante pode ver, baixar, criar e excluir dados.
- Os arquivos são guardados no PostgreSQL codificados em Base64, com limite de 4,5 MB. Isso é aceitável apenas durante a construção. Na etapa final, vamos mover os arquivos para armazenamento próprio, como Cloudflare R2, S3 ou Vercel Blob.
- Ao adicionar autenticação, incluiremos um `escritorio_id`/`user_id` nas tabelas e filtraremos todas as consultas por esse identificador.
