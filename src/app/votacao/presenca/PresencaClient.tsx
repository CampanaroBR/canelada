"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronUp, ChevronDown, Plus, X, Link as LinkIcon, Edit2 } from "reicon-react";
import { Avatar, Button, Select } from "@/ds";
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
/** Mínimo pra fechar 2 times na formação padrão (1 goleiro + 4 linha). */
const MIN_SORTEIO = 10;

const PROXIMO_PAPEL: Record<string, PapelGol> = { "": "CURINGA", CURINGA: "FIXO", FIXO: null };
const LABEL_PAPEL: Record<string, { txt: string; cor: string; bg: string }> = {
  FIXO: { txt: "GOL", cor: "#0a1a06", bg: ACCENT },
  CURINGA: { txt: "gol?", cor: ACCENT, bg: "rgba(159,232,112,0.14)" },
};
const PROXIMO_NIVEL: Record<Nivel, Nivel> = { FRACO: "MEDIO", MEDIO: "FORTE", FORTE: "FRACO" };

/** Metade do controle de reordenar (↑ / ↓). Sem fundo próprio: o fundo é do
 *  bloco que agrupa os dois, pra lerem como UM controle e não duas ilhas. */
function SetaBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button" aria-label={label} onClick={onClick} disabled={disabled}
      style={{
        width: 34, height: 34, border: "none", background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.25 : 1,
        transition: "opacity 200ms cubic-bezier(0.32,0.72,0,1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}

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
  // Busca: o grupo tem 30+ nomes e a lista de "ainda não chegaram" passava de
  // 20. Sem filtro, marcar quem chegou virava rolagem procurando nome — que é
  // exatamente o momento em que o admin está com pressa, no campo.
  const [busca, setBusca] = useState("");

  const pessoas = new Map<string, Pessoa>([
    ...jogadores.map((j) => [chave({ tipo: "jogador", id: j.id }), { tipo: "jogador" as const, id: j.id, nome: j.apelido }] as const),
    ...convidados.map((c) => [chave({ tipo: "convidado", id: c.id }), { tipo: "convidado" as const, id: c.id, nome: c.nome, nivel: c.nivel }] as const),
  ]);

  const naLista = presentes.map((it) => pessoas.get(chave(it))).filter((p): p is Pessoa => !!p);
  const presentesKeys = new Set(presentes.map(chave));
  const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const alvo = norm(busca.trim());
  const foraDaLista = [...pessoas.values()]
    .filter((p) => !presentesKeys.has(chave(p)))
    .filter((p) => !alvo || norm(p.nome).includes(alvo));

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

        {/* ── PROGRESSO ──
            Conecta esta tela com a próxima: o admin marca presença PRA sortear,
            então o número que importa é quanto falta pra fechar os times. */}
        <div style={{
          padding: "14px 16px", borderRadius: 20, marginBottom: 14,
          background: "rgba(255,255,255,0.03)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, letterSpacing: "1.6px", color: "#7a7a7a" }}>
              CHEGARAM
            </span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 26, lineHeight: 1, color: ACCENT, fontVariantNumeric: "tabular-nums" }}>
                {naLista.length}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "#6e6e6e" }}>
                / {MIN_SORTEIO}
              </span>
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(100, (naLista.length / MIN_SORTEIO) * 100)}%`,
              background: ACCENT, borderRadius: 999,
              transition: "width 420ms cubic-bezier(0.32,0.72,0,1)",
            }} />
          </div>
          <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontSize: 11.5, color: "#6e6e6e" }}>
            {naLista.length >= MIN_SORTEIO
              ? "Dá pra sortear 2 times · a ordem abaixo é a de chegada"
              : `Faltam ${MIN_SORTEIO - naLista.length} pra fechar 2 times`}
          </p>
        </div>

        {naLista.length === 0 ? (
          <div style={{
            padding: "22px 18px", borderRadius: 20, textAlign: "center",
            background: "rgba(255,255,255,0.025)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5, color: "#7a7a7a" }}>
              Ninguém marcado ainda. Toque em <strong style={{ color: ACCENT }}>+</strong> na lista de baixo conforme o pessoal for chegando.
            </p>
          </div>
        ) : (
          /* Double-bezel: casca + núcleo com raios concêntricos (26 → 21) */
          <div style={{
            padding: 5, borderRadius: 26,
            background: "rgba(255,255,255,0.035)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
          }}>
            <div style={{
              borderRadius: 21, overflow: "hidden",
              background: "linear-gradient(180deg, #161616 0%, #101010 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
              {naLista.map((p, i) => (
                <div key={chave(p)} style={{
                  padding: "10px 10px 10px 14px",
                  borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  {/* Ordinal: número em tabular, sem caixinha — a caixa cinza
                      competia com o avatar e engordava a linha. */}
                  <span style={{
                    width: 18, flexShrink: 0, textAlign: "center",
                    fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 13,
                    color: i < MIN_SORTEIO ? "#8a8a8a" : "#4e4e4e",
                    fontVariantNumeric: "tabular-nums",
                  }}>{i + 1}</span>

                  <Avatar name={p.nome} />
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.nome}
                  </span>

                  {p.tipo === "convidado" && <ChipNivel nivel={(p.nivel ?? "MEDIO") as Nivel} onClick={() => ciclarNivel(p)} />}
                  <ChipGol papel={papeis[chave(p)] ?? null} onClick={() => ciclarPapel(p)} />

                  {/* ↑↓ agrupados num só bloco: eram 3 ilhas de 36px comendo
                      108px da linha. Agora leem como um controle só. */}
                  <div style={{
                    display: "flex", flexShrink: 0, borderRadius: 11, overflow: "hidden",
                    background: "rgba(255,255,255,0.05)",
                  }}>
                    <SetaBtn label="Subir" onClick={() => mover(i, -1)} disabled={i === 0}>
                      <ChevronUp size={15} weight="Outline" color="#bdbdbd" />
                    </SetaBtn>
                    <span aria-hidden style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
                    <SetaBtn label="Descer" onClick={() => mover(i, 1)} disabled={i === naLista.length - 1}>
                      <ChevronDown size={15} weight="Outline" color="#bdbdbd" />
                    </SetaBtn>
                  </div>
                  <IconBtn label={`Tirar ${p.nome}`} onClick={() => removerChegada(p)}>
                    <X size={15} weight="Outline" color="#e56767" />
                  </IconBtn>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AINDA NÃO CHEGARAM ── */}
        {foraDaLista.length > 0 && (
          <>
            <div style={{ margin: "20px 0 10px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "1.4px", color: "#9a9a9a" }}>
                AINDA NÃO CHEGARAM ({foraDaLista.length})
              </span>
            </div>
            {/* Busca: com 30+ no grupo, achar quem chegou era rolagem pura —
                justo no momento em que o admin está com pressa, no campo. */}
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nome…"
              style={{
                width: "100%", height: 44, padding: "0 14px", marginBottom: 10,
                borderRadius: 14, background: "rgba(255,255,255,0.04)",
                border: "none", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
                boxSizing: "border-box",
              }}
            />
            {foraDaLista.length === 0 ? (
              <p style={{ margin: 0, padding: "18px 4px", fontFamily: "var(--font-body)", fontSize: 13, color: "#6e6e6e", textAlign: "center" }}>
                Nenhum nome com “{busca}”.
              </p>
            ) : (
              <div style={{
                borderRadius: 20, overflow: "hidden",
                background: "rgba(255,255,255,0.025)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}>
                {foraDaLista.map((p, i) => (
                  <div key={chave(p)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 10px 10px 14px",
                    borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <Avatar name={p.nome} />
                    <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "#c8c8c8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.nome}
                    </span>
                    {p.tipo === "convidado" && <ChipNivel nivel={(p.nivel ?? "MEDIO") as Nivel} onClick={() => ciclarNivel(p)} />}
                    <ChipGol papel={papeis[chave(p)] ?? null} onClick={() => ciclarPapel(p)} />
                    {/* CTA da linha: cheio, porque marcar chegada é a ação
                        principal desta lista — não pode ter o mesmo peso do ✕. */}
                    <button
                      type="button"
                      onClick={() => marcarChegada(p)}
                      aria-label={`Marcar chegada de ${p.nome}`}
                      style={{
                        width: 36, height: 36, borderRadius: 12, flexShrink: 0, border: "none",
                        background: `${ACCENT}1f`, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 200ms cubic-bezier(0.32,0.72,0,1)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Plus size={18} weight="Outline" color={ACCENT} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
