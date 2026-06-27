# Instalação corrigida — importante

## Não copie por cima da pasta antiga

A versão anterior do projeto usava Supabase e tinha `proxy.ts`. Como esta versão não usa autenticação, esse arquivo não pode permanecer no projeto.

1. Pare o servidor com `Ctrl + C`.
2. Volte para a pasta do repositório: `cd ..`.
3. Renomeie a pasta antiga para manter um backup:

```powershell
Rename-Item system01 system01-supabase-backup
```

4. Extraia este ZIP na pasta do repositório. Ele criará uma nova pasta `system01`.
5. Dentro da nova pasta, crie `.env.local` a partir de `.env.example`:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

6. Cole no arquivo a URL pooled do Neon na variável `DATABASE_URL`.
7. Execute:

```powershell
npm install
npm run db:migrate
npm run dev
```

## Correção rápida, caso não queira substituir a pasta agora

```powershell
Remove-Item .\proxy.ts -Force -ErrorAction SilentlyContinue
```

Depois substitua o conteúdo de `drizzle.config.ts` pela versão presente neste ZIP e configure `.env.local`.

Não execute `npm audit fix --force` neste momento; o aviso de vulnerabilidades não impede a execução e esse comando pode atualizar dependências de forma incompatível.
