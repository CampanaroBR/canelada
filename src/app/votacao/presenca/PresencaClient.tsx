"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronUp, ChevronDown, Plus, X, Link as LinkIcon, Edit2 } from "reicon-react";
import { Content, Avatar, Button, Select } from "@/ds";
import { toast } from "@/ds/toast";
import { salvarPresenca, vincularPendente, definirPapelGol, criarConvidado, atualizarConvidado, type ItemPresenca } from "../actions";
import { LABEL_NIVEL, type Nivel } from "@/lib/convidados";

type PapelGol = "FIXO" | "CURINGA" | null;
type Jogador = { id: string; apelido: string; papelGol?: PapelGol };
type Convidado = { id: string; nome: string; nivel: Nivel; papelGol?: PapelGol };

/** Jogador cadastrado e convidado convivem na mesma fila — o sorteio só olha
 *  a ordem. `tipo` é o que distingue na hora de salvar. */
type Pessoa = { tipo: "jogador" | "convidado"; id: string; nome: string; nivel?: Nivel };

interface Props {
  rodadaId: string;
  jogadores: Jogador[];
  convidados: Convidado[];
  presentesIniciais: ItemPresenca[];
  pendentesIniciais: string[];
  isSuperAdmin: boolean;
}

const ACCENT = "#9fe870";
const chave = (it: { tipo: string; id: string }) => `${it.tipo}:${it.id}`;

const PROXIMO_PAPEL: Record<string, PapelGol> = { "": "CURINGA", CURINGA: "FIXO", FIXO: null };
const LABEL_PAPEL: Record<string, { txt: string; cor: string; bg: string }> = {
  FIXO: { txt: "GOL", cor: "#0a1a06", bg: ACCENT },
  CURINGA: { txt: "gol?", cor: ACCENT, bg: "rgba(159,232,112,0.14)" },
};
const PROXIMO_NIVEL: Record<Nivel, Nivel> = { FRACO: "MEDIO", MEDIO: "FORTE", FORTE: "FRACO" };

/** Botãozinho de ação da linha. Alvo de toque 36px. */
function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button" aria-label={label} onClick={onClick} disabled={disabled}
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

