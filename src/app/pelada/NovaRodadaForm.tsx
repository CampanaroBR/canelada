"use client";

import { useState, useTransition } from "react";
import { parseLista, criarRodada, type ParticipanteImportado } from "./actions";
import { CheckCircle, UserCircleMinus, ClipboardText, ArrowRight } from "@phosphor-icons/react";

type Step = "lista" | "confirmacao";

export function NovaRodadaForm() {
  const [step, setStep] = useState<Step>("lista");
  const [lista, setLista] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [participantes, setParticipantes] = useState<ParticipanteImportado[]>([]);
  const [isParsing, startParse] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState("");

  function handleImportar() {
    if (!lista.trim()) return;
    setError("");
    startParse(async () => {
      const result = await parseLista(lista);
      setParticipantes(result);
      setStep("confirmacao");
    });
  }

  function handleCriar() {
    const ids = participantes
      .filter((p) => p.status === "encontrado")
      .map((p) => p.jogadorId!);
    startSave(async () => {
      const result = await criarRodada(data, ids);
      if (result?.error) setError(result.error);
    });
  }

  const encontrados = participantes.filter((p) => p.status === "encontrado");
  const naoEncontrados = participantes.filter((p) => p.status === "nao_encontrado");

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

      {step === "lista" && (
        <>
          {/* Data */}
          <div>
            <label style={labelStyle}>Data da rodada</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Lista */}
          <div>
            <label style={labelStyle}>Lista do WhatsApp</label>
            <p style={hintStyle}>Cole a lista de presença do grupo. Pode incluir os números (1. 2. 3.).</p>
            <textarea
              value={lista}
              onChange={(e) => setLista(e.target.value)}
              placeholder={"1. Arthur\n2. João\n3. Brunão\n4. Galego"}
              rows={10}
              style={{
                ...inputStyle,
                height: "auto",
                resize: "none",
                padding: "14px 16px",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            />
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          <button
            onClick={handleImportar}
            disabled={isParsing || !lista.trim()}
            style={btnStyle(isParsing || !lista.trim())}
          >
            <ClipboardText size={20} weight="bold" />
            {isParsing ? "ANALISANDO..." : "IMPORTAR LISTA"}
          </button>
        </>
      )}

      {step === "confirmacao" && (
        <>
          <button
            onClick={() => setStep("lista")}
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer", textAlign: "left", padding: 0 }}
          >
            ← Editar lista
          </button>

          {/* Encontrados */}
          <div>
            <p style={labelStyle}>
              Encontrados ({encontrados.length})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {encontrados.map((p) => (
                <div key={p.jogadorId} style={participanteRow}>
                  <CheckCircle size={18} weight="fill" color="var(--color-accent)" />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-primary)" }}>
                    {p.nome}
                  </span>
                  {p.apelido !== p.nome && (
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-text-muted)", marginLeft: "auto" }}>
                      {p.apelido}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Não encontrados */}
          {naoEncontrados.length > 0 && (
            <div>
              <p style={{ ...labelStyle, color: "var(--color-text-muted)" }}>
                Não identificados ({naoEncontrados.length})
              </p>
              <p style={hintStyle}>Esses nomes não estão cadastrados no app ainda.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {naoEncontrados.map((p, i) => (
                  <div key={i} style={participanteRow}>
                    <UserCircleMinus size={18} color="#666" />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)" }}>
                      {p.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p style={errorStyle}>{error}</p>}

          <button
            onClick={handleCriar}
            disabled={isSaving || encontrados.length === 0}
            style={btnStyle(isSaving || encontrados.length === 0)}
          >
            <ArrowRight size={20} weight="bold" />
            {isSaving ? "CRIANDO..." : `ABRIR VOTAÇÃO (${encontrados.length} jogadores)`}
          </button>
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-body)",
  textTransform: "uppercase",
  marginBottom: 8,
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-body)",
  marginBottom: 10,
  marginTop: -4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0 16px",
  height: 52,
  borderRadius: 12,
  background: "var(--color-surface-2)",
  border: "1px solid #2a2a2a",
  color: "var(--color-text-primary)",
  fontSize: 16,
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
};

const participanteRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  borderRadius: 10,
  background: "var(--color-surface-1)",
  border: "1px solid #1e1e1e",
};

const errorStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--color-danger)",
  fontFamily: "var(--font-body)",
};

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: disabled ? "var(--color-surface-2)" : "var(--color-accent)",
    border: "none",
    borderRadius: 14,
    color: disabled ? "var(--color-text-muted)" : "#000",
    fontSize: 15,
    fontWeight: 900,
    fontFamily: "var(--font-display)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
