"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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

function initial(name: string) {
  return (name || "?").charAt(0).toUpperCase();
}

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
    startSave(async () => {
      const result = await criarRodada(data, ids);
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
        {/* Stripe decoration */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.045) 48px, rgba(255,255,255,0.045) 56px)",
          pointerEvents: "none",
        }} />

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
              Aguardar a votação!
            </p>
          </div>

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
    );
  }

  /* ─── STEP: CONFIRMAÇÃO ─── */
  if (step === "confirmacao") {
    const canConfirm = !isSaving && incluidos.length > 0;
    return (
      <div style={{ minHeight: "100dvh", background: "#08080a" }}>
        {/* Teal header — reutilizado para manter consistência */}
        <div style={{
          background: "#0e4a54",
          borderRadius: "0 0 40px 40px",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 60px)",
          paddingBottom: 28,
          paddingLeft: 16,
          paddingRight: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <button
              onClick={() => setStep("lista")}
              style={{
                appearance: "none",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                color: "#fff",
                fontSize: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ‹
            </button>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24, color: "#fff", margin: 0, letterSpacing: "-.01em" }}>
                Confira a galera
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>
                Vinculação automática
              </p>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div style={{
          background: "#171717",
          border: "1px solid #2e2e2e",
          borderRadius: "48px 48px 0 0",
          marginTop: -20,
          minHeight: "calc(100dvh - 80px)",
          padding: "24px 16px 140px",
        }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <StatCard value={participantes.length} label="na lista" color="#fff" bg="#101013" border="#232327" />
            <StatCard value={encontrados.length} label="vinculados" color="#9fe870" bg="rgba(159,232,112,.08)" border="rgba(159,232,112,.3)" />
            <StatCard value={pendentes.length} label="pendentes" color="#f2c84b" bg="rgba(242,200,75,.08)" border="rgba(242,200,75,.3)" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {encontrados.map((p) => {
              const off = excluidos.has(p.jogadorId!);
              return (
                <div
                  key={p.jogadorId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: off ? "#101013" : "rgba(159,232,112,.05)",
                    border: `1px solid ${off ? "#232327" : "rgba(159,232,112,.2)"}`,
                    borderRadius: 16,
                    padding: "11px 13px",
                    transition: "background .18s, border-color .18s",
                  }}
                >
                  <Avatar name={p.apelido || p.nome} off={off} />
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: off ? "#555" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.apelido || p.nome}
                    </span>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11.5, color: "#6f6f76" }}>
                      {p.apelido && p.apelido !== p.nome ? p.nome : "vinculado"}
                    </span>
                  </div>
                  <Toggle on={!off} onToggle={() => toggle(p.jogadorId!)} />
                </div>
              );
            })}

            {pendentes.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#101013",
                  border: "1px solid #232327",
                  borderRadius: 16,
                  padding: "11px 13px",
                }}
              >
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "50%", background: "#1c1c20", border: "1px solid #2a2a2f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#f2c84b" }}>
                  {initial(p.nome)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.nome}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11.5, color: "#6f6f76" }}>não encontrado</span>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9.5, letterSpacing: ".08em", color: "#f2c84b", border: "1px solid rgba(242,200,75,.4)", borderRadius: 99, padding: "4px 9px", flexShrink: 0, whiteSpace: "nowrap" }}>
                  PENDENTE
                </span>
              </div>
            ))}
          </div>

          {pendentes.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "flex-start", background: "#101013", border: "1px solid #232327", borderRadius: 14, padding: "12px 14px" }}>
              <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0 }}>💡</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: 1.4, color: "#8b8b93" }}>
                Pendentes ficam de fora da votação por enquanto. Quando criarem conta, o app vincula sozinho.
              </span>
            </div>
          )}

          {error && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#ff4a4a", marginTop: 12 }}>{error}</p>
          )}
        </div>

        {/* CTA fixo */}
        <div style={{ position: "fixed", left: 0, right: 0, bottom: "max(80px, calc(env(safe-area-inset-bottom, 0px) + 80px))", padding: "0 16px", zIndex: 10 }}>
          <button
            onClick={handleCriar}
            disabled={!canConfirm}
            style={{
              appearance: "none",
              cursor: canConfirm ? "pointer" : "not-allowed",
              width: "100%",
              padding: 17,
              border: canConfirm ? "none" : "1px solid #34343a",
              borderRadius: 20,
              background: canConfirm ? "#9fe870" : "#26262b",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: ".04em",
              color: canConfirm ? "#0a1a06" : "#7a7a7a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isSaving ? "CRIANDO RODADA..." : `CONFIRMAR PRESENÇA · ${incluidos.length}`}
          </button>
        </div>
      </div>
    );
  }

  /* ─── STEP: LISTA ─── */
  const canImport = !isParsing && lista.trim().length > 0;
  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>
      {/* Teal header */}
      <div style={{
        background: "#0e4a54",
        borderRadius: "0 0 40px 40px",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
        paddingBottom: 32,
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: 28,
          lineHeight: "32px",
          color: "#fff",
          margin: "0 0 4px",
        }}>
          Crie seu Baba
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "18px",
          color: "#fff",
          margin: 0,
        }}>
          Cria a rodada para começar a votação
        </p>
      </div>

      {/* Card body */}
      <div style={{
        background: "#171717",
        border: "1px solid #2e2e2e",
        borderRadius: "48px 48px 16px 16px",
        margin: "0 8px calc(96px + env(safe-area-inset-bottom, 0px))",
        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "20px 8px 20px",
        boxSizing: "border-box",
      }}>
        {/* Section header — LISTA */}
        <div style={{ display: "flex", height: 42, alignItems: "center", paddingLeft: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              background: "#171717",
              border: "1px solid #2e2e2e",
              borderRadius: 12,
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <img src="/baba-list-checks.svg" alt="" style={{ width: 24, height: 24 }} />
            </div>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              lineHeight: "20px",
              color: "#fff",
              letterSpacing: ".04em",
            }}>
              LISTA
            </h2>
          </div>
        </div>

        {/* Time pill */}
        <div style={{
          background: "#090909",
          borderRadius: 12,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
          marginRight: 8,
        }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <img src="/baba-clock.svg" alt="" style={{ width: 16, height: 16 }} />
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 8px" }}>
          {/* Data do baba */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 16,
              lineHeight: "20px",
              color: "#f5f5f5",
            }}>
              Data do baba
            </span>
            <MiniCalendar value={data} onChange={setData} />
          </div>

          {/* Lista do WhatsApp */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 16,
                lineHeight: "20px",
                color: "#f5f5f5",
              }}>
                Lista do WhatsApp
              </span>
              <span style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 12,
                lineHeight: 1.4,
                color: "#6f6f76",
              }}>
                Cole a lista de presença do grupo. Pode incluir os números (1. 2. 3.).
              </span>
            </div>
            <textarea
              value={lista}
              onChange={(e) => setLista(e.target.value)}
              spellCheck={false}
              placeholder={"Cole aqui as pessoas do baba"}
              style={{
                width: "100%",
                height: 196,
                minHeight: 120,
                resize: "vertical",
                background: "#111",
                border: "1px solid #2a2a2d",
                borderRadius: 14,
                padding: "13px 16px",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "18px",
                color: "#e7e7ea",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#ff4a4a", margin: "0 16px" }}>{error}</p>
        )}

        {/* Criar rodada button */}
        <div style={{ padding: "0 8px" }}>
          <button
            onClick={handleImportar}
            disabled={!canImport}
            style={{
              appearance: "none",
              cursor: canImport ? "pointer" : "not-allowed",
              width: "100%",
              padding: 16,
              border: canImport ? "none" : "1px solid #34343a",
              borderRadius: 16,
              background: canImport ? "#9fe870" : "#26262b",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: "20px",
              color: canImport ? "#090909" : "#7a7a7a",
              textAlign: "center",
              transition: "background .2s ease",
            }}
          >
            {isParsing ? "Analisando..." : "Criar Rodada"}
          </button>
        </div>
      </div>
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
            appearance: "none", border: "1px solid #2a2a2d", background: "#111",
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
                  border: `1px solid ${selected ? "#9fe870" : isToday ? "rgba(159,232,112,.4)" : "#2a2a2d"}`,
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
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "20px",
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
            appearance: "none", border: "1px solid #2a2a2d", background: "#111",
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

function StatCard({ value, label, color, bg, border }: { value: number; label: string; color: string; bg: string; border: string }) {
  return (
    <div style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color }}>{value}</div>
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color, letterSpacing: ".04em" }}>{label}</div>
    </div>
  );
}

function Avatar({ name, off }: { name: string; off: boolean }) {
  return (
    <div style={{
      width: 42, height: 42, flexShrink: 0, borderRadius: "50%",
      background: off ? "#1c1c20" : "rgba(159,232,112,.15)",
      border: `1px solid ${off ? "#2a2a2f" : "rgba(159,232,112,.3)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
      color: off ? "#555" : "#9fe870",
      transition: "background .18s, border-color .18s, color .18s",
    }}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        appearance: "none",
        cursor: "pointer",
        width: 48,
        height: 28,
        borderRadius: 99,
        background: on ? "#9fe870" : "#2a2a2f",
        border: "none",
        position: "relative",
        transition: "background .18s ease",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute",
        top: 3,
        left: on ? 23 : 3,
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#fff",
        transition: "left .18s ease",
      }} />
    </button>
  );
}
