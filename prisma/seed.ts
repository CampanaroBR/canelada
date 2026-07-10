import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, TraitCategoria } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── Traits de personalidade ────────────────────────────────────────────────────
// Ordem e textos seguem o PRD oficial — "Sistema de Traits do Canelada".
// Etapa 1 (Futebol) → Etapa 2 (Personalidade) → Etapa 3 (Resenha).
const TRAITS: { slug: string; nome: string; categoria: TraitCategoria; emoji: string; descricao?: string; peso?: number }[] = [
  // Grupo 1 — Futebol (obrigatório)
  { slug: "categoria",     nome: "Categoria",       categoria: TraitCategoria.FUTEBOL,       emoji: "👑", descricao: "O dono da bola e do campo. Humilha todo mundo com categoria.", peso: 3 },
  { slug: "matador",       nome: "Matador",         categoria: TraitCategoria.FUTEBOL,       emoji: "⚽", descricao: "Especialista em finalizar jogadas e balançar as redes.", peso: 3 },
  { slug: "paredao",       nome: "Paredão",         categoria: TraitCategoria.FUTEBOL,       emoji: "🧤", descricao: "Intransponível na defesa. Fechou o gol e salvou o time nos momentos decisivos.", peso: 3 },
  { slug: "racudo",        nome: "Raçudo",          categoria: TraitCategoria.FUTEBOL,       emoji: "💪", descricao: "Se destaca pela entrega, intensidade e vontade de vencer.", peso: 2 },
  { slug: "xerife",        nome: "Xerife",          categoria: TraitCategoria.FUTEBOL,       emoji: "👊", descricao: "Lidera dentro de campo, organiza o time e assume a responsabilidade.", peso: 2 },
  { slug: "garcom",        nome: "Garçom",          categoria: TraitCategoria.FUTEBOL,       emoji: "🥂", descricao: "Enxerga o jogo como poucos. Cria oportunidades e distribui assistências.", peso: 2 },
  { slug: "driblador",     nome: "Driblador",       categoria: TraitCategoria.FUTEBOL,       emoji: "⚽💨", descricao: "Desmonta a marcação com dribles, velocidade e muita habilidade.", peso: 2 },
  { slug: "gol-mais-bonito", nome: "Gol Mais Bonito", categoria: TraitCategoria.FUTEBOL,     emoji: "🎯", descricao: "A pintura da noite. Marcou o gol mais bonito da rodada.", peso: 2 },
  // Grupo 2 — Resenha (opcional)
  { slug: "resenha-forte", nome: "Só Resenha",      categoria: TraitCategoria.PERSONALIDADE, emoji: "🎤", descricao: "Responsável pela animação, brincadeiras e energia do grupo. E não joga nada! 😂", peso: 1 },
  { slug: "delegado",      nome: "Delegado",        categoria: TraitCategoria.PERSONALIDADE, emoji: "🔒⚽", descricao: "A bola é dele. O resto do time só acompanha a jogada.", peso: 1 },
  { slug: "chorao",        nome: "Chorão",          categoria: TraitCategoria.PERSONALIDADE, emoji: "😭", descricao: "Sempre encontra um motivo para lamentar uma derrota, lance perdido ou situação adversa.", peso: 1 },
  { slug: "reclamao",      nome: "Reclamão",        categoria: TraitCategoria.PERSONALIDADE, emoji: "😡", descricao: "Questiona decisões, marcações e jogadas com frequência.", peso: 2 },
  { slug: "paneleiro",     nome: "Paneleiro",       categoria: TraitCategoria.PERSONALIDADE, emoji: "🍳", descricao: "Prefere jogar sempre com os mesmos parceiros e amigos.", peso: 1 },
  // Grupo 3 — Destaques Negativos (opcional)
  { slug: "firuleiro",     nome: "Firuleiro",       categoria: TraitCategoria.RESENHA,       emoji: "🎭", descricao: "Tenta o drible mais difícil quando o passe simples resolveria.", peso: 1 },
  { slug: "pregueiro",     nome: "Pregueiro",       categoria: TraitCategoria.RESENHA,       emoji: "🦥", descricao: "Corre pouco, não se dedica e parece estar sempre economizando energia.", peso: 2 },
  { slug: "cone",          nome: "Cone",            categoria: TraitCategoria.RESENHA,       emoji: "🚧", descricao: "Teve pouca participação na partida. A bola bateu e voltou.", peso: 1 },
  { slug: "bagre",         nome: "Bagre da Noite",  categoria: TraitCategoria.RESENHA,       emoji: "🐟", descricao: "Representa a pior atuação da rodada. Errou passes, perdeu gols e teve dificuldades durante a partida.", peso: 3 },
  { slug: "frangueiro",    nome: "Frangueiro",      categoria: TraitCategoria.RESENHA,       emoji: "🐔", descricao: "O goleiro que toma um gol bobo, com bola fácil que escapa da mão ou do pé.", peso: 3 },
  { slug: "bragueiro",     nome: "Bragueiro",       categoria: TraitCategoria.RESENHA,       emoji: "🐴", descricao: "O jogador que entrega a bola pro adversário com um passe errado ou saída desastrosa.", peso: 2 },
  // Traits extras / legadas (fora do fluxo ordenado, mantidas para badges/perfis já existentes)
  { slug: "corpo-mole",    nome: "Corpo Mole",      categoria: TraitCategoria.RESENHA,       emoji: "🛋️", descricao: "Corre pouco e parece estar sempre economizando energia." },
  { slug: "catimbeiro",    nome: "Catimbeiro",      categoria: TraitCategoria.PERSONALIDADE, emoji: "🐢" },
  { slug: "fominha",       nome: "Fominha",         categoria: TraitCategoria.PERSONALIDADE, emoji: "🐷" },
  { slug: "perna-de-pau",  nome: "Perna de Pau",    categoria: TraitCategoria.RESENHA,       emoji: "💀" },
  { slug: "chegou-agora",  nome: "Chegou Agora",    categoria: TraitCategoria.RESENHA,       emoji: "🐌" },
];

