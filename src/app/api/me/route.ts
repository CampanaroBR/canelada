import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

/** Endpoint mínimo pra identificar o usuário no PostHog sem forçar o layout raiz
 * (e todas as páginas estáticas tipo /termos, /privacidade) a virar dinâmico. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ userId: null });
  return NextResponse.json({ userId: session.user.id, email: session.user.email ?? null });
}
