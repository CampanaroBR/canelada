"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretLeft, Trash, Warning } from "@phosphor-icons/react";
import { Select, Button, EmptyState } from "@/ds";
import { toast } from "@/ds/toast";
import { listarVotos, editarVoto, excluirVoto } from "../actions";

type Voto = {
  id: string;
  categoria: string;
  traitLabel: string;
  votanteId: string;
  votanteApelido: string;
  votadoId: string;
  votadoApelido: string;
  autovoto: boolean;
};
type Jogador = { id: string; apelido: string };

export function AdminVotosClient({ rodadaId }: { rodadaId: string }) {
  const [votos, setVotos] = useState<Voto[] | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [reatribuir, setReatribuir] = useState<Record<string, string>>({});

  async function carregar() {
    const res = await listarVotos(rodadaId);
    if ("error" in res) { toast.error(res.error ?? "Erro ao carregar votos."); return; }
    setVotos(res.votos);
    setJogadores(res.jogadores);
  }

  useEffect(() => { carregar(); }, [rodadaId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function reatribuirVoto(votoId: string) {
    const novoVotadoId = reatribuir[votoId];
    if (!novoVotadoId) return;
    setBusy(votoId);
    const res = await editarVoto(votoId, novoVotadoId);
    setBusy(null);
    if ("error" in res) { toast.error(res.error ?? "Erro ao editar voto."); return; }
    toast.success("Voto atualizado");
    carregar();
  }

  async function excluir(votoId: string) {
    setBusy(votoId);
    const res = await excluirVoto(votoId);
    setBusy(null);
    if ("error" in res) { toast.error(res.error ?? "Erro ao excluir voto."); return; }
    toast.success("Voto excluído");
    carregar();
  }

  const autovotos = votos?.filter((v) => v.autovoto) ?? [];
  const outros = votos?.filter((v) => !v.autovoto) ?? [];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 8px", gap: 8 }}>
        <Link href="/votacao" aria-label="Voltar" style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <CaretLeft size={20} weight="bold" />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff" }}>
          Editar votos da rodada
        </span>
      </header>

      <main style={{ flex: 1, padding: "16px 8px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        {votos === null ? (
          <p style={{ textAlign: "center", color: "#8a8a8a", fontFamily: "var(--font-body)", fontSize: 13, padding: 24 }}>Carregando…</p>
        ) : votos.length === 0 ? (
          <EmptyState icon={<Warning size={26} weight="regular" />} title="Sem votos ainda" description="Ninguém votou nessa rodada até agora." />
        ) : (
          <>
            {autovotos.length > 0 && (
              <div>
                <p style={{ margin: "0 0 8px 6px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#e56767", textTransform: "uppercase" }}>
                  ⚠ Autovotação ({autovotos.length})
                </p>
                <div style={{ background: "#141414", border: "1px solid rgba(229,103,103,0.4)", borderRadius: 16, overflow: "hidden" }}>
                  {autovotos.map((v, i) => (
                    <VotoRow key={v.id} voto={v} jogadores={jogadores} isFirst={i === 0}
                      valor={reatribuir[v.id] ?? ""} onEscolher={(id) => setReatribuir((p) => ({ ...p, [v.id]: id }))}
                      onReatribuir={() => reatribuirVoto(v.id)} onExcluir={() => excluir(v.id)} busy={busy === v.id} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <p style={{ margin: "0 0 8px 6px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#8a8a8a", textTransform: "uppercase" }}>
                Todos os votos ({outros.length})
              </p>
              <div style={{ background: "#141414", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
                {outros.map((v, i) => (
                  <VotoRow key={v.id} voto={v} jogadores={jogadores} isFirst={i === 0}
                    valor={reatribuir[v.id] ?? ""} onEscolher={(id) => setReatribuir((p) => ({ ...p, [v.id]: id }))}
                    onReatribuir={() => reatribuirVoto(v.id)} onExcluir={() => excluir(v.id)} busy={busy === v.id} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function VotoRow({ voto, jogadores, isFirst, valor, onEscolher, onReatribuir, onExcluir, busy }: {
  voto: Voto; jogadores: Jogador[]; isFirst: boolean; valor: string;
  onEscolher: (id: string) => void; onReatribuir: () => void; onExcluir: () => void; busy: boolean;
}) {
  const opcoes = jogadores.filter((j) => j.id !== voto.votanteId).map((j) => ({ value: j.id, label: j.apelido }));
  return (
    <div style={{ padding: "12px 14px", borderTop: isFirst ? "none" : "1px solid #1f1f1f", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13, color: "#fff" }}>
          <strong>{voto.votanteApelido}</strong> votou em{" "}
          <strong style={{ color: voto.autovoto ? "#e56767" : "#9fe870" }}>{voto.votadoApelido}</strong>
          {" · "}
          <span style={{ color: "#8a8a8a" }}>{voto.traitLabel}</span>
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <Select options={opcoes} value={valor} onChange={onEscolher} placeholder="Reatribuir pra…" />
        </div>
        <Button size="sm" variant="secondary" onClick={onReatribuir} loading={busy} disabled={!valor}>
          Trocar
        </Button>
        <Button size="sm" variant="danger" onClick={onExcluir} loading={busy}>
          <Trash size={16} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