/** Chip do papel no gol. Vazio = jogador de linha. */
function ChipGol({ papel, onClick }: { papel: PapelGol; onClick: () => void }) {
  const meta = papel ? LABEL_PAPEL[papel] : null;
  return (
    <button
      type="button" onClick={onClick}
      aria-label={papel === "FIXO" ? "Goleiro fixo" : papel === "CURINGA" ? "Pega o gol se faltar" : "Jogador de linha"}
      style={{
        minWidth: 42, height: 26, padding: "0 9px", borderRadius: 999, flexShrink: 0,
        background: meta?.bg ?? "transparent",
        boxShadow: meta ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.1)",
        color: meta?.cor ?? "#6e6e6e", border: "none", cursor: "pointer",
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10.5,
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {meta?.txt ?? "—"}
    </button>
  );
}

/** Nível do convidado — só ele tem, porque não tem OVR pra usar. */
function ChipNivel({ nivel, onClick }: { nivel: Nivel; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={`Nível: ${LABEL_NIVEL[nivel]}`}
      style={{
        height: 26, padding: "0 9px", borderRadius: 999, flexShrink: 0,
        background: "rgba(167,139,250,0.14)", color: "#A78BFA", border: "none", cursor: "pointer",
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 10.5,
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {LABEL_NIVEL[nivel].toLowerCase()}
    </button>
  );
}

export function PresencaClient({ rodadaId, jogadores, convidados: convidadosIniciais, presentesIniciais, pendentesIniciais, isSuperAdmin }: Props) {
  const router = useRouter();
  // ARRAY, não Set: a ordem É a ordem de chegada e alimenta o sorteio.
  const [presentes, setPresentes] = useState<ItemPresenca[]>(presentesIniciais);
  const [convidados, setConvidados] = useState<Convidado[]>(convidadosIniciais);
  const [papeis, setPapeis] = useState<Record<string, PapelGol>>(() => ({
    ...Object.fromEntries(jogadores.map((j) => [chave({ tipo: "jogador", id: j.id }), j.papelGol ?? null])),
    ...Object.fromEntries(convidadosIniciais.map((c) => [chave({ tipo: "convidado", id: c.id }), c.papelGol ?? null])),
  }));
  const [pendentes, setPendentes] = useState(pendentesIniciais);
  const [saving, setSaving] = useState(false);
  const [vinculando, setVinculando] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<Record<string, string>>({});
  const [novoConvidado, setNovoConvidado] = useState("");
  const [criando, setCriando] = useState(false);

  const pessoas = new Map<string, Pessoa>([
    ...jogadores.map((j) => [chave({ tipo: "jogador", id: j.id }), { tipo: "jogador" as const, id: j.id, nome: j.apelido }] as const),
    ...convidados.map((c) => [chave({ tipo: "convidado", id: c.id }), { tipo: "convidado" as const, id: c.id, nome: c.nome, nivel: c.nivel }] as const),
  ]);

  const naLista = presentes.map((it) => pessoas.get(chave(it))).filter((p): p is Pessoa => !!p);
  const presentesKeys = new Set(presentes.map(chave));
  const foraDaLista = [...pessoas.values()].filter((p) => !presentesKeys.has(chave(p)));

  /** Chegou agora → entra no FIM da fila. */
  function marcarChegada(p: { tipo: "jogador" | "convidado"; id: string }) {
    setPresentes((prev) => (prev.some((x) => chave(x) === chave(p)) ? prev : [...prev, { tipo: p.tipo, id: p.id }]));
  }
  function removerChegada(p: Pessoa) {
    setPresentes((prev) => prev.filter((x) => chave(x) !== chave(p)));
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

  async function ciclarPapel(p: Pessoa) {
    const k = chave(p);
    const atual = papeis[k] ?? null;
    const novo = PROXIMO_PAPEL[atual ?? ""];
    setPapeis((s) => ({ ...s, [k]: novo })); // otimista
    const res = p.tipo === "jogador"
      ? await definirPapelGol(p.id, novo)
      : await atualizarConvidado(p.id, { papelGol: novo });
    if ("error" in res) {
      setPapeis((s) => ({ ...s, [k]: atual }));
      toast.error(res.error ?? "Erro ao salvar.");
    }
  }

  async function ciclarNivel(c: Pessoa) {
    const atual = (c.nivel ?? "MEDIO") as Nivel;
    const novo = PROXIMO_NIVEL[atual];
    setConvidados((prev) => prev.map((x) => (x.id === c.id ? { ...x, nivel: novo } : x)));
    const res = await atualizarConvidado(c.id, { nivel: novo });
    if ("error" in res) {
      setConvidados((prev) => prev.map((x) => (x.id === c.id ? { ...x, nivel: atual } : x)));
      toast.error(res.error ?? "Erro ao salvar.");
    }
  }

  async function adicionarConvidado() {
    const nome = novoConvidado.trim();
    if (!nome || criando) return;
    setCriando(true);
    const res = await criarConvidado(nome);
    setCriando(false);
    if ("error" in res) { toast.error(res.error ?? "Erro ao adicionar."); return; }
    const c = res.convidado;
    setConvidados((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, { id: c.id, nome: c.nome, nivel: c.nivel as Nivel, papelGol: c.papelGol as PapelGol }]));
    setPapeis((s) => ({ ...s, [chave({ tipo: "convidado", id: c.id })]: (c.papelGol as PapelGol) ?? null }));
    marcarChegada({ tipo: "convidado", id: c.id });
    setNovoConvidado("");
    toast.success(`${c.nome} adicionado`);
  }

  async function vincular(nome: string) {
    const jogadorId = escolha[nome];
    if (!jogadorId) return;
    setVinculando(nome);
    const res = await vincularPendente(rodadaId, nome, jogadorId);
    setVinculando(null);
    if ("error" in res) { toast.error(res.error ?? "Erro ao vincular."); return; }
    setPendentes((prev) => prev.filter((n) => n !== nome));
    marcarChegada({ tipo: "jogador", id: jogadorId });
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
          <Link href="/votacao/admin" aria-label="Editar votos" style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#9a9a9a" }}>
            <Edit2 size={18} weight="Outline" />
          </Link>
        )}
      </header>

      <main style={{ flex: 1, padding: "8px 16px 0" }}>
        {pendentes.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
                PENDENTES ({pendentes.length})
              </span>
            </div>
            <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
              {pendentes.map((nome, i) => (
                <div key={nome} style={{ padding: "12px 14px", borderTop: i === 0 ? "none" : "1px solid #1f1f1f" }}>
                  <p style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff" }}>{nome}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        value={escolha[nome] ?? ""}
                        onChange={(v) => setEscolha((p) => ({ ...p, [nome]: v }))}
                        options={opcoesJogadores}
                        placeholder="Escolher jogador"
                      />
                    </div>
                    <Button
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

        {/* ── QUEM CHEGOU (na ordem) ── */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
            CHEGARAM ({naLista.length})
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "#6e6e6e" }}>na ordem de chegada</span>
        </div>

        {naLista.length === 0 ? (
          <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13.5, color: "#7a7a7a" }}>
              Ninguém marcado ainda. Toque em <strong style={{ color: "#bdbdbd" }}>+</strong> na lista de baixo conforme o pessoal for chegando.
            </p>
          </div>
        ) : (
          <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
            {naLista.map((p, i) => (
              <div key={chave(p)} style={{ padding: "10px 12px", borderTop: i === 0 ? "none" : "1px solid #1f1f1f", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                  background: "rgba(255,255,255,0.06)", color: "#cfcfcf",
                  fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 11,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</span>

                <Avatar name={p.nome} />
                <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.nome}
                </span>

                {p.tipo === "convidado" && <ChipNivel nivel={(p.nivel ?? "MEDIO") as Nivel} onClick={() => ciclarNivel(p)} />}
                <ChipGol papel={papeis[chave(p)] ?? null} onClick={() => ciclarPapel(p)} />

                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <IconBtn label="Subir" onClick={() => mover(i, -1)} disabled={i === 0}>
                    <ChevronUp size={16} weight="Outline" color="#bdbdbd" />
                  </IconBtn>
                  <IconBtn label="Descer" onClick={() => mover(i, 1)} disabled={i === naLista.length - 1}>
                    <ChevronDown size={16} weight="Outline" color="#bdbdbd" />
                  </IconBtn>
                  <IconBtn label={`Tirar ${p.nome}`} onClick={() => removerChegada(p)}>
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
              {foraDaLista.map((p, i) => (
                <div key={chave(p)} style={{ padding: "12px 14px", borderTop: i === 0 ? "none" : "1px solid #1f1f1f" }}>
                  <Content
                    leading={<Avatar name={p.nome} />}
                    label={p.nome}
                    trailing={
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {p.tipo === "convidado" && <ChipNivel nivel={(p.nivel ?? "MEDIO") as Nivel} onClick={() => ciclarNivel(p)} />}
                        <ChipGol papel={papeis[chave(p)] ?? null} onClick={() => ciclarPapel(p)} />
                        <IconBtn label={`Marcar chegada de ${p.nome}`} onClick={() => marcarChegada(p)}>
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

        {/* ── CONVIDADO NOVO ──
            Quem joga mas não tem conta. Fica salvo no grupo: na próxima rodada
            é só marcar a chegada. Não vota nem é votado. */}
        <div style={{ margin: "20px 0 8px" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
            CONVIDADO
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={novoConvidado}
            onChange={(e) => setNovoConvidado(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") adicionarConvidado(); }}
            placeholder="Nome de quem não tem app"
            style={{
              flex: 1, minWidth: 0, height: 48, padding: "0 14px", borderRadius: 14,
              background: "#141414", border: "1px solid #2c2c2c", color: "#fff",
              fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
            }}
          />
          <Button onClick={adicionarConvidado} loading={criando} disabled={novoConvidado.trim().length < 2}>
            Adicionar
          </Button>
        </div>
        <p style={{ margin: "10px 2px 0", fontFamily: "var(--font-body)", fontSize: 11.5, lineHeight: 1.5, color: "#6e6e6e" }}>
          Convidado entra só no sorteio — não vota, não é votado e não conta no ranking.
          A nota dele é a média do grupo ajustada pelo nível (<strong style={{ color: "#A78BFA" }}>fraco/médio/forte</strong>).
          No gol: <strong style={{ color: ACCENT }}>GOL</strong> = goleiro fixo ·{" "}
          <strong style={{ color: ACCENT }}>gol?</strong> = quebra galho.
        </p>

        <div style={{ height: 96 }} />
      </main>

      <div style={{
        position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0,
        width: "min(100%, 430px)", padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
        background: "linear-gradient(180deg, rgba(9,9,9,0) 0%, #090909 40%)",
      }}>
        <Button onClick={salvar} loading={saving} fullWidth>
          Salvar ({presentes.length} {presentes.length === 1 ? "presente" : "presentes"})
        </Button>
      </div>
    </div>
  );
}
