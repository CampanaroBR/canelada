# CANELADA — Product Spec

---

## 1. Visão do Produto

### O que é o Canelada?

Canelada é uma **rede social gamificada para grupos de baba** (pelada / society).

O objetivo não é controlar o jogo.  
O objetivo é **transformar o baba em uma experiência social contínua**, criando:

- Rivalidade
- Reconhecimento
- Resenha
- Memória coletiva
- Identidade dos jogadores

> O futebol acontece das 20h às 22h. A resenha continua a semana inteira.

---

## 2. Problema

Hoje o baba gera histórias, zoações, rivalidades e momentos memoráveis.  
Mas **tudo desaparece no WhatsApp**.

Não existe um lugar para:

- Guardar a história do grupo
- Registrar os destaques
- Acompanhar rankings e evolução dos jogadores
- Gerar conteúdo compartilhável
- Manter a resenha viva entre os babas

---

## 3. Solução

Canelada transforma cada noite de baba em:

- Rankings sociais
- Traits e conquistas acumuladas
- Seleção da rodada
- Histórias automáticas
- Feed social com conteúdo gerado automaticamente

---

## 4. Público-alvo

**Primário:** Homens entre 35 e 60 anos que:

- Jogam baba semanalmente
- Usam WhatsApp diariamente
- Gostam de competir e zoar os amigos

**Principais motivações:**

- Ser reconhecido
- Aparecer na seleção
- Ser MVP
- Provocar os amigos
- Compartilhar resultados
- Participar da resenha

---

## 5. Proposta de Valor

> "Canelada transforma o baba em uma experiência social memorável."

---

## 6. Personalidade da Marca

**O produto deve ser:**
- Divertido
- Brasileiro
- Competitivo
- Amigável
- Irreverente
- Moderno

**Nunca:**
- Infantil
- Gamer / esteticamente "gaming"
- Exageradamente técnico
- Complexo

---

## 7. Posicionamento

Não somos:
- ❌ Fut7
- ❌ SofaScore
- ❌ Gestão esportiva

Somos:
- ✅ Rede social do baba

---

## 8. Pilares do Produto

1. **Resenha** — a funcionalidade principal
2. **Reconhecimento** — todo mundo quer aparecer
3. **Rivalidade** — mantém o interesse entre os babas
4. **Compartilhamento** — WhatsApp é essencial

### 8.1 Pilar de construção — Harness Design

Os 4 pilares acima são sobre o que o produto entrega pra quem joga. Este é sobre como o produto é construído — e vale registrar porque molda toda decisão técnica do Canelada.

O Canelada é mantido por um Product Designer só, com IA agêntica (Claude Code) como par constante de desenvolvimento. Isso só funciona sob uma disciplina: **gerar não é o mesmo que saber o que vale a pena gerar**. A IA opera sobre o que já foi dito, documentado, estruturado — o que o grupo sente mas não verbaliza, o que uma rodada real ensinou mas ninguém escreveu, o que é tecnicamente correto mas errado pro contexto específico do baba não entra sozinho. Por isso o trabalho antes de qualquer implementação é estruturar o contexto que a IA precisa pra chegar na forma certa: os critérios do produto (este spec), as decisões já tomadas que não podem ser reabertas a cada prompt, e o vínculo com dado real de produção como critério de validação — nunca dado sintético.

Na prática, isso significa:

- **Contexto antes de geração.** Nenhuma feature nova é implementada sem primeiro checar contra este documento — regras de negócio, personalidade de marca e pilares de produto são o "harness" que a IA precisa respeitar antes de propor qualquer solução.
- **Validação contra produção real, não contra dado fictício.** Toda mudança relevante é comparada com o banco de dados real e com o que o grupo sabe que aconteceu na rodada — foi assim que bugs como a lógica invertida de "melhor/pior" vieram à tona: o grupo perguntou, a resposta virou correção.
- **Julgamento permanece humano.** A IA acelera o ciclo entre decisão e produto no ar — de ideia a validado em produção, muitas vezes na mesma conversa — mas quem decide o que é certo pro Canelada, e quem responde quando algo dá errado, é sempre quem entende o contexto do baba: o Product Designer, não o modelo.

