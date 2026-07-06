import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToSubscriptions } from "@/lib/webpush";
import { votacaoAtiva } from "@/lib/votacaoJanela";

export const dynamic = "force-dynamic";

// Vercel Cron Jobs enviam o header Authorization: Bearer <CRON_SECRET>
function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Abre qualquer rodada cuja JANELA de votação está ativa e ainda não foi aberta.
  // (Robusto a timezone: não depende de casar "data == hoje em UTC".)
  const candidatas = await prisma.rodada.findMany({
    where: { votacaoAberta: false, encerrada: false },
    include: {
      grupo: {
        include: {
          jogadores: {
            include: { pushSubscriptions: true },
          },
        },
      },
    },
  });
  const rodadasHoje = candidatas.filter((r) => votacaoAtiva(r.data));

  if (rodadasHoje.length === 0) {
    return NextResponse.json({ ok: true, abertas: 0, mensagem: "Nenhuma rodada para abrir hoje." });
  }

  const resultados = await Promise.all(
    rodadasHoje.map(async (rodada) => {
      // Marcar votação como aberta
      await prisma.rodada.update({
        where: { id: rodada.id },
        data: { votacaoAberta: true },
      });

      // Coletar todas as subscriptions do grupo
      const subs = rodada.grupo.jogadores.flatMap((j) => j.pushSubscriptions);

      let pushEnviados = 0;
      if (subs.length > 0) {
        const results = await sendPushToSubscriptions(subs, {
          title: "⚽ Votação aberta!",
          body: "Vote nos melhores e piores do baba de hoje!",
          url: "/votacao",
        });
        pushEnviados = results.filter((r) => r.status === "fulfilled").length;
      }

      return { rodadaId: rodada.id, grupo: rodada.grupo.nome, pushEnviados };
    })
  );

  return NextResponse.json({ ok: true, abertas: resultados.length, resultados });
}
