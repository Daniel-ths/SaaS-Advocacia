# Atualização — agenda, relatórios e histórico

Esta versão adiciona quatro blocos ao sistema WY Advocacia:

- Edição de processos;
- Agenda jurídica para prazos, audiências, reuniões e diligências;
- Alertas visuais de prazo no painel e na agenda;
- Relatórios gerais prontos para imprimir ou salvar em PDF;
- Histórico de inclusões, alterações, conclusões e exclusões.

## Como instalar sobre a versão anterior

1. Faça uma cópia de segurança da pasta atual `system01`.
2. Substitua a pasta pelo conteúdo deste pacote.
3. Preserve seu arquivo `.env.local` com a `DATABASE_URL` do Neon.
4. Acrescente, se desejar, a variável abaixo ao `.env.local`:

```env
OPERADOR_LOCAL="Equipe WY"
```

5. Execute a nova migration:

```powershell
npm run db:migrate
```

6. Inicie o sistema:

```powershell
npm run dev
```

## Sobre o histórico antes do login

Como a autenticação ainda não está ativa, o histórico usa o valor de `OPERADOR_LOCAL` como identificação temporária. Quando o login for implementado, esse campo deverá ser ligado automaticamente ao usuário autenticado.

## Alertas atuais

Nesta fase, os alertas são exibidos dentro do sistema:

- No dashboard;
- Na página Agenda jurídica;
- Nos relatórios gerais.

Eles mostram itens vencidos, para hoje e dos próximos sete dias. O envio por e-mail, WhatsApp ou notificação push pode ser incluído depois que o sistema possuir usuários, permissões e configuração de canais de aviso.

## Relatórios

A página **Relatórios** consolida totais, situação dos processos, áreas jurídicas, agenda pendente e atividade recente. O botão **Imprimir / salvar PDF** usa a janela de impressão do navegador, permitindo salvar o documento em PDF sem instalar biblioteca adicional.
