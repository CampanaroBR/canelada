"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaretLeft, Link as LinkIcon, Edit2 } from "reicon-react";
import { Content, Avatar, Toggle, Button, Select } from "@/ds";
import { toast } from "@/ds/toast";
import { salvarPresenca, vincularPendente } from "../actions";

type Jogador = { id: string; apelido: string };

interface Props {
  rodadaId: string;
  jogadores: Jogador[];
  presentesIniciais: string[];
  pendentesIniciais: string[];
  isSuperAdmin: boolean;
}

export function PresencaClient({ rodadaId, jogadores, presentesIniciais, pendentesIniciais, isSuperAdmin }: Props) {
  const router = useRouter();
  const [presentes, setPresentes] = useState(() => new Set(presentesIniciais));
  const [pendentes, setPendentes] = useState(pendentesIniciais);
  const [saving, setSaving] = useState(false);
  const [vinculando, setVinculando] = useState<string | null>(null);
  const [escolha, setEscolha] = useState<Record<string, string>>({});

  function toggle(id: string) {
    setPresentes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function vincular(nome: string) {
    const jogadorId = escolha[nome];
    if (!jogadorId) return;
    setVinculando(nome);
    const res = await vincularPendente(rodadaId, nome, jogadorId);
    setVinculando(null);
    if ("error" in res) { toast.error(res.error ?? "Erro ao vincular."); return; }
    setPendentes((prev) => prev.filter((n) => n !== nome));
    setPresentes((prev) => new Set(prev).add(jogadorId));
    toast.success(`${nome} vinculado`);
  }

  async function salvar() {
    setSaving(true);
    const res = await salvarPresenca(rodadaId, Array.from(presentes));
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
          <CaretLeft size={20} weight="Outline" />
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

        <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
          {jogadores.map((j, i) => (
            <div key={j.id} style={{ padding: "12px 14px", borderTop: i === 0 ? "none" : "1px solid #1f1f1f" }}>
              <Content
                leading={<Avatar name={j.apelido} />}
                label={j.apelido}
                trailing={<Toggle checked={presentes.has(j.id)} onChange={() => toggle(j.id)} />}
              />
            </div>
          ))}
        </div>
        <div style={{ height: 96 }} />
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
