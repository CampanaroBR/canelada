import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

const PUBLIC_PREFIXES = ["/login", "/api/auth", "/glass-test"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
