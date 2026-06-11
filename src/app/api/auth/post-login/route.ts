import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  redirect(jogador ? "/feed" : "/onboarding");
}
