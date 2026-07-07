"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { saveOnboarding } from "./actions";
import { enablePush } from "@/lib/pushClient";
import { Button, Input } from "@/ds";

const MAX_APELIDO = 20;
const MAX_NOME = 30;

export function OnboardingForm() {
  const [apelido, setApelido]         = useState("");
  const [nomeNoBaba, setNomeNoBaba]   = useState("");
  const [error, setError]             = useState("");
  const [isPending, startTransition]  = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apelido.trim() || !nomeNoBaba.trim()) return;
    setError("");
    // Ativa notificações por padrão no cadastro — precisa partir do gesto do usuário
    // (regra do iOS/Chrome), por isso dispara aqui e não num useEffect.
    void enablePush();
    startTransition(async () => {
      const result = await saveOnboarding(apelido, nomeNoBaba);
      if (result?.error) setError(result.error);
    });
  }

  const disabled = isPending || !apelido.trim() || !nomeNoBaba.trim();

  return (
    <div style={{
      position: "relative",
      width: "100%", minHeight: "100dvh",
      background: "#090909", overflow: "hidden",
    }}>
      {/* Glow radial verde, fixo — mesmo idioma visual do /login */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(560px 420px at 50% -8%, rgba(159,232,112,0.16), transparent 70%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 393, margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100dvh",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 64px)",
        paddingBottom: 24, paddingLeft: 20, paddingRight: 20,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
      }}>

        {/* Logo + eyebrow + headline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}>
            <Image alt="Canelada" src="/logo.png" width={72} height={72} priority style={{ objectFit: "cover" }} />
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 9999,
            background: "rgba(159,232,112,0.08)", border: "1px solid rgba(159,232,112,0.3)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#9fe870" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9fe870" }}>
              Primeiro acesso
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            <p style={{
              margin: 0, fontFamily: "var(--font-display)", fontWeight: 900,
              fontSize: 34, lineHeight: "38px", letterSpacing: "-0.5px", color: "#fff",
              textAlign: "center",
            }}>
              Entra no baba
            </p>
            <p style={{
              margin: 0, fontFamily: "var(--font-body)", fontWeight: 500,
              fontSize: 15, lineHeight: "20px", color: "#8a8a8a",
              textAlign: "center",
            }}>
              Como o grupo vai te conhecer
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          <Input
            label="Apelido"
            required
            placeholder="Ex: Arthurzinho"
            value={apelido}
            onChange={(e) => setApelido(e.target.value.slice(0, MAX_APELIDO))}
            autoFocus
            autoComplete="off"
            autoCapitalize="words"
            hint={`${apelido.length}/${MAX_APELIDO}`}
          />

          <Input
            label="Nome na lista do WhatsApp"
            required
            placeholder="Ex: Arthur, Brunão, Galego"
            value={nomeNoBaba}
            onChange={(e) => setNomeNoBaba(e.target.value.slice(0, MAX_NOME))}
            autoComplete="off"
            autoCapitalize="words"
            hint={`Como você aparece quando confirma presença no grupo · ${nomeNoBaba.length}/${MAX_NOME}`}
          />

          {error && (
            <p role="alert" style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#e56767" }}>
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" disabled={disabled}>
            {isPending ? "Entrando…" : "Entrar no grupo ⚽"}
          </Button>
        </form>
      </div>
    </div>
  );
}
