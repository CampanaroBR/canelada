"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, UsersThree, UserPlus, Export, CaretRight, PencilSimple, ShieldStar, UserMinus, Warning } from "@phosphor-icons/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MenuSheet } from "@/components/MenuSheet";
import { HamburgerIcon } from "@/components/HamburgerIcon";
import { BottomSheet } from "@/components/BottomSheet";
import { renomearGrupo, removerMembro, regenerarConvite } from "./actions";
import { toast } from "@/ds/toast";
import { Button, Input } from "@/ds";

export interface Membro {
  apelido: string;
  nome: string;
  posAbbr: string;
  foto: string;
  roleLabel: string;
  isAdmin: boolean;
  removivel: boolean;
}

interface Props {
  nome: string;
  totalMembros: number;
  totalRodadas: number;
  membros: Membro[];
  isAdmin: boolean;
  inviteCode: string;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return (p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2)).toUpperCase();
}

export function GrupoClient({ nome, totalMembros, totalRodadas, membros, isAdmin, inviteCode }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [novoNome, setNovoNome] = useState(nome);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeAlvo, setRemoveAlvo] = useState<Membro | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [removeErro, setRemoveErro] = useState<string | null>(null);

  async function confirmarRemocao() {
    if (!removeAlvo) return;
    setRemovendo(true); setRemoveErro(null);
    const res = await removerMembro(removeAlvo.apelido);
    setRemovendo(false);
    if (!res.ok) { setRemoveErro(res.error ?? "Erro ao remover."); toast.error(res.error ?? "Erro ao remover."); return; }
    const nome = removeAlvo.apelido;
    setRemoveAlvo(null);
    router.refresh();
    toast.success(`${nome} removido do grupo com sucesso`);
  }

  async function convidar() {
    // Link com o código: só quem abrir por ele consegue completar o cadastro
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/login?convite=${inviteCode}`
      : "";
    const text = `Bora pro baba! ⚽ Entra no nosso grupo "${nome}" no Canelada:`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Canelada", text, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Convite copiado com sucesso");
      }
    } catch { /* cancelou */ }
  }

  async function novoConvite() {
    if (!confirm("Gerar novo link? O link antigo para de funcionar na hora.")) return;
    const res = await regenerarConvite();
    if (!res.ok) { toast.error(res.error ?? "Erro ao gerar convite."); return; }
    router.refresh();
    toast.success("Novo link de convite gerado com sucesso");
  }

  async function salvarNome() {
    setSaving(true); setError(null);
    const res = await renomearGrupo(novoNome);
    setSaving(false);
    if (!res.ok) { setError(res.error ?? "Erro ao salvar."); toast.error(res.error ?? "Erro ao salvar."); return; }
    setEditOpen(false);
    router.refresh();
    toast.success("Nome do grupo atualizado com sucesso");
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>
      {/* ── TOPBAR ── */}
      <div className="glass-bar" style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30, paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <HamburgerIcon open={menuOpen} />
          </button>
          <div style={{ padding: 4, display: "flex", overflow: "clip" }}>
            <Image alt="Canelada" src="/logo.png" width={48} height={48} priority style={{ objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <button aria-label="Notificações" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <Bell size={24} color="#fff" weight="bold" />
          </button>
        </div>
      </div>

      {/* ── HEADER PANEL ── */}
      <div style={{
        background: "#0a0e0e", border: "1px solid #2c2c2c",
        borderRadius: "0 0 40px 40px",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)",
        paddingBottom: 20, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 4 }}>
          <div style={{ background: "#171717", border: "1px solid #2c2c2c", borderRadius: 14, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UsersThree size={26} color="#9fe870" weight="regular" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textTransform: "uppercase" }}>{nome}</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#999" }}>
              {totalMembros} {totalMembros === 1 ? "jogador" : "jogadores"} · {totalRodadas} {totalRodadas === 1 ? "rodada" : "rodadas"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <main style={{ padding: "16px 8px 0", display: "flex", flexDirection: "column", gap: 16, paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))" }}>

        {/* Convidar */}
        <button onClick={convidar} style={{
          display: "flex", alignItems: "center", gap: 12, width: "100%",
          background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, padding: "14px 16px",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#9fe870", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UserPlus size={20} color="#0a1a06" weight="bold" />
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#fff" }}>Convidar galera</div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>Compartilhe o link do baba</div>
          </div>
          <Export size={20} color="#9fe870" weight="bold" />
        </button>

        {/* Gerar novo link (admin) — invalida o link antigo na hora */}
        {isAdmin && (
          <button onClick={novoConvite} style={{
            marginTop: -8, alignSelf: "flex-start",
            background: "none", border: "none", cursor: "pointer", padding: "0 6px",
            fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12.5, color: "#7a7a7a",
            textDecoration: "underline", textUnderlineOffset: 3,
            WebkitTapHighlightColor: "transparent",
          }}>
            Gerar novo link (invalida o anterior)
          </button>
        )}

        {/* Membros */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: "0 0 0 2px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: "0.04em", color: "#999" }}>MEMBROS</p>
          <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
            {membros.map((m, i) => (
              <div key={m.apelido + i} style={{ display: "flex", alignItems: "center", borderTop: i === 0 ? "none" : "1px solid #1c1c1c" }}>
                <Link href={`/perfil/${encodeURIComponent(m.apelido)}`} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, padding: "12px 0 12px 14px", textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: "#171717", border: "1px solid #2c2c2c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {m.foto
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#9fe870" }}>{initials(m.nome)}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.apelido}</span>
                      {m.isAdmin && <ShieldStar size={15} color="#9fe870" weight="fill" style={{ flexShrink: 0 }} />}
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>
                      {[m.posAbbr, m.roleLabel].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </Link>
                {m.removivel ? (
                  <button onClick={() => { setRemoveErro(null); setRemoveAlvo(m); }} aria-label={`Remover ${m.apelido}`} style={{ flexShrink: 0, width: 44, height: 44, margin: "0 6px", borderRadius: 12, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
                    <UserMinus size={18} color="#e56767" weight="bold" />
                  </button>
                ) : (
                  <div style={{ flexShrink: 0, width: 30, display: "flex", justifyContent: "center" }}>
                    <CaretRight size={16} color="#555" weight="bold" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Admin: editar nome */}
        {isAdmin && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ margin: "0 0 0 2px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: "0.04em", color: "#999" }}>ADMIN</p>
            <button onClick={() => { setNovoNome(nome); setError(null); setEditOpen(true); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1c1c1c", border: "1px solid #2c2c2c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PencilSimple size={20} color="#9fe870" weight="regular" />
              </div>
              <span style={{ flex: 1, textAlign: "left", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#fff" }}>Editar nome do grupo</span>
              <CaretRight size={16} color="#555" weight="bold" />
            </button>
          </div>
        )}
      </main>

      {/* Editar nome (admin) */}
      <BottomSheet open={editOpen} onClose={() => !saving && setEditOpen(false)}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, textTransform: "uppercase", color: "#fff" }}>Nome do grupo</span>
          <Input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            maxLength={40}
            placeholder="Nome do grupo"
            error={error ?? undefined}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
            <Button fullWidth size="lg" onClick={salvarNome} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
            <Button fullWidth size="lg" variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>Cancelar</Button>
          </div>
        </div>
      </BottomSheet>

      {/* Confirmar remoção de membro */}
      <BottomSheet open={!!removeAlvo} onClose={() => !removendo && setRemoveAlvo(null)}>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#2a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Warning size={28} color="#e56767" weight="fill" />
          </div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Remover {removeAlvo?.apelido}?</h2>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#7a7a7a", maxWidth: 320 }}>
            Tira <strong style={{ color: "#fff" }}>{removeAlvo?.apelido}</strong> do grupo e apaga votos, personagens e badges desse jogador. Não dá pra desfazer.
          </p>
          {removeErro && <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#e56767" }}>{removeErro}</p>}
          <div style={{ display: "flex", gap: 8, width: "100%", paddingTop: 8 }}>
            <Button style={{ flex: 1 }} variant="secondary" onClick={() => setRemoveAlvo(null)} disabled={removendo}>Cancelar</Button>
            <Button style={{ flex: 1 }} variant="danger" onClick={confirmarRemocao} disabled={removendo}>{removendo ? "Removendo…" : "Remover"}</Button>
          </div>
        </div>
      </BottomSheet>

      <BottomNav />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
