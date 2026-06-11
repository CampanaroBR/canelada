import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (jogador) redirect("/feed");

  return <OnboardingForm />;
}
