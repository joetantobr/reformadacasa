# Reforma da Casa

App para planejar a reforma da casa: andares, telhado, áreas externas, cômodos e serviços, com prioridade, tamanho do gasto ($ / $$ / $$$), custo estimado, observações e backup.

Feito com Vite + JavaScript puro. Os dados ficam no Supabase (ou no Lovable Cloud, que é Supabase por baixo). Sem banco conectado, o app funciona do mesmo jeito, mas salva só no navegador de quem está usando.

## Estrutura

```
index.html                         página principal
src/main.js                        o app (telas, ícones, arrastar, backup)
src/style.css                      visual (casa amarela, telhado marrom, janelas roxas)
src/db.js                          camada de dados: Supabase ao vivo ou localStorage
supabase/migrations/001_reforma_docs.sql   cria a tabela no banco
```

## Publicar no Lovable

1. No Lovable, crie um projeto novo (pode ser em branco).
2. Em **Settings → GitHub**, conecte o projeto ao GitHub. O Lovable cria um repositório.
3. No seu computador, clone esse repositório, apague o conteúdo dele (menos a pasta `.git`) e copie todos os arquivos deste zip para dentro.
4. Faça commit e push. O Lovable puxa o código sozinho em alguns segundos.
5. No Lovable, ligue o **Lovable Cloud** (ou conecte um projeto Supabase seu). Isso cria as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
6. Crie a tabela: no chat do Lovable peça para rodar a migração `supabase/migrations/001_reforma_docs.sql`, ou cole o conteúdo dela no **SQL Editor** do Supabase.
7. Clique em **Publish**.

## Levar os dados atuais

No app antigo, abra a engrenagem e toque em **Baixar backup**. No app publicado: engrenagem → **Restaurar backup** → escolha o arquivo → **Restaurar**.

Na mesma tela de opções aparece "Banco online" quando o Supabase está conectado, ou "Só neste aparelho" quando não está.

## Rodar no computador

```
npm install
npm run dev
```

Abre em http://localhost:8080. Para usar o banco localmente, copie `.env.example` para `.env` e preencha.

## Segurança

O app não tem login: qualquer pessoa com o link consegue ver e editar. A regra de acesso fica no arquivo SQL (política "acesso livre"). Se quiser restringir depois, o caminho é ligar o login do Supabase e trocar essa política.
