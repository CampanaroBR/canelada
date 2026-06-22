# Canelada — Gamificação (Fonte Única da Verdade)

> Documento oficial das badges, raridades e regras de desbloqueio.
> Responde: **"Quais dados o sistema precisa monitorar para desbloquear cada badge?"**
> Versão: **v2** (matriz refinada — MVP automático por pontos, sequências como ladder, reputação).

---

## 1. Fontes de dados (o que o backend precisa guardar por jogador)

```
participacoes_total
participacoes_consecutivas
mvps_total
mvps_mes
streak_traits_positivas        # rodadas consecutivas com >= 1 trait positiva
streak_part_positiva           # rodadas consecutivas em que participou E recebeu >= 1 positiva (Consistente)
contagem_traits_positivas      # acumulado de positivas (Querido da Galera, Lenda)
contagem_trait_racudo          # Operário, Raçudo do Mês
contagem_traits_sociais        # Resenha Forte
ultima_trait_negativa_rodada   # Virada de Chave (rodada A negativa -> rodada B positiva)
badges_desbloqueadas[]
```

Derivado por rodada: `pontos_rodada` → `mvp_rodada (bool)` (ver seção 3).

---

## 2. Taxonomia de traits (classificação única)

| Tipo | Traits | Usado em |
|---|---|---|
| 🟢 **Positivas** | Categoria, Matador, Paredão, Raçudo, Xerife, Garçom, Driblador | MVP, sequências, Querido da Galera, Lenda |
| 🔴 **Negativas** | Bagre da Noite, Cone, Pregueiro | Virada de Chave |
| 💬 **Sociais / zoeira** | Só Resenha, Delegado, Chorão, Reclamão, Paneleiro, **Firuleiro** | Resenha Forte |

- **Firuleiro = social** (decisão fechada): conta para Resenha Forte, **não** dá MVP e **não** quebra o Invicto.
- **Raçudo** é positiva e também tem badges dedicadas (Operário, Raçudo do Mês).

### Nota — campinho "Os piores" (home)
A aba **"Os piores"** é um **agrupamento visual** que monta 5 posições com `Bagre da Noite, Cone, Pregueiro, Chorão, Reclamão, Paneleiro` (negativos + zoeira social). Isso é **só apresentação**: as sociais **continuam sociais** para efeito de badge (levar Chorão NÃO conta como negativa / NÃO quebra Invicto). As únicas traits negativas "de verdade" são `Bagre da Noite, Cone, Pregueiro`.

---

## 3. MVP — cálculo automático (Opção B)

Não há votação separada de MVP. O **MVP da rodada** é quem soma **mais pontos de traits positivas** naquela rodada. Não é fixo — muda conforme o desempenho.

| Trait positiva | Pontos |
|---|---|
| **Categoria** | **4** (o craque da rodada) |
| Matador | 3 |
| Paredão | 3 |
| Raçudo | 2 |
| Xerife | 2 |
| Garçom | 2 |
| Driblador | 2 |

**Empate:** vence quem tiver a trait de maior peso (Categoria > Matador/Paredão > demais). Persistindo o empate, **MVP compartilhado** na rodada.

Cadeia de progressão de MVP:
```
trait positiva → pontos da rodada → MVP da rodada → Rei Absoluto (5) → Craque da Galera (10) → Craque Histórico (20)
```

---

## 4. Matriz oficial das 24 badges

### PRESENÇA (frequência)
| Badge | Fonte | Regra |
|---|---|---|
| Primeira Pelada | Participação | 1 participação |
| Veterano | Participação | 10 participações |
| Casca Grossa | Participação | 25 participações |
| Mais Presente | Participação | 100% das rodadas do mês |
| Alma do Grupo | Participação | 80% das rodadas em 3 meses consecutivos |
| Hall da Fama | Participação | 50 participações |
| **Lenda do Baba** | Participação + MVP + Positivas | 100 participações **e** 5 MVPs **e** 50 traits positivas acumuladas |

### PERFORMANCE (MVP por pontos)
| Badge | Fonte | Regra |
|---|---|---|
| MVP | MVP | ser MVP da rodada 1x |
| Rei Absoluto | MVP | 5 MVPs |
| Craque da Galera | MVP | 10 MVPs |
| Rei do Mês | MVP | mais MVPs no mês |
| Craque Histórico | MVP | 20 MVPs |

### SEQUÊNCIAS
| Badge | Fonte | Regra |
|---|---|---|
| Em Chamas | Positivas | trait positiva em **3** rodadas consecutivas |
| Imparável | Positivas | trait positiva em **5** rodadas consecutivas |
| Invicto | Positivas | trait positiva em **10** rodadas consecutivas |
| Consistente | Participação + Positivas | participou **e** recebeu ≥1 positiva em **8** rodadas consecutivas |
| Virada de Chave | Traits | rodada A: negativa (Bagre/Cone/Pregueiro) → rodada B: positiva |

> Em Chamas (3) / Imparável (5) / Invicto (10) são o ladder puro de positivas consecutivas.
> Consistente (8) tem identidade própria por exigir **presença + desempenho** (não é só a sequência).

### RECONHECIMENTO
| Badge | Fonte | Regra |
|---|---|---|
| Operário | Trait Raçudo | receber Raçudo 5x |
| Raçudo do Mês | Trait Raçudo | mais votos de Raçudo no mês |
| Resenha Forte | Traits sociais | 20 traits sociais acumuladas |
| Querido da Galera | Positivas | 50 traits positivas acumuladas |

### COLEÇÃO
| Badge | Fonte | Regra |
|---|---|---|
| Colecionador | Badges | desbloquear 8 badges |
| Mestre da Resenha | Badges | desbloquear 16 badges |
| Completo! | Badges | desbloquear todas as badges |

---

## 5. Raridades (4 tiers)

A cor do tier é o sistema visual: **borda do tile + cadeado + chip de raridade** no mesmo tom.
(Verde é a cor de ação da marca — por isso "Incomum" é azul, não verde.)

| Raridade | Cor | Qtd |
|---|---|---|
| ⚪ Comum | `#9b9b9b` | 9 |
| 🔵 Incomum | `#5aa9e6` | 6 |
| 🟣 Rara | `#a978f0` | 5 |
| 🥇 Épica | `#e2c485` (borda `#7a5c28`) | 4 |

### Classificação
- **Comum (9):** Primeira Pelada, MVP, Virada de Chave, Em Chamas, Veterano, Operário, Consistente, Rei do Mês, Colecionador
- **Incomum (6):** Mais Presente, Raçudo do Mês, Rei Absoluto, Resenha Forte, Casca Grossa, Imparável
- **Rara (5):** Alma do Grupo, Invicto, Craque da Galera, Hall da Fama, Querido da Galera
- **Épica (4):** Lenda do Baba, Craque Histórico, Mestre da Resenha, Completo!

---

## 6. Futuro (v3 — precisa de dado/backend, não entra agora)
- Data da conquista no modal.
- % de jogadores do grupo que têm a badge (raridade real/dinâmica).
- Ranking por badges.
