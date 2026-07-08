"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, SoccerBall, Clock, CaretLeft } from "@phosphor-icons/react";
import { MenuSheet } from "@/components/MenuSheet";
import { HamburgerIcon } from "@/components/HamburgerIcon";
import { Button, Card, Content, Avatar, Toggle, Tag, Stat } from "@/ds";
import { parseLista, criarRodada, type ParticipanteImportado } from "./actions";

type Step = "lista" | "confirmacao" | "sucesso";

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAYS_ABBR = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS_ABBR = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function NovaRodadaForm() {
  const [step, setStep] = useState<Step>("lista");
  const [lista, setLista] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [participantes, setParticipantes] = useState<ParticipanteImportado[]>([]);
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set());
  const [totalCriados, setTotalCriados] = useState(0);
  const [isParsing, startParse] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const encontrados = participantes.filter((p) => p.status === "encontrado");
  const pendentes = participantes.filter((p) => p.status === "nao_encontrado");
  const incluidos = encontrados.filter((p) => !excluidos.has(p.jogadorId!));

  function handleImportar() {
    if (!lista.trim()) return;
    setError("");
    startParse(async () => {
      const result = await parseLista(lista);
      setParticipantes(result);
      setExcluidos(new Set());
      setStep("confirmacao");
    });
  }

  function handleCriar() {
    const ids = incluidos.map((p) => p.jogadorId!);
    const nomesPendentes = pendentes.map((p) => p.nome);
    startSave(async () => {
      const result = await criarRodada(data, ids, nomesPendentes);
      if (result?.error) {
        setError(result.error);
      } else if (result?.rodadaId) {
        setTotalCriados(result.totalJogadores ?? ids.length);
        setStep("sucesso");
      }
    });
  }

  function toggle(id: string) {
    setExcluidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ─── STEP: SUCESSO ─── */
  if (step === "sucesso") {
    return (
      <div style={{
        minHeight: "100dvh",
        background: "#090909",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decoração: 3 barras verticais centralizadas atrás do check */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 10, height: "46%", zIndex: 0, pointerEvents: "none",
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 10, height: "100%",
              background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 60%, rgba(255,255,255,0) 100%)",
            }} />
          ))}
        </div>

        {/* Check circle */}
        <div style={{
          width: 124,
          height: 124,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}>
          <img
            src="/baba-check-circle.svg"
            alt=""
            style={{ width: 104, height: 104 }}
          />
        </div>

        <div style={{ height: 56, flexShrink: 0 }} />

        {/* Content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 58,
          width: 313,
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 48,
              lineHeight: "64px",
              letterSpacing: "-2px",
              color: "#fff",
              textAlign: "center",
              margin: 0,
              width: 300,
            }}>
              Rodada criada!
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 18,
              lineHeight: "24px",
              letterSpacing: "-1px",
              color: "#fff",
              textAlign: "center",
              margin: 0,
              width: "100%",
            }}>
              {totalCriados} jogadores relacionados para o baba.
              Aguardar a votação às 22:30!
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {/* WhatsApp: abre com a lista formatada pronta pra postar no grupo */}
            <button
              onClick={() => {
                const nomes = incluidos.map((p, i) => `${i + 1}. ${p.apelido ?? p.nome}`).join("\n");
                const texto = `⚽ *BABA CONFIRMADO* — ${formatDate(data)} · 20h\n\n${nomes}\n\n${incluidos.length} confirmados. Bora! 🔥\n\n🗳️ Votação abre às 22:30 no Canelada:\n${typeof window !== "undefined" ? window.location.origin : ""}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
              }}
              style={{
                background: "#25D366", border: "none", borderRadius: 16, padding: "16px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", boxSizing: "border-box", cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
                Enviar lista pro grupo
              </span>
            </button>

            {/* Sem sincronização automática pra alguém = fica "pendente" na rodada
                (nome importado sem conta vinculada) — manda direto pra tela de
                presença, onde dá pra vincular cada pendente a um jogador
                cadastrado, em vez de deixar sem nenhum caminho até lá. */}
            {pendentes.length > 0 && (
              <Link href="/votacao/presenca" style={{ textDecoration: "none", width: "100%" }}>
                <div style={{
                  background: "transparent",
                  border: "1px solid #9fe870",
                  borderRadius: 16,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  boxSizing: "border-box",
                }}>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: "20px",
                    color: "#9fe870",
                    textAlign: "center",
                  }}>
                    Vincular {pendentes.length} pendente{pendentes.length > 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            )}

            <Link href="/feed" style={{ textDecoration: "none", width: "100%" }}>
              <div style={{
                background: "#9fe870",
                borderRadius: 16,
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                boxSizing: "border-box",
              }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: "20px",
                  color: "#090909",
                  textAlign: "center",
                }}>
                  Ir para a Home
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── STEP: CONFIRMAÇÃO ─── */
  if (step === "confirmacao") {
    // Não exige ninguém vinculado: a rodada não trava a ids confirmados em lugar
    // nenhum (é só pra notificação) — quem ainda não tem conta vota assim que criar.
    const canConfirm = !isSaving;
    return (
      <div style={{ minHeight: "100dvh", background: "#090909", paddingBottom: "calc(140px + env(safe-area-inset-bottom, 0px))" }}>
        {/* Header — mesmo padrão do resto do app (dark, arredondado embaixo) */}
        <div style={{
          background: "#0a0e0e", border: "1px solid #2c2c2c",
          borderRadius: "0 0 40px 40px",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
          paddingBottom: 20, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setStep("lista")}
              aria-label="Voltar"
              style={{ width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#fff", WebkitTapHighlightColor: "transparent" }}
            >
              <CaretLeft size={22} weight="bold" />
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#fff", textTransform: "uppercase" }}>Confira a galera</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#999" }}>Vinculação automática</span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <main style={{ padding: "16px 8px 0", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 8 }}>
            <Card tone="surface" padding={12} style={{ flex: 1 }}>
              <Stat value={participantes.length} label="NA LISTA" />
            </Card>
            <Card tone="surface" padding={12} bordered={false} style={{ flex: 1, border: "1px solid rgba(159,232,112,0.3)", background: "rgba(159,232,112,0.08)" }}>
              <Stat value={encontrados.length} label="VINCULADOS" color="#9fe870" />
            </Card>
            <Card tone="surface" padding={12} bordered={false} style={{ flex: 1, border: "1px solid rgba(197,151,58,0.35)", background: "rgba(197,151,58,0.08)" }}>
              <Stat value={pendentes.length} label="PENDENTES" color="#c5973a" />
            </Card>
          </div>

          {/* Lista */}
          <Card tone="surface" padding={0} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {encontrados.map((p, i) => {
                const off = excluidos.has(p.jogadorId!);
                return (
                  <div key={p.jogadorId} style={{ padding: "12px 14px", borderTop: i === 0 ? "none" : "1px solid #1c1c1c", opacity: off ? 0.5 : 1, transition: "opacity 150ms" }}>
                    <Content
                      leading={<Avatar name={p.apelido || p.nome} />}
                      label={p.apelido || p.nome}
                      description={p.apelido && p.apelido !== p.nome ? p.nome : "vinculado"}
                      trailing={<Toggle checked={!off} onChange={() => toggle(p.jogadorId!)} />}
                    />
                  </div>
                );
              })}

              {pendentes.map((p, i) => (
                <div key={i} style={{ padding: "12px 14px", borderTop: encontrados.length + i === 0 ? "none" : "1px solid #1c1c1c" }}>
                  <Content
                    leading={<Avatar name={p.nome} />}
                    label={p.nome}
                    description="não encontrado"
                    trailing={<Tag tone="gold">PENDENTE</Tag>}
                  />
                </div>
              ))}
            </div>
          </Card>

          {pendentes.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 14, padding: "12px 14px" }}>
              <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0 }}>💡</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: 1.4, color: "#8b8b93" }}>
                Pendentes ficam de fora da votação por enquanto. Quando criarem conta, o app vincula sozinho.
              </span>
            </div>
          )}

          {error && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e56767", margin: 0 }}>{error}</p>
          )}
        </main>

        {/* CTA fixo — zIndex acima da BottomNav (30) pra não ficar atrás dela */}
        <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", width: "min(100%, 430px)", bottom: "calc(84px + env(safe-area-inset-bottom, 0px))", padding: "0 16px", zIndex: 35, boxSizing: "border-box" }}>
          <Button fullWidth size="lg" onClick={handleCriar} disabled={!canConfirm}>
            {isSaving ? "Criando rodada…" : incluidos.length > 0 ? `Confirmar presença · ${incluidos.length}` : "Criar rodada"}
          </Button>
        </div>
      </div>
    );
  }

  /* ─── STEP: LISTA ─── */
  const canImport = !isParsing && lista.trim().length > 0;
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#090909",
      position: "relative",
      paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
    }}>
      {/* ── TOPBAR (fixed, glass) ── */}
      <div className="glass-bar" style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button aria-label="Abrir menu" onClick={() => setMenuOpen(true)} style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
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

      {/* Header panel (arredondado embaixo, encostado no topo) */}
      <div style={{
        background: "#0a0e0e", border: "1px solid #2c2c2c",
        borderRadius: "0 0 40px 40px",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)",
        paddingBottom: 20, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SoccerBall size={24} color="#9fe870" weight="fill" />
            <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#fff" }}>
              CRIE SUA RODADA
            </h1>
          </div>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, lineHeight: "18px", color: "#fff" }}>
            Cria a rodada para começar a votação
          </p>
        </div>
      </div>

      {/* Card body (form) */}
      <div style={{
        background: "#171717",
        border: "1px solid #2c2c2c",
        borderRadius: "48px 48px 16px 16px",
        margin: "0 8px 0",
        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "32px 8px 16px",
        boxSizing: "border-box",
      }}>
        {/* Time pill */}
        <div style={{
          background: "#090909",
          borderRadius: 12,
          height: 36,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Clock size={18} color="#9fe870" weight="bold" />
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 16,
              lineHeight: "16px",
              letterSpacing: "-0.64px",
              color: "#fff",
              whiteSpace: "nowrap",
            }}>
              Votação inicia às 22:30
            </span>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Data do baba */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 14,
              lineHeight: "20px",
              color: "#f5f5f5",
            }}>
              Selecione a data do baba
            </span>
            <MiniCalendar value={data} onChange={setData} />
          </div>

          {/* Lista do WhatsApp */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 14,
              lineHeight: "20px",
              color: "#f5f5f5",
            }}>
              Lista do WhatsApp
            </span>
            <div style={{ position: "relative", width: "100%" }}>
              <textarea
                value={lista}
                onChange={(e) => setLista(e.target.value)}
                spellCheck={false}
                placeholder={"Cole aqui as pessoas do baba"}
                style={{
                  width: "100%",
                  height: 120,
                  minHeight: 120,
                  resize: "vertical",
                  background: "#0a0e0e",
                  border: lista.trim() ? "1px solid #9fe870" : "1px solid #2c2c2c",
                  borderRadius: 16,
                  padding: "12px 16px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "18px",
                  color: "#e7e7ea",
                  outline: "none",
                  boxSizing: "border-box",
                  display: "block",
                }}
              />
              {/* Resize grip (tracinhos) — visível no iOS, onde o nativo não aparece */}
              <svg
                aria-hidden
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ position: "absolute", right: 7, bottom: 9, pointerEvents: "none" }}
              >
                <path d="M11 3 L3 11 M11 7 L7 11" stroke="#6f6f76" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 12,
              lineHeight: "16px",
              color: "#6f6f76",
            }}>
              Cole a lista de presença do grupo. Pode incluir os números (1. 2. 3.).
            </span>
          </div>
        </div>

        {error && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#ff4a4a", margin: "0 16px" }}>{error}</p>
        )}

        {/* Criar rodada button */}
        <Button fullWidth size="lg" onClick={handleImportar} disabled={!canImport}>
          {isParsing ? "Analisando..." : "Criar Rodada"}
        </Button>
      </div>

      {/* Menu hambúrguer (bottom sheet) */}
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

/* ─── Sub-componentes ─── */

function MiniCalendar({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const VISIBLE = 5;

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayISO = toISO(today);

  // Primeiro dia visível na tira
  const [start, setStart] = useState<Date>(() => {
    const sel = new Date(value + "T12:00:00");
    const base = isNaN(sel.getTime()) ? today : sel;
    // garante que o dia selecionado fique visível, sem mostrar passado
    return base < today ? today : base;
  });

  const days = Array.from({ length: VISIBLE }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const firstVisibleISO = toISO(days[0]);
  const canGoBack = firstVisibleISO > todayISO;

  function shift(n: number) {
    setStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + n);
      // não deixa retroceder antes de hoje
      return d < today ? today : d;
    });
  }

  const mesLabel = `${MONTHS_ABBR[days[0].getMonth()]}${
    days[0].getMonth() !== days[VISIBLE - 1].getMonth() ? ` – ${MONTHS_ABBR[days[VISIBLE - 1].getMonth()]}` : ""
  } ${days[VISIBLE - 1].getFullYear()}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Mês/ano */}
      <span style={{
        fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12,
        color: "#6f6f76", textTransform: "capitalize", paddingLeft: 2,
      }}>
        {mesLabel}
      </span>

      {/* Tira de dias */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 6 }}>
        {/* Prev */}
        <button
          type="button"
          onClick={() => shift(-VISIBLE)}
          disabled={!canGoBack}
          aria-label="Dias anteriores"
          style={{
            appearance: "none", border: "1px solid #2c2c2c", background: "#0a0e0e",
            borderRadius: 12, width: 36, flexShrink: 0, cursor: canGoBack ? "pointer" : "not-allowed",
            color: canGoBack ? "#fff" : "#3a3a3f", fontSize: 18, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ‹
        </button>

        {/* Dias */}
        <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
          {days.map((d) => {
            const iso = toISO(d);
            const selected = iso === value;
            const isToday = iso === todayISO;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onChange(iso)}
                style={{
                  appearance: "none", cursor: "pointer",
                  flex: 1, minWidth: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  padding: "10px 0",
                  borderRadius: 12,
                  background: selected ? "#9fe870" : "#111",
                  border: `1px solid ${selected ? "#9fe870" : isToday ? "rgba(159,232,112,.4)" : "#2c2c2c"}`,
                  transition: "background .15s, border-color .15s",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
                  color: selected ? "#0a1a06" : "#6f6f76", textTransform: "uppercase",
                }}>
                  {WEEKDAYS_ABBR[d.getDay()]}
                </span>
                <span style={{
                  fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 18, lineHeight: "20px",
                  color: selected ? "#090909" : "#fff",
                }}>
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => shift(VISIBLE)}
          aria-label="Próximos dias"
          style={{
            appearance: "none", border: "1px solid #2c2c2c", background: "#0a0e0e",
            borderRadius: 12, width: 36, flexShrink: 0, cursor: "pointer",
            color: "#fff", fontSize: 18, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ›
        </button>
      </div>

      {/* Data escolhida por extenso */}
      {value && (
        <span style={{
          fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12,
          color: "#9fe870", textTransform: "capitalize", paddingLeft: 2,
        }}>
          {formatDate(value)}
        </span>
      )}
    </div>
  );
}