---

## 9. Como funciona o baba

**Estrutura:** 5x5 (1 goleiro + 4 de linha)

**Primeiro baba (20h):**
- Os 10 primeiros entram automaticamente
- Dois jogadores batem par ou ímpar e escolhem os times
- Duração: 15 minutos, sem limite de gols

**Demais babas:**
- Duração: 10 minutos ou 2 gols
- Quem vence permanece em quadra
- Quem perde sai; novos jogadores entram por ordem de chegada

---

## 10. Funcionalidades

### 10.1 Feed `/feed`

Tela principal. Inspirado em Bleacher Report, OneFootball, Copa90.

Conteúdo gerado automaticamente após cada rodada:
- MVP da rodada
- Seleção da rodada
- Traits conquistadas
- Conquistas desbloqueadas
- Rivalidades e sequências
- Rankings
- Histórias narrativas

**Exemplo de story:** *"Arthur encerrou uma sequência de 5 derrotas."*

**Status atual:** ✅ Feed com story cards. FAB "Baba rolou hoje" para organizadores.

---

### 10.2 Votação (Resumo da Rodada) `/votacao`

Processo rápido após o baba. Tempo máximo: ~1 minuto.

Perguntas obrigatórias:
- Quem foi o **MVP**?
- Quem foi o **Bagre**?
- Quem foi o mais **Raçudo**?
- Quem animou mais a **Resenha**?
- Qual **Trait** merece? (para o escolhido no passo anterior)

Opcional (pós-MVP):
- Gols
- Assistências

**Status atual:** ✅ Fluxo de 5 steps com ilustrações SVG por categoria.

---

### 10.3 Perfil do Jogador `/perfil/[apelido]`

Cada jogador possui:
- Apelido + avatar gerado (iniciais com cor única)
- Overall (pós-MVP)
- Grid de traits (conquistadas coloridas, não conquistadas grayscale)
- Histórico das últimas rodadas
- Conquistas

**Status atual:** ✅ Hero dramático, stats (MVPs / Bagres / Traits), grid hexagonal de traits com SVGs, histórico de rodadas.

---

### 10.4 Seleção da Rodada

Formação automática: **1 goleiro + 4 de linha**.

Baseada em:
- Votos recebidos
- Gols (pós-MVP)
- Assistências (pós-MVP)

Visual: campinho estilizado, compartilhável via WhatsApp.

**Status atual:** ✅ Card de seleção gerado no feed. Compartilhamento: pendente.

---

### 10.5 Rankings `/ranking`

Rankings sociais por categoria:
- Mais MVP
- Mais Bagre
- Mais Raçudo
- Mais Resenha
- Mais Presente (pós-MVP)

**Status atual:** ✅ Tabs por categoria, hero card para 1º lugar, podium para 2º e 3º.

---

### 10.6 Traits

Sistema central de reputação e personalidade. Traits são acumuladas ao longo das rodadas.

#### Futebol
| Slug | Nome |
|------|------|
| `racudo` | Raçudo |
| `matador` | Matador |
| `paredao` | Paredão |
| `categoria` | Categoria |
| `xerife` | Xerife |
| `garcom` | Garçom |

#### Personalidade
| Slug | Nome |
|------|------|
| `chorao` | Chorão |
| `paneleiro` | Paneleiro |
| `fominha` | Fominha |
| `resenha-forte` | Resenha Forte |
| `catimbeiro` | Catimbeiro |

#### Resenha
| Slug | Nome |
|------|------|
| `bagre` | Bagre da Noite |
| `cone` | Cone |
| `corpo-mole` | Corpo Mole |
| `firuleiro` | Firuleiro |
| `reclamao` | Reclamão |
| `chegou-agora` | Chegou Agora |

