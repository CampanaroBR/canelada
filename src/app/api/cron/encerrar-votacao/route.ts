import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sincronizarBadges, nomeBadge } from "@/lib/badges";
import { sendPushToSubscriptions } from "@/lib/webpush";
import { votacaoEncerrada } from "@/lib/votacaoJanela";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}


export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rodadas cuja votação já fechou mas ainda não foram marcadas como encerradas
  const abertas = await prisma.rodada.findMany({
    where: { encerrada: false },
    select: { id: true, grupoId: true, data: true },
  });
  const aEncerrar = abertas.filter(r => votacaoEncerrada(r.data));

  if (aEncerrar.length === 0) {
    return NextResponse.json({ ok: true, encerradas: 0, mensagem: "Nenhuma rodada para encerrar." });
  }

  // Marca como encerradas
  await prisma.rodada.updateMany({
    where: { id: { in: aEncerrar.map(r => r.id) } },
    data: { encerrada: true },
  });

  // Sincroniza badges por grupo afetado e notifica quem desbloqueou
  const grupos = [...new Set(aEncerrar.map(r => r.grupoId))];
  let totalNovas = 0, pushEnviados = 0;

  // Broadcast pra todos do grupo: resultados saíram
  for (const grupoId of grupos) {
    const membros = await prisma.jogador.findMany({
      where: { grupoId },
      include: { pushSubscriptions: true },
    });
    const subs = membros.flatMap((m) => m.pushSubscriptions);
    if (subs.length > 0) {
      const r = await sendPushToSubscriptions(subs, {
        title: "🏆 Saíram os resultados!",
        body: "A votação encerrou. Vem ver quem foi o craque e quem foi o bagre! 😂",
        url: "/feed",
      });
      pushEnviados += r.entregues;
    }
  }

  for (const grupoId of grupos) {
    const novas = await sincronizarBadges(grupoId);
    if (novas.length === 0) continue;
    totalNovas += novas.length;

    // Agrupa por jogador → 1 push por jogador
    const porJogador = new Map<string, string[]>();
    for (const n of novas) {
      const arr = porJogador.get(n.jogadorId) ?? [];
      arr.push(n.slug);
      porJogador.set(n.jogadorId, arr);
    }

    const subs = await prisma.pushSubscription.findMany({
      where: { jogadorId: { in: [...porJogador.keys()] } },
      select: { jogadorId: true, endpoint: true, p256dh: true, auth: true },
    });
    const subsPorJogador = new Map<string, typeof subs>();
    for (const s of subs) {
      const arr = subsPorJogador.get(s.jogadorId) ?? [];
      arr.push(s);
      subsPorJogador.set(s.jogadorId, arr);
    }

    for (const [jogadorId, slugs] of porJogador) {
      const meus = subsPorJogador.get(jogadorId);
      if (!meus || meus.length === 0) continue;
      const body = slugs.length === 1
        ? `Você desbloqueou "${nomeBadge(slugs[0])}"!`
        : `Você desbloqueou ${slugs.length} novas badges!`;
      const r = await sendPushToSubscriptions(meus, { title: "🏅 Nova badge!", body, url: "/medalhas" });
      pushEnviados += r.entregues;
    }
  }

  return NextResponse.json({ ok: true, encerradas: aEncerrar.length, novasBadges: totalNovas, pushEnviados });
}
