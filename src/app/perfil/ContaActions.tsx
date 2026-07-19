"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserCircle, Medal, Bell, ShieldCheck, FileText, Logout2, CaretRight } from "reicon-react";
import { Toggle, IconBox, RowItem, Divider, toast, ConfirmDialog } from "@/ds";
import { excluirConta } from "./actions";

interface Props {
  email: string;
  grupoNome: string;
  roleLabel: string;
  onEditar: () => void;
}

export function ContaActions({ email, grupoNome, roleLabel, onEditar }: Props) {
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);

  async function confirmarExclusao() {
    setDeleting(true); setDelError(null);
    const res = await excluirConta();
    if (!res.ok) { setDeleting(false); setDelError(res.error ?? "Erro ao excluir."); return; }
    await signOut({ callbackUrl: "/login" });
  }

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
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      toast.error("Seu navegador não suporta notificações.");
      return;
    }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(existing.toJSON()) }).catch(() => {});
        setPushOn(false);
        toast.info("Notificações desativadas.");
        return;
      }
      if (!vapid) {
        toast.error("Notificações ainda não configuradas no servidor.");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushOn(false);
        toast.error(perm === "denied" ? "Permissão de notificação bloqueada no navegador." : "Permissão não concedida.");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      if (!res.ok) throw new Error("subscribe falhou");
      setPushOn(true);
      toast.success("Notificações ativadas com sucesso");
    } catch (e) {
      console.error("togglePush:", e);
      toast.error("Não foi possível ativar as notificações.");
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* CONTA */}
      <Group title="CONTA">
        <RowButton onClick={onEditar} icon={<UserCircle size={20} color="#9fe870" weight="Outline" />} label="Dados pessoais" sub="Nome, apelido, posição, foto" />
        <Divider />
        <InfoRow label="E-mail" value={email || "—"} />
        <Divider />
        <InfoRow label="Grupo" value={grupoNome} />
        <Divider />
        <InfoRow label="Papel" value={roleLabel} />
      </Group>

      {/* GERAL */}
      <Group title="GERAL">
        <RowLink href="/medalhas" icon={<Medal size={20} color="#9fe870" weight="Outline" />} label="Minhas Badges" sub="Personagens e conquistas" />
        <Divider />
        <RowToggle onClick={togglePush} on={pushOn} icon={<Bell size={20} color="#9fe870" weight="Outline" />} label="Notificações" sub="Avisos de votação e badges" />
      </Group>

      {/* AJUDA & LEGAL */}
      <Group title="AJUDA & LEGAL">
        <RowLink href="/termos" icon={<FileText size={20} color="#9fe870" weight="Outline" />} label="Termos de Uso" />
        <Divider />
        <RowLink href="/privacidade" icon={<ShieldCheck size={20} color="#9fe870" weight="Outline" />} label="Política de Privacidade" />
      </Group>

      {/* SAIR */}
      <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#0a0e0e", border: "1px solid #383838", borderRadius: 16, padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e56767", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Logout2 size={20} color="#1a0606" weight="Outline" />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#e56767" }}>Sair</span>
      </button>

      {/* Excluir conta */}
      <button onClick={() => { setDelError(null); setConfirmOpen(true); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "#7a7a7a", textAlign: "center", WebkitTapHighlightColor: "transparent" }}>
        Excluir conta
      </button>

      <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, color: "#5a5a5a" }}>Canelada · v1.0</p>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir conta?"
        description={<>Isso apaga <strong style={{ color: "#fff" }}>permanentemente</strong> seu perfil, votos, personagens e badges. Não dá pra desfazer.</>}
        error={delError ?? undefined}
        confirmLabel={deleting ? "Excluindo…" : "Excluir"}
        onConfirm={confirmarExclusao}
        loading={deleting}
      />
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
    <Link href={href} style={{ display: "block", textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
      <RowItem icon={<IconBox>{icon}</IconBox>} label={label} sub={sub} trailing={<CaretRight size={20} color="#555" weight="Outline" />} />
    </Link>
  );
}
function RowButton({ onClick, icon, label, sub }: { onClick: () => void; icon: React.ReactNode; label: string; sub?: string }) {
  return <RowItem icon={<IconBox>{icon}</IconBox>} label={label} sub={sub} onClick={onClick} />;
}
function RowToggle({ onClick, on, icon, label, sub }: { onClick: () => void; on: boolean; icon: React.ReactNode; label: string; sub?: string }) {
  return <RowItem icon={<IconBox>{icon}</IconBox>} label={label} sub={sub} trailing={<Toggle checked={on} onChange={() => onClick()} />} />;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
