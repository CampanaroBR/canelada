import Link from "next/link";

export const metadata = { title: "Termos de Uso · Canelada" };

export default function TermosPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#090909", color: "#fff" }}>
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
        <Link href="/perfil" aria-label="Voltar" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginLeft: -8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7a7a" }}>Termos de Uso</span>
      </header>
      <main style={{ padding: "16px 20px 40px", maxWidth: 640, margin: "0 auto", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.7, color: "#b0b0b6" }}>
        <p>O Canelada é um app para organizar peladas (babás) e a resenha do grupo: criar rodadas, votar em personagens e acompanhar conquistas. O acesso é por convite, dentro do seu grupo.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", margin: "20px 0 8px" }}>Uso</h2>
        <p>Ao usar o app, você concorda em manter um comportamento respeitoso com os outros jogadores. Votos e brincadeiras fazem parte da resenha, mas conteúdo ofensivo ou abusivo pode levar à remoção do grupo.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", margin: "20px 0 8px" }}>Conta</h2>
        <p>Você é responsável por manter o acesso à sua conta. O login é feito por provedores externos (ex.: Google) ou por link mágico no e-mail.</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", margin: "20px 0 8px" }}>Contato</h2>
        <p>Dúvidas? Fale com a gente em <a href="mailto:arthursf.designer@gmail.com" style={{ color: "#9fe870" }}>arthursf.designer@gmail.com</a>.</p>
        <p style={{ color: "#5a5a5a", marginTop: 24, fontSize: 12 }}>Última atualização: junho de 2026.</p>
      </main>
    </div>
  );
}
