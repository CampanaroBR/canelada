"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronUp, ChevronDown, Plus, X, Link as LinkIcon, Edit2 } from "reicon-react";
import { Content, Avatar, Button, Select } from "@/ds";
import { toast } from "@/ds/toast";
import { salvarPresenca, vincularPendente, definirPapelGol } from "../actions";

type PapelGol = "FIXO" | "CURINGA" | null;
type Jogador = { id: string; apelido: string; papelGol?: PapelGol };

interface Props {
  rodadaId: string;
  jogadores: Jogador[];
  presentesIniciais: string[];
  pendentesIniciais: string[];
  isSuperAdmin: boolean;
}

const ACCENT = "#9fe870";

/** Chip do gol. Cicla: linha → curinga → fixo → linha. */
const PROXIMO_PAPEL: Record<string, PapelGol> = { "": "CURINGA", CURINGA: "FIXO", FIXO: null };
const LABEL_PAPEL: Record<string, { txt: string; cor: string; bg: string }> = {
  FIXO: { txt: "GOL", cor: "#0a1a06", bg: ACCENT },
  CURINGA: { txt: "gol?", cor: ACCENT, bg: "rgba(159,232,112,0.14)" },
};

/** Botãozinho de ação da linha (subir/descer/tirar/adicionar). Alvo de toque 36px. */
function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: "rgba(255,255,255,0.04)", border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.3 : 1,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}

/** Chip do papel no gol. Vazio = jogador de linha (nada aparece além do contorno). */
function ChipGol({ papel, onClick }: { papel: PapelGol; onClick: () => void }) {
  const meta = papel ? LABEL_PAPEL[papel] : null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={papel === "FIXO" ? "Goleiro fixo" : papel === "CURINGA" ? "Pega o gol se faltar" : "Jogador de linha"}
      style={{
        minWidth: 42, height: 26, padding: "0 9px", borderRadius: 999, flexShrink: 0,
        background: meta?.bg ?? "transparent",
        boxShadow: meta ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.1)",
        color: meta?.cor ?? "#6e6e6e",
        border: "none", cursor: "pointer",
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10.5, letterSpacing: "0.3px",
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {meta?.txt ?? "—"}
    </button>
  );
}

