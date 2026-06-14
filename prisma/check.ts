import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  console.log("USERS:", JSON.stringify(users));

  const jogadores = await prisma.jogador.findMany({ select: { id: true, apelido: true, grupoId: true, userId: true } });
  console.log("JOGADORES:", JSON.stringify(jogadores));

  const grupos = await prisma.grupo.findMany({ select: { id: true, nome: true, slug: true } });
  console.log("GRUPOS:", JSON.stringify(grupos));
}

main().finally(() => prisma.$disconnect());
