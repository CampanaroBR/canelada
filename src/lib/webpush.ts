import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:arthursf.designer@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToSubscriptions(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url?: string },
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      )
    )
  );

  // Prune de inscrições mortas: 404/410 = endpoint não existe mais (app desinstalado,
  // permissão revogada). Removê-las evita "enviados" fantasma e reenvios inúteis.
  const mortas: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const code = (r.reason as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) mortas.push(subscriptions[i].endpoint);
    }
  });
  if (mortas.length) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: mortas } } });
    } catch { /* best-effort */ }
  }

  const entregues = results.filter((r) => r.status === "fulfilled").length;
  return { results, entregues, mortas: mortas.length };
}
