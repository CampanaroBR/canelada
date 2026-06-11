# CANELADA — Product Spec MVP

> Escopo do MVP. Não implementar nada fora daqui sem instrução explícita.

---

## Contexto

Grupo fechado de condomínio. Todos se conhecem. A pelada já existe.
O Canelada não organiza o jogo — transforma o que já aconteceu em resenha.

**Problema:** As histórias, zoações e rivalidades do baba desaparecem no WhatsApp.
**Solução:** Feed social com votação pós-baba, traits acumuladas e cards compartilháveis.

---

## Loop central do produto

```
Baba encerra
→ Alguém abre o app e marca "Baba rolou hoje"
→ Notificação dispara para o grupo
→ Janela de votação abre (45 segundos por pessoa)
→ Cada jogador vota: MVP, Bagre, Traits
→ Feed é gerado com stories automáticas
→ Cards compartilháveis são gerados
→ Grupo compartilha no WhatsApp
→ Resenha continua durante a semana no feed
```

---

## Telas do MVP

### 1. Login `/login`
- Logo CANELADA em Barlow Condensed 900
- Tagline: "O baba virou resenha."
- Botão: "Entrar com Google"
- Botão: "Entrar com email" (Magic Link)

### 2. Onboarding `/onboarding`
- Input: apelido (máximo 20 caracteres)
- Botão: "Entrar no grupo"
- No MVP: apenas um grupo fixo

### 3. Feed `/feed`
- Header: logo + ícone de notificação
- Botão flutuante: "⚽ Baba rolou hoje" (apenas organizador)
- Lista de story cards em ordem cronológica reversa
- Bottom navigation: Feed | Votação | Perfil | Ranking

### 4. Votação `/votacao`
- Fluxo fullscreen tipo story (5 perguntas)
- Progress bar no topo
- Grid de jogadores: avatar + apelido
- Votação fica aberta 24h

### 5. Perfil `/perfil/[apelido]`
- Avatar grande + apelido
- Grid de traits (conquistadas coloridas, não conquistadas grayscale)
- Histórico recente de 5 rodadas

### 6. Ranking `/ranking`
- Tabs: Mais MVP | Mais Bagre | Mais Raçudo | Mais Resenha
- Top 3 com destaque visual

---

## Autenticação

- Provider 1: Google OAuth
- Provider 2: Email Magic Link via Resend
- Sessão: Auth.js v5 com JWT
- Rotas protegidas: `/feed`, `/votacao`, `/perfil`, `/ranking`, `/onboarding`
- Rotas públicas: `/login`

---

## Variáveis de ambiente

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_RESEND_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Fora do MVP

- Múltiplos grupos
- Notificações push
- Stripe / pagamentos
- Landing page pública
- Comentários