**Ilustrações:** SVGs individuais em `/public/traits/`. Mapeamento completo em `VotacaoFlow.tsx → TRAIT_SVG`.

**Status atual:** ✅ Traits no perfil (hexágonos com SVG), na votação (picker com ilustrações) e no feed (story cards de trait conquistada).

---

### 10.7 Conquistas

Sistema de badges desbloqueáveis por marcos. Exemplos:

| Conquista | Critério |
|-----------|----------|
| Primeira Vitória | Primeira rodada vencida |
| Veterano | 50 presenças |
| Lenda do MVP | 10 MVPs |

**Status atual:** 🔲 Não implementado.

---

### 10.8 Stories Automáticas

O sistema gera narrativas automaticamente após cada rodada.

**Tipos de story:**
- `MVP` — eleito MVP da rodada
- `BAGRE` — eleito bagre
- `TRAIT_CONQUISTADA` — nova trait desbloqueada
- `SELECAO` — entrou para a seleção da rodada
- `SEQUENCIA` — sequência de MVPs consecutivos (pós-MVP)

**Exemplos de texto:**
- *"Arthur foi eleito MVP pela terceira rodada consecutiva."*
- *"Carlos conquistou a trait Paneleiro."*
- *"João foi escolhido para a Seleção da Rodada."*

**Status atual:** ✅ Tipos MVP, BAGRE, TRAIT_CONQUISTADA, SELECAO implementados. Geração automática pós-votação.

---

### 10.9 Cards Compartilháveis

Geração de imagem para compartilhamento no WhatsApp.

Conteúdo candidato:
- Card de MVP da rodada
- Card da Seleção da Rodada
- Card de trait conquistada
- Card de conquista desbloqueada

**Status atual:** 🔲 Não implementado. Alta prioridade de roadmap.

---

## 11. Autenticação

- Google OAuth
- Email Magic Link via Resend
- Sessão via Auth.js v5 com JWT
- Rotas protegidas: `/feed`, `/votacao`, `/perfil`, `/ranking`, `/onboarding`
- Rota pública: `/login`

---

## 12. Regras de Negócio

- Qualquer jogador autenticado pode marcar "Baba rolou hoje"
- Uma rodada fica aberta para votação por 24h
- Cada jogador vota uma vez por rodada
- Traits são acumulativas — pode ter a mesma trait várias vezes
- A seleção da rodada é gerada automaticamente ao fechar a votação
- MVP atual: apenas um grupo fixo (sem multi-tenant)

---

## 13. Loop Central

```
Baba encerra
→ Qualquer jogador abre o app e marca "Baba rolou hoje"
→ Janela de votação abre (24h)
→ Cada jogador vota: MVP, Bagre, Raçudo, Resenha, Trait
→ Feed é gerado com stories automáticas
→ Cards compartilháveis são gerados (roadmap)
→ Grupo compartilha no WhatsApp
→ Resenha continua durante a semana no feed
```

---

## 14. North Star

**Métrica principal:** % do grupo que vota após cada baba.

Métricas secundárias:
- Retenção semanal (volta sem precisar de notificação)
- Stories compartilhadas no WhatsApp
- Sessões por semana por usuário

---

## 15. Roadmap Pós-MVP

**Próxima prioridade:**
1. Cards compartilháveis (WhatsApp) — maior alavanca de crescimento orgânico
2. Push notifications — lembrete de votação aberta
3. Gols e assistências na votação
4. Sistema de conquistas/badges
5. Overall do jogador

**Médio prazo:**
- Múltiplos grupos (muda arquitetura — planejar antes de crescer)
- Perfil com foto real
- Comentários no feed

**Fora do escopo atual:**
- Landing page pública
- Stripe / pagamentos
- App nativo (iOS/Android)
