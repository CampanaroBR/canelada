import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google,
    // Resend só entra se a chave existir — sem ela o provider invalida TODO o auth
    // (erro "Configuration", quebrando até o login com Google).
    ...(process.env.AUTH_RESEND_KEY
      ? [Resend({ from: "Canelada <onboarding@resend.dev>" })]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
