# Atualização visual — WY Advocacia

Esta versão aplica uma identidade minimalista em preto, off-white e dourado discreto, baseada na marca enviada para **WY Advocacia — Previdenciária e Trabalhista**.

## O que mudou

- Navegação lateral escura, com a balança da marca e tipografia mais sóbria.
- Fundo em tom de papel, painéis com bordas discretas e sem gradientes.
- Hierarquia tipográfica mais formal, com títulos em serif e textos de trabalho em sans-serif.
- Formulários, tabelas, badges de status, botões e estados vazios padronizados.
- Logo convertida em três arquivos dentro de `public/`:
  - `wy-simbolo.png`
  - `wy-wordmark.png`
  - `wy-marca.png`

## Como aplicar

1. Faça backup da sua pasta atual `system01`.
2. Extraia o conteúdo deste pacote e substitua a pasta `system01` inteira.
3. Mantenha o seu arquivo `.env.local` com `DATABASE_URL` configurada. Ele não acompanha este ZIP por segurança.
4. Dentro de `system01`, execute:

```powershell
npm run dev
```

Não há novas dependências nesta atualização visual. Só execute `npm install` novamente caso a pasta `node_modules` não exista.
