# Chalana's Bet — Bolão Copa 2026

Bolão de palpites de placar da Copa do Mundo 2026, com ranking automático,
trava de palpites antes de cada jogo e dados compartilhados entre os amigos
(via Supabase).

---

## O que você vai precisar (tudo grátis)

1. Conta no **GitHub**
2. Conta no **Supabase** (banco de dados compartilhado)
3. Conta no **Vercel** (hospedagem)
4. *(Opcional)* Uma **API key da Anthropic** — só para o botão "Atualizar via IA"

---

## Passo 1 — Supabase (banco de dados)

1. Crie um projeto em https://supabase.com (anote a senha do banco).
2. No menu lateral, abra **SQL Editor → New query**, cole todo o conteúdo do
   arquivo `supabase_schema.sql` deste projeto e clique em **Run**.
   Isso cria a tabela `kv` que guarda jogadores, palpites e placares.
3. Vá em **Project Settings → API** e copie:
   - **Project URL**  → será o `VITE_SUPABASE_URL`
   - **anon public key** → será o `VITE_SUPABASE_ANON_KEY`

---

## Passo 2 — Subir o código no GitHub

Dentro desta pasta:

```bash
git init
git add .
git commit -m "Chalana's Bet"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/chalanas-bet.git
git push -u origin main
```

(Crie o repositório vazio no GitHub antes do `git remote add`.)

---

## Passo 3 — Deploy no Vercel

1. Em https://vercel.com → **Add New → Project** → importe o repositório.
2. O Vercel detecta **Vite** automaticamente (Build: `vite build`, Output: `dist`).
   Não precisa mudar nada.
3. Em **Environment Variables**, adicione:

   | Nome | Valor |
   |------|-------|
   | `VITE_SUPABASE_URL` | a Project URL do Supabase |
   | `VITE_SUPABASE_ANON_KEY` | a anon public key |
   | `ANTHROPIC_API_KEY` | *(opcional)* sua chave da Anthropic |

4. Clique em **Deploy**. Pronto — pegue o link `*.vercel.app` e mande no grupo.

> Sempre que mudar variáveis de ambiente, faça **Redeploy**.

---

## Rodar localmente (opcional)

```bash
npm install
cp .env.example .env   # preencha os valores
npm run dev
```

Abre em http://localhost:5173

> O botão "Atualizar via IA" usa a função `/api/atualizar`, que **só roda no
> Vercel** (ou com `vercel dev`). No `npm run dev` puro, use o lançamento manual
> de placares no Admin.

---

## Como usar

- **Entrar**: cada amigo digita o nome e escolhe o time favorito. Quem já existe
  (lista pré-cadastrada) é reconhecido pelo nome.
- **Jogos**: palpites de placar, que travam automaticamente antes de cada jogo.
- **Ranking**: classificação, últimos resultados e quem pontuou na rodada.
- **Admin** (senha padrão `chalana26`, definida em `App.jsx` na constante
  `ADMIN_PIN`): lançar placares, editar jogos/horários e usar "Atualizar via IA".

### Regras de pontuação
- **5** placar exato (empate exato também vale 5)
- **3 + 1** acertar o vencedor (3) somando o placar parcial (1) = 4
- **2** apostou empate e deu empate com placar diferente
- **1** placar parcial (vale inclusive quando o jogo termina empatado)
- **±0,5** time favorito venceu / perdeu (empate do favorito não conta)

---

## Observações

- A tabela `kv` é pública (leitura/escrita) para simplificar o bolão entre
  amigos. Não guarde nada sensível ali. Se quiser endurecer depois, dá para
  trocar as policies por algo com autenticação.
- Trocar a senha do Admin: edite `ADMIN_PIN` em `src/App.jsx`.
- A pré-carga (jogadores, pontuação-base e palpites já lançados) roda uma vez
  por chave de versão. Para forçar recarga da tabela de jogos, suba a versão em
  `K_MATCHES` (ex.: `chalanas:matches:v4`) em `src/App.jsx`.