// ── Medalhas (badges hexagonais de conquista) ─────────────────────────────────
const MEDALHA_TRAITS = [
  { slug: "em-chamas",         nome: "Em chamas",         categoria: TraitCategoria.FUTEBOL, emoji: "🔥", descricao: "3x seguido como MVP/Matador" },
  { slug: "rei-do-mes",        nome: "Rei do mês",        categoria: TraitCategoria.FUTEBOL, emoji: "👑", descricao: "MVP mais vezes no mês" },
  { slug: "veterano",          nome: "Veterano",          categoria: TraitCategoria.FUTEBOL, emoji: "🎖️", descricao: "Presente em 20+ rodadas" },
  { slug: "lenda",             nome: "Lenda",             categoria: TraitCategoria.FUTEBOL, emoji: "⭐", descricao: "MVP em 10+ rodadas no total" },
  { slug: "primeira-vitoria",  nome: "Primeira vitória",  categoria: TraitCategoria.FUTEBOL, emoji: "🏆", descricao: "Primeiro MVP da carreira" },
  { slug: "invicto",           nome: "Invicto",           categoria: TraitCategoria.FUTEBOL, emoji: "🛡️", descricao: "5 rodadas sem ser Bagre" },
  { slug: "completo",          nome: "Completo",          categoria: TraitCategoria.FUTEBOL, emoji: "⭐", descricao: "MVP em todas as categorias" },
  { slug: "trofeu-bagre",      nome: "Troféu Bagre",      categoria: TraitCategoria.RESENHA, emoji: "🐟", descricao: "5x Bagre da noite" },
  { slug: "racudo-do-mes",     nome: "Raçudo do mês",     categoria: TraitCategoria.FUTEBOL, emoji: "💪", descricao: "Raçudo mais vezes no mês" },
  { slug: "alma-do-grupo",     nome: "Alma do Grupo",     categoria: TraitCategoria.PERSONALIDADE, emoji: "❤️", descricao: "Mais votado em Resenha" },
  { slug: "consistente",       nome: "Consistente",       categoria: TraitCategoria.FUTEBOL, emoji: "📈", descricao: "Top 3 em 5 rodadas seguidas" },
  { slug: "irregular",         nome: "Irregular",         categoria: TraitCategoria.FUTEBOL, emoji: "📉", descricao: "Alternou MVP e Bagre na mesma semana" },
  { slug: "mais-presente",     nome: "Mais presente",     categoria: TraitCategoria.FUTEBOL, emoji: "📅", descricao: "Mais rodadas jogadas no mês" },
  { slug: "lanterna",          nome: "Lanterna",          categoria: TraitCategoria.RESENHA, emoji: "🏮", descricao: "Último no ranking por 1 mês" },
  { slug: "rei-absoluto",      nome: "Rei absoluto",      categoria: TraitCategoria.FUTEBOL, emoji: "🏆", descricao: "Líder em todas as categorias" },
  { slug: "ma-fase",           nome: "Má fase",           categoria: TraitCategoria.RESENHA, emoji: "💀", descricao: "3x seguido como pior personagem" },
  { slug: "so-perde",          nome: "Só perde",          categoria: TraitCategoria.RESENHA, emoji: "😭", descricao: "5 derrotas consecutivas" },
  { slug: "jogador-invisivel", nome: "Jogador invisível", categoria: TraitCategoria.RESENHA, emoji: "👻", descricao: "0 votos em 3 rodadas seguidas" },
  { slug: "virada-de-chave",   nome: "Virada de chave",   categoria: TraitCategoria.FUTEBOL, emoji: "🔑", descricao: "Do pior para o melhor em 1 jogo" },
];

