"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserCircle, Medal, Bell, ShieldCheck, FileText, SignOut, CaretRight } from "@phosphor-icons/react";

interface Props {
  email: string;
  grupoNome: string;
  roleLabel: string;
  onEditar: () => void;
}

export function ContaActions({ email, grupoNome, roleLabel, onEditar }: Props) {
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setPushOn(!!sub);
      } catch { /* ignore */ }
    })();
  }, []);

  async function togglePush() {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const reg = await navigator.serviceWorker.register("/sw.js");
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        setPushOn(false);
      } else {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") { setPushOn(false); return; }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as unknown as BufferSource,
        });
        await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
        setPushOn(true);
      }
    } catch { /* ignore */ } finally { setPushBusy(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* CONTA */}
      <Group title="CONTA">
        <RowButton onClick={onEditar} icon={<UserCircle size={20} color="#9fe870" weight="fill" />} label="Dados pessoais" sub="Nome, apelido, posição, foto" />
        <Divider />
        <InfoRow label="E-mail" value={email || "—"} />
        <Divider />
        <InfoRow label="Grupo" value={grupoNome} />
        <Divider />
        <InfoRow label="Papel" value={roleLabel} />
      </Group>

      {/* GERAL */}
      <Group title="GERAL">
        <RowLink href="/medalhas" icon={<Medal size={20} color="#9fe870" weight="fill" />} label="Minhas Badges" sub="Personagens e conquistas" />
        <Divider />
        <RowToggle onClick={togglePush} on={pushOn} icon={<Bell size={20} color="#fff" weight="regular" />} label="Notificações" sub="Avisos de votação e badges" />
      </Group>

      {/* AJUDA & LEGAL */}
      <Group title="AJUDA & LEGAL">
        <RowLink href="/termos" icon={<FileText size={20} color="#fff" weight="regular" />} label="Termos de Uso" />
        <Divider />
        <RowLink href="/privacidade" icon={<ShieldCheck size={20} color="#fff" weight="regular" />} label="Política de Privacidade" />
      </Group>

      {/* SAIR */}
      <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#0a0e0e", border: "1px solid #383838", borderRadius: 16, padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e56767", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <SignOut size={20} color="#1a0606" weight="bold" />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#e56767" }}>Sair</span>
      </button>

      <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, color: "#5a5a5a" }}>Canelada · v1.0</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: "0 0 0 2px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: "0.04em", color: "#999" }}>{title}</p>
      <div style={{ background: "#0a0e0e", border: "1px solid #383838", borderRadius: 16, overflow: "hidden" }}>{children}</div>
    </div>
  );
}
function Divider() { return <div style={{ height: 1, background: "#1c1c1c" }} />; }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px" }}>
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
function RowButton({ onClick, icon, label, sub }: { onClick: () => void; icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent", textAlign: "left" }}>
      <IconBox>{icon}</IconBox>
      <Labels label={label} sub={sub} />
      <CaretRight size={16} color="#555" weight="bold" />
    </button>
  );
}
function RowToggle({ onClick, on, icon, label, sub }: { onClick: () => void; on: boolean; icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "none", border: "none", padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent", textAlign: "left" }}>
      <IconBox>{icon}</IconBox>
      <Labels label={label} sub={sub} />
      <span style={{ position: "relative", width: 40, height: 22, borderRadius: 9999, background: on ? "#9fe870" : "#3a3a3a", flexShrink: 0, transition: "background 160ms" }}>
        <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 160ms" }} />
      </span>
    </button>
  );
}
function IconBox({ children }: { children: React.ReactNode }) {
  return <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1c1c1c", border: "1px solid #383838", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{children}</div>;
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
