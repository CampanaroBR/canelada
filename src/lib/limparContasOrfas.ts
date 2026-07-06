import { prisma } from "./prisma";

// Conta "órfã": login OAuth/magic-link criou o User, mas o onboarding nunca
// terminou (sem Jogador vinculado). Espera alguns dias antes de apagar pra não
// derrubar quem está no meio do cadastro. Account/Session cascateiam pelo schema.
const DIAS_ATE_LIMPAR = 3;

export async function limparContasOrfas(): Promise<number> {
  const limite = new Date(Date.now() - DIAS_ATE_LIMPAR * 24 * 60 * 60 * 1000);

  const orfas = await prisma.user.findMany({
    where: { jogador: null, createdAt: { lt: limite } },
    select: { id: true },
  });
  if (orfas.length === 0) return 0;

  await prisma.user.deleteMany({ where: { id: { in: orfas.map((u) => u.id) } } });
  return orfas.length;
}
