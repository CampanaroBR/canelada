import Link from "next/link";

export const metadata = { title: "Política de Privacidade · Canelada" };

export default function PrivacidadePage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#090909", color: "#fff" }}>
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
        <Link href="/perfil" aria-label="Voltar" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginLeft: -8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7a7a" }}>Privacidade</span>
      </header>
      <main style={{ padding: "16px 20px 40px", maxWidth: 640, margin: "0 auto", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.7, color: "#b0b0b6" }}>
        <p>Levamos sua privacidade a sério. Aqui está, em linguagem direta, o que guardamos e por quê.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", margin: "20px 0 8px" }}>O que guardamos</h2>
        <p>Nome, apelido, e-mail de login e dados do seu jogo no grupo (presenças, votos recebidos, personagens e conquistas). Se você ativar notificações, guardamos um identificador do seu dispositivo só para enviar os avisos.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", margin: "20px 0 8px" }}>Como usamos</h2>
        <p>Usamos seus dados apenas para o funcionamento do app: montar seu perfil, o ranking do grupo e as notificações. Não vendemos seus dados.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", margin: "20px 0 8px" }}>Seus direitos</h2>
        <p>Você pode pedir a exclusão dos seus dados a qualquer momento pelo <a href="mailto:arthursf.designer@gmail.com" style={{ color: "#9fe870" }}>suporte</a>.</p>
        <p style={{ color: "#5a5a5a", marginTop: 24, fontSize: 12 }}>Última atualização: junho de 2026.</p>
      </main>
    </div>
  );
}
