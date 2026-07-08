import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Endpoint mínimo pra identificar o usuário no PostHog sem forçar o layout raiz
 * (e todas as páginas estáticas tipo /termos, /privacidade) a virar dinâmico.
 * `role` incluído pra alimentar o MenuSheet (item "Vincular presença" só pra
 * admin) sem precisar de outra rota — só quem realmente abre o menu chama isso. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ userId: null });
  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });
  return NextResponse.json({ userId: session.user.id, email: session.user.email ?? null, role: jogador?.role ?? null });
}
