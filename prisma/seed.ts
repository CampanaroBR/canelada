import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, TraitCategoria } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── Traits ────────────────────────────────────────────────────────────────────
const TRAITS = [
  { slug: "racudo",        nome: "Raçudo",         categoria: TraitCategoria.FUTEBOL,       emoji: "💪" },
  { slug: "matador",       nome: "Matador",         categoria: TraitCategoria.FUTEBOL,       emoji: "⚽" },
  { slug: "paredao",       nome: "Paredão",         categoria: TraitCategoria.FUTEBOL,       emoji: "🧤" },
  { slug: "categoria",     nome: "Categoria",       categoria: TraitCategoria.FUTEBOL,       emoji: "🎩" },
  { slug: "xerife",        nome: "Xerife",          categoria: TraitCategoria.FUTEBOL,       emoji: "👊" },
  { slug: "garcom",        nome: "Garçom",          categoria: TraitCategoria.FUTEBOL,       emoji: "🎁" },
  { slug: "catimbeiro",    nome: "Catimbeiro",      categoria: TraitCategoria.PERSONALIDADE, emoji: "🐢" },
  { slug: "chorao",        nome: "Chorão",          categoria: TraitCategoria.PERSONALIDADE, emoji: "😭" },
  { slug: "paneleiro",     nome: "Paneleiro",       categoria: TraitCategoria.PERSONALIDADE, emoji: "🍳" },
  { slug: "fominha",       nome: "Fominha",         categoria: TraitCategoria.PERSONALIDADE, emoji: "🐷" },
  { slug: "resenha-forte", nome: "Resenha Forte",   categoria: TraitCategoria.PERSONALIDADE, emoji: "🎤" },
  { slug: "bagre",         nome: "Bagre da Noite",  categoria: TraitCategoria.RESENHA,       emoji: "🐟" },
  { slug: "cone",          nome: "Cone",            categoria: TraitCategoria.RESENHA,       emoji: "🔺" },
  { slug: "corpo-mole",    nome: "Corpo Mole",      categoria: TraitCategoria.RESENHA,       emoji: "🛋️" },
  { slug: "firuleiro",     nome: "Firuleiro",       categoria: TraitCategoria.RESENHA,       emoji: "💅" },
  { slug: "reclamao",      nome: "Reclamão",        categoria: TraitCategoria.RESENHA,       emoji: "😤" },
  { slug: "chegou-agora",  nome: "Chegou Agora",    categoria: TraitCategoria.RESENHA,       emoji: "🐌" },
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

  // 1. Traits
  for (const t of TRAITS) {
    await prisma.trait.upsert({ where: { slug: t.slug }, update: {}, create: t });
  }
  console.log(`✓ ${TRAITS.length} traits`);

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
      await prisma.voto.upsert({
        where: { rodadaId_votanteId_categoria: { rodadaId: rodada.id, votanteId: votanteFixo, categoria } },
        update: {},
        create: { rodadaId: rodada.id, votanteId: votanteFixo, votadoId: jogadorMap[apelido], categoria },
      });
    }

    // Votos de trait (votante diferente por índice para evitar conflito)
    const traitVotantes = [jogadorMap["Falcão"], jogadorMap["Romário"], jogadorMap["Adriano"]];
    for (let i = 0; i < r.traits.length; i++) {
      const tv = r.traits[i];
      const tvId = traitVotantes[i];
      if (!tvId || !jogadorMap[tv.votado]) continue;
      await prisma.voto.upsert({
        where: { rodadaId_votanteId_categoria: { rodadaId: rodada.id, votanteId: tvId, categoria: "TRAIT" } },
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

  // 5. JogadorTrait acumulado
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

  console.log("\n✅ Seed completo! O app está vivo.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