// ── Jogadores ─────────────────────────────────────────────────────────────────
const PLAYERS = [
  { apelido: "Falcão"     },  // MVP dominante
  { apelido: "Romário"    },  // MVP runner-up
  { apelido: "Ronaldinho" },  // Rei da resenha
  { apelido: "Adriano"    },  // Bagre crônico
  { apelido: "Zico"       },  // Raçudo do grupo
  { apelido: "Cafu"       },  // Xerife, consistente
  { apelido: "Bebeto"     },  // Garçom, passador
  { apelido: "Rivaldo"    },  // Paneleiro assumido
  { apelido: "Roberto"    },  // Cone ocasional
  { apelido: "Kaká"       },  // Virada de chave recente
];

// ── Roteiro das 8 rodadas ─────────────────────────────────────────────────────
const ROTEIRO = [
  {
    semanas: 8,
    mvp: "Falcão", bagre: "Roberto",  racudo: "Zico",    resenha: "Ronaldinho",
    traits: [
      { votado: "Falcão",     slug: "matador"      },
      { votado: "Roberto",    slug: "cone"         },
      { votado: "Ronaldinho", slug: "resenha-forte" },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Falcão abriu a temporada com uma exibição impressionante e foi eleito MVP da rodada." },
      { tipo: "BAGRE"            as const, texto: "Roberto inaugurou o ranking do Bagre nessa primeira rodada da temporada." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Falcão conquistou a trait Matador com duas finalizações certeiras na noite." },
      { tipo: "SELECAO"          as const, texto: "Seleção da Rodada: Falcão, Zico, Cafu, Bebeto e Kaká." },
    ],
  },
  {
    semanas: 7,
    mvp: "Zico",    bagre: "Adriano",  racudo: "Cafu",    resenha: "Ronaldinho",
    traits: [
      { votado: "Zico",    slug: "racudo"    },
      { votado: "Adriano", slug: "corpo-mole" },
      { votado: "Cafu",    slug: "xerife"    },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Zico dominou o meio-campo e foi eleito MVP da segunda rodada." },
      { tipo: "BAGRE"            as const, texto: "Adriano teve uma noite apagada e levou o Bagre da semana." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Zico conquistou a trait Raçudo pelo volume de marcação e correria." },
      { tipo: "SELECAO"          as const, texto: "Seleção da Rodada: Zico, Cafu, Romário, Bebeto e Falcão." },
    ],
  },
  {
    semanas: 6,
    mvp: "Falcão",  bagre: "Adriano",  racudo: "Zico",    resenha: "Ronaldinho",
    traits: [
      { votado: "Falcão",  slug: "categoria" },
      { votado: "Adriano", slug: "bagre"     },
      { votado: "Bebeto",  slug: "garcom"    },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Falcão voltou ao topo — segundo MVP na temporada. O grupo já sabe quem é o favorito." },
      { tipo: "BAGRE"            as const, texto: "Adriano levou o Bagre pela segunda rodada consecutiva. A fase não ajuda." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Bebeto conquistou a trait Garçom pelas assistências que criaram os gols da noite." },
      { tipo: "SELECAO"          as const, texto: "Seleção da Rodada: Falcão, Zico, Romário, Cafu e Roberto." },
    ],
  },
  {
    semanas: 5,
    mvp: "Romário",  bagre: "Bebeto",  racudo: "Falcão",  resenha: "Rivaldo",
    traits: [
      { votado: "Romário", slug: "matador"   },
      { votado: "Bebeto",  slug: "catimbeiro" },
      { votado: "Rivaldo", slug: "paneleiro" },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Romário acordou nessa rodada — finalizações no estilo clássico e MVP com folga." },
      { tipo: "BAGRE"            as const, texto: "Bebeto foi a surpresa negativa e levou o Bagre da noite." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Romário conquistou a trait Matador — dois gols decisivos na noite." },
      { tipo: "SELECAO"          as const, texto: "Seleção da Rodada: Romário, Falcão, Zico, Cafu e Ronaldinho." },
    ],
  },
  {
    semanas: 4,
    mvp: "Falcão",  bagre: "Cafu",    racudo: "Roberto",  resenha: "Ronaldinho",
    traits: [
      { votado: "Falcão",     slug: "matador"  },
      { votado: "Cafu",       slug: "corpo-mole" },
      { votado: "Ronaldinho", slug: "firuleiro" },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Falcão está em chamas — terceiro MVP nas últimas cinco rodadas. Ninguém para esse cara." },
      { tipo: "BAGRE"            as const, texto: "Cafu sumiu da partida inteira e saiu com o Bagre no pescoço." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Falcão colecionou mais um Matador — já são três na temporada." },
      { tipo: "SELECAO"          as const, texto: "Seleção da Rodada: Falcão, Romário, Zico, Bebeto e Kaká." },
    ],
  },
  {
    semanas: 3,
    mvp: "Romário",  bagre: "Adriano",  racudo: "Zico",   resenha: "Ronaldinho",
    traits: [
      { votado: "Romário", slug: "fominha"   },
      { votado: "Adriano", slug: "bagre"     },
      { votado: "Zico",    slug: "racudo"    },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Romário foi MVP pela segunda vez na temporada — disputa com Falcão esquentou de vez." },
      { tipo: "BAGRE"            as const, texto: "Adriano voltou ao ranking do Bagre. Já são três na temporada — virou clássico." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Zico confirmou a trait Raçudo com mais uma rodada de correria total." },
      { tipo: "SEQUENCIA"        as const, texto: "Falcão e Romário dividem a liderança do MVP — rivalidade quente na reta final." },
    ],
  },
  {
    semanas: 2,
    mvp: "Falcão",  bagre: "Adriano",  racudo: "Cafu",    resenha: "Ronaldinho",
    traits: [
      { votado: "Falcão",  slug: "racudo"   },
      { votado: "Roberto", slug: "cone"     },
      { votado: "Rivaldo", slug: "reclamao" },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Falcão foi MVP pela quarta vez na temporada. Está longe da concorrência." },
      { tipo: "BAGRE"            as const, texto: "Adriano zerou mais uma vez e levou o quarto Bagre da temporada." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Falcão conquistou a trait Raçudo — dois gols e marcação intensa na noite." },
      { tipo: "SELECAO"          as const, texto: "Seleção da Rodada: Falcão, Romário, Zico, Cafu e Ronaldinho." },
    ],
  },
  {
    semanas: 1,
    mvp: "Kaká",    bagre: "Roberto",  racudo: "Zico",    resenha: "Ronaldinho",
    traits: [
      { votado: "Kaká",    slug: "categoria" },
      { votado: "Roberto", slug: "cone"      },
      { votado: "Zico",    slug: "xerife"    },
    ],
    stories: [
      { tipo: "MVP"              as const, texto: "Kaká apareceu do nada e roubou o show — MVP na última rodada com categoria." },
      { tipo: "BAGRE"            as const, texto: "Roberto levou o Bagre da rodada mais recente. Noite difícil." },
      { tipo: "TRAIT_CONQUISTADA" as const, texto: "Kaká conquistou a trait Categoria em grande estilo — virada de chave total." },
      { tipo: "SELECAO"          as const, texto: "Seleção da Rodada: Kaká, Falcão, Romário, Zico e Ronaldinho." },
    ],
  },
];

// ── Medalhas conquistadas (JogadorTrait com slug de medalha) ──────────────────
const JOGADOR_MEDALHAS = [
  { apelido: "Falcão",  slug: "em-chamas",        contador: 1, descricao: "3x seguido como MVP/Matador"  },
  { apelido: "Kaká",    slug: "virada-de-chave",   contador: 1, descricao: "Do pior para o melhor em 1 jogo" },
  { apelido: "Romário", slug: "primeira-vitoria",  contador: 1, descricao: "Primeiro MVP da carreira"     },
  { apelido: "Zico",    slug: "consistente",       contador: 1, descricao: "Top 3 em 5 rodadas seguidas"  },
  { apelido: "Adriano", slug: "ma-fase",           contador: 1, descricao: "3x seguido como pior personagem" },
];

// ── Traits acumuladas por jogador ─────────────────────────────────────────────
const JOGADOR_TRAITS = [
  { apelido: "Falcão",     slug: "matador",       contador: 4 },
  { apelido: "Falcão",     slug: "racudo",        contador: 2 },
  { apelido: "Falcão",     slug: "categoria",     contador: 1 },
  { apelido: "Romário",    slug: "matador",       contador: 2 },
  { apelido: "Romário",    slug: "fominha",       contador: 1 },
  { apelido: "Zico",       slug: "racudo",        contador: 3 },
  { apelido: "Zico",       slug: "xerife",        contador: 1 },
  { apelido: "Cafu",       slug: "xerife",        contador: 2 },
  { apelido: "Cafu",       slug: "paredao",       contador: 1 },
  { apelido: "Bebeto",     slug: "garcom",        contador: 2 },
  { apelido: "Bebeto",     slug: "categoria",     contador: 1 },
  { apelido: "Ronaldinho", slug: "resenha-forte", contador: 4 },
  { apelido: "Ronaldinho", slug: "firuleiro",     contador: 2 },
  { apelido: "Adriano",    slug: "bagre",         contador: 4 },
  { apelido: "Adriano",    slug: "corpo-mole",    contador: 2 },
  { apelido: "Rivaldo",    slug: "paneleiro",     contador: 2 },
  { apelido: "Rivaldo",    slug: "reclamao",      contador: 1 },
  { apelido: "Roberto",    slug: "cone",          contador: 3 },
  { apelido: "Kaká",       slug: "categoria",     contador: 1 },
];

async function main() {
  console.log("🌱 Iniciando seed completo...\n");

  // 1. Traits de personalidade
  for (const t of TRAITS) {
    await prisma.trait.upsert({
      where: { slug: t.slug },
      update: { nome: t.nome, categoria: t.categoria, emoji: t.emoji, descricao: t.descricao ?? null, peso: t.peso },
      create: t,
    });
  }
  // Medalhas como Traits
  for (const m of MEDALHA_TRAITS) {
    await prisma.trait.upsert({ where: { slug: m.slug }, update: {}, create: m });
  }
  console.log(`✓ ${TRAITS.length} traits + ${MEDALHA_TRAITS.length} medalhas`);

  // 2. Grupo
  const grupo = await prisma.grupo.upsert({
    where: { slug: "os-crias" },
    update: {},
    create: { nome: "Os Crias FC", slug: "os-crias" },
  });
  console.log(`✓ Grupo: ${grupo.nome}`);

  // 3. Users + Jogadores
  const jogadorMap: Record<string, string> = {};
  for (let i = 0; i < PLAYERS.length; i++) {
    const { apelido } = PLAYERS[i];
    const email = `${apelido.toLowerCase().replace(/[^a-z0-9]/g, "")}@seed.canelada.app`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { id: `seed-user-${i.toString().padStart(2, "0")}`, email, name: apelido },
    });
    const jogador = await prisma.jogador.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, grupoId: grupo.id, apelido },
    });
    jogadorMap[apelido] = jogador.id;
  }
  console.log(`✓ ${PLAYERS.length} jogadores`);

  // 4. Rodadas + Votos + Stories
  const votanteFixo = jogadorMap["Zico"]; // votante padrão

  for (const r of ROTEIRO) {
    const data = new Date();
    data.setDate(data.getDate() - r.semanas * 7);
    data.setHours(20, 0, 0, 0);

    // Idempotente: skip se já existe
    const exists = await prisma.rodada.findFirst({
      where: {
        grupoId: grupo.id,
        data: {
          gte: new Date(data.getTime() - 36 * 3_600_000),
          lte: new Date(data.getTime() + 36 * 3_600_000),
        },
      },
    });
    if (exists) { console.log(`  ↳ Rodada -${r.semanas}sem já existe, pulando.`); continue; }

    const rodada = await prisma.rodada.create({
      data: { grupoId: grupo.id, data, encerrada: true },
    });

    // Votos principais
    for (const [categoria, apelido] of [
      ["MVP",     r.mvp    ],
      ["BAGRE",   r.bagre  ],
      ["RACUDO",  r.racudo ],
      ["RESENHA", r.resenha],
    ] as const) {
      await prisma.voto.create({
        data: { rodadaId: rodada.id, votanteId: votanteFixo, votadoId: jogadorMap[apelido], categoria },
      });
    }

    // Votos de trait (votante diferente por índice para evitar conflito)
    const traitVotantes = [jogadorMap["Falcão"], jogadorMap["Romário"], jogadorMap["Adriano"]];
    for (let i = 0; i < r.traits.length; i++) {
      const tv = r.traits[i];
      const tvId = traitVotantes[i];
      if (!tvId || !jogadorMap[tv.votado]) continue;
      await prisma.voto.upsert({
        where: { rodadaId_votanteId_categoria_traitSlug: { rodadaId: rodada.id, votanteId: tvId, categoria: "TRAIT", traitSlug: tv.slug } },
        update: {},
        create: {
          rodadaId: rodada.id,
          votanteId: tvId,
          votadoId: jogadorMap[tv.votado],
          categoria: "TRAIT",
          traitSlug: tv.slug,
        },
      });
    }

    // Stories
    const storyBase = new Date(data.getTime() + 2 * 3_600_000);
    for (let i = 0; i < r.stories.length; i++) {
      const s = r.stories[i];
      await prisma.story.create({
        data: {
          rodadaId: rodada.id,
          tipo: s.tipo,
          texto: s.texto,
          createdAt: new Date(storyBase.getTime() + i * 60_000),
        },
      });
    }

    console.log(`✓ Rodada -${r.semanas}sem — MVP: ${r.mvp}, Bagre: ${r.bagre}`);
  }

  // 5. JogadorTrait de personalidade
  for (const jt of JOGADOR_TRAITS) {
    const jogadorId = jogadorMap[jt.apelido];
    if (!jogadorId) continue;
    await prisma.jogadorTrait.upsert({
      where: { jogadorId_traitSlug: { jogadorId, traitSlug: jt.slug } },
      update: { contador: jt.contador },
      create: { jogadorId, traitSlug: jt.slug, contador: jt.contador },
    });
  }
  console.log(`✓ ${JOGADOR_TRAITS.length} trait assignments`);

  // 6. JogadorTrait de medalhas (conquistas)
  for (const jm of JOGADOR_MEDALHAS) {
    const jogadorId = jogadorMap[jm.apelido];
    if (!jogadorId) continue;
    await prisma.jogadorTrait.upsert({
      where: { jogadorId_traitSlug: { jogadorId, traitSlug: jm.slug } },
      update: { contador: jm.contador },
      create: { jogadorId, traitSlug: jm.slug, contador: jm.contador },
    });
  }
  console.log(`✓ ${JOGADOR_MEDALHAS.length} medalhas conquistadas`);

  console.log("\n✅ Seed completo! O app está vivo.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
