# Raízes Cartográficas

Uma plataforma de saberes populares organizada como um **rizoma** — não um acervo.
Projeto desenvolvido para a disciplina *Teoria e Futuros do Design*, no cenário
"A Era do Curupira".

🔗 **Acesse:** [raizes-cartograficas.vercel.app](https://raizes-cartograficas.vercel.app)
<!-- troque pela sua URL real da Vercel -->

## O conceito

Cada nó da plataforma é uma **porta** para uma **fonte real** de conhecimento —
não um verbete. O projeto é **anti-consumo por design**: a porta mostra o "rosto"
do saber (o que é, quem guarda, como chegar), mas **nunca a técnica transmissível**,
que vive nas mãos de quem faz.

Princípios que guiam a experiência:

- **Puxar um fio com licença** — navegar de um saber a outro declarando a intenção
  (aprender, pesquisar ou inspirar).
- **Curadoria feita pela própria fonte** — quem guarda o saber mantém sua porta.
- **Reciprocidade visível** — quem passa deixa sua palavra de retribuição.
- **Crédito fácil** — toda porta oferece o crédito pronto para copiar.
- **IA só na camada meta** — ajuda a formular o pedido, nunca narra o saber.

Há dois papéis no conceito: **quem busca** (designers e pesquisadores, com o perfil
"minha caminhada") e **quem guarda** (mestres e comunidades, que curam a própria
porta). Este MVP cobre o lado de quem busca; a autoria pela fonte é o próximo passo.

## Stack

- **Next.js** (App Router, TypeScript)
- **Supabase** (Postgres + Auth)
- **Vercel** (deploy automático a cada push)
- Tipografia: Bricolage Grotesque (títulos) + Mulish (corpo)
- Linguagem visual: "xilogravura + renda" — paleta de terra, índigo, ocre e mata
  sobre fundo de papel, com fios orgânicos costurando os saberes.

## Telas

- **Início** — manifesto, declaração de postura ("como você chega hoje?") e as portas.
- **Porta** (`/saber/[id]`) — o rosto do saber, como chegar à fonte, crédito copiável,
  o gesto de puxar um fio e o espaço para deixar uma palavra.
- **Minha caminhada** (`/perfil`) — as portas que você atravessou e as palavras que
  deixou. *Seu perfil não guarda saberes — guarda suas relações e seus compromissos.*
- **Entrar** (`/entrar`) — cadastro e login.

## Rodando localmente

Pré-requisito: Node.js instalado.

```bash
# 1. instale as dependências
npm install

# 2. crie um arquivo .env.local com as chaves do Supabase
#    (NÃO comite este arquivo)
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-aqui

# 3. rode o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estado do projeto

MVP funcional com a navegação central de ponta a ponta: porta → fio → licença →
rastro → palavra pública. A camada meta (perguntas que ajudam a formular o pedido)
está implementada de forma simulada, pronta para receber IA real como evolução.

---

*Saberes representados (Pernambuco): maracatu de baque virado, coco de roda,
cavalo-marinho, mamulengo, barro figurativo e renda renascença.*