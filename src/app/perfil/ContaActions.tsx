"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Medal, Bell, EnvelopeSimple, ShieldCheck, FileText, SignOut, CaretRight } from "@phosphor-icons/react";

interface Props {
  email: string;
  grupoNome: string;
  roleLabel: string;
}

type PushState = "idle" | "ativando" | "ativadas" | "bloqueadas" | "erro";

export function ContaActions({ email, grupoNome, roleLabel }: Props) {
  const [push, setPush] = useState<PushState>("idle");

  async function ativarPush() {
    if (push === "ativando" || push === "ativadas") return;
    setPush("ativando");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setPush("erro"); return; }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPush("bloqueadas"); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as unknown as BufferSource,
      });
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      setPush("ativadas");
    } catch { setPush("erro"); }
  }

  const pushRight = push === "ativadas" ? "Ativadas"
    : push === "ativando" ? "Ativando…"
    : push === "bloqueadas" ? "Bloqueadas"
    : push === "erro" ? "Erro" : "Ativar";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* CONTA */}
      <div>
        <GroupTitle>Conta</GroupTitle>
        <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, padding: "4px 16px" }}>
          <InfoRow label="E-mail" value={email || "—"} />
          <Divider />
          <InfoRow label="Grupo" value={grupoNome} />
          <Divider />
          <InfoRow label="Papel" value={roleLabel} />
        </div>
      </div>

      {/* GERAL */}
      <div>
        <GroupTitle>Geral</GroupTitle>
        <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
          <RowLink href="/medalhas" icon={<Medal size={20} color="#9fe870" weight="fill" />} label="Minhas Badges" sub="Personagens e conquistas" />
          <Divider />
          <RowButton onClick={ativarPush} icon={<Bell size={20} color="#fff" weight="regular" />} label="Notificações" sub="Avisos de votação e badges" right={pushRight} rightColor={push === "ativadas" ? "#9fe870" : "#7a7a7a"} />
        </div>
      </div>

      {/* AJUDA & LEGAL */}
      <div>
        <GroupTitle>Ajuda & legal</GroupTitle>
        <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
          <RowLink href="mailto:arthursf.designer@gmail.com?subject=Suporte%20Canelada" icon={<EnvelopeSimple size={20} color="#fff" weight="regular" />} label="Suporte" sub="Fale com a gente" />
          <Divider />
          <RowLink href="/termos" icon={<FileText size={20} color="#fff" weight="regular" />} label="Termos de Uso" />
          <Divider />
          <RowLink href="/privacidade" icon={<ShieldCheck size={20} color="#fff" weight="regular" />} label="Política de Privacidade" />
        </div>
      </div>

      {/* SAIR */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <SignOut size={20} color="#ef4444" weight="regular" />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#ef4444" }}>Sair</span>
      </button>

      <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11, color: "#5a5a5a" }}>Canelada · v1.0</p>
    </div>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 8px 4px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a7a7a" }}>{children}</p>;
}

function Divider() {
  return <div style={{ height: 1, background: "#1c1c1c" }} />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0" }}>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "#7a7a7a", flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
    </div>
  );
}

function RowLink({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
      <IconBox>{icon}</IconBox>
      <Labels label={label} sub={sub} />
      <CaretRight size={16} color="#555" weight="bold" />
    </Link>
  );
}

function RowButton({ onClick, icon, label, sub, right, rightColor }: { onClick: () => void; icon: React.ReactNode; label: string; sub?: string; right: string; rightColor: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent", textAlign: "left" }}>
      <IconBox>{icon}</IconBox>
      <Labels label={label} sub={sub} />
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: rightColor }}>{right}</span>
    </button>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{children}</div>;
}

function Labels({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#fff" }}>{label}</div>
      {sub && <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>{sub}</div>}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
