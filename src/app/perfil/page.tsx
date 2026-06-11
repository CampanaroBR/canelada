import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PerfilRedirectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { apelido: true },
  });

  if (!jogador) redirect("/onboarding");
  redirect(`/perfil/${jogador.apelido}`);
}
