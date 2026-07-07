"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react";
import { Content, Avatar, Toggle, Button } from "@/ds";
import { toast } from "@/ds/toast";
import { salvarPresenca } from "../actions";

type Jogador = { id: string; apelido: string };

interface Props {
  rodadaId: string;
  jogadores: Jogador[];
  presentesIniciais: string[];
}

export function PresencaClient({ rodadaId, jogadores, presentesIniciais }: Props) {
  const router = useRouter();
  const [presentes, setPresentes] = useState(() => new Set(presentesIniciais));
  const [saving, startTransition] = useTransition();

  function toggle(id: string) {
    setPresentes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function salvar() {
    startTransition(async () => {
      const res = await salvarPresenca(rodadaId, Array.from(presentes));
      if ("error" in res) { toast.error(res.error ?? "Erro ao salvar."); return; }
      toast.success("Lista de presença atualizada");
      router.push("/votacao");
      router.refresh();
    });
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 8px", gap: 8 }}>
        <Link href="/votacao" aria-label="Voltar" style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <CaretLeft size={20} weight="bold" />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff" }}>
          Quem jogou hoje?
        </span>
      </header>

      <p style={{
        margin: 0, padding: "8px 20px 0",
        fontFamily: "var(--font-body)", fontSize: 13, color: "#8a8a8a",
      }}>
        Desmarque quem se cadastrou no app mas não estava no baba. Se ninguém for marcado, todo o grupo fica disponível pra votação.
      </p>

      <main style={{ flex: 1, padding: "16px 8px 96px" }}>
        <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
          {jogadores.map((j, i) => (
            <div key={j.id} style={{ borderTop: i === 0 ? "none" : "1px solid #1f1f1f" }}>
              <Content
                leading={<Avatar name={j.apelido} />}
                label={j.apelido}
                trailing={<Toggle checked={presentes.has(j.id)} onChange={() => toggle(j.id)} />}
              />
            </div>
          ))}
        </div>
      </main>

      <div style={{
        position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0,
        width: "min(100%, 430px)", padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
        background: "linear-gradient(180deg, rgba(9,9,9,0) 0%, #090909 40%)",
      }}>
        <Button onClick={salvar} loading={saving} fullWidth>
          Salvar ({presentes.size} de {jogadores.length})
        </Button>
      </div>
    </div>
  );
}
