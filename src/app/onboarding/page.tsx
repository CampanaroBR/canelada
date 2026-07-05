import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./OnboardingForm";
import { ConviteNecessario } from "./ConviteNecessario";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (jogador) redirect("/feed");

  // Feedback cedo: sem convite válido, nem mostra o formulário —
  // a pessoa descobre ANTES de digitar qualquer coisa (a action revalida no submit).
  const grupo = await prisma.grupo.findUnique({
    where: { slug: "canelada" },
    select: { inviteCode: true },
  });
  const cookieStore = await cookies();
  const convite = cookieStore.get("convite")?.value;
  const conviteValido = !!grupo && convite === grupo.inviteCode;

  if (!conviteValido) return <ConviteNecessario />;

  return <OnboardingForm />;
}