export function PresencaClient({ rodadaId, jogadores, presentesIniciais, pendentesIniciais, isSuperAdmin }: Props) {
  const router = useRouter();
  // ARRAY, não Set: a ordem É a ordem de chegada e alimenta o sorteio.
  const [presentes, setPresentes] = useState<string[]>(presentesIniciais);
  const [papeis, setPapeis] = useState<Record<string, PapelGol>>(
    () => Object.fromEntries(jogadores.map((j) => [j.id, j.papelGol ?? null]))
  );
  const [pendentes, setPendentes] = useState(pendentesIniciais);
  const [saving, setSaving] = useState(false);
  const [vinculando, setVinculando] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<Record<string, string>>({});

  const porId = new Map(jogadores.map((j) => [j.id, j]));
  const naLista = presentes.map((id) => porId.get(id)).filter((j): j is Jogador => !!j);
  const foraDaLista = jogadores.filter((j) => !presentes.includes(j.id));

  /** Chegou agora → entra no FIM da fila. */
  function marcarChegada(id: string) {
    setPresentes((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }
  function removerChegada(id: string) {
    setPresentes((prev) => prev.filter((x) => x !== id));
  }
  /** Admin corrige quem marcou fora de ordem. */
  function mover(i: number, dir: -1 | 1) {
    setPresentes((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function ciclarPapel(id: string) {
    const atual = papeis[id] ?? null;
    const novo = PROXIMO_PAPEL[atual ?? ""];
    setPapeis((p) => ({ ...p, [id]: novo })); // otimista
    const res = await definirPapelGol(id, novo);
    if ("error" in res) {
      setPapeis((p) => ({ ...p, [id]: atual })); // desfaz
      toast.error(res.error ?? "Erro ao salvar.");
    }
  }

  async function vincular(nome: string) {
    const jogadorId = escolha[nome];
    if (!jogadorId) return;
    setVinculando(nome);
    const res = await vincularPendente(rodadaId, nome, jogadorId);
    setVinculando(null);
    if ("error" in res) { toast.error(res.error ?? "Erro ao vincular."); return; }
    setPendentes((prev) => prev.filter((n) => n !== nome));
    marcarChegada(jogadorId);
    toast.success(`${nome} vinculado`);
  }

  async function salvar() {
    setSaving(true);
    const res = await salvarPresenca(rodadaId, presentes);
    setSaving(false);
    if ("error" in res) { toast.error(res.error ?? "Erro ao salvar."); return; }
    toast.success("Lista de presença atualizada");
    router.push("/votacao");
  }

  const opcoesJogadores = jogadores.map((j) => ({ value: j.id, label: j.apelido }));

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 8px", gap: 8 }}>
        <Link href="/votacao" aria-label="Voltar" style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <ChevronLeft size={20} weight="Outline" />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", flex: 1 }}>
          Quem jogou hoje?
        </span>
        {isSuperAdmin && (
          <Link href="/votacao/admin" aria-label="Editar votos" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#9fe870" }}>
            <Edit2 size={20} weight="Outline" />
          </Link>
        )}
      </header>

      <p style={{
        margin: 0, padding: "8px 20px 0",
        fontFamily: "var(--font-body)", fontSize: 13, color: "#8a8a8a",
      }}>
        Desmarque quem se cadastrou no app mas não estava no baba. Se ninguém for marcado, todo o grupo fica disponível pra votação.
      </p>

      <main style={{ flex: 1, padding: "16px 8px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {pendentes.length > 0 && (
          <div>
            <p style={{ margin: "0 0 8px 6px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#7a7a7a", textTransform: "uppercase" }}>
              Sem conta ainda · vincular
            </p>
            <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
              {pendentes.map((nome, i) => (
                <div key={nome} style={{ padding: "12px 14px", borderTop: i === 0 ? "none" : "1px solid #1f1f1f", display: "flex", flexDirection: "column", gap: 8 }}>
                  <Content leading={<Avatar name={nome} />} label={nome} description="não tinha conta na criação da rodada" />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        options={opcoesJogadores}
                        value={escolha[nome] ?? ""}
                        onChange={(v) => setEscolha((prev) => ({ ...prev, [nome]: v }))}
                        placeholder="Escolher conta…"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => vincular(nome)}
                      loading={vinculando === nome}
                      disabled={!escolha[nome]}
                      leftIcon={<LinkIcon size={16} weight="Outline" />}
                    >
                      Vincular
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUEM CHEGOU (na ordem) ──
            A ordem desta lista É a ordem de chegada: alimenta o sorteio, que
            escala os primeiros e manda o resto pra fila. */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
            CHEGARAM ({naLista.length})
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "#6e6e6e" }}>
            na ordem de chegada
          </span>
        </div>

        {naLista.length === 0 ? (
          <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13.5, color: "#7a7a7a" }}>
              Ninguém marcado ainda. Toque em <strong style={{ color: "#bdbdbd" }}>+</strong> na lista de baixo conforme o pessoal for chegando.
            </p>
          </div>
        ) : (
          <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
            {naLista.map((j, i) => (
              <div key={j.id} style={{ padding: "10px 12px", borderTop: i === 0 ? "none" : "1px solid #1f1f1f", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                  background: "rgba(255,255,255,0.06)", color: "#cfcfcf",
                  fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 11,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</span>

                <Avatar name={j.apelido} />
                <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {j.apelido}
                </span>

                <ChipGol papel={papeis[j.id] ?? null} onClick={() => ciclarPapel(j.id)} />

                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <IconBtn label="Subir" onClick={() => mover(i, -1)} disabled={i === 0}>
                    <ChevronUp size={16} weight="Outline" color="#bdbdbd" />
                  </IconBtn>
                  <IconBtn label="Descer" onClick={() => mover(i, 1)} disabled={i === naLista.length - 1}>
                    <ChevronDown size={16} weight="Outline" color="#bdbdbd" />
                  </IconBtn>
                  <IconBtn label={`Tirar ${j.apelido}`} onClick={() => removerChegada(j.id)}>
                    <X size={16} weight="Outline" color="#e56767" />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── AINDA NÃO CHEGARAM ── */}
        {foraDaLista.length > 0 && (
          <>
            <div style={{ margin: "20px 0 8px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
                AINDA NÃO CHEGARAM ({foraDaLista.length})
              </span>
            </div>
            <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
              {foraDaLista.map((j, i) => (
                <div key={j.id} style={{ padding: "12px 14px", borderTop: i === 0 ? "none" : "1px solid #1f1f1f" }}>
                  <Content
                    leading={<Avatar name={j.apelido} />}
                    label={j.apelido}
                    trailing={
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ChipGol papel={papeis[j.id] ?? null} onClick={() => ciclarPapel(j.id)} />
                        <IconBtn label={`Marcar chegada de ${j.apelido}`} onClick={() => marcarChegada(j.id)}>
                          <Plus size={18} weight="Outline" color={ACCENT} />
                        </IconBtn>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <p style={{ margin: "14px 2px 0", fontFamily: "var(--font-body)", fontSize: 11.5, lineHeight: 1.5, color: "#6e6e6e" }}>
          Toque no chip pra definir quem pega o gol: <strong style={{ color: ACCENT }}>GOL</strong> = goleiro fixo ·{" "}
          <strong style={{ color: ACCENT }}>gol?</strong> = joga na linha mas quebra galho. Vale pra todas as rodadas.
        </p>

        <div style={{ height: 96 }} />
      </main>

      <div style={{
        position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0,
        width: "min(100%, 430px)", padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
        background: "linear-gradient(180deg, rgba(9,9,9,0) 0%, #090909 40%)",
      }}>
        <Button onClick={salvar} loading={saving} fullWidth>
          Salvar ({presentes.length} de {jogadores.length})
        </Button>
      </div>
    </div>
  );
}
