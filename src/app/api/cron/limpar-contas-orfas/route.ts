import { NextRequest, NextResponse } from "next/server";
import { limparContasOrfas } from "@/lib/limparContasOrfas";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// Endpoint manual/de teste — a limpeza automática roda embutida no cron
// encerrar-votacao (só aos domingos), pra não precisar de um cron Vercel extra.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const removidas = await limparContasOrfas();
  return NextResponse.json({ ok: true, removidas });
}
