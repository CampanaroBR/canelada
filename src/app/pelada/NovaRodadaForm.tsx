"use client";

import { useState, useTransition } from "react";
import { parseLista, criarRodada, type ParticipanteImportado } from "./actions";

type Step = "lista" | "confirmacao";

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function initial(name: string) {
  return (name || "?").charAt(0).toUpperCase();
}

export function NovaRodadaForm() {
  const [step, setStep] = useState<Step>("lista");
  const [lista, setLista] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [participantes, setParticipantes] = useState<ParticipanteImportado[]>([]);
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set());
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
      if (result?.error) setError(result.error);
    });
  }

  function toggle(id: string) {
    setExcluidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ─── STEP 1: Colar lista ─── */
  if (step === "lista") {
    const canImport = !isParsing && lista.trim().length > 0;
    return (
      <div style={{ padding: "6px 20px 120px" }}>
        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 38, color: "#fff", letterSpacing: "-.02em", lineHeight: .95 }}>
            PELADA
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "#7a7a7e" }}>
            Crie uma rodada pra abrir a votação.
          </span>
        </div>

        <div style={{ height: 1, background: "#1a1a1d", margin: "16px 0" }} />

        {/* Data */}
        <span style={labelStyle}>DATA DA RODADA</span>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#131316", border: "1px solid #26262b", borderRadius: 16, padding: "15px 18px" }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>
            {formatDate(data)}
          </span>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
            aria-hidden
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a7a7e" strokeWidth="2" strokeLinecap="round" style={{ cursor: "pointer", flexShrink: 0 }}>
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M3 9h18M8 2v4M16 2v4" />
          </svg>
        </div>

        {/* Lista */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={labelStyle}>LISTA DO WHATSAPP</span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12.5, lineHeight: 1.4, color: "#6f6f76" }}>
            Cole a lista de presença do grupo. Pode incluir os números (1. 2. 3.).
          </span>
        </div>
        <textarea
          value={lista}
          onChange={(e) => setLista(e.target.value)}
          spellCheck={false}
          placeholder={"1. Arthur\n2. João\n3. Brunão\n4. Galego"}
          style={{
            marginTop: 10,
            width: "100%",
            height: 230,
            resize: "none",
            background: "#131316",
            border: "1px solid #26262b",
            borderRadius: 18,
            padding: 16,
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 16,
            lineHeight: 1.55,
            color: "#e7e7ea",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#ff4a4a", marginTop: 8 }}>{error}</p>
        )}

        <button
          onClick={handleImportar}
          disabled={!canImport}
          style={{
            appearance: "none",
            cursor: canImport ? "pointer" : "not-allowed",
            marginTop: 14,
            width: "100%",
            padding: 17,
            border: "none",
            borderRadius: 18,
            background: canImport ? "#9fe870" : "#1a1a1e",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: ".06em",
            color: canImport ? "#0a1a06" : "#4a4a52",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            transition: "background .2s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="3" width="8" height="4" rx="1" />
            <path d="M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3" />
          </svg>
          {isParsing ? "ANALISANDO..." : "IMPORTAR LISTA"}
        </button>
      </div>
    );
  }

  /* ─── STEP 2: Confirmar presenças ─── */
  const canConfirm = !isSaving && incluidos.length > 0;
  return (
    <div>
      <div style={{ padding: "6px 20px 140px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button
            onClick={() => setStep("lista")}
            style={{
              appearance: "none",
              cursor: "pointer",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#161619",
              border: "1px solid #2a2a2f",
              color: "#fff",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ‹
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11, letterSpacing: ".16em", color: "#9fe870" }}>
              VINCULAÇÃO AUTOMÁTICA
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24, color: "#fff", letterSpacing: "-.01em", lineHeight: 1 }}>
              Confira a galera
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <StatCard value={participantes.length} label="na lista" color="#fff" bg="#101013" border="#232327" />
          <StatCard value={encontrados.length} label="vinculados" color="#9fe870" bg="rgba(159,232,112,.08)" border="rgba(159,232,112,.3)" />
          <StatCard value={pendentes.length} label="pendentes" color="#f2c84b" bg="rgba(242,200,75,.08)" border="rgba(242,200,75,.3)" />
        </div>

        {/* Encontrados */}
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

          {/* Pendentes */}
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
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11.5, color: "#6f6f76" }}>
                  não encontrado
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9.5, letterSpacing: ".08em", color: "#f2c84b", border: "1px solid rgba(242,200,75,.4)", borderRadius: 99, padding: "4px 9px", flexShrink: 0, whiteSpace: "nowrap" }}>
                PENDENTE
              </span>
            </div>
          ))}
        </div>

        {/* Dica */}
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
            border: "none",
            borderRadius: 20,
            background: canConfirm ? "#9fe870" : "#1a1a1e",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: ".04em",
            color: canConfirm ? "#0a1a06" : "#4a4a52",
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

/* ─── Sub-componentes ─── */

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: ".18em",
  color: "#6f6f76",
};
