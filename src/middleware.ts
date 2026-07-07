import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

// /api/cron: os handlers têm auth própria (Bearer CRON_SECRET). Sem isto, o
// middleware redirecionava as requisições do Vercel Cron pro /login (307) e a
// votação nunca abria/fechava sozinha.
const PUBLIC_PREFIXES = ["/login", "/api/auth", "/api/cron"];

const CANONICAL_HOST = "canelada.app.br";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Domínio antigo (canelada-nine.vercel.app) mantido no ar em paralelo, mas o login
  // com Google quebra se iniciado por ele: o cookie PKCE é gravado nesse host, porém
  // o Google sempre devolve pro host canônico (AUTH_URL fixo), então o cookie nunca
  // é encontrado no callback ("InvalidCheck: pkceCodeVerifier..."). Redireciona tudo
  // pro domínio canônico antes de qualquer outra coisa pra eliminar esse mismatch.
  const host = request.headers.get("host");
  if (host && host !== CANONICAL_HOST && host.endsWith(".vercel.app")) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  // Cookie do convite gravado no servidor (não depende de JS do client rodar a
  // tempo do usuário tocar em "Entrar com Google" — falhava em navegador in-app
  // do WhatsApp/conexão lenta, derrubando o login com AccessDenied).
  if (pathname === "/login") {
    const convite = request.nextUrl.searchParams.get("convite");
    if (convite) {
      const res = NextResponse.next();
      res.cookies.set("convite", convite, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
      return res;
    }
  }

  // Rate limit no envio de login (signin POST) por IP — fail-open sem Upstash.
  if (request.method === "POST" && pathname.startsWith("/api/auth/signin")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const { ok } = await rateLimit("login", ip, 5, "10 m");
    if (!ok) {
      return new NextResponse("Muitas tentativas de login. Tente novamente em alguns minutos.", { status: 429 });
    }
  }

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  if (!session) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
