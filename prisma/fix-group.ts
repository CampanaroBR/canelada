import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const ARTHUR_JOGADOR_ID = "cmq9bjdn50002jo04933m0o5i";
  const OS_CRIAS_ID       = "cmq9z5diw0000jgxk8wdycd8s";

  await prisma.jogador.update({
    where: { id: ARTHUR_JOGADOR_ID },
    data:  { grupoId: OS_CRIAS_ID, apelido: "Arthur" },
  });

  console.log("✓ Arthur movido para Os Crias FC");
}

main().finally(() => prisma.$disconnect());
