import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, TraitCategoria } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const traits = [
  // Futebol
  { slug: "racudo",     nome: "Raçudo",        categoria: TraitCategoria.FUTEBOL,      emoji: "💪" },
  { slug: "matador",    nome: "Matador",        categoria: TraitCategoria.FUTEBOL,      emoji: "⚽" },
  { slug: "paredao",    nome: "Paredão",        categoria: TraitCategoria.FUTEBOL,      emoji: "🧤" },
  { slug: "categoria",  nome: "Categoria",      categoria: TraitCategoria.FUTEBOL,      emoji: "🎩" },
  { slug: "xerife",     nome: "Xerife",         categoria: TraitCategoria.FUTEBOL,      emoji: "👊" },
  // Personalidade
  { slug: "catimbeiro", nome: "Catimbeiro",     categoria: TraitCategoria.PERSONALIDADE, emoji: "🐢" },
  { slug: "chorao",     nome: "Chorão",         categoria: TraitCategoria.PERSONALIDADE, emoji: "😭" },
  { slug: "paneleiro",  nome: "Paneleiro",      categoria: TraitCategoria.PERSONALIDADE, emoji: "🍳" },
  { slug: "fominha",    nome: "Fominha",        categoria: TraitCategoria.PERSONALIDADE, emoji: "🐷" },
  { slug: "resenha-forte", nome: "Resenha Forte", categoria: TraitCategoria.PERSONALIDADE, emoji: "🎤" },
  // Resenha
  { slug: "bagre",       nome: "Bagre da Noite", categoria: TraitCategoria.RESENHA,     emoji: "🐟" },
  { slug: "cone",        nome: "Cone",           categoria: TraitCategoria.RESENHA,     emoji: "🔺" },
  { slug: "corpo-mole",  nome: "Corpo Mole",     categoria: TraitCategoria.RESENHA,     emoji: "🛋️" },
  { slug: "firuleiro",   nome: "Firuleiro",      categoria: TraitCategoria.RESENHA,     emoji: "💅" },
  { slug: "chegou-agora", nome: "Chegou Agora",  categoria: TraitCategoria.RESENHA,     emoji: "🐌" },
];

async function main() {
  console.log("Seeding traits...");
  for (const trait of traits) {
    await prisma.trait.upsert({
      where: { slug: trait.slug },
      update: {},
      create: trait,
    });
  }
  console.log(`✓ ${traits.length} traits inseridas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
