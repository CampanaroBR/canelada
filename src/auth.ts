import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Cada provider só entra se suas credenciais existirem.
// Um provider com credencial faltando/errada invalida TODO o auth (erro "Configuration"),
// derrubando até os outros métodos de login — então carregamos de forma defensiva.
const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}
if (process.env.AUTH_RESEND_KEY) {
  providers.push(Resend({ from: "Canelada <onboarding@resend.dev>" }));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers,
  callbacks: {
    // Portão do convite ANTES da conta existir: usuário novo sem o cookie do link
    // de convite tem o login negado — nenhum registro é criado no banco.
    // Quem já tem conta entra normalmente (o convite é só pra entrada no grupo).
    async signIn({ user }) {
      try {
        if (!user.email) return false;
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (existing) return true; // membro (ou conta já criada) — segue o fluxo normal

        const grupo = await prisma.grupo.findUnique({
          where: { slug: "canelada" },
          select: { inviteCode: true },
        });
        const convite = (await cookies()).get("convite")?.value;
        return !!grupo && convite === grupo.inviteCode;
      } catch {
        // fail-open pra não derrubar login de membros por erro transitório de infra
        return true;
      }
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    // Sem isso, erro (ex.: AccessDenied do portão do convite) cai na página
    // genérica do NextAuth em vez da nossa — que já tem o banner explicando
    // que falta o link de convite (useAccessDenied em /login).
    error: "/login",
  },
});
